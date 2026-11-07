/**
 * Gemini Service — Client-side Gemini API with model fallback
 * Theo quy chuẩn api.md (v4.3 — 24/10/2026):
 * - Fallback chain: [model đã chọn] → gemini-3.8-flash → gemini-3.5-flash-lite → gemini-3.6-flash → ...
 * - Phân loại lỗi đọc error.status trước; API_KEY_INVALID kiểm tra TRƯỚC 400 (mục VII.3)
 * - 429/403/404/5xx/400 → thử model kế tiếp; key sai / lỗi mạng → dừng ngay
 * - Không gửi temperature/topP/topK cho model 3.x; thinkingLevel chỉ gửi với Gemini API (mục VII.7)
 * - Mọi call site đi qua generateContentWithFallback + createGoogleAiClient
 */

import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { apiKeyManager, AiProvider, isValidGoogleAiApiKey } from './apiKeyManager';
import { Question, ProofFeedback } from '../types';

// ============================================================
// ERROR CLASSIFICATION (api.md mục VII.3 — thứ tự kiểm tra quan trọng)
// ============================================================
export type ApiErrorType =
  | 'INVALID_API_KEY'
  | 'QUOTA_EXCEEDED'
  | 'RATE_LIMIT'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'INVALID_ARGUMENT'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

/** Lấy mã HTTP: ưu tiên error.status (ApiError của SDK), sau đó "code": NNN trong message JSON. */
const getHttpStatus = (error: any): number | undefined => {
  const status = Number(error?.status ?? error?.code);
  if (Number.isInteger(status) && status >= 100 && status < 600) return status;
  const message = String(error?.message || '');
  const match = message.match(/"code"\s*:\s*(\d{3})/) || message.match(/^\s*(?:got status:\s*)?(\d{3})\b/i);
  return match ? Number(match[1]) : undefined;
};

export const parseApiError = (error: any): ApiErrorType => {
  const message = String(error?.message || error || '');
  const lower = message.toLowerCase();
  const status = getHttpStatus(error);

  // 1–2. Key sai / hết hạn — Google trả dạng 400 INVALID_ARGUMENT kèm reason API_KEY_INVALID
  if (
    message.includes('API_KEY_INVALID') ||
    lower.includes('api key not valid') ||
    lower.includes('api key expired') ||
    lower.includes('api_key_expired')
  ) return 'INVALID_API_KEY';
  if (status === 401 || message.includes('UNAUTHENTICATED')) return 'INVALID_API_KEY';

  // 3. Quota / rate limit
  if (status === 429 || message.includes('RESOURCE_EXHAUSTED') || lower.includes('quota')) {
    return lower.includes('per minute') || lower.includes('rate limit') ? 'RATE_LIMIT' : 'QUOTA_EXCEEDED';
  }

  // 4. Không có quyền (có thể chỉ do model bị giới hạn, vd dòng 2.5 với key mới)
  if (status === 403 || message.includes('PERMISSION_DENIED')) return 'PERMISSION_DENIED';

  // 5. Model không tồn tại / không hỗ trợ generateContent
  if (status === 404 || message.includes('NOT_FOUND') || lower.includes('not supported for generatecontent')) {
    return 'NOT_FOUND';
  }

  // 6. Lỗi máy chủ / quá tải
  if (
    (status !== undefined && status >= 500) ||
    message.includes('INTERNAL') ||
    message.includes('UNAVAILABLE') ||
    message.includes('DEADLINE_EXCEEDED') ||
    lower.includes('overloaded') ||
    lower.includes('high demand') ||
    lower.includes('try again later') ||
    lower.includes('temporarily unavailable')
  ) return 'SERVER_ERROR';

  // 7. Tham số không hợp với model
  if (status === 400 || message.includes('INVALID_ARGUMENT')) return 'INVALID_ARGUMENT';

  // 8. Lỗi mạng
  if (
    lower.includes('failed to fetch') ||
    lower.includes('fetch failed') ||
    lower.includes('networkerror') ||
    lower.includes('network error') ||
    lower.includes('load failed') ||
    /\berr_[a-z_]+/i.test(message)
  ) return 'NETWORK_ERROR';

  return 'UNKNOWN';
};

/** Lỗi được phép thử model kế tiếp (api.md mục VII.3). */
const isFallbackEligible = (type: ApiErrorType): boolean =>
  type === 'QUOTA_EXCEEDED' ||
  type === 'RATE_LIMIT' ||
  type === 'PERMISSION_DENIED' ||
  type === 'NOT_FOUND' ||
  type === 'SERVER_ERROR' ||
  type === 'INVALID_ARGUMENT';

// ============================================================
// FRIENDLY ERROR MESSAGES (Vietnamese)
// ============================================================
export const getFriendlyErrorMessage = (errorType: ApiErrorType, provider: AiProvider = 'gemini'): string => {
  switch (errorType) {
    case 'INVALID_API_KEY':
      return 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trong Cài đặt.';
    case 'PERMISSION_DENIED':
      return provider === 'agent-platform'
        ? 'Google đã nhận key nhưng dự án chưa được cấp quyền gọi Agent Platform API hoặc model này. Kiểm tra: đã bật Agent Platform API, billing, API restrictions và quyền dùng model.'
        : 'API key không có quyền truy cập Gemini API (key có thể bị giới hạn theo website/IP hoặc dự án chưa bật Generative Language API).';
    case 'QUOTA_EXCEEDED':
      return 'Đã hết quota hoặc vượt giới hạn tốc độ API. Vui lòng đợi rồi thử lại, hoặc đổi sang API key khác (tài khoản Gmail khác) trong Cài đặt.';
    case 'RATE_LIMIT':
      return 'Đã vượt giới hạn tốc độ API (số request mỗi phút). Vui lòng đợi khoảng 1 phút rồi thử lại.';
    case 'SERVER_ERROR':
      return 'Tất cả model Gemini đang quá tải hoặc máy chủ Google gặp sự cố. Vui lòng thử lại sau ít phút.';
    case 'NOT_FOUND':
      return 'Không có model nào khả dụng cho API key này. Vui lòng chọn model khác trong Cài đặt.';
    case 'INVALID_ARGUMENT':
      return 'Yêu cầu không hợp lệ với các model hiện có. Vui lòng thử lại hoặc chọn model khác.';
    case 'NETWORK_ERROR':
      return 'Không kết nối được tới máy chủ Google. Vui lòng kiểm tra mạng Internet rồi thử lại.';
    default:
      return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.';
  }
};

/** Lý do ngắn gọn hiển thị trong banner chuyển model (api.md mục VII.2). */
const FALLBACK_REASON: Record<ApiErrorType, string> = {
  SERVER_ERROR: 'đang bận',
  QUOTA_EXCEEDED: 'đã hết lượt sử dụng',
  RATE_LIMIT: 'đang bị giới hạn tốc độ',
  NOT_FOUND: 'không khả dụng',
  PERMISSION_DENIED: 'không mở cho API key này',
  INVALID_ARGUMENT: 'không nhận cấu hình yêu cầu',
  INVALID_API_KEY: 'báo key không hợp lệ',
  NETWORK_ERROR: 'mất kết nối',
  UNKNOWN: 'gặp lỗi',
};

