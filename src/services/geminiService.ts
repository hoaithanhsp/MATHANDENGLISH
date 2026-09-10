/**
 * Gemini Service — Client-side Gemini API with model fallback
 * Theo quy chuẩn api.md:
 * - Fallback chain: gemini-3.6-flash → gemini-3.5-flash → gemini-3.5-flash-lite → ...
 * - Phân biệt MODEL_OVERLOADED vs INVALID_API_KEY vs QUOTA_EXCEEDED
 * - Không dùng temperature/topP/topK cho model 3.x
 * - Mọi call site đi qua fallback chung
 */

import { GoogleGenAI } from '@google/genai';
import { apiKeyManager, AiProvider } from './apiKeyManager';
import { Question, ProofFeedback } from '../types';

// ============================================================
// ERROR CLASSIFICATION
// ============================================================
export type ApiErrorType =
  | 'MODEL_OVERLOADED'
  | 'QUOTA_EXCEEDED'
  | 'INVALID_API_KEY'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'INVALID_ARGUMENT'
  | 'UNKNOWN';

export const parseApiError = (error: any): ApiErrorType => {
  const message = error?.message || error?.toString() || '';
  const serialized = JSON.stringify(error) || '';

  // Quota / Rate Limit — stop immediately, key still valid
  if (
    serialized.includes('429') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.toLowerCase().includes('quota')
  ) return 'QUOTA_EXCEEDED';

  // Model overload — can try next model
  if (
    serialized.includes('503') ||
    serialized.includes('504') ||
    message.includes('UNAVAILABLE') ||
    message.toLowerCase().includes('high demand') ||
    message.toLowerCase().includes('overloaded') ||
    message.toLowerCase().includes('try again later') ||
    message.toLowerCase().includes('temporarily unavailable')
  ) return 'MODEL_OVERLOADED';

  // Not Found — model may not exist, try next
  if (
    serialized.includes('404') ||
    message.includes('NOT_FOUND')
  ) return 'NOT_FOUND';

  // Auth errors — stop immediately
  if (
    message.includes('API_KEY_INVALID') ||
    serialized.includes('401')
  ) return 'INVALID_API_KEY';

  if (
    message.includes('PERMISSION_DENIED') ||
    serialized.includes('403')
  ) return 'PERMISSION_DENIED';

  // Invalid argument — stop immediately
  if (
    serialized.includes('400') ||
    message.includes('INVALID_ARGUMENT')
  ) return 'INVALID_ARGUMENT';

  return 'UNKNOWN';
};

// ============================================================
// FRIENDLY ERROR MESSAGES (Vietnamese)
// ============================================================
export const getFriendlyErrorMessage = (errorType: ApiErrorType): string => {
  switch (errorType) {
    case 'INVALID_API_KEY':
      return 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trong Cài đặt.';
    case 'PERMISSION_DENIED':
      return 'API key không có quyền truy cập. Vui lòng kiểm tra quyền API key.';
    case 'QUOTA_EXCEEDED':
      return 'Đã hết quota hoặc vượt giới hạn tốc độ API. Vui lòng đợi rồi thử lại.';
    case 'MODEL_OVERLOADED':
      return 'Model đang quá tải; app đang tự động thử model dự phòng.';
    case 'NOT_FOUND':
      return 'Model không khả dụng. Đang thử model dự phòng khác.';
    case 'INVALID_ARGUMENT':
      return 'Yêu cầu không hợp lệ. Vui lòng thử lại.';
    default:
      return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.';
  }
};

// ============================================================
// CLIENT FACTORY (api.md Section III)
// ============================================================
export const createGoogleAiClient = (
  apiKey: string,
  provider: AiProvider,
): GoogleGenAI => {
  if (provider === 'agent-platform') {
    return new GoogleGenAI({ vertexai: true, apiKey } as any);
  }
  return new GoogleGenAI({ apiKey });
};

