/**
 * Settings Modal — API Key, Model, Firebase Configuration
 * Theo quy chuẩn api.md:
 * - Hai tab: Gemini API và Agent Platform API — người dùng tự chọn dịch vụ
 * - Key lưu riêng, không ghi đè nhau; không suy đoán provider từ tiền tố key
 * - Validate key format: AIza... và AQ...; nút "Kiểm tra key" gọi validateApiKey
 * - Chọn model dạng thẻ; nút "Xóa key" cho máy dùng chung
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Settings,
  Zap,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Database,
  Trash2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import {
  apiKeyManager,
  AiProvider,
  isValidGoogleAiApiKey,
  GEMINI_API_KEY_URL,
  AGENT_PLATFORM_API_KEY_URL,
} from '../services/apiKeyManager';
import { validateApiKey, ValidateApiKeyResult } from '../services/geminiService';
import { getFirebaseConfig } from '../lib/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = AiProvider | 'firebase';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('gemini');
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>('gemini');

  const [keys, setKeys] = useState<Record<AiProvider, string>>({ gemini: '', 'agent-platform': '' });
  const [models, setModels] = useState<Record<AiProvider, string>>({
    gemini: apiKeyManager.getDefaultModel('gemini'),
    'agent-platform': apiKeyManager.getDefaultModel('agent-platform'),
  });
  const [showKey, setShowKey] = useState(false);

  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<ValidateApiKeyResult | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  // Load saved values
  useEffect(() => {
    if (!isOpen) return;
    const provider = apiKeyManager.getProvider();
    setSelectedProvider(provider);
    setActiveTab(provider);
    setKeys({
      gemini: apiKeyManager.getApiKey('gemini'),
      'agent-platform': apiKeyManager.getApiKey('agent-platform'),
    });
    setModels({
      gemini: apiKeyManager.getSelectedModel('gemini'),
      'agent-platform': apiKeyManager.getSelectedModel('agent-platform'),
    });
    setShowKey(false);
    setCheckResult(null);
    setSaveMessage('');
    setSaveError('');
  }, [isOpen]);

  const currentProvider: AiProvider = activeTab === 'agent-platform' ? 'agent-platform' : 'gemini';
  const currentKey = keys[currentProvider];
  const keyFormatOk = isValidGoogleAiApiKey(currentKey);

  const updateKey = (value: string) => {
    setKeys((prev) => ({ ...prev, [currentProvider]: value }));
    setCheckResult(null);
    setSaveError('');
  };

  const handleCheckKey = async () => {
    setChecking(true);
    setCheckResult(null);
    try {
      const result = await validateApiKey(currentKey, currentProvider, models[currentProvider]);
      setCheckResult(result);
      if (result.ok && result.workingModel && result.workingModel !== models[currentProvider]) {
        const allowed = apiKeyManager.getModelOptions(currentProvider).some((m) => m.id === result.workingModel);
        if (allowed) setModels((prev) => ({ ...prev, [currentProvider]: result.workingModel! }));
      }
    } finally {
      setChecking(false);
    }
  };

  const handleClearKey = () => {
    apiKeyManager.clearApiKey(currentProvider);
    setKeys((prev) => ({ ...prev, [currentProvider]: '' }));
    setCheckResult(null);
    setSaveMessage('Đã xóa key khỏi trình duyệt này.');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleSave = () => {
    setSaveError('');
    const providerKey = keys[selectedProvider].trim();
    if (!providerKey) {
      setSaveError(`Chưa nhập API key cho ${selectedProvider === 'gemini' ? 'Gemini API' : 'Agent Platform API'} (dịch vụ đang chọn).`);
      setActiveTab(selectedProvider);
      return;
    }
    for (const p of ['gemini', 'agent-platform'] as AiProvider[]) {
      const k = keys[p].trim();
      if (k && !isValidGoogleAiApiKey(k)) {
        setSaveError('API key không đúng định dạng (bắt đầu bằng AIza... hoặc AQ..., không chứa dấu cách).');
        setActiveTab(p);
        return;
      }
    }

    for (const p of ['gemini', 'agent-platform'] as AiProvider[]) {
      const k = keys[p].trim();
      if (k) apiKeyManager.setApiKey(k, p);
    }
    apiKeyManager.setProvider(selectedProvider);
    apiKeyManager.setSelectedModel(models[selectedProvider]);

    setSaveMessage('✅ Đã lưu cấu hình thành công!');
    setTimeout(() => {
      setSaveMessage('');
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  const fbConfig = getFirebaseConfig();
  const isAgent = currentProvider === 'agent-platform';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-teal-500" />
            <h2 id="settings-title" className="text-lg font-bold text-slate-900 dark:text-white">Cài Đặt API Key & Model</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition" aria-label="Đóng">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'gemini' as SettingsTab, label: 'Gemini API', icon: Zap },
            { id: 'agent-platform' as SettingsTab, label: 'Agent Platform API', icon: Cloud },
            { id: 'firebase' as SettingsTab, label: 'Firebase', icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCheckResult(null);
                setShowKey(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === selectedProvider && (
                <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300">ĐANG DÙNG</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {activeTab !== 'firebase' && (
            <div className="space-y-4">
              {/* Provider selection */}
              <div className={`p-3 rounded-xl border ${isAgent ? 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800' : 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800'}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="provider"
                    checked={selectedProvider === currentProvider}
                    onChange={() => setSelectedProvider(currentProvider)}
                    className={isAgent ? 'accent-violet-600' : 'accent-teal-600'}
                  />
                  <span className={`text-sm font-semibold ${isAgent ? 'text-violet-700 dark:text-violet-300' : 'text-teal-700 dark:text-teal-300'}`}>
                    Sử dụng {isAgent ? 'Agent Platform API' : 'Gemini API'} làm dịch vụ chính
                  </span>
                </label>
              </div>

              {/* API Key */}
              <div>
                <label htmlFor="api-key-input" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  <Key className="w-3.5 h-3.5 inline mr-1" />
                  {isAgent ? 'Agent Platform API Key' : 'Gemini API Key'}
                </label>
                <div className="relative">
                  <input
                    id="api-key-input"
                    type={showKey ? 'text' : 'password'}
                    value={currentKey}
                    onChange={(e) => updateKey(e.target.value)}
                    placeholder="AIza... hoặc AQ..."
                    autoComplete="off"
                    spellCheck={false}
                    className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-mono focus:ring-2 transition pr-10 ${
                      isAgent ? 'focus:ring-violet-500/50 focus:border-violet-500' : 'focus:ring-teal-500/50 focus:border-teal-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showKey ? 'Ẩn key' : 'Hiện key'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {currentKey && (
                  <p className={`text-xs mt-1 ${keyFormatOk ? 'text-emerald-600' : 'text-red-500'}`}>
                    {keyFormatOk ? '✓ Đúng định dạng key' : '✗ Key không đúng định dạng (AIza... hoặc AQ..., không có dấu cách)'}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  Lấy key tại{' '}
                  <a
                    href={isAgent ? AGENT_PLATFORM_API_KEY_URL : GEMINI_API_KEY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 underline font-semibold"
                  >
                    {isAgent ? 'hướng dẫn Agent Platform API key' : 'aistudio.google.com/apikey'}
                  </a>
                  . Key chỉ lưu trong trình duyệt này, không gửi đi đâu ngoài Google.
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={handleCheckKey}
                    disabled={!keyFormatOk || checking}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 transition disabled:opacity-50"
                  >
                    {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    {checking ? 'Đang kiểm tra...' : 'Kiểm tra key'}
                  </button>
                  {apiKeyManager.getApiKey(currentProvider) && (
                    <button
                      type="button"
                      onClick={handleClearKey}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa key khỏi máy này
                    </button>
                  )}
                </div>

                {checkResult && (
                  <div
                    role="status"
                    className={`mt-2 p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                      checkResult.ok
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {checkResult.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{checkResult.message}</span>
                  </div>
                )}
              </div>

              {/* Model selection — dạng thẻ */}
              <div>
                <div className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Model ưu tiên <span className="font-normal text-slate-400">(lỗi/quá tải sẽ tự chuyển model dự phòng)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Chọn model">
                  {apiKeyManager.getModelOptions(currentProvider).map((m) => {
                    const active = models[currentProvider] === m.id;
                    const isDefault = m.id === apiKeyManager.getDefaultModel(currentProvider);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setModels((prev) => ({ ...prev, [currentProvider]: m.id }))}
                        className={`text-left p-3 rounded-xl border transition ${
                          active
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 ring-1 ring-teal-500'
                            : 'border-slate-200 dark:border-slate-700 hover:border-teal-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{m.label}</span>
                          {isDefault && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">MẶC ĐỊNH</span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{m.id}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{m.note}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============ FIREBASE TAB ============ */}
          {activeTab === 'firebase' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Firebase đã được cấu hình sẵn trong ứng dụng
              </div>
              <dl className="text-xs grid grid-cols-[auto,1fr] gap-x-3 gap-y-1.5 text-slate-600 dark:text-slate-300">
                <dt className="font-semibold">Project</dt>
                <dd className="font-mono break-all">{fbConfig.projectId}</dd>
                <dt className="font-semibold">Database</dt>
                <dd className="font-mono break-all">{fbConfig.databaseURL}</dd>
              </dl>
              <p className="text-[11px] text-slate-500">
                Đề thi, bài làm được lưu lên Firebase Realtime Database và sao lưu trong trình duyệt. Muốn đổi dự án Firebase, sửa
                <code className="mx-1">src/lib/firebase.ts</code> rồi build lại.
              </p>
            </div>
          )}

          {saveError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {saveError}
            </div>
          )}
          {saveMessage && (
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold text-center" role="status">
              {saveMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-sm"
          >
            Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
};
