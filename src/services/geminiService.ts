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
// HAIPHONG SYSTEM INSTRUCTION
// ============================================================
export const HAIPHONG_SYSTEM_INSTRUCTION = `You are an elite High School Math Olympiad author and pedagogue specialized in gifted student competitions (HSG môn Toán THPT bằng Tiếng Anh) following the exact examination matrix of Hai Phong Department of Education and Training (Sở GD&ĐT Hải Phòng).

Contest Structure & Rules (MUST BE STRICTLY FOLLOWED):
1. Standard Exam: 22 questions / 90 minutes.
2. Two Parts:
   - Part I (Questions 1 to 12): Multiple choice questions with 4 distinct options (A, B, C, D).
   - Part II (Questions 13 to 22): Short-answer questions requiring a concise numerical value (integer, irreducible fraction 'a/b', or decimal).
3. Cognitive Levels Distribution:
   - 6 Understanding (Thông hiểu)
   - 9 Application (Vận dụng)
   - 7 Higher-order Thinking (Vận dụng cao)
4. Three Strands:
   - Strand 1: Algebra & Calculus (Đại số – Giải tích): 9 questions.
   - Strand 2: Geometry & Measurement (Hình học và Đo lường): 9 questions.
   - Strand 3: Statistics, Probability, Discrete & Number Theory: 4 questions.
5. KaTeX Math Formatting:
   - All mathematical formulas MUST use standard LaTeX: '$...$' for inline formulas, '$$...$$' for display block formulas.
6. Language:
   - For bilingual mode: provide question_en and question_vi, options_en and options_vi (for Part 1), solution_en and solution_vi.
   - For english_only: question_en, options_en, solution_en.
7. Return clean JSON only without markdown code fences if possible, or standard JSON.`;

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

  const userPrompt = `Task: Generate a high school math competition exam.
Exam Type: ${examType}
Language Mode: ${mode}
Number of questions: ${questionCount}
${topicPrompt ? `Focus Topic / Custom Instruction: ${topicPrompt}` : ''}
${customDocumentText ? `Reference Material / Document Context:\n${customDocumentText.slice(0, 4000)}` : ''}

Output Schema:
A valid JSON array containing ${questionCount} question objects with these exact properties:
[
  {
    "order_index": number (1 to ${questionCount}),
    "part": "PART_1" or "PART_2",
    "strand": "algebra_calculus" or "geometry_measurement" or "statistics_discrete",
    "topic": string,
    "difficulty": "understanding" or "application" or "advanced",
    "question_en": string (using $...$ for math),
    "question_vi": string (Vietnamese translation if bilingual),
    "options_en": ["A. ...", "B. ...", "C. ...", "D. ..."] (null or omit for PART_2),
    "options_vi": ["A. ...", "B. ...", "C. ...", "D. ..."] (null or omit for PART_2),
    "correct_answer": string (For Part 1: "A", "B", "C", or "D". For Part 2: e.g. "42", "1/3", "-5.5"),
    "acceptable_answers": string[] (e.g. ["1/3", "0.333"]),
    "solution_en": string (detailed step-by-step solution with $...$),
    "solution_vi": string (detailed step-by-step solution in Vietnamese)
  }
]

CRITICAL: Return ONLY valid JSON array. Ensure all JSON string quotes and backslashes in LaTeX are properly escaped.`;

  const result = await generateContentWithFallback({
    contents: userPrompt,
    systemInstruction: HAIPHONG_SYSTEM_INSTRUCTION,
    responseMimeType: 'application/json',
    maxOutputTokens: 32768,
    onModelSwitch,
  });

  const rawText = result.text;
  try {
    return JSON.parse(rawText);
  } catch {
    const cleaned = rawText.replace(/```json\s*|```/g, '').trim();
    return JSON.parse(cleaned);
  }
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

Return ONLY valid JSON matching this schema.`;

  const result = await generateContentWithFallback({
    contents: prompt,
    systemInstruction: HAIPHONG_SYSTEM_INSTRUCTION,
    responseMimeType: 'application/json',
    maxOutputTokens: 32768,
    onModelSwitch,
  });

  const raw = result.text;
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(raw.replace(/```json\s*|```/g, '').trim());
  }
};

/** Generate quick topical practice quiz */
export const generateTopicPractice = async (params: {
  topic: string;
  mode?: string;
  count?: number;
  onModelSwitch?: (from: string, to: string, reason: string) => void;
}): Promise<any[]> => {
  const { topic, mode = 'bilingual', count = 6, onModelSwitch } = params;

  const prompt = `Generate a ${count}-question topical practice test on the topic: "${topic}".
Language mode: ${mode}.
Include both Part 1 (MCQ) and Part 2 (Short-answer).
Use $...$ for all LaTeX math formulas.
Output Schema: JSON array of questions matching the standard Question interface.`;

  const result = await generateContentWithFallback({
    contents: prompt,
    systemInstruction: HAIPHONG_SYSTEM_INSTRUCTION,
    responseMimeType: 'application/json',
    maxOutputTokens: 12288,
    onModelSwitch,
  });

  const raw = result.text;
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(raw.replace(/```json\s*|```/g, '').trim());
  }
};