// ============================================================
// FALLBACK GENERATE CONTENT
// ============================================================
interface GenerateContentOptions {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  maxOutputTokens?: number;
  thinkingLevel?: string;
  selectedModel?: string;
  onModelSwitch?: (from: string, to: string, reason: string) => void;
}

export const generateContentWithFallback = async (
  options: GenerateContentOptions,
): Promise<{ text: string; model: string }> => {
  const apiKey = apiKeyManager.getApiKey();
  if (!apiKey) {
    throw new Error('Vui lòng cấu hình API Key trước khi sử dụng tính năng này.');
  }

  const provider = apiKeyManager.getProvider();
  const ai = createGoogleAiClient(apiKey, provider);
  const models = apiKeyManager.getOrderedFallbackModels(options.selectedModel);

  let lastError: any = null;

  for (const model of models) {
    try {
      // Build config — không dùng temperature/topP/topK cho model 3.x (api.md Section IV)
      const config: any = {};
      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }
      if (options.responseMimeType) {
        config.responseMimeType = options.responseMimeType;
      }
      if (options.maxOutputTokens) {
        config.maxOutputTokens = options.maxOutputTokens;
      }
      // Thinking config for planning tasks
      if (options.thinkingLevel) {
        config.thinkingConfig = { thinkingLevel: options.thinkingLevel };
      }

      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config,
      });

      const text = response.text || '';
      return { text, model };
    } catch (error: any) {
      lastError = error;
      const errorType = parseApiError(error);

      // Errors that should stop immediately — no more fallback
      if (
        errorType === 'INVALID_API_KEY' ||
        errorType === 'QUOTA_EXCEEDED' ||
        errorType === 'INVALID_ARGUMENT' ||
        errorType === 'UNKNOWN'
      ) {
        throw new Error(getFriendlyErrorMessage(errorType));
      }

      // PERMISSION_DENIED: for Agent Platform, try next model first
      if (errorType === 'PERMISSION_DENIED' && provider !== 'agent-platform') {
        throw new Error(getFriendlyErrorMessage(errorType));
      }

      // MODEL_OVERLOADED or NOT_FOUND — try next model
      if (options.onModelSwitch) {
        const nextIdx = models.indexOf(model) + 1;
        if (nextIdx < models.length) {
          options.onModelSwitch(model, models[nextIdx], errorType);
        }
      }
    }
  }

  throw lastError || new Error('Tất cả model đều thất bại. Vui lòng thử lại sau.');
};

