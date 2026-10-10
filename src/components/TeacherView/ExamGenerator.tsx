import React, { useState, useEffect, useMemo } from 'react';
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
  Play,
  TrendingUp,
  Activity,
  Radio,
  History,
  RotateCcw,
  Copy,
  Check,
  Calendar,
  Clock,
  Search,
  Filter,
  BookOpen,
} from 'lucide-react';
import { Exam, Question, ExamMode, ExamType, MathStrand, CognitiveLevel, Assignment } from '../../types';
import MathRenderer from '../MathRenderer';
import { exportExamToDocx } from '../../utils/docxExport';
import { printExamOrNotes, printHaiPhongExam } from '../../utils/printPdf';
import { generateExam, generateTopicPractice, regenerateSingleQuestion, TopicQuestionType } from '../../services/geminiService';
import { storageService } from '../../services/storageService';

interface ExamGeneratorProps {
  onSaveExam: (exam: Exam) => void;
  onNavigateToBank: () => void;
  isStudentMode?: boolean;
  onStartTestNow?: (exam: Exam) => void;
  onDeleteExam?: (id: string) => void;
  exams?: Exam[];
  assignments?: Assignment[];
}

export const ExamGenerator: React.FC<ExamGeneratorProps> = ({
  onSaveExam,
  onNavigateToBank,
  isStudentMode = false,
  onStartTestNow,
  onDeleteExam,
  exams = [],
  assignments = [],
}) => {
  // Realtime Live Stats listeners
  const [aiQuestsLive, setAiQuestsLive] = useState<number>(() => storageService.getAiQuestsToday());
  const [onlineStudents, setOnlineStudents] = useState<number>(0);

  // Tab View: 'create' (Soạn / Sinh đề AI) hoặc 'history' (Lịch sử đề đã tạo)
  const [generatorView, setGeneratorView] = useState<'create' | 'history'>('create');

  // Input states
  const [examTitle, setExamTitle] = useState(
    isStudentMode
      ? 'Đề Tự Luyện HSG Toán Tiếng Anh (Cá Nhân)'
      : 'Đề Thi Tuyển Chọn Đội Tuyển HSG Toán THPT (Mới)'
  );
  const [mode, setMode] = useState<ExamMode>('bilingual');
  const [examType, setExamType] = useState<ExamType>('haiphong_matrix');
  const [questionCount, setQuestionCount] = useState<number>(22);
  const [topicQuestionCount, setTopicQuestionCount] = useState<number>(6);
  const [topicQuestionType, setTopicQuestionType] = useState<TopicQuestionType>('mixed');
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

  // Active exam tracking for current session
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [currentAccessCode, setCurrentAccessCode] = useState<string | null>(null);
  const [autoSavedNotice, setAutoSavedNotice] = useState<{ show: boolean; accessCode: string; title: string } | null>(null);

  // History filtering & actions
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'bilingual' | 'english_only' | 'topic_practice'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const unsubQuests = storageService.onAiQuestsChanged((count) => {
      setAiQuestsLive(count);
    });
    const unsubSessions = storageService.onActiveSessionsCountChanged((active) => {
      setOnlineStudents(active);
    });
    return () => {
      unsubQuests();
      unsubSessions();
    };
  }, []);

  // Lấy danh sách đề thi đã tạo (bao gồm cả đề lưu trong storageService và exams prop)
  const historyExams = useMemo(() => {
    const rawList = storageService.getGeneratedExams();
    const map = new Map<string, Exam>();
    for (const e of rawList) {
      if (e && e.id) map.set(e.id, e);
    }
    for (const e of exams) {
      if (e && e.id && (e.is_ai_generated || e.id.startsWith('exam-') || e.id.startsWith('practice-') || e.exam_type === 'topic_practice')) {
        map.set(e.id, e);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  }, [exams, successSaved, autoSavedNotice]);

  // Lọc danh sách lịch sử đề thi
  const filteredHistoryExams = useMemo(() => {
    return historyExams.filter((exam) => {
      const q = historySearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        (exam.title && exam.title.toLowerCase().includes(q)) ||
        (exam.access_code && exam.access_code.toLowerCase().includes(q)) ||
        (exam.topic_focus && exam.topic_focus.toLowerCase().includes(q)) ||
        (exam.description && exam.description.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (historyFilter === 'bilingual') return exam.mode === 'bilingual';
      if (historyFilter === 'english_only') return exam.mode === 'english_only';
      if (historyFilter === 'topic_practice') return exam.exam_type === 'topic_practice';
      return true;
    });
  }, [historyExams, historySearch, historyFilter]);

  // Sao chép mã phòng thi
  const handleCopyCode = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Mở ra làm lại đề thi từ lịch sử
  const handleRetakeExamFromHistory = (exam: Exam) => {
    const currentUser = storageService.getCurrentUser();
    if (currentUser?.id) {
      storageService.clearExamAutoSave(exam.id, currentUser.id);
    }
    if (onStartTestNow) {
      onStartTestNow(exam);
    } else {
      // Nếu không có onStartTestNow trực tiếp, nạp vào preview và báo người dùng
      handleLoadExamToEditor(exam);
    }
  };

  // Nạp lại đề thi vào editor KaTeX preview để xem lời giải hoặc hiệu chỉnh
  const handleLoadExamToEditor = (exam: Exam) => {
    setExamTitle(exam.title);
    setMode(exam.mode);
    setExamType(exam.exam_type || 'haiphong_matrix');
    setCurrentExamId(exam.id);
    setCurrentAccessCode(exam.access_code);
    setGeneratedQuestions(exam.questions || []);
    setGeneratorView('create');
    setAutoSavedNotice({
      show: true,
      accessCode: exam.access_code,
      title: exam.title,
    });
  };

  // Xóa đề khỏi lịch sử
  const handleDeleteExamFromHistory = async (examId: string) => {
    await storageService.deleteExam(examId);
    if (onDeleteExam) {
      onDeleteExam(examId);
    }
    setDeleteConfirmId(null);
  };

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
      storageService.incrementAiQuests(1);

      // Cập nhật lại đề đã lưu trong kho nếu có currentExamId
      if (currentExamId) {
        const updatedExam: Exam = {
          id: currentExamId,
          title: examTitle.trim(),
          description: `Đề thi ${mode === 'bilingual' ? 'Song ngữ Anh - Việt' : 'Full Tiếng Anh'} chuẩn ma trận Sở GD&ĐT Hải Phòng. ${updated.length} câu / 90 phút.`,
          mode,
          duration_minutes: 90,
          is_published: true,
          access_code: currentAccessCode || `HP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${new Date().getFullYear()}`,
          exam_type: examType,
          created_at: new Date().toISOString(),
          questions: updated,
          is_ai_generated: true,
          topic_focus: topicPrompt.trim() || undefined,
        };
        await storageService.saveExam(updatedExam);
        onSaveExam(updatedExam);
      }
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
  // TỰ ĐỘNG LƯU VÀO LỊCH SỬ ĐỀ NGAY SAU KHI SINH XONG
  const handleGenerate = async () => {
    if (examType === 'topic_practice' && (!Number.isInteger(topicQuestionCount) || topicQuestionCount < 1 || topicQuestionCount > 50)) {
      setErrorMsg('Số lượng câu hỏi chuyên đề phải từ 1 đến 50.');
      return;
    }
    if (examType === 'topic_practice' && !topicPrompt.trim()) {
      setErrorMsg('Vui lòng nhập chủ đề hoặc yêu cầu trọng tâm trước khi tạo đề.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');
    setSuccessSaved(false);
    setAutoSavedNotice(null);

    try {
      const newExamId = `exam-${Date.now()}`;
      const newAccessCode = `HP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${new Date().getFullYear()}`;

      const rawQuestions = examType === 'topic_practice'
        ? await generateTopicPractice({
            topic: topicPrompt.trim() || 'High School Gifted Mathematics',
            mode,
            count: topicQuestionCount,
            questionType: topicQuestionType,
            difficulty: 'mixed',
            onModelSwitch: (from, to) => {
              console.info(`Chuyển model tạo đề chuyên đề: ${from} → ${to}`);
            },
          })
        : await generateExam({
            topicPrompt,
            mode,
            examType,
            questionCount: examType === 'haiphong_matrix' ? 22 : questionCount,
            customDocumentText: documentText,
          });

      const questions: Question[] = (rawQuestions || []).map((q: any, i: number) => ({
        id: `gen-q-${Date.now()}-${i + 1}`,
        exam_id: newExamId,
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
      setCurrentExamId(newExamId);
      setCurrentAccessCode(newAccessCode);

      // Tự động ghi nhận số lượng quest AI đã phục vụ trực tuyến hôm nay
      storageService.incrementAiQuests(questions.length);

      // TỰ ĐỘNG LƯU VÀO KHO / LỊCH SỬ ĐỀ THI
      const autoSavedExam: Exam = {
        id: newExamId,
        title: examTitle.trim() || (isStudentMode ? 'Đề Tự Luyện HSG Toán Tiếng Anh' : 'Đề Thi Tuyển Chọn Đội Tuyển HSG Toán THPT'),
        description: `Đề thi ${mode === 'bilingual' ? 'Song ngữ Anh - Việt' : 'Full Tiếng Anh'} chuẩn ma trận Sở GD&ĐT Hải Phòng. ${questions.length} câu / 90 phút.`,
        mode,
        duration_minutes: 90,
        is_published: true,
        access_code: newAccessCode,
        exam_type: examType,
        created_at: new Date().toISOString(),
        questions: questions,
        is_ai_generated: true,
        topic_focus: topicPrompt.trim() || undefined,
      };

      await storageService.saveExam(autoSavedExam);
      onSaveExam(autoSavedExam);
      setSuccessSaved(true);
      setAutoSavedNotice({
        show: true,
        accessCode: newAccessCode,
        title: autoSavedExam.title,
      });
    } catch (err: any) {
      console.error('Exam generation failed:', err);
      setErrorMsg(err?.message || 'Không thể tạo đề lúc này. Vui lòng thử lại sau.');
      setGeneratedQuestions(null);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save current generated exam manually
  const handleSaveExam = async (startNow = false) => {
    if (!generatedQuestions || generatedQuestions.length === 0) return;

    const examId = currentExamId || `exam-${Date.now()}`;
    const accessCode = currentAccessCode || `HP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${new Date().getFullYear()}`;
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
      is_ai_generated: true,
      topic_focus: topicPrompt.trim() || undefined,
    };

    await storageService.saveExam(newExam);
    onSaveExam(newExam);
    setSuccessSaved(true);
    setCurrentExamId(examId);
    setCurrentAccessCode(accessCode);
    setAutoSavedNotice({
      show: true,
      accessCode: accessCode,
      title: newExam.title,
    });

    if (startNow && onStartTestNow) {
      const currentUser = storageService.getCurrentUser();
      if (currentUser?.id) {
        storageService.clearExamAutoSave(examId, currentUser.id);
      }
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
      id: currentExamId || 'temp',
      title: examTitle,
      mode,
      duration_minutes: 90,
      is_published: true,
      access_code: currentAccessCode || 'HP-PREVIEW',
      exam_type: examType,
      created_at: new Date().toISOString(),
      questions: generatedQuestions,
      is_ai_generated: true,
    };
    await exportExamToDocx({ 
      exam: tempExam, 
      includeSolutions, 
      mode: mode === 'bilingual' ? 'bilingual' : 'english_only',
    });
  };

  // Add a new empty question
  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `q-custom-${Date.now()}`,
      exam_id: currentExamId || 'custom-exam',
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

  // ==========================================
  // REALTIME LIVE METRICS (Tính toán trực tuyến)
  // ==========================================
  // 1. ACTIVE EXAMS (Số đề thi thực tế trên Firebase)
  const effectiveExams = exams && exams.length > 0 ? exams : storageService.getExams();
  const activeExamsList = effectiveExams.filter((e) => e.is_published !== false);
  const activeExamsCount = activeExamsList.length > 0 ? activeExamsList.length : effectiveExams.length;

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newExamsThisWeek = effectiveExams.filter((e) => {
    const t = new Date(e.created_at || 0).getTime();
    return !isNaN(t) && t >= oneWeekAgo;
  }).length;

  // 2. STUDENT AVG. SCORE (Điểm TB học sinh - Thang 10 từ Firebase Realtime)
  const effectiveAssignments = assignments && assignments.length > 0 ? assignments : storageService.getAssignments();
  const validSubmissions = effectiveAssignments.filter(
    (a) => typeof a.score === 'number' && !isNaN(a.score)
  );
  const totalSubmissions = validSubmissions.length;

  let avgScoreDisplay = '--/10';
  let performanceText = 'Chờ bài nộp trực tuyến';
  let isPerfPositive = true;

  if (totalSubmissions > 0) {
    const sumScore = validSubmissions.reduce((sum, a) => sum + (a.score ?? 0), 0);
    const rawAvg = sumScore / totalSubmissions;
    // Điểm thang 20.00 chuẩn Hải Phòng quy đổi sang thang 10
    const avg10 = rawAvg > 10 ? rawAvg / 2 : rawAvg;
    avgScoreDisplay = `${avg10.toFixed(2)}/10`;

    if (totalSubmissions >= 2) {
      const sorted = [...validSubmissions].sort(
        (a, b) =>
          new Date(a.submitted_at || a.created_at || 0).getTime() -
          new Date(b.submitted_at || b.created_at || 0).getTime()
      );
      const mid = Math.floor(sorted.length / 2);
      const older = sorted.slice(0, mid);
      const newer = sorted.slice(mid);
      const avgOld = older.reduce((s, a) => s + (a.score ?? 0), 0) / older.length;
      const avgNew = newer.reduce((s, a) => s + (a.score ?? 0), 0) / newer.length;
      const diffRaw = avgNew - avgOld;
      const diff10 = rawAvg > 10 ? diffRaw / 2 : diffRaw;
      isPerfPositive = diff10 >= 0;
      performanceText = `${diff10 >= 0 ? '+' : ''}${diff10.toFixed(1)} performance (${totalSubmissions} bài nộp)`;
    } else {
      performanceText = `Từ ${totalSubmissions} bài nộp thực tế`;
    }
  }

  // 3. AI QUESTS TODAY (Số câu hỏi / quest do AI tạo ra hôm nay)
  const todayKey = storageService.getTodayDateKey();
  const todayExams = effectiveExams.filter((e) => (e.created_at || '').slice(0, 10) === todayKey);
  const questionsFromTodayExams = todayExams.reduce((sum, e) => sum + (e.questions?.length || 22), 0);
  const displayAiQuests = Math.max(aiQuestsLive, questionsFromTodayExams);

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
            {isStudentMode ? 'AI Exam Generator — Tự tạo đề luyện tập' : 'Teacher Dashboard & AI Generator'}
          </h2>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-200 dark:shadow-none transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isGenerating ? 'Đang tạo...' : isStudentMode ? '+ Tạo đề thi mới' : '+ Generate New Exam'}
          </button>
        </div>
      </div>

      {/* 3 Metric Cards — Trực tuyến thời gian thực (Live Firebase Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: ACTIVE EXAMS */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs relative overflow-hidden transition hover:border-teal-300 dark:hover:border-teal-700">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              {isStudentMode ? 'Đề Thi Khả Dụng' : 'Active Exams'}
            </div>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Cloud
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
            <span>{activeExamsCount}</span>
            <span className="text-xs font-medium text-slate-400">bộ đề</span>
          </div>
          <div className="text-xs font-medium mt-1">
            {onlineStudents > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                {onlineStudents} học sinh đang thi trực tuyến
              </span>
            ) : newExamsThisWeek > 0 ? (
              <span className="text-emerald-500">↑ {newExamsThisWeek} this week</span>
            ) : (
              <span className="text-slate-400">Đã đồng bộ Firebase Realtime</span>
            )}
          </div>
        </div>

        {/* Card 2: STUDENT AVG. SCORE */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition hover:border-teal-300 dark:hover:border-teal-700">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              {isStudentMode ? 'Điểm TB Học Tập' : 'Student Avg. Score'}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {totalSubmissions > 0 ? `${totalSubmissions} bài đã nộp` : 'Realtime'}
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {avgScoreDisplay}
          </div>
          <div
            className={`text-xs font-medium mt-1 ${
              totalSubmissions === 0
                ? 'text-slate-400'
                : isPerfPositive
                ? 'text-emerald-500'
                : 'text-rose-500'
            }`}
          >
            {performanceText}
          </div>
        </div>

        {/* Card 3: AI QUESTS TODAY */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition hover:border-teal-300 dark:hover:border-teal-700">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              {isStudentMode ? 'Nhiệm Vụ AI Hôm Nay' : 'AI Quests Today'}
            </div>
            <span className="flex items-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
              <Sparkles className="w-3 h-3" />
              Gemini AI
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
            <span>{displayAiQuests}</span>
            <span className="text-xs font-medium text-slate-400">câu hỏi / lượt</span>
          </div>
          <div className="text-teal-500 text-xs font-medium mt-1">
            {displayAiQuests > 0
              ? 'HP Matrix compliant • Đã sinh hôm nay'
              : 'HP Matrix compliant'}
          </div>
        </div>
      </div>

      {/* Tab Navigation: Soạn / Sinh Đề AI vs Lịch Sử Đề Đã Tạo */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
          <button
            type="button"
            onClick={() => setGeneratorView('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              generatorView === 'create'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Soạn & Sinh Đề AI</span>
          </button>
          <button
            type="button"
            onClick={() => setGeneratorView('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              generatorView === 'history'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch Sử Đề Đã Tạo</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                generatorView === 'history'
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                  : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {historyExams.length}
            </span>
          </button>
        </div>

        {currentAccessCode && (
          <div className="flex items-center gap-2 text-xs text-slate-500 pr-2">
            <span>Mã đề hiện tại:</span>
            <span className="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
              {currentAccessCode}
            </span>
            <button
              type="button"
              onClick={() => handleCopyCode(currentAccessCode)}
              className="text-slate-400 hover:text-teal-600 p-1"
              title="Sao chép mã phòng"
            >
              {copiedCode === currentAccessCode ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {generatorView === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Cấu hình đề thi
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-700 dark:text-teal-300'
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
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-700 dark:text-teal-300'
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
                      ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-500'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="examType"
                    checked={examType === 'haiphong_matrix'}
                    onChange={() => setExamType('haiphong_matrix')}
                    className="mt-0.5 text-teal-600 focus:ring-teal-500"
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
                      ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-500'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="examType"
                    checked={examType === 'topic_practice'}
                    onChange={() => setExamType('topic_practice')}
                    className="mt-0.5 text-teal-600 focus:ring-teal-500"
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

            {examType === 'topic_practice' && (
              <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 p-3 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số lượng câu hỏi:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    step={1}
                    value={topicQuestionCount}
                    onChange={(e) => setTopicQuestionCount(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    aria-label="Số lượng câu hỏi đề luyện tập chuyên đề"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Nhập từ 1 đến 50 câu.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Loại câu hỏi:
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {([
                      ['mcq', 'Trắc nghiệm 4 đáp án'],
                      ['true_false', 'Đúng - Sai'],
                      ['short_answer', 'Trả lời ngắn'],
                      ['mixed', 'Hỗn hợp'],
                    ] as Array<[TopicQuestionType, string]>).map(([value, label]) => (
                      <label key={value} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition ${
                        topicQuestionType === value
                          ? 'border-teal-500 bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="topicQuestionType"
                          value={value}
                          checked={topicQuestionType === value}
                          onChange={() => setTopicQuestionType(value)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-xs font-semibold">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tải lên tài liệu tham khảo (Text / Markdown / File đề cũ):
              </label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center hover:border-teal-400 transition bg-slate-50/50 dark:bg-slate-900/50">
                <input
                  type="file"
                  id="doc-upload"
                  accept=".txt,.md,.json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center justify-center">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
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
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 transition shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Gemini đang sinh đề...</span>
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
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono font-semibold">22 Qs Total</span>
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
                  <div className="bg-teal-500 h-full w-[32%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Suite Card from Design Prototype */}
          <div className="bg-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-teal-100 dark:shadow-none flex flex-col justify-center items-center text-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2.5 text-lg">
              <Download className="w-5 h-5 text-white" />
            </div>
            <h5 className="font-bold text-sm mb-1">Export Suite</h5>
            <p className="text-xs text-teal-100/80 mb-3.5">
              Download DOCX with LaTeX intact or PDF
            </p>
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={() => handleExportDocx(false)}
                className="bg-white hover:bg-slate-50 text-teal-900 py-2 rounded-lg text-xs font-bold transition shadow-xs"
              >
                DOCX (LaTeX)
              </button>
              <button
                type="button"
                onClick={() => printExamOrNotes(examTitle)}
                className="bg-teal-500/80 hover:bg-teal-500 text-white py-2 rounded-lg text-xs font-bold transition border border-teal-400/40"
              >
                PDF (Print)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live KaTeX Preview & In-place Question Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col min-h-[600px]">
            {/* Auto Saved Banner Notice */}
            {autoSavedNotice?.show && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">Đề thi đã tự động lưu vào Lịch sử đề: </span>
                    <span className="font-mono font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 ml-1">
                      {autoSavedNotice.accessCode}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setGeneratorView('history')}
                    className="font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    Xem Trong Lịch Sử
                  </button>
                  {onStartTestNow && (
                    <button
                      type="button"
                      onClick={() => handleSaveExam(true)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
                    >
                      Vào Làm Bài Ngay →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-700 gap-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Bản xem trước trực quan KaTeX & hiệu chỉnh đề
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {generatedQuestions
                    ? `${generatedQuestions.length} câu hỏi (${generatedQuestions.filter((q) => q.part === 'PART_1').length} MCQ + ${generatedQuestions.filter((q) => q.part === 'PART_2').length} Điền đáp số)`
                    : 'Chưa có dữ liệu đề. Hãy bấm "Sinh đề thi bằng AI" để bắt đầu.'}
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
                    <Download className="w-3.5 h-3.5 text-teal-500" />
                    DOCX Đáp Án
                  </button>
                  <button
                    onClick={() => {
                      const tempExam: Exam = {
                        id: currentExamId || 'temp-exam',
                        title: examTitle,
                        mode,
                        duration_minutes: 90,
                        is_published: true,
                        access_code: currentAccessCode || 'HP-EXAM',
                        exam_type: examType,
                        created_at: new Date().toISOString(),
                        questions: generatedQuestions,
                        is_ai_generated: true,
                      };
                      printHaiPhongExam(tempExam, { sheetType: 'question_sheet' });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition"
                    title="In Đề Thi chuẩn mẫu Sở GD&ĐT Hải Phòng"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    In Đề Thi (PDF)
                  </button>
                  <button
                    onClick={() => {
                      const tempExam: Exam = {
                        id: currentExamId || 'temp-exam',
                        title: examTitle,
                        mode,
                        duration_minutes: 90,
                        is_published: true,
                        access_code: currentAccessCode || 'HP-EXAM',
                        exam_type: examType,
                        created_at: new Date().toISOString(),
                        questions: generatedQuestions,
                        is_ai_generated: true,
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
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-md shadow-teal-200 dark:shadow-none"
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
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-900/40 hover:border-teal-300 dark:hover:border-teal-700 transition"
                  >
                    {/* Question Header tags */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[10px] font-bold rounded uppercase tracking-wider">
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
                          className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          {editingIndex === idx ? 'Đóng sửa' : 'Sửa nhanh'}
                        </button>
                      </div>
                    </div>

                    {/* Question Statement Rendered with KaTeX */}
                    <div className="text-slate-900 dark:text-white text-sm leading-relaxed mb-2 font-serif">
                      <span className="font-sans font-bold text-teal-600 dark:text-teal-400 mr-2">
                        Question {q.order_index < 10 ? `0${q.order_index}` : q.order_index}:
                      </span>
                      <MathRenderer content={q.question_en} inline />
                    </div>

                    {/* Vietnamese Translation Callout (Separated clearly, question only) */}
                    {mode === 'bilingual' && q.question_vi && (
                      <div className="mb-3 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-sans">
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-teal-600 dark:text-teal-400 mb-1">
                          <Languages className="w-3.5 h-3.5" />
                          <span>Bản dịch tiếng Việt:</span>
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
                                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/50 text-teal-950 dark:text-teal-100 font-semibold shadow-xs'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-teal-300 dark:hover:border-teal-600'
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isCorrect
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {letter}
                              </span>
                              <div className="flex-1">
                                <MathRenderer content={opt.replace(/^[A-D]\.\s*/, '')} inline />
                              </div>
                              {isCorrect && (
                                <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 shrink-0">
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
                      <div className="my-2 p-2.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 flex items-center justify-between text-xs">
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
                      <div className="mt-4 p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-3 text-xs">
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
                  Chọn các thông số bên trái rồi bấm <strong>"Sinh đề thi bằng AI"</strong> để tạo bộ đề chuẩn.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      ) : (
        <div className="space-y-5">
          {/* Header Controls: Tìm kiếm và bộ lọc */}
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Tìm theo tên đề, mã code, chủ đề..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {historySearch && (
                <button
                  type="button"
                  onClick={() => setHistorySearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Lọc:
              </span>
              <button
                type="button"
                onClick={() => setHistoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  historyFilter === 'all'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Tất cả ({historyExams.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('bilingual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  historyFilter === 'bilingual'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Song ngữ
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('english_only')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  historyFilter === 'english_only'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Tiếng Anh
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('topic_practice')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  historyFilter === 'topic_practice'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Chuyên đề
              </button>
            </div>
          </div>

          {/* Danh sách thẻ đề thi trong lịch sử */}
          {filteredHistoryExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHistoryExams.map((exam) => {
                const qCount = exam.questions?.length || 22;
                const createdDate = exam.created_at ? new Date(exam.created_at) : null;
                const formattedDate = createdDate && !isNaN(createdDate.getTime())
                  ? createdDate.toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Gần đây';

                return (
                  <div
                    key={exam.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col justify-between hover:border-teal-400 dark:hover:border-teal-600 transition group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Đề AI
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {exam.mode === 'bilingual' ? 'Song ngữ' : 'Tiếng Anh'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {qCount} câu
                          </span>
                        </div>

                        {/* Access code with copy button */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-750 px-2 py-0.5 rounded">
                            {exam.access_code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(exam.access_code)}
                            className="p-1 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition"
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

                      {/* Exam Title */}
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                        {exam.title}
                      </h4>

                      {/* Exam Topic / Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {exam.topic_focus ? (
                          <span className="text-teal-700 dark:text-teal-300 font-medium">
                            🎯 Chủ đề: {exam.topic_focus}
                          </span>
                        ) : (
                          exam.description
                        )}
                      </p>

                      {/* Created Time & Duration */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formattedDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {exam.duration_minutes || 90} phút
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-750 space-y-2">
                      {/* Primary Retake Button */}
                      <button
                        type="button"
                        onClick={() => handleRetakeExamFromHistory(exam)}
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 transition shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Mở Ra Làm Lại Đề Này</span>
                      </button>

                      {/* Secondary Actions Row */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        {/* Xem & Hiệu chỉnh */}
                        <button
                          type="button"
                          onClick={() => handleLoadExamToEditor(exam)}
                          className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-650 transition flex items-center justify-center gap-1"
                          title="Nạp vào trình biên tập KaTeX để xem chi tiết hoặc chỉnh sửa"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Sửa</span>
                        </button>

                        {/* In Đề Thi PDF */}
                        <button
                          type="button"
                          onClick={() => printHaiPhongExam(exam, { sheetType: 'question_sheet' })}
                          className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-600 transition flex items-center justify-center gap-1"
                          title="In đề thi chuẩn mẫu Sở GD&ĐT Hải Phòng"
                        >
                          <Printer className="w-3 h-3" />
                          <span>In đề</span>
                        </button>

                        {/* Xuất DOCX */}
                        <button
                          type="button"
                          onClick={() =>
                            exportExamToDocx({
                              exam,
                              includeSolutions: false,
                              mode: exam.mode === 'bilingual' ? 'bilingual' : 'english_only',
                            })
                          }
                          className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition flex items-center justify-center gap-1"
                          title="Xuất file DOCX giữ nguyên LaTeX"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Word</span>
                        </button>

                        {/* Xóa */}
                        {deleteConfirmId === exam.id ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteExamFromHistory(exam.id)}
                            className="py-1.5 px-2 rounded-lg text-[11px] font-bold bg-rose-600 text-white hover:bg-rose-700 transition"
                            title="Bấm để xác nhận xóa vĩnh viễn"
                          >
                            Xóa!
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(exam.id)}
                            className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center justify-center"
                            title="Xóa đề này khỏi lịch sử"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center">
                <History className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {historySearch ? 'Không tìm thấy đề thi phù hợp' : 'Chưa có đề thi nào trong lịch sử'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {historySearch
                    ? 'Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc chọn bộ lọc khác.'
                    : 'Khi bạn sinh đề thi mới bằng AI, đề thi sẽ tự động được lưu vào đây để bạn có thể mở ra làm lại, in PDF hoặc xuất Word bất cứ khi nào.'}
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setHistorySearch('');
                    setHistoryFilter('all');
                    setGeneratorView('create');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sinh đề thi mới bằng AI ngay</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