/** Lỗi AI đã được phân loại — UI dùng `type` để quyết định mở Cài đặt, gợi ý đổi key... */
export class GeminiApiError extends Error {
  type: ApiErrorType;
  constructor(type: ApiErrorType, message: string) {
    super(message);
    this.name = 'GeminiApiError';
    this.type = type;
  }
}

// ============================================================
// FALLBACK NOTICE EVENTS (api.md mục VII.2)
// ============================================================
export type ModelFallbackEvent =
  | { type: 'switch'; from: string; to: string; reason: string }
  | { type: 'done' }
  | { type: 'invalid-key' };

let fallbackListener: ((event: ModelFallbackEvent) => void) | null = null;
let activeCalls = 0;

export const setModelFallbackListener = (listener: ((event: ModelFallbackEvent) => void) | null) => {
  fallbackListener = listener;
};

const emitFallbackEvent = (event: ModelFallbackEvent) => {
  try {
    fallbackListener?.(event);
  } catch {
    // listener lỗi không được làm hỏng lời gọi AI
  }
};

// ============================================================
// CLIENT FACTORY (api.md Section III) — nơi DUY NHẤT khởi tạo SDK
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
// GENERATION CONFIG (api.md mục VII.7)
// ============================================================
interface GenerationConfigOptions {
  systemInstruction?: string;
  responseMimeType?: string;
  maxOutputTokens?: number;
  thinkingLevel?: ThinkingLevel;
}

export const getGeminiGenerationConfig = (
  model: string,
  provider: AiProvider,
  options: GenerationConfigOptions = {},
): Record<string, any> => {
  const config: Record<string, any> = {};
  if (options.systemInstruction) config.systemInstruction = options.systemInstruction;
  if (options.responseMimeType) config.responseMimeType = options.responseMimeType;
  if (options.maxOutputTokens) config.maxOutputTokens = options.maxOutputTokens;

  const isGemini3 = model.startsWith('gemini-3') || model === 'gemini-flash-latest';
  if (isGemini3) {
    // Không gửi temperature/topP/topK. thinkingLevel chỉ với Gemini API; không dùng MINIMAL/HIGH mặc định.
    if (provider === 'gemini') {
      config.thinkingConfig = { thinkingLevel: options.thinkingLevel ?? ThinkingLevel.MEDIUM };
    }
  } else if (model.startsWith('gemini-2')) {
    config.temperature = 0.5;
    config.topK = 64;
    config.topP = 0.95;
    config.thinkingConfig = { thinkingBudget: 2048 };
  }
  return config;
};

// ============================================================
// FALLBACK GENERATE CONTENT
// ============================================================
interface GenerateContentOptions {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  maxOutputTokens?: number;
  /** Mặc định MEDIUM cho bước sinh chính; LOW cho tác vụ phụ trợ */
  thinkingLevel?: ThinkingLevel;
  selectedModel?: string;
  onModelSwitch?: (from: string, to: string, reason: string) => void;
}

export interface GenerateContentResult {
  text: string;
  model: string;
  /** Lý do model dừng sinh: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | ... (dùng để phát hiện phản hồi bị cắt cụt) */
  finishReason?: string;
  /** Lý do prompt bị chặn (nếu có) — khi đó text thường rỗng */
  blockReason?: string;
}

/** Khi mọi model đều lỗi, báo loại lỗi có ích nhất cho người dùng. */
const FINAL_ERROR_PRIORITY: ApiErrorType[] = [
  'QUOTA_EXCEEDED',
  'RATE_LIMIT',
  'PERMISSION_DENIED',
  'SERVER_ERROR',
  'NOT_FOUND',
  'INVALID_ARGUMENT',
];

export const generateContentWithFallback = async (
  options: GenerateContentOptions,
): Promise<GenerateContentResult> => {
  const provider = apiKeyManager.getProvider();
  const apiKey = apiKeyManager.getApiKey(provider);
  if (!apiKey) {
    emitFallbackEvent({ type: 'invalid-key' });
    throw new GeminiApiError('INVALID_API_KEY', 'Vui lòng cấu hình API Key trước khi sử dụng tính năng này.');
  }
  if (!isValidGoogleAiApiKey(apiKey)) {
    emitFallbackEvent({ type: 'invalid-key' });
    throw new GeminiApiError('INVALID_API_KEY', 'API Key không đúng định dạng (AIza... hoặc AQ...). Vui lòng kiểm tra lại trong Cài đặt.');
  }

  const ai = createGoogleAiClient(apiKey, provider);
  const models = apiKeyManager.getOrderedFallbackModels(options.selectedModel, provider);
  const seenErrors = new Set<ApiErrorType>();
  let lastError: any = null;

  activeCalls++;
  try {
    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: getGeminiGenerationConfig(model, provider, options),
        });

        const text = response.text || '';
        const rawFinish = response.candidates?.[0]?.finishReason;
        const rawBlock = response.promptFeedback?.blockReason;
        const finishReason = rawFinish ? String(rawFinish) : undefined;
        const blockReason = rawBlock ? String(rawBlock) : undefined;

        if ((finishReason && finishReason !== 'STOP') || blockReason || !text) {
          console.warn('[Gemini] Phản hồi bất thường:', {
            model,
            finishReason,
            blockReason,
            textLength: text.length,
          });
        }

        return { text, model, finishReason, blockReason };
      } catch (error: any) {
        lastError = error;
        const errorType = parseApiError(error);
        seenErrors.add(errorType);
        console.warn(`[Gemini] ${model} lỗi ${errorType}:`, error?.message || error);

        if (!isFallbackEligible(errorType)) {
          if (errorType === 'INVALID_API_KEY') emitFallbackEvent({ type: 'invalid-key' });
          throw new GeminiApiError(errorType, getFriendlyErrorMessage(errorType, provider));
        }

        const next = models[i + 1];
        if (next) {
          const reason = FALLBACK_REASON[errorType];
          emitFallbackEvent({ type: 'switch', from: model, to: next, reason });
          options.onModelSwitch?.(model, next, reason);
        }
      }
    }
  } finally {
    activeCalls--;
    if (activeCalls <= 0) {
      activeCalls = 0;
      emitFallbackEvent({ type: 'done' });
    }
  }

  const finalType = FINAL_ERROR_PRIORITY.find((t) => seenErrors.has(t)) || parseApiError(lastError);
  throw new GeminiApiError(finalType, getFriendlyErrorMessage(finalType, provider));
};

// ============================================================
// KIỂM TRA KEY (api.md mục VII.8)
// ============================================================
export interface ValidateApiKeyResult {
  ok: boolean;
  workingModel?: string;
  errorType?: ApiErrorType;
  message: string;
}

