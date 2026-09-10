import React, { useState, useMemo } from 'react';
import {
  Radar,
  Award,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  BookOpen,
  Sparkles,
  ChevronRight,
  Filter,
  BarChart3,
  Target,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { Assignment, Exam, Question, MathStrand, HAIPHONG_MATRIX_RULES } from '../../types';
import { isMathAnswerCorrect } from '../../utils/mathAnswerEvaluator';

interface TeamCompetencyRadarProps {
  assignments: Assignment[];
  exams: Exam[];
}

interface StrandStats {
  strand: MathStrand;
  name_vi: string;
  name_en: string;
  totalQuestions: number;
  correctCount: number;
  accuracyRate: number; // 0 - 100
  recommendedTopics: string[];
}

export const TeamCompetencyRadar: React.FC<TeamCompetencyRadarProps> = ({ assignments, exams }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');

  // Unique list of students
  const studentList = useMemo(() => {
    const map = new Map<string, string>();
    assignments.forEach((a) => {
      if (a.student_id && a.student_name) {
        map.set(a.student_id, a.student_name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [assignments]);

  // Filter assignments based on selected student
  const activeAssignments = useMemo(() => {
    if (selectedStudentId === 'all') return assignments;
    return assignments.filter((a) => a.student_id === selectedStudentId);
  }, [assignments, selectedStudentId]);

  // Compute stats across 3 Hai Phong strands
  const strandStats: StrandStats[] = useMemo(() => {
    const stats: Record<MathStrand, { total: number; correct: number; recommendedTopics: string[] }> = {
      algebra_calculus: { total: 0, correct: 0, recommendedTopics: [] },
      geometry_measurement: { total: 0, correct: 0, recommendedTopics: [] },
      statistics_discrete: { total: 0, correct: 0, recommendedTopics: [] },
    };

    activeAssignments.forEach((assignment) => {
      const exam = exams.find((e) => e.id === assignment.exam_id);
      if (!exam?.questions) return;

      exam.questions.forEach((q) => {
        const studentAns = assignment.answers?.[q.id] || '';
        const isCorrect =
          q.part === 'PART_1'
            ? studentAns.trim().toUpperCase() === q.correct_answer.trim().toUpperCase()
            : isMathAnswerCorrect(studentAns, q.correct_answer, q.acceptable_answers);

        if (stats[q.strand]) {
          stats[q.strand].total += 1;
          if (isCorrect) {
            stats[q.strand].correct += 1;
          } else if (!stats[q.strand].recommendedTopics.includes(q.topic)) {
            stats[q.strand].recommendedTopics.push(q.topic);
          }
        }
      });
    });

    const definitions: { strand: MathStrand; name_vi: string; name_en: string }[] = [
      {
        strand: 'algebra_calculus',
        name_vi: 'Đại số – Giải tích (Lượng giác, Cấp số, Giới hạn, Mũ-Logarit)',
        name_en: 'Algebra & Calculus',
      },
      {
        strand: 'geometry_measurement',
        name_vi: 'Hình học & Đo lường (Không gian, Tọa độ, 3 đường Conic)',
        name_en: 'Geometry & Measurement',
      },
      {
        strand: 'statistics_discrete',
        name_vi: 'Thống kê, Xác suất, Rời rạc & Số học (Dirichlet, Bất biến)',
        name_en: 'Statistics, Probability & Discrete Math',
      },
    ];

    return definitions.map((def) => {
      const s = stats[def.strand];
      const accuracyRate = s.total > 0 ? Number(((s.correct / s.total) * 100).toFixed(1)) : 0;
      return {
        strand: def.strand,
        name_vi: def.name_vi,
        name_en: def.name_en,
        totalQuestions: s.total,
        correctCount: s.correct,
        accuracyRate,
        recommendedTopics: s.recommendedTopics.slice(0, 3),
      };
    });
  }, [activeAssignments, exams]);

  // Overall accuracy
  const totalQ = strandStats.reduce((sum, s) => sum + s.totalQuestions, 0);
  const correctQ = strandStats.reduce((sum, s) => sum + s.correctCount, 0);
  const overallRate = totalQ > 0 ? Number(((correctQ / totalQ) * 100).toFixed(1)) : 0;

  // SVG Radar Polygon coordinates
  // 3 axes separated by 120 degrees:
  // Top (0 deg / -90 in standard SVG coords): Algebra (x=150, y=150 - r)
  // Bottom-Right (120 deg): Geometry
  // Bottom-Left (240 deg): Discrete
  const radarPoints = useMemo(() => {
    const cx = 150;
    const cy = 150;
    const maxR = 100;

    const r0 = ((strandStats[0]?.accuracyRate || 0) / 100) * maxR;
    const r1 = ((strandStats[1]?.accuracyRate || 0) / 100) * maxR;
    const r2 = ((strandStats[2]?.accuracyRate || 0) / 100) * maxR;

    // Angle 0: -90 deg (Top)
    const x0 = cx;
    const y0 = cy - r0;

    // Angle 1: 30 deg (Bottom Right) -> cos(30) = sqrt(3)/2 ~ 0.866, sin(30) = 0.5
    const x1 = cx + r1 * 0.866;
    const y1 = cy + r1 * 0.5;

    // Angle 2: 150 deg (Bottom Left) -> cos(150) = -0.866, sin(150) = 0.5
    const x2 = cx - r2 * 0.866;
    const y2 = cy + r2 * 0.5;

    return `${x0},${y0} ${x1},${y1} ${x2},${y2}`;
  }, [strandStats]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Bảng Radar & Phân Tích Năng Lực Đội Tuyển K11 Hải Phòng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chẩn đoán năng lực thực chiến theo 3 mạch kiến thức của Sở GD&ĐT Hải Phòng và tự động đề xuất lộ trình bồi dưỡng cá nhân hóa.
          </p>
        </div>

        {/* Student filter selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">Toàn bộ Đội tuyển ({studentList.length} học sinh)</option>
            {studentList.map((stu) => (
              <option key={stu.id} value={stu.id}>
                {stu.name} ({stu.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Tổng Số Câu Hỏi Đã Làm
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
            {totalQ} <span className="text-sm font-normal text-slate-400">câu</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {activeAssignments.length} lượt bài nộp được phân tích
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Tỷ Lệ Chính Xác Toàn Diện
          </span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {overallRate}%
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            Làm đúng {correctQ} / {totalQ} câu hỏi Olympic
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Đánh Giá Chuẩn Tuyển Chọn
          </span>
          <div className="text-base font-bold text-teal-600 dark:text-teal-400 mt-2">
            {overallRate >= 80
              ? '🌟 Phong độ Vững vàng — Sẵn sàng tranh Giải Thành phố'
              : overallRate >= 65
              ? '🎯 Đạt Chuẩn — Cần tăng tốc rèn câu hỏi Vận dụng cao'
              : overallRate >= 50
              ? '📈 Đạt Khá — Cần bồi dưỡng thêm chuyên đề yếu'
              : '⚠️ Cần Tăng Cường — Cần ôn tập lại các chuyên đề trọng tâm'}
          </div>
        </div>
      </div>

      {/* Main Analysis: Radar Graph + Progress Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Radar Visualization (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col items-center justify-between">
          <div className="w-full text-center border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Biểu Đồ Radar Năng Lực 3 Mạch Kiến Thức
            </h3>
            <span className="text-xs text-slate-400">Chuẩn Sở GD&ĐT Hải Phòng</span>
          </div>

          {/* SVG Radar Chart */}
          <div className="my-6 relative flex items-center justify-center">
            <svg width="300" height="300" className="overflow-visible">
              {/* Concentric Triangles (Background Grid: 25%, 50%, 75%, 100%) */}
              {[25, 50, 75, 100].map((level) => {
                const r = level;
                const p0 = `150,${150 - r}`;
                const p1 = `${150 + r * 0.866},${150 + r * 0.5}`;
                const p2 = `${150 - r * 0.866},${150 + r * 0.5}`;
                return (
                  <polygon
                    key={level}
                    points={`${p0} ${p1} ${p2}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-slate-200 dark:text-slate-700"
                    strokeDasharray={level < 100 ? '2 2' : undefined}
                  />
                );
              })}

              {/* Axis lines from center */}
              <line x1="150" y1="150" x2="150" y2="50" stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
              <line x1="150" y1="150" x2="236.6" y2="200" stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
              <line x1="150" y1="150" x2="63.4" y2="200" stroke="currentColor" className="text-slate-300 dark:text-slate-700" />

              {/* Active Radar Polygon */}
              <polygon
                points={radarPoints}
                fill="rgba(99, 102, 241, 0.25)"
                stroke="#6366F1"
                strokeWidth="2.5"
                className="transition-all duration-500 ease-out"
              />

              {/* Center point */}
              <circle cx="150" cy="150" r="3" fill="#6366F1" />

              {/* Labels on vertices */}
              <text x="150" y="32" textAnchor="middle" className="text-[10px] font-bold fill-teal-600 dark:fill-teal-400">
                Đại số & Giải tích ({strandStats[0]?.accuracyRate}%)
              </text>
              <text x="245" y="215" textAnchor="start" className="text-[10px] font-bold fill-emerald-600 dark:fill-emerald-400">
                Hình học ({strandStats[1]?.accuracyRate}%)
              </text>
              <text x="55" y="215" textAnchor="end" className="text-[10px] font-bold fill-amber-600 dark:fill-amber-400">
                Xác suất & Số học ({strandStats[2]?.accuracyRate}%)
              </text>
            </svg>
          </div>

          <div className="w-full text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
            Vùng đa giác màu xanh càng mở rộng ra biên thì năng lực học sinh càng toàn diện và đồng đều giữa các mạch.
          </div>
        </div>

        {/* Right Column: Detailed Strand Progress & Pedagogical Action Plan (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-600" />
              Chi Tiết Tỷ Lệ Làm Đúng Theo Từng Mạch
            </h3>

            <div className="space-y-4">
              {strandStats.map((stat, idx) => {
                const isWeak = stat.accuracyRate < 60 && stat.totalQuestions > 0;
                const isStrong = stat.accuracyRate >= 80;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {stat.name_vi}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {stat.name_en}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono text-base font-black ${
                            isStrong
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isWeak
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-teal-600 dark:text-teal-400'
                          }`}
                        >
                          {stat.accuracyRate}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          ({stat.correctCount}/{stat.totalQuestions} câu)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isStrong
                            ? 'bg-emerald-500'
                            : isWeak
                            ? 'bg-rose-500'
                            : 'bg-teal-600'
                        }`}
                        style={{ width: `${stat.accuracyRate}%` }}
                      />
                    </div>

                    {/* Recommendations if weak */}
                    {stat.recommendedTopics.length > 0 && (
                      <div className="pt-2 text-xs flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>Chuyên đề cần giao thêm bài tập:</strong>{' '}
                          {stat.recommendedTopics.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pedagogical Action Plan */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-teal-200 dark:border-teal-900/60 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-teal-950 dark:text-teal-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Khuyến Nghị Sư Phạm Của Thầy Cô (Lộ Trình Bồi Dưỡng K11)
            </h3>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Đối với các câu làm sai:</strong> Đã được tự động nạp vào mục <em>"Sổ tay câu sai"</em> của từng em để học sinh tự luyện lại. Thầy cô nên nhắc nhở các em giải lại trước buổi bồi dưỡng tiếp theo.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Chiến thuật thi 90 phút:</strong> Phân bổ thời gian tối ưu cho đề 22 câu: Dành <strong>35 phút</strong> hoàn thành 12 câu trắc nghiệm Part I (0.5đ/câu) và <strong>50 phút</strong> giải quyết 10 câu trả lời ngắn Part II (1.4đ/câu), dành <strong>5 phút</strong> cuối cùng rà soát đơn vị và dấu số học.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TeamCompetencyRadar;
