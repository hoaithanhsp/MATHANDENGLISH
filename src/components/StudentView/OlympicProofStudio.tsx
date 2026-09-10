import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Award,
  Send,
  HelpCircle,
  Copy,
  Check,
  Languages,
  PenTool,
  Lightbulb,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { ProofProblem, ProofFeedback } from '../../types';
import { polishMathProof } from '../../services/geminiService';
import MathRenderer from '../MathRenderer';

// Curated library of classic High School Olympic proof problems
const SAMPLE_PROOF_PROBLEMS: ProofProblem[] = [
  {
    id: 'proof-01',
    title: 'Bất Đẳng Thức Cauchy-Schwarz & Kỹ Thuật Thêm Bớt',
    strand: 'algebra_calculus',
    difficulty: 'advanced',
    topic: 'Inequalities & Algebraic Bounds',
    statement_en: 'Let $a, b, c > 0$ such that $a + b + c = 3$. Prove that: $$\\frac{a}{1 + b^2} + \\frac{b}{1 + c^2} + \\frac{c}{1 + a^2} \\ge \\frac{3}{2}$$',
    statement_vi: 'Cho các số thực dương $a, b, c$ thỏa mãn $a + b + c = 3$. Chứng minh rằng: $$\\frac{a}{1 + b^2} + \\frac{b}{1 + c^2} + \\frac{c}{1 + a^2} \\ge \\frac{3}{2}$$',
    hints: [
      'Use the Cauchy-Schwarz reverse technique: $\\frac{a}{1+b^2} = a - \\frac{ab^2}{1+b^2}$.',
      'Apply AM-GM inequality to the denominator: $1 + b^2 \\ge 2b$.'
    ],
    key_vocabulary: [
      'Without loss of generality',
      'Cauchy-Schwarz Inequality',
      'AM-GM Inequality',
      'Equality holds if and only if'
    ],
    sample_proof_en: `We rewrite the left-hand side using the Cauchy reverse technique:
$$\\frac{a}{1+b^2} = a - \\frac{ab^2}{1+b^2}$$
By the AM-GM Inequality, $1 + b^2 \\ge 2b$, hence:
$$\\frac{ab^2}{1+b^2} \\le \\frac{ab^2}{2b} = \\frac{ab}{2}$$
Summing cyclically over $a, b, c$:
$$\\sum_{cyc} \\frac{a}{1+b^2} \\ge (a+b+c) - \\frac{1}{2}(ab+bc+ca)$$
Since $(a+b+c)^2 \\ge 3(ab+bc+ca)$, we have $ab+bc+ca \\le 3$. Therefore:
$$\\sum_{cyc} \\frac{a}{1+b^2} \\ge 3 - \\frac{3}{2} = \\frac{3}{2}$$
Equality holds if and only if $a = b = c = 1$.`
  },
  {
    id: 'proof-02',
    title: 'Nguyên Lý Dirichlet (Pigeonhole Principle) Trong Số Học',
    strand: 'statistics_discrete',
    difficulty: 'advanced',
    topic: 'Pigeonhole Principle & Number Theory',
    statement_en: 'Prove that among any $n + 1$ integers chosen from the set $\\{1, 2, 3, \\dots, 2n\\}$, there exist two distinct integers such that one divides the other.',
    statement_vi: 'Chứng minh rằng trong $n + 1$ số nguyên bất kỳ được chọn từ tập hợp $\\{1, 2, 3, \\dots, 2n\\}$, luôn tồn tại hai số phân biệt sao cho số này chia hết cho số kia.',
    hints: [
      'Every positive integer $x$ can be uniquely written as $x = 2^k \\cdot m$, where $m$ is an odd integer.',
      'Count how many odd numbers are in the set $\\{1, 2, \\dots, 2n\\}$.'
    ],
    key_vocabulary: [
      'Pigeonhole Principle',
      'Odd part',
      'Divisibility',
      'Assume for contradiction'
    ],
    sample_proof_en: `Every integer $x \\in \\{1, 2, \\dots, 2n\\}$ can be uniquely expressed in the form:
$$x = 2^k \\cdot m$$
where $k$ is a non-negative integer and $m \\in \\{1, 3, 5, \\dots, 2n-1\\}$ is an odd integer.
Notice that there are exactly $n$ odd integers in this range.
Since we select $n + 1$ distinct integers, by the Pigeonhole Principle, at least two of the chosen numbers, say $a$ and $b$ ($a < b$), must share the exact same odd part $m$.
Thus, $a = 2^{k_1} \\cdot m$ and $b = 2^{k_2} \\cdot m$.
Since $a < b$, we have $k_1 < k_2$. Consequently, $a$ divides $b$, which completes the proof.`
  },
  {
    id: 'proof-03',
    title: 'Quan Hệ Vuông Góc Trong Hình Không Gian (Stereometry)',
    strand: 'geometry_measurement',
    difficulty: 'application',
    topic: 'Spatial Geometry & Orthogonality',
    statement_en: 'Let $S.ABCD$ be a pyramid with a square base $ABCD$ of side $a$, and $SA \\perp (ABCD)$. Prove that $(SBC) \\perp (SAB)$ and $(SCD) \\perp (SAD)$.',
    statement_vi: 'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$, và $SA \\perp (ABCD)$. Chứng minh rằng $(SBC) \\perp (SAB)$ và $(SCD) \\perp (SAD)$.',
    hints: [
      'To prove two planes are perpendicular, show that one plane contains a line perpendicular to the other plane.',
      'Show that $BC \\perp (SAB)$.'
    ],
    key_vocabulary: [
      'Perpendicular to the plane',
      'Square base',
      'It suffices to show that',
      'By the properties of perpendicularity'
    ],
    sample_proof_en: `Since $ABCD$ is a square, we have $BC \\perp AB$.
Furthermore, because $SA \\perp (ABCD)$ and $BC \\subset (ABCD)$, it follows that $SA \\perp BC$.
Thus, $BC$ is perpendicular to two intersecting lines $AB$ and $SA$ in the plane $(SAB)$.
Consequently, $BC \\perp (SAB)$.
Since $BC \\subset (SBC)$, we conclude that:
$$(SBC) \\perp (SAB)$$
By completely symmetric reasoning, $CD \\perp AD$ and $CD \\perp SA$, which implies $CD \\perp (SAD)$. Because $CD \\subset (SCD)$, it follows immediately that $(SCD) \\perp (SAD)$.`
  }
];

