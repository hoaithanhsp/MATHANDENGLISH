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
  Settings
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
}) => {
  const isTeacher = currentUser.role === 'teacher';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand matching Clean Minimalism design */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold font-serif text-base shadow-xs shrink-0">
              Σ
            </div>
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                MathElite <span className="text-indigo-600">AI</span>
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
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Generator
                </button>
                <button
                  onClick={() => setActiveTab('teacher_exams')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'teacher_exams'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Exam Bank
                </button>
                <button
                  onClick={() => setActiveTab('teacher_submissions')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'teacher_submissions'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  My Students
                </button>
                <button
                  onClick={() => setActiveTab('matrix_guide')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'matrix_guide'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  HP Matrix Guide
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('student_assistant')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'student_assistant'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Tự Học Chuyên Đề
                </button>
                <button
                  onClick={() => setActiveTab('student_mock')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'student_mock'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Luyện Đề 90 Phút
                </button>
                <button
                  onClick={onOpenQuickJoin}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                  Vào Phòng Thi
                </button>
                <button
                  onClick={() => setActiveTab('student_notes')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'student_notes'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Vở Ghi Ôn Tập
                </button>
              </>
            )}
          </nav>

          {/* Controls: Segmented role switcher, Firebase schema, Theme, Avatar */}
          <div className="flex items-center gap-3">
            {/* Segmented Control Role Switcher from Design */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
              <button
                onClick={() => {
                  onSwitchRole('teacher');
                  setActiveTab('teacher_generate');
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  isTeacher
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Teacher
              </button>
              <button
                onClick={() => {
                  onSwitchRole('student');
                  setActiveTab('student_assistant');
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  !isTeacher
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Student
              </button>
            </div>

            {/* Schema Modal Button */}
            <button
              onClick={onOpenSchema}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title="Xem Database Schema"
            >
              <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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

            {/* Clean minimalist avatar circle from Design */}
            <div
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 shadow-xs flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-200 shrink-0"
              title={currentUser.full_name}
            >
              {currentUser.full_name?.charAt(0) || (isTeacher ? 'T' : 'S')}
            </div>
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
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Tạo Đề AI
              </button>
              <button
                onClick={() => setActiveTab('teacher_exams')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'teacher_exams'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Ngân Hàng Đề
              </button>
              <button
                onClick={() => setActiveTab('teacher_submissions')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'teacher_submissions'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Bài Nộp HS
              </button>
              <button
                onClick={() => setActiveTab('matrix_guide')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'matrix_guide'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Ma Trận
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('student_assistant')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'student_assistant'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Tự Học AI
              </button>
              <button
                onClick={() => setActiveTab('student_mock')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'student_mock'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Luyện Đề 90p
              </button>
              <button
                onClick={onOpenQuickJoin}
                className="px-2.5 py-1 text-xs whitespace-nowrap rounded-lg text-slate-600 dark:text-slate-300"
              >
                Mã Phòng Thi
              </button>
              <button
                onClick={() => setActiveTab('student_notes')}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-lg ${
                  activeTab === 'student_notes'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Vở Ghi
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
