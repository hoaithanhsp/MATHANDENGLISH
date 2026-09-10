import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  FileText,
  Clock,
  KeyRound,
  Database,
  Moon,
  Sun,
  UserCheck,
  Award,
  Layers,
  Settings,
  LogOut,
  Target,
  BookmarkCheck,
  Languages,
  Radar,
  PenTool,
  BarChart3,
} from 'lucide-react';
import { Profile, UserRole } from '../types';

interface NavbarProps {
  currentUser: Profile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchRole: (role: UserRole) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSchema: () => void;
  onOpenQuickJoin: () => void;
  onOpenSettings: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onSwitchRole,
  theme,
  onToggleTheme,
  onOpenSchema,
  onOpenQuickJoin,
  onOpenSettings,
  onLogout,
}) => {
  const isTeacher = currentUser.role === 'teacher';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand matching Clean Minimalism design */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold font-serif text-base shadow-xs shrink-0">
              Σ
            </div>
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                MathElite <span className="text-teal-600">AI</span>
              </h1>
              <span className="hidden sm:inline-block ml-3 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest font-semibold rounded border border-slate-200 dark:border-slate-700">
                HP Matrix 1.0
              </span>
            </div>
          </div>

          {/* Navigation Links based on role */}
          <nav className="hidden md:flex items-center gap-1.5">
            {isTeacher ? (
              <>
                <button
                  onClick={() => setActiveTab('teacher_generate')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'teacher_generate'
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Tạo đề AI
                </button>
                <button
                  onClick={() => setActiveTab('teacher_exams')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'teacher_exams'
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Ngân hàng đề
                </button>
                <button
                  onClick={() => setActiveTab('teacher_submissions')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'teacher_submissions'
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Bài nộp HS
                </button>
                <button
                  onClick={() => setActiveTab('teacher_radar')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'teacher_radar'
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Radar className="w-3.5 h-3.5 text-teal-500" />
                  Radar năng lực K11
                </button>
                <button
                  onClick={() => setActiveTab('teacher_history')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'teacher_history'
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                  Lịch sử học tập
                </button>
                <button
                  onClick={() => setActiveTab('matrix_guide')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'matrix_guide'
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Ma trận đề thi
                </button>
                <button
                  onClick={() => setActiveTab('student_notes')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'student_notes'
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  13 Giáo án bồi dưỡng
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('student_generate')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'student_generate'
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                  Tự tạo đề AI
                </button>
                <button
                  onClick={() => setActiveTab('student_assistant')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'student_assistant'
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Tự học chuyên đề
                </button>
                <button
                  onClick={() => setActiveTab('student_review')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'student_review'
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  Ôn tập HSG
                </button>
                <button
                  onClick={() => setActiveTab('student_mock')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'student_mock'
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Luyện đề 90 phút
                </button>
                <button
                  onClick={() => setActiveTab('student_proof')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'student_proof'
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5 text-purple-500" />
                  Olympic Proof Studio
                </button>
                <button
                  onClick={onOpenQuickJoin}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-teal-500" />
                  Vào phòng thi
                </button>
                <button
                  onClick={() => setActiveTab('student_mistakes')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'student_mistakes'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5 text-rose-500" />
                  Sổ tay câu sai
                </button>
                <button
                  onClick={() => setActiveTab('student_vocab')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'student_vocab'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5 text-blue-500" />
                  Từ điển thuật ngữ
                </button>
                <button
                  onClick={() => setActiveTab('student_notes')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'student_notes'
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Vở ghi ôn tập
                </button>
              </>
            )}
          </nav>

          {/* Controls: User info, Firebase schema, Theme, Logout */}
          <div className="flex items-center gap-2">
            {/* User badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                style={{ backgroundColor: isTeacher ? '#0D9488' : '#059669' }}
              >
                {currentUser.full_name?.charAt(0) || (isTeacher ? 'T' : 'S')}
              </div>
              <div className="text-xs leading-tight">
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {currentUser.full_name}
                </div>
                <div className={`text-[10px] font-bold ${isTeacher ? 'text-teal-600 dark:text-teal-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {isTeacher ? 'Giáo viên' : 'Học sinh'}
                </div>
              </div>
            </div>

            {/* Schema Modal Button */}
            <button
              onClick={onOpenSchema}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title="Xem Database Schema"
            >
              <Database className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title="Cài đặt API Key & Firebase"
            >
              <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title={theme === 'dark' ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile secondary navigation bar */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800">
          {isTeacher ? (
            <>
              <button
                onClick={() => setActiveTab('teacher_generate')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'teacher_generate'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Tạo đề AI
              </button>
              <button
                onClick={() => setActiveTab('teacher_exams')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'teacher_exams'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Ngân hàng đề
              </button>
              <button
                onClick={() => setActiveTab('teacher_submissions')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'teacher_submissions'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Bài nộp HS
              </button>
              <button
                onClick={() => setActiveTab('teacher_radar')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'teacher_radar'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Radar K11
              </button>
              <button
                onClick={() => setActiveTab('teacher_history')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'teacher_history'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Lịch sử HS
              </button>
              <button
                onClick={() => setActiveTab('matrix_guide')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'matrix_guide'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Ma trận
              </button>
              <button
                onClick={() => setActiveTab('student_notes')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'student_notes'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                13 Giáo án
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('student_generate')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg flex items-center gap-1 ${
                  activeTab === 'student_generate'
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                Tạo đề AI
              </button>
              <button
                onClick={() => setActiveTab('student_assistant')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'student_assistant'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Tự học AI
              </button>
              <button
                onClick={() => setActiveTab('student_review')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'student_review'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Ôn tập
              </button>
              <button
                onClick={() => setActiveTab('student_mock')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'student_mock'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Luyện đề 90p
              </button>
              <button
                onClick={() => setActiveTab('student_proof')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'student_proof'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Tự luận
              </button>
              <button
                onClick={onOpenQuickJoin}
                className="px-2.5 py-1 text-xs whitespace-nowrap rounded-lg text-slate-600 dark:text-slate-300"
              >
                Mã phòng thi
              </button>
              <button
                onClick={() => setActiveTab('student_mistakes')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'student_mistakes'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Sổ câu sai
              </button>
              <button
                onClick={() => setActiveTab('student_vocab')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'student_vocab'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Từ điển
              </button>
              <button
                onClick={() => setActiveTab('student_notes')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'student_notes'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Vở ghi
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
