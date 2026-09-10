import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Search,
  Languages,
  Bookmark,
  CheckCircle2,
  Download,
  Printer,
  FileQuestion,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Check,
  RotateCw,
  Award,
  Calendar,
  Target,
  Layers,
  ArrowRight,
  X,
  Hash,
  ListOrdered,
  AlertCircle,
  SlidersHorizontal
} from 'lucide-react';
import { StudentStudyNote, ExamMode, Question, MathStrand } from '../../types';
import MathRenderer from '../MathRenderer';
import { printExamOrNotes } from '../../utils/printPdf';
import { CHAPTER_STUDY_NOTES } from '../../data/chapterStudyNotes';
import {
  HAIPHONG_SPECIAL_TOPICS,
  HAIPHONG_12_WEEK_ROADMAP,
  OlympiadSpecialTopic
} from '../../data/haiPhongSpecialTopics';
import {
  generateStudyLesson,
  generateTopicPractice,
  TopicQuestionType,
  TopicDifficulty
} from '../../services/geminiService';

interface StudyAssistantProps {
  onSaveNote: (note: StudentStudyNote) => void;
  onStartPracticeQuiz: (topic: string, questions: Question[]) => void;
}

const POPULAR_TOPICS = [
  // Algebra & Calculus (6 topics)
  'Trigonometry & Trigonometric Equations',
  'Sequences, Progressions & Recurrences',
  'Limits & Continuous Functions',
  'Exponential & Logarithmic Functions',
  'Quadratic Functions & Inequalities',
  'Derivatives & Applications',
  // Geometry & Measurement (4 topics)
  'Conic Sections: Ellipse, Hyperbola, Parabola',
  'Perpendicularity & Parallelism in 3D Space',
  'Coordinate Geometry & Vectors in Plane',
  'Distances & Angles in Space',
  // Statistics, Probability & Discrete (3 topics)
  'Probability & Statistics',
  'Pigeonhole Principle & Combinatorics',
  'Invariance Principle & Monovariants',
];