// ============================================================
// HAIPHONG SYSTEM INSTRUCTION — CHUẨN QUYẾT ĐỊNH SỞ GD&ĐT HẢI PHÒNG 2025
// ============================================================
export const HAIPHONG_SYSTEM_INSTRUCTION = `You are an elite High School Math Olympiad author and pedagogue specialized in gifted student competitions (Kỳ thi chọn HSG môn Toán THPT bằng Tiếng Anh) following the exact examination framework and matrix issued by Hai Phong Department of Education and Training (Sở GD&ĐT Hải Phòng, Quyết định năm 2025).

I. CONTEST SPECIFICATIONS (SỞ GD&ĐT HẢI PHÒNG 2025):
1. Name: Kỳ thi chọn HSG thành phố môn Toán và các môn KHTN bằng tiếng Anh – Cấp THPT.
2. Structure: Exactly 22 questions | Duration: 90 minutes | Total Score: 10.00 points.
3. Scope: THCS Mathematics + High School Grade 10 & 11 (Vietnam 2018 General Education Curriculum).
4. Uniqueness Constraint: Questions must NOT replicate past questions released by Hai Phong DOET within the last 3 years.
5. Cognitive Level Distribution (Toàn đề 22 câu):
   - 8 Understanding (Thông hiểu - 36.4%): 5 in Part I, 3 in Part II.
   - 9 Application (Vận dụng - 40.9%): 5 in Part I, 4 in Part II.
   - 5 Higher-order Thinking (Vận dụng cao - 22.7%): 2 in Part I, 3 in Part II.

II. DETAILED MATRIX & STRAND BREAKDOWN:
PART I: 12 Multiple Choice Questions (Questions 1 to 12) - 4 options (A, B, C, D)
- Questions 1 to 5: Algebra & Calculus (Đại số – Giải tích) [2 Understanding, 2 Application, 1 Advanced]
  * Topics: System of linear inequalities & feasible regions; Quadratic functions (vertex, real-world parabolic arch); Trigonometric functions & equations (amplitude, range, auxiliary angle method); Arithmetic & geometric progressions; Limits of sequences/functions & continuity; Exponential & logarithmic functions/equations with parameters.
- Questions 6 to 10: Geometry & Measurement (Hình học và Đo lường) [2 Understanding, 2 Application, 1 Advanced]
  * Topics: Trigonometric relations in triangles (Law of Sines, Law of Cosines, Heron's formula, measurement problems); Coordinate geometry Oxy (lines, circles, conic sections: ellipse, hyperbola, parabola); Solid geometry: parallelism & perpendicularity (UP TO line perpendicular to plane: angles between lines, angle between line and plane, perpendicular cross-sections, distance between skew lines).
- Questions 11 to 12: Statistics, Probability, Discrete & Number Theory [1 Understanding, 1 Application]
  * Topics: Classical probability & counting principles; Grouped data statistics (modal group, mean, median, quartiles); Basic Pigeonhole Principle; Parity invariants.

PART II: 10 Short-Answer Questions (Questions 13 to 22) - Numerical / Fraction / Decimal answers
- Questions 13 to 16: Algebra & Calculus [1 Understanding, 1 Application, 2 Advanced]
  * Trọng tâm VDC: Recurrence sequences $u_{n+1} = f(u_n)$, general terms, limits via Squeeze Theorem or Weierstrass monotone convergence; Parametric exponential/logarithmic inequalities with exact integer solution counting; Real-world linear programming profit/cost optimization.
- Questions 17 to 20: Geometry & Measurement [1 Understanding, 2 Application, 1 Advanced]
  * Trọng tâm: Real-world conic models (semi-ellipse arch bridge height, whispering gallery focal distance, parabolic satellite dish focus); Solid geometry angles, perpendicular sections, and tri-rectangular tetrahedrons (within scope up to line perpendicular to plane).
- Questions 21 to 22: Statistics, Probability, Discrete & Number Theory [1 Application, 1 Advanced - HAI PHONG SIGNATURE PROBLEMS]
  * Question 21: Real-world / Geometric Pigeonhole Principle (Nguyên lý Dirichlet chuồng - thỏ: points inside equilateral triangles $k^2+1$, unit squares, or 3D integer lattice points parity profiles $2^3+1 = 9$).
  * Question 22: Invariance & Monovariants (Nguyên lý bất biến và đơn biến: blackboard number operations replacing $(a, b)$ with $|a-b|$ or $a+b-1$, mutilated chessboard domino tiling coloring invariants, game termination).

III. ACADEMIC ENGLISH & Olympiad STYLE:
- Use formal academic Olympiad English terminology (consistent with AMC, AIME, BMO, USAMO, Yufei Zhao MIT lectures, Evan Chen OTIS, Art of Problem Solving).
- Key vocabulary: feasible region, objective function, linear programming, arithmetic/geometric progression, recurrence relation, squeeze theorem, conic sections, whispering gallery, skew lines, cross-section, pigeonhole principle, invariant, monovariant, grouped data, quartiles, modal group.

IV. MATHEMATICAL FORMATTING (KaTeX):
- All formulas MUST use standard LaTeX delimiters: '$...$' for inline and '$$...$$' for display.
- Every formula, equation, variable, interval, coordinate, and function must be written as real LaTeX, for example: $P = 2x + 3y$, $\\begin{cases} 2x - y + 2 \\ge 0 \\\\ x + 2y - 4 \\le 0 \\end{cases}$, $[-4; 6]$, $\\frac{a}{b}$.
- Write mathematical expressions directly inside the text. Always embed the exact math formulas and options.
- In JSON strings, double-escape all LaTeX backslashes: use \\\\frac{a}{b} so that after JSON parse it becomes \\frac{a}{b}.
- Example correct JSON value: "Find the maximum value of $P = 2x + 3y$ when $\\\\sqrt{x} \\\\le 3$"
- The response must be a valid JSON array/object wrapped in ${'```'}json ... ${'```'} code fences.`;