/** Gửi một request rất nhỏ lần lượt qua chuỗi model; dừng ngay khi key sai / lỗi mạng. */
export const validateApiKey = async (
  apiKey: string,
  provider: AiProvider,
  preferredModel?: string,
): Promise<ValidateApiKeyResult> => {
  const key = apiKey.trim();
  if (!isValidGoogleAiApiKey(key)) {
    return { ok: false, errorType: 'INVALID_API_KEY', message: 'Key không đúng định dạng (AIza... hoặc AQ...).' };
  }

  const ai = createGoogleAiClient(key, provider);
  const models = apiKeyManager.getOrderedFallbackModels(preferredModel, provider);
  const seenErrors = new Set<ApiErrorType>();

  for (const model of models) {
    try {
      await ai.models.generateContent({
        model,
        contents: 'Trả lời đúng một từ: OK',
        config: getGeminiGenerationConfig(model, provider, { maxOutputTokens: 64, thinkingLevel: ThinkingLevel.LOW }),
      });
      return {
        ok: true,
        workingModel: model,
        message: model === models[0]
          ? `Key hoạt động với model ${model}.`
          : `Key hoạt động. Model ${models[0]} chưa dùng được — đã chọn ${model}.`,
      };
    } catch (error: any) {
      const errorType = parseApiError(error);
      seenErrors.add(errorType);
      if (!isFallbackEligible(errorType)) {
        return { ok: false, errorType, message: getFriendlyErrorMessage(errorType, provider) };
      }
    }
  }

  const finalType = FINAL_ERROR_PRIORITY.find((t) => seenErrors.has(t)) || 'UNKNOWN';
  return { ok: false, errorType: finalType, message: getFriendlyErrorMessage(finalType, provider) };
};

// ============================================================
// HAIPHONG SYSTEM INSTRUCTION — CHUẨN QUYẾT ĐỊNH SỞ GD&ĐT HẢI PHÒNG 2025
// ============================================================

/**
 * Quy ước LaTeX + JSON DUY NHẤT cho mọi prompt (tránh mâu thuẫn 1 / 2 / 4 gạch chéo).
 * Model nhìn thấy (sau khi template literal xử lý):
 *   - Chuỗi JSON thô: "$\\frac{a}{b}$"  → sau JSON.parse: "$\frac{a}{b}$"
 */
const JSON_LATEX_RULES = `JSON + LaTeX ESCAPING RULES (follow exactly):
- The response is JSON. Apply standard JSON string escaping EXACTLY ONCE: every single LaTeX backslash is written as two characters (\\\\) in the raw JSON text.
  * Raw JSON: "Find the maximum of $P = 2x + 3y$ when $\\\\sqrt{x} \\\\le 3$"  → after parsing: Find the maximum of $P = 2x + 3y$ when $\\sqrt{x} \\le 3$
  * Raw JSON: "A. $6\\\\sqrt{5}$", "$\\\\frac{a}{b}$", "$3\\\\sin(2x) - 4\\\\cos(2x)$", "$\\\\triangle ABC$"
  * A LaTeX row break (\\\\ inside cases/matrices) is written as \\\\\\\\ in raw JSON.
- NEVER write four backslashes before a command (\\\\\\\\frac is WRONG) and NEVER leave a lone unescaped backslash (\\frac in raw JSON is WRONG).
- For line breaks inside a text value use the escape \\n. Never put raw newline characters inside a JSON string.
- Do not use unescaped double quotes inside string values (use single quotes or \\" instead).
- Return ONLY the JSON value itself: no markdown code fences, no commentary before or after.`;

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
- Questions 21 to 22: Statistics, Probability, Discrete & Number Theory [1 Understanding, 1 Application - HAI PHONG SIGNATURE PROBLEMS]
  * Question 21: Real-world / Geometric Pigeonhole Principle (Nguyên lý Dirichlet chuồng - thỏ: points inside equilateral triangles $k^2+1$, unit squares, or 3D integer lattice points parity profiles $2^3+1 = 9$).
  * Question 22: Invariance & Monovariants (Nguyên lý bất biến và đơn biến: blackboard number operations replacing $(a, b)$ with $|a-b|$ or $a+b-1$, mutilated chessboard domino tiling coloring invariants, game termination).

III. ACADEMIC ENGLISH & Olympiad STYLE:
- Use formal academic Olympiad English terminology (consistent with AMC, AIME, BMO, USAMO, Yufei Zhao MIT lectures, Evan Chen OTIS, Art of Problem Solving).
- Key vocabulary: feasible region, objective function, linear programming, arithmetic/geometric progression, recurrence relation, squeeze theorem, conic sections, whispering gallery, skew lines, cross-section, pigeonhole principle, invariant, monovariant, grouped data, quartiles, modal group.

IV. MATHEMATICAL FORMATTING (KaTeX):
- All formulas MUST use standard LaTeX delimiters: '$...$' for inline and '$$...$$' for display.
- Every formula, equation, variable, interval, coordinate, and function must be written as real LaTeX (rendered form shown here), for example: $P = 2x + 3y$, $\\begin{cases} 2x - y + 2 \\ge 0 \\\\ x + 2y - 4 \\le 0 \\end{cases}$, $[-4; 6]$, $\\frac{a}{b}$.
- Write mathematical expressions directly inside the text. Always embed the exact math formulas and options.

V. OUTPUT FORMAT:
${JSON_LATEX_RULES}`;

// ============================================================
// EXTRACT & PARSE JSON FROM TEXT RESPONSE
// Mọi hàm sinh nội dung đều dùng responseMimeType: 'application/json'.
// Tuy vậy model vẫn có thể: trả kèm ```json fences, viết LaTeX với 1 gạch chéo
// (escape JSON không hợp lệ), chèn xuống dòng thô trong chuỗi, hoặc bị cắt cụt
// do vượt maxOutputTokens. Các hàm dưới đây xử lý toàn bộ các trường hợp đó.
// ============================================================

const JSON_FORMAT_ERROR = 'Phản hồi AI chưa hoàn chỉnh hoặc sai định dạng. Hệ thống không lưu đề lỗi; vui lòng tạo lại đề.';
const JSON_TRUNCATED_ERROR = 'Phản hồi AI bị cắt cụt do vượt giới hạn độ dài (MAX_TOKENS). Hệ thống không lưu đề lỗi; vui lòng tạo lại đề hoặc giảm số câu.';
const QUESTION_COUNT_ERROR = 'AI trả về thiếu câu hỏi hoặc sai cấu trúc. Hệ thống không lưu đề chưa đầy đủ; vui lòng tạo lại đề.';

