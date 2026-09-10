import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  Award,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Target,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Activity,
  Search,
  Filter
} from 'lucide-react';
import { Assignment, Exam, ExamSession } from '../../types';
import { storageService } from '../../services/storageService';

interface StudentLearningHistoryProps {
  assignments: Assignment[];
  exams: Exam[];
}

interface StudentSummary {
  student_id: string;
  student_name: string;
  total_tests: number;
  avg_score: number;
  best_score: number;
  worst_score: number;
  last_test_date: string;
  tests: Assignment[];
}

// Topic strands for radar analysis
const STRANDS = [
  { key: 'algebra', label: 'Algebra & Calculus', color: '#10b981' },
  { key: 'geometry', label: 'Geometry & Measurement', color: '#6366f1' },
  { key: 'statistics', label: 'Statistics & Discrete', color: '#f59e0b' },
];

const STRAND_KEYWORDS: Record<string, string[]> = {
  algebra: ['algebra', 'calculus', 'equation', 'polynomial', 'function', 'derivative', 'integral', 'inequality', 'sequence', 'series', 'logarithm', 'exponential', 'quadratic', 'linear', 'system', 'matrix', 'đại số', 'giải tích', 'phương trình', 'hệ phương trình', 'bất phương trình', 'dãy số', 'cấp số'],
  geometry: ['geometry', 'triangle', 'circle', 'polygon', 'area', 'volume', 'coordinate', 'angle', 'perpendicular', 'parallel', 'trigonometry', 'sin', 'cos', 'tan', 'vector', 'hình học', 'tam giác', 'đường tròn', 'tọa độ', 'lượng giác'],
  statistics: ['statistics', 'probability', 'combinatorics', 'counting', 'permutation', 'combination', 'graph', 'number theory', 'divisor', 'prime', 'modular', 'thống kê', 'xác suất', 'tổ hợp', 'hoán vị', 'chỉnh hợp', 'số nguyên tố'],
};