// ============================================================
// EXTRACT & PARSE JSON FROM TEXT RESPONSE
// Since we don't use responseMimeType: 'application/json',
// Gemini returns text that may contain ```json...``` code fences.
// This approach preserves LaTeX formulas perfectly because Gemini
// writes them naturally without being constrained by JSON mode.
// ============================================================

/**
 * Sanitize LaTeX backslashes that would be destroyed by JSON.parse.
 * \frac → \f = form feed ❌ | \beta → \b = backspace ❌
 * \text → \t = tab ❌      | \right → \r = CR ❌
 * \newcommand → \n = LF ❌
 */
function sanitizeLatexInJson(jsonText: string): string {
  return jsonText.replace(/(?<!\\)\\([a-zA-Z])/g, '\\\\$1');
}

/**
 * Extract JSON from Gemini's text response and parse safely.
 * Handles: raw JSON, ```json fenced, ```fenced, mixed text with JSON.
 */
function safeJsonParse(text: string): any {
  // Step 1: Try direct parse (in case text is already valid JSON)
  const sanitized = sanitizeLatexInJson(text);
  try {
    return JSON.parse(sanitized);
  } catch { /* continue */ }

  // Step 2: Strip markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) {
    const extracted = sanitizeLatexInJson(fenceMatch[1].trim());
    try {
      return JSON.parse(extracted);
    } catch { /* continue */ }
  }

  // Step 3: Find JSON array or object boundaries
  const jsonStart = text.search(/[\[{]/);
  const jsonEndBracket = text.lastIndexOf(']');
  const jsonEndBrace = text.lastIndexOf('}');
  const jsonEnd = Math.max(jsonEndBracket, jsonEndBrace);
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    const extracted = sanitizeLatexInJson(text.slice(jsonStart, jsonEnd + 1));
    try {
      return JSON.parse(extracted);
    } catch { /* continue */ }
  }

  // Step 4: Last resort — aggressive cleanup
  const cleaned = sanitizeLatexInJson(
    text.replace(/```json\s*|```/g, '').trim()
  );
  return JSON.parse(cleaned);
}

// ============================================================
// HIGH-LEVEL API FUNCTIONS
// ============================================================

