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
  Check
} from 'lucide-react';
import { Assignment, Exam, Question } from '../../types';
import { isMathAnswerCorrect } from '../../utils/mathAnswerEvaluator';
import { storageService } from '../../services/storageService';

interface StudentSubmissionsProps {
  assignments: Assignment[];
  exams: Exam[];
}

export const StudentSubmissions: React.FC<StudentSubmissionsProps> = ({ assignments, exams }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [feedbackSavedMsg, setFeedbackSavedMsg] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Quản Lý Bài Nộp & Phản Hồi Học Sinh (Đội Tuyển K11)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chấm điểm tự động theo thang điểm chuẩn <strong>20.00</strong> Sở GD&ĐT Hải Phòng, giám sát đổi tab và gửi lời phê 2 chiều.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên học sinh, đề thi, mã HS..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
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
                              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-medium'
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
                                  ? 'text-indigo-600 dark:text-indigo-400'
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
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
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
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAssignment(item);
                              }}
                              className="p-1 text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Xem bài
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

              {/* Teacher Feedback Loop Box */}
              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
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
                  className="w-full p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                        className="px-2 py-0.5 text-[10px] rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 transition truncate max-w-full text-left"
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
                    className="ml-auto px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
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
    </div>
  );
};
