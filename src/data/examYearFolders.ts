/**
 * THƯ MỤC ĐỀ THI THEO NĂM HỌC
 * - Đề gốc 2025-2026 (Code 901, Sở GD&ĐT Hải Phòng) được mô tả thành "khung đề" 22 câu:
 *   mỗi câu có phần, mạch kiến thức, chủ đề, mức độ và tóm tắt dạng toán.
 * - Thư mục 2026-2027 dùng khung này để AI sinh đề theo 3 hướng:
 *   (1) đề tương tự, (2) đề có dạng toán khác, (3) đề bổ sung dạng toán mới.
 * Nguồn: thư mục "ĐỀ TOÁN TIẾNG ANH NĂM 2025-2026/source" (De_thi_Code_901.tex, De_901_loi_giai.tex).
 */
import { CognitiveLevel, MathStrand, QuestionPart } from '../types';

export interface BlueprintItem {
  /** Thứ tự trong đề của app: 1..12 (Phần I), 13..22 (Phần II) */
  order: number;
  /** Ký hiệu câu trong đề gốc, VD "I.3", "II.10" */
  label: string;
  part: QuestionPart;
  strand: MathStrand;
  topic_en: string;
  topic_vi: string;
  difficulty: CognitiveLevel;
  /** Tóm tắt dạng toán của câu gốc (tiếng Anh, đưa cho AI) */
  pattern_en: string;
  /** Câu gốc có bối cảnh thực tế */
  real_world?: boolean;
  /** Câu gốc có hình vẽ / đồ thị */
  has_figure?: boolean;
  /** Đáp án câu gốc (để tham khảo, không đưa vào đề mới) */
  original_answer: string;
}