// Formal Academic Mathematical Transitions & Idioms
const ACADEMIC_SNIPPETS = [
  { label: 'Không mất tính TQ', snippet: 'Without loss of generality (W.L.O.G.), assume that ' },
  { label: 'Giả sử phản chứng', snippet: 'Assume for the sake of contradiction that ' },
  { label: 'Chỉ cần chỉ ra rằng', snippet: 'It suffices to show that ' },
  { label: 'Theo nguyên lý Dirichlet', snippet: 'By the Pigeonhole Principle, there exist ' },
  { label: 'Áp dụng BĐT Cauchy-Schwarz', snippet: 'Applying the Cauchy-Schwarz inequality to ' },
  { label: 'Dấu bằng xảy ra khi', snippet: 'Equality holds if and only if ' },
  { label: 'Do đó ta suy ra', snippet: 'Consequently, we obtain ' },
  { label: 'Một phép tính trực tiếp cho', snippet: 'A straightforward calculation yields ' },
  { label: 'Bằng quy nạp toán học', snippet: 'We proceed by mathematical induction on $n$. ' },
  { label: 'Tương tự ta có', snippet: 'By completely symmetric reasoning, ' }
];

export const OlympicProofStudio: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<ProofProblem>(SAMPLE_PROOF_PROBLEMS[0]);
  const [studentProof, setStudentProof] = useState('');
  const [showSample, setShowSample] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [feedback, setFeedback] = useState<ProofFeedback | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInsertSnippet = (snippet: string) => {
    setStudentProof((prev) => (prev ? `${prev} ${snippet}` : snippet));
  };

  const handlePolishProof = async () => {
    if (!studentProof.trim()) {
      alert('Vui lòng nhập lời giải chứng minh của bạn trước khi bấm phân tích!');
      return;
    }

    setIsPolishing(true);
    setFeedback(null);

    try {
      const result = await polishMathProof({
        problemTitle: selectedProblem.title,
        problemStatement: selectedProblem.statement_en,
        studentProof: studentProof.trim(),
      });
      setFeedback(result);
    } catch (err: any) {
      alert(`Lỗi phân tích AI: ${err.message || 'Vui lòng kiểm tra lại API Key'}`);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleCopyPolished = () => {
    if (!feedback?.polished_proof_en) return;
    navigator.clipboard.writeText(feedback.polished_proof_en);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-amber-300 border border-white/10 mb-3">
            <PenTool className="w-3.5 h-3.5" />
            <span>Olympic Proof & Essay Studio • K11 Hải Phòng</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Luyện Viết Chứng Minh Tự Luận Toán Bằng Tiếng Anh
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 mt-2 leading-relaxed">
            Rèn luyện kỹ năng diễn đạt học thuật quốc tế, sử dụng chuẩn xác các liên từ toán học (formal conjunctions) và nhận phản hồi chi tiết về <strong>Độ chặt chẽ (Rigor)</strong> & <strong>Ngữ pháp chuyên ngành</strong> từ trợ lý AI.
          </p>
        </div>
      </div>

      {/* Main Grid: Problem Selector + Proof Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem Bank (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Kho Đề Chứng Minh Tự Luận Tiêu Biểu
            </h3>

            <div className="space-y-2">
              {SAMPLE_PROOF_PROBLEMS.map((prob) => {
                const isSelected = selectedProblem.id === prob.id;
                return (
                  <div
                    key={prob.id}
                    onClick={() => {
                      setSelectedProblem(prob);
                      setFeedback(null);
                      setShowSample(false);
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 bg-slate-50/50 dark:bg-slate-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {prob.strand === 'algebra_calculus'
                          ? 'Đại số'
                          : prob.strand === 'geometry_measurement'
                          ? 'Hình học'
                          : 'Số học & Rời rạc'}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {prob.topic}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {prob.title}
                    </h4>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Problem Details Card */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                Đề bài tiếng Anh (Original Problem Statement):
              </span>
              <div className="text-xs font-medium text-slate-900 dark:text-white leading-relaxed p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <MathRenderer content={selectedProblem.statement_en} />
              </div>
            </div>

            {selectedProblem.statement_vi && (
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Bản dịch Tiếng Việt:
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic p-3 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
                  <MathRenderer content={selectedProblem.statement_vi} />
                </div>
              </div>
            )}

            {/* Vocabulary Tags */}
            {selectedProblem.key_vocabulary && (
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Thuật ngữ & Liên từ gợi ý:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProblem.key_vocabulary.map((v, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleInsertSnippet(v)}
                      className="px-2 py-0.5 text-[11px] font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 transition"
                      title="Bấm để chèn vào bài làm"
                    >
                      + {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons for Hints & Sample Solution */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                {showHints ? 'Ẩn gợi ý' : 'Gợi ý giải'}
              </button>

              <button
                type="button"
                onClick={() => setShowSample(!showSample)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 ml-auto"
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                {showSample ? 'Ẩn lời giải mẫu' : 'Xem lời giải mẫu chuẩn'}
              </button>
            </div>

            {showHints && selectedProblem.hints && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1.5 animate-in fade-in">
                <span className="font-bold text-amber-800 dark:text-amber-300 block">
                  💡 Hướng dẫn tư duy:
                </span>
                <ul className="list-disc pl-4 space-y-1 text-amber-900 dark:text-amber-200/90">
                  {selectedProblem.hints.map((h, i) => (
                    <li key={i}>
                      <MathRenderer content={h} inline />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showSample && selectedProblem.sample_proof_en && (
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-2 animate-in fade-in">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                  🏆 Lời giải mẫu chuẩn Olympic (Sample Proof):
                </span>
                <div className="text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                  <MathRenderer content={selectedProblem.sample_proof_en} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Writing Canvas & AI Academic Polisher (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-indigo-600" />
                  Khu Vực Soạn Thảo Chứng Minh Của Học Sinh
                </h3>
                <span className="text-xs text-slate-400">
                  Hỗ trợ gõ công thức Toán KaTeX đặt trong dấu $...$ hoặc $$...$$
                </span>
              </div>

              <button
                type="button"
                onClick={handlePolishProof}
                disabled={isPolishing || !studentProof.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-md disabled:opacity-50 shrink-0"
              >
                {isPolishing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Đang phân tích & tinh chỉnh...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    AI Academic Polisher
                  </>
                )}
              </button>
            </div>

            {/* Quick Math Conjunctions Toolbar */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Thanh công cụ liên từ học thuật quốc tế (Chạm để chèn nhanh):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ACADEMIC_SNIPPETS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertSnippet(item.snippet)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition border border-slate-200 dark:border-slate-700"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea for proof drafting */}
            <div>
              <textarea
                rows={10}
                value={studentProof}
                onChange={(e) => setStudentProof(e.target.value)}
                placeholder="Bắt đầu viết lời giải chứng minh bằng tiếng Anh tại đây... Ví dụ:
Assume for the sake of contradiction that...
By the Cauchy-Schwarz inequality, we have...
Since a, b, c > 0, it follows that...
Consequently, we conclude that the inequality holds."
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Live Math Preview if student types math formulas */}
            {studentProof.includes('$') && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Xem trước công thức Toán (Math Preview):
                </span>
                <div className="text-slate-800 dark:text-slate-200 font-serif">
                  <MathRenderer content={studentProof} />
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Feedback Panel */}
          {feedback && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900 shadow-md space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Kết Quả Phân Tích & Tinh Chỉnh Của AI
                </h3>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  Chuẩn Olympic Quốc Tế
                </span>
              </div>

              {/* Dual Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 text-center">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase block mb-1">
                    Độ Chặt Chẽ Toán Học (Rigor)
                  </span>
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {feedback.rigor_score} <span className="text-sm font-normal text-slate-400">/ 10</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 text-center">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block mb-1">
                    Tiếng Anh Học Thuật (Language)
                  </span>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {feedback.language_score} <span className="text-sm font-normal text-slate-400">/ 10</span>
                  </div>
                </div>
              </div>

              {/* Mathematical Reasoning Feedback */}
              {feedback.math_reasoning_feedback && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Đánh Giá Lập Luận Toán Học:
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {feedback.math_reasoning_feedback}
                  </p>
                </div>
              )}

              {/* Grammar & Phrasing Corrections */}
              {feedback.grammar_issues && feedback.grammar_issues.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Điểm cần trau chuốt về diễn đạt tiếng Anh ({feedback.grammar_issues.length}):
                  </span>
                  <div className="space-y-2">
                    {feedback.grammar_issues.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="line-through text-rose-600 dark:text-rose-400 font-mono">
                            {item.original}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {item.correction}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] italic">
                          {item.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Publication-Grade Polished Proof */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Bản Viết Lại Chuẩn Học Thuật Olympic Quốc Tế:
                  </span>
                  <button
                    onClick={handleCopyPolished}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Đã sao chép
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Sao chép
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs sm:text-sm font-serif leading-relaxed text-indigo-100 bg-black/30 p-4 rounded-xl border border-white/10">
                  <MathRenderer content={feedback.polished_proof_en} />
                </div>
              </div>

              {/* Pedagogical Advice */}
              {feedback.pedagogical_advice && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">
                    🎯 Lời khuyên sư phạm bồi dưỡng thi Thành phố:
                  </span>
                  <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                    {feedback.pedagogical_advice}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default OlympicProofStudio;
