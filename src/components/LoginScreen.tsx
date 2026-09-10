/**
 * LoginScreen — Màn hình đăng nhập Firebase Auth
 * Hiển thị danh sách tài khoản GV/HS, nhập email+password để đăng nhập
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Users,
  Sparkles,
} from 'lucide-react';
import { loginWithEmailPassword, PREDEFINED_ACCOUNTS, AccountInfo } from '../services/authService';
import { Profile } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (profile: Profile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { profile } = await loginWithEmailPassword(email.trim(), password);
      onLoginSuccess(profile);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Sai mật khẩu. Vui lòng kiểm tra lại.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email không hợp lệ.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Quá nhiều lần thử. Vui lòng đợi vài phút rồi thử lại.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Không có kết nối mạng. Vui lòng kiểm tra Internet.');
      } else {
        setError(`Lỗi đăng nhập: ${err.message || 'Không xác định'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = async (acc: AccountInfo) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
    setLoading(true);

    try {
      const { profile } = await loginWithEmailPassword(acc.email, acc.password);
      onLoginSuccess(profile);
    } catch (err: any) {
      console.error('Quick login error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Sai mật khẩu. Vui lòng kiểm tra lại.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Không có kết nối mạng. Vui lòng kiểm tra Internet.');
      } else {
        setError(`Lỗi đăng nhập: ${err.message || 'Không xác định'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-3">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Đội Tuyển HSG Toán Hải Phòng
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hệ thống Dạy & Học Toán bằng Tiếng Anh • Chuẩn Ma Trận Sở GD&ĐT
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                📧 Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="giaovien@hpmath.edu.vn"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                🔑 Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Đăng Nhập
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Login Section */}
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/40">
            <div className="flex items-center justify-between mb-2.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Đăng nhập nhanh 1-Click:
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Bấm vào tên để vào app</span>
            </div>

            {/* Teacher button */}
            <div className="mb-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSelectAccount(PREDEFINED_ACCOUNTS[0])}
                className="w-full text-left p-2.5 rounded-xl text-xs font-semibold bg-indigo-100/70 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-200 hover:bg-indigo-200/80 dark:hover:bg-indigo-900/70 transition border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold">GIÁO VIÊN</span>
                  <span className="truncate">{PREDEFINED_ACCOUNTS[0].displayName}</span>
                </div>
                <span className="text-[10px] text-indigo-500 group-hover:translate-x-0.5 transition-transform font-bold">Vào ngay →</span>
              </button>
            </div>

            {/* 9 Students Grid */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <Users className="w-3 h-3 text-emerald-500" />
                <span>9 Học sinh Đội tuyển:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {PREDEFINED_ACCOUNTS.slice(1).map((acc, index) => (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={loading}
                    onClick={() => handleSelectAccount(acc)}
                    className="text-left p-2 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-700 transition border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-between group"
                  >
                    <span className="truncate font-medium">
                      <strong className="text-emerald-600 dark:text-emerald-400 mr-1 font-bold">{index + 1}.</strong>
                      {acc.displayName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 mt-5">
          Hệ Thống Dạy & Học Đội Tuyển HSG Toán THPT • Chuẩn Ma Trận Sở GD&ĐT Hải Phòng
        </p>
        <p className="text-center text-[10px] text-slate-400/70 mt-1">
          Tác giả: <strong>Trần Hoài Thanh</strong> — THPT Khúc Thừa Dụ, TP.Hải Phòng — Zalo: 0348296773
        </p>
      </div>
    </div>
  );
};
