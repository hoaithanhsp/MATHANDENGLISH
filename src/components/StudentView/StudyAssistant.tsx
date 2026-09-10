import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Search,
  Languages,
  Bookmark,
  CheckCircle2,
  Printer,
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
  SlidersHorizontal,
  Volume2,
  GraduationCap
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
  'Trigonometry & Trigonometric Equations',
  'Sequences, Progressions & Recurrences',
  'Limits & Continuous Functions',
  'Exponential & Logarithmic Functions',
  'Quadratic Functions & Inequalities',
  'Derivatives & Applications',
  'Conic Sections: Ellipse, Hyperbola, Parabola',
  'Perpendicularity & Parallelism in 3D Space',
  'Coordinate Geometry & Vectors in Plane',
  'Distances & Angles in Space',
  'Probability & Statistics',
  'Pigeonhole Principle & Combinatorics',
  'Invariance Principle & Monovariants',
];

export const StudyAssistant: React.FC<StudyAssistantProps> = ({
  onSaveNote,
  onStartPracticeQuiz,
}) => {
  const [activeStudyTab, setActiveStudyTab] = useState<'haiphong_topics' | 'roadmap' | 'ai_assistant'>('haiphong_topics');
  const [topicSubView, setTopicSubView] = useState<'vdc_topics' | 'curriculum_chapters'>('vdc_topics');
  const [selectedHpTopic, setSelectedHpTopic] = useState<OlympiadSpecialTopic>(HAIPHONG_SPECIAL_TOPICS[0]);
  const [selectedChapterNote, setSelectedChapterNote] = useState<StudentStudyNote>(CHAPTER_STUDY_NOTES[0]);
  
  // Custom AI Lesson state
  const [aiGeneratedNote, setAiGeneratedNote] = useState<StudentStudyNote | null>(null);
  const [topicInput, setTopicInput] = useState('');
  const [mode, setMode] = useState<ExamMode>('bilingual');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
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

  // Audio pronunciation
  const speakWord = (word: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

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

  // Mở modal tạo đề cho chương SGK đang chọn
  const openQuizModalForChapterNote = (note: StudentStudyNote) => {
    setQuizModalTopic({
      title_vi: note.topic,
      title_en: '',
      strand: 'algebra_calculus',
    });
    setQuizQuestionCount(6);
    setQuizQuestionType('mixed');
    setQuizDifficulty('application');
    setQuizMode(note.mode || mode);
    setQuizGenerationError('');
    setShowQuizModal(true);
  };

  // Mở modal tạo đề cho bài học AI
  const openQuizModalForAiNote = (note: StudentStudyNote) => {
    setQuizModalTopic({
      title_vi: note.topic,
      title_en: '',
      strand: 'algebra_calculus',
    });
    setQuizQuestionCount(6);
    setQuizQuestionType('mixed');
    setQuizDifficulty('advanced');
    setQuizMode(note.mode || mode);
    setQuizGenerationError('');
    setShowQuizModal(true);
  };

  // Lưu chuyên đề VDC vào vở ghi
  const handleSaveSpecialTopicToNotes = (top: OlympiadSpecialTopic) => {
    const noteToSave: StudentStudyNote = {
      id: `note-${top.id}-${Date.now()}`,
      student_id: 'user',
      topic: `Chuyên đề ${top.topic_number < 10 ? `0${top.topic_number}` : top.topic_number}: ${top.title_vi}`,
      mode: mode,
      content_markdown: `## ${top.title_vi} (${top.title_en})\n\n**Trọng số ma trận:** ${top.exam_weight}\n\n### Công thức & Định lý cốt lõi:\n${top.key_formulas.map(f => `- ${f}`).join('\n')}\n\n${top.content_markdown}`,
      glossary: (top.glossary || []).map(g => ({
        term_en: g.term_en,
        term_vi: g.term_vi,
        definition: g.definition,
        example: g.example || '',
      })),
      created_at: new Date().toISOString(),
    };
    onSaveNote(noteToSave);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Lưu bài học chương / AI vào vở ghi
  const handleSaveNoteDirectly = (note: StudentStudyNote) => {
    onSaveNote(note);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Sinh bài học bằng AI tùy biến
  const handleGenerateLesson = async (customTopic?: string) => {
    const topicToGen = (customTopic || topicInput).trim();
    if (!topicToGen) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const lesson = await generateStudyLesson({
        topic: topicToGen,
        mode,
      });

      if (!lesson) {
        throw new Error('AI không phản hồi nội dung bài giảng. Vui lòng thử lại.');
      }

      const newNote: StudentStudyNote = {
        id: `ai-lesson-${Date.now()}`,
        student_id: 'user',
        topic: topicToGen,
        mode,
        content_markdown: lesson.content_markdown || '',
        glossary: lesson.glossary || [],
        methods: lesson.methods || [],
        created_at: new Date().toISOString(),
      };

      setAiGeneratedNote(newNote);
    } catch (err: any) {
      console.error('Generate lesson error:', err);
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi tạo bài học bằng AI. Vui lòng kiểm tra API Key hoặc kết nối mạng.');
    } finally {
      setIsLoading(false);
    }
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

      {/* ========================================================================= */}
      {/* TAB 1: 11 CHUYÊN ĐỀ VDC HẢI PHÒNG 2025 & HỌC LIỆU CHUẨN                    */}
      {/* ========================================================================= */}
      {activeStudyTab === 'haiphong_topics' && (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 p-6 rounded-2xl text-white shadow-sm border border-teal-800/40">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-teal-200 border border-white/10">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                Tài Liệu Độc Quyền — Bám Sát Ma Trận Sở GD&ĐT Hải Phòng 2025
              </div>

              {/* Sub-view toggle: 11 Chuyên đề VDC vs 25 Chương SGK */}
              <div className="inline-flex rounded-xl p-1 bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setTopicSubView('vdc_topics')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    topicSubView === 'vdc_topics'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-teal-200 hover:text-white'
                  }`}
                >
                  11 Chuyên đề VDC
                </button>
                <button
                  type="button"
                  onClick={() => setTopicSubView('curriculum_chapters')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    topicSubView === 'curriculum_chapters'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-teal-200 hover:text-white'
                  }`}
                >
                  25 Chương SGK chuẩn
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold">
              {topicSubView === 'vdc_topics'
                ? '11 Chuyên Đề Trọng Tâm Vận Dụng Cao (VDC)'
                : '25 Chương Học Liệu Toán Tiếng Anh Chuẩn Quốc Tế'}
            </h3>
            <p className="text-xs text-teal-200/90 mt-1 max-w-3xl leading-relaxed">
              {topicSubView === 'vdc_topics'
                ? 'Hệ thống hóa toàn bộ công thức cốt lõi, phương pháp giải toán Olympic và từ vựng thuật ngữ tiếng Anh chuyên sâu cho từng chuyên đề.'
                : 'Khám phá bài giảng chi tiết, hệ thống thuật ngữ và định nghĩa toán học 25 chương theo khung chương trình GDPT 2018.'}
            </p>
          </div>

          {/* Subview 1: 11 Chuyên đề VDC */}
          {topicSubView === 'vdc_topics' && (
            <>
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
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
                          {top.title_en}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                        <span>{isSelected ? 'Đang xem lý thuyết & từ vựng' : 'Xem chuyên đề'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Topic Full Content Display */}
              {selectedHpTopic && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Topic Action Header */}
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
                        onClick={() => handleSaveSpecialTopicToNotes(selectedHpTopic)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
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
                        onClick={() => printExamOrNotes(`Chuyên đề ${selectedHpTopic.topic_number}: ${selectedHpTopic.title_vi}`)}
                        className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
                        title="In hoặc lưu PDF chuyên đề"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mục 1: Tóm tắt lý thuyết & công thức trọng tâm (Core Theory) */}
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

                    {/* Key Formulas */}
                    {selectedHpTopic.key_formulas && selectedHpTopic.key_formulas.length > 0 && (
                      <div className="space-y-2.5">
                        <div className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          Công Thức & Định Lý Cốt Lõi (Key Formulas):
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedHpTopic.key_formulas.map((form, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 text-xs text-slate-900 dark:text-slate-100"
                            >
                              <MathRenderer content={form} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Main Theory Content */}
                    <div className="bg-slate-50/60 dark:bg-slate-900/40 p-5 sm:p-6 rounded-xl border border-slate-200/70 dark:border-slate-800/80 leading-relaxed text-xs sm:text-sm">
                      <MathRenderer content={selectedHpTopic.content_markdown} />
                    </div>
                  </div>

                  {/* Mục 2: Từ Vựng & Thuật Ngữ Toán Chuyên Ngành (Glossary & Definitions) */}
                  {selectedHpTopic.glossary && selectedHpTopic.glossary.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Languages className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            2. Từ Vựng & Thuật Ngữ Toán Chuyên Ngành (Glossary & Definitions)
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Thuật ngữ tiếng Anh chuyên sâu bám sát đề thi Olympic Toán cho chuyên đề {selectedHpTopic.title_vi}.
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {selectedHpTopic.glossary.length} thuật ngữ trọng tâm
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {selectedHpTopic.glossary.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 space-y-2.5 hover:border-teal-300 dark:hover:border-teal-700 transition"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-teal-600 dark:text-teal-400 text-sm">
                                  <MathRenderer content={item.term_en} inline />
                                </span>
                                <button
                                  type="button"
                                  onClick={() => speakWord(item.term_en)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition"
                                  title="Phát âm tiếng Anh"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                <MathRenderer content={item.term_vi} inline />
                              </span>
                            </div>

                            {item.pronunciation && (
                              <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                                {item.pronunciation}
                              </div>
                            )}

                            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              <MathRenderer content={item.definition} inline />
                            </div>

                            {item.example && (
                              <div className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-700/70">
                                <strong className="text-teal-600 dark:text-teal-400 not-italic">Ví dụ: </strong>
                                <MathRenderer content={item.example} inline />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Subview 2: 25 Chương SGK chuẩn */}
          {topicSubView === 'curriculum_chapters' && (
            <>
              {/* Dropdown / Quick selector */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-teal-600" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Chọn chương học liệu:
                  </span>
                </div>

                <select
                  value={selectedChapterNote.id}
                  onChange={(e) => {
                    const found = CHAPTER_STUDY_NOTES.find((c) => c.id === e.target.value);
                    if (found) setSelectedChapterNote(found);
                  }}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 max-w-md w-full sm:w-auto"
                >
                  {CHAPTER_STUDY_NOTES.map((ch, idx) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.topic || `Chương ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Chapter Content */}
              {selectedChapterNote && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Chapter Action Header */}
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-teal-600 dark:text-teal-400">
                        Chương học liệu đang chọn
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {selectedChapterNote.topic}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openQuizModalForChapterNote(selectedChapterNote)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 transition shadow-xs hover:shadow-teal-500/20 active:scale-95"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        Tạo bài tập chuyên đề & làm ngay
                      </button>

                      <button
                        onClick={() => handleSaveNoteDirectly(selectedChapterNote)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
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
                        onClick={() => printExamOrNotes(`Bài giảng: ${selectedChapterNote.topic}`)}
                        className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
                        title="In hoặc lưu PDF bài giảng"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mục 1: Tóm tắt lý thuyết & công thức trọng tâm */}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-600" />
                        1. Tóm tắt lý thuyết & công thức trọng tâm (Core Theory)
                      </h4>
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Học liệu SGK Toán Tiếng Anh
                      </span>
                    </div>

                    <div className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-xl border border-slate-200/70 dark:border-slate-800 leading-relaxed text-xs sm:text-sm">
                      <MathRenderer content={selectedChapterNote.content_markdown} />
                    </div>
                  </div>

                  {/* Mục 2: Từ Vựng & Thuật Ngữ Toán Chuyên Ngành */}
                  {selectedChapterNote.glossary && selectedChapterNote.glossary.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Languages className="w-5 h-5 text-teal-600" />
                          2. Từ Vựng & Thuật Ngữ Toán Chuyên Ngành (Glossary & Definitions)
                        </h4>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {selectedChapterNote.glossary.length} từ vựng
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedChapterNote.glossary.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-teal-600 dark:text-teal-400 text-xs sm:text-sm">
                                  <MathRenderer content={item.term_en} inline />
                                </span>
                                <button
                                  type="button"
                                  onClick={() => speakWord(item.term_en)}
                                  className="p-1 rounded text-slate-400 hover:text-teal-600"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                <MathRenderer content={item.term_vi} inline />
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              <MathRenderer content={item.definition} inline />
                            </div>
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
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LỘ TRÌNH ÔN THI 12 TUẦN                                            */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* TAB 3: TRỢ LÝ TỰ HỌC AI TÙY BIẾN                                          */}
      {/* ========================================================================= */}
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
                  Nhập bất kỳ chủ đề toán học nào để AI sinh bài giảng lý thuyết chuẩn KaTeX và thuật ngữ chuyên ngành.
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
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
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

          {/* Render AI Generated Lesson */}
          {aiGeneratedNote && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] uppercase font-bold text-teal-600 dark:text-teal-400">
                    Bài giảng AI vừa tạo
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {aiGeneratedNote.topic}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openQuizModalForAiNote(aiGeneratedNote)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 transition shadow-xs hover:shadow-teal-500/20 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Tạo bài tập chuyên đề & làm ngay
                  </button>

                  <button
                    onClick={() => handleSaveNoteDirectly(aiGeneratedNote)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
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
                    onClick={() => printExamOrNotes(`Bài giảng: ${aiGeneratedNote.topic}`)}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
                    title="In bài giảng"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Section 1: Core Theory */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    1. Tóm tắt lý thuyết & công thức trọng tâm (Core Theory)
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    AI Biên Soạn Chuẩn KaTeX
                  </span>
                </div>

                <div className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-xl border border-slate-200/70 dark:border-slate-800 leading-relaxed text-xs sm:text-sm">
                  <MathRenderer content={aiGeneratedNote.content_markdown} />
                </div>
              </div>

              {/* Section 2: Glossary */}
              {aiGeneratedNote.glossary && aiGeneratedNote.glossary.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Languages className="w-5 h-5 text-teal-600" />
                      2. Từ Vựng & Thuật Ngữ Toán Chuyên Ngành (Glossary & Definitions)
                    </h4>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {aiGeneratedNote.glossary.length} thuật ngữ
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {aiGeneratedNote.glossary.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-teal-600 dark:text-teal-400 text-xs sm:text-sm">
                              <MathRenderer content={item.term_en} inline />
                            </span>
                            <button
                              type="button"
                              onClick={() => speakWord(item.term_en)}
                              className="p-1 rounded text-slate-400 hover:text-teal-600"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            <MathRenderer content={item.term_vi} inline />
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <MathRenderer content={item.definition} inline />
                        </div>
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

              {/* Section 3: Methods */}
              {aiGeneratedNote.methods && aiGeneratedNote.methods.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    3. Phương Pháp Giải Các Dạng Toán Điển Hình (Methods & Worked Examples)
                  </h4>

                  <div className="space-y-4">
                    {aiGeneratedNote.methods.map((m, idx) => (
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

              {/* Tùy chọn 2: Loại câu hỏi */}
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

                  {/* Option 3: Đúng - Sai */}
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
                        Đánh giá mệnh đề toán học là Đúng hay Sai kèm phản ví dụ.
                      </p>
                    </div>
                  </div>

                  {/* Option 4: Kết hợp các dạng */}
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
                        Kết hợp đa dạng (Mixed)
                        {quizQuestionType === 'mixed' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Phối hợp đều cả Trắc nghiệm, Trả lời ngắn và Đúng - Sai.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tùy chọn 3: Mức độ khó */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Mức độ bài tập:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={isGeneratingQuiz}
                    onClick={() => setQuizDifficulty('application')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                      quizDifficulty === 'application'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Vận dụng
                  </button>
                  <button
                    type="button"
                    disabled={isGeneratingQuiz}
                    onClick={() => setQuizDifficulty('advanced')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                      quizDifficulty === 'advanced'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    VDC / HSG 2025
                  </button>
                  <button
                    type="button"
                    disabled={isGeneratingQuiz}
                    onClick={() => setQuizDifficulty('mixed')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                      quizDifficulty === 'mixed'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Hỗn hợp
                  </button>
                </div>
              </div>

              {/* Tùy chọn 4: Ngôn ngữ */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Ngôn ngữ đề thi:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isGeneratingQuiz}
                    onClick={() => setQuizMode('bilingual')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center flex items-center justify-center gap-1.5 ${
                      quizMode === 'bilingual'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>🇻🇳 🇬🇧</span>
                    <span>Song Ngữ Anh - Việt</span>
                  </button>
                  <button
                    type="button"
                    disabled={isGeneratingQuiz}
                    onClick={() => setQuizMode('english_only')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center flex items-center justify-center gap-1.5 ${
                      quizMode === 'english_only'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>🇬🇧</span>
                    <span>100% Tiếng Anh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-750/80 bg-slate-50/50 dark:bg-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isGeneratingQuiz ? (
                  <span className="text-teal-600 dark:text-teal-400 font-semibold animate-pulse flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    {generationStepStatus || 'AI đang xử lý...'}
                  </span>
                ) : (
                  <span>Đề sinh mới 100% bằng Gemini AI</span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isGeneratingQuiz}
                  onClick={() => setShowQuizModal(false)}
                  className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  disabled={isGeneratingQuiz}
                  onClick={handleExecuteAiQuizGeneration}
                  className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 transition shadow-md shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Đang Tạo Đề...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Tạo Đề & Vào Thi Ngay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