export const StudentLearningHistory: React.FC<StudentLearningHistoryProps> = ({ assignments, exams }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storageService.getAllExamSessions().then((all) => {
      setSessions(all);
      setLoading(false);
    });
  }, []);

  // Build student summaries from assignments
  const studentMap = new Map<string, StudentSummary>();
  assignments.forEach((a) => {
    const key = a.student_id;
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        student_id: key,
        student_name: a.student_name || 'Học sinh',
        total_tests: 0,
        avg_score: 0,
        best_score: 0,
        worst_score: 20,
        last_test_date: '',
        tests: [],
      });
    }
    const summary = studentMap.get(key)!;
    summary.total_tests += 1;
    summary.tests.push(a);
    const score = a.score ?? 0;
    summary.best_score = Math.max(summary.best_score, score);
    summary.worst_score = Math.min(summary.worst_score, score);
    if (!summary.last_test_date || (a.submitted_at && a.submitted_at > summary.last_test_date)) {
      summary.last_test_date = a.submitted_at || a.created_at;
    }
  });

  // Calculate averages
  studentMap.forEach((s) => {
    const total = s.tests.reduce((sum, t) => sum + (t.score ?? 0), 0);
    s.avg_score = s.total_tests > 0 ? total / s.total_tests : 0;
  });

  const students = Array.from(studentMap.values())
    .filter((s) =>
      s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.last_test_date).getTime() - new Date(a.last_test_date).getTime());

  const selectedStudent = selectedStudentId ? studentMap.get(selectedStudentId) : null;

  // Analyze strands for selected student
  const analyzeStrands = (student: StudentSummary) => {
    const strandScores: Record<string, { correct: number; total: number }> = {
      algebra: { correct: 0, total: 0 },
      geometry: { correct: 0, total: 0 },
      statistics: { correct: 0, total: 0 },
    };

    student.tests.forEach((test) => {
      const exam = exams.find((e) => e.id === test.exam_id);
      if (!exam?.questions) return;

      exam.questions.forEach((q) => {
        const qText = `${q.question_text} ${q.strand || ''} ${q.topic || ''}`.toLowerCase();
        let matched = false;

        for (const [strand, keywords] of Object.entries(STRAND_KEYWORDS)) {
          if (keywords.some((kw) => qText.includes(kw))) {
            strandScores[strand].total += 1;
            const userAns = test.answers?.[q.id] || '';
            if (q.part === 'PART_1') {
              if (userAns.trim().toUpperCase() === q.correct_answer.trim().toUpperCase()) {
                strandScores[strand].correct += 1;
              }
            } else {
              // Simple check for short answer
              if (userAns.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) {
                strandScores[strand].correct += 1;
              }
            }
            matched = true;
            break;
          }
        }

        if (!matched) {
          // Default to algebra
          strandScores.algebra.total += 1;
          const userAns = test.answers?.[q.id] || '';
          if (q.part === 'PART_1' && userAns.trim().toUpperCase() === q.correct_answer.trim().toUpperCase()) {
            strandScores.algebra.correct += 1;
          }
        }
      });
    });

    return STRANDS.map((s) => {
      const data = strandScores[s.key];
      const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
      return { ...s, correct: data.correct, total: data.total, percentage: pct };
    });
  };

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getExamTitle = (examId: string) => exams.find((e) => e.id === examId)?.title || 'Đề thi';

  const getScoreColor = (score: number) => {
    if (score >= 16) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 12) return 'text-blue-600 dark:text-blue-400';
    if (score >= 8) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 16) return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800';
    if (score >= 12) return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
    if (score >= 8) return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
    return 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800';
  };

  const getTrend = (tests: Assignment[]) => {
    if (tests.length < 2) return 'neutral';
    const sorted = [...tests].sort((a, b) =>
      new Date(a.submitted_at || a.created_at).getTime() - new Date(b.submitted_at || b.created_at).getTime()
    );
    const last = sorted[sorted.length - 1].score ?? 0;
    const prev = sorted[sorted.length - 2].score ?? 0;
    if (last > prev) return 'up';
    if (last < prev) return 'down';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Lịch sử học tập & Thống kê chuyên đề
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Theo dõi lịch sử hoạt động, phân tích điểm mạnh/yếu từng chuyên đề của mỗi học sinh trong đội tuyển.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
          <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">Chưa có dữ liệu bài nộp</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Khi học sinh hoàn thành các bài thi, dữ liệu lịch sử học tập sẽ tự động hiển thị ở đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {students.map((student) => {
                const trend = getTrend(student.tests);
                const isSelected = selectedStudentId === student.student_id;

                return (
                  <button
                    key={student.student_id}
                    onClick={() => setSelectedStudentId(isSelected ? null : student.student_id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                        {student.student_name[0]?.toUpperCase() || 'H'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{student.student_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {student.total_tests} bài thi
                          </span>
                          <span className="text-[11px] text-slate-400">•</span>
                          <span className={`text-[11px] font-bold ${getScoreColor(student.avg_score)}`}>
                            TB: {student.avg_score.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                        {trend === 'down' && <TrendingDown className="w-4 h-4 text-rose-500" />}
                        {trend === 'neutral' && <Activity className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedStudent ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-xs">
                <Target className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Chọn một học sinh từ danh sách bên trái để xem lịch sử học tập chi tiết.</p>
              </div>
            ) : (
              <>
                {/* Student Summary Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {selectedStudent.student_name[0]?.toUpperCase() || 'H'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedStudent.student_name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Thi gần nhất: {formatDate(selectedStudent.last_test_date)} lúc {formatTime(selectedStudent.last_test_date)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-center">
                      <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{selectedStudent.total_tests}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Số bài thi</p>
                    </div>
                    <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-center">
                      <p className="text-lg font-bold text-teal-700 dark:text-teal-300">{selectedStudent.avg_score.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Điểm TB</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{selectedStudent.best_score.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Điểm cao nhất</p>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center">
                      <p className="text-lg font-bold text-rose-700 dark:text-rose-300">{selectedStudent.worst_score.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Điểm thấp nhất</p>
                    </div>
                  </div>
                </div>

                {/* Strand Analysis */}
                {(() => {
                  const strandData = analyzeStrands(selectedStudent);
                  const weakest = strandData.reduce((min, s) => (s.total > 0 && s.percentage < (min.percentage || 100)) ? s : min, strandData[0]);

                  return (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-4">
                        <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Phân tích điểm mạnh / yếu theo chuyên đề
                      </h4>

                      <div className="space-y-3">
                        {strandData.map((strand) => (
                          <div key={strand.key}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{strand.label}</span>
                              <span className="text-xs font-bold" style={{ color: strand.color }}>
                                {strand.correct}/{strand.total} câu ({strand.percentage}%)
                              </span>
                            </div>
                            <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${strand.percentage}%`,
                                  backgroundColor: strand.color,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {weakest && weakest.total > 0 && weakest.percentage < 70 && (
                        <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Chuyên đề cần ôn tập:</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                              <strong>{weakest.label}</strong> — Tỉ lệ đúng chỉ {weakest.percentage}%. Nên bổ sung bài tập chuyên đề này cho học sinh.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Timeline */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-4">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Lịch sử hoạt động
                  </h4>

                  <div className="space-y-3">
                    {selectedStudent.tests
                      .sort((a, b) => new Date(b.submitted_at || b.created_at).getTime() - new Date(a.submitted_at || a.created_at).getTime())
                      .map((test, idx) => {
                        const score = test.score ?? 0;
                        return (
                          <div
                            key={test.id}
                            className={`relative flex items-start gap-3 pl-6 pb-3 ${
                              idx < selectedStudent.tests.length - 1 ? 'border-l-2 border-slate-200 dark:border-slate-700 ml-2' : 'ml-2'
                            }`}
                          >
                            {/* Timeline dot */}
                            <div className={`absolute -left-[5px] top-1 w-3 h-3 rounded-full border-2 ${
                              score >= 16 ? 'bg-emerald-500 border-emerald-300' :
                              score >= 12 ? 'bg-blue-500 border-blue-300' :
                              score >= 8 ? 'bg-amber-500 border-amber-300' :
                              'bg-rose-500 border-rose-300'
                            }`} />

                            <div className={`flex-1 p-3 rounded-xl border ${getScoreBg(score)}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                                  <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[200px] sm:max-w-none">
                                    {getExamTitle(test.exam_id)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Award className="w-3.5 h-3.5 text-amber-500" />
                                  <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                                    {score.toFixed(2)}/20.00
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(test.submitted_at || test.created_at)}
                                </span>
                                <span>{formatTime(test.submitted_at || test.created_at)}</span>
                                {(test.tab_switch_count ?? 0) > 0 && (
                                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                                    ⚠ {test.tab_switch_count} lần chuyển tab
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