/** Generate a full 22-question exam or custom topical test */
export const generateExam = async (params: {
  topicPrompt?: string;
  mode?: string;
  examType?: string;
  questionCount?: number;
  customDocumentText?: string;
  onModelSwitch?: (from: string, to: string, reason: string) => void;
}): Promise<any[]> => {
  const {
    topicPrompt = '',
    mode = 'bilingual',
    examType = 'haiphong_matrix',
    questionCount = 22,
    customDocumentText = '',
    onModelSwitch,
  } = params;

  const userPrompt = `Task: Generate an authentic High School Math Olympiad examination strictly adhering to the 2025 Hai Phong Department of Education and Training (Sở GD&ĐT Hải Phòng) contest matrix.
Exam Type: ${examType}
Language Mode: ${mode}
Total Questions: ${questionCount}
${topicPrompt ? `Focus Topic / Custom Instruction: ${topicPrompt}` : ''}
${customDocumentText ? `Reference Material / Document Context:\n${customDocumentText.slice(0, 4000)}` : ''}

CRITICAL RULES FOR HAI PHONG OLYMPIAD 2025 MATRIX:
1. Question 1 to 12 MUST BE PART_1 (Multiple Choice with 4 options A, B, C, D in options_en).
2. Question 13 to 22 MUST BE PART_2 (Short Answer with concise numerical or simplified fraction string in correct_answer).
3. Exactly follow cognitive distribution:
   - Part I (Q1-12): 5 Understanding, 5 Application, 2 Advanced.
   - Part II (Q13-22): 3 Understanding, 4 Application, 3 Advanced (specifically Q15, Q16, Q20, Q22 as high-order thinking).
4. Feature iconic Hai Phong competition problem types:
   - Q3 or Q14: Real-world Linear Programming optimization (factory profit, working hours).
   - Q8 or Q18: Real-world Conic sections (semi-ellipse arch bridge, whispering gallery, parabolic dish).
   - Q15: Recurrence sequence & limit ($u_{n+1} = \\frac{u_n + a}{u_n + b}$ or $x_{n+1} = \\sqrt{x_n^2 + r^n}$).
   - Q16: Parametric exponential or logarithmic equations/inequalities with integer solution count.
   - Q21: Pigeonhole Principle (Dirichlet: points in equilateral triangle or 3D integer parity).
   - Q22: Invariance Principle (Parity invariant of board numbers or mutilated chessboard domino coloring).
5. In bilingual mode:
   - "question_en" and "question_vi" must both be provided.
   - For Part 1, "options_en" MUST BE IN ENGLISH ONLY. Do not translate options to Vietnamese.
   - Both "solution_en" and "solution_vi" must provide complete, rigorous step-by-step mathematical reasoning.

Output Schema:
A valid JSON array containing ${questionCount} question objects:
[
  {
    "order_index": number (1 to ${questionCount}),
    "part": "PART_1" or "PART_2",
    "strand": "algebra_calculus" or "geometry_measurement" or "statistics_discrete",
    "topic": string,
    "difficulty": "understanding" or "application" or "advanced",
    "question_en": string (English problem statement with $...$),
    "question_vi": string (Vietnamese translation of statement. Null if english_only),
    "options_en": ["A. ...", "B. ...", "C. ...", "D. ..."] (English only for PART_1, null or omitted for PART_2),
    "correct_answer": string (e.g. "A" / "B" / "C" / "D" for PART_1, or numerical string like "2200", "0.41", "15", "1", "0" for PART_2),
    "acceptable_answers": string[],
    "solution_en": string (complete step-by-step solution in English),
    "solution_vi": string (complete step-by-step solution in Vietnamese)
  }
]

CRITICAL FORMATTING RULES:
- Wrap your output inside \`\`\`json ... \`\`\` code fences.
- Write ALL math formulas DIRECTLY using LaTeX $...$ inline, for example "$f(x) = 3\\\\sin(2x) - 4\\\\cos(2x) + 1$", "$\\\\frac{a}{b}$", "$[-4; 6]$".
- In JSON strings, escape LaTeX backslashes properly: "\\\\frac{a}{b}", "\\\\sqrt{x}", "\\\\sin(2x)".
- Each formula must be wrapped in $ delimiters: "$\\\\frac{a}{b}$", "$\\\\triangle ABC$".
- Options must also have proper LaTeX: "A. $6\\\\sqrt{5}$", NOT "A. 6\\sqrt{5}".`;

  const result = await generateContentWithFallback({
    contents: userPrompt,
    systemInstruction: HAIPHONG_SYSTEM_INSTRUCTION,
    // NO responseMimeType — allows Gemini to write LaTeX naturally
    maxOutputTokens: 32768,
    onModelSwitch,
  });

  return safeJsonParse(result.text);
};