/** Khung 22 câu của đề chính thức 2025-2026 — Code 901 */
export const CODE_901_BLUEPRINT: BlueprintItem[] = [
  // ---------------- PHẦN I: 12 câu trắc nghiệm ----------------
  { order: 1, label: 'I.1', part: 'PART_1', strand: 'algebra_calculus', topic_en: 'Arithmetic progression (real-world)', topic_vi: 'Cấp số cộng (thực tế)', difficulty: 'understanding', real_world: true,
    pattern_en: 'Real-world cost of drilling a well: price of the first meter given, each next meter costs a fixed amount more; find the total cost = sum of an arithmetic progression.', original_answer: 'B' },
  { order: 2, label: 'I.2', part: 'PART_1', strand: 'algebra_calculus', topic_en: 'Quadratic functions with a parameter', topic_vi: 'Hàm số bậc hai chứa tham số', difficulty: 'understanding',
    pattern_en: 'Parabola y = x^2 + 2mx + 2m^2 + m; find the set of m such that the vertex lies on a given line; answer is the sum of the elements (Vieta).', original_answer: 'C' },
  { order: 3, label: 'I.3', part: 'PART_1', strand: 'geometry_measurement', topic_en: 'Ellipse in the coordinate plane', topic_vi: 'Elip trong mặt phẳng toạ độ', difficulty: 'application', has_figure: true,
    pattern_en: 'Ellipse x^2/a^2 + y^2/b^2 = 1 passes through a given point M with angle F1MF2 = 90°; use OM = c and substitute M to find a^2 + b^2.', original_answer: 'D' },
  { order: 4, label: 'I.4', part: 'PART_1', strand: 'geometry_measurement', topic_en: 'Equation of a circle', topic_vi: 'Phương trình đường tròn', difficulty: 'understanding',
    pattern_en: 'Circle with diameter AB for two given points; choose the correct equation (centre = midpoint, R = AB/2).', original_answer: 'C' },
  { order: 5, label: 'I.5', part: 'PART_1', strand: 'statistics_discrete', topic_en: 'Classical probability with round tables', topic_vi: 'Xác suất cổ điển – xếp bàn tròn', difficulty: 'application',
    pattern_en: '21 students randomly seated at three round tables of 6, 7, 8 seats; probability that two specific students sit at the same table but not next to each other.', original_answer: 'A' },
  { order: 6, label: 'I.6', part: 'PART_1', strand: 'geometry_measurement', topic_en: 'Law of cosines in a quadrilateral (real-world)', topic_vi: 'Hệ thức lượng trong tam giác (thực tế)', difficulty: 'understanding', real_world: true, has_figure: true,
    pattern_en: 'Quadrilateral plot of land ABCD with three sides and two angles given; compute the missing side with the law of cosines and the cost to fence the perimeter (rounded).', original_answer: 'A' },
  { order: 7, label: 'I.7', part: 'PART_1', strand: 'algebra_calculus', topic_en: 'Composite equation with trigonometric functions read from a graph', topic_vi: 'Đọc đồ thị hàm bậc hai – PT lượng giác', difficulty: 'understanding', has_figure: true,
    pattern_en: 'Graph of a quadratic f(x) with roots -1 and 3 is given; count solutions of f(2cos x) = 0 on (0; 4π).', original_answer: 'A' },
  { order: 8, label: 'I.8', part: 'PART_1', strand: 'geometry_measurement', topic_en: 'Line parallel to a plane (prism)', topic_vi: 'Đường thẳng song song mặt phẳng (lăng trụ)', difficulty: 'understanding',
    pattern_en: 'Triangular prism ABC.A\'B\'C\' with midpoints M of BC and P of A\'C\'; which plane is MP parallel to?', original_answer: 'A' },
  { order: 9, label: 'I.9', part: 'PART_1', strand: 'geometry_measurement', topic_en: 'Plane section of a pyramid – ratio of segments', topic_vi: 'Thiết diện hình chóp – tỉ số đoạn thẳng', difficulty: 'application',
    pattern_en: 'Pyramid S.ABCD with parallelogram base; M, P midpoints of SA, SC; N on SB with SN/SB = 5/8; plane (MNP) meets SD at Q; find QS/QD (SA/SM + SC/SP = SB/SN + SD/SQ).', original_answer: 'B' },
  { order: 10, label: 'I.10', part: 'PART_1', strand: 'algebra_calculus', topic_en: 'Logarithmic functions & coordinate geometry', topic_vi: 'Hàm số logarit kết hợp toạ độ', difficulty: 'advanced',
    pattern_en: 'A line through M(6;2) meets y = log_{√2} x at A and y = log_{1/2} x at B with M the midpoint of AB; find the distance from O to the line.', original_answer: 'A' },
  { order: 11, label: 'I.11', part: 'PART_1', strand: 'algebra_calculus', topic_en: 'Limit of a recursive sequence', topic_vi: 'Giới hạn dãy số truy hồi', difficulty: 'application',
    pattern_en: 'u1 = 5, u_{n+1} = u_n + 3n + 2; find lim u_n / (2n^2 - 3n + 2) (find closed form, compare leading coefficients).', original_answer: 'B' },
  { order: 12, label: 'I.12', part: 'PART_1', strand: 'statistics_discrete', topic_en: 'Quartiles of grouped data', topic_vi: 'Tứ phân vị của mẫu số liệu ghép nhóm', difficulty: 'understanding',
    pattern_en: 'Frequency table of grouped data (5 classes of width 10); compute the first quartile Q1 with the grouped-data formula.', original_answer: 'D' },

  // ---------------- PHẦN II: 10 câu trả lời ngắn ----------------
  { order: 13, label: 'II.1', part: 'PART_2', strand: 'geometry_measurement', topic_en: 'Hyperbola (real-world signal location)', topic_vi: 'Hypebol (thực tế – định vị tín hiệu)', difficulty: 'application', real_world: true, has_figure: true,
    pattern_en: 'Distress signal reaches station A earlier than station B (100 km apart) by a given time; |MB - MA| = v·Δt gives a hyperbola; vessel is 40 km from line AB; find distance from midpoint K to the vessel (round to tenths).', original_answer: '58.3' },
  { order: 14, label: 'II.2', part: 'PART_2', strand: 'geometry_measurement', topic_en: 'Line parallel to a plane in a pyramid', topic_vi: 'Đường thẳng song song mặt phẳng trong hình chóp', difficulty: 'application',
    pattern_en: 'Pyramid S.ABCD with parallelogram base; G centroid of triangle ABC; E on SA with SE = (m/n)SA; GE ∥ (SCD); find m·n.', original_answer: '6' },
  { order: 15, label: 'II.3', part: 'PART_2', strand: 'statistics_discrete', topic_en: 'Counting numbers with a digit product', topic_vi: 'Tổ hợp – đếm số có tích các chữ số cho trước', difficulty: 'application',
    pattern_en: 'How many six-digit numbers have product of digits equal to 1400 (prime factorisation, distribute factors into digits, count permutations with repetition).', original_answer: '600' },
  { order: 16, label: 'II.4', part: 'PART_2', strand: 'algebra_calculus', topic_en: 'Linear programming', topic_vi: 'Hệ BPT bậc nhất hai ẩn – GTLN', difficulty: 'understanding',
    pattern_en: 'Non-negative x, y satisfying three linear inequalities; find the maximum of F = 50x - 30y over the feasible polygon (check vertices).', original_answer: '350' },
  { order: 17, label: 'II.5', part: 'PART_2', strand: 'algebra_calculus', topic_en: 'Common terms of two arithmetic progressions (real-world)', topic_vi: 'Số hạng chung của hai cấp số cộng (thực tế)', difficulty: 'advanced', real_world: true,
    pattern_en: '200 yellow cards 5, 8, 11, ... and 200 blue cards 3, 7, 11, ...; pairs dance when numbers match; count common terms (congruences mod 12).', original_answer: '50' },
  { order: 18, label: 'II.6', part: 'PART_2', strand: 'geometry_measurement', topic_en: 'Trigonometry – angle of view (real-world)', topic_vi: 'Lượng giác – góc nhìn camera (thực tế)', difficulty: 'application', real_world: true, has_figure: true,
    pattern_en: 'Two buildings 20 m apart with heights 24 m and 32 m; camera on the higher roof sees points A, B on the other building; find tan of the angle of view as a/b and a + b.', original_answer: '64' },
  { order: 19, label: 'II.7', part: 'PART_2', strand: 'algebra_calculus', topic_en: 'Continuity with parameters', topic_vi: 'Hàm số liên tục chứa tham số', difficulty: 'advanced',
    pattern_en: 'f(x) = (√(1+ax^2) - bx - 2)/(4x^3 - 3x + 1) for x ≠ 1/2 and c/2 at x = 1/2 (a, b, c integers); f continuous at 1/2 (denominator has double root) → find abc.', original_answer: '-36' },
  { order: 20, label: 'II.8', part: 'PART_2', strand: 'geometry_measurement', topic_en: 'Perpendicularity in space – cross-section area', topic_vi: 'Quan hệ vuông góc – diện tích thiết diện', difficulty: 'advanced',
    pattern_en: 'Pyramid S.ABCD with rhombus base side 2√3, SA = 2, SB = SC = SD = 2√3; plane through S perpendicular to AD meets AD, BC at M, N; area of triangle SMN (round to hundredths).', original_answer: '2.83' },
  { order: 21, label: 'II.9', part: 'PART_2', strand: 'algebra_calculus', topic_en: 'Logarithmic expressions with a condition', topic_vi: 'Biểu thức logarit có điều kiện', difficulty: 'advanced',
    pattern_en: 'a, b, c > 1 satisfy a logarithmic equation mixing log_{√a} b, log_b c, log_a (c^3/b); substitute p = log_b a, q = log_b c, solve the quadratic in 1/p and evaluate an expression.', original_answer: '2' },
  { order: 22, label: 'II.10', part: 'PART_2', strand: 'statistics_discrete', topic_en: 'Probability with geometric progressions', topic_vi: 'Xác suất – bộ ba lập cấp số nhân', difficulty: 'advanced',
    pattern_en: 'Choose a random 3-element subset of {1..90} with sum 91; P = probability the elements form a geometric progression; find 1/P.', original_answer: '161.25' },
];

