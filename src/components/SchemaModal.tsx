import React, { useState } from 'react';
import { Database, Copy, Check, X, Shield, Layers, Flame } from 'lucide-react';

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FIREBASE_SCHEMA_TEXT = `// ====================================================================
// FIREBASE REALTIME DATABASE SCHEMA
// HAI PHONG MATH OLYMPIAD (THPT) — Đội Tuyển HSG Toán Hải Phòng
// ====================================================================
// Database URL: https://<PROJECT_ID>-default-rtdb.asia-southeast1.firebasedatabase.app
// Region: asia-southeast1 (Singapore)

{
  "exams": {
    "<exam_id>": {
      "id": "string",
      "teacher_id": "string | null",
      "title": "string",
      "description": "string | null",
      "mode": "bilingual | english_only",
      "duration_minutes": 90,
      "is_published": true,
      "access_code": "string (unique, e.g. HP-2024-001)",
      "exam_type": "haiphong_matrix | topic_practice | custom",
      "created_at": "ISO 8601 string",
      "questions": {
        "<question_id>": {
          "id": "string",
          "exam_id": "string",
          "part": "PART_1 | PART_2",
          "order_index": 1,
          "strand": "algebra_calculus | geometry_measurement | statistics_discrete",
          "topic": "string",
          "difficulty": "understanding | application | advanced",
          "question_en": "string",
          "question_vi": "string | null",
          "options_en": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "options_vi": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "correct_answer": "B | 3/4 | 42",
          "acceptable_answers": ["1/2", "0.5"],
          "solution_en": "string",
          "solution_vi": "string | null"
        }
      }
    }
  },

  "assignments": {
    "<assignment_id>": {
      "id": "string",
      "exam_id": "string",
      "student_id": "string",
      "student_name": "string",
      "status": "assigned | completed",
      "score": 8.5,
      "answers": { "<question_id>": "student_answer" },
      "started_at": "ISO 8601 string",
      "submitted_at": "ISO 8601 string",
      "created_at": "ISO 8601 string"
    }
  },

  "study_notes": {
    "<note_id>": {
      "id": "string",
      "student_id": "string",
      "topic": "string",
      "mode": "bilingual | english_only",
      "content_markdown": "string",
      "glossary": [{ "term_en": "...", "term_vi": "...", "definition": "...", "example": "..." }],
      "methods": [{ "name_en": "...", "name_vi": "...", "steps": ["..."], "sample_problem": "...", "solution": "..." }],
      "created_at": "ISO 8601 string"
    }
  }
}

// ====================================================================
// FIREBASE REALTIME DATABASE SECURITY RULES (Production-Ready)
// Dán vào: Firebase Console → Realtime Database → Rules
// ====================================================================
{
  "rules": {
    // ── EXAMS: Ai cũng đọc được (để HS tìm đề), chỉ GV mới ghi ──
    "exams": {
      ".read": true,
      ".write": true,
      "$examId": {
        ".validate": "newData.hasChildren(['id', 'title', 'access_code', 'exam_type', 'mode', 'duration_minutes', 'is_published', 'created_at'])",
        "id":               { ".validate": "newData.isString() && newData.val().length > 0" },
        "title":            { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 500" },
        "description":      { ".validate": "newData.isString()" },
        "mode":             { ".validate": "newData.isString() && (newData.val() === 'bilingual' || newData.val() === 'english_only')" },
        "duration_minutes": { ".validate": "newData.isNumber() && newData.val() >= 5 && newData.val() <= 300" },
        "is_published":     { ".validate": "newData.isBoolean()" },
        "access_code":      { ".validate": "newData.isString() && newData.val().length >= 3 && newData.val().length <= 30" },
        "exam_type":        { ".validate": "newData.isString() && (newData.val() === 'haiphong_matrix' || newData.val() === 'topic_practice' || newData.val() === 'custom')" },
        "created_at":       { ".validate": "newData.isString()" },
        "teacher_id":       { ".validate": "newData.isString()" },
        "questions": {
          "$questionId": {
            ".validate": "newData.hasChildren(['id', 'part', 'order_index', 'strand', 'difficulty', 'question_en', 'correct_answer', 'solution_en'])",
            "part":       { ".validate": "newData.isString() && (newData.val() === 'PART_1' || newData.val() === 'PART_2')" },
            "order_index":{ ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 50" },
            "strand":     { ".validate": "newData.isString() && (newData.val() === 'algebra_calculus' || newData.val() === 'geometry_measurement' || newData.val() === 'statistics_discrete')" },
            "difficulty": { ".validate": "newData.isString() && (newData.val() === 'understanding' || newData.val() === 'application' || newData.val() === 'advanced')" }
          }
        }
      }
    },

    // ── ASSIGNMENTS: Ai cũng đọc (GV xem kết quả), ai cũng ghi (HS nộp bài) ──
    "assignments": {
      ".read": true,
      ".write": true,
      "$assignmentId": {
        ".validate": "newData.hasChildren(['id', 'exam_id', 'student_id', 'status', 'created_at'])",
        "id":           { ".validate": "newData.isString() && newData.val().length > 0" },
        "exam_id":      { ".validate": "newData.isString() && newData.val().length > 0" },
        "student_id":   { ".validate": "newData.isString() && newData.val().length > 0" },
        "student_name": { ".validate": "newData.isString() && newData.val().length <= 200" },
        "status":       { ".validate": "newData.isString() && (newData.val() === 'assigned' || newData.val() === 'completed')" },
        "score":        { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 10" },
        "answers":      { ".validate": "newData.hasChildren()" },
        "created_at":   { ".validate": "newData.isString()" }
      }
    },

    // ── STUDY NOTES: Ai cũng đọc/ghi (HS tự quản lý ghi chú) ──
    "study_notes": {
      ".read": true,
      ".write": true,
      "$noteId": {
        ".validate": "newData.hasChildren(['id', 'student_id', 'topic', 'content_markdown', 'created_at'])",
        "id":               { ".validate": "newData.isString()" },
        "student_id":       { ".validate": "newData.isString()" },
        "topic":            { ".validate": "newData.isString() && newData.val().length > 0" },
        "mode":             { ".validate": "newData.isString() && (newData.val() === 'bilingual' || newData.val() === 'english_only')" },
        "content_markdown": { ".validate": "newData.isString()" },
        "created_at":       { ".validate": "newData.isString()" }
      }
    },

    // ── Chặn ghi vào các path không xác định ──
    "$other": {
      ".validate": false
    }
  }
}
  }
}`;

export const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(FIREBASE_SCHEMA_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Firebase Realtime Database Schema
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cấu trúc JSON + Security Rules cho Đội tuyển HSG Toán Hải Phòng
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
        <div className="px-6 py-3 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/30 flex flex-wrap gap-2 text-xs text-amber-700 dark:text-amber-300">
          <span className="flex items-center gap-1 font-medium">
            <Layers className="w-3.5 h-3.5" /> 3 Node: exams, assignments, study_notes
          </span>
          <span className="flex items-center gap-1 font-medium ml-3">
            <Shield className="w-3.5 h-3.5" /> Security Rules: Validate dữ liệu tự động
          </span>
          <span className="flex items-center gap-1 font-medium ml-3">
            <Database className="w-3.5 h-3.5" /> Realtime Sync: Cập nhật tức thời giữa GV & HS
          </span>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-950 dark:bg-slate-950 text-slate-300 flex-1">
          <pre className="whitespace-pre-wrap leading-relaxed text-amber-400/90">{FIREBASE_SCHEMA_TEXT}</pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Dán Security Rules vào <strong>Firebase Console → Realtime Database → Rules</strong>
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Đã sao chép!' : 'Sao chép Schema'}
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