/** Chữ cái Latin + tiếng Việt có dấu (dùng để xác định ranh giới tên lệnh LaTeX). */
const WORD_CHAR = /[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/;

/**
 * Lệnh LaTeX bắt đầu bằng "n" (\neq, \nabla, ...). Dùng để phân biệt với escape xuống dòng "\n"
 * của JSON (ví dụ "\nThe", "\nTọa độ"). Sắp xếp dài → ngắn để khớp tham lam.
 */
const LATEX_AFTER_N = [
  'Rightarrow', 'Leftarrow', 'ormalsize', 'subseteq', 'supseteq', 'parallel', 'natural',
  'earrow', 'exists', 'warrow', 'ewline', 'abla', 'otin', 'vdash', 'leq', 'geq', 'mid',
  'cong', 'less', 'gtr', 'prec', 'succ', 'sim', 'ull', 'eg', 'eq', 'ot', 'e', 'u',
].sort((a, b) => b.length - a.length);

function isLatexCommandAfterN(rest: string): boolean {
  for (const name of LATEX_AFTER_N) {
    if (rest.startsWith(name)) {
      const next = rest.charAt(name.length);
      // Lệnh LaTeX phải kết thúc ở ranh giới từ; dấu câu ngay sau (vd "\ne.g.") thường là văn bản.
      if (!next || (!WORD_CHAR.test(next) && !/[.,:;!?]/.test(next))) return true;
    }
  }
  return false;
}

/**
 * Sanitize JSON text so JSON.parse không phá hỏng / không ném lỗi vì LaTeX.
 * Chạy theo trạng thái (chỉ xử lý bên trong chuỗi JSON) và xét escape THEO CẶP,
 * nên không làm hỏng "\\frac" vốn đã hợp lệ.
 *   \frac → \f = form feed ❌ | \beta → \b = backspace ❌
 *   \text → \t = tab ❌       | \right → \r = CR ❌
 *   \newcommand → \n = LF ❌  | \sqrt, \alpha, \{, \, ... → escape không hợp lệ ❌
 * Đồng thời chuyển ký tự điều khiển thô (xuống dòng/tab thật) trong chuỗi thành escape hợp lệ.
 */
function sanitizeLatexInJson(jsonText: string): string {
  let out = '';
  let inString = false;

  for (let i = 0; i < jsonText.length; i++) {
    const ch = jsonText[i];

    if (!inString) {
      if (ch === '"') inString = true;
      out += ch;
      continue;
    }

    if (ch === '"') {
      inString = false;
      out += ch;
      continue;
    }

    if (ch === '\\') {
      const next = jsonText[i + 1];

      // Gạch chéo lơ lửng ở cuối (phản hồi bị cắt) → nhân đôi để chuỗi vẫn hợp lệ
      if (next === undefined) {
        out += '\\\\';
        continue;
      }

      // Escape JSON hợp lệ, không mơ hồ: \"  \\  \/
      if (next === '"' || next === '\\' || next === '/') {
        out += ch + next;
        i++;
        continue;
      }

      // \uXXXX hợp lệ
      if (next === 'u' && /^[0-9a-fA-F]{4}$/.test(jsonText.slice(i + 2, i + 6))) {
        out += ch + next;
        i++;
        continue;
      }

      // \n: xuống dòng JSON hay lệnh LaTeX (\neq, \nabla...)?
      if (next === 'n') {
        if (isLatexCommandAfterN(jsonText.slice(i + 2, i + 24))) {
          out += '\\\\'; // giữ gạch chéo như ký tự thật; 'n' xử lý ở vòng lặp sau
        } else {
          out += '\\n';
          i++;
        }
        continue;
      }

      // \r \t \b \f: nếu theo sau là chữ cái → gần như chắc chắn là LaTeX (\right, \text, \beta, \frac)
      if (next === 'r' || next === 't' || next === 'b' || next === 'f') {
        const after = jsonText.charAt(i + 2);
        if (/[a-zA-Z]/.test(after)) {
          out += '\\\\';
        } else {
          out += ch + next;
          i++;
        }
        continue;
      }

      // Mọi escape khác đều KHÔNG hợp lệ trong JSON (\sqrt, \alpha, \{, \,, \;, \ ...) → nhân đôi
      out += '\\\\';
      continue;
    }

    // Ký tự điều khiển thô bên trong chuỗi → escape hợp lệ
    if (ch === '\n') { out += '\\n'; continue; }
    if (ch === '\r') { out += '\\r'; continue; }
    if (ch === '\t') { out += '\\t'; continue; }
    const code = ch.charCodeAt(0);
    if (code < 0x20) {
      out += '\\u' + code.toString(16).padStart(4, '0');
      continue;
    }

    out += ch;
  }

  return out;
}

interface JsonScanResult {
  /** Vị trí dấu đóng của giá trị gốc; -1 nếu chưa đóng (bị cắt cụt) */
  end: number;
  /** Điểm cắt an toàn cuối cùng (ngay sau một } hoặc ] hoàn chỉnh) + ngăn xếp ngoặc đang mở tại đó */
  lastSafe: { pos: number; stack: string[] } | null;
}

/**
 * Quét JSON có nhận biết chuỗi: dấu [ ] { } nằm TRONG chuỗi (vd LaTeX $[-4; 6]$,
 * \begin{cases}) không bị nhầm thành biên của JSON.
 */
function scanJsonValue(text: string): JsonScanResult {
  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  let lastSafe: JsonScanResult['lastSafe'] = null;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === '[' || ch === '{') {
      stack.push(ch);
    } else if (ch === ']' || ch === '}') {
      stack.pop();
      if (stack.length === 0) return { end: i, lastSafe };
      lastSafe = { pos: i + 1, stack: [...stack] };
    }
  }
  return { end: -1, lastSafe };
}

/** Bỏ dấu phẩy thừa trước } hoặc ] (ngoài chuỗi). */
function removeTrailingCommas(text: string): string {
  let out = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      out += ch;
      continue;
    }
    if (ch === '"') inString = true;
    if (ch === ',') {
      const rest = text.slice(i + 1);
      if (/^\s*[}\]]/.test(rest)) continue;
    }
    out += ch;
  }
  return out;
}

/**
 * Sửa JSON bị cắt cụt: lùi về điểm cắt an toàn cuối cùng rồi tự đóng các ngoặc còn mở.
 * Phần tử đang viết dở bị loại bỏ; các phần tử đã hoàn chỉnh trước đó được giữ lại.
 */
function repairTruncatedJson(sanitized: string, lastSafe: JsonScanResult['lastSafe']): any {
  if (!lastSafe) throw new Error('unrepairable');
  const closers = [...lastSafe.stack].reverse().map((open) => (open === '[' ? ']' : '}')).join('');
  const candidate = sanitized.slice(0, lastSafe.pos).replace(/[\s,]+$/, '') + closers;
  return JSON.parse(removeTrailingCommas(candidate));
}

interface ParseContext {
  label?: string;
  model?: string;
  finishReason?: string;
  blockReason?: string;
  /** Cho phép trả về phần đã hoàn chỉnh của JSON bị cắt cụt (dùng cho danh sách câu hỏi) */
  allowPartial?: boolean;
}

