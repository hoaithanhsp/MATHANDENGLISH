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
  Users,
  UserCheck,
  BookOpen,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PREDEFINED_ACCOUNTS, loginWithEmailPassword, AccountInfo } from '../services/authService';
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
  const [showAccounts, setShowAccounts] = useState(false);

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

  const handleQuickLogin = (account: AccountInfo) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  const teacherAccount = PREDEFINED_ACCOUNTS.filter((a) => a.role === 'teacher');
  const studentAccounts = PREDEFINED_ACCOUNTS.filter((a) => a.role === 'student');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Đội Tuyển HSG Toán Hải Phòng
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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

        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 mt-6">
          Hệ Thống Dạy & Học Đội Tuyển HSG Toán THPT • Chuẩn Ma Trận Sở GD&ĐT Hải Phòng
        </p>
        <p className="text-center text-[10px] text-slate-400/70 mt-1">
          Tác giả: <strong>Trần Hoài Thanh</strong> — THPT Khúc Thừa Dụ, TP.Hải Phòng — Zalo: 0348296773
        </p>
      </div>
    </div>
  );
};
