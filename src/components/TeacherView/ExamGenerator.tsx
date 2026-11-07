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
  BookmarkCheck,
  Layers,
  FileCheck,
  FileJson,
  AlertTriangle,
  X,
  Folder,
  FolderOpen,
  Timer,
  Shuffle,
  ListPlus,
  ChevronRight,
} from 'lucide-react';
import { Exam, Question, ExamMode, ExamType, MathStrand, CognitiveLevel, Assignment } from '../../types';
import MathRenderer from '../MathRenderer';
import TranslateButton from '../TranslateButton';
import {
  YEAR_FOLDER_2026_2027,
  YEAR_VARIANT_INFO,
  YearVariant,
  EXTRA_TOPIC_OPTIONS,
  CODE_901_BLUEPRINT,
  buildExtendedBlueprint,
  DURATION_PRESETS,
} from '../../data/examYearFolders';
import { exportExamToDocx } from '../../utils/docxExport';
import { printHaiPhongExam } from '../../utils/printPdf';
import { generateExam, generateTopicPractice, regenerateSingleQuestion, TopicQuestionType } from '../../services/geminiService';
import { storageService, SaveExamResult } from '../../services/storageService';

interface ExamGeneratorProps {
  /** Lưu đề vào kho (App → storageService). Trả về trạng thái lưu local/Firebase. */
  onSaveExam: (exam: Exam) => Promise<SaveExamResult | void> | void;
  onNavigateToBank: () => void;
  isStudentMode?: boolean;
  onStartTestNow?: (exam: Exam) => void;
  onDeleteExam?: (id: string) => void;
  exams?: Exam[];
  assignments?: Assignment[];
}

type SaveStatus = { kind: 'saving' | 'ok' | 'warn' | 'error'; message: string };

/** Ghi nhớ đề đang mở trong trình soạn để quay lại tab vẫn còn (đề đã nằm trong kho). */
const CURRENT_EXAM_STORAGE_KEY = 'hp_generator_current_exam_id';
/** Tự lưu chỉnh sửa vào kho sau khi ngừng gõ */
const AUTOSAVE_DELAY_MS = 2500;

const newAccessCode = () => `HP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${new Date().getFullYear()}`;

const rememberCurrentExam = (id: string | null) => {
  try {
    if (id) localStorage.setItem(CURRENT_EXAM_STORAGE_KEY, id);
    else localStorage.removeItem(CURRENT_EXAM_STORAGE_KEY);
  } catch {
    // ignore
  }
};