/** Dạng toán bổ sung (chưa có trong đề 2025-2026) — giáo viên / học sinh chọn khi "Bổ sung dạng toán" */
export interface ExtraTopicOption {
  id: string;
  strand: MathStrand;
  name_vi: string;
  name_en: string;
  /** Gợi ý mức độ phù hợp nhất cho dạng này */
  preferred: CognitiveLevel;
}

export const EXTRA_TOPIC_OPTIONS: ExtraTopicOption[] = [
  { id: 'dirichlet', strand: 'statistics_discrete', name_vi: 'Nguyên lý Dirichlet (chuồng – thỏ) thực tế', name_en: 'Pigeonhole principle in a real-world context', preferred: 'advanced' },
  { id: 'invariant', strand: 'statistics_discrete', name_vi: 'Nguyên lý bất biến / đơn biến', name_en: 'Invariance principle and monovariants', preferred: 'advanced' },
  { id: 'extremal', strand: 'statistics_discrete', name_vi: 'Nguyên lý cực hạn', name_en: 'Extremal principle', preferred: 'advanced' },
  { id: 'number_theory', strand: 'statistics_discrete', name_vi: 'Số học: chia hết, đồng dư, ước – bội', name_en: 'Number theory: divisibility and congruences', preferred: 'application' },
  { id: 'binomial', strand: 'statistics_discrete', name_vi: 'Nhị thức Newton', name_en: 'Binomial theorem', preferred: 'application' },
  { id: 'stat_variance', strand: 'statistics_discrete', name_vi: 'Phương sai, độ lệch chuẩn, mốt mẫu ghép nhóm', name_en: 'Variance, standard deviation and mode of grouped data', preferred: 'understanding' },
  { id: 'cond_prob', strand: 'statistics_discrete', name_vi: 'Xác suất: biến cố hợp, giao, độc lập', name_en: 'Probability: union, intersection and independent events', preferred: 'application' },
  { id: 'geo_series', strand: 'algebra_calculus', name_vi: 'Cấp số nhân lùi vô hạn (thực tế)', name_en: 'Infinite geometric series (real-world)', preferred: 'application' },
  { id: 'exp_growth', strand: 'algebra_calculus', name_vi: 'Mô hình tăng trưởng mũ / lãi kép', name_en: 'Exponential growth / compound interest model', preferred: 'application' },
  { id: 'log_ineq_param', strand: 'algebra_calculus', name_vi: 'BPT mũ – logarit chứa tham số, đếm nghiệm nguyên', name_en: 'Parametric exponential/logarithmic inequalities with integer-solution count', preferred: 'advanced' },
  { id: 'trig_max', strand: 'algebra_calculus', name_vi: 'GTLN – GTNN biểu thức lượng giác', name_en: 'Maximum/minimum of trigonometric expressions', preferred: 'application' },
  { id: 'derivative', strand: 'algebra_calculus', name_vi: 'Đạo hàm – tiếp tuyến, ý nghĩa vật lí', name_en: 'Derivatives: tangent lines and physical meaning', preferred: 'application' },
  { id: 'inequality', strand: 'algebra_calculus', name_vi: 'Bất đẳng thức AM-GM / Cauchy-Schwarz, cực trị', name_en: 'AM-GM / Cauchy-Schwarz inequalities and optimisation', preferred: 'advanced' },
  { id: 'parabola_real', strand: 'geometry_measurement', name_vi: 'Parabol thực tế (cổng, ăng-ten chảo)', name_en: 'Real-world parabola (arch gate, satellite dish)', preferred: 'application' },
  { id: 'ellipse_real', strand: 'geometry_measurement', name_vi: 'Elip thực tế (cầu vòm, phòng thì thầm)', name_en: 'Real-world ellipse (arch bridge, whispering gallery)', preferred: 'application' },
  { id: 'distance_space', strand: 'geometry_measurement', name_vi: 'Khoảng cách trong không gian', name_en: 'Distances in space (point–plane, skew lines)', preferred: 'advanced' },
  { id: 'angle_space', strand: 'geometry_measurement', name_vi: 'Góc giữa đường thẳng và mặt phẳng / nhị diện', name_en: 'Angle between a line and a plane / dihedral angle', preferred: 'application' },
  { id: 'vector_plane', strand: 'geometry_measurement', name_vi: 'Vectơ trong mặt phẳng – tích vô hướng', name_en: 'Vectors in the plane – dot product', preferred: 'understanding' },
];

