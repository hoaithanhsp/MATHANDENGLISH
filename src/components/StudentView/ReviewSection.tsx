/**
 * ReviewSection — Mục Ôn Tập theo Cấu trúc Đề thi HSG TP Hải Phòng
 * 3 Mạch kiến thức → 13 Chuyên đề → Công thức + Mẹo thi + Câu hỏi mẫu
 */

import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Target,
  Lightbulb,
  CheckCircle2,
  Layers,
  Award,
  FileText,
  Languages,
} from 'lucide-react';
import { REVIEW_STRANDS, EXAM_STRUCTURE, ReviewStrand, ReviewTopic } from '../../data/reviewData';
import MathRenderer from '../MathRenderer';

export const ReviewSection: React.FC = () => {
  const [expandedStrand, setExpandedStrand] = useState<string | null>('algebra_calculus');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});

  const toggleStrand = (id: string) => {
    setExpandedStrand(expandedStrand === id ? null : id);
    setExpandedTopic(null);
  };

  const toggleTopic = (id: string) => {
    setExpandedTopic(expandedTopic === id ? null : id);
  };

  const toggleSolution = (qId: string) => {
    setShowSolution((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const difficultyBadge = (level: string) => {
    const styles: Record<string, string> = {
      understanding: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
      application: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
      advanced: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
    };
    const names: Record<string, string> = {
      understanding: 'Thông hiểu',
      application: 'Vận dụng',
      advanced: 'Vận dụng cao',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[level] || ''}`}>
        {names[level] || level}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              📚 Ôn Tập Theo Cấu Trúc Đề Thi HSG Hải Phòng
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Theo Quyết định của Sở GD&ĐT Hải Phòng • {EXAM_STRUCTURE.total_questions} câu / {EXAM_STRUCTURE.duration_minutes} phút / Thang điểm {EXAM_STRUCTURE.scale}
            </p>

            {/* Exam structure summary */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {EXAM_STRUCTURE.cognitive_levels.map((cl) => (
                <div
                  key={cl.level}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700"
                >
                  <Target className="w-4 h-4 text-slate-400" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{cl.name_vi}</span>
                    <span className="text-slate-400 ml-1">({cl.count} câu)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Parts */}
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAM_STRUCTURE.parts.map((part) => (
                <div
                  key={part.part}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs"
                >
                  <span className="font-bold text-indigo-700 dark:text-indigo-300">{part.name_vi}</span>
                  <span className="text-indigo-500 ml-1">• {part.question_count} câu</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3 Strands */}
      {REVIEW_STRANDS.map((strand) => (
        <div
          key={strand.id}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden"
        >
          {/* Strand header */}
          <button
            onClick={() => toggleStrand(strand.id)}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: strand.color + '15', color: strand.color }}
              >
                {strand.icon}
              </div>
              <div className="text-left">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {strand.strand_vi}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {strand.strand_en} • <strong>{strand.total_questions} câu</strong> • {strand.topics.length} chuyên đề
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Distribution badges */}
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  TH: {strand.part1_distribution.understanding + strand.part2_distribution.understanding}
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  VD: {strand.part1_distribution.application + strand.part2_distribution.application}
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                  VDC: {strand.part1_distribution.advanced + strand.part2_distribution.advanced}
                </span>
              </div>
              {expandedStrand === strand.id ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </div>
          </button>

          {/* Expanded topics */}
          {expandedStrand === strand.id && (
            <div className="border-t border-slate-100 dark:border-slate-700">
              {strand.topics.map((topic, idx) => (
                <div key={topic.id} className={idx > 0 ? 'border-t border-slate-100 dark:border-slate-700' : ''}>
                  {/* Topic header */}
                  <button
                    onClick={() => toggleTopic(topic.id)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: strand.color }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {topic.name_vi}
                        </div>
                        <div className="text-[11px] text-slate-400">{topic.name_en}</div>
                      </div>
                    </div>
                    {expandedTopic === topic.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {/* Expanded topic content */}
                  {expandedTopic === topic.id && (
                    <div className="px-5 pb-5 space-y-4">
                      {/* Description */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong>🇻🇳</strong> {topic.description_vi}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 italic">
                          <strong>🇬🇧</strong> {topic.description_en}
                        </p>
                      </div>

                      {/* Key Formulas */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                          <Layers className="w-3.5 h-3.5" /> Công thức trọng tâm
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {topic.key_formulas.map((formula, fi) => (
                            <div
                              key={fi}
                              className="px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200"
                            >
                              <MathRenderer content={formula.startsWith('$') ? formula : `$${formula}$`} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Exam Tips */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Mẹo thi HSG
                        </h4>
                        <ul className="space-y-1.5">
                          {topic.exam_tips.map((tip, ti) => (
                            <li key={ti} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Sample Questions */}
                      {topic.sample_questions.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                            <FileText className="w-3.5 h-3.5 text-indigo-500" /> Câu hỏi mẫu
                          </h4>
                          {topic.sample_questions.map((q) => (
                            <div
                              key={q.id}
                              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                {difficultyBadge(q.difficulty)}
                              </div>

                              {/* 1. Phần Câu hỏi Tiếng Anh */}
                              <div className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                                <MathRenderer content={q.question_en} />
                              </div>

                              {/* 2. Phần Bản dịch Tiếng Việt (Tách biệt rõ ràng) */}
                              {q.question_vi && (
                                <div className="p-2.5 rounded-lg bg-slate-100/80 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs">
                                  <div className="flex items-center gap-1 font-semibold text-[11px] text-indigo-600 dark:text-indigo-400 mb-1">
                                    <Languages className="w-3.5 h-3.5" />
                                    <span>Bản dịch Tiếng Việt:</span>
                                  </div>
                                  <div className="text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                    <MathRenderer content={q.question_vi} />
                                  </div>
                                </div>
                              )}

                              {/* Options (Part I) - Chỉ hiển thị tiếng Anh, không dịch đáp án */}
                              {q.options && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
                                  {q.options.map((opt, oi) => (
                                    <div
                                      key={oi}
                                      className={`px-3 py-1.5 rounded-lg text-xs border ${
                                        opt.startsWith(q.correct_answer)
                                          ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 font-bold text-emerald-700 dark:text-emerald-300'
                                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                      }`}
                                    >
                                      <MathRenderer content={opt} inline />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Show/Hide Solution */}
                              <button
                                onClick={() => toggleSolution(q.id)}
                                className="mt-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                {showSolution[q.id] ? '▼ Ẩn lời giải' : '▶ Xem lời giải'}
                              </button>

                              {showSolution[q.id] && (
                                <div className="mt-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 space-y-1.5">
                                  <div className="text-xs text-emerald-800 dark:text-emerald-200">
                                    <strong>🇬🇧 Solution:</strong> <MathRenderer content={q.solution_en} />
                                  </div>
                                  {q.solution_vi && (
                                    <div className="text-xs text-emerald-600 dark:text-emerald-300 italic">
                                      <strong>🇻🇳 Lời giải:</strong> <MathRenderer content={q.solution_vi} />
                                    </div>
                                  )}
                                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                                    ✅ Đáp án: {q.correct_answer}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
