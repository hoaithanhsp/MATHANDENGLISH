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
  Layers
} from 'lucide-react';
import { Assignment, Exam, Question } from '../../types';

interface StudentSubmissionsProps {
  assignments: Assignment[];
  exams: Exam[];
}

export const StudentSubmissions: React.FC<StudentSubmissionsProps> = ({ assignments, exams }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

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
      examTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate team metrics
  const totalSubmissions = assignments.length;
  const avgScore =
    totalSubmissions > 0
      ? (assignments.reduce((sum, a) => sum + (a.score ?? 0), 0) / totalSubmissions).toFixed(2)
      : '0.00';

  const totalTabSwitches = assignments.reduce((sum, a) => sum + (a.tab_switch_count ?? 0), 0);
  const flaggedSubmissions = assignments.filter((a) => (a.tab_switch_count ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Giám Sát Phòng Thi & Phân Tích Năng Lực Đội Tuyển
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi thời gian thực kết quả bài thi, bảng điểm thang 10.00 và cảnh báo rời màn hình (Tab-switch counter).
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên học sinh, đề..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Team Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Điểm Trung Bình Đội Tuyển
          </span>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {avgScore} <span className="text-sm font-normal text-slate-400">/ 10.00</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Dựa trên {totalSubmissions} lượt làm bài đã hoàn thành
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Tỷ Lệ Đạt Yêu Cầu (≥ 5.0)
          </span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {totalSubmissions > 0
              ? `${((assignments.filter((a) => (a.score ?? 0) >= 5).length / totalSubmissions) * 100).toFixed(0)}%`
              : '0%'}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            Giỏi (≥ 8.0): {assignments.filter((a) => (a.score ?? 0) >= 8).length} học sinh
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            Giám Sát Rời Màn Hình Thi
          </span>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {totalTabSwitches} <span className="text-sm font-normal text-slate-400">lần chuyển tab</span>
          </div>
          <span className="text-[11px] text-amber-600 mt-1 block">
            {flaggedSubmissions} bài nộp có ghi nhận rời tab
          </span>
        </div>
      </div>

      {/* Submissions List & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {filtered.length > 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Học Sinh</th>
                      <th className="px-4 py-3">Đề Thi</th>
                      <th className="px-4 py-3">Điểm Số</th>
                      <th className="px-4 py-3">Giám Sát Tab</th>
                      <th className="px-4 py-3">Thời Gian Nộp</th>
                      <th className="px-4 py-3 text-right">Chi Tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                    {filtered.map((item) => {
                      const score = item.score ?? 0;
                      const scoreColor =
                        score >= 8
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                          : score >= 5
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                          : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';

                      const switchCount = item.tab_switch_count ?? 0;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-750/50 transition cursor-pointer"
                          onClick={() => setSelectedAssignment(item)}
                        >
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                            {item.student_name || 'Học sinh'}
                          </td>
                          <td className="px-4 py-3 line-clamp-1 max-w-[180px]">
                            {getExamTitle(item.exam_id)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-lg border font-mono font-bold text-xs ${scoreColor}`}
                            >
                              {score.toFixed(2)} / 10.00
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {switchCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                <ShieldAlert className="w-3 h-3" />
                                {switchCount} lần rời tab
                              </span>
                            ) : (
                              <span className="text-[11px] text-emerald-600 font-medium">
                                ✓ Nghiêm túc (0)
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
                                setSelectedAssignment(item);
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

        {/* Selected Submission Inspector on Right */}
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
                  {(selectedAssignment.score ?? 0).toFixed(2)} / 10.00
                </span>
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Câu trả lời từng câu:
                </span>
                {Object.entries(selectedAssignment.answers || {}).map(([qId, rawAns], idx) => {
                  const ans = String(rawAns || '');
                  const exam = getExam(selectedAssignment.exam_id);
                  const q = exam?.questions?.find((item) => item.id === qId);
                  const isCorrect =
                    q &&
                    (q.correct_answer.trim().toUpperCase() === ans.trim().toUpperCase() ||
                      (q.acceptable_answers && q.acceptable_answers.includes(ans.trim())));

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
              Bấm vào một hàng bài nộp để xem chi tiết từng câu trả lời và số lần học sinh đổi tab.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