export type YearVariant = 'similar' | 'different' | 'extended';

export interface YearFolder {
  id: string;
  school_year: string;
  title: string;
  description: string;
  /** Đề gốc tham chiếu (null nếu là thư mục năm gốc) */
  reference?: { label: string; pdfUrl?: string; blueprint: BlueprintItem[] };
}

export const YEAR_FOLDER_2026_2027: YearFolder = {
  id: 'year-2026-2027',
  school_year: '2026-2027',
  title: 'Đề thi 2026 - 2027',
  description: 'Sinh đề mới dựa trên đề chính thức năm 2025 - 2026 (Code 901, Sở GD&ĐT Hải Phòng): 12 câu trắc nghiệm + 10 câu trả lời ngắn.',
  reference: {
    label: 'Đề chính thức 2025 - 2026 · Code 901',
    pdfUrl: '/de-thi/2025-2026/De_thi_Toan_Tieng_Anh_Code_901.pdf',
    blueprint: CODE_901_BLUEPRINT,
  },
};

export const YEAR_VARIANT_INFO: Record<YearVariant, { title: string; short: string; detail: string }> = {
  similar: {
    title: 'Tạo đề tương tự',
    short: 'Giữ nguyên dạng toán từng câu',
    detail: 'Mỗi câu giữ đúng dạng toán, chủ đề và mức độ của câu tương ứng trong đề 2025 - 2026; chỉ thay số liệu, tình huống và đáp án.',
  },
  different: {
    title: 'Tạo đề có dạng toán khác',
    short: 'Cùng ma trận, đổi dạng bài',
    detail: 'Giữ ma trận (phần, mạch kiến thức, mức độ của từng câu) nhưng mỗi câu dùng một dạng toán khác với câu gốc.',
  },
  extended: {
    title: 'Bổ sung dạng toán',
    short: 'Thêm dạng toán mới vào khung đề',
    detail: 'Chọn các dạng toán chưa có trong đề 2025 - 2026; AI thay vào các câu cùng mạch kiến thức, các câu còn lại làm tương tự đề gốc.',
  },
};

