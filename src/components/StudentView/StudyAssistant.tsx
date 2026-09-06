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
  RotateCw
} from 'lucide-react';
import { StudentStudyNote, ExamMode, Question } from '../../types';
import MathRenderer from '../MathRenderer';
import { printExamOrNotes } from '../../utils/printPdf';
import { SAMPLE_STUDY_NOTES } from '../../data/sampleStudyNotes';
import { generateStudyLesson, generateTopicPractice } from '../../services/geminiService';

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
  const [topicInput, setTopicInput] = useState('');
  const [mode, setMode] = useState<ExamMode>('bilingual');
  const [viewLayout, setViewLayout] = useState<'dual_column' | 'single_column'>('dual_column');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentNote, setCurrentNote] = useState<StudentStudyNote>(SAMPLE_STUDY_NOTES[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Generate Lesson via API
  const handleGenerateLesson = async (topicToFetch?: string) => {
    const topic = topicToFetch || topicInput.trim();
    if (!topic) return;

    setIsLoading(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      const lesson = await generateStudyLesson({ topic, mode });
      const newNote: StudentStudyNote = {
        id: `note-${Date.now()}`,
        student_id: 'current-student',
        topic,
        mode,
        content_markdown: lesson.content_markdown || '',
        glossary: lesson.glossary || [],
        methods: lesson.methods || [],
        created_at: new Date().toISOString(),
      };

      setCurrentNote(newNote);
    } catch (err: any) {
      console.warn('AI study assistant error, using curated study note fallback:', err);
      setErrorMsg(`${err.message}. Đang mở chuyên đề mẫu để bạn không bị gián đoạn ôn tập.`);
      // Load fallback note
      const fallback = SAMPLE_STUDY_NOTES.find((n) => n.topic.toLowerCase().includes(topic.toLowerCase())) || SAMPLE_STUDY_NOTES[0];
      setCurrentNote({ ...fallback, topic });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Practice Quiz for Current Topic
  const handleCreateTopicPractice = async () => {
    setIsGeneratingQuiz(true);
    try {
      const rawQuestions = await generateTopicPractice({
        topic: currentNote.topic,
        mode: currentNote.mode,
        count: 6,
      });

      const questions: Question[] = rawQuestions.map((q: any, i: number) => ({
        id: `quiz-q-${Date.now()}-${i + 1}`,
        exam_id: `practice-${Date.now()}`,
        part: q.part || (i < 4 ? 'PART_1' : 'PART_2'),
        order_index: i + 1,
        strand: q.strand || 'algebra_calculus',
        topic: currentNote.topic,
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

      onStartPracticeQuiz(currentNote.topic, questions);
    } catch (err: any) {
      const fallbackQuestions = getTopicFallbackQuestions(currentNote.topic);
      onStartPracticeQuiz(currentNote.topic, fallbackQuestions);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSaveToNotes = () => {
    onSaveNote(currentNote);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search & Topic Control Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI Study Assistant for Math Olympiad
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Góc Tự Học Chuyên Đề HSG Toán Bằng Tiếng Anh
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Nhập tên chuyên đề toán học để AI sinh bài giảng lý thuyết, thuật ngữ chuyên ngành và phương pháp giải mẫu.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('bilingual')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                mode === 'bilingual'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              🇻🇳 🇬🇧 Song Ngữ
            </button>
            <button
              onClick={() => setMode('english_only')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                mode === 'english_only'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              🇬🇧 Full English
            </button>
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
              placeholder="VD: Pigeonhole Principle in Combinatorics, Conic Sections, Limits..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            disabled={isLoading || !topicInput.trim()}
            onClick={() => handleGenerateLesson()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
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
          <span className="text-[11px] font-medium text-slate-400 mr-1">Gợi ý chuyên đề:</span>
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
                onClick={handleCreateTopicPractice}
                disabled={isGeneratingQuiz}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 transition shadow-xs disabled:opacity-50"
              >
                {isGeneratingQuiz ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileQuestion className="w-3.5 h-3.5" />
                )}
                Tạo Bài Tập Chuyên Đề & Làm Ngay
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
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              1. Tóm Tắt Lý Thuyết & Công Thức Trọng Tâm (Core Theory)
            </h4>
            <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm">
              <MathRenderer content={currentNote.content_markdown} />
            </div>
          </div>

          {/* Section 2: Mathematical Glossary */}
          {currentNote.glossary && currentNote.glossary.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm">
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
                            <span className="font-bold text-indigo-500">{sIdx + 1}.</span>
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