export const StudyAssistant: React.FC<StudyAssistantProps> = ({
  onSaveNote,
  onStartPracticeQuiz,
}) => {
  const [activeStudyTab, setActiveStudyTab] = useState<'haiphong_topics' | 'roadmap' | 'ai_assistant'>('haiphong_topics');
  const [selectedHpTopic, setSelectedHpTopic] = useState<OlympiadSpecialTopic>(HAIPHONG_SPECIAL_TOPICS[0]);
  const [topicInput, setTopicInput] = useState('');
  const [mode, setMode] = useState<ExamMode>('bilingual');
  const [viewLayout, setViewLayout] = useState<'dual_column' | 'single_column'>('dual_column');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentNote, setCurrentNote] = useState<StudentStudyNote>(CHAPTER_STUDY_NOTES[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // AI Quiz Generator Modal State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizModalTopic, setQuizModalTopic] = useState<{
    title_vi: string;
    title_en?: string;
    strand?: string;
  } | null>(null);
  const [quizQuestionCount, setQuizQuestionCount] = useState<number>(6);
  const [quizQuestionType, setQuizQuestionType] = useState<TopicQuestionType>('mixed');
  const [quizDifficulty, setQuizDifficulty] = useState<TopicDifficulty>('advanced');
  const [quizMode, setQuizMode] = useState<ExamMode>('bilingual');
  const [quizGenerationError, setQuizGenerationError] = useState<string>('');
  const [generationStepStatus, setGenerationStepStatus] = useState<string>('');

  // Mở modal tạo đề cho chuyên đề VDC đang chọn
  const openQuizModalForSpecialTopic = (top: OlympiadSpecialTopic) => {
    setQuizModalTopic({
      title_vi: top.title_vi,
      title_en: top.title_en,
      strand: top.strand,
    });
    setQuizQuestionCount(6);
    setQuizQuestionType('mixed');
    setQuizDifficulty('advanced');
    setQuizMode(mode);
    setQuizGenerationError('');
    setShowQuizModal(true);
  };

  // Mở modal tạo đề cho bài giảng lý thuyết đang học
  const openQuizModalForCurrentNote = () => {
    setQuizModalTopic({
      title_vi: currentNote.topic,
      title_en: '',
      strand: 'algebra_calculus',
    });
    setQuizQuestionCount(6);
    setQuizQuestionType('mixed');
    setQuizDifficulty('application');
    setQuizMode(currentNote.mode || mode);
    setQuizGenerationError('');
    setShowQuizModal(true);
  };

  // Hàm sinh đề bằng AI 100% theo các tùy chọn
  const handleExecuteAiQuizGeneration = async () => {
    if (!quizModalTopic) return;
    setIsGeneratingQuiz(true);
    setQuizGenerationError('');
    setGenerationStepStatus('Đang kết nối Gemini AI và phân tích chuyên đề...');

    try {
      const topicStr = quizModalTopic.title_en
        ? `${quizModalTopic.title_vi} (${quizModalTopic.title_en})`
        : quizModalTopic.title_vi;

      const typeLabel =
        quizQuestionType === 'mcq'
          ? 'Trắc nghiệm 4 lựa chọn'
          : quizQuestionType === 'short_answer'
          ? 'Trả lời ngắn điền đáp số'
          : quizQuestionType === 'true_false'
          ? 'Đúng - Sai (True/False)'
          : 'Kết hợp các dạng';

      setGenerationStepStatus(`Gemini AI đang biên soạn ${quizQuestionCount} câu hỏi ${typeLabel}...`);

      const rawQuestions = await generateTopicPractice({
        topic: topicStr,
        mode: quizMode,
        count: quizQuestionCount,
        questionType: quizQuestionType,
        difficulty: quizDifficulty,
        strand: quizModalTopic.strand,
      });

      if (!rawQuestions || !Array.isArray(rawQuestions) || rawQuestions.length === 0) {
        throw new Error('AI không trả về danh sách câu hỏi hợp lệ. Vui lòng thử lại.');
      }

      setGenerationStepStatus('Đang hoàn thiện đề thi và chuẩn bị phòng làm bài...');

      const questions: Question[] = rawQuestions.map((q: any, i: number) => ({
        id: `quiz-ai-${Date.now()}-${i + 1}`,
        exam_id: `topic-practice-${Date.now()}`,
        part: q.part || (q.options_en ? 'PART_1' : 'PART_2'),
        order_index: i + 1,
        strand: (q.strand as MathStrand) || (quizModalTopic.strand as MathStrand) || 'algebra_calculus',
        topic: quizModalTopic.title_vi,
        difficulty: q.difficulty || (quizDifficulty === 'mixed' ? 'application' : quizDifficulty),
        question_en: q.question_en || '',
        question_vi: q.question_vi || '',
        options_en: q.options_en || (q.part === 'PART_1' ? ['A', 'B', 'C', 'D'] : undefined),
        options_vi: q.options_vi || undefined,
        correct_answer: q.correct_answer || (q.part === 'PART_1' ? 'A' : '0'),
        acceptable_answers: q.acceptable_answers || [],
        hints: q.hints || [],
        solution_en: q.solution_en || '',
        solution_vi: q.solution_vi || '',
      }));

      // Đóng modal và chuyển ngay sang phòng thi
      setShowQuizModal(false);
      onStartPracticeQuiz(
        `${quizModalTopic.title_vi} (${typeLabel} - ${quizQuestionCount} câu)`,
        questions
      );
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      const friendlyMsg = err?.message || 'Đã có lỗi xảy ra trong quá trình sinh đề bằng AI.';
      setQuizGenerationError(
        `${friendlyMsg}. Thầy/Cô và các bạn hãy kiểm tra lại kết nối hoặc API Key trong Cài đặt, hoặc thử giảm bớt số lượng câu hỏi.`
      );
    } finally {
      setIsGeneratingQuiz(false);
      setGenerationStepStatus('');
    }
  };

  const handleSaveToNotes = () => {
    onSaveNote(currentNote);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Main Tab Navigation */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveStudyTab('haiphong_topics')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeStudyTab === 'haiphong_topics'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Award className="w-4 h-4" />
            11 chuyên đề VDC Hải Phòng 2025
          </button>

          <button
            onClick={() => setActiveStudyTab('roadmap')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeStudyTab === 'roadmap'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Lộ trình ôn luyện 12 tuần
          </button>

          <button
            onClick={() => setActiveStudyTab('ai_assistant')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeStudyTab === 'ai_assistant'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Trợ lý AI tùy biến
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 px-2">
          <button
            onClick={() => setMode('bilingual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              mode === 'bilingual'
                ? 'bg-teal-50 border-teal-500 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            🇻🇳 🇬🇧 Song Ngữ
          </button>
          <button
            onClick={() => setMode('english_only')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              mode === 'english_only'
                ? 'bg-teal-50 border-teal-500 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* TAB 1: 11 CHUYÊN ĐỀ VDC HẢI PHÒNG */}
      {activeStudyTab === 'haiphong_topics' && (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 p-6 rounded-2xl text-white shadow-sm border border-teal-800/40">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-teal-200 mb-3 border border-white/10">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              Tài Liệu Độc Quyền — Bám Sát Ma Trận Sở GD&ĐT Hải Phòng 2025
            </div>
            <h3 className="text-xl font-bold">11 chuyên đề trọng tâm vận dụng cao (VDC)</h3>
            <p className="text-xs text-teal-200/90 mt-1 max-w-3xl leading-relaxed">
              Tổng hợp từ bộ tài liệu ôn thi học sinh giỏi thành phố: Dãy số truy hồi, Quy hoạch tuyến tính thực tế, Ba đường conic ứng dụng, Nguyên lý Dirichlet chuồng - thỏ và Nguyên lý bất biến.
            </p>
          </div>

          {/* Topics Grid Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {HAIPHONG_SPECIAL_TOPICS.map((top) => {
              const isSelected = selectedHpTopic.id === top.id;
              return (
                <button
                  key={top.id}
                  onClick={() => setSelectedHpTopic(top)}
                  className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-teal-50/90 dark:bg-teal-950/50 border-teal-500 shadow-xs ring-2 ring-teal-500/20'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                        Chuyên đề {top.topic_number < 10 ? `0${top.topic_number}` : top.topic_number}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {top.exam_weight.split('(')[0]}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                      {top.title_vi}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      {top.title_en}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                    <span>{isSelected ? 'Đang xem' : 'Xem chi tiết'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Topic Content Display */}
          {selectedHpTopic && (
            <div className="space-y-6">
              {/* Topic Detail Header */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-600 text-white">
                      Chuyên đề {selectedHpTopic.topic_number < 10 ? `0${selectedHpTopic.topic_number}` : selectedHpTopic.topic_number}
                    </span>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                      {selectedHpTopic.exam_weight}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                    {selectedHpTopic.title_vi}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    {selectedHpTopic.title_en}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openQuizModalForSpecialTopic(selectedHpTopic)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 transition shadow-xs hover:shadow-teal-500/20 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Tạo bài tập chuyên đề & làm ngay
                  </button>

                  <button
                    onClick={() => printExamOrNotes(`Chuyên đề ${selectedHpTopic.topic_number}: ${selectedHpTopic.title_vi}`)}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
                    title="In tài liệu chuyên đề này"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Key Formulas Section */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Các Công Thức & Định Lý Cốt Lõi (Key Formulas)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedHpTopic.key_formulas.map((form, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 text-xs"
                    >
                      <MathRenderer content={form} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Theory Content */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Lý Thuyết & Phương Pháp Giải Mẫu
                </h4>
                <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 rounded-xl border border-slate-200/70 dark:border-slate-800 leading-relaxed text-xs sm:text-sm">
                  <MathRenderer content={selectedHpTopic.content_markdown} />
                </div>
              </div>

              {/* Sample Problems */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Bài Tập Minh Họa Vận Dụng Cao (Sample Olympiad Problems)
                </h4>
                <div className="space-y-4">
                  {selectedHpTopic.sample_problems.map((prob, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="text-xs sm:text-sm font-bold text-teal-900 dark:text-teal-300">
                          <MathRenderer content={prob.problem_en} />
                        </div>
                        {prob.problem_vi && (
                          <div className="text-xs text-slate-600 dark:text-slate-400 italic">
                            <MathRenderer content={`*(${prob.problem_vi})*`} />
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 space-y-2">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                          Hướng dẫn giải chi tiết (Solution):
                        </span>
                        <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200/70 dark:border-slate-700">
                          <MathRenderer content={prob.solution_vi || prob.solution_en} />
                        </div>
                        {prob.answer && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <span>Đáp số (Answer):</span>
                            <span>{prob.answer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LỘ TRÌNH ÔN THI 12 TUẦN */}
      {activeStudyTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-900 via-teal-950 to-slate-900 p-6 rounded-2xl text-white shadow-sm border border-teal-800/40">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-teal-200 mb-3 border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Chiến Lược Ôn Luyện Đạt Giải Cao — Sở GD&ĐT Hải Phòng
            </div>
            <h3 className="text-xl font-bold">Kế Hoạch & Lộ trình ôn luyện 12 tuần</h3>
            <p className="text-xs text-teal-200/90 mt-1 max-w-3xl leading-relaxed">
              Thiết kế khoa học 3 giai đoạn: Nền tảng (Tuần 1–3) → Chuyên sâu VDC theo mạch (Tuần 4–8) → Tổng luyện đề bấm giờ 90 phút (Tuần 9–12).
            </p>
          </div>

          <div className="space-y-6">
            {HAIPHONG_12_WEEK_ROADMAP.map((phase) => (
              <div
                key={phase.phase}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4"
              >
                <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
                  <h4 className="text-base font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    {phase.phase_name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {phase.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {phase.weeks.map((w) => (
                    <div
                      key={w.week}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-2.5 flex flex-col justify-between"
                    >
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                          Tuần {w.week}
                        </span>
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1.5 leading-snug">
                          {w.title.split(':')[1]?.trim() || w.title}
                        </h5>
                        <ul className="mt-2.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                          {w.tasks.map((task, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRỢ LÝ TỰ HỌC AI TÙY BIẾN */}
      {activeStudyTab === 'ai_assistant' && (
        <div className="space-y-6">
          {/* Search & Topic Control Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-800 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Study Assistant for Math Olympiad
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Góc tự học chuyên đề tùy chọn bằng AI
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Nhập bất kỳ chủ đề toán học nào để AI sinh bài giảng lý thuyết chuẩn KaTeX và bài tập thực hành.
                </p>
              </div>
            </div>

            {/* Input & Action */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateLesson()}
                  placeholder="VD: Pigeonhole Principle, Whispering gallery ellipse, Squeeze Theorem..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                disabled={isLoading || !topicInput.trim()}
                onClick={() => handleGenerateLesson()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Đang Sinh Bài Giảng...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Sinh Bài Học AI
                  </>
                )}
              </button>
            </div>

            {/* Suggested Quick Topics */}
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-400 mr-1">Gợi ý nhanh:</span>
              {POPULAR_TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setTopicInput(topic);
                    handleGenerateLesson(topic);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition"
                >
                  {topic.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
              {errorMsg}
            </div>
          )}
        </div>
      )}


      {/* Lesson Viewer */}
      {currentNote && (
        <div className="space-y-6">
          {/* Top Actions: Create Quiz, Save note, Print */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                Chuyên đề đang học
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {currentNote.topic}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={openQuizModalForCurrentNote}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 transition shadow-xs hover:shadow-teal-500/20 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Tạo bài tập chuyên đề & làm ngay
              </button>

              <button
                onClick={handleSaveToNotes}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Đã Lưu Vào Vở Ghi!
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    Lưu Vào Vở Ghi
                  </>
                )}
              </button>

              <button
                onClick={() => printExamOrNotes(`Bài giảng: ${currentNote.topic}`)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                title="In hoặc lưu PDF bài giảng"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Section 1: Theory Content with KaTeX */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-700/80">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span>1. Tóm tắt lý thuyết & công thức trọng tâm (Core Theory)</span>
              </h4>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Chuẩn Lý Thuyết & Công Thức Olympic
              </span>
            </div>

            <div className="bg-slate-50/50 dark:bg-slate-900/30 p-5 sm:p-6 rounded-xl border border-slate-200/70 dark:border-slate-800/80 leading-relaxed">
              <MathRenderer content={currentNote.content_markdown} />
            </div>
          </div>

          {/* Section 2: Mathematical Glossary */}
          {currentNote.glossary && currentNote.glossary.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Languages className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                2. Từ Vựng & Thuật Ngữ Toán Chuyên Ngành (Glossary & Definitions)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Từ vựng chuẩn quốc tế giúp học sinh đọc hiểu đề thi HSG Tiếng Anh chính xác và không bị nhầm lẫn.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {currentNote.glossary.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-teal-600 dark:text-teal-400 text-xs sm:text-sm">
                        {item.term_en}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {item.term_vi}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {item.definition}
                    </p>
                    {item.example && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                        <strong>Ví dụ: </strong>
                        <MathRenderer content={item.example} inline />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Typical Methods & Worked Examples */}
          {currentNote.methods && currentNote.methods.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                3. Phương Pháp Giải Các Dạng Toán Điển Hình (Methods & Worked Examples)
              </h4>

              <div className="space-y-4">
                {currentNote.methods.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                        Phương pháp {idx + 1}
                      </span>
                      <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {m.name_en} {m.name_vi ? `(${m.name_vi})` : ''}
                      </h5>
                    </div>

                    {m.steps && m.steps.length > 0 && (
                      <div className="space-y-1 pl-1">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Các bước thực hiện:
                        </span>
                        {m.steps.map((s, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <span className="font-bold text-teal-500">{sIdx + 1}.</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {m.sample_problem && (
                      <div className="p-3.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          Bài toán minh họa (Sample Problem):
                        </div>
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                          <MathRenderer content={m.sample_problem} />
                        </div>
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Hướng dẫn giải:
                          </span>
                          <MathRenderer content={m.solution} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL TÙY CHỌN TẠO BÀI TẬP CHUYÊN ĐỀ BẰNG AI (GEMINI POWERED)             */}
      {/* ========================================================================= */}
      {showQuizModal && quizModalTopic && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-850 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-750 shadow-2xl overflow-hidden flex flex-col my-auto">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-750/80 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 mb-1 border border-teal-200 dark:border-teal-800">
                    <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    AI Tự Động Biên Soạn 100%
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    Tùy Chọn Đề Bài Tập Chuyên Đề
                  </h3>
                  <p className="text-xs text-teal-700 dark:text-teal-300 font-semibold mt-0.5 line-clamp-1">
                    Chuyên đề: {quizModalTopic.title_vi}
                  </p>
                </div>
              </div>

              {!isGeneratingQuiz && (
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Error Notification */}
              {quizGenerationError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <div className="flex-1 leading-relaxed">{quizGenerationError}</div>
                </div>
              )}

              {/* Tùy chọn 1: Số lượng câu hỏi */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    Số lượng câu hỏi:
                  </label>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                    {quizQuestionCount} câu
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[4, 6, 8, 10, 15].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      disabled={isGeneratingQuiz}
                      onClick={() => setQuizQuestionCount(cnt)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                        quizQuestionCount === cnt
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs ring-2 ring-teal-500/20'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-300'
                      }`}
                    >
                      {cnt} câu
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">Hoặc tùy chỉnh (2-22 câu):</span>
                  <input
                    type="number"
                    min={2}
                    max={22}
                    value={quizQuestionCount}
                    disabled={isGeneratingQuiz}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setQuizQuestionCount(Math.min(22, Math.max(2, val)));
                      }
                    }}
                    className="w-16 px-2 py-1 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-center text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Tùy chọn 2: Loại câu hỏi (Đúng theo yêu cầu người dùng) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Loại câu hỏi muốn làm:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: Trắc nghiệm (MCQ) */}
                  <div
                    onClick={() => !isGeneratingQuiz && setQuizQuestionType('mcq')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-2.5 ${
                      quizQuestionType === 'mcq'
                        ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-200'
                    }`}
                  >
                    <ListOrdered className={`w-4 h-4 mt-0.5 shrink-0 ${quizQuestionType === 'mcq' ? 'text-teal-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        Trắc nghiệm (4 lựa chọn)
                        {quizQuestionType === 'mcq' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Chọn 1 đáp án đúng trong 4 phương án A, B, C, D.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Trả lời ngắn */}
                  <div
                    onClick={() => !isGeneratingQuiz && setQuizQuestionType('short_answer')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-2.5 ${
                      quizQuestionType === 'short_answer'
                        ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-200'
                    }`}
                  >
                    <Hash className={`w-4 h-4 mt-0.5 shrink-0 ${quizQuestionType === 'short_answer' ? 'text-teal-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        Trả lời ngắn (Điền đáp số)
                        {quizQuestionType === 'short_answer' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Tự tính toán và điền số nguyên, phân số, số thập phân.
                      </p>
                    </div>
                  </div>

                  {/* Option 3: Đúng - Sai (True / False) */}
                  <div
                    onClick={() => !isGeneratingQuiz && setQuizQuestionType('true_false')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-2.5 ${
                      quizQuestionType === 'true_false'
                        ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-200'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${quizQuestionType === 'true_false' ? 'text-teal-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        Đúng - Sai (True / False)
                        {quizQuestionType === 'true_false' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Phán đoán tính đúng/sai của mệnh đề toán học.
                      </p>
                    </div>
                  </div>

                  {/* Option 4: Kết hợp (Mix) */}
                  <div
                    onClick={() => !isGeneratingQuiz && setQuizQuestionType('mixed')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-2.5 ${
                      quizQuestionType === 'mixed'
                        ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-200'
                    }`}
                  >
                    <Layers className={`w-4 h-4 mt-0.5 shrink-0 ${quizQuestionType === 'mixed' ? 'text-teal-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        Kết hợp (Mix các dạng)
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 font-extrabold">
                          Khuyên dùng
                        </span>
                        {quizQuestionType === 'mixed' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Phối hợp cả Trắc nghiệm, Đúng - Sai và Điền đáp số.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tùy chọn 3: Mức độ khó & Ngôn ngữ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Độ khó */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Mức độ nhận thức:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'application', label: 'Vận dụng' },
                      { id: 'advanced', label: 'VDC (HSG)' },
                      { id: 'mixed', label: 'Hỗn hợp' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        disabled={isGeneratingQuiz}
                        onClick={() => setQuizDifficulty(d.id as TopicDifficulty)}
                        className={`py-2 px-1 text-[11px] font-bold rounded-lg border transition text-center ${
                          quizDifficulty === d.id
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ngôn ngữ */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Ngôn ngữ hiển thị:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'bilingual', label: '🇻🇳 Song ngữ' },
                      { id: 'english_only', label: '🇬🇧 English' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        disabled={isGeneratingQuiz}
                        onClick={() => setQuizMode(m.id as ExamMode)}
                        className={`py-2 px-1 text-[11px] font-bold rounded-lg border transition text-center ${
                          quizMode === m.id
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trạng thái Loading Animation khi AI đang tạo đề */}
              {isGeneratingQuiz && (
                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-center space-y-2.5 animate-pulse">
                  <RotateCw className="w-6 h-6 text-teal-600 dark:text-teal-400 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-teal-800 dark:text-teal-200">
                    {generationStepStatus || 'Đang tạo câu hỏi chuyên đề mới bằng AI...'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    AI đang phân tích kiến thức chuyên sâu và sinh toàn bộ công thức toán LaTeX cùng lời giải chi tiết mới 100%.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-750/80 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isGeneratingQuiz}
                onClick={() => setShowQuizModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={isGeneratingQuiz}
                onClick={handleExecuteAiQuizGeneration}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 transition shadow-sm hover:shadow-teal-500/20 active:scale-95 disabled:opacity-50"
              >
                {isGeneratingQuiz ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Đang Biên Soạn Đề AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    🚀 Bắt Đầu Tạo Bằng AI & Làm Ngay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================================================
// Fallback questions mapped to HSG exam topics
// Bám sát 13 chuyên đề theo cấu trúc đề thi HSG Toán Hải Phòng
// ================================================
function getTopicFallbackQuestions(topic: string): Question[] {
  const t = topic.toLowerCase();
  const ts = Date.now();

  // Trigonometry
  if (t.includes('trig') || t.includes('luong giac') || t.includes('sin') || t.includes('cos')) {
    return [
      { id: `fb-${ts}-1`, exam_id: `practice-fb`, part: 'PART_1', order_index: 1, strand: 'algebra_calculus', topic, difficulty: 'understanding',
        question_en: 'Find the maximum value of $f(x) = 3\\sin(2x) - 4\\cos(2x) + 5$.',
        question_vi: 'Tim gia tri lon nhat cua ham so $f(x) = 3\\sin(2x) - 4\\cos(2x) + 5$.',
        options_en: ['A. 5', 'B. 10', 'C. 12', 'D. 7'], correct_answer: 'B',
        solution_en: '$3\\sin(2x) - 4\\cos(2x) \\le \\sqrt{9+16} = 5$. Max $= 5+5 = 10$.', solution_vi: 'Ap dung $a\\sin u + b\\cos u \\le \\sqrt{a^2+b^2}$, max = 10.' },
      { id: `fb-${ts}-2`, exam_id: `practice-fb`, part: 'PART_1', order_index: 2, strand: 'algebra_calculus', topic, difficulty: 'application',
        question_en: 'Solve $2\\sin^2 x - 3\\sin x + 1 = 0$ for $x \\in [0, 2\\pi]$. How many solutions?',
        question_vi: 'Giai phuong trinh $2\\sin^2 x - 3\\sin x + 1 = 0$ voi $x \\in [0, 2\\pi]$. Bao nhieu nghiem?',
        options_en: ['A. 2', 'B. 3', 'C. 4', 'D. 5'], correct_answer: 'B',
        solution_en: 'Let $t = \\sin x$. $2t^2-3t+1=0 \\Rightarrow t=1$ or $t=1/2$. $\\sin x = 1$: 1 solution. $\\sin x = 1/2$: 2 solutions. Total = 3.', solution_vi: 'Dat $t = \\sin x$, giai ra $t=1$ (1 nghiem) va $t=1/2$ (2 nghiem). Tong 3.' },
    ];
  }

  // Sequences / Progressions
  if (t.includes('sequence') || t.includes('recur') || t.includes('day so') || t.includes('cap so') || t.includes('progression')) {
    return [
      { id: `fb-${ts}-1`, exam_id: `practice-fb`, part: 'PART_1', order_index: 1, strand: 'algebra_calculus', topic, difficulty: 'understanding',
        question_en: 'An arithmetic progression has $u_1 = 3$ and common difference $d = 4$. What is $u_{20}$?',
        question_vi: 'Cap so cong co $u_1 = 3$ va cong sai $d = 4$. Tim $u_{20}$.',
        options_en: ['A. 79', 'B. 83', 'C. 75', 'D. 80'], correct_answer: 'A',
        solution_en: '$u_{20} = u_1 + 19d = 3 + 19 \\times 4 = 79$.', solution_vi: '$u_{20} = 3 + 19 \\times 4 = 79$.' },
      { id: `fb-${ts}-2`, exam_id: `practice-fb`, part: 'PART_2', order_index: 2, strand: 'algebra_calculus', topic, difficulty: 'application',
        question_en: 'A geometric sequence has $u_1 = 2$ and ratio $q = 3$. Find $S_5$.',
        question_vi: 'Cap so nhan co $u_1 = 2$ va cong boi $q = 3$. Tim $S_5$.',
        correct_answer: '242',
        solution_en: '$S_5 = u_1 \\cdot \\frac{q^5-1}{q-1} = 2 \\cdot \\frac{243-1}{2} = 242$.', solution_vi: '$S_5 = 2 \\cdot \\frac{3^5-1}{3-1} = 242$.' },
    ];
  }

  // Limits
  if (t.includes('limit') || t.includes('gioi han') || t.includes('continuous') || t.includes('lien tuc')) {
    return [
      { id: `fb-${ts}-1`, exam_id: `practice-fb`, part: 'PART_1', order_index: 1, strand: 'algebra_calculus', topic, difficulty: 'application',
        question_en: 'Compute $\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}$.',
        question_vi: 'Tinh $\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}$.',
        options_en: ['A. 1', 'B. 3', 'C. 0', 'D. $\\infty$'], correct_answer: 'B',
        solution_en: '$\\lim_{x \\to 0} \\frac{\\sin(3x)}{x} = 3 \\cdot \\lim_{x \\to 0} \\frac{\\sin(3x)}{3x} = 3 \\cdot 1 = 3$.', solution_vi: 'Nhan chia cho 3, ap dung gioi han co ban.' },
      { id: `fb-${ts}-2`, exam_id: `practice-fb`, part: 'PART_2', order_index: 2, strand: 'algebra_calculus', topic, difficulty: 'advanced',
        question_en: 'Find $\\lim_{x \\to 1} \\frac{x^3 - 1}{x^2 - 1}$.',
        question_vi: 'Tim $\\lim_{x \\to 1} \\frac{x^3 - 1}{x^2 - 1}$.',
        correct_answer: '3/2',
        solution_en: 'Factor: $\\frac{(x-1)(x^2+x+1)}{(x-1)(x+1)} = \\frac{x^2+x+1}{x+1} \\to \\frac{3}{2}$.', solution_vi: 'Phan tich nhan tu: $\\frac{x^2+x+1}{x+1} = \\frac{3}{2}$.' },
    ];
  }

  // Exponential & Logarithmic
  if (t.includes('exponen') || t.includes('logarit') || t.includes('log') || t.includes('mu')) {
    return [
      { id: `fb-${ts}-1`, exam_id: `practice-fb`, part: 'PART_1', order_index: 1, strand: 'algebra_calculus', topic, difficulty: 'application',
        question_en: 'Solve $\\log_2(x-1) + \\log_2(x+3) = 5$. Find the positive solution.',
        question_vi: 'Giai $\\log_2(x-1) + \\log_2(x+3) = 5$. Tim nghiem duong.',
        options_en: ['A. 5', 'B. 7', 'C. 3', 'D. 9'], correct_answer: 'A',
        solution_en: '$\\log_2((x-1)(x+3)) = 5 \\Rightarrow (x-1)(x+3) = 32 \\Rightarrow x^2+2x-35=0 \\Rightarrow x=5$.', solution_vi: 'Gom log, giai PT bac 2, x = 5 thoa man.' },
    ];
  }

  // Quadratic / Inequalities
  if (t.includes('quadratic') || t.includes('inequalit') || t.includes('bac hai') || t.includes('bat phuong trinh')) {
    return [
      { id: `fb-${ts}-1`, exam_id: `practice-fb`, part: 'PART_1', order_index: 1, strand: 'algebra_calculus', topic, difficulty: 'understanding',
        question_en: 'Find all $m$ so that $x^2 - 2mx + m + 2 > 0$ for all $x \\in \\mathbb{R}$.',
        question_vi: 'Tim $m$ de $x^2 - 2mx + m + 2 > 0$ voi moi $x \\in \\mathbb{R}$.',
        options_en: ['A. $-1 < m < 2$', 'B. $m > 2$', 'C. $m < -1$', 'D. $m \\in \\mathbb{R}$'], correct_answer: 'A',
        solution_en: 'Need $\\Delta < 0$: $4m^2 - 4(m+2) < 0 \\Rightarrow m^2 - m - 2 < 0 \\Rightarrow -1 < m < 2$.', solution_vi: 'Can $\\Delta < 0$, giai BPT bac 2 theo m.' },
    ];
  }

  // Derivatives
  if (t.includes('derivat') || t.includes('dao ham') || t.includes('calculus') && !t.includes('trig')) {
    return [
      { id: `fb-${ts}-1`, exam_id: `practice-fb`, part: 'PART_1', order_index: 1, strand: 'algebra_calculus', topic, difficulty: 'application',
        question_en: 'Find the number of critical points of $f(x) = x^3 - 3x^2 + 4$.',
        question_vi: 'Tim so diem cuc tri cua $f(x) = x^3 - 3x^2 + 4$.',
        options_en: ['A. 0', 'B. 1', 'C. 2', 'D. 3'], correct_answer: 'C',
        solution_en: "$f'(x) = 3x^2 - 6x = 3x(x-2) = 0 \\Rightarrow x=0, x=2$. Two critical points.", solution_vi: "$f'(x) = 3x(x-2) = 0$, co 2 diem cuc tri." },
    ];
  }

  // Conic Sections
  if (t.includes('conic') || t.includes('ellips') || t.includes('hyperbol') || t.includes('parabol')) {
    return [
      { id: `fb-${ts}-1`, exam_id: `practice-fb`, part: 'PART_1', order_index: 1, strand: 'geometry_measurement', topic, difficulty: 'understanding',
        question_en: 'An ellipse has equation $\\frac{x^2}{25} + \\frac{y^2}{9} = 1$. Find the eccentricity.',
        question_vi: 'Elip co phuong trinh $\\frac{x^2}{25} + \\frac{y^2}{9} = 1$. Tim tam sai.',
        options_en: ['A. $\\frac{3}{5}$', 'B. $\\frac{4}{5}$', 'C. $\\frac{5}{3}$', 'D. $\\frac{4}{3}$'], correct_answer: 'B',
        solution_en: '$a^2=25, b^2=9, c^2=a^2-b^2=16, c=4$. $e = c/a = 4/5$.', solution_vi: '$c = \\sqrt{25-9} = 4$, tam sai $e = 4/5$.' },
    ];
  }

  // Space Geometry
  if (t.includes('space') || t.includes('perpendic') || t.includes('vuong goc') || t.includes('khong gian') || t.includes('parallel') || t.includes('song song')) {
    return [
      { id: `fb-${ts}-1`, exam_id: `practice-fb`, part: 'PART_1', order_index: 1, strand: 'geometry_measurement', topic, difficulty: 'understanding',
        question_en: 'In tetrahedron $ABCD$, if $AB \\perp CD$ and $AC \\perp BD$, prove $AD \\perp BC$.',
        question_vi: 'Trong tu dien $ABCD$, neu $AB \\perp CD$ va $AC \\perp BD$, chung minh $AD \\perp BC$.',
        options_en: ['A. Use dot product', 'B. Use cross product', 'C. Use coordinates', 'D. All methods work'], correct_answer: 'D',
        solution_en: 'By dot products: $\\vec{AB} \\cdot \\vec{CD} = 0$ and $\\vec{AC} \\cdot \\vec{BD} = 0$. Expanding and adding gives $\\vec{AD} \\cdot \\vec{BC} = 0$.', solution_vi: 'Dung tich vo huong, khai trien va cong 2 dieu kien.' },
    ];
  }

  // Coordinate Geometry
  if (t.includes('coordinate') || t.includes('vector') || t.includes('toa do') || t.includes('distance')) {
    return [
      { id: `fb-${ts}-1`, exam_id: `practice-fb`, part: 'PART_1', order_index: 1, strand: 'geometry_measurement', topic, difficulty: 'application',
        question_en: 'Find the distance from point $M(3, -1)$ to line $4x - 3y + 7 = 0$.',
        question_vi: 'Tim khoang cach tu diem $M(3, -1)$ den duong thang $4x - 3y + 7 = 0$.',
        options_en: ['A. 2', 'B. $\\frac{22}{5}$', 'C. 4', 'D. $\\frac{18}{5}$'], correct_answer: 'B',
        solution_en: '$d = \\frac{|4(3) - 3(-1) + 7|}{\\sqrt{16+9}} = \\frac{22}{5}$.', solution_vi: 'Ap dung CT khoang cach diem-duong thang.' },
    ];
  }

  // Probability / Statistics
  if (t.includes('probab') || t.includes('statistic') || t.includes('xac suat') || t.includes('thong ke')) {
    return [
      { id: `fb-${ts}-1`, exam_id: `practice-fb`, part: 'PART_1', order_index: 1, strand: 'statistics_discrete', topic, difficulty: 'application',
        question_en: 'A fair die is rolled 3 times. What is the probability of getting exactly two 6s?',
        question_vi: 'Gieo xuc xac can doi 3 lan. Xac suat de duoc dung 2 mat 6?',
        options_en: ['A. $\\frac{5}{72}$', 'B. $\\frac{1}{36}$', 'C. $\\frac{5}{216}$', 'D. $\\frac{1}{12}$'], correct_answer: 'A',
        solution_en: '$P = \\binom{3}{2} \\cdot (\\frac{1}{6})^2 \\cdot \\frac{5}{6} = \\frac{15}{216} = \\frac{5}{72}$.', solution_vi: 'Ap dung nhi thuc Newton: $C_3^2 \\cdot (1/6)^2 \\cdot (5/6) = 5/72$.' },
    ];
  }

  // Pigeonhole / Combinatorics / Discrete
  if (t.includes('pigeon') || t.includes('dirichlet') || t.includes('combinat') || t.includes('invariant') || t.includes('bat bien') || t.includes('to hop')) {
    return [
      { id: `fb-${ts}-1`, exam_id: `practice-fb`, part: 'PART_1', order_index: 1, strand: 'statistics_discrete', topic, difficulty: 'application',
        question_en: 'A bag contains 10 red, 8 blue, and 6 green marbles. What is the minimum number to guarantee at least 4 of the same color?',
        question_vi: 'Tui co 10 bi do, 8 bi xanh duong, 6 bi xanh la. Can lay it nhat bao nhieu bi de chac chan co 4 bi cung mau?',
        options_en: ['A. 10', 'B. 12', 'C. 13', 'D. 15'], correct_answer: 'A',
        solution_en: 'Worst case: 3 red + 3 blue + 3 green = 9. The 10th marble must give 4 of one color.', solution_vi: 'Truong hop xau nhat: 3+3+3=9. Vien thu 10 chac chan tao 4 cung mau.' },
    ];
  }

  // Default: Algebra general
  return [
    { id: `fb-${ts}-1`, exam_id: `practice-fb`, part: 'PART_1', order_index: 1, strand: 'algebra_calculus', topic, difficulty: 'application',
      question_en: 'If $a + b = 5$ and $ab = 6$, find $a^2 + b^2$.',
      question_vi: 'Neu $a + b = 5$ va $ab = 6$, tim $a^2 + b^2$.',
      options_en: ['A. 11', 'B. 13', 'C. 19', 'D. 25'], correct_answer: 'B',
      solution_en: '$a^2+b^2 = (a+b)^2 - 2ab = 25 - 12 = 13$.', solution_vi: '$a^2+b^2 = (a+b)^2 - 2ab = 25 - 12 = 13$.' },
    { id: `fb-${ts}-2`, exam_id: `practice-fb`, part: 'PART_2', order_index: 2, strand: 'algebra_calculus', topic, difficulty: 'advanced',
      question_en: 'Find all real solutions of $x^4 - 5x^2 + 4 = 0$.',
      question_vi: 'Tim tat ca nghiem thuc cua $x^4 - 5x^2 + 4 = 0$.',
      correct_answer: 'x = 1, -1, 2, -2',
      solution_en: 'Let $t = x^2$: $t^2 - 5t + 4 = 0 \\Rightarrow t = 1, 4$. So $x = \\pm 1, \\pm 2$.', solution_vi: 'Dat $t = x^2$, giai PT bac 2 theo t.' },
  ];
}