/**
 * Gán các dạng toán bổ sung vào khung đề: mỗi dạng thay một câu cùng mạch kiến thức,
 * ưu tiên câu có cùng mức độ, rồi đến câu Phần II. Trả về khung mới (đã đánh dấu câu bị thay).
 */
export const buildExtendedBlueprint = (
  extraTopics: Array<{ name_en: string; name_vi: string; strand?: MathStrand; preferred?: CognitiveLevel }>,
  base: BlueprintItem[] = CODE_901_BLUEPRINT,
): Array<BlueprintItem & { replacement?: { name_en: string; name_vi: string } }> => {
  const result: Array<BlueprintItem & { replacement?: { name_en: string; name_vi: string } }> = base.map((b) => ({ ...b }));
  const used = new Set<number>();
  for (const topic of extraTopics) {
    const candidates = result.filter((b) => !used.has(b.order) && (!topic.strand || b.strand === topic.strand));
    const pool = candidates.length > 0 ? candidates : result.filter((b) => !used.has(b.order));
    if (pool.length === 0) break;
    const score = (b: BlueprintItem) =>
      (topic.preferred && b.difficulty === topic.preferred ? 2 : 0) + (b.part === 'PART_2' ? 1 : 0);
    const pick = [...pool].sort((x, y) => score(y) - score(x) || y.order - x.order)[0];
    used.add(pick.order);
    const idx = result.findIndex((b) => b.order === pick.order);
    result[idx] = { ...result[idx], replacement: { name_en: topic.name_en, name_vi: topic.name_vi } };
  }
  return result;
};

/** Gợi ý thời gian làm bài (phút) */
export const DURATION_PRESETS = [15, 30, 45, 60, 90, 120, 150];
