/**
 * API Key Manager — Quản lý API Key cho Gemini API và Agent Platform API
 * Theo quy chuẩn api.md (v4.3 — 24/10/2026):
 * - Lưu key riêng cho từng dịch vụ (gemini_api_key / agent_platform_api_key)
 * - Không tự suy đoán provider từ tiền tố key
 * - Chấp nhận cả AIza... và AQ... (key mới có thể chứa dấu chấm)
 * - Di trú khóa lưu model khi đổi model mặc định (mục V.1)
 */

export type AiProvider = 'gemini' | 'agent-platform';

// Storage keys
const STORAGE_KEYS = {
  GEMINI_API_KEY: 'gemini_api_key',
  AGENT_PLATFORM_API_KEY: 'agent_platform_api_key',
  PROVIDER: 'google_ai_provider',
  PROVIDER_SOURCE: 'google_ai_provider_selection_source',
  // Đổi hậu tố khi nâng model mặc định để trình duyệt cũ không kẹt ở model đã lưu trước đó
  SELECTED_MODEL: 'hp_math_selected_model_v38',
};

/** Khóa lưu model của các bản trước — xóa khi khởi tạo (api.md mục V.1). */
const LEGACY_MODEL_STORAGE_KEYS = ['hp_math_selected_model', 'GEMINI_MODEL_ID'];

// Key validation pattern — accepts AIza... and AQ... / AQ. (api.md mục VII.4)
export const GOOGLE_AI_API_KEY_PATTERN = /^(?:AIza|AQ)[\w.\-]{20,}$/;

export const isValidGoogleAiApiKey = (key: string): boolean => {
  return GOOGLE_AI_API_KEY_PATTERN.test((key || '').trim());
};

/** Che key khi cần hiển thị: tiền tố + 4 ký tự cuối (không bao giờ log full key). */
export const maskApiKey = (key: string): string => {
  const k = (key || '').trim();
  if (k.length <= 10) return '•'.repeat(k.length);
  return `${k.slice(0, 4)}${'•'.repeat(Math.min(12, k.length - 8))}${k.slice(-4)}`;
};

export const GEMINI_API_KEY_URL = 'https://aistudio.google.com/apikey';
export const AGENT_PLATFORM_API_KEY_URL = 'https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/api-keys';

export interface ModelOption {
  id: string;
  label: string;
  note: string;
}

// Model hiển thị trong Cài đặt — Gemini API (api.md mục I, cập nhật 24/10/2026:
// bỏ gemini-3.5-flash / gemini-3.7-flash vì đã deprecated, dòng 2.5 chỉ để cuối chuỗi)
export const GEMINI_MODEL_OPTIONS: readonly ModelOption[] = [
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', note: 'Mặc định — mạnh nhất, chịu tải tốt' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite', note: 'Rất nhanh, rẻ, ít quá tải' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', note: 'Dự phòng cân bằng' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', note: 'Tương thích ngược' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', note: 'Chỉ key cũ đã từng dùng 2.5' },
];

export const AGENT_PLATFORM_MODEL_OPTIONS: readonly ModelOption[] = [
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', note: 'Mặc định' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', note: 'Dự phòng cân bằng' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite', note: 'Nhanh, rẻ' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', note: 'Tương thích endpoint cũ' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', note: 'Suy luận mạnh (trả phí)' },
];

export const GEMINI_MODELS = GEMINI_MODEL_OPTIONS.map((m) => m.id);
export const AGENT_PLATFORM_MODELS = AGENT_PLATFORM_MODEL_OPTIONS.map((m) => m.id);

export const GEMINI_DEFAULT_MODEL = 'gemini-3.8-flash';
export const AGENT_PLATFORM_DEFAULT_MODEL = 'gemini-3.8-flash';

// Fallback model chains (api.md mục II + VII.9). gemini-flash-latest là mắt xích
// dự phòng để app vẫn chạy khi các ID cụ thể bị ngừng — không dùng làm mặc định.
export const GEMINI_FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-2.5-flash',
] as const;

export const AGENT_PLATFORM_FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
] as const;

/** Sự kiện phát ra khi key/provider/model thay đổi để header cập nhật trạng thái. */
export const API_CONFIG_CHANGED_EVENT = 'hp-api-config-changed';