interface ParseOutcome {
  data: any;
  /** true nếu dữ liệu được cứu từ JSON bị cắt cụt (có thể thiếu phần tử cuối) */
  repaired: boolean;
}

function describeParseFailure(text: string, ctx: ParseContext): string {
  if (!text.trim()) {
    if (ctx.blockReason || (ctx.finishReason && /SAFETY|PROHIBITED|BLOCKLIST|SPII|RECITATION/.test(ctx.finishReason))) {
      return `AI từ chối hoặc chặn nội dung (${ctx.blockReason || ctx.finishReason}). Vui lòng điều chỉnh yêu cầu rồi tạo lại đề.`;
    }
    return 'AI trả về phản hồi rỗng. Hệ thống không lưu đề lỗi; vui lòng tạo lại đề.';
  }
  if (ctx.finishReason === 'MAX_TOKENS') return JSON_TRUNCATED_ERROR;
  return JSON_FORMAT_ERROR;
}

/**
 * Extract JSON from Gemini's text response and parse safely.
 * Handles: raw JSON, ```json fenced, ```fenced, mixed text with JSON, LaTeX escapes,
 * raw control characters, trailing commas and (optionally) truncated output.
 */
function parseJsonResponse(text: string, ctx: ParseContext = {}): ParseOutcome {
  const raw = (text || '').replace(/^\uFEFF/, '').trim();
  const errors: string[] = [];

  if (raw) {
    // Các ứng viên vị trí bắt đầu JSON, theo thứ tự ưu tiên:
    // nội dung trong ```json fence``` (nếu có) → lần lượt từng dấu [ / { trong phản hồi.
    const candidates: string[] = [];
    const fenceOpen = raw.match(/```(?:json|JSON)?\s*/);
    if (fenceOpen && fenceOpen.index !== undefined) {
      const afterFence = raw.slice(fenceOpen.index + fenceOpen[0].length);
      const fenceClose = afterFence.lastIndexOf('```');
      candidates.push(fenceClose >= 0 ? afterFence.slice(0, fenceClose) : afterFence);
    }
    const bracketRegex = /[\[{]/g;
    let match: RegExpExecArray | null;
    while ((match = bracketRegex.exec(raw)) !== null && candidates.length < 40) {
      candidates.push(raw.slice(match.index));
    }

    let bestPartial: { sanitized: string; lastSafe: JsonScanResult['lastSafe'] } | null = null;

    for (const candidate of candidates) {
      const trimmed = candidate.trim();
      const firstBracket = trimmed.search(/[\[{]/);
      if (firstBracket < 0) continue;
      const sanitized = sanitizeLatexInJson(trimmed.slice(firstBracket));

      // Bước 1: parse trực tiếp
      try {
        return { data: JSON.parse(sanitized), repaired: false };
      } catch (e: any) {
        errors.push(`direct: ${e?.message}`);
      }

      // Bước 2: cắt đúng biên của giá trị JSON gốc (quét có nhận biết chuỗi)
      const scan = scanJsonValue(sanitized);
      if (scan.end >= 0) {
        const exact = sanitized.slice(0, scan.end + 1);
        try {
          return { data: JSON.parse(exact), repaired: false };
        } catch (e: any) {
          errors.push(`bounded: ${e?.message}`);
        }
        try {
          return { data: JSON.parse(removeTrailingCommas(exact)), repaired: false };
        } catch (e: any) {
          errors.push(`trailing-comma: ${e?.message}`);
        }
      } else if (/^[\[{]\s*["\[{\]}]/.test(sanitized)) {
        // JSON thật nhưng chưa đóng → bị cắt cụt. Dừng tại đây: các ứng viên phía sau
        // đều nằm BÊN TRONG giá trị này (vd câu hỏi đầu tiên), không được ưu tiên hơn
        // việc cứu toàn bộ mảng.
        bestPartial = { sanitized, lastSafe: scan.lastSafe };
        break;
      }
    }

    // Bước 3: cứu JSON bị cắt cụt (chỉ khi được phép)
    if (ctx.allowPartial && bestPartial) {
      try {
        const data = repairTruncatedJson(bestPartial.sanitized, bestPartial.lastSafe);
        console.warn(`[safeJsonParse] ${ctx.label || ''} JSON bị cắt cụt — đã cứu phần hoàn chỉnh.`, {
          model: ctx.model,
          finishReason: ctx.finishReason,
        });
        return { data, repaired: true };
      } catch (e: any) {
        errors.push(`repair: ${e?.message}`);
      }
    }
  }

  // Không "nuốt" lỗi chi tiết — log đầy đủ để chẩn đoán (F12 → Console)
  console.error(`[safeJsonParse] Không parse được phản hồi AI ${ctx.label ? `(${ctx.label})` : ''}`, {
    model: ctx.model,
    finishReason: ctx.finishReason,
    blockReason: ctx.blockReason,
    length: raw.length,
    head: raw.slice(0, 300),
    tail: raw.slice(-300),
    attempts: errors,
  });
  throw new Error(describeParseFailure(raw, ctx));
}

function safeJsonParse(text: string, ctx: ParseContext = {}): any {
  return parseJsonResponse(text, ctx).data;
}

// ============================================================
// RESILIENT GENERATION HELPERS
// ============================================================

/** Chuẩn hoá dữ liệu parse được thành mảng câu hỏi ({questions:[...]}, object đơn, ...). */
function toQuestionArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    for (const key of ['questions', 'items', 'data', 'exam', 'result']) {
      if (Array.isArray(data[key])) return data[key];
    }
    if (data.question_en || data.question_vi) return [data];
  }
  return [];
}

/** Câu hỏi đủ dùng: có đề, có đáp án, có lời giải; câu trắc nghiệm phải có phương án. */
function isUsableQuestion(q: any): boolean {
  if (!q || typeof q !== 'object') return false;
  const hasStatement = typeof (q.question_en || q.question_vi) === 'string' && String(q.question_en || q.question_vi).trim().length > 0;
  const hasAnswer = q.correct_answer !== undefined && q.correct_answer !== null && String(q.correct_answer).trim().length > 0;
  const hasSolution = Boolean(q.solution_en || q.solution_vi);
  const optionsOk = q.part !== 'PART_1' || (Array.isArray(q.options_en) && q.options_en.length >= 2);
  return hasStatement && hasAnswer && hasSolution && optionsOk;
}

/** Chia [1..total] thành các khoảng liên tiếp, mỗi khoảng tối đa `size` câu. */
function chunkRanges(total: number, size: number): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  for (let start = 1; start <= total; start += size) {
    ranges.push([start, Math.min(total, start + size - 1)]);
  }
  return ranges;
}

/** Chạy các tác vụ với giới hạn song song (tránh dồn hàng chục request → 429 quota). Fail-fast. */
async function runWithConcurrency<T>(tasks: Array<() => Promise<T>>, limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  let failed = false;
  const worker = async () => {
    while (!failed && next < tasks.length) {
      const index = next++;
      try {
        results[index] = await tasks[index]();
      } catch (err) {
        failed = true;
        throw err;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, tasks.length)) }, worker));
  return results;
}

interface QuestionRangeOptions {
  label: string;
  buildPrompt: (start: number, end: number) => string;
  systemInstruction: string;
  maxOutputTokens: number;
  onModelSwitch?: (from: string, to: string, reason: string) => void;
}

const MAX_RANGE_DEPTH = 4;
const ATTEMPTS_PER_RANGE = 2;

/**
 * Sinh các câu [start..end] một cách bền vững:
 * - Đọc finishReason: nếu MAX_TOKENS → chia đôi khoảng ngay thay vì báo lỗi.
 * - JSON bị cắt → giữ các câu hoàn chỉnh, chỉ sinh bổ sung phần còn thiếu.
 * - Lỗi parse / thiếu câu → thử lại riêng khoảng này (không làm sập cả đề).
 * - Lỗi tầng API (key, quota...) → ném ngay, không retry.
 */
async function generateQuestionRange(
  start: number,
  end: number,
  opts: QuestionRangeOptions,
  depth = 0,
): Promise<any[]> {
  const expected = end - start + 1;
  const attempts = expected === 1 ? ATTEMPTS_PER_RANGE + 1 : ATTEMPTS_PER_RANGE;
  const label = `${opts.label} câu ${start}-${end}`;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    // Lỗi API ném ra từ đây sẽ không bị bắt → dừng ngay (đúng quy chuẩn api.md)
    const result = await generateContentWithFallback({
      contents: opts.buildPrompt(start, end),
      systemInstruction: opts.systemInstruction,
      responseMimeType: 'application/json',
      maxOutputTokens: opts.maxOutputTokens,
      onModelSwitch: opts.onModelSwitch,
    });
    const truncated = result.finishReason === 'MAX_TOKENS';

    let usable: any[] = [];
    let attemptError: Error | null = null;
    try {
      const { data } = parseJsonResponse(result.text, {
        label,
        model: result.model,
        finishReason: result.finishReason,
        blockReason: result.blockReason,
        allowPartial: true,
      });
      usable = toQuestionArray(data).filter(isUsableQuestion);
    } catch (err: any) {
      attemptError = err instanceof Error ? err : new Error(String(err));
    }

    if (usable.length > expected) {
      // Model sinh thừa (bỏ qua chỉ thị khoảng) → ưu tiên các câu có order_index thuộc khoảng
      const inRange = usable
        .filter((q) => Number(q.order_index) >= start && Number(q.order_index) <= end)
        .sort((a, b) => Number(a.order_index) - Number(b.order_index));
      usable = inRange.length >= expected ? inRange : usable;
    }
    if (usable.length >= expected) return usable.slice(0, expected);

    if (usable.length > 0 && depth < MAX_RANGE_DEPTH) {
      console.warn(`[generate] ${label}: nhận ${usable.length}/${expected} câu${truncated ? ' (MAX_TOKENS)' : ''} — sinh bổ sung phần còn thiếu.`);
      const rest = await generateQuestionRange(start + usable.length, end, opts, depth + 1);
      return [...usable, ...rest];
    }

    lastError = attemptError ?? new Error(truncated ? JSON_TRUNCATED_ERROR : QUESTION_COUNT_ERROR);
    console.warn(`[generate] ${label}: lần ${attempt}/${attempts} thất bại`, {
      model: result.model,
      finishReason: result.finishReason,
      error: lastError.message,
    });

    // Biết chắc bị cắt vì hết token → chia nhỏ ngay, lặp lại cùng kích thước là vô ích
    if (truncated && expected > 1) break;
  }

  if (expected > 1 && depth < MAX_RANGE_DEPTH) {
    const mid = start + Math.floor(expected / 2) - 1;
    console.warn(`[generate] ${label}: chia nhỏ thành ${start}-${mid} và ${mid + 1}-${end}.`);
    const left = await generateQuestionRange(start, mid, opts, depth + 1);
    const right = await generateQuestionRange(mid + 1, end, opts, depth + 1);
    return [...left, ...right];
  }

  throw lastError ?? new Error(JSON_FORMAT_ERROR);
}

/** Gọi AI trả về JSON (object đơn) với retry khi parse thất bại. */
async function generateJsonWithRetry(
  options: GenerateContentOptions,
  label: string,
  attempts = 2,
): Promise<any> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const result = await generateContentWithFallback({ ...options, responseMimeType: 'application/json' });
    try {
      return safeJsonParse(result.text, {
        label,
        model: result.model,
        finishReason: result.finishReason,
        blockReason: result.blockReason,
      });
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[generate] ${label}: lần ${attempt}/${attempts} thất bại`, {
        model: result.model,
        finishReason: result.finishReason,
      });
    }
  }
  throw lastError ?? new Error(JSON_FORMAT_ERROR);
}

// ============================================================
// HIGH-LEVEL API FUNCTIONS
// ============================================================

/** Một câu trong khung đề (xem src/data/examYearFolders.ts) */
export interface ExamBlueprintSlot {
  order: number;
  label: string;
  part: string;
  strand: string;
  topic_en: string;
  difficulty: string;
  pattern_en: string;
  real_world?: boolean;
  replacement?: { name_en: string; name_vi?: string };
}

/** Generate a full 22-question exam or custom topical test */
export const generateExam = async (params: {
  topicPrompt?: string;
  mode?: string;
  examType?: string;
  questionCount?: number;
  customDocumentText?: string;
  /** Khung đề từng câu (thư mục đề theo năm học) — khi có, thay thế quy tắc 3–4 mặc định */
  blueprint?: ExamBlueprintSlot[];
  /** Hướng sinh đề theo khung: tương tự / dạng toán khác / bổ sung dạng toán */
  yearVariant?: 'similar' | 'different' | 'extended';
  schoolYear?: string;
  onModelSwitch?: (from: string, to: string, reason: string) => void;
}): Promise<any[]> => {
  const {
    topicPrompt = '',
    mode = 'bilingual',
    examType = 'haiphong_matrix',
    questionCount = 22,
    customDocumentText = '',
    blueprint,
    yearVariant,
    schoolYear,
    onModelSwitch,
  } = params;
  const useBlueprint = Array.isArray(blueprint) && blueprint.length === questionCount;

  const levelName = (d: string) =>
    d === 'understanding' ? 'Understanding' : d === 'application' ? 'Application' : 'Advanced (high-order)';
  const variantRule = (slot: ExamBlueprintSlot) => {
    if (slot.replacement) {
      return `NEW PROBLEM TYPE (supplement): write a problem on "${slot.replacement.name_en}" — keep the same part, strand and cognitive level; do NOT reuse the original pattern.`;
    }
    if (yearVariant === 'different') {
      return 'DIFFERENT PROBLEM TYPE: same strand, part and cognitive level, but choose a clearly different problem type / technique from the original pattern (still within the Grade 10-11 GDPT 2018 syllabus).';
    }
    return 'SIMILAR: keep exactly the same problem type, technique and difficulty as the original pattern, but use new numbers, a new context and a new answer (never copy the original).';
  };
  const buildBlueprintBlock = (start: number, end: number) => {
    if (!useBlueprint) return '';
    const lines = blueprint!
      .filter((slot) => slot.order >= start && slot.order <= end)
      .map(
        (slot) =>
          `- Question ${slot.order} (original ${slot.label}) | ${slot.part} | strand: ${slot.strand} | level: ${levelName(slot.difficulty)} | topic: ${slot.topic_en}${slot.real_world ? ' | real-world context' : ''}\n    Original pattern: ${slot.pattern_en}\n    Requirement: ${variantRule(slot)}`,
      )
      .join('\n');
    return `
REFERENCE EXAM: Official Hai Phong DOET exam 2025-2026 (Code 901). You are writing the ${schoolYear || '2026-2027'} exam.
QUESTION-BY-QUESTION BLUEPRINT FOR THIS BATCH (follow it exactly; it OVERRIDES rules 3 and 4 below):
${lines}
- Set "difficulty" and "strand" of every question exactly as given in the blueprint.
- PART_2 short answers should have at most 4 characters when possible (integer, or decimal rounded as the problem states).`;
  };

  const buildPrompt = (start: number, end: number) => {
    const batchCount = end - start + 1;
    return `Task: Generate an authentic High School Math Olympiad examination strictly adhering to the 2025 Hai Phong Department of Education and Training (Sở GD&ĐT Hải Phòng) contest matrix.
Exam Type: ${examType}
Language Mode: ${mode}
Full exam size: ${questionCount} questions.
THIS REQUEST: generate ONLY questions ${start} to ${end} (exactly ${batchCount} question objects, order_index ${start}..${end}). Other questions are generated separately — do NOT output them.
${topicPrompt ? `Focus Topic / Custom Instruction: ${topicPrompt}` : ''}
${customDocumentText ? `Reference Material / Document Context:\n${customDocumentText.slice(0, 4000)}` : ''}
${buildBlueprintBlock(start, end)}

CRITICAL RULES FOR HAI PHONG OLYMPIAD 2025 MATRIX:
1. Question 1 to 12 MUST BE PART_1 (Multiple Choice with 4 options A, B, C, D in options_en).
2. Question 13 to 22 MUST BE PART_2 (Short Answer with concise numerical or simplified fraction string in correct_answer).
3. Exactly follow cognitive distribution:
   - Part I (Q1-12): 5 Understanding, 5 Application, 2 Advanced.
   - Part II (Q13-22): 3 Understanding, 4 Application, 3 Advanced (Q15, Q16 and Q20 are the three high-order thinking questions; Q21 is Understanding, Q22 is Application).
   - Part I advanced questions: Q5 (algebra/calculus) and Q10 (geometry); Q11 Understanding, Q12 Application.
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
6. LENGTH LIMIT: keep each solution concise — at most 6 logical steps and about 160 words per language.

Output Schema:
A valid JSON array containing exactly ${batchCount} question objects (order_index ${start} to ${end}):
[
  {
    "order_index": number (${start} to ${end}),
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
- Wrap every formula in $ delimiters, including options: raw JSON "A. $6\\\\sqrt{5}$", NOT "A. 6\\\\sqrt{5}".
- Follow the JSON + LaTeX escaping rules from the system instruction exactly (raw JSON "$\\\\frac{a}{b}$" — one escaped backslash, never four).
- Return ONLY the JSON array.`;
  };

  // Chia nhỏ ngay từ đầu (≈5-6 câu / lời gọi) để tránh vượt maxOutputTokens khi sinh song ngữ
  const ranges: Array<[number, number]> = examType === 'haiphong_matrix' && questionCount === 22
    ? [[1, 6], [7, 12], [13, 17], [18, 22]]
    : chunkRanges(questionCount, 6);

  const rangeOptions: QuestionRangeOptions = {
    label: 'Đề thi',
    buildPrompt,
    systemInstruction: HAIPHONG_SYSTEM_INSTRUCTION,
    // Gồm cả token suy luận (thinkingLevel MEDIUM) — để rộng tránh MAX_TOKENS
    maxOutputTokens: 65536,
    onModelSwitch,
  };

  const batches = await runWithConcurrency(
    ranges.map(([start, end]) => () => generateQuestionRange(start, end, rangeOptions)),
    4,
  );

  const questions = batches.flat();
  if (questions.length !== questionCount) {
    throw new Error(QUESTION_COUNT_ERROR);
  }
  return questions.map((question, index) => ({ ...question, order_index: index + 1 }));
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

Return ONLY a valid JSON object matching this schema.
Write ALL math formulas directly as standard LaTeX in $...$ or $$...$$, escaped per the JSON + LaTeX rules in the system instruction.`;

  return generateJsonWithRetry({
    contents: prompt,
    systemInstruction: HAIPHONG_SYSTEM_INSTRUCTION,
    maxOutputTokens: 32768,
    onModelSwitch,
  }, 'Bài học');
};

export type TopicQuestionType = 'mcq' | 'short_answer' | 'true_false' | 'mixed';
export type TopicDifficulty = 'understanding' | 'application' | 'advanced' | 'mixed';

export interface GenerateTopicPracticeParams {
  topic: string;
  mode?: string;
  count?: number;
  questionType?: TopicQuestionType;
  specificProblemTypes?: string;
  difficulty?: TopicDifficulty;
  strand?: string;
  onModelSwitch?: (from: string, to: string, reason: string) => void;
}

/** Số câu mỗi lời gọi khi sinh đề chuyên đề */
const TOPIC_BATCH_SIZE = 3;

/** Generate custom topical practice quiz using AI with full question format control */
export const generateTopicPractice = async (params: GenerateTopicPracticeParams): Promise<any[]> => {
  const {
    topic,
    mode = 'bilingual',
    count = 6,
    questionType = 'mixed',
    specificProblemTypes = '',
    difficulty = 'mixed',
    strand = 'algebra_calculus',
    onModelSwitch,
  } = params;

  const totalBatches = Math.ceil(count / TOPIC_BATCH_SIZE);

  const buildPrompt = (start: number, end: number) => {
    const batchCount = end - start + 1;
    const batchIndex = Math.floor((start - 1) / TOPIC_BATCH_SIZE) + 1;

    let formatInstruction = '';
    if (questionType === 'mcq') {
      formatInstruction = `FORMAT: ALL ${batchCount} questions MUST BE PART_1 (Multiple Choice with 4 options A, B, C, D).
- "part": "PART_1"
- "options_en": ["A. $...$", "B. $...$", "C. $...$", "D. $...$"] (English math options, ALWAYS enclose formulas in $...$)
- "correct_answer": "A", "B", "C", or "D"`;
    } else if (questionType === 'short_answer') {
      formatInstruction = `FORMAT: ALL ${batchCount} questions MUST BE PART_2 (Short Answer - student calculates and inputs number/fraction).
- "part": "PART_2"
- "options_en": null
- "correct_answer": concise numerical value, integer, simplified fraction like "a/b", or decimal string
- "acceptable_answers": [array of equivalent forms, e.g. ["1/2", "0.5"]]`;
    } else if (questionType === 'true_false') {
      formatInstruction = `FORMAT: ALL ${batchCount} questions MUST BE True/False Mathematical Propositions (Đúng / Sai).
- Each question presents a profound mathematical assertion, inequality, property, or convergence claim related to "${topic}".
- "part": "PART_1"
- "options_en": ["A. Đúng (True)", "B. Sai (False)"]
- "correct_answer": "A" (if True) or "B" (if False)
- In "solution_en" and "solution_vi", explain rigorously WHY it is True or furnish a clear counterexample demonstrating why it is False.`;
    } else {
      // Mixed format
      formatInstruction = `FORMAT: MIX OF QUESTION TYPES distributed evenly among:
1. Multiple Choice (PART_1 with 4 options A, B, C, D)
2. True/False Propositions (PART_1 with options_en: ["A. Đúng (True)", "B. Sai (False)"] and correct_answer "A" or "B")
3. Short Answer (PART_2 with options_en: null and correct_answer as exact number/fraction)`;
    }

    let difficultyInstruction = '';
    if (difficulty === 'understanding') {
      difficultyInstruction = 'COGNITIVE LEVEL: Understanding (Thông hiểu - concepts, fundamental formulas, direct applications).';
    } else if (difficulty === 'application') {
      difficultyInstruction = 'COGNITIVE LEVEL: Application (Vận dụng - multi-step problem solving, standard competition methods).';
    } else if (difficulty === 'advanced') {
      difficultyInstruction = 'COGNITIVE LEVEL: Advanced / Olympiad (Vận dụng cao - profound high-school Olympiad level, ingenious transformations, extremal reasoning).';
    } else {
      difficultyInstruction = 'COGNITIVE LEVEL: Balanced mix of Application (60%) and Advanced / Olympiad (40%).';
    }

    const batchNote = totalBatches > 1
      ? `\nBATCH NOTE: This request is part ${batchIndex} of ${totalBatches} of a larger set generated in parallel. Choose distinct sub-types, contexts and numbers (avoid the most common textbook example) so this part does not duplicate the others.\n`
      : '';

    return `Task: Generate a brand new, authentic set of exactly ${batchCount} math practice questions strictly on the topic: "${topic}".
${batchNote}
${formatInstruction}

${difficultyInstruction}

${specificProblemTypes ? `SPECIFIC PROBLEM TYPES (must follow when generating): ${specificProblemTypes}` : 'No specific problem types were provided; choose the most relevant subtypes for the topic.'}

CRITICAL RULES:
1. ALL questions MUST BE 100% newly crafted, creative, and mathematically rigorous. Do NOT copy plain trivial examples.
2. Subject topic: "${topic}". Target strand: "${strand}".
3. Language mode: ${mode}.
   - In bilingual mode: "question_en" has English problem statement, "question_vi" has faithful Vietnamese translation.
   - For PART_1 MCQ options: English only.
   - Both "solution_en" and "solution_vi" must supply clear, step-by-step mathematical reasoning.
4. Use standard KaTeX $...$ for inline and $$...$$ for display formulas.
5. In JSON strings, escape LaTeX exactly once per the system instruction: raw JSON "$\\\\frac{a}{b}$", "$\\\\sqrt{x}$" (never four backslashes, never a lone backslash).
6. CRITICAL FOR OPTIONS: In "options_en", ALWAYS wrap all mathematical formulas and expressions in KaTeX dollar signs $...$, for example raw JSON: ["A. $\\\\frac{64\\\\sqrt{3}}{9}$", "B. $\\\\frac{32\\\\sqrt{3}}{9}$", ...]. Never output naked LaTeX without $...$ delimiters!
7. Keep each solution_en and solution_vi concise: maximum 4 logical steps and about 90 words per language.
8. Each question object schema:
{
  "id": "quiz-q-1",
  "order_index": 1,
  "part": "PART_1" | "PART_2",
  "strand": "${strand}",
  "topic": "${topic}",
  "difficulty": "understanding" | "application" | "advanced",
  "question_en": string,
  "question_vi": string,
  "options_en": ["A. $...$", "B. $...$", "C. $...$", "D. $...$"] | ["A. Đúng (True)", "B. Sai (False)"] | null,
  "correct_answer": string,
  "acceptable_answers": string[],
  "hints": ["Hint 1", "Hint 2"],
  "solution_en": string,
  "solution_vi": string
}

Output: Return ONLY the raw valid JSON array of ${batchCount} question objects. Do not use Markdown, code fences, commentary, or trailing text.`;
  };

  const rangeOptions: QuestionRangeOptions = {
    label: 'Chuyên đề',
    buildPrompt,
    systemInstruction: HAIPHONG_SYSTEM_INSTRUCTION,
    maxOutputTokens: 16384,
    onModelSwitch,
  };

  const batches = await runWithConcurrency(
    chunkRanges(count, TOPIC_BATCH_SIZE).map(([start, end]) => () => generateQuestionRange(start, end, rangeOptions)),
    4,
  );

  const questions = batches.flat();
  if (questions.length !== count) {
    throw new Error(QUESTION_COUNT_ERROR);
  }
  // Luôn gán id/order_index mới — id do model tự đặt bị trùng giữa các batch ("quiz-q-1"...)
  return questions.map((question, index) => ({
    ...question,
    id: `quiz-q-${index + 1}`,
    order_index: index + 1,
  }));
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

Output JSON format (single question object, NOT an array):
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

  const data = await generateJsonWithRetry({
    contents: prompt,
    systemInstruction: HAIPHONG_SYSTEM_INSTRUCTION,
    maxOutputTokens: 16384,
    onModelSwitch,
  }, `Đổi câu ${originalQuestion.order_index}`);

  const parsed = Array.isArray(data) ? data[0] : data;
  if (!parsed || typeof parsed !== 'object' || !(parsed.question_en || parsed.question_vi)) {
    throw new Error(QUESTION_COUNT_ERROR);
  }

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

  return generateJsonWithRetry({
    contents: prompt,
    systemInstruction: `You are an elite IMO reviewer and mathematical editor. Keep LaTeX in standard $...$ and $$...$$.\n\n${JSON_LATEX_RULES}`,
    maxOutputTokens: 16384,
    thinkingLevel: ThinkingLevel.LOW,
    onModelSwitch,
  }, 'Chấm chứng minh');
};
