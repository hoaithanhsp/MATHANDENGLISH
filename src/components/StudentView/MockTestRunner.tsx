import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  Award,
  Layers,
  Check,
  X,
  BookOpen,
  PieChart,
  Languages
} from 'lucide-react';
import { Exam, Question, Assignment } from '../../types';
import MathRenderer from '../MathRenderer';

interface MockTestRunnerProps {
  exam: Exam;
  studentName?: string;
  onFinishExam: (assignment: Assignment) => void;
  onExit: () => void;
}

export const MockTestRunner: React.FC<MockTestRunnerProps> = ({
  exam,
  studentName = 'Trần Minh Quang (Đội tuyển HSG)',
  onFinishExam,
  onExit,
}) => {
  const questions: Question[] = exam.questions || [];
  const totalQuestions = questions.length;

  // Exam states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState((exam.duration_minutes || 90) * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [submittedAssignment, setSubmittedAssignment] = useState<Assignment | null>(null);

  // Countdown timer
  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];

  // Set answer
  const handleSelectAnswer = (ans: string) => {
    if (!currentQ || isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: ans }));
  };

  // Toggle flag
  const handleToggleFlag = (qId: string) => {
    setFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Calculate score & submit
  const handleSubmitExam = () => {
    setShowConfirmSubmit(false);
    setIsSubmitted(true);

    let correctCount = 0;
    questions.forEach((q) => {
      const userAns = (answers[q.id] || '').trim().toUpperCase();
      const correct = q.correct_answer.trim().toUpperCase();
      const acceptable = (q.acceptable_answers || []).map((a) => a.trim().toUpperCase());

      if (userAns === correct || acceptable.includes(userAns)) {
        correctCount += 1;
      }
    });

    // Score on 10.0 scale
    const finalScore = totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 10).toFixed(2)) : 0;

    const newAssignment: Assignment = {
      id: `assign-${Date.now()}`,
      exam_id: exam.id,
      student_id: 'student-hp-01',
      student_name: studentName,
      status: 'completed',
      score: finalScore,
      answers,
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    setSubmittedAssignment(newAssignment);
    onFinishExam(newAssignment);
  };

  // Unanswered count
  const answeredCount = Object.keys(answers).filter((k) => (answers[k] || '').trim() !== '').length;
  const unansweredCount = totalQuestions - answeredCount;

  // Render Post-Submission Analysis Screen
  if (isSubmitted && submittedAssignment) {
    const score = submittedAssignment.score ?? 0;
    let correctCount = 0;
    questions.forEach((q) => {
      const u = (answers[q.id] || '').trim().toUpperCase();
      const c = q.correct_answer.trim().toUpperCase();
      const acc = (q.acceptable_answers || []).map((a) => a.trim().toUpperCase());
      if (u === c || acc.includes(u)) correctCount++;
    });

    return (
      <div className="space-y-6 max-w-4xl mx-auto py-4 animate-in fade-in">
        {/* Score Banner */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl text-center relative overflow-hidden">
          <div className="relative z-10 max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-400">
              <Award className="w-9 h-9" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Kết Quả Bài Thi Tuyển Chọn
            </span>
            <h2 className="text-2xl font-bold mt-1">{exam.title}</h2>
            <p className="text-xs text-indigo-200 mt-1">Học sinh: {studentName}</p>

            {/* Big Score Display */}
            <div className="my-6">
              <div className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
                {score.toFixed(2)}
                <span className="text-2xl font-normal text-indigo-200"> / 10.00</span>
              </div>
              <p className="text-sm text-emerald-300 font-medium mt-2">
                Đúng {correctCount} / {totalQuestions} câu ({((correctCount / totalQuestions) * 100).toFixed(1)}%)
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={onExit}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-900 hover:bg-indigo-50 transition shadow-md"
              >
                Quay Lại Danh Sách
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Solutions Review */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-700 pb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Chi Tiết Lời Giải & Phân Tích 22 Câu Hỏi
            </h3>
            <span className="text-xs text-slate-500">Màu xanh: Đúng | Màu đỏ: Sai</span>
          </div>

          <div className="space-y-4">
            {questions.map((q) => {
              const u = (answers[q.id] || '').trim().toUpperCase();
              const c = q.correct_answer.trim().toUpperCase();
              const acc = (q.acceptable_answers || []).map((a) => a.trim().toUpperCase());
              const isCorrect = u === c || acc.includes(u);

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border ${
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-rose-200 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        Câu {q.order_index}
                      </span>
                      <span className="text-[11px] text-slate-500">{q.part}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold">
                      {isCorrect ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-4 h-4" /> Đúng
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <X className="w-4 h-4" /> Sai
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question */}
                  <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white mb-2 leading-relaxed">
                    <MathRenderer content={q.question_en} />
                  </div>
                  {q.question_vi && exam.mode === 'bilingual' && (
                    <div className="mb-3 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-indigo-600 dark:text-indigo-400 mb-1">
                        <Languages className="w-3.5 h-3.5" />
                        <span>Bản dịch Tiếng Việt:</span>
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        <MathRenderer content={q.question_vi} />
                      </div>
                    </div>
                  )}

                  {/* Answers Comparison */}
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1 mb-2">
                    <div>
                      <span className="text-slate-500">Bạn đã chọn: </span>
                      <span className={`font-bold font-mono ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {u || '(Bỏ trống)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Đáp án chuẩn: </span>
                      <span className="font-bold font-mono text-emerald-600">{q.correct_answer}</span>
                    </div>
                  </div>

                  {/* Solution */}
                  <div className="pt-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Lời giải chi tiết: </span>
                    <MathRenderer content={q.solution_en} />
                    {q.solution_vi && (
                      <div className="mt-1 italic text-slate-500 text-[11px]">
                        <MathRenderer content={q.solution_vi} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Exam Taking Screen
  return (
    <div className="space-y-6">
      {/* Top Floating Banner: Exam Info & Countdown Timer */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
            {exam.title}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Học sinh: <strong>{studentName}</strong> • {totalQuestions} câu hỏi
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border transition ${
              timeLeft <= 600
                ? 'bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800 animate-pulse'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nộp Bài</span>
          </button>
        </div>
      </div>

      {/* Main Examination Grid: Question on Left, Palette on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Area (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {currentQ ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs min-h-[480px] flex flex-col justify-between">
              <div>
                {/* Question Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded uppercase tracking-wider">
                      {exam.mode === 'bilingual' ? 'Bilingual' : 'English Only'}
                    </span>
                    <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded uppercase tracking-wider">
                      {currentQ.part === 'PART_1' ? 'Part 1 (MCQ)' : 'Part 2 (Short Ans)'}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      DIFF: {currentQ.difficulty === 'understanding' ? 'LEVEL 1 (TH)' : currentQ.difficulty === 'application' ? 'LEVEL 2 (VD)' : 'LEVEL 3 (VDC)'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleFlag(currentQ.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      flagged[currentQ.id]
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    {flagged[currentQ.id] ? 'Đã đánh dấu' : 'Đánh dấu'}
                  </button>
                </div>

                {/* Question Text */}
                <div className="text-base sm:text-lg font-serif text-slate-900 dark:text-white leading-relaxed mb-3">
                  <span className="font-sans font-bold text-indigo-600 dark:text-indigo-400 mr-2">
                    Question {currentQ.order_index < 10 ? `0${currentQ.order_index}` : currentQ.order_index}:
                  </span>
                  <MathRenderer content={currentQ.question_en} inline />
                </div>

                {currentQ.question_vi && exam.mode === 'bilingual' && (
                  <div className="mb-6 p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-sans">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-indigo-600 dark:text-indigo-400 mb-1.5">
                      <Languages className="w-4 h-4" />
                      <span>Bản dịch Tiếng Việt:</span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      <MathRenderer content={currentQ.question_vi} />
                    </div>
                  </div>
                )}

                {/* Input Area: Part 1 (MCQ) vs Part 2 (Short Answer) */}
                {currentQ.part === 'PART_1' && currentQ.options_en ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4 font-sans text-xs">
                    {currentQ.options_en.map((opt, oIdx) => {
                      const letter = ['A', 'B', 'C', 'D'][oIdx];
                      const isSelected = answers[currentQ.id] === letter;
                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleSelectAnswer(letter)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 font-semibold shadow-xs'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-600 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {letter}
                            </span>
                            <div className="text-xs sm:text-sm font-medium">
                              <MathRenderer content={opt.replace(/^[A-D]\.\s*/, '')} inline />
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="my-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nhập đáp số (Số nguyên, phân số tối giản a/b, hoặc số thập phân):
                    </label>
                    <input
                      type="text"
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleSelectAnswer(e.target.value)}
                      placeholder="VD: 42, 1/3, -5.5..."
                      className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[11px] text-slate-500">
                      Gợi ý: Nếu kết quả là phân số, vui lòng để dạng tối giản như <code>1/3</code>, <code>27/4</code>.
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Câu trước
                </button>

                <div className="text-xs text-slate-400">
                  Câu {currentIndex + 1} / {totalQuestions}
                </div>

                <button
                  disabled={currentIndex === totalQuestions - 1}
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition shadow-xs"
                >
                  Câu tiếp
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">Không có câu hỏi nào.</div>
          )}
        </div>

        {/* Question Palette Sidebar (1 Col) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bảng Câu Hỏi (Palette)
            </h3>

            {/* Status counts */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                <span>Đã làm:</span>
                <span className="font-bold">{answeredCount}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Chưa làm:</span>
                <span className="font-bold">{unansweredCount}</span>
              </div>
            </div>

            {/* Questions Grid 1..22 */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-2">
              {questions.map((q, idx) => {
                const isAnswered = Boolean((answers[q.id] || '').trim());
                const isCurrent = idx === currentIndex;
                const isFlagged = flagged[q.id];

                let bgClass = 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
                if (isAnswered) {
                  bgClass = 'bg-emerald-600 text-white font-bold shadow-xs';
                }
                if (isFlagged) {
                  bgClass = 'bg-amber-500 text-white font-bold ring-2 ring-amber-300';
                }
                if (isCurrent) {
                  bgClass += ' ring-2 ring-indigo-500 ring-offset-2';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl text-xs flex items-center justify-center transition font-semibold relative ${bgClass}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs flex items-center justify-center gap-1.5 mt-4"
            >
              <Send className="w-3.5 h-3.5" />
              Nộp Bài Thi
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Xác Nhận Nộp Bài Thi
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Bạn đã hoàn thành <strong>{answeredCount}</strong> trên tổng số <strong>{totalQuestions}</strong> câu hỏi.
              {unansweredCount > 0 && (
                <span className="text-amber-600 dark:text-amber-400 block mt-1 font-semibold">
                  Cảnh báo: Còn {unansweredCount} câu bạn chưa điền đáp án!
                </span>
              )}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Làm Tiếp
              </button>
              <button
                onClick={handleSubmitExam}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
              >
                Chắc Chắn Nộp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
