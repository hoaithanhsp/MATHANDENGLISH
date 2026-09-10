import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  Sliders,
  CheckCircle,
  Eye,
  Edit3,
  Download,
  Printer,
  AlertCircle,
  Save,
  RotateCw,
  PlusCircle,
  Trash2,
  Languages,
  Play
} from 'lucide-react';
import { Exam, Question, ExamMode, ExamType, MathStrand, CognitiveLevel } from '../../types';
import MathRenderer from '../MathRenderer';
import { exportExamToDocx } from '../../utils/docxExport';
import { printExamOrNotes, printHaiPhongExam } from '../../utils/printPdf';
import { generateExam, regenerateSingleQuestion } from '../../services/geminiService';

interface ExamGeneratorProps {
  onSaveExam: (exam: Exam) => void;
  onNavigateToBank: () => void;
  isStudentMode?: boolean;
  onStartTestNow?: (exam: Exam) => void;
}

export const ExamGenerator: React.FC<ExamGeneratorProps> = ({
  onSaveExam,
  onNavigateToBank,
  isStudentMode = false,
  onStartTestNow,
}) => {
  // Input states
  const [examTitle, setExamTitle] = useState(
    isStudentMode
      ? 'Đề Tự Luyện HSG Toán Tiếng Anh (Cá Nhân)'
      : 'Đề Thi Tuyển Chọn Đội Tuyển HSG Toán THPT (Mới)'
  );
  const [mode, setMode] = useState<ExamMode>('bilingual');
  const [examType, setExamType] = useState<ExamType>('haiphong_matrix');
  const [questionCount, setQuestionCount] = useState<number>(22);
  const [topicPrompt, setTopicPrompt] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Generation & editing states
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [swappingIndex, setSwappingIndex] = useState<number | null>(null);
  const [successSaved, setSuccessSaved] = useState(false);

  // Swap / Regenerate a single question
  const handleSwapQuestion = async (index: number) => {
    if (!generatedQuestions) return;
    const target = generatedQuestions[index];
    setSwappingIndex(index);
    try {
      const newQ = await regenerateSingleQuestion({
        originalQuestion: target,
        mode,
      });
      const updated = [...generatedQuestions];
      updated[index] = newQ;
      setGeneratedQuestions(updated);
    } catch (err: any) {
      alert('Không thể đổi câu hỏi: ' + (err?.message || 'Vui lòng thử lại'));
    } finally {
      setSwappingIndex(null);
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setDocumentText(text);
    };
    reader.readAsText(file);
  };

  // Generate Exam API Call (client-side via geminiService)
  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    setSuccessSaved(false);

    try {
      const rawQuestions = await generateExam({
        topicPrompt,
        mode,
        examType,
        questionCount: examType === 'haiphong_matrix' ? 22 : questionCount,
        customDocumentText: documentText,
      });

      const questions: Question[] = (rawQuestions || []).map((q: any, i: number) => ({
        id: `gen-q-${Date.now()}-${i + 1}`,
        exam_id: `exam-${Date.now()}`,
        part: q.part || (i < 12 ? 'PART_1' : 'PART_2'),
        order_index: q.order_index || i + 1,
        strand: q.strand || (i < 9 ? 'algebra_calculus' : i < 18 ? 'geometry_measurement' : 'statistics_discrete'),
        topic: q.topic || 'High School Gifted Math',
        difficulty: q.difficulty || (i < 6 ? 'understanding' : i < 15 ? 'application' : 'advanced'),
        question_en: q.question_en || '',
        question_vi: q.question_vi || '',
        options_en: q.options_en || (q.part === 'PART_1' ? ['A', 'B', 'C', 'D'] : undefined),
        options_vi: q.options_vi || undefined,
        correct_answer: q.correct_answer || 'A',
        acceptable_answers: q.acceptable_answers || [],
        solution_en: q.solution_en || '',
        solution_vi: q.solution_vi || '',
      }));

      setGeneratedQuestions(questions);
    } catch (err: any) {
      console.error('Exam generation failed:', err);
      setErrorMsg(`Lỗi khi tạo đề: ${err.message}. Vui lòng thử lại hoặc kiểm tra API Key trong Cài đặt.`);
      setGeneratedQuestions(null);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save current generated exam
  const handleSaveExam = async (startNow = false) => {
    if (!generatedQuestions || generatedQuestions.length === 0) return;

    const examId = `exam-${Date.now()}`;
    const accessCode = `HP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${new Date().getFullYear()}`;
    const formattedQuestions = generatedQuestions.map((q, idx) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${idx + 1}`,
      exam_id: examId,
      order_index: idx + 1,
    }));

    const newExam: Exam = {
      id: examId,
      title: examTitle.trim() || (isStudentMode ? 'Đề Tự Luyện HSG Toán Tiếng Anh' : 'Đề Thi Tuyển Chọn Đội Tuyển HSG Toán THPT'),
      description: `Đề thi ${mode === 'bilingual' ? 'Song ngữ Anh - Việt' : 'Full Tiếng Anh'} chuẩn ma trận Sở GD&ĐT Hải Phòng. ${generatedQuestions.length} câu / 90 phút.`,
      mode,
      duration_minutes: 90,
      is_published: true,
      access_code: accessCode,
      exam_type: examType,
      created_at: new Date().toISOString(),
      questions: formattedQuestions,
    };

    await Promise.resolve(onSaveExam(newExam));
    setSuccessSaved(true);

    if (startNow && onStartTestNow) {
      onStartTestNow(newExam);
    } else {
      setTimeout(() => {
        onNavigateToBank();
      }, 1200);
    }
  };

  // Export DOCX
  const handleExportDocx = async (includeSolutions: boolean) => {
    if (!generatedQuestions) return;
    const tempExam: Exam = {
      id: 'temp',
      title: examTitle,
      mode,
      duration_minutes: 90,
      is_published: true,
      access_code: 'HP-PREVIEW',
      exam_type: examType,
      created_at: new Date().toISOString(),
      questions: generatedQuestions,
    };
    await exportExamToDocx({ 
      exam: tempExam, 
      includeSolutions, 
      includeVietnamese: mode === 'bilingual' 
    });
  };

  // Add a new empty question
  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `q-custom-${Date.now()}`,
      order_index: (generatedQuestions?.length || 0) + 1,
      part: (generatedQuestions?.length || 0) < 12 ? 'PART_1' : 'PART_2',
      strand: 'algebra_calculus',
      topic: 'Custom Topic',
      difficulty: 'application',
      question_en: 'Enter your LaTeX math problem here: $f(x) = \\dots$',
      question_vi: 'Nhập câu hỏi tiếng Việt có công thức LaTeX...',
      options_en: ['A. ...', 'B. ...', 'C. ...', 'D. ...'],
      correct_answer: 'A',
      solution_en: 'Solution steps in English...',
      solution_vi: 'Lời giải chi tiết...',
    };
    setGeneratedQuestions([...(generatedQuestions || []), newQ]);
  };

  // Delete a question
  const handleDeleteQuestion = (index: number) => {
    if (!generatedQuestions) return;
    const updated = generatedQuestions.filter((_, i) => i !== index);
    setGeneratedQuestions(updated);
  };

  // Update a single question field
  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    if (!generatedQuestions) return;
    const updated = [...generatedQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setGeneratedQuestions(updated);
  };

  return (
    <div className="space-y-6">
      {/* Clean Minimalism Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-1">
            {isStudentMode
              ? 'Phòng Tự Tạo Đề Ôn Luyện • Trợ lý AI Khảo Thí Sở GD&ĐT Hải Phòng'
              : 'Chào mừng trở lại, Thầy Trần Hoài Thanh • THPT Khúc Thừa Dụ, TP.Hải Phòng'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isStudentMode ? 'AI Exam Generator — Tự Tạo Đề Luyện Tập' : 'Teacher Dashboard & AI Generator'}
          </h2>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isGenerating ? 'Đang tạo...' : isStudentMode ? '+ Tạo Đề Thi Mới' : '+ Generate New Exam'}
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            {isStudentMode ? 'Chuẩn Khảo Thí' : 'Active Exams'}
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {isStudentMode ? 'Ma Trận HP' : '14'}
          </div>
          <div className="text-emerald-500 text-xs font-medium mt-1">
            {isStudentMode ? '22 Câu / 90 Phút chuẩn Sở' : '↑ 2 this week'}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            {isStudentMode ? 'Ngôn Ngữ Học Thuật' : 'Student Avg. Score'}
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {isStudentMode ? 'Bilingual & EN' : '7.85/10'}
          </div>
          <div className="text-emerald-500 text-xs font-medium mt-1">
            {isStudentMode ? 'Chuẩn KaTeX & Thuật ngữ' : '+0.4 performance'}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            {isStudentMode ? 'Hỗ Trợ Lời Giải' : 'AI Quests Today'}
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {isStudentMode ? 'Instant AI' : '42'}
          </div>
          <div className="text-indigo-500 text-xs font-medium mt-1">
            {isStudentMode ? 'Tự chấm & Lời giải chi tiết' : 'HP Matrix compliant'}
          </div>
        </div>
      </div>

      {/* Configuration & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Cấu Hình Đề Thi
            </h3>

            {/* Exam Title */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tiêu đề đề thi:
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="VD: Đề thi chọn HSG TP Hải Phòng năm 2026"
              />
            </div>

            {/* Mode: Bilingual vs English Only */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Chế độ ngôn ngữ:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('bilingual')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    mode === 'bilingual'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🇻🇳 🇬🇧 Song ngữ Anh - Việt
                </button>
                <button
                  type="button"
                  onClick={() => setMode('english_only')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    mode === 'english_only'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🇬🇧 Full Tiếng Anh
                </button>
              </div>
            </div>

            {/* Exam Type */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Loại đề thi:
              </label>
              <div className="space-y-2">
                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                    examType === 'haiphong_matrix'
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="examType"
                    checked={examType === 'haiphong_matrix'}
                    onChange={() => setExamType('haiphong_matrix')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Chuẩn Ma trận Sở Hải Phòng (22 câu)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      6 Thông hiểu, 9 Vận dụng, 7 Vận dụng cao (9 Đại/Giải tích, 9 Hình học, 4 Rời rạc/Xác suất/Số học).
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                    examType === 'topic_practice'
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="examType"
                    checked={examType === 'topic_practice'}
                    onChange={() => setExamType('topic_practice')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Đề luyện tập chuyên đề trọng tâm
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Tùy chỉnh số lượng câu theo chủ đề chỉ định (VD: Dirichlet, 3 đường conic, dãy số).
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom Topic / Instruction Prompt */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Chủ đề trọng tâm hoặc yêu cầu đặc biệt (Tùy chọn):
              </label>
              <textarea
                rows={2}
                value={topicPrompt}
                onChange={(e) => setTopicPrompt(e.target.value)}
                placeholder="VD: Nhấn mạnh vào Nguyên lý Dirichlet và Thiết diện trong hình học không gian..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tải lên tài liệu tham khảo (Text / Markdown / File đề cũ):
              </label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center hover:border-indigo-400 transition bg-slate-50/50 dark:bg-slate-900/50">
                <input
                  type="file"
                  id="doc-upload"
                  accept=".txt,.md,.json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center justify-center">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {uploadedFileName ? uploadedFileName : 'Chọn tệp tài liệu tham khảo'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Hỗ trợ .txt, .md, .json</span>
                </label>
              </div>
              {documentText && (
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400">
                  <span>✓ Đã nạp {documentText.length} ký tự</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDocumentText('');
                      setUploadedFileName('');
                    }}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 transition shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Gemini đang sinh cấu trúc 22 câu...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Sinh Đề Thi Chuẩn Bằng AI</span>
                </>
              )}
            </button>
          </div>

          {/* Error / Alert notice */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* HP Matrix Distribution Card matching Design Prototype */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
            <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>HP Matrix Distribution</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold">22 Qs Total</span>
            </h4>
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Understanding (TH)</span>
                  <span className="text-slate-400 font-mono">6/22 (27%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[27%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Application (VD)</span>
                  <span className="text-slate-400 font-mono">9/22 (41%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-400 h-full w-[41%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Advanced (VDC)</span>
                  <span className="text-slate-400 font-mono">7/22 (32%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[32%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Suite Card from Design Prototype */}
          <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-100 dark:shadow-none flex flex-col justify-center items-center text-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2.5 text-lg">
              <Download className="w-5 h-5 text-white" />
            </div>
            <h5 className="font-bold text-sm mb-1">Export Suite</h5>
            <p className="text-xs text-indigo-100/80 mb-3.5">
              Download DOCX with LaTeX intact or PDF
            </p>
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={() => handleExportDocx(false)}
                className="bg-white hover:bg-slate-50 text-indigo-900 py-2 rounded-lg text-xs font-bold transition shadow-xs"
              >
                DOCX (LaTeX)
              </button>
              <button
                type="button"
                onClick={() => printExamOrNotes(examTitle)}
                className="bg-indigo-500/80 hover:bg-indigo-500 text-white py-2 rounded-lg text-xs font-bold transition border border-indigo-400/40"
              >
                PDF (Print)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live KaTeX Preview & In-place Question Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col min-h-[600px]">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-700 gap-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Bản Xem Trước Trực Quan KaTeX & Hiệu Chỉnh Đề
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {generatedQuestions
                    ? `${generatedQuestions.length} câu hỏi chuẩn ma trận (12 MCQ + 10 Short Answer)`
                    : 'Chưa có dữ liệu đề. Hãy bấm "Sinh Đề Thi Bằng AI" để bắt đầu.'}
                </span>
              </div>

              {generatedQuestions && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleExportDocx(false)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                    title="Xuất file DOCX giữ nguyên công thức LaTeX $...$"
                  >
                    <Download className="w-3.5 h-3.5" />
                    DOCX Đề Bài
                  </button>
                  <button
                    onClick={() => handleExportDocx(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                    title="Xuất file DOCX có kèm đáp án và lời giải chi tiết"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-500" />
                    DOCX Đáp Án
                  </button>
                  <button
                    onClick={() => {
                      const tempExam: Exam = {
                        id: 'temp-exam',
                        title: examTitle,
                        mode,
                        duration_minutes: 90,
                        is_published: true,
                        access_code: 'HP-EXAM',
                        exam_type: examType,
                        created_at: new Date().toISOString(),
                        questions: generatedQuestions,
                      };
                      printHaiPhongExam(tempExam, { sheetType: 'question_sheet' });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition"
                    title="In Đề Thi chuẩn mẫu Sở GD&ĐT Hải Phòng"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    In Đề Thi (PDF)
                  </button>
                  <button
                    onClick={() => {
                      const tempExam: Exam = {
                        id: 'temp-exam',
                        title: examTitle,
                        mode,
                        duration_minutes: 90,
                        is_published: true,
                        access_code: 'HP-EXAM',
                        exam_type: examType,
                        created_at: new Date().toISOString(),
                        questions: generatedQuestions,
                      };
                      printHaiPhongExam(tempExam, { sheetType: 'solution_sheet' });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition"
                    title="In Hướng Dẫn Chấm & Đáp Án chuẩn mẫu Sở GD&ĐT Hải Phòng"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    In Đáp Án (PDF)
                  </button>
                  {onStartTestNow && (
                    <button
                      onClick={() => handleSaveExam(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-200 dark:shadow-none"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Vào Làm Bài Ngay
                    </button>
                  )}
                  <button
                    onClick={() => handleSaveExam(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {successSaved
                      ? isStudentMode ? 'Đã Lưu Vào Kho Đề!' : 'Đã Lưu Vào Ngân Hàng!'
                      : isStudentMode ? 'Lưu Đề Tự Luyện' : 'Lưu Vào Ngân Hàng Đề'}
                  </button>
                </div>
              )}
            </div>

            {/* Questions List */}
            {generatedQuestions ? (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-900/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
                  >
                    {/* Question Header tags */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded uppercase tracking-wider">
                          {mode === 'bilingual' ? 'Bilingual' : 'English Only'}
                        </span>
                        <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded uppercase tracking-wider">
                          {q.part === 'PART_1' ? 'Part 1 (MCQ)' : 'Part 2 (Short Ans)'}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                          DIFF: {q.difficulty === 'understanding' ? 'LEVEL 1 (TH)' : q.difficulty === 'application' ? 'LEVEL 2 (VD)' : 'LEVEL 3 (VDC)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleSwapQuestion(idx)}
                          disabled={swappingIndex === idx}
                          className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
                          title="AI sinh câu hỏi khác cùng chuyên đề và độ khó thay thế câu này"
                        >
                          <RotateCw className={`w-3.5 h-3.5 ${swappingIndex === idx ? 'animate-spin' : ''}`} />
                          {swappingIndex === idx ? 'Đang đổi câu...' : 'Đổi câu khác (Swap)'}
                        </button>

                        <button
                          onClick={() => setEditingIndex(editingIndex === idx ? null : idx)}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          {editingIndex === idx ? 'Đóng sửa' : 'Sửa nhanh'}
                        </button>
                      </div>
                    </div>

                    {/* Question Statement Rendered with KaTeX */}
                    <div className="text-slate-900 dark:text-white text-sm leading-relaxed mb-2 font-serif">
                      <span className="font-sans font-bold text-indigo-600 dark:text-indigo-400 mr-2">
                        Question {q.order_index < 10 ? `0${q.order_index}` : q.order_index}:
                      </span>
                      <MathRenderer content={q.question_en} inline />
                    </div>

                    {/* Vietnamese Translation Callout (Separated clearly, question only) */}
                    {mode === 'bilingual' && q.question_vi && (
                      <div className="mb-3 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-sans">
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-indigo-600 dark:text-indigo-400 mb-1">
                          <Languages className="w-3.5 h-3.5" />
                          <span>Bản dịch Tiếng Việt:</span>
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                          <MathRenderer content={q.question_vi} />
                        </div>
                      </div>
                    )}

                    {/* Options if PART_1 */}
                    {q.part === 'PART_1' && q.options_en && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 text-xs font-sans">
                        {q.options_en.map((opt, oIdx) => {
                          const letters = ['A', 'B', 'C', 'D'];
                          const letter = letters[oIdx];
                          const isCorrect = q.correct_answer.trim().toUpperCase() === letter;
                          return (
                            <div
                              key={oIdx}
                              className={`p-3 rounded-xl border flex items-center space-x-3 transition-colors ${
                                isCorrect
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-100 font-semibold shadow-xs'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600'
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isCorrect
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {letter}
                              </span>
                              <div className="flex-1">
                                <MathRenderer content={opt.replace(/^[A-D]\.\s*/, '')} inline />
                              </div>
                              {isCorrect && (
                                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                                  ✓ Đáp án
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Short Answer if PART_2 */}
                    {q.part === 'PART_2' && (
                      <div className="my-2 p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          Đáp số đúng (Short-answer):
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                          {q.correct_answer}
                        </span>
                      </div>
                    )}

                    {/* Solution Preview */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-400">
                      <div className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                        Lời giải chi tiết (KaTeX Solution):
                      </div>
                      <MathRenderer content={q.solution_en} />
                      {mode === 'bilingual' && q.solution_vi && (
                        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 italic">
                          <MathRenderer content={q.solution_vi} />
                        </div>
                      )}
                    </div>

                    {/* In-place edit drawer */}
                    {editingIndex === idx && (
                      <div className="mt-4 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3 text-xs">
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          Hiệu chỉnh Câu {q.order_index}
                        </h4>

                        <div>
                          <label className="block font-medium mb-1">Nội dung câu hỏi tiếng Anh ($...$):</label>
                          <textarea
                            rows={2}
                            value={q.question_en}
                            onChange={(e) => updateQuestion(idx, 'question_en', e.target.value)}
                            className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white"
                          />
                        </div>

                        {mode === 'bilingual' && (
                          <div>
                            <label className="block font-medium mb-1">Dịch tiếng Việt:</label>
                            <textarea
                              rows={2}
                              value={q.question_vi || ''}
                              onChange={(e) => updateQuestion(idx, 'question_vi', e.target.value)}
                              className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-medium mb-1">Đáp án đúng:</label>
                            <input
                              type="text"
                              value={q.correct_answer}
                              onChange={(e) => updateQuestion(idx, 'correct_answer', e.target.value)}
                              className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block font-medium mb-1">Độ khó:</label>
                            <select
                              value={q.difficulty}
                              onChange={(e) => updateQuestion(idx, 'difficulty', e.target.value as CognitiveLevel)}
                              className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                            >
                              <option value="understanding">Thông hiểu</option>
                              <option value="application">Vận dụng</option>
                              <option value="advanced">Vận dụng cao</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block font-medium mb-1">Lời giải chi tiết tiếng Anh ($...$):</label>
                          <textarea
                            rows={2}
                            value={q.solution_en}
                            onChange={(e) => updateQuestion(idx, 'solution_en', e.target.value)}
                            className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Chưa có đề thi được hiển thị
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Chọn các thông số bên trái rồi bấm <strong>"Sinh Đề Thi Bằng AI"</strong> để tạo bộ đề chuẩn.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