/** Generate study lesson for a topic */
export const generateStudyLesson = async (params: {
  topic: string;
  mode?: string;
  onModelSwitch?: (from: string, to: string, reason: string) => void;
}): Promise<any> => {
  const { topic, mode = 'bilingual', onModelSwitch } = params;

  const prompt = `You are preparing an advanced High School Math Olympiad study guide for Vietnamese students studying mathematics in English.
Topic: "${topic}"
Mode: ${mode}

Generate a comprehensive lesson in JSON format with:
1. "content_markdown": Markdown theoretical overview with formulas in KaTeX ($...$, $$...$$), definitions, key theorems, and competitive remarks. (Dual language if bilingual).
2. "glossary": Array of specialized math terms:
   [{ "term_en": string, "term_vi": string, "definition": string, "example": string }]
3. "methods": Array of typical problem-solving methods:
   [{ "name_en": string, "name_vi": string, "steps": string[], "sample_problem": string (with math symbols in $...$), "solution": string (detailed step-by-step) }]

Return ONLY valid JSON matching this schema, wrapped in \`\`\`json ... \`\`\` code fences.
Write ALL math formulas directly as standard LaTeX in $...$ or $$...$$.`;

  const result = await generateContentWithFallback({
    contents: prompt,
    systemInstruction: HAIPHONG_SYSTEM_INSTRUCTION,
    // NO responseMimeType — allows Gemini to write LaTeX naturally
    maxOutputTokens: 32768,
    onModelSwitch,
  });

  return safeJsonParse(result.text);
};

/** Generate quick topical practice quiz */
export const generateTopicPractice = async (params: {
  topic: string;
  mode?: string;
  count?: number;
  onModelSwitch?: (from: string, to: string, reason: string) => void;
}): Promise<any[]> => {
  const { topic, mode = 'bilingual', count = 6, onModelSwitch } = params;

  const prompt = `Generate exactly ${count} practice questions STRICTLY on the topic: "${topic}".

CRITICAL RULES:
1. ALL questions MUST be directly about "${topic}". Do NOT generate questions on other topics.
2. Language mode: ${mode}. In bilingual mode, translate ONLY the question prompt into "question_vi". Do NOT translate options into Vietnamese.
3. Use KaTeX-compatible LaTeX enclosed in $...$ for inline or $$...$$ for display formulas.
4. In JSON strings, use valid standard JSON escaping for LaTeX commands (e.g., "\\\\sin", "\\\\frac{a}{b}", "\\\\sqrt{x}", "\\\\log", "\\\\lim_{x \\\\to 0}"). Do NOT use 4 backslashes.
5. Include Part 1 (MCQ with 4 options) and Part 2 (Short-answer with correct_answer as a number or expression).
6. Each question must have: id, part ("PART_1" or "PART_2"), order_index, strand, topic, difficulty, question_en, question_vi, correct_answer, solution_en, solution_vi.
7. MCQ options format (English only, do NOT translate): ["A. ...", "B. ...", "C. ...", "D. ..."]

Output: JSON array of ${count} question objects wrapped in \`\`\`json ... \`\`\` code fences.
Write ALL math formulas directly using standard $...$ LaTeX.
Escape LaTeX backslashes in JSON strings: "\\\\frac{a}{b}", "$\\\\sqrt{x}$".`;

  const result = await generateContentWithFallback({
    contents: prompt,
    systemInstruction: HAIPHONG_SYSTEM_INSTRUCTION,
    // NO responseMimeType — allows Gemini to write LaTeX naturally
    maxOutputTokens: 12288,
    onModelSwitch,
  });

  return safeJsonParse(result.text);
};

