import React from 'react';
import {
  Layers,
  BookOpen,
  PieChart,
  CheckCircle2,
  Clock,
  Award,
  Hash,
  Calculator,
  Compass,
  Shuffle
} from 'lucide-react';
import { HAIPHONG_MATRIX_RULES, DIFFICULTY_DISTRIBUTION } from '../../types';

export const MatrixGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 mb-3">
            <Award className="w-3.5 h-3.5" />
            Quy Định Chuẩn Sở GD&ĐT Hải Phòng
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ma Trận Đề Thi Chọn HSG Toán THPT Bằng Tiếng Anh
          </h2>
          <p className="text-sm text-indigo-200 mt-2 leading-relaxed">
            Quy chuẩn cấu trúc <strong>22 câu hỏi / 90 phút</strong>, thang điểm 10.0, bao phủ toàn diện kiến thức THCS, Lớp 10 và Lớp 11 với 3 mạch kiến thức trọng tâm.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[11px] text-indigo-200 block">Thời gian làm bài</span>
              <span className="text-xl font-bold">90 Phút</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[11px] text-indigo-200 block">Tổng số câu</span>
              <span className="text-xl font-bold">22 Câu</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[11px] text-indigo-200 block">Phần I (Trắc nghiệm)</span>
              <span className="text-xl font-bold">12 Câu (A,B,C,D)</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[11px] text-indigo-200 block">Phần II (Điền đáp số)</span>
              <span className="text-xl font-bold">10 Câu (Ngắn)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Main Strands */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Phân Bổ 3 Mạch Kiến Thức Chính (Tổng 22 câu)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {HAIPHONG_MATRIX_RULES.map((rule, idx) => {
            const icons = [
              <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
              <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
              <Shuffle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
            ];

            return (
              <div
                key={rule.strand}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60">
                      {icons[idx]}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {rule.question_count} câu ({((rule.question_count / 22) * 100).toFixed(1)}%)
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {rule.strand_name_vi}
                  </h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-3">
                    {rule.strand_name_en}
                  </p>

                  <div className="space-y-1.5">
                    {rule.topics.map((t, tIdx) => (
                      <div
                        key={tIdx}
                        className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cognitive Level Distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Mức Độ Nhận Thức & Thang Đo Năng Lực
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 block">
              Thông hiểu (Understanding)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {DIFFICULTY_DISTRIBUTION.understanding.count} câu
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                ({DIFFICULTY_DISTRIBUTION.understanding.percentage})
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300/80 mt-1">
              Nắm vững định nghĩa, công thức cơ bản và khả năng đọc hiểu thuật ngữ toán học bằng Tiếng Anh.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 block">
              Vận dụng (Application)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {DIFFICULTY_DISTRIBUTION.application.count} câu
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400">
                ({DIFFICULTY_DISTRIBUTION.application.percentage})
              </span>
            </div>
            <p className="text-[11px] text-blue-800 dark:text-blue-300/80 mt-1">
              Kết hợp nhiều công thức, biến đổi đại số, lượng giác và giải quyết bài toán hình học không gian.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 block">
              Vận dụng cao (Higher-order Thinking)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {DIFFICULTY_DISTRIBUTION.advanced.count} câu
              </span>
              <span className="text-xs text-purple-600 dark:text-purple-400">
                ({DIFFICULTY_DISTRIBUTION.advanced.percentage})
              </span>
            </div>
            <p className="text-[11px] text-purple-800 dark:text-purple-300/80 mt-1">
              Các bài toán phân loại HSG: Bất biến (Invariants), Dirichlet nâng cao, cực trị hình học, dãy số phi tuyến.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
