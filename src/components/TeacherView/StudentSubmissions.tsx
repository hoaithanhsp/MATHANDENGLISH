import React, { useState } from 'react';
import {
  UserCheck,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  Eye,
  Filter,
  ShieldAlert,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Layers,
  MessageSquare,
  Send,
  Save,
  Sparkles,
  Check,
  RotateCcw,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Assignment, Exam, Question } from '../../types';
import { isMathAnswerCorrect } from '../../utils/mathAnswerEvaluator';
import { storageService } from '../../services/storageService';

interface StudentSubmissionsProps {
  assignments: Assignment[];
  exams: Exam[];
  onResetAssignment?: (assignmentId: string) => Promise<void> | void;
  onResetAllAssignments?: () => Promise<void> | void;
}

export const StudentSubmissions: React.FC<StudentSubmissionsProps> = ({
  assignments,
  exams,
  onResetAssignment,
  onResetAllAssignments
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [feedbackSavedMsg, setFeedbackSavedMsg] = useState(false);

  // Reset confirmation states
  const [isResetAllModalOpen, setIsResetAllModalOpen] = useState(false);
  const [resetSingleTarget, setResetSingleTarget] = useState<Assignment | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessToast, setResetSuccessToast] = useState<string | null>(null);

  const getExamTitle = (examId: string) => {
    return exams.find((e) => e.id === examId)?.title || 'Đề thi đã lưu';
  };

  const getExam = (examId: string) => {
    return exams.find((e) => e.id === examId);
  };

  const filtered = assignments.filter((a) => {
    const studentName = a.student_name || 'Học sinh';
    const examTitle = getExamTitle(a.exam_id);
    return (
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate team metrics (Scale 20.00)
  const totalSubmissions = assignments.length;
  const avgScore =
    totalSubmissions > 0
      ? (assignments.reduce((sum, a) => sum + (a.score ?? 0), 0) / totalSubmissions).toFixed(2)
      : '0.00';

  const maxScore =
    totalSubmissions > 0
      ? Math.max(...assignments.map((a) => a.score ?? 0)).toFixed(2)
      : '0.00';

  const totalTabSwitches = assignments.reduce((sum, a) => sum + (a.tab_switch_count ?? 0), 0);
  const flaggedSubmissions = assignments.filter((a) => (a.tab_switch_count ?? 0) > 0).length;

  const handleSelectAssignment = (item: Assignment) => {
    setSelectedAssignment(item);
    setFeedbackText(item.teacher_feedback || '');
    setFeedbackSavedMsg(false);
  };

  const handleSaveFeedback = async () => {
    if (!selectedAssignment) return;
    setIsSavingFeedback(true);
    await storageService.updateAssignmentFeedback(selectedAssignment.id, feedbackText);
    setSelectedAssignment((prev) =>
      prev ? { ...prev, teacher_feedback: feedbackText, graded_at: new Date().toISOString() } : null
    );
    setIsSavingFeedback(false);
    setFeedbackSavedMsg(true);
    setTimeout(() => setFeedbackSavedMsg(false), 3000);
  };

  const quickFeedbackTemplates = [
    '🌟 Lời giải và đáp số rất xuất sắc, phương pháp tư duy chặt chẽ!',
    '⚠️ Chú ý: Cần kiểm tra kỹ mẫu số khác 0 và phân biệt thuật ngữ "coprime" với "prime".',
    '📐 Phần hình học không gian cần chú ý quan hệ vuông góc và góc giữa đường thẳng với mặt phẳng.',
    '⏱️ Tốc độ làm bài tốt, cần rèn thêm kỹ năng kiểm tra nghiệm ngoại lai để tránh mất điểm đáng tiếc.',
  ];

  const handleConfirmResetAll = async () => {
    setIsResetting(true);
    try {
      if (onResetAllAssignments) {
        await onResetAllAssignments();
      } else {
        await storageService.resetAllAssignments();
      }
      setSelectedAssignment(null);
      setIsResetAllModalOpen(false);
      setResetSuccessToast('Đã reset toàn bộ bài nộp thành công! Học sinh có thể vào thi lại từ đầu.');
      setTimeout(() => setResetSuccessToast(null), 4500);
    } catch (err) {
      console.error('Lỗi khi reset toàn bộ:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleConfirmResetSingle = async () => {
    if (!resetSingleTarget) return;
    setIsResetting(true);
    const targetId = resetSingleTarget.id;
    const studentName = resetSingleTarget.student_name || 'Học sinh';
    try {
      if (onResetAssignment) {
        await onResetAssignment(targetId);
      } else {
        await storageService.deleteAssignment(targetId);
      }
      if (selectedAssignment?.id === targetId) {
        setSelectedAssignment(null);
      }
      setResetSingleTarget(null);
      setResetSuccessToast(`Đã reset bài làm của "${studentName}". Thí sinh có thể làm lại đề thi này.`);
      setTimeout(() => setResetSuccessToast(null), 4500);
    } catch (err) {
      console.error('Lỗi khi reset bài làm:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast thông báo reset thành công */}
      {resetSuccessToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{resetSuccessToast}</span>
          </div>
          <button
            onClick={() => setResetSuccessToast(null)}
            className="text-emerald-500 hover:text-emerald-700 text-xs font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Quản Lý Bài Nộp & Phản Hồi Học Sinh (Đội Tuyển K11)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chấm điểm tự động theo thang điểm chuẩn <strong>20.00</strong> Sở GD&ĐT Hải Phòng, giám sát đổi tab và gửi lời phê 2 chiều.
          </p>
        </div>

        {/* Actions: Search & Reset All */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên học sinh, đề thi, mã HS..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {assignments.length > 0 && (
            <button
              onClick={() => setIsResetAllModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition shadow-xs shrink-0"
              title="Reset toàn bộ bài nộp của tất cả học sinh"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Reset Toàn Bộ Bài Nộp</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tổng số bài nộp
            </span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalSubmissions}
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Điểm TB Đội tuyển
            </span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
              {avgScore} <span className="text-xs font-normal text-slate-400">/ 20.00</span>
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Điểm cao nhất (Thủ khoa)
            </span>
            <h4 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {maxScore} <span className="text-xs font-normal text-slate-400">/ 20.00</span>
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Đổi tab khi thi
            </span>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalTabSwitches}{' '}
              <span className="text-xs font-normal text-slate-400">lần ({flaggedSubmissions} bài)</span>
            </h4>
          </div>
        </div>
      </div>

      {/* Main Table & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions List on Left */}
        <div className="lg:col-span-2 space-y-4">
          {filtered.length > 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/75 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold">
                      <th className="px-4 py-3">Học sinh</th>
                      <th className="px-4 py-3">Đề thi</th>
                      <th className="px-4 py-3 text-center">Điểm số</th>
                      <th className="px-4 py-3">Giám sát tab</th>
                      <th className="px-4 py-3">Lời phê GV</th>
                      <th className="px-4 py-3">Thời gian nộp</th>
                      <th className="px-4 py-3 text-right">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map((item) => {
                      const score = item.score ?? 0;
                      const switchCount = item.tab_switch_count ?? 0;
                      const isSelected = selectedAssignment?.id === item.id;

                      return (
                        <tr
                          key={item.id}
                          onClick={() => handleSelectAssignment(item)}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer ${
                            isSelected
                              ? 'bg-teal-50/70 dark:bg-teal-950/40 font-medium'
                              : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {item.student_name || 'Học sinh'}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.student_id}
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-[180px] truncate text-slate-600 dark:text-slate-300">
                            {getExamTitle(item.exam_id)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`font-mono font-bold text-xs ${
                                score >= 16.0
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : score >= 10.0
                                  ? 'text-teal-600 dark:text-teal-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {score.toFixed(2)} / 20.00
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {switchCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                <ShieldAlert className="w-3 h-3" />
                                {switchCount} lần
                              </span>
                            ) : (
                              <span className="text-[11px] text-emerald-600 font-medium">
                                ✓ Nghiêm túc
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {item.teacher_feedback ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                                <Check className="w-3 h-3" /> Đã phê
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">
                                Chưa nhận xét
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-[11px]">
                            {item.submitted_at
                              ? new Date(item.submitted_at).toLocaleString('vi-VN')
                              : 'Vừa xong'}
                          </td>
                          <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAssignment(item);
                              }}
                              className="p-1 text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Xem bài
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setResetSingleTarget(item);
                              }}
                              title="Xóa bài nộp này để cho phép học sinh thi lại"
                              className="p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded inline-flex items-center gap-1 font-semibold transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Cho thi lại</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-700 text-slate-400 space-y-2">
              <UserCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                Chưa có bài nộp nào
              </h4>
              <p className="text-xs max-w-sm mx-auto text-slate-500">
                Khi học sinh nhập mã phòng thi và nộp bài, điểm số và chi tiết đáp án sẽ tự động lưu về đây theo thời gian thực.
              </p>
            </div>
          )}
        </div>

        {/* Selected Submission Inspector & Feedback Panel on Right */}
        <div className="lg:col-span-1">
          {selectedAssignment ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-700 pb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Chi Tiết Bài Làm
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedAssignment.student_name || 'Học sinh'}
                  </span>
                </div>
                {(selectedAssignment.tab_switch_count ?? 0) > 0 && (
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                    {selectedAssignment.tab_switch_count} lần đổi tab
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Điểm tổng kết:</span>
                <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {(selectedAssignment.score ?? 0).toFixed(2)} / 20.00
                </span>
              </div>

              {/* Nút reset bài làm riêng của học sinh này */}
              <button
                type="button"
                onClick={() => setResetSingleTarget(selectedAssignment)}
                className="w-full py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-800/70 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Reset Bài Làm (Cho Phép Thi Lại)</span>
              </button>

              {/* Teacher Feedback Loop Box */}
              <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                    Lời Phê & Dặn Dò Của Thầy/Cô:
                  </span>
                  {feedbackSavedMsg && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Đã lưu!
                    </span>
                  )}
                </div>

                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Nhập lời nhận xét, lưu ý câu sai hoặc dặn dò cho học sinh này..."
                  className="w-full p-2.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />

                {/* Quick Feedback Suggestions */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-medium">Gợi ý nhận xét nhanh:</span>
                  <div className="flex flex-wrap gap-1">
                    {quickFeedbackTemplates.map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFeedbackText((prev) => (prev ? `${prev}\n${tpl}` : tpl))}
                        className="px-2 py-0.5 text-[10px] rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400 transition truncate max-w-full text-left"
                        title={tpl}
                      >
                        {tpl.slice(0, 32)}...
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  {selectedAssignment.graded_at && (
                    <span className="text-[10px] text-slate-400">
                      Đã lưu: {new Date(selectedAssignment.graded_at).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                  <button
                    onClick={handleSaveFeedback}
                    disabled={isSavingFeedback}
                    className="ml-auto px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSavingFeedback ? 'Đang lưu...' : 'Lưu Lời Phê'}
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Câu trả lời từng câu:
                </span>
                {Object.entries(selectedAssignment.answers || {}).map(([qId, rawAns], idx) => {
                  const ans = String(rawAns || '');
                  const exam = getExam(selectedAssignment.exam_id);
                  const q = exam?.questions?.find((item) => item.id === qId);
                  const isCorrect =
                    q &&
                    (q.part === 'PART_1'
                      ? q.correct_answer.trim().toUpperCase() === ans.trim().toUpperCase()
                      : isMathAnswerCorrect(ans, q.correct_answer, q.acceptable_answers));

                  return (
                    <div
                      key={qId}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-xs flex items-center justify-between"
                    >
                      <span className="font-medium">
                        Câu {q?.order_index || idx + 1}:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {ans || '(chưa làm)'}
                        </span>
                        {q && (
                          <span
                            className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
                              isCorrect
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {isCorrect ? 'Đúng' : `Sai (Đ/A: ${q.correct_answer})`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 text-center text-slate-400 text-xs">
              Bấm vào một hàng bài nộp để xem chi tiết từng câu trả lời, số lần học sinh đổi tab và viết lời phê gửi học sinh.
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL XÁC NHẬN RESET TOÀN BỘ BÀI NỘP */}
      {/* ============================================================ */}
      {isResetAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Xác Nhận Reset Toàn Bộ Bài Nộp
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Thao tác dành cho Thầy/Cô quản trị đợt thi
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <p className="leading-relaxed">
                  Hành động này sẽ <strong>xóa toàn bộ {assignments.length} bài nộp</strong> hiện có của học sinh trên cả trình duyệt này và <strong>Cloud Firebase Realtime Database</strong>.
                </p>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-6">
                • Bộ nhớ đệm làm bài tự động của học sinh sẽ được dọn sạch.<br />
                • Tất cả học sinh có thể nhập mã phòng thi và làm lại bài thi từ đầu.<br />
                • Dữ liệu bài thi đã xóa sẽ không thể khôi phục.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsResetAllModalOpen(false)}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmResetAll}
                disabled={isResetting}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-xs disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'Đang reset...' : 'Xác nhận Reset Toàn Bộ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL XÁC NHẬN RESET RIÊNG 1 BÀI NỘP */}
      {/* ============================================================ */}
      {resetSingleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Cho Phép Thí Sinh Thi Lại
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Reset bài thi của học sinh cụ thể
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <p className="text-slate-800 dark:text-slate-200">
                Thầy/Cô có chắc chắn muốn xóa bài làm của thí sinh:
              </p>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">
                  {resetSingleTarget.student_name || 'Học sinh'} ({resetSingleTarget.student_id})
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Đề thi: {getExamTitle(resetSingleTarget.exam_id)}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold mt-0.5">
                  Điểm hiện tại: {(resetSingleTarget.score ?? 0).toFixed(2)} / 20.00
                </p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sau khi xóa, học sinh này có thể vào lại phòng thi và bắt đầu làm lại từ đầu.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setResetSingleTarget(null)}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmResetSingle}
                disabled={isResetting}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition shadow-xs disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'Đang xử lý...' : 'Xác nhận Cho Thi Lại'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