const safeFileName = (title: string) =>
  (title || 'De_thi')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'De_thi';

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
  /** Thời gian làm bài (phút) — học sinh tự động nộp bài khi hết giờ */
  const [durationMinutes, setDurationMinutes] = useState<number>(90);

  // Thư mục đề theo năm học (2026-2027)
  const [yearFolderOpen, setYearFolderOpen] = useState(false);
  const [yearVariant, setYearVariant] = useState<YearVariant | null>(null);
  const [extraTopicIds, setExtraTopicIds] = useState<string[]>([]);
  const [customExtraTopic, setCustomExtraTopic] = useState('');
  /** Hướng sinh đề của đề đang mở (gắn nhãn năm học khi lưu) */
  const [currentYearVariant, setCurrentYearVariant] = useState<YearVariant | undefined>(undefined);

  // Song ngữ: bản dịch tiếng Việt chỉ hiện khi bấm "Dịch"
  const [shownVi, setShownVi] = useState<Record<string, boolean>>({});
  const toggleVi = (key: string) => setShownVi((prev) => ({ ...prev, [key]: !prev[key] }));

  // Generation & editing states
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [swappingIndex, setSwappingIndex] = useState<number | null>(null);
  const [successSaved, setSuccessSaved] = useState(false);
  /** Có chỉnh sửa chưa lưu vào kho */
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus | null>(null);
  const [exportError, setExportError] = useState('');

  // Active exam tracking for current session
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [currentAccessCode, setCurrentAccessCode] = useState<string | null>(null);
  const [currentCreatedAt, setCurrentCreatedAt] = useState<string | null>(null);
  const [autoSavedNotice, setAutoSavedNotice] = useState<{ show: boolean; accessCode: string; title: string } | null>(null);

  // History filtering & actions
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'bilingual' | 'english_only' | 'topic_practice' | 'year_2026_2027'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<{ ok: boolean; text: string } | null>(null);

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
      (a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()
    );
  }, [exams, successSaved, autoSavedNotice, importMessage]);

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
      if (historyFilter === 'year_2026_2027') return exam.school_year === YEAR_FOLDER_2026_2027.school_year;
      return true;
    });
  }, [historyExams, historySearch, historyFilter]);

  // ==========================================
  // DỰNG ĐỐI TƯỢNG ĐỀ & LƯU VÀO KHO
  // ==========================================
  const buildExam = (questions: Question[], overrides: Partial<Exam> = {}): Exam => {
    const id = overrides.id || currentExamId || `exam-${Date.now()}`;
    const now = new Date().toISOString();
    const isTopic = examType === 'topic_practice';
    // Nhãn năm học theo đề đang mở (không theo lựa chọn hiện tại trong thư mục)
    const examYearVariant = 'year_variant' in overrides ? overrides.year_variant : currentYearVariant;
    const isYear = Boolean(examYearVariant) && !isTopic;
    const minutes = Math.min(300, Math.max(5, Math.round(durationMinutes) || 90));
    const langText = mode === 'bilingual' ? 'Song ngữ Anh - Việt' : 'Full Tiếng Anh';
    return {
      id,
      teacher_id: storageService.getCurrentUser()?.id,
      title: examTitle.trim() || (isStudentMode ? 'Đề Tự Luyện HSG Toán Tiếng Anh' : 'Đề Thi Tuyển Chọn Đội Tuyển HSG Toán THPT'),
      description: isTopic
        ? `Đề luyện tập chuyên đề ${langText}. ${questions.length} câu / ${minutes} phút.`
        : isYear
        ? `Thư mục ${YEAR_FOLDER_2026_2027.title} — ${YEAR_VARIANT_INFO[examYearVariant!].title} (dựa trên đề 2025 - 2026 Code 901). ${langText}. ${questions.length} câu / ${minutes} phút.`
        : `Đề thi ${langText} chuẩn ma trận Sở GD&ĐT Hải Phòng. ${questions.length} câu / ${minutes} phút.`,
      mode,
      duration_minutes: minutes,
      school_year: isYear ? YEAR_FOLDER_2026_2027.school_year : undefined,
      year_variant: isYear ? examYearVariant : undefined,
      is_published: true,
      access_code: currentAccessCode || newAccessCode(),
      exam_type: examType,
      created_at: currentCreatedAt || now,
      updated_at: now,
      questions: questions.map((q, idx) => ({
        ...q,
        id: q.id || `q-${Date.now()}-${idx + 1}`,
        exam_id: id,
        order_index: idx + 1,
      })),
      is_ai_generated: true,
      topic_focus: topicPrompt.trim() || undefined,
      ...overrides,
    };
  };

  /** Lưu đề vào kho; không bao giờ ném lỗi — trả về true nếu đề đã nằm ở ít nhất một nơi lưu. */
  const persistExam = async (exam: Exam): Promise<boolean> => {
    setSaveStatus({ kind: 'saving', message: 'Đang lưu vào Kho đề...' });
    try {
      const result = (await onSaveExam(exam)) || { localSaved: true, cloudSaved: null };
      setCurrentExamId(exam.id);
      setCurrentAccessCode(exam.access_code);
      setCurrentCreatedAt(exam.created_at || null);
      rememberCurrentExam(exam.id);

      if (!result.localSaved && result.cloudSaved !== true) {
        setSuccessSaved(false);
        setSaveStatus({
          kind: 'error',
          message: 'Không lưu được đề: Firebase không phản hồi và bộ nhớ trình duyệt đã đầy. Hãy tải file Word/JSON để giữ đề, rồi xóa bớt đề cũ trong Kho.',
        });
        return false;
      }
      setIsDirty(false);
      setSuccessSaved(true);
      if (result.cloudSaved === false) {
        setSaveStatus({
          kind: 'warn',
          message: 'Đã lưu trong trình duyệt này nhưng CHƯA đồng bộ lên Firebase (mất mạng hoặc tài khoản không có quyền ghi). Bấm "Lưu Vào Kho Đề" để thử lại.',
        });
      } else if (!result.localSaved) {
        setSaveStatus({ kind: 'warn', message: 'Đã lưu lên Firebase. Bộ nhớ trình duyệt đầy nên chưa có bản sao offline trên máy này.' });
      } else {
        setSaveStatus({
          kind: 'ok',
          message: result.cloudSaved ? 'Đã lưu vào Kho đề và đồng bộ Firebase.' : 'Đã lưu vào Kho đề (trên trình duyệt này).',
        });
      }
      return true;
    } catch (err: any) {
      console.error('Lưu đề thất bại:', err);
      setSuccessSaved(false);
      setSaveStatus({ kind: 'error', message: `Không lưu được đề: ${err?.message || 'lỗi không xác định'}. Hãy tải file Word/JSON để giữ đề.` });
      return false;
    }
  };

  const markDirty = () => {
    setIsDirty(true);
    setSuccessSaved(false);
  };

  // Khôi phục đề đang soạn dở khi quay lại tab (đề đã được lưu trong kho)
  useEffect(() => {
    let savedId: string | null = null;
    try {
      savedId = localStorage.getItem(CURRENT_EXAM_STORAGE_KEY);
    } catch {
      savedId = null;
    }
    if (!savedId) return;
    const exam = storageService.getExams().find((e) => e.id === savedId) || exams.find((e) => e.id === savedId);
    if (exam && exam.questions && exam.questions.length > 0) {
      loadExamIntoEditor(exam, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tự động lưu chỉnh sửa (sửa nhanh, thêm/xóa câu, đổi tiêu đề) vào kho sau khi ngừng gõ
  useEffect(() => {
    if (!isDirty || !currentExamId || !generatedQuestions || generatedQuestions.length === 0 || isGenerating) return;
    const timer = setTimeout(() => {
      persistExam(buildExam(generatedQuestions));
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, generatedQuestions, examTitle, mode, durationMinutes, currentExamId, isGenerating]);

  // Cảnh báo khi đóng tab lúc còn chỉnh sửa chưa lưu
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Sao chép mã phòng thi
  const handleCopyCode = (code: string) => {
    if (!code) return;
    navigator.clipboard?.writeText(code).catch(() => undefined);
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

  const loadExamIntoEditor = (exam: Exam, showNotice = true) => {
    setExamTitle(exam.title);
    setMode(exam.mode);
    setExamType(exam.exam_type || 'haiphong_matrix');
    setTopicPrompt(exam.topic_focus || '');
    setDurationMinutes(exam.duration_minutes || 90);
    setYearVariant(exam.year_variant || null);
    setCurrentYearVariant(exam.year_variant);
    setShownVi({});
    setCurrentExamId(exam.id);
    setCurrentAccessCode(exam.access_code);
    setCurrentCreatedAt(exam.created_at || null);
    setGeneratedQuestions(exam.questions || []);
    setEditingIndex(null);
    setIsDirty(false);
    setSuccessSaved(true);
    setSaveStatus(null);
    setErrorMsg('');
    rememberCurrentExam(exam.id);
    if (showNotice) {
      setAutoSavedNotice({
        show: true,
        accessCode: exam.access_code,
        title: exam.title,
      });
    }
  };

  // Nạp lại đề thi vào editor KaTeX preview để xem lời giải hoặc hiệu chỉnh
  const handleLoadExamToEditor = (exam: Exam) => {
    loadExamIntoEditor(exam);
    setGeneratorView('create');
  };

  // Đóng đề đang soạn để bắt đầu đề mới
  const handleCloseCurrentExam = () => {
    setGeneratedQuestions(null);
    setCurrentExamId(null);
    setCurrentAccessCode(null);
    setCurrentCreatedAt(null);
    setCurrentYearVariant(undefined);
    setIsDirty(false);
    setSuccessSaved(false);
    setSaveStatus(null);
    setAutoSavedNotice(null);
    rememberCurrentExam(null);
  };

  // Xóa đề khỏi lịch sử
  const handleDeleteExamFromHistory = async (examId: string) => {
    if (onDeleteExam) {
      await onDeleteExam(examId);
    } else {
      await storageService.deleteExam(examId);
    }
    if (examId === currentExamId) handleCloseCurrentExam();
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

      // Cập nhật lại đề đã lưu trong kho
      if (currentExamId) {
        await persistExam(buildExam(updated));
      } else {
        markDirty();
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
    e.target.value = '';
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
    if (!Number.isFinite(durationMinutes) || durationMinutes < 5 || durationMinutes > 300) {
      setErrorMsg('Thời gian làm bài phải từ 5 đến 300 phút.');
      return;
    }
    const yearMode = examType !== 'topic_practice' ? yearVariant : null;
    const extraTopics = [
      ...EXTRA_TOPIC_OPTIONS.filter((t) => extraTopicIds.includes(t.id)),
      ...customExtraTopic
        .split(/[;\n]/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => ({ name_en: t, name_vi: t })),
    ];
    if (yearMode === 'extended' && extraTopics.length === 0) {
      setErrorMsg('Hãy chọn hoặc nhập ít nhất một dạng toán cần bổ sung.');
      return;
    }
    if (yearMode === 'extended' && extraTopics.length > 12) {
      setErrorMsg('Chỉ nên bổ sung tối đa 12 dạng toán để đề vẫn giữ khung 22 câu.');
      return;
    }
    if (isDirty && generatedQuestions && !window.confirm('Đề đang mở còn chỉnh sửa chưa lưu. Tạo đề mới sẽ thay thế đề này trên màn hình. Tiếp tục?')) {
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');
    setExportError('');
    setSuccessSaved(false);
    setSaveStatus(null);
    setAutoSavedNotice(null);

    let questions: Question[];
    const newExamId = `exam-${Date.now()}`;
    try {
      const rawQuestions = examType === 'topic_practice'
        ? await generateTopicPractice({
            topic: topicPrompt.trim() || 'High School Gifted Mathematics',
            mode,
            count: topicQuestionCount,
            questionType: topicQuestionType,
            difficulty: 'mixed',
          })
        : yearMode
        ? await generateExam({
            topicPrompt,
            mode,
            examType: 'haiphong_matrix',
            questionCount: 22,
            customDocumentText: documentText,
            blueprint: yearMode === 'extended' ? buildExtendedBlueprint(extraTopics) : CODE_901_BLUEPRINT,
            yearVariant: yearMode,
            schoolYear: YEAR_FOLDER_2026_2027.school_year,
          })
        : await generateExam({
            topicPrompt,
            mode,
            examType,
            questionCount: examType === 'haiphong_matrix' ? 22 : questionCount,
            customDocumentText: documentText,
          });

      questions = (rawQuestions || []).map((q: any, i: number) => ({
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
        correct_answer: String(q.correct_answer ?? 'A'),
        acceptable_answers: Array.isArray(q.acceptable_answers) ? q.acceptable_answers.map(String) : [],
        hints: Array.isArray(q.hints) ? q.hints : undefined,
        solution_en: q.solution_en || '',
        solution_vi: q.solution_vi || '',
      }));
    } catch (err: any) {
      console.error('Exam generation failed:', err);
      // Giữ nguyên đề đang hiển thị (nếu có) — chỉ báo lỗi sinh đề
      setErrorMsg(err?.message || 'Không thể tạo đề lúc này. Vui lòng thử lại sau.');
      setIsGenerating(false);
      return;
    }

    // Đề đã sinh xong: hiển thị ngay, lỗi lưu (nếu có) không được làm mất đề
    setGeneratedQuestions(questions);
    setShownVi({});
    setEditingIndex(null);
    setIsDirty(false);
    storageService.incrementAiQuests(questions.length);

    const accessCode = newAccessCode();
    const autoSavedExam = buildExam(questions, {
      id: newExamId,
      access_code: accessCode,
      created_at: new Date().toISOString(),
      year_variant: yearMode || undefined,
    });
    setCurrentYearVariant(yearMode || undefined);
    setCurrentExamId(newExamId);
    setCurrentAccessCode(accessCode);
    setCurrentCreatedAt(autoSavedExam.created_at || null);
    setIsGenerating(false);

    // TỰ ĐỘNG LƯU VÀO KHO / LỊCH SỬ ĐỀ THI
    const saved = await persistExam(autoSavedExam);
    if (!saved) setIsDirty(true);
    setAutoSavedNotice({
      show: true,
      accessCode,
      title: autoSavedExam.title,
    });
  };

  // Save current generated exam manually
  const handleSaveExam = async (startNow = false, navigateAfterSave = false) => {
    if (!generatedQuestions || generatedQuestions.length === 0) return;

    const newExam = buildExam(generatedQuestions);
    const saved = await persistExam(newExam);
    setAutoSavedNotice({
      show: true,
      accessCode: newExam.access_code,
      title: newExam.title,
    });

    if (startNow && onStartTestNow) {
      const currentUser = storageService.getCurrentUser();
      if (currentUser?.id) {
        storageService.clearExamAutoSave(newExam.id, currentUser.id);
      }
      onStartTestNow(newExam);
    } else if (navigateAfterSave && saved) {
      setTimeout(() => {
        onNavigateToBank();
      }, 800);
    }
  };

  // Lưu thành đề mới (bản sao với mã phòng thi mới) — giữ nguyên đề gốc
  const handleSaveAsCopy = async () => {
    if (!generatedQuestions || generatedQuestions.length === 0) return;
    const copyId = `exam-${Date.now()}`;
    const copy = buildExam(generatedQuestions, {
      id: copyId,
      access_code: newAccessCode(),
      title: `${examTitle.trim() || 'Đề thi'} (bản sao)`,
      created_at: new Date().toISOString(),
    });
    setExamTitle(copy.title);
    const saved = await persistExam(copy);
    if (saved) {
      setAutoSavedNotice({ show: true, accessCode: copy.access_code, title: copy.title });
    }
  };

  // Export DOCX
  const exportDocx = async (exam: Exam, includeSolutions: boolean) => {
    setExportError('');
    try {
      await exportExamToDocx({
        exam,
        includeSolutions,
        mode: exam.mode === 'bilingual' ? 'bilingual' : 'english_only',
      });
    } catch (err: any) {
      console.error('Xuất Word thất bại:', err);
      const msg = `Không xuất được file Word: ${err?.message || 'lỗi không xác định'}`;
      setExportError(msg);
      if (generatorView === 'history') alert(msg);
    }
  };

  const handleExportDocx = async (includeSolutions: boolean) => {
    if (!generatedQuestions || generatedQuestions.length === 0) {
      setExportError('Chưa có đề để xuất. Hãy sinh đề hoặc mở một đề trong "Kho Đề Đã Lưu".');
      return;
    }
    await exportDocx(buildExam(generatedQuestions), includeSolutions);
  };

  const handlePrint = (sheetType: 'question_sheet' | 'solution_sheet') => {
    if (!generatedQuestions || generatedQuestions.length === 0) {
      setExportError('Chưa có đề để in. Hãy sinh đề hoặc mở một đề trong "Kho Đề Đã Lưu".');
      return;
    }
    setExportError('');
    printHaiPhongExam(buildExam(generatedQuestions), { sheetType });
  };

  // Sao lưu đề ra file JSON (mở lại được bằng "Nhập đề từ file")
  const handleExportJson = (exam: Exam) => {
    const blob = new Blob([JSON.stringify({ format: 'hp-math-exam', version: 1, exam }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFileName(exam.title)}_${exam.access_code || exam.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Nhập đề từ file JSON đã sao lưu
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result || ''));
        const raw: any = parsed?.exam || parsed;
        if (!raw || !Array.isArray(raw.questions) || raw.questions.length === 0) {
          throw new Error('File không chứa danh sách câu hỏi hợp lệ.');
        }
        const id = `exam-${Date.now()}`;
        const accessExists = storageService.getExams().some(
          (x) => x.access_code?.toUpperCase() === String(raw.access_code || '').toUpperCase(),
        );
        const imported: Exam = {
          ...raw,
          id,
          title: String(raw.title || file.name.replace(/\.json$/i, '')),
          mode: raw.mode === 'english_only' ? 'english_only' : 'bilingual',
          exam_type: raw.exam_type || 'haiphong_matrix',
          duration_minutes: Math.min(300, Math.max(5, Number(raw.duration_minutes) || 90)),
          is_published: raw.is_published !== false,
          is_ai_generated: true,
          access_code: raw.access_code && !accessExists ? String(raw.access_code) : newAccessCode(),
          created_at: raw.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          questions: raw.questions.map((q: any, idx: number) => ({
            ...q,
            id: q.id || `q-${Date.now()}-${idx + 1}`,
            exam_id: id,
            order_index: idx + 1,
          })),
        };
        const result = (await onSaveExam(imported)) || { localSaved: true, cloudSaved: null };
        setImportMessage({
          ok: result.localSaved || result.cloudSaved === true,
          text: result.localSaved || result.cloudSaved === true
            ? `Đã nhập đề "${imported.title}" (${imported.questions?.length} câu) — mã ${imported.access_code}.`
            : 'Không lưu được đề vừa nhập (bộ nhớ đầy và Firebase không phản hồi).',
        });
      } catch (err: any) {
        setImportMessage({ ok: false, text: `Không đọc được file: ${err?.message || 'sai định dạng JSON'}` });
      }
    };
    reader.readAsText(file);
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
    markDirty();
  };

  // Delete a question
  const handleDeleteQuestion = (index: number) => {
    if (!generatedQuestions) return;
    const updated = generatedQuestions.filter((_, i) => i !== index);
    setGeneratedQuestions(updated);
    markDirty();
  };

  // Update a single question field
  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    if (!generatedQuestions) return;
    const updated = [...generatedQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setGeneratedQuestions(updated);
    markDirty();
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
    // Điểm đã được quy đổi về thang 10 khi đọc (utils/scoring.ts)
    avgScoreDisplay = `${rawAvg.toFixed(2)}/10`;

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
      const diff10 = diffRaw;
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

      {/* Tab Navigation: Soạn / Sinh Đề AI vs Kho Đề Đã Lưu */}
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
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kho Đề Đã Lưu</span>
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
          {/* THƯ MỤC ĐỀ THI 2026-2027 */}
          <div
            className={`rounded-2xl border shadow-xs overflow-hidden transition ${
              yearVariant
                ? 'border-amber-400 dark:border-amber-600 bg-amber-50/60 dark:bg-amber-950/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          >
            <button
              type="button"
              onClick={() => setYearFolderOpen((v) => !v)}
              aria-expanded={yearFolderOpen}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
            >
              <span className="w-10 h-10 shrink-0 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                {yearFolderOpen ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-slate-900 dark:text-white">📁 {YEAR_FOLDER_2026_2027.title}</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {yearVariant ? `Đang chọn: ${YEAR_VARIANT_INFO[yearVariant].title}` : 'Bấm để chọn cách tạo đề từ đề 2025 - 2026'}
                </span>
              </span>
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${yearFolderOpen ? 'rotate-90' : ''}`} />
            </button>

            {yearFolderOpen && (
              <div className="px-4 pb-4 space-y-3">
                <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/60 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700">
                  <div className="font-semibold text-slate-800 dark:text-slate-100 mb-0.5">
                    Đề gốc: {YEAR_FOLDER_2026_2027.reference?.label}
                  </div>
                  <div>12 câu trắc nghiệm + 10 câu trả lời ngắn · 22 dạng toán · thang 10 điểm.</div>
                  {YEAR_FOLDER_2026_2027.reference?.pdfUrl && (
                    <a
                      href={YEAR_FOLDER_2026_2027.reference.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-teal-700 dark:text-teal-300 font-semibold hover:underline"
                    >
                      <FileText className="w-3 h-3" /> Xem đề gốc 2025 - 2026 (PDF)
                    </a>
                  )}
                </div>

                <div className="space-y-2" role="radiogroup" aria-label="Cách tạo đề 2026-2027">
                  {(['similar', 'different', 'extended'] as YearVariant[]).map((v) => {
                    const Icon = v === 'similar' ? Copy : v === 'different' ? Shuffle : ListPlus;
                    const active = yearVariant === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => {
                          setYearVariant(v);
                          setExamType('haiphong_matrix');
                          setErrorMsg('');
                          if (!examTitle.includes('2026')) {
                            setExamTitle(
                              `Đề ${isStudentMode ? 'Tự Luyện' : 'Thi'} HSG Toán Tiếng Anh 2026 - 2027 (${YEAR_VARIANT_INFO[v].title.replace('Tạo đề ', '')})`,
                            );
                          }
                        }}
                        className={`w-full flex items-start gap-2.5 p-3 rounded-xl border text-left transition ${
                          active
                            ? 'border-amber-500 bg-white dark:bg-slate-900 ring-2 ring-amber-300/60 dark:ring-amber-700/60'
                            : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 hover:border-amber-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? 'text-amber-600' : 'text-slate-400'}`} />
                        <span>
                          <span className="block text-xs font-bold text-slate-900 dark:text-white">{YEAR_VARIANT_INFO[v].title}</span>
                          <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{YEAR_VARIANT_INFO[v].detail}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {yearVariant === 'extended' && (
                  <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Dạng toán bổ sung</span>
                      <span className="text-[10px] text-slate-500">
                        Đã chọn {extraTopicIds.length + customExtraTopic.split(/[;\n]/).filter((t) => t.trim()).length}
                      </span>
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                      {EXTRA_TOPIC_OPTIONS.map((t) => (
                        <label key={t.id} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={extraTopicIds.includes(t.id)}
                            onChange={(e) =>
                              setExtraTopicIds((prev) => (e.target.checked ? [...prev, t.id] : prev.filter((x) => x !== t.id)))
                            }
                            className="mt-0.5 text-amber-600 focus:ring-amber-500"
                          />
                          <span>{t.name_vi}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      value={customExtraTopic}
                      onChange={(e) => setCustomExtraTopic(e.target.value)}
                      placeholder="Tự nhập dạng toán khác (mỗi dòng hoặc dấu ; là một dạng)"
                      className="w-full px-2.5 py-2 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Mỗi dạng thay một câu cùng mạch kiến thức; đề vẫn giữ 22 câu.
                    </p>
                  </div>
                )}

                {yearVariant && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={handleGenerate}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isGenerating ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {isGenerating ? 'Đang sinh đề...' : 'Sinh đề 2026 - 2027'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setYearVariant(null)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

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
                onChange={(e) => {
                  setExamTitle(e.target.value);
                  if (generatedQuestions) markDirty();
                }}
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
                  onClick={() => {
                    setMode('bilingual');
                    if (generatedQuestions && mode !== 'bilingual') markDirty();
                  }}
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
                  onClick={() => {
                    setMode('english_only');
                    if (generatedQuestions && mode !== 'english_only') markDirty();
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    mode === 'english_only'
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-700 dark:text-teal-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🇬🇧 Full Tiếng Anh
                </button>
              </div>
              {mode === 'bilingual' && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Đề hiển thị tiếng Anh; bấm nút <strong>Dịch</strong> ở từng câu để xem bản tiếng Việt.
                </p>
              )}
            </div>

            {/* Thời gian làm bài / nộp bài */}
            <div>
              <label htmlFor="exam-duration" className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                <Timer className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Thời gian làm bài (tự động nộp khi hết giờ):
              </label>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {DURATION_PRESETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setDurationMinutes(m);
                      if (generatedQuestions && m !== durationMinutes) markDirty();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                      durationMinutes === m
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-400'
                    }`}
                  >
                    {m}′
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="exam-duration"
                  type="number"
                  min={5}
                  max={300}
                  step={5}
                  value={durationMinutes}
                  onChange={(e) => {
                    setDurationMinutes(Number(e.target.value));
                    if (generatedQuestions) markDirty();
                  }}
                  className="w-24 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">phút (5 – 300)</span>
              </div>
            </div>

            {/* Exam Type */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Loại đề thi:
              </label>
              <div className="space-y-2">
                {yearVariant && (
                  <div className="p-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                    <Folder className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="flex-1">
                      Đang dùng thư mục <strong>{YEAR_FOLDER_2026_2027.title}</strong> — {YEAR_VARIANT_INFO[yearVariant].title}.
                    </span>
                    <button type="button" onClick={() => setYearVariant(null)} className="font-semibold hover:underline">
                      Bỏ
                    </button>
                  </div>
                )}
                <label
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                    examType === 'haiphong_matrix' && !yearVariant
                      ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-500'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="examType"
                    checked={examType === 'haiphong_matrix' && !yearVariant}
                    onChange={() => {
                      setExamType('haiphong_matrix');
                      setYearVariant(null);
                    }}
                    className="mt-0.5 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Chuẩn Ma trận Sở Hải Phòng (22 câu)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      8 Thông hiểu, 9 Vận dụng, 5 Vận dụng cao (9 Đại số – Giải tích, 9 Hình học, 4 Thống kê – Xác suất – Rời rạc). Thang 10 điểm.
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
                    onChange={() => {
                      setExamType('topic_practice');
                      setYearVariant(null);
                    }}
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
            <div role="alert" className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div>{errorMsg}</div>
                {generatedQuestions && (
                  <div className="mt-1 text-[11px] text-rose-600/80 dark:text-rose-300/80">Đề đang mở trên màn hình vẫn được giữ nguyên.</div>
                )}
              </div>
              <button type="button" onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-rose-600" aria-label="Ẩn thông báo">
                <X className="w-3.5 h-3.5" />
              </button>
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
                  <span className="text-slate-400 font-mono">8/22 (36%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[36%] rounded-full"></div>
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
                  <span className="text-slate-400 font-mono">5/22 (23%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full w-[23%] rounded-full"></div>
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
                disabled={!generatedQuestions}
                className="bg-white hover:bg-slate-50 text-teal-900 py-2 rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-60"
              >
                Word Đề
              </button>
              <button
                type="button"
                onClick={() => handleExportDocx(true)}
                disabled={!generatedQuestions}
                className="bg-white hover:bg-slate-50 text-teal-900 py-2 rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-60"
              >
                Word Đáp Án
              </button>
              <button
                type="button"
                onClick={() => handlePrint('question_sheet')}
                disabled={!generatedQuestions}
                className="bg-teal-500/80 hover:bg-teal-500 text-white py-2 rounded-lg text-xs font-bold transition border border-teal-400/40 disabled:opacity-60"
              >
                PDF Đề
              </button>
              <button
                type="button"
                onClick={() => handlePrint('solution_sheet')}
                disabled={!generatedQuestions}
                className="bg-teal-500/80 hover:bg-teal-500 text-white py-2 rounded-lg text-xs font-bold transition border border-teal-400/40 disabled:opacity-60"
              >
                PDF Đáp Án
              </button>
            </div>
            {!generatedQuestions && (
              <p className="text-[11px] text-teal-100/90 mt-2">Sinh đề hoặc mở một đề trong Kho để xuất file.</p>
            )}
          </div>
        </div>

        {/* Right Column: Live KaTeX Preview & In-place Question Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col min-h-[600px]">
            {/* MỤC HÀNH ĐỘNG NỔI BẬT SAU KHI TẠO ĐỀ XONG: TẢI FILE WORD & LƯU VÀO KHO ĐỀ */}
            {generatedQuestions && (
              <div className="mb-5 p-5 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 dark:from-teal-950/60 dark:via-emerald-950/50 dark:to-teal-950/60 border-2 border-teal-400/80 dark:border-teal-700 shadow-md animate-in fade-in">
                {/* Header thông báo hoàn tất tạo đề */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-teal-200/80 dark:border-teal-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-teal-600 text-white shadow-xs">
                        <CheckCircle className="w-5 h-5" />
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        🎉 Tạo Đề Thi Thành Công!
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        {generatedQuestions.length} câu hỏi • {durationMinutes} phút
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Tên đề: <strong className="text-slate-900 dark:text-white">{examTitle}</strong> | Mã phòng thi: <strong className="font-mono text-teal-700 dark:text-teal-300 bg-white/80 dark:bg-slate-800 px-2 py-0.5 rounded border border-teal-300 dark:border-teal-700">{currentAccessCode}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onStartTestNow && (
                      <button
                        type="button"
                        onClick={() => handleSaveExam(true)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-200 dark:shadow-none transition flex items-center gap-1.5"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Vào Làm Bài Ngay ({durationMinutes}p)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2 Khối Hành Động Chính: Tải File Word & Lưu Vào Kho Đề */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {/* Mục 1: Tải về File Word (.docx) */}
                  <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-850/90 border border-teal-200 dark:border-teal-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wide">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Mục 1: Tải về File Word (.docx)</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        Chuẩn LaTeX $...$
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Tải file Word để in ấn, phát cho học sinh làm bài hoặc lưu trữ giáo án cá nhân:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleExportDocx(false)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 transition flex items-center justify-center gap-1.5 shadow-xs"
                        title="Tải đề thi Word không có đáp án, sẵn sàng phát đề hoặc in ấn"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>Tải Đề Thi (Word)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportDocx(true)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-teal-800 dark:text-teal-200 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 border border-teal-300 dark:border-teal-700 transition flex items-center justify-center gap-1.5 shadow-xs"
                        title="Tải đề thi Word kèm đáp án và lời giải chi tiết cả Anh và Việt"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>Tải Kèm Đáp Án</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 italic pt-0.5">
                      💡 Mẹo Word: Quét chọn công thức rồi bấm [Alt] + [=] để chuyển đổi tự động sang Equation.
                    </div>
                  </div>

                  {/* Mục 2: Lưu vào mục "Kho đề" để lấy ra làm bất cứ lúc nào */}
                  <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-850/90 border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-wide">
                        <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Mục 2: Lưu vào "Kho đề"</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {saveStatus?.kind === 'saving'
                          ? 'Đang lưu...'
                          : saveStatus?.kind === 'error'
                          ? '✗ Chưa lưu được'
                          : saveStatus?.kind === 'warn'
                          ? '⚠ Chưa đồng bộ Firebase'
                          : isDirty
                          ? 'Có thay đổi — tự lưu sau vài giây'
                          : successSaved
                          ? '✓ Đã lưu'
                          : 'Tự động lưu'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Đề được lưu vào Kho đề thi của bạn để có thể <strong>lấy ra làm bài bất cứ lúc nào</strong>:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSaveExam(false, false)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs ${
                          successSaved
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 border border-emerald-300 dark:border-emerald-700'
                        }`}
                        title="Lưu hoặc cập nhật đề thi vào Kho đề"
                      >
                        {successSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã Lưu Vào Kho Đề</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Lưu Vào Kho Đề</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={onNavigateToBank}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-teal-800 dark:text-teal-200 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 border border-teal-300 dark:border-teal-700 transition flex items-center justify-center gap-1.5 shadow-xs"
                        title="Chuyển đến màn hình Kho đề thi để xem danh sách hoặc chọn đề làm bài"
                      >
                        <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>Mở Kho Đề</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAsCopy}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-300 dark:border-slate-600 transition flex items-center justify-center gap-1.5"
                        title="Lưu thành một đề mới với mã phòng thi mới (giữ nguyên đề gốc)"
                      >
                        <Copy className="w-3.5 h-3.5 shrink-0" />
                        <span>Lưu thành bản sao</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => generatedQuestions && handleExportJson(buildExam(generatedQuestions))}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-300 dark:border-slate-600 transition flex items-center justify-center gap-1.5"
                        title="Tải file JSON sao lưu đề — nhập lại được ở Kho Đề Đã Lưu"
                      >
                        <FileJson className="w-3.5 h-3.5 shrink-0" />
                        <span>Sao lưu file JSON</span>
                      </button>
                    </div>

                    {saveStatus && saveStatus.kind !== 'saving' && (
                      <div
                        role={saveStatus.kind === 'error' ? 'alert' : 'status'}
                        className={`text-[11px] p-2 rounded-lg flex items-start gap-1.5 ${
                          saveStatus.kind === 'ok'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : saveStatus.kind === 'warn'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {saveStatus.kind === 'ok' ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                        <span>{saveStatus.message}</span>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      📌 Bạn có thể quay lại Kho đề thi bất cứ lúc nào để làm lại hoặc chia sẻ mã đề <span className="font-mono font-bold text-teal-700 dark:text-teal-300">{currentAccessCode}</span>.
                    </div>
                  </div>
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
                  {mode === 'bilingual' && (
                    <TranslateButton
                      shown={generatedQuestions.length > 0 && generatedQuestions.every((q, i) => shownVi[q.id || String(i)])}
                      label="Dịch cả đề"
                      onClick={() => {
                        const allShown = generatedQuestions.every((q, i) => shownVi[q.id || String(i)]);
                        const next: Record<string, boolean> = {};
                        generatedQuestions.forEach((q, i) => {
                          next[q.id || String(i)] = !allShown;
                        });
                        setShownVi(next);
                      }}
                    />
                  )}
                  <button
                    onClick={() => handleExportDocx(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition border border-blue-200 dark:border-blue-800"
                    title="Tải file Word (.docx) đề thi chuẩn LaTeX $...$"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Word Đề Bài
                  </button>
                  <button
                    onClick={() => handleExportDocx(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition border border-teal-200 dark:border-teal-800"
                    title="Tải file Word (.docx) có kèm đáp án và lời giải chi tiết"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                    Word Đáp Án
                  </button>
                  <button
                    onClick={() => handlePrint('question_sheet')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                    title="In / lưu PDF Đề thi chuẩn mẫu Sở GD&ĐT Hải Phòng"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    In Đề (PDF)
                  </button>
                  <button
                    onClick={() => handlePrint('solution_sheet')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                    title="In / lưu PDF Hướng dẫn chấm & lời giải"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    In Đáp Án (PDF)
                  </button>
                  <button
                    onClick={() => handleSaveExam(false, false)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                      successSaved
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saveStatus?.kind === 'saving'
                      ? 'Đang lưu...'
                      : successSaved && !isDirty
                      ? 'Đã Lưu Vào Kho Đề!'
                      : 'Lưu Vào Kho Đề'}
                  </button>
                  <button
                    onClick={() => {
                      if (isDirty && !window.confirm('Còn chỉnh sửa chưa lưu. Vẫn đóng đề này?')) return;
                      handleCloseCurrentExam();
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Đóng đề đang mở (đề vẫn nằm trong Kho)"
                  >
                    <X className="w-3.5 h-3.5" />
                    Đóng
                  </button>
                  {onStartTestNow && (
                    <button
                      onClick={() => handleSaveExam(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-md shadow-teal-200 dark:shadow-none"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Làm Bài Ngay
                    </button>
                  )}
                </div>
              )}
            </div>

            {exportError && (
              <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="flex-1">{exportError}</span>
                <button type="button" onClick={() => setExportError('')} aria-label="Ẩn thông báo"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}

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
                        {mode === 'bilingual' && (q.question_vi || q.solution_vi) && (
                          <TranslateButton shown={Boolean(shownVi[q.id || String(idx)])} onClick={() => toggleVi(q.id || String(idx))} />
                        )}
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
                    {mode === 'bilingual' && q.question_vi && shownVi[q.id || String(idx)] && (
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
                          const isCorrect = String(q.correct_answer ?? '').trim().toUpperCase() === letter;
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
                      {mode === 'bilingual' && q.solution_vi && shownVi[q.id || String(idx)] && (
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

                        {q.part === 'PART_1' && (
                          <div>
                            <label className="block font-medium mb-1">Các phương án (tiếng Anh, công thức trong $...$):</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(q.options_en && q.options_en.length > 0 ? q.options_en : ['A. ', 'B. ', 'C. ', 'D. ']).map((opt, oIdx, arr) => (
                                <input
                                  key={oIdx}
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const next = [...arr];
                                    next[oIdx] = e.target.value;
                                    updateQuestion(idx, 'options_en', next);
                                  }}
                                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white"
                                  aria-label={`Phương án ${String.fromCharCode(65 + oIdx)}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {q.part === 'PART_2' && (
                          <div>
                            <label className="block font-medium mb-1">Đáp số tương đương được chấp nhận (cách nhau bởi dấu phẩy):</label>
                            <input
                              type="text"
                              value={(q.acceptable_answers || []).join(', ')}
                              onChange={(e) =>
                                updateQuestion(
                                  idx,
                                  'acceptable_answers',
                                  e.target.value.split(',').map((v) => v.trim()).filter(Boolean),
                                )
                              }
                              placeholder="VD: 1/2, 0.5"
                              className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                        )}

                        {mode === 'bilingual' && (
                          <div>
                            <label className="block font-medium mb-1">Lời giải tiếng Việt:</label>
                            <textarea
                              rows={2}
                              value={q.solution_vi || ''}
                              onChange={(e) => updateQuestion(idx, 'solution_vi', e.target.value)}
                              className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                        )}

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Xóa câu ${q.order_index} khỏi đề?`)) {
                                handleDeleteQuestion(idx);
                                setEditingIndex(null);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Xóa câu này
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-500 hover:border-teal-400 hover:text-teal-600 transition flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  Thêm câu hỏi tự soạn
                </button>
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
              <label
                className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-teal-400 transition flex items-center gap-1"
                title="Nhập lại đề từ file JSON đã sao lưu"
              >
                <Upload className="w-3.5 h-3.5" />
                Nhập đề (.json)
                <input type="file" accept=".json,application/json" onChange={handleImportJson} className="hidden" />
              </label>
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
              <button
                type="button"
                onClick={() => setHistoryFilter('year_2026_2027')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  historyFilter === 'year_2026_2027'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                }`}
              >
                <Folder className="w-3 h-3" /> 2026-2027
              </button>
            </div>
          </div>

          {importMessage && (
            <div
              role="status"
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                importMessage.ok
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
              }`}
            >
              <span className="flex-1">{importMessage.text}</span>
              <button type="button" onClick={() => setImportMessage(null)} aria-label="Ẩn thông báo"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}

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
                          {exam.school_year && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center gap-1">
                              <Folder className="w-2.5 h-2.5" /> {exam.school_year}
                            </span>
                          )}
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
                      {/* Primary Retake / Take Exam Button */}
                      <button
                        type="button"
                        onClick={() => handleRetakeExamFromHistory(exam)}
                        className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 transition shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Lấy Ra Làm Bài Ngay ({exam.duration_minutes || 90}p)</span>
                      </button>

                      {/* Secondary Actions Row */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 pt-1 text-[11px]">
                        {/* Tải Đề Word */}
                        <button
                          type="button"
                          onClick={() => exportDocx(exam, false)}
                          className="py-1.5 px-1 rounded-lg font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition flex items-center justify-center gap-0.5 border border-blue-200 dark:border-blue-900/40"
                          title="Tải file Word đề thi (.docx)"
                        >
                          <Download className="w-3 h-3 text-blue-600" />
                          <span>Đề Word</span>
                        </button>

                        {/* Tải Đáp Án Word */}
                        <button
                          type="button"
                          onClick={() => exportDocx(exam, true)}
                          className="py-1.5 px-1 rounded-lg font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition flex items-center justify-center gap-0.5 border border-teal-200 dark:border-teal-900/40"
                          title="Tải file Word kèm đáp án & lời giải (.docx)"
                        >
                          <FileCheck className="w-3 h-3 text-teal-600" />
                          <span>Đ/Án</span>
                        </button>

                        {/* In Đề Thi PDF */}
                        <button
                          type="button"
                          onClick={() => printHaiPhongExam(exam, { sheetType: 'question_sheet' })}
                          className="py-1.5 px-1 rounded-lg font-semibold bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition flex items-center justify-center gap-0.5"
                          title="In đề thi chuẩn mẫu Sở GD&ĐT Hải Phòng"
                        >
                          <Printer className="w-3 h-3" />
                          <span>In PDF</span>
                        </button>

                        {/* Sao lưu JSON */}
                        <button
                          type="button"
                          onClick={() => handleExportJson(exam)}
                          className="py-1.5 px-1 rounded-lg font-semibold bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition flex items-center justify-center gap-0.5"
                          title="Tải file JSON sao lưu đề (nhập lại được)"
                        >
                          <FileJson className="w-3 h-3" />
                          <span>JSON</span>
                        </button>

                        {/* Xem & Hiệu chỉnh */}
                        <button
                          type="button"
                          onClick={() => handleLoadExamToEditor(exam)}
                          className="py-1.5 px-1 rounded-lg font-semibold bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-650 transition flex items-center justify-center gap-0.5"
                          title="Nạp vào trình biên tập KaTeX để xem chi tiết hoặc chỉnh sửa"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Sửa</span>
                        </button>

                        {/* Xóa */}
                        {deleteConfirmId === exam.id ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteExamFromHistory(exam.id)}
                            className="py-1.5 px-1 rounded-lg font-bold bg-rose-600 text-white hover:bg-rose-700 transition"
                            title="Bấm để xác nhận xóa vĩnh viễn"
                          >
                            Xóa!
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(exam.id)}
                            className="py-1.5 px-1 rounded-lg font-semibold bg-slate-100 dark:bg-slate-750 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center justify-center"
                            title="Xóa đề này khỏi kho đề"
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