/** Regenerate / Swap a single question with matching metadata */
export const regenerateSingleQuestion = async (params: {
  originalQuestion: Question;
  mode?: string;
  customPrompt?: string;
  onModelSwitch?: (from: string, to: string, reason: string) => void;
}): Promise<Question> => {
  const { originalQuestion, mode = 'bilingual', customPrompt, onModelSwitch } = params;

  const prompt = `You need to regenerate / swap question #${originalQuestion.order_index} for a high-school Math Olympiad contest (Hai Phong city standard).
Provide a NEW, DIFFERENT, EQUIVALENT replacement problem with the EXACT SAME specification:
- Part: ${originalQuestion.part} (${originalQuestion.part === 'PART_1' ? 'Multiple Choice with 4 options' : 'Short Answer'})
- Strand: ${originalQuestion.strand}
- Topic: "${originalQuestion.topic}"
- Cognitive Difficulty Level: ${originalQuestion.difficulty}
- Language Mode: ${mode}
${customPrompt ? `Teacher's Special Instruction: "${customPrompt}"` : ''}

Output JSON format (single question object):
{
  "part": "${originalQuestion.part}",
  "order_index": ${originalQuestion.order_index},
  "strand": "${originalQuestion.strand}",
  "topic": "${originalQuestion.topic}",
  "difficulty": "${originalQuestion.difficulty}",
  "question_en": "string",
  "question_vi": "string (if bilingual)",
  "options_en": ["A. ...", "B. ...", "C. ...", "D. ..."] (if PART_1),
  "correct_answer": "string",
  "acceptable_answers": ["string"] (if PART_2),
  "hints": ["Hint 1: ...", "Hint 2: ..."],
  "solution_en": "string",
  "solution_vi": "string"
}`;

  const result = await generateContentWithFallback({
    contents: prompt,
    systemInstruction: HAIPHONG_SYSTEM_INSTRUCTION,
    // NO responseMimeType — allows Gemini to write LaTeX naturally
    maxOutputTokens: 8192,
    onModelSwitch,
  });

  const parsed = safeJsonParse(result.text);

  // Ensure consistent identifiers
  return {
    ...originalQuestion,
    ...parsed,
    id: originalQuestion.id || `q-${Date.now()}`,
    exam_id: originalQuestion.exam_id,
    order_index: originalQuestion.order_index,
    part: originalQuestion.part,
    strand: originalQuestion.strand,
    topic: originalQuestion.topic,
  };
};

/**
 * AI Academic Polisher for Olympic Mathematical Proofs
 * Analyzes mathematical rigor, language accuracy, and provides publication-grade rewrite
 */
export const polishMathProof = async (params: {
  problemTitle: string;
  problemStatement: string;
  studentProof: string;
  onModelSwitch?: (from: string, to: string, reason: string) => void;
}): Promise<ProofFeedback> => {
  const { problemTitle, problemStatement, studentProof, onModelSwitch } = params;

  const prompt = `You are an elite International Mathematical Olympiad (IMO) juror and English academic editor.
A high school math olympiad competitor has submitted a written proof in English for the following problem:

Problem Title: "${problemTitle}"
Problem Statement:
"${problemStatement}"

Student's Written Proof in English:
"${studentProof}"

Analyze this proof meticulously with two criteria:
1. Mathematical Rigor (Logical flow, missing cases, circular reasoning, completeness).
2. Academic Mathematical English (Grammar, mathematical idioms, formal conjunctions like 'Without loss of generality', 'Assume for contradiction', 'It suffices to show', 'By Cauchy-Schwarz', 'Consequently').

Return ONLY a JSON object with this exact schema:
{
  "rigor_score": number (0 to 10, integer or decimal with 1 decimal place),
  "language_score": number (0 to 10, integer or decimal with 1 decimal place),
  "grammar_issues": [
    {
      "original": "exact text snippet with error",
      "correction": "corrected phrasing",
      "explanation": "concise explanation in Vietnamese of why this is better in mathematical English"
    }
  ],
  "math_reasoning_feedback": "Detailed pedagogical evaluation in Vietnamese of the student's mathematical argumentation, pointing out valid steps and logical pitfalls or unjustified claims.",
  "polished_proof_en": "Flawless, publication-grade academic rewrite of the proof in English, beautifully formatted with standard LaTeX in $...$ and formal mathematical prose.",
  "pedagogical_advice": "Actionable advice in Vietnamese for the student on how to write formal proofs faster and avoid losing points in municipal/national Olympiads."
}`;

  const result = await generateContentWithFallback({
    contents: prompt,
    systemInstruction: `You are an elite IMO reviewer and mathematical editor. Return valid JSON only. Keep LaTeX in standard $...$ and $$...$$.`,
    // NO responseMimeType — allows Gemini to write LaTeX naturally
    maxOutputTokens: 8192,
    thinkingLevel: 'low',
    onModelSwitch,
  });

  return safeJsonParse(result.text);
};
