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
  'Pigeonhole Principle in Combinatorics (Nguyên lý Dirichlet)',
  'Invariance Principle & Monovariants (Nguyên lý bất biến)',
  'Limits and Continuity of Functions (Giới hạn & Hàm liên tục)',
  'Conic Sections: Ellipse, Hyperbola, Parabola (3 đường Conic)',
  'Sequences and Second-order Recurrences (Dãy số & Truy hồi)',
  'Perpendicularity in Space (Quan hệ vuông góc trong không gian)',
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
      // Create instant fallback topical questions
      const fallbackQuestions: Question[] = [
        {
          id: `quiz-fallback-1`,
          exam_id: `practice-fallback`,
          part: 'PART_1',
          order_index: 1,
          strand: 'statistics_discrete',
          topic: currentNote.topic,
          difficulty: 'application',
          question_en: 'A bag contains 10 red, 8 blue, and 6 green marbles. What is the minimum number of marbles drawn at random without replacement to guarantee at least 4 of the same color?',
          question_vi: 'Một túi chứa 10 viên bi đỏ, 8 viên bi xanh dương, và 6 viên bi xanh lá. Cần lấy ngẫu nhiên ít nhất bao nhiêu viên bi để chắc chắn có ít nhất 4 viên cùng màu?',
          options_en: ['A. 10', 'B. 12', 'C. 13', 'D. 15'],
          options_vi: ['A. 10', 'B. 12', 'C. 13', 'D. 15'],
          correct_answer: 'A',
          solution_en: 'Worst-case scenario: draw 3 red + 3 blue + 3 green = 9 marbles. The 10th marble must give 4 of one color. Thus minimum is 10.',
          solution_vi: 'Trường hợp xấu nhất: lấy 3 đỏ + 3 xanh dương + 3 xanh lá = 9 viên. Viên thứ 10 chắc chắn tạo ra 4 viên cùng màu. Vậy cần 10 viên.'
        },
        {
          id: `quiz-fallback-2`,
          exam_id: `practice-fallback`,
          part: 'PART_2',
          order_index: 2,
          strand: 'statistics_discrete',
          topic: currentNote.topic,
          difficulty: 'advanced',
          question_en: 'Ten points are placed inside an equilateral triangle of area 1. Prove that some three points form a triangle of area at most $A$. Find the value of $A$ as an irreducible fraction.',
          question_vi: 'Cho 10 điểm nằm trong tam giác đều diện tích 1. Chứng minh tồn tại 3 điểm tạo thành tam giác có diện tích không quá $A$. Tìm giá trị $A$ dưới dạng phân số tối giản.',
          correct_answer: '1/9',
          solution_en: 'Divide the triangle into 9 smaller equilateral triangles of area 1/9. By Pigeonhole Principle, among 10 points and 9 triangles, at least one triangle contains at least $\\lceil 10/9 \\rceil = 2$ points, or subdivision gives area bound $1/9$.',
          solution_vi: 'Chia tam giác đều thành 9 tam giác đều nhỏ bằng nhau có diện tích 1/9. Theo nguyên lý Dirichlet, tồn tại tam giác nhỏ chứa ít nhất 2 điểm. Diện tích tam giác tạo bởi 3 điểm nhỏ hơn hoặc bằng 1/9.'
        }
      ];
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
