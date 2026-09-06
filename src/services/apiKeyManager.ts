/**
 * API Key Manager — Quản lý API Key cho Gemini API và Agent Platform API
 * Theo quy chuẩn api.md:
 * - Lưu key riêng cho từng dịch vụ
 * - Không tự suy đoán provider từ tiền tố key
 * - Chấp nhận cả AIzaSy... và AQ...
 */

export type AiProvider = 'gemini' | 'agent-platform';

// Storage keys
const STORAGE_KEYS = {
  GEMINI_API_KEY: 'gemini_api_key',
  AGENT_PLATFORM_API_KEY: 'agent_platform_api_key',
  PROVIDER: 'google_ai_provider',
  PROVIDER_SOURCE: 'google_ai_provider_selection_source',
  SELECTED_MODEL: 'hp_math_selected_model',
};

// Key validation pattern — accepts AIzaSy... and AQ...
export const GOOGLE_AI_API_KEY_PATTERN = /^(?:AIzaSy|AQ)\S{8,}$/;

export const isValidGoogleAiApiKey = (key: string): boolean => {
  return GOOGLE_AI_API_KEY_PATTERN.test(key.trim());
};

// Default models per provider
export const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
] as const;

export const AGENT_PLATFORM_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
  'gemini-3.1-pro-preview',
] as const;

export const GEMINI_DEFAULT_MODEL = 'gemini-3.6-flash';
export const AGENT_PLATFORM_DEFAULT_MODEL = 'gemini-2.5-flash';

// Fallback model chains
export const GEMINI_FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
] as const;

export const AGENT_PLATFORM_FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
] as const;

export const apiKeyManager = {
  // Get current provider
  getProvider(): AiProvider {
    return (localStorage.getItem(STORAGE_KEYS.PROVIDER) as AiProvider) || 'gemini';
  },

  // Set provider (manual selection only)
  setProvider(provider: AiProvider): void {
    localStorage.setItem(STORAGE_KEYS.PROVIDER, provider);
    localStorage.setItem(STORAGE_KEYS.PROVIDER_SOURCE, 'manual');
  },

  // Get API key for current provider
  getApiKey(provider?: AiProvider): string {
    const p = provider || this.getProvider();
    if (p === 'agent-platform') {
      return localStorage.getItem(STORAGE_KEYS.AGENT_PLATFORM_API_KEY) || '';
    }
    return localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || '';
  },

  // Set API key for a specific provider
  setApiKey(key: string, provider: AiProvider): void {
    if (provider === 'agent-platform') {
      localStorage.setItem(STORAGE_KEYS.AGENT_PLATFORM_API_KEY, key.trim());
    } else {
      localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key.trim());
    }
  },

  // Check if API key is configured
  hasApiKey(provider?: AiProvider): boolean {
    const key = this.getApiKey(provider);
    return key.length > 0 && isValidGoogleAiApiKey(key);
  },

  // Get selected model
  getSelectedModel(): string {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
    const provider = this.getProvider();
    if (saved) {
      // Validate model is compatible with current provider
      if (provider === 'agent-platform') {
        if ((AGENT_PLATFORM_MODELS as readonly string[]).includes(saved)) return saved;
        return AGENT_PLATFORM_DEFAULT_MODEL;
      }
      return saved;
    }
    return provider === 'agent-platform' ? AGENT_PLATFORM_DEFAULT_MODEL : GEMINI_DEFAULT_MODEL;
  },

  // Set selected model
  setSelectedModel(model: string): void {
    localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, model);
  },

  // Get ordered fallback models (user's choice first, then chain)
  getOrderedFallbackModels(selectedModel?: string): string[] {
    const provider = this.getProvider();
    const chain = provider === 'agent-platform'
      ? [...AGENT_PLATFORM_FALLBACK_MODELS]
      : [...GEMINI_FALLBACK_MODELS];

    const model = selectedModel || this.getSelectedModel();
    if (model && !chain.includes(model)) {
      return [model, ...chain];
    }
    if (model && chain.includes(model)) {
      return [model, ...chain.filter(m => m !== model)];
    }
    return chain;
  },

  // Get available models for current provider
  getAvailableModels(): readonly string[] {
    return this.getProvider() === 'agent-platform' ? AGENT_PLATFORM_MODELS : GEMINI_MODELS;
  },
};
