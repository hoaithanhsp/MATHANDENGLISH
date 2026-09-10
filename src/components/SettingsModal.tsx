/**
 * Settings Modal — API Key, Model, Firebase Configuration
 * Theo quy chuẩn api.md:
 * - Hai tab: Gemini API và Agent Platform API
 * - Key lưu riêng, không ghi đè nhau
 * - Validate key format: AIzaSy... và AQ...
 * - Không tự suy đoán provider từ tiền tố key
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
  Shield,
} from 'lucide-react';
import {
  apiKeyManager,
  AiProvider,
  isValidGoogleAiApiKey,
  GEMINI_MODELS,
  AGENT_PLATFORM_MODELS,
} from '../services/apiKeyManager';
import {
  saveFirebaseConfig,
  getFirebaseConfig,
  isFirebaseConfigured,
  FirebaseConfig,
} from '../lib/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'gemini' | 'agent-platform' | 'firebase';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('gemini');

  // Gemini API state
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('');

  // Agent Platform state
  const [agentKey, setAgentKey] = useState('');
  const [agentModel, setAgentModel] = useState('');

  // Provider selection
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>('gemini');

  // Firebase state
  const [fbConfigJson, setFbConfigJson] = useState('');
  const [fbStatus, setFbStatus] = useState<'none' | 'valid' | 'invalid'>('none');

  // UI state
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showAgentKey, setShowAgentKey] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load saved values
  useEffect(() => {
    if (isOpen) {
      setGeminiKey(apiKeyManager.getApiKey('gemini'));
      setAgentKey(apiKeyManager.getApiKey('agent-platform'));
      setSelectedProvider(apiKeyManager.getProvider());
      setGeminiModel(apiKeyManager.getSelectedModel());
      setAgentModel(apiKeyManager.getSelectedModel());

      const fbConfig = getFirebaseConfig();
      if (fbConfig) {
        setFbConfigJson(JSON.stringify(fbConfig, null, 2));
        setFbStatus('valid');
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    // Save provider
    apiKeyManager.setProvider(selectedProvider);

    // Save keys
    if (geminiKey.trim()) {
      apiKeyManager.setApiKey(geminiKey.trim(), 'gemini');
    }
    if (agentKey.trim()) {
      apiKeyManager.setApiKey(agentKey.trim(), 'agent-platform');
    }

    // Save model
    const model = selectedProvider === 'agent-platform' ? agentModel : geminiModel;
    apiKeyManager.setSelectedModel(model);

    // Save Firebase config
    if (fbConfigJson.trim()) {
      try {
        const config = JSON.parse(fbConfigJson.trim()) as FirebaseConfig;
        if (config.apiKey && config.databaseURL && config.projectId) {
          saveFirebaseConfig(config);
          setFbStatus('valid');
        } else {
          setFbStatus('invalid');
        }
      } catch {
        if (fbConfigJson.trim().length > 0) {
          setFbStatus('invalid');
        }
      }
    }

    setSaveMessage('✅ Đã lưu cấu hình thành công!');
    setTimeout(() => {
      setSaveMessage('');
      onClose();
    }, 1200);
  };

  const maskKey = (key: string): string => {
    if (key.length <= 8) return key;
    return key.slice(0, 6) + '•'.repeat(key.length - 10) + key.slice(-4);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-teal-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cài Đặt Hệ Thống</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'gemini' as SettingsTab, label: 'Gemini API', icon: Zap },
            { id: 'agent-platform' as SettingsTab, label: 'Agent Platform', icon: Cloud },
            { id: 'firebase' as SettingsTab, label: 'Firebase', icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* ============ GEMINI API TAB ============ */}
          {activeTab === 'gemini' && (
            <div className="space-y-4">
              {/* Provider selection */}
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="provider"
                    checked={selectedProvider === 'gemini'}
                    onChange={() => setSelectedProvider('gemini')}
                    className="accent-teal-600"
                  />
                  <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                    Sử dụng Gemini API làm dịch vụ chính
                  </span>
                </label>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  <Key className="w-3.5 h-3.5 inline mr-1" />
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy... hoặc AQ..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-mono focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition pr-10"
                  />
                  <button
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {geminiKey && (
                  <p className={`text-xs mt-1 ${isValidGoogleAiApiKey(geminiKey) ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isValidGoogleAiApiKey(geminiKey) ? '✓ Key hợp lệ' : '✗ Key không đúng định dạng (AIzaSy... hoặc AQ...)'}
                  </p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  Lấy key tại{' '}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-teal-500 underline">
                    aistudio.google.com/apikey
                  </a>
                </p>
              </div>

              {/* Model selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Model mặc định
                </label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-teal-500/50 transition"
                >
                  {GEMINI_MODELS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ============ AGENT PLATFORM TAB ============ */}
          {activeTab === 'agent-platform' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="provider"
                    checked={selectedProvider === 'agent-platform'}
                    onChange={() => setSelectedProvider('agent-platform')}
                    className="accent-violet-600"
                  />
                  <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                    Sử dụng Agent Platform API làm dịch vụ chính
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  <Key className="w-3.5 h-3.5 inline mr-1" />
                  Agent Platform API Key
                </label>
                <div className="relative">
                  <input
                    type={showAgentKey ? 'text' : 'password'}
                    value={agentKey}
                    onChange={(e) => setAgentKey(e.target.value)}
                    placeholder="AIzaSy... hoặc AQ..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-mono focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition pr-10"
                  />
                  <button
                    onClick={() => setShowAgentKey(!showAgentKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showAgentKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {agentKey && (
                  <p className={`text-xs mt-1 ${isValidGoogleAiApiKey(agentKey) ? 'text-emerald-600' : 'text-red-500'}`}>
                    {isValidGoogleAiApiKey(agentKey) ? '✓ Key hợp lệ' : '✗ Key không đúng định dạng'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Model mặc định
                </label>
                <select
                  value={agentModel}
                  onChange={(e) => setAgentModel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-violet-500/50 transition"
                >
                  {AGENT_PLATFORM_MODELS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ============ FIREBASE TAB ============ */}
          {activeTab === 'firebase' && (
            <div className="space-y-4">
              <div className={`p-3 rounded-xl border ${
                isFirebaseConfigured()
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
              }`}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {isFirebaseConfigured() ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-300">Firebase đã được cấu hình</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-700 dark:text-amber-300">Firebase chưa được cấu hình — dùng localStorage</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  <Shield className="w-3.5 h-3.5 inline mr-1" />
                  Firebase Config (JSON)
                </label>
                <textarea
                  value={fbConfigJson}
                  onChange={(e) => {
                    setFbConfigJson(e.target.value);
                    setFbStatus('none');
                  }}
                  placeholder={`{
  "apiKey": "AIzaSy...",
  "authDomain": "your-app.firebaseapp.com",
  "databaseURL": "https://your-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  "projectId": "your-app",
  "storageBucket": "your-app.firebasestorage.app",
  "messagingSenderId": "123...",
  "appId": "1:123...:web:abc..."
}`}
                  rows={10}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono focus:ring-2 focus:ring-emerald-500/50 transition resize-none"
                />
                {fbStatus === 'invalid' && (
                  <p className="text-xs text-red-500 mt-1">
                    ✗ JSON không hợp lệ hoặc thiếu trường bắt buộc (apiKey, databaseURL, projectId)
                  </p>
                )}
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Lấy config tại{' '}
                  <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-teal-500 underline">
                    Firebase Console
                  </a>{' '}
                  → Project Settings → Your apps → Web
                </p>
              </div>
            </div>
          )}

          {/* Save Message */}
          {saveMessage && (
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold text-center">
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
