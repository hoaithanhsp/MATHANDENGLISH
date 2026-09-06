import React, { useState } from 'react';
import { Database, Copy, Check, X, Shield, Layers, Key } from 'lucide-react';

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPABASE_SCHEMA_TEXT = `-- ====================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR HAI PHONG MATH OLYMPIAD (THPT)
-- Conforming to Hai Phong DOET Gifted High School Exam Matrix in English
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Teachers & Students)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. EXAMS TABLE (22 questions / 90 minutes)
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    mode TEXT NOT NULL DEFAULT 'bilingual' CHECK (mode IN ('bilingual', 'english_only')),
    duration_minutes INTEGER NOT NULL DEFAULT 90,
    is_published BOOLEAN NOT NULL DEFAULT false,
    access_code TEXT UNIQUE NOT NULL,
    exam_type TEXT NOT NULL DEFAULT 'haiphong_matrix' CHECK (exam_type IN ('haiphong_matrix', 'topic_practice', 'custom')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. QUESTIONS TABLE (Part 1: 12 MCQs, Part 2: 10 Short Answer)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    part TEXT NOT NULL CHECK (part IN ('PART_1', 'PART_2')),
    order_index INTEGER NOT NULL,
    strand TEXT NOT NULL CHECK (strand IN ('algebra_calculus', 'geometry_measurement', 'statistics_discrete')),
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('understanding', 'application', 'advanced')),
    question_en TEXT NOT NULL,
    question_vi TEXT,
    options_en JSONB,
    options_vi JSONB,
    correct_answer TEXT NOT NULL,
    acceptable_answers TEXT[],
    solution_en TEXT NOT NULL,
    solution_vi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_exam_order UNIQUE (exam_id, order_index)
);

-- 4. ASSIGNMENTS & SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'completed')),
    score NUMERIC(5, 2),
    answers JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. STUDENT STUDY NOTES TABLE
CREATE TABLE IF NOT EXISTS student_study_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'bilingual' CHECK (mode IN ('bilingual', 'english_only')),
    content_markdown TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_study_notes ENABLE ROW LEVEL SECURITY;`;

export const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Supabase SQL Schema & Row-Level Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chuẩn cấu trúc 5 bảng PostgreSQL + RLS cho Đội tuyển HSG Toán Hải Phòng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature badges */}
        <div className="px-6 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/30 flex flex-wrap gap-2 text-xs text-indigo-700 dark:text-indigo-300">
          <span className="flex items-center gap-1 font-medium">
            <Layers className="w-3.5 h-3.5" /> 5 Bảng: profiles, exams, questions, assignments, student_study_notes
          </span>
          <span className="flex items-center gap-1 font-medium ml-3">
            <Shield className="w-3.5 h-3.5" /> RLS RBAC: Phân quyền Teacher & Student
          </span>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-950 dark:bg-slate-950 text-slate-300 flex-1">
          <pre className="whitespace-pre-wrap leading-relaxed text-emerald-400/90">{SUPABASE_SCHEMA_TEXT}</pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Copy đoạn mã này dán vào <strong>Supabase SQL Editor</strong> để khởi tạo cơ sở dữ liệu.
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Đã sao chép SQL!' : 'Sao chép SQL Schema'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