const notifyConfigChanged = () => {
  try {
    window.dispatchEvent(new Event(API_CONFIG_CHANGED_EVENT));
  } catch {
    // ignore (SSR / test)
  }
};

let migrated = false;
const migrateLegacyStorage = () => {
  if (migrated) return;
  migrated = true;
  try {
    for (const key of LEGACY_MODEL_STORAGE_KEYS) localStorage.removeItem(key);
    // Bản cũ có thể lưu provider 'vertex' → về Gemini, yêu cầu người dùng chọn lại (api.md mục III)
    const provider = localStorage.getItem(STORAGE_KEYS.PROVIDER);
    if (provider && provider !== 'gemini' && provider !== 'agent-platform') {
      localStorage.setItem(STORAGE_KEYS.PROVIDER, 'gemini');
      localStorage.removeItem(STORAGE_KEYS.PROVIDER_SOURCE);
    }
  } catch {
    // localStorage bị chặn — bỏ qua
  }
};

export const apiKeyManager = {
  // Get current provider
  getProvider(): AiProvider {
    migrateLegacyStorage();
    const saved = localStorage.getItem(STORAGE_KEYS.PROVIDER);
    return saved === 'agent-platform' ? 'agent-platform' : 'gemini';
  },

  // Set provider (manual selection only)
  setProvider(provider: AiProvider): void {
    localStorage.setItem(STORAGE_KEYS.PROVIDER, provider);
    localStorage.setItem(STORAGE_KEYS.PROVIDER_SOURCE, 'manual');
    notifyConfigChanged();
  },

  // Get API key for current provider
  getApiKey(provider?: AiProvider): string {
    const p = provider || this.getProvider();
    const key = p === 'agent-platform'
      ? localStorage.getItem(STORAGE_KEYS.AGENT_PLATFORM_API_KEY)
      : localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY);
    return (key || '').trim();
  },

  // Set API key for a specific provider
  setApiKey(key: string, provider: AiProvider): void {
    const storageKey = provider === 'agent-platform'
      ? STORAGE_KEYS.AGENT_PLATFORM_API_KEY
      : STORAGE_KEYS.GEMINI_API_KEY;
    localStorage.setItem(storageKey, key.trim());
    notifyConfigChanged();
  },

  // Remove API key (máy dùng chung / phòng tin học)
  clearApiKey(provider: AiProvider): void {
    localStorage.removeItem(
      provider === 'agent-platform' ? STORAGE_KEYS.AGENT_PLATFORM_API_KEY : STORAGE_KEYS.GEMINI_API_KEY,
    );
    notifyConfigChanged();
  },

  // Check if API key is configured
  hasApiKey(provider?: AiProvider): boolean {
    return isValidGoogleAiApiKey(this.getApiKey(provider));
  },

  getDefaultModel(provider?: AiProvider): string {
    return (provider || this.getProvider()) === 'agent-platform' ? AGENT_PLATFORM_DEFAULT_MODEL : GEMINI_DEFAULT_MODEL;
  },

  // Get selected model (đã chuẩn hóa theo provider)
  getSelectedModel(provider?: AiProvider): string {
    migrateLegacyStorage();
    const p = provider || this.getProvider();
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || '';
    const allowed = p === 'agent-platform' ? AGENT_PLATFORM_MODELS : GEMINI_MODELS;
    return allowed.includes(saved) ? saved : this.getDefaultModel(p);
  },

  // Set selected model
  setSelectedModel(model: string): void {
    localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, model);
    notifyConfigChanged();
  },

  // Get ordered fallback models (user's choice first, then chain, no duplicates)
  getOrderedFallbackModels(selectedModel?: string, provider?: AiProvider): string[] {
    const p = provider || this.getProvider();
    const chain: string[] = p === 'agent-platform'
      ? [...AGENT_PLATFORM_FALLBACK_MODELS]
      : [...GEMINI_FALLBACK_MODELS];
    const preferred = selectedModel?.trim() || this.getSelectedModel(p);
    return [preferred, ...chain].filter((m, i, arr) => Boolean(m) && arr.indexOf(m) === i);
  },

  // Get available models for a provider
  getModelOptions(provider?: AiProvider): readonly ModelOption[] {
    return (provider || this.getProvider()) === 'agent-platform' ? AGENT_PLATFORM_MODEL_OPTIONS : GEMINI_MODEL_OPTIONS;
  },
};
