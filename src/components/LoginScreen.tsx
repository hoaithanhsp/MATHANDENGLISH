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

          {/* Divider */}
          <div className="px-6">
            <div className="border-t border-slate-200 dark:border-slate-700" />
          </div>

          {/* Quick Login Accounts */}
          <div className="p-6 pt-4">
            <button
              onClick={() => setShowAccounts(!showAccounts)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition mb-3"
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Danh sách tài khoản ({PREDEFINED_ACCOUNTS.length} tài khoản)
              </span>
              {showAccounts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAccounts && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                {/* Teacher */}
                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <UserCheck className="w-3 h-3" /> Giáo viên
                </div>
                {teacherAccount.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleQuickLogin(acc)}
                    className={`w-full text-left p-3 rounded-xl border transition text-xs ${
                      email === acc.email
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 dark:border-indigo-700'
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{acc.displayName}</div>
                    <div className="text-slate-400 mt-0.5 font-mono">{acc.email}</div>
                    <div className="text-slate-400 mt-0.5">Mật khẩu: <code className="text-indigo-500">{acc.password}</code></div>
                  </button>
                ))}

                {/* Students */}
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1 mt-3 mb-1">
                  <BookOpen className="w-3 h-3" /> Học sinh ({studentAccounts.length})
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {studentAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => handleQuickLogin(acc)}
                      className={`text-left p-2.5 rounded-xl border transition text-xs ${
                        email === acc.email
                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-700'
                          : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{acc.displayName}</div>
                      <div className="text-slate-400 mt-0.5 font-mono text-[10px]">{acc.email}</div>
                      <div className="text-slate-400 mt-0.5 text-[10px]">MK: <code className="text-emerald-500">{acc.password}</code></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
