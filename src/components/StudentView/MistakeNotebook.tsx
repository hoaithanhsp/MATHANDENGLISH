import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Trash2,
  Play,
  Filter,
  Layers,
  AlertTriangle,
  BookmarkCheck,
  RotateCcw,
  Languages,
  PieChart,
  Tag,
  Search
} from 'lucide-react';
import { MistakeEntry, MistakeReason, Exam, Question } from '../../types';
import { storageService } from '../../services/storageService';
import MathRenderer from '../MathRenderer';

interface MistakeNotebookProps {
  onPracticeMistakes: (customExam: Exam) => void;
}

export const MistakeNotebook: React.FC<MistakeNotebookProps> = ({ onPracticeMistakes }) => {
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  const loadMistakes = () => {
    const list = storageService.getMistakes();
    setMistakes(list);
  };

  useEffect(() => {
    loadMistakes();
  }, []);

  const handleToggleMastered = (id: string) => {
    storageService.toggleMistakeMastered(id);
    loadMistakes();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa câu này khỏi Sổ tay bài tập sai?')) {
      storageService.deleteMistake(id);
      loadMistakes();
    }
  };

  const handleSaveNote = (id: string, reason: MistakeReason) => {
    storageService.updateMistakeReason(id, reason, noteText);
    setEditingNoteId(null);
    setNoteText('');
    loadMistakes();
  };

  // Create mini practice exam from wrong questions
  const handleStartPractice = (onlyUnmastered = true) => {
    const pool = onlyUnmastered ? mistakes.filter((m) => !m.mastered) : mistakes;
    if (pool.length === 0) {
      alert('Không có câu hỏi nào để tạo đề luyện lại!');
      return;
    }

    const practiceQuestions: Question[] = pool.map((m, idx) => ({
      ...m.question,
      order_index: idx + 1,
    }));

    const practiceExam: Exam = {
      id: `mistake-practice-${Date.now()}`,
      title: `Đề Luyện Lại Các Câu Hỏi Sai (${practiceQuestions.length} câu)`,
      description: 'Đề thi tự động tổng hợp từ các câu hỏi bạn từng làm sai để củng cố kiến thức.',
      mode: 'bilingual',
      duration_minutes: Math.max(15, Math.ceil(practiceQuestions.length * 4.5)),
      is_published: true,
      access_code: 'MISTAKE-REVIEW',
      exam_type: 'custom',
      created_at: new Date().toISOString(),
      questions: practiceQuestions,
    };

    onPracticeMistakes(practiceExam);
  };

  // Filtered list
  const filtered = mistakes.filter((m) => {
    if (selectedFilter === 'unmastered' && m.mastered) return false;
    if (selectedFilter === 'mastered' && !m.mastered) return false;
    if (reasonFilter !== 'all' && m.mistake_reason !== reasonFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const text = `${m.question.question_en} ${m.question.question_vi || ''} ${m.notes || ''}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  // Calculate statistics of mistake reasons
  const reasonCounts: Record<string, number> = {
    formula_error: 0,
    language_misinterpretation: 0,
    careless_calculation: 0,
    concept_gap: 0,
    other: 0,
  };
  mistakes.forEach((m) => {
    const r = m.mistake_reason || 'other';
    reasonCounts[r] = (reasonCounts[r] || 0) + 1;
  });

  const getReasonBadge = (reason?: MistakeReason) => {
    switch (reason) {
      case 'language_misinterpretation':
        return { label: 'Dịch nhầm đề Tiếng Anh', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' };
      case 'formula_error':
        return { label: 'Sai công thức Toán', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' };
      case 'careless_calculation':
        return { label: 'Tính toán ẩu / Nhầm số', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' };
      case 'concept_gap':
        return { label: 'Hổng lý thuyết', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' };
      default:
        return { label: 'Khác', color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-rose-300 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Smart Mistake Notebook
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Sổ Tay Bài Tập Sai</h2>
          <p className="text-rose-200 text-xs sm:text-sm mt-1 max-w-xl">
            Tự động lưu trữ tất cả các câu làm sai sau các bài thi. Giúp nhận diện lỗ hổng kiến thức, phân tích bẫy ngôn ngữ tiếng Anh và luyện lại triệt để.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => handleStartPractice(true)}
            disabled={mistakes.filter((m) => !m.mastered).length === 0}
            className="px-5 py-3 rounded-2xl bg-white text-rose-900 hover:bg-rose-50 font-bold text-xs shadow-lg transition flex items-center gap-2 disabled:opacity-40"
          >
            <Play className="w-4 h-4 text-rose-600 fill-current" />
            Luyện Lại Câu Chưa Hiểu ({mistakes.filter((m) => !m.mastered).length})
          </button>
          <button
            onClick={() => handleStartPractice(false)}
            disabled={mistakes.length === 0}
            className="px-4 py-3 rounded-2xl bg-rose-700/80 hover:bg-rose-600 text-white font-bold text-xs transition flex items-center gap-2 disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" />
            Luyện Lại Tất Cả ({mistakes.length})
          </button>
        </div>
      </div>

      {/* Analytics & Breakdown Cards */}
      {mistakes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs text-slate-500 block">Tổng số câu sai</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              {mistakes.length}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              Đã khắc phục: {mistakes.filter((m) => m.mastered).length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-900 shadow-xs">
            <span className="text-xs text-purple-600 dark:text-purple-400 block font-semibold">Bẫy ngôn ngữ tiếng Anh</span>
            <div className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1 font-mono">
              {reasonCounts.language_misinterpretation}
            </div>
            <span className="text-[11px] text-slate-500">Dịch nhầm từ vựng/thuật ngữ</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900 shadow-xs">
            <span className="text-xs text-rose-600 dark:text-rose-400 block font-semibold">Sai công thức Toán</span>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1 font-mono">
              {reasonCounts.formula_error}
            </div>
            <span className="text-[11px] text-slate-500">Quên định lý hoặc áp dụng sai</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900 shadow-xs">
            <span className="text-xs text-amber-600 dark:text-amber-400 block font-semibold">Tính toán ẩu / Nhầm số</span>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1 font-mono">
              {reasonCounts.careless_calculation}
            </div>
            <span className="text-[11px] text-slate-500">Sai dấu hoặc rút gọn nhầm</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-700 p-1 text-xs font-semibold">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${selectedFilter === 'all' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Tất cả ({mistakes.length})
            </button>
            <button
              onClick={() => setSelectedFilter('unmastered')}
              className={`px-3 py-1 rounded-lg transition ${selectedFilter === 'unmastered' ? 'bg-white dark:bg-slate-800 text-rose-600 shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Cần luyện ({mistakes.filter((m) => !m.mastered).length})
            </button>
            <button
              onClick={() => setSelectedFilter('mastered')}
              className={`px-3 py-1 rounded-lg transition ${selectedFilter === 'mastered' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Đã hiểu ({mistakes.filter((m) => m.mastered).length})
            </button>
          </div>

          {/* Reason filter */}
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="all">Mọi nguyên nhân sai</option>
            <option value="language_misinterpretation">Dịch nhầm tiếng Anh</option>
            <option value="formula_error">Sai công thức</option>
            <option value="careless_calculation">Tính toán ẩu</option>
            <option value="concept_gap">Hổng lý thuyết</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo từ khóa/chuyên đề..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* List of Mistake Questions */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <BookmarkCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Không có câu hỏi sai nào trong bộ lọc!</h3>
          <p className="text-xs text-slate-500 mt-1">
            {mistakes.length === 0
              ? 'Tuyệt vời! Sau khi hoàn thành các bài thi thử, các câu hỏi bạn làm sai sẽ tự động xuất hiện ở đây để bạn ôn luyện lại.'
              : 'Hãy thử đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const q = item.question;
            const badge = getReasonBadge(item.mistake_reason);
            const isEditingNote = editingNoteId === item.id;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition ${
                  item.mastered
                    ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-75'
                    : 'bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-900/60 shadow-xs'
                }`}
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {q.topic || q.strand}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-slate-400">Từ đề: {item.exam_title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleMastered(item.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        item.mastered
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.mastered ? 'Đã hiểu bài' : 'Đánh dấu đã hiểu'}
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Xóa câu hỏi khỏi sổ tay"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question English */}
                <div className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed mb-2">
                  <MathRenderer content={q.question_en} />
                </div>

                {/* Question Vietnamese if any */}
                {q.question_vi && (
                  <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] mb-1">
                      <Languages className="w-3.5 h-3.5" /> Bản dịch Tiếng Việt:
                    </div>
                    <div className="italic text-slate-700 dark:text-slate-300">
                      <MathRenderer content={q.question_vi} />
                    </div>
                  </div>
                )}

                {/* Answers Diff */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-500">Bạn đã điền: </span>
                    <span className="font-mono font-bold text-rose-600">
                      {item.student_answer || '(Bỏ trống)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Đáp án chuẩn: </span>
                    <span className="font-mono font-bold text-emerald-600">
                      {q.correct_answer}{' '}
                      {q.acceptable_answers ? `(hoặc ${q.acceptable_answers.join(', ')})` : ''}
                    </span>
                  </div>
                </div>

                {/* Personal Notes / Reason Editor */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  {isEditingNote ? (
                    <div className="w-full space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={item.mistake_reason || 'formula_error'}
                          onChange={(e) => {
                            storageService.updateMistakeReason(item.id, e.target.value as MistakeReason);
                            loadMistakes();
                          }}
                          className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        >
                          <option value="formula_error">Sai công thức Toán</option>
                          <option value="language_misinterpretation">Dịch nhầm đề Tiếng Anh</option>
                          <option value="careless_calculation">Tính toán ẩu / Nhầm số</option>
                          <option value="concept_gap">Hổng lý thuyết</option>
                          <option value="other">Lý do khác</option>
                        </select>
                      </div>
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Ghi chú cá nhân (vd: chú ý công thức nhân đôi, dịch nhầm từ coprime là số nguyên tố)..."
                        rows={2}
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveNote(item.id, item.mistake_reason || 'formula_error')}
                          className="px-3 py-1 rounded bg-indigo-600 text-white font-bold text-xs"
                        >
                          Lưu Ghi Chú
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-slate-600 dark:text-slate-300 italic">
                        {item.notes ? (
                          <span>💡 <strong>Ghi chú:</strong> {item.notes}</span>
                        ) : (
                          <span className="text-slate-400">Chưa có ghi chú lý do sai.</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditingNoteId(item.id);
                          setNoteText(item.notes || '');
                        }}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold shrink-0"
                      >
                        {item.notes ? 'Chỉnh sửa ghi chú' : '+ Thêm ghi chú lý do sai'}
                      </button>
                    </>
                  )}
                </div>

                {/* Detailed Solution Reveal */}
                <details className="mt-3 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <summary className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Xem lời giải chi tiết
                  </summary>
                  <div className="p-3 mt-2 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 leading-relaxed">
                    <MathRenderer content={q.solution_en} />
                    {q.solution_vi && (
                      <div className="mt-2 pt-2 border-t border-indigo-100/60 dark:border-indigo-900/60 italic text-slate-600 dark:text-slate-400">
                        <MathRenderer content={q.solution_vi} />
                      </div>
                    )}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
