import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  AlertCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  Award,
  Check,
  X,
  BookOpen,
  Languages,
  Printer,
  FileCheck,
  Keyboard,
  Lightbulb,
  ShieldAlert,
  BookmarkPlus,
  HelpCircle
} from 'lucide-react';
import { Exam, Question, Assignment, MistakeEntry, MistakeReason } from '../../types';
import MathRenderer from '../MathRenderer';
import { isMathAnswerCorrect } from '../../utils/mathAnswerEvaluator';
import { storageService } from '../../services/storageService';
import { printHaiPhongExam } from '../../utils/printPdf';

interface MockTestRunnerProps {
  exam: Exam;
  studentName?: string;
  studentId?: string;
  onFinishExam: (assignment: Assignment) => void;
  onExit: () => void;
}

export const MockTestRunner: React.FC<MockTestRunnerProps> = ({
  exam,
  studentName = 'Trần Minh Quang (Đội tuyển HSG)',
  studentId = 'student-hp-01',
  onFinishExam,
  onExit,
}) => {
  const questions: Question[] = exam.questions || [];
  const totalQuestions = questions.length;
  const studentKey = studentName ? studentName.trim().replace(/\s+/g, '_') : 'student_hp';

  // Exam states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState((exam.duration_minutes || 90) * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [submittedAssignment, setSubmittedAssignment] = useState<Assignment | null>(null);

  // Auto-save & Tab-switch state
  const [autoSaveRestored, setAutoSaveRestored] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);

  // Virtual Keypad & Hints state
  const [showVirtualKeypad, setShowVirtualKeypad] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState<Record<string, number>>({}); // qId -> hint level (1 or 2)
  const [savedMistakeReasons, setSavedMistakeReasons] = useState<Record<string, MistakeReason>>({});

  const notified15m = useRef(false);
  const notified5m = useRef(false);

  // Web Audio chime helper
  const playAlertChime = (freq = 520, count = 2) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      for (let i = 0; i < count; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.2);
        osc.start(ctx.currentTime + i * 0.25);
        osc.stop(ctx.currentTime + i * 0.25 + 0.2);
      }
    } catch {
      // ignore audio context restrictions
    }
  };

  // 1. Auto-save restoration on mount
  useEffect(() => {
    const saved = storageService.getExamAutoSave(exam.id, studentKey);
    if (saved && !isSubmitted) {
      if (saved.answers && Object.keys(saved.answers).length > 0) {
        setAnswers(saved.answers);
      }
      if (saved.flagged) setFlagged(saved.flagged);
      if (typeof saved.timeLeft === 'number' && saved.timeLeft > 0) {
        setTimeLeft(saved.timeLeft);
      }
      if (typeof saved.currentIndex === 'number') {
        setCurrentIndex(Math.min(saved.currentIndex, Math.max(0, totalQuestions - 1)));
      }
      if (typeof saved.tabSwitchCount === 'number') {
        setTabSwitchCount(saved.tabSwitchCount);
      }
      setAutoSaveRestored(true);
      const t = setTimeout(() => setAutoSaveRestored(false), 5000);
      return () => clearTimeout(t);
    }
  }, [exam.id, studentKey, totalQuestions]);

  // 2. Continuous Auto-save every state change
  useEffect(() => {
    if (isSubmitted) return;
    storageService.saveExamAutoSave(exam.id, studentKey, {
      answers,
      flagged,
      currentIndex,
      timeLeft,
      tabSwitchCount,
      lastSaved: Date.now(),
    });
  }, [exam.id, studentKey, answers, flagged, currentIndex, timeLeft, tabSwitchCount, isSubmitted]);

  // 3. Tab switch detection
  useEffect(() => {
    if (isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setShowTabSwitchWarning(true);
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSubmitted]);

  // 4. Countdown timer & Audio cues (15m, 5m)
  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }

        // Chime at 15m (900s) and 5m (300s)
        if (prev === 900 && !notified15m.current) {
          notified15m.current = true;
          playAlertChime(660, 2);
        }
        if (prev === 300 && !notified5m.current) {
          notified5m.current = true;
          playAlertChime(880, 3);
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

  // Virtual Keypad input handler
  const handleKeypadPress = (val: string) => {
    if (!currentQ || isSubmitted) return;
    const currentVal = answers[currentQ.id] || '';
    if (val === 'CLEAR') {
      handleSelectAnswer('');
    } else if (val === 'BACKSPACE') {
      handleSelectAnswer(currentVal.slice(0, -1));
    } else {
      handleSelectAnswer(currentVal + val);
    }
  };

  // Toggle flag
  const handleToggleFlag = (qId: string) => {
    setFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Reveal step hint
  const handleRevealHint = (qId: string) => {
    setHintsRevealed((prev) => {
      const cur = prev[qId] || 0;
      return { ...prev, [qId]: Math.min(2, cur + 1) };
    });
  };

  // Calculate score & submit
  const handleSubmitExam = () => {
    setShowConfirmSubmit(false);
    setIsSubmitted(true);

    let correctCount = 0;
    let part1Correct = 0;
    let part2Correct = 0;
    const wrongEntries: MistakeEntry[] = [];
    const actualStudentId = studentId || 'student-hp-01';

    questions.forEach((q) => {
      const userAns = answers[q.id] || '';
      let isCorrect = false;

      if (q.part === 'PART_1') {
        const u = userAns.trim().toUpperCase();
        const c = q.correct_answer.trim().toUpperCase();
        isCorrect = u === c;
      } else {
        // Part 2: Short Answer with intelligent equivalent checking
        isCorrect = isMathAnswerCorrect(userAns, q.correct_answer, q.acceptable_answers);
      }

      if (isCorrect) {
        correctCount += 1;
        if (q.part === 'PART_1') {
          part1Correct += 1;
        } else {
          part2Correct += 1;
        }
      } else {
        // Tự động thêm vào danh sách bài tập làm sai
        wrongEntries.push({
          id: `mistake-${exam.id}-${q.id}-${Date.now()}`,
          student_id: actualStudentId,
          question: q,
          exam_title: exam.title,
          student_answer: userAns,
          mistake_reason: 'formula_error',
          timestamp: new Date().toISOString(),
          mastered: false,
        });
      }
    });

    // Score on 20.00 scale (Hai Phong Math Olympiad Standard: Part I = 12 * 0.5 = 6.0đ; Part II = 10 * 1.4 = 14.0đ)
    let finalScore = 0;
    const hasStandardParts = questions.some((q) => q.part === 'PART_1') && questions.some((q) => q.part === 'PART_2');
    if (hasStandardParts) {
      finalScore = Number((part1Correct * 0.5 + part2Correct * 1.4).toFixed(2));
    } else {
      // Fallback for custom topic practice: scale directly to 20.00
      finalScore = totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 20).toFixed(2)) : 0;
    }

    const newAssignment: Assignment = {
      id: `assign-${Date.now()}`,
      exam_id: exam.id,
      student_id: actualStudentId,
      student_name: studentName,
      status: 'completed',
      score: finalScore,
      answers,
      tab_switch_count: tabSwitchCount,
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // Save wrong answers to student mistake notebook
    if (wrongEntries.length > 0) {
      storageService.saveMistakes(wrongEntries);
    }

    // Clear auto-save upon submission
    storageService.clearExamAutoSave(exam.id, studentKey);

    setSubmittedAssignment(newAssignment);
    onFinishExam(newAssignment);
  };

  // Update mistake reason from post-exam screen
  const handleUpdateReason = (mistakeId: string, reason: MistakeReason) => {
    setSavedMistakeReasons((prev) => ({ ...prev, [mistakeId]: reason }));
    storageService.updateMistakeReason(mistakeId, reason);
  };

  // Unanswered count
  const answeredCount = Object.keys(answers).filter((k) => (answers[k] || '').trim() !== '').length;
  const unansweredCount = totalQuestions - answeredCount;

  // ============================================================
  // Post-Submission Analysis Screen
  // ============================================================
  if (isSubmitted && submittedAssignment) {
    const score = submittedAssignment.score ?? 0;
    let correctCount = 0;
    questions.forEach((q) => {
      const userAns = answers[q.id] || '';
      const isCorrect =
        q.part === 'PART_1'
          ? userAns.trim().toUpperCase() === q.correct_answer.trim().toUpperCase()
          : isMathAnswerCorrect(userAns, q.correct_answer, q.acceptable_answers);
      if (isCorrect) correctCount++;
    });

    return (
      <div className="space-y-6 max-w-4xl mx-auto py-4 animate-in fade-in">
        {/* Score Banner */}
        <div className="bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl text-center relative overflow-hidden">
          <div className="relative z-10 max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-400">
              <Award className="w-9 h-9" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Kết Quả Bài Thi Tuyển Chọn
            </span>
            <h2 className="text-2xl font-bold mt-1">{exam.title}</h2>
            <p className="text-xs text-teal-200 mt-1">Học sinh: {studentName}</p>

            {/* Big Score Display */}
            <div className="my-6">
              <div className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
                {score.toFixed(2)}
                <span className="text-2xl font-normal text-teal-200"> / 20.00</span>
              </div>
              <p className="text-sm text-emerald-300 font-medium mt-2">
                Đúng {correctCount} / {totalQuestions} câu ({((correctCount / totalQuestions) * 100).toFixed(1)}%)
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-sm text-amber-300 border border-white/10">
                {score >= 18.0
                  ? '🌟 Thành tích Xuất sắc — Ứng viên Đội tuyển Giải Nhất Thành phố'
                  : score >= 15.0
                  ? '🎯 Thành tích Giỏi — Đạt chuẩn Đội tuyển HSG K11 Hải Phòng'
                  : score >= 12.0
                  ? '📈 Thành tích Khá — Cần bồi dưỡng thêm chuyên đề nâng cao'
                  : score >= 10.0
                  ? '⚡ Đạt Yêu cầu Cơ bản — Cần tăng tốc luyện đề và từ vựng'
                  : '⚠️ Cần Nỗ lực Nhiều Hơn — Xem kỹ lại lời giải chi tiết và sổ tay câu sai'}
              </div>
              {tabSwitchCount > 0 && (
                <p className="text-xs text-amber-300 mt-2 flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Ghi nhận chuyển tab / rời màn hình: <strong>{tabSwitchCount} lần</strong>
                </p>
              )}
            </div>

            {/* Teacher Feedback Banner if available */}
            {submittedAssignment.teacher_feedback && (
              <div className="my-4 p-4 rounded-2xl bg-teal-900/60 border border-teal-400/40 text-left backdrop-blur-md">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-1">
                  <Award className="w-4 h-4" />
                  <span>Lời nhận xét & dặn dò của thầy cô:</span>
                </div>
                <p className="text-xs sm:text-sm text-teal-100 italic leading-relaxed whitespace-pre-wrap">
                  "{submittedAssignment.teacher_feedback}"
                </p>
                {submittedAssignment.graded_at && (
                  <span className="text-[10px] text-teal-300 block mt-2">
                    Nhận xét lúc: {new Date(submittedAssignment.graded_at).toLocaleString('vi-VN')}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={onExit}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-teal-900 hover:bg-teal-50 transition shadow-md"
              >
                Quay Lại Danh Sách
              </button>

              <button
                onClick={() => printHaiPhongExam(exam, { sheetType: 'question_sheet' })}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-700/80 hover:bg-teal-600 text-white transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                In Đề Thi (PDF)
              </button>

              <button
                onClick={() => printHaiPhongExam(exam, { sheetType: 'solution_sheet' })}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5" />
                In Đáp Án & Lời Giải (PDF)
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Solutions Review */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-700 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Chi Tiết Lời Giải & Phân Tích 22 Câu Hỏi
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Các câu làm sai đã được tự động lưu vào <strong>Sổ tay bài tập sai</strong> để luyện lại.
              </p>
            </div>
            <span className="text-xs text-slate-500">Màu xanh: Đúng | Màu đỏ: Sai</span>
          </div>

          <div className="space-y-4">
            {questions.map((q) => {
              const u = answers[q.id] || '';
              const isCorrect =
                q.part === 'PART_1'
                  ? u.trim().toUpperCase() === q.correct_answer.trim().toUpperCase()
                  : isMathAnswerCorrect(u, q.correct_answer, q.acceptable_answers);

              const mistakeId = `mistake-${exam.id}-${q.id}-${submittedAssignment.id}`;

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
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-teal-600 dark:text-teal-400 mb-1">
                        <Languages className="w-3.5 h-3.5" />
                        <span>Bản dịch tiếng Việt:</span>
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        <MathRenderer content={q.question_vi} />
                      </div>
                    </div>
                  )}

                  {/* Answers Comparison */}
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1 mb-2">
                    <div>
                      <span className="text-slate-500">Bạn đã điền: </span>
                      <span className={`font-bold font-mono ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {u || '(Bỏ trống)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Đáp án chuẩn: </span>
                      <span className="font-bold font-mono text-emerald-600">
                        {q.correct_answer}{' '}
                        {q.acceptable_answers && q.acceptable_answers.length > 0 && (
                          <span className="text-xs text-slate-400 font-normal">
                            (hoặc {q.acceptable_answers.join(', ')})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Mistake classification for wrong answers */}
                  {!isCorrect && (
                    <div className="my-2.5 p-2.5 rounded-lg bg-rose-100/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1">
                        <BookmarkPlus className="w-3.5 h-3.5" /> Lý do sai:
                      </span>
                      <select
                        value={savedMistakeReasons[mistakeId] || 'formula_error'}
                        onChange={(e) => handleUpdateReason(mistakeId, e.target.value as MistakeReason)}
                        className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 text-slate-800 dark:text-slate-200 font-medium"
                      >
                        <option value="formula_error">Sai công thức toán</option>
                        <option value="language_misinterpretation">Dịch nhầm đề tiếng Anh</option>
                        <option value="careless_calculation">Tính toán ẩu / nhầm số</option>
                        <option value="concept_gap">Chưa nắm vững lý thuyết</option>
                        <option value="other">Lý do khác</option>
                      </select>
                      <span className="text-[11px] text-rose-600 dark:text-rose-400">
                        ✓ Đã ghi nhận vào Sổ tay câu sai
                      </span>
                    </div>
                  )}

                  {/* Solution */}
                  <div className="pt-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-teal-600 dark:text-teal-400">Lời giải chi tiết: </span>
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

  // ============================================================
  // Active Exam Taking Screen
  // ============================================================
  return (
    <div className="space-y-6">
      {/* Auto-save notification banner */}
      {autoSaveRestored && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <span>✓ Đã khôi phục bài làm tự động từ phiên thi trước đó của bạn!</span>
          <button onClick={() => setAutoSaveRestored(false)} className="text-xs font-bold underline">
            Đóng
          </button>
        </div>
      )}

      {/* Tab switch warning alert */}
      {showTabSwitchWarning && (
        <div className="bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Cảnh báo phòng thi:</strong> Bạn vừa rời tab thi (Đã ghi nhận{' '}
              <strong>{tabSwitchCount} lần</strong>). Vui lòng tập trung làm bài nghiêm túc!
            </span>
          </div>
          <button
            onClick={() => setShowTabSwitchWarning(false)}
            className="px-2 py-0.5 rounded bg-amber-600 text-white text-[11px] font-bold"
          >
            Đã hiểu
          </button>
        </div>
      )}

      {/* Top Floating Banner: Exam Info & Countdown Timer */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
            {exam.title}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Học sinh: <strong>{studentName}</strong> • {totalQuestions} câu hỏi • Tự động lưu bài 💾
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border transition ${
              timeLeft <= 300
                ? 'bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800 animate-pulse'
                : timeLeft <= 900
                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800'
                : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-300'
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
                    <span className="px-2.5 py-1 bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[10px] font-bold rounded uppercase tracking-wider">
                      {exam.mode === 'bilingual' ? 'Bilingual' : 'English Only'}
                    </span>
                    <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded uppercase tracking-wider">
                      {currentQ.part === 'PART_1' ? 'Part 1 (MCQ)' : 'Part 2 (Short Ans)'}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      DIFF:{' '}
                      {currentQ.difficulty === 'understanding'
                        ? 'LEVEL 1 (TH)'
                        : currentQ.difficulty === 'application'
                        ? 'LEVEL 2 (VD)'
                        : 'LEVEL 3 (VDC)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Step-by-step Hint Button */}
                    <button
                      onClick={() => handleRevealHint(currentQ.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition"
                      title="Xem gợi ý hướng giải quyết"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>
                        Gợi ý {hintsRevealed[currentQ.id] ? `(${hintsRevealed[currentQ.id]}/2)` : ''}
                      </span>
                    </button>

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
                </div>

                {/* Question Text */}
                <div className="text-base sm:text-lg font-serif text-slate-900 dark:text-white leading-relaxed mb-3">
                  <span className="font-sans font-bold text-teal-600 dark:text-teal-400 mr-2">
                    Question {currentQ.order_index < 10 ? `0${currentQ.order_index}` : currentQ.order_index}:
                  </span>
                  <MathRenderer content={currentQ.question_en} inline />
                </div>

                {currentQ.question_vi && exam.mode === 'bilingual' && (
                  <div className="mb-6 p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-sans">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-teal-600 dark:text-teal-400 mb-1.5">
                      <Languages className="w-4 h-4" />
                      <span>Bản dịch tiếng Việt:</span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      <MathRenderer content={currentQ.question_vi} />
                    </div>
                  </div>
                )}

                {/* Step Hints Reveal Area */}
                {Boolean(hintsRevealed[currentQ.id]) && (
                  <div className="mb-5 p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs space-y-2">
                    <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4" />
                      Gợi Ý Hướng Giải Quyết (Step Hint):
                    </div>
                    {hintsRevealed[currentQ.id] >= 1 && (
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Gợi ý 1:</strong>{' '}
                        {currentQ.hints?.[0] ||
                          `Nhận diện dạng toán thuộc chuyên đề "${currentQ.topic}", sử dụng các công thức liên quan đến ${currentQ.strand}.`}
                      </p>
                    )}
                    {hintsRevealed[currentQ.id] >= 2 && (
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Gợi ý 2:</strong>{' '}
                        {currentQ.hints?.[1] ||
                          'Biến đổi đẳng thức về dạng đơn giản nhất hoặc xét trường hợp biên đặc biệt để tìm nghiệm.'}
                      </p>
                    )}
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
                              ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/50 text-teal-950 dark:text-teal-200 font-semibold shadow-xs'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-teal-300 dark:hover:border-teal-600 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                isSelected
                                  ? 'bg-teal-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {letter}
                            </span>
                            <div className="text-xs sm:text-sm font-medium">
                              <MathRenderer content={opt.replace(/^[A-D]\.\s*/, '')} inline />
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="my-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Nhập đáp số (Số nguyên, phân số a/b, hoặc số thập phân):
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowVirtualKeypad(!showVirtualKeypad)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        <Keyboard className="w-3.5 h-3.5" />
                        {showVirtualKeypad ? 'Ẩn bàn phím ảo' : 'Mở bàn phím số/phân số'}
                      </button>
                    </div>

                    <input
                      type="text"
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleSelectAnswer(e.target.value)}
                      placeholder="VD: 42, 1/3, -5.5..."
                      className="w-full sm:w-72 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 font-mono text-base font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />

                    {/* Virtual Keypad for Mobile / Fast Numeric Input */}
                    {showVirtualKeypad && (
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-xs space-y-2">
                        <div className="grid grid-cols-4 gap-1.5">
                          {['7', '8', '9', '/'].map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => handleKeypadPress(k)}
                              className="h-10 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-mono font-bold text-sm text-slate-800 dark:text-slate-100 transition"
                            >
                              {k}
                            </button>
                          ))}
                          {['4', '5', '6', '-'].map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => handleKeypadPress(k)}
                              className="h-10 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-mono font-bold text-sm text-slate-800 dark:text-slate-100 transition"
                            >
                              {k}
                            </button>
                          ))}
                          {['1', '2', '3', '.'].map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => handleKeypadPress(k)}
                              className="h-10 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-mono font-bold text-sm text-slate-800 dark:text-slate-100 transition"
                            >
                              {k}
                            </button>
                          ))}
                          {['0', '(', ')', 'CLEAR'].map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => handleKeypadPress(k)}
                              className={`h-10 rounded-lg font-mono font-bold text-xs transition ${
                                k === 'CLEAR'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {k}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleKeypadPress('BACKSPACE')}
                          className="w-full py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                        >
                          Xóa một ký tự (⌫)
                        </button>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-500">
                      Hệ thống tự động nhận diện tương đương: chấp nhận cả <code>1/2</code> hoặc <code>0.5</code>.
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

                <div className="text-xs text-slate-400 font-medium">
                  Câu {currentIndex + 1} / {totalQuestions}
                </div>

                <button
                  disabled={currentIndex === totalQuestions - 1}
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition shadow-xs"
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
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Bảng Câu Hỏi</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Auto-saved</span>
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
                  bgClass += ' ring-2 ring-teal-500 ring-offset-2';
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
