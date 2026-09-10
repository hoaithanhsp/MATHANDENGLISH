import React, { useState, useEffect } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Printer,
  Trash2,
  Share2,
  Upload,
  Calendar,
  Layers,
  CheckCircle2,
  Eye,
  Plus,
  Languages
} from 'lucide-react';
import { Exam, Question } from '../../types';
import { exportExamToDocx } from '../../utils/docxExport';
import { printExamOrNotes, printHaiPhongExam } from '../../utils/printPdf';
import MathRenderer from '../MathRenderer';

interface ExamManagementProps {
  exams: Exam[];
  onSaveExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
  onNavigateToGenerate: () => void;
}

export const ExamManagement: React.FC<ExamManagementProps> = ({
  exams,
  onSaveExam,
  onDeleteExam,
  onNavigateToGenerate,
}) => {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(exams[0] || null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [jsonUploadText, setJsonUploadText] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [viewSolutions, setViewSolutions] = useState(false);

  // Tự động đồng bộ selectedExam khi danh sách exams thay đổi
  useEffect(() => {
    if (!selectedExam && exams.length > 0) {
      setSelectedExam(exams[0]);
    } else if (selectedExam && !exams.find((e) => e.id === selectedExam.id)) {
      setSelectedExam(exams[0] || null);
    }
  }, [exams, selectedExam]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTogglePublish = (exam: Exam) => {
    const updated = { ...exam, is_published: !exam.is_published };
    onSaveExam(updated);
    if (selectedExam?.id === exam.id) {
      setSelectedExam(updated);
    }
  };

  // Upload custom test via JSON
  const handleUploadCustomExam = () => {
    setUploadError('');
    try {
      const parsed = JSON.parse(jsonUploadText);
      const questions: Question[] = (parsed.questions || parsed).map((q: any, i: number) => ({
        id: `custom-q-${Date.now()}-${i + 1}`,
        exam_id: `custom-exam-${Date.now()}`,
        part: q.part || (i < 12 ? 'PART_1' : 'PART_2'),
        order_index: q.order_index || i + 1,
        strand: q.strand || 'algebra_calculus',
        topic: q.topic || 'Custom Topic',
        difficulty: q.difficulty || 'application',
        question_en: q.question_en || '',
        question_vi: q.question_vi || '',
        options_en: q.options_en || (q.part === 'PART_1' ? ['A', 'B', 'C', 'D'] : undefined),
        options_vi: q.options_vi || undefined,
        correct_answer: q.correct_answer || 'A',
        acceptable_answers: q.acceptable_answers || [],
        solution_en: q.solution_en || '',
        solution_vi: q.solution_vi || '',
      }));

      const newExam: Exam = {
        id: `custom-exam-${Date.now()}`,
        title: parsed.title || 'Đề Thi Tự Soạn (Upload)',
        description: parsed.description || 'Đề thi do giáo viên tải lên định dạng JSON.',
        mode: parsed.mode || 'bilingual',
        duration_minutes: parsed.duration_minutes || 90,
        is_published: true,
        access_code: `HP-UP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        exam_type: 'custom',
        created_at: new Date().toISOString(),
        questions,
      };

      onSaveExam(newExam);
      setSelectedExam(newExam);
      setShowUploadModal(false);
      setJsonUploadText('');
    } catch (err: any) {
      setUploadError(`JSON không hợp lệ: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Ngân Hàng Đề Thi & Quản Lý Giao Đề
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tổng hợp các đề thi chuẩn ma trận Hải Phòng, tạo mã phòng thi (Exam Code), xuất DOCX/PDF
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            Tải Lên Đề Tự Soạn (JSON)
          </button>
          <button
            onClick={onNavigateToGenerate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Tạo Đề Mới (AI)
          </button>
        </div>
      </div>

      {/* Main Grid: Exam List on Left, Detail Viewer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Danh sách đề thi ({exams.length})
          </h3>

          <div className="space-y-2.5">
            {exams.length > 0 ? (
              exams.map((exam) => {
                const isSelected = selectedExam?.id === exam.id;
                return (
                  <div
                    key={exam.id}
                    onClick={() => setSelectedExam(exam)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-500 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                        {exam.title}
                      </span>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                          exam.is_published
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {exam.is_published ? 'Đang mở' : 'Bản nháp'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                      <span>{exam.questions?.length || 22} câu hỏi</span>
                      <span>•</span>
                      <span>{exam.duration_minutes} phút</span>
                      <span>•</span>
                      <span>{exam.mode === 'bilingual' ? 'Song ngữ' : 'Tiếng Anh'}</span>
                    </div>

                    {/* Access Code & Quick Copy */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Mã thi:</span>
                        <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                          {exam.access_code}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(exam.access_code);
                        }}
                        className="p-1 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400"
                        title="Sao chép mã phòng thi"
                      >
                        {copiedCode === exam.access_code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-slate-400 text-xs space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Chưa có đề thi nào</p>
                <p className="text-[11px] text-slate-400">
                  Thầy/Cô hãy bấm "Tạo Đề Mới (AI)" hoặc tải lên đề tự soạn.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Detail */}
        <div className="lg:col-span-2 space-y-4">
          {selectedExam ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
              {/* Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                      Mã đề: {selectedExam.access_code}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(selectedExam.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedExam.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {selectedExam.description}
                  </p>
                </div>

                {/* Status Toggle & Delete */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(selectedExam)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      selectedExam.is_published
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 border-slate-300 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {selectedExam.is_published ? 'Đang Mở Thi' : 'Đang Khóa Thi'}
                  </button>
                  <button
                    onClick={() => onDeleteExam(selectedExam.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    title="Xóa đề thi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Assignment & Share Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50/70 to-emerald-50/70 dark:from-teal-950/30 dark:to-emerald-950/30 border border-teal-100 dark:border-teal-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    Giao Đề Cho Học Sinh (Mã Phòng Thi)
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Học sinh truy cập tab "Vào Phòng Thi" và nhập mã:
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 font-mono text-sm font-bold text-teal-700 dark:text-teal-300">
                    {selectedExam.access_code}
                  </div>
                  <button
                    onClick={() => handleCopyCode(selectedExam.access_code)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-xs"
                  >
                    {copiedCode === selectedExam.access_code ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Đã Copy!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Mã
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Export Actions & View Solutions toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Xuất bản đề thi:</span>
                  <button
                    onClick={() => exportExamToDocx({ exam: selectedExam, includeSolutions: false })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    DOCX (Đề Bài)
                  </button>
                  <button
                    onClick={() => exportExamToDocx({ exam: selectedExam, includeSolutions: true })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-500" />
                    DOCX (Kèm Đáp Án)
                  </button>
                  <button
                    onClick={() => printHaiPhongExam(selectedExam, { sheetType: 'question_sheet' })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition"
                    title="In Đề Thi chuẩn mẫu Sở GD&ĐT Hải Phòng (Question Sheet)"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    In Đề Thi (PDF)
                  </button>
                  <button
                    onClick={() => printHaiPhongExam(selectedExam, { sheetType: 'solution_sheet' })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition"
                    title="In Hướng Dẫn Chấm & Đáp Án chuẩn mẫu Sở GD&ĐT Hải Phòng (Solution Sheet)"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    In Đáp Án (PDF)
                  </button>
                </div>

                <button
                  onClick={() => setViewSolutions(!viewSolutions)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {viewSolutions ? 'Ẩn Lời Giải' : 'Hiện Lời Giải Chi Tiết'}
                </button>
              </div>

              {/* Questions Stream */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {(selectedExam.questions || []).map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-900/40"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                          Câu {q.order_index}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {q.part === 'PART_1' ? 'Trắc nghiệm 4 lựa chọn' : 'Trả lời ngắn (Điền đáp số)'}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        {q.difficulty}
                      </span>
                    </div>

                    {/* 1. Phần Câu Hỏi Tiếng Anh */}
                    <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white mb-2 leading-relaxed">
                      <MathRenderer content={q.question_en} />
                    </div>

                    {/* 2. Phần Bản Dịch Tiếng Việt (Tách biệt rõ ràng, chỉ dịch câu hỏi) */}
                    {selectedExam.mode === 'bilingual' && q.question_vi && (
                      <div className="mb-3 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-teal-600 dark:text-teal-400 mb-1">
                          <Languages className="w-3.5 h-3.5" />
                          <span>Bản dịch Tiếng Việt:</span>
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                          <MathRenderer content={q.question_vi} />
                        </div>
                      </div>
                    )}

                    {q.part === 'PART_1' && q.options_en && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs my-2">
                        {q.options_en.map((opt, i) => {
                          const letter = ['A', 'B', 'C', 'D'][i];
                          const isCorrect = q.correct_answer.trim().toUpperCase() === letter;
                          return (
                            <div
                              key={i}
                              className={`p-2 rounded-lg border flex items-center justify-between ${
                                isCorrect && viewSolutions
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold">{letter}.</span>
                                <MathRenderer content={opt.replace(/^[A-D]\.\s*/, '')} inline />
                              </div>
                              {isCorrect && viewSolutions && (
                                <span className="text-[10px] font-bold text-emerald-600">ĐÚNG</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.part === 'PART_2' && viewSolutions && (
                      <div className="my-2 p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Đáp số:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {q.correct_answer}
                        </span>
                      </div>
                    )}

                    {viewSolutions && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Lời giải: </span>
                        <MathRenderer content={q.solution_en} />
                        {q.solution_vi && (
                          <div className="mt-1 italic text-slate-500">
                            <MathRenderer content={q.solution_vi} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                Ngân Hàng Đề Thi Đang Trống
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Chưa có đề thi nào được lưu trữ. Thầy/Cô hãy bắt đầu bằng cách bấm nút <strong>"Tạo Đề Mới (AI)"</strong> để tạo đề thi chuẩn ma trận Hải Phòng hoặc <strong>"Tải Lên Đề Tự Soạn (JSON)"</strong>.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={onNavigateToGenerate}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition"
                >
                  Tạo Đề Mới Bằng AI
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-700">
              Chọn một đề thi từ danh sách bên trái để xem chi tiết.
            </div>
          )}
        </div>
      </div>

      {/* Upload Custom Test Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Tải Lên Đề Thi Tự Soạn (Định dạng JSON)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dán cấu trúc JSON đề thi (hoặc danh sách câu hỏi) có các trường: title, mode, questions (mỗi câu gồm question_en, options_en, correct_answer, solution_en).
            </p>

            <textarea
              rows={10}
              value={jsonUploadText}
              onChange={(e) => setJsonUploadText(e.target.value)}
              placeholder={`{\n  "title": "Đề Khảo Sát Đội Tuyển Tháng 10",\n  "questions": [\n    {\n      "order_index": 1,\n      "part": "PART_1",\n      "strand": "algebra_calculus",\n      "difficulty": "understanding",\n      "question_en": "Compute $\\\\lim_{x \\\\to 0} \\\\frac{\\\\sin x}{x}$",\n      "options_en": ["A. 0", "B. 1", "C. 2", "D. $\\\\infty$"],\n      "correct_answer": "B",\n      "solution_en": "Standard limit equals 1."\n    }\n  ]\n}`}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            {uploadError && (
              <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg">
                {uploadError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleUploadCustomExam}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition"
              >
                Nhập Đề Thi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
