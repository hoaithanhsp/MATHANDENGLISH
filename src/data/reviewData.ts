/**
 * Mục Ôn Tập theo Cấu trúc Đề thi Chọn HSG TP Hải Phòng
 * (Ban hành kèm theo Quyết định của Sở GD&ĐT Hải Phòng năm 2025)
 * 
 * Cấu trúc: 22 câu trắc nghiệm / 90 phút / Thang điểm 10
 * - Phần I: 12 câu trắc nghiệm nhiều phương án lựa chọn
 * - Phần II: 10 câu trắc nghiệm trả lời ngắn
 * 
 * Tác giả: Trần Hoài Thanh — THPT Khúc Thừa Dụ, TP.Hải Phòng
 */

// ============================================================
// CẤU TRÚC MẠCH KIẾN THỨC
// ============================================================

export interface ReviewTopic {
  id: string;
  name_vi: string;
  name_en: string;
  description_vi: string;
  description_en: string;
  key_formulas: string[];       // LaTeX formulas
  exam_tips: string[];           // Mẹo thi
  sample_questions: ReviewQuestion[];
}

export interface ReviewQuestion {
  id: string;
  question_en: string;
  question_vi: string;
  difficulty: 'understanding' | 'application' | 'advanced';
  options?: string[];            // For Part I (MCQ)
  correct_answer: string;
  solution_en: string;
  solution_vi: string;
}

export interface ReviewStrand {
  id: string;
  strand_vi: string;
  strand_en: string;
  color: string;
  icon: string;
  part1_distribution: { understanding: number; application: number; advanced: number };
  part2_distribution: { understanding: number; application: number; advanced: number };
  total_questions: number;
  topics: ReviewTopic[];
}

// ============================================================
// 3 MẠCH KIẾN THỨC CHÍNH
// ============================================================

export const REVIEW_STRANDS: ReviewStrand[] = [
  // ============================
  // MẠCH 1: ĐẠI SỐ — GIẢI TÍCH
  // ============================
  {
    id: 'algebra_calculus',
    strand_vi: 'Đại số — Giải tích',
    strand_en: 'Algebra & Calculus',
    color: '#4F46E5',
    icon: '📐',
    part1_distribution: { understanding: 2, application: 2, advanced: 1 },
    part2_distribution: { understanding: 1, application: 1, advanced: 2 },
    total_questions: 9,
    topics: [
      {
        id: 'inequalities_2var',
        name_vi: 'Hệ bất phương trình bậc nhất hai ẩn',
        name_en: 'Systems of Linear Inequalities in Two Variables',
        description_vi: 'Giải và biểu diễn miền nghiệm của hệ bất phương trình bậc nhất hai ẩn trên mặt phẳng Oxy. Bài toán tối ưu tuyến tính.',
        description_en: 'Solve and graph the solution region of systems of linear inequalities in two variables on the Oxy plane. Linear programming problems.',
        key_formulas: [
          'ax + by \\leq c',
          '\\text{Miền nghiệm} = \\bigcap D_i',
          'f(x,y) = ax + by \\to \\max / \\min',
        ],
        exam_tips: [
          'Vẽ đường thẳng biên → xác định nửa mặt phẳng nghiệm',
          'Giá trị lớn nhất/nhỏ nhất đạt tại đỉnh của miền nghiệm',
          'Kiểm tra điểm gốc O(0,0) để xác định hướng bất đẳng thức',
        ],
        sample_questions: [
          {
            id: 'rev-alg-01',
            question_en: 'Find the maximum value of $P = 2x + 3y$ subject to the constraints: $x + y \\leq 5$, $x \\geq 0$, $y \\geq 0$, $2x + y \\leq 8$.',
            question_vi: 'Tìm giá trị lớn nhất của $P = 2x + 3y$ với điều kiện: $x + y \\leq 5$, $x \\geq 0$, $y \\geq 0$, $2x + y \\leq 8$.',
            difficulty: 'application',
            options: ['A. 15', 'B. 16', 'C. 14', 'D. 13'],
            correct_answer: 'A',
            solution_en: 'The feasible region has vertices at $(0,0)$, $(4,0)$, $(3,2)$, $(0,5)$. Evaluating $P$ at each: $P(0,5)=15$ is maximum.',
            solution_vi: 'Miền nghiệm có các đỉnh $(0,0)$, $(4,0)$, $(3,2)$, $(0,5)$. Tính $P$ tại mỗi đỉnh: $P(0,5)=15$ là giá trị lớn nhất.',
          },
        ],
      },
      {
        id: 'quadratic_functions',
        name_vi: 'Hàm số bậc hai',
        name_en: 'Quadratic Functions',
        description_vi: 'Đồ thị parabol, đỉnh, trục đối xứng, chiều biến thiên. Bài toán min/max hàm bậc hai.',
        description_en: 'Parabola graphs, vertex, axis of symmetry, monotonicity. Min/max problems for quadratic functions.',
        key_formulas: [
          'f(x) = ax^2 + bx + c',
          'x_{\\text{đỉnh}} = -\\frac{b}{2a}',
          '\\Delta = b^2 - 4ac',
          'y_{\\min/\\max} = -\\frac{\\Delta}{4a}',
        ],
        exam_tips: [
          'a > 0 → parabol mở lên → min tại đỉnh',
          'a < 0 → parabol mở xuống → max tại đỉnh',
          'Δ < 0 và a > 0 ⟹ f(x) > 0 ∀x',
        ],
        sample_questions: [
          {
            id: 'rev-alg-02',
            question_en: 'The quadratic function $f(x) = -x^2 + 4x + 5$ has a maximum value of:',
            question_vi: 'Hàm số bậc hai $f(x) = -x^2 + 4x + 5$ có giá trị lớn nhất bằng:',
            difficulty: 'understanding',
            options: ['A. 5', 'B. 9', 'C. 4', 'D. 8'],
            correct_answer: 'B',
            solution_en: 'Vertex at $x = -b/(2a) = -4/(-2) = 2$. $f(2) = -4 + 8 + 5 = 9$.',
            solution_vi: 'Đỉnh tại $x = -b/(2a) = 2$. $f(2) = -4 + 8 + 5 = 9$.',
          },
        ],
      },
      {
        id: 'trig_functions_equations',
        name_vi: 'Hàm số lượng giác, phương trình lượng giác',
        name_en: 'Trigonometric Functions & Equations',
        description_vi: 'Đồ thị, chu kỳ, biên độ các hàm sin, cos, tan. Phương trình lượng giác cơ bản và nâng cao.',
        description_en: 'Graphs, period, amplitude of sin, cos, tan functions. Basic and advanced trigonometric equations.',
        key_formulas: [
          '\\sin^2 x + \\cos^2 x = 1',
          '\\sin x = a \\Rightarrow x = (-1)^k \\arcsin a + k\\pi',
          '\\cos x = a \\Rightarrow x = \\pm \\arccos a + 2k\\pi',
          'a\\sin x + b\\cos x = \\sqrt{a^2+b^2}\\sin(x+\\varphi)',
        ],
        exam_tips: [
          'Biến đổi tổng → tích hoặc đặt t = tan(x/2)',
          'Kiểm tra điều kiện tồn tại khi chia cho cos/sin',
          'Nhớ công thức nhân đôi, hạ bậc khi gặp sin²x, cos²x',
        ],
        sample_questions: [
          {
            id: 'rev-alg-03',
            question_en: 'Solve the equation $2\\sin^2 x - 3\\sin x + 1 = 0$ for $x \\in [0, 2\\pi]$.',
            question_vi: 'Giải phương trình $2\\sin^2 x - 3\\sin x + 1 = 0$ với $x \\in [0, 2\\pi]$.',
            difficulty: 'application',
            correct_answer: 'x = π/6, 5π/6, π/2',
            solution_en: 'Let $t = \\sin x$: $2t^2 - 3t + 1 = 0 \\Rightarrow t = 1$ or $t = 1/2$. Thus $\\sin x = 1 \\Rightarrow x = \\pi/2$; $\\sin x = 1/2 \\Rightarrow x = \\pi/6$ or $x = 5\\pi/6$.',
            solution_vi: 'Đặt $t = \\sin x$: $2t^2 - 3t + 1 = 0 \\Rightarrow t = 1$ hoặc $t = 1/2$. Vậy $\\sin x = 1 \\Rightarrow x = \\pi/2$; $\\sin x = 1/2 \\Rightarrow x = \\pi/6$ hoặc $x = 5\\pi/6$.',
          },
        ],
      },
      {
        id: 'sequences_series',
        name_vi: 'Cấp số và dãy số',
        name_en: 'Sequences & Series (Arithmetic & Geometric Progressions)',
        description_vi: 'Cấp số cộng, cấp số nhân. Tổng n số hạng đầu. Dãy số truy hồi.',
        description_en: 'Arithmetic and geometric progressions. Sum of first n terms. Recursive sequences.',
        key_formulas: [
          'u_n = u_1 + (n-1)d \\quad \\text{(CSC)}',
          'S_n = \\frac{n(u_1 + u_n)}{2} \\quad \\text{(CSC)}',
          'u_n = u_1 \\cdot q^{n-1} \\quad \\text{(CSN)}',
          'S_n = u_1 \\cdot \\frac{q^n - 1}{q - 1} \\quad (q \\neq 1)',
        ],
        exam_tips: [
          'CSC: 3 số liên tiếp lập CSC ↔ 2b = a + c',
          'CSN: 3 số liên tiếp lập CSN ↔ b² = ac',
          'Dãy truy hồi → tìm quy luật bằng cách tính vài số hạng đầu',
        ],
        sample_questions: [
          {
            id: 'rev-alg-04',
            question_en: 'An arithmetic progression has $u_1 = 5$ and $u_{10} = 32$. Find $S_{10}$.',
            question_vi: 'Cấp số cộng có $u_1 = 5$ và $u_{10} = 32$. Tính $S_{10}$.',
            difficulty: 'understanding',
            options: ['A. 185', 'B. 175', 'C. 170', 'D. 160'],
            correct_answer: 'A',
            solution_en: '$S_{10} = \\frac{10(u_1 + u_{10})}{2} = \\frac{10 \\times 37}{2} = 185$.',
            solution_vi: '$S_{10} = \\frac{10(5 + 32)}{2} = \\frac{370}{2} = 185$.',
          },
        ],
      },
      {
        id: 'limits_continuity',
        name_vi: 'Giới hạn dãy số, giới hạn hàm số, hàm số liên tục',
        name_en: 'Limits of Sequences & Functions, Continuity',
        description_vi: 'Tính giới hạn dãy số, giới hạn hàm số. Tính liên tục, điểm gián đoạn. Định lý giá trị trung gian.',
        description_en: 'Computing limits of sequences and functions. Continuity, discontinuities. Intermediate Value Theorem.',
        key_formulas: [
          '\\lim_{x \\to a} \\frac{f(x)}{g(x)} \\quad \\text{(dạng 0/0)}',
          '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1',
          '\\lim_{x \\to \\infty} \\left(1 + \\frac{1}{x}\\right)^x = e',
        ],
        exam_tips: [
          'Dạng 0/0 → nhân liên hợp hoặc phân tích nhân tử',
          'Giới hạn vô cực → chia cho bậc cao nhất',
          'Hàm liên tục tại a ⟺ lim f(x) = f(a) khi x→a',
        ],
        sample_questions: [
          {
            id: 'rev-alg-05',
            question_en: 'Compute $\\lim_{x \\to 1} \\frac{x^2 - 1}{x - 1}$.',
            question_vi: 'Tính $\\lim_{x \\to 1} \\frac{x^2 - 1}{x - 1}$.',
            difficulty: 'understanding',
            options: ['A. 0', 'B. 1', 'C. 2', 'D. ∞'],
            correct_answer: 'C',
            solution_en: '$\\frac{x^2-1}{x-1} = \\frac{(x-1)(x+1)}{x-1} = x+1 \\to 2$ as $x \\to 1$.',
            solution_vi: '$\\frac{x^2-1}{x-1} = x+1 \\to 2$ khi $x \\to 1$.',
          },
        ],
      },
      {
        id: 'exp_log',
        name_vi: 'Hàm số mũ, hàm số logarit, phương trình mũ và logarit',
        name_en: 'Exponential & Logarithmic Functions and Equations',
        description_vi: 'Tính chất hàm mũ, hàm logarit. Phương trình, bất phương trình mũ và logarit.',
        description_en: 'Properties of exponential and logarithmic functions. Exponential and logarithmic equations and inequalities.',
        key_formulas: [
          'a^x = b \\Rightarrow x = \\log_a b',
          '\\log_a(xy) = \\log_a x + \\log_a y',
          '\\log_a \\frac{x}{y} = \\log_a x - \\log_a y',
          '\\log_a x^n = n \\cdot \\log_a x',
          '\\log_a b = \\frac{\\ln b}{\\ln a}',
        ],
        exam_tips: [
          'Đặt t = aˣ (t > 0) để đưa về phương trình đại số',
          'Điều kiện logarit: cơ số > 0, ≠ 1; biểu thức > 0',
          'log cùng cơ số → so sánh trực tiếp biểu thức',
        ],
        sample_questions: [
          {
            id: 'rev-alg-06',
            question_en: 'Solve the equation $2^{2x} - 5 \\cdot 2^x + 4 = 0$.',
            question_vi: 'Giải phương trình $2^{2x} - 5 \\cdot 2^x + 4 = 0$.',
            difficulty: 'application',
            correct_answer: 'x = 0 hoặc x = 2',
            solution_en: 'Let $t = 2^x > 0$: $t^2 - 5t + 4 = 0 \\Rightarrow t = 1$ or $t = 4$. So $2^x = 1 \\Rightarrow x = 0$ or $2^x = 4 \\Rightarrow x = 2$.',
            solution_vi: 'Đặt $t = 2^x > 0$: $t^2 - 5t + 4 = 0 \\Rightarrow t = 1$ hoặc $t = 4$. Vậy $x = 0$ hoặc $x = 2$.',
          },
        ],
      },
    ],
  },

  // ============================
  // MẠCH 2: HÌNH HỌC VÀ ĐO LƯỜNG
  // ============================
  {
    id: 'geometry_measurement',
    strand_vi: 'Hình học và Đo lường',
    strand_en: 'Geometry & Measurement',
    color: '#059669',
    icon: '📏',
    part1_distribution: { understanding: 2, application: 2, advanced: 1 },
    part2_distribution: { understanding: 1, application: 2, advanced: 1 },
    total_questions: 9,
    topics: [
      {
        id: 'triangle_ratios',
        name_vi: 'Hệ thức lượng trong tam giác',
        name_en: 'Trigonometric Ratios in Triangles',
        description_vi: 'Định lý sin, cosin, diện tích tam giác theo các yếu tố lượng giác. Giải tam giác.',
        description_en: 'Law of Sines, Law of Cosines, triangle area formulas. Solving triangles.',
        key_formulas: [
          '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R',
          'a^2 = b^2 + c^2 - 2bc\\cos A',
          'S = \\frac{1}{2}ab\\sin C',
        ],
        exam_tips: [
          'Biết 2 cạnh + góc kẹp → dùng định lý cos',
          'Biết 1 cạnh + 2 góc → dùng định lý sin',
          'Diện tích → dùng S = (1/2)ab.sinC hoặc Heron',
        ],
        sample_questions: [
          {
            id: 'rev-geo-01',
            question_en: 'In triangle ABC, $a = 7$, $b = 8$, $\\cos C = \\frac{1}{4}$. Find the area of triangle ABC.',
            question_vi: 'Trong tam giác ABC, $a = 7$, $b = 8$, $\\cos C = \\frac{1}{4}$. Tính diện tích tam giác ABC.',
            difficulty: 'application',
            correct_answer: '7√15',
            solution_en: '$\\sin C = \\sqrt{1 - 1/16} = \\frac{\\sqrt{15}}{4}$. $S = \\frac{1}{2} \\cdot 7 \\cdot 8 \\cdot \\frac{\\sqrt{15}}{4} = 7\\sqrt{15}$.',
            solution_vi: '$\\sin C = \\frac{\\sqrt{15}}{4}$. $S = \\frac{1}{2} \\cdot 7 \\cdot 8 \\cdot \\frac{\\sqrt{15}}{4} = 7\\sqrt{15}$.',
          },
        ],
      },
      {
        id: 'lines_circles_conics',
        name_vi: 'Phương trình đường thẳng, đường tròn, ba đường conic',
        name_en: 'Equations of Lines, Circles, and Conic Sections',
        description_vi: 'PT đường thẳng (tổng quát, tham số), đường tròn, Elip, Hyperbol, Parabol.',
        description_en: 'Line equations (general, parametric), circles, ellipse, hyperbola, parabola.',
        key_formulas: [
          'ax + by + c = 0 \\quad \\text{(đường thẳng)}',
          '(x-a)^2 + (y-b)^2 = R^2 \\quad \\text{(đường tròn)}',
          '\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 \\quad \\text{(Elip)}',
          '\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1 \\quad \\text{(Hyperbol)}',
          'y^2 = 2px \\quad \\text{(Parabol)}',
        ],
        exam_tips: [
          'Khoảng cách điểm → đường thẳng: d = |ax₀+by₀+c| / √(a²+b²)',
          'Tiếp tuyến đường tròn: khoảng cách tâm đến tiếp tuyến = R',
          'Conic: nhớ quan hệ a² = b² + c² (Elip) và c² = a² + b² (Hyperbol)',
        ],
        sample_questions: [
          {
            id: 'rev-geo-02',
            question_en: 'Find the equation of the circle passing through $A(1,2)$ with center $I(3,4)$.',
            question_vi: 'Tìm phương trình đường tròn đi qua $A(1,2)$ có tâm $I(3,4)$.',
            difficulty: 'understanding',
            options: ['A. $(x-3)^2+(y-4)^2=8$', 'B. $(x-3)^2+(y-4)^2=4$', 'C. $(x-1)^2+(y-2)^2=8$', 'D. $(x-3)^2+(y-4)^2=2\\sqrt{2}$'],
            correct_answer: 'A',
            solution_en: '$R = IA = \\sqrt{(3-1)^2+(4-2)^2} = \\sqrt{8}$. Circle: $(x-3)^2+(y-4)^2 = 8$.',
            solution_vi: '$R = IA = \\sqrt{4+4} = 2\\sqrt{2}$. Đường tròn: $(x-3)^2+(y-4)^2 = 8$.',
          },
        ],
      },
      {
        id: 'parallel_space',
        name_vi: 'Quan hệ song song trong không gian',
        name_en: 'Parallel Relations in Space',
        description_vi: 'Đường thẳng // đường thẳng, đường thẳng // mặt phẳng, mặt phẳng // mặt phẳng. Giao tuyến.',
        description_en: 'Line-line, line-plane, plane-plane parallelism. Intersections.',
        key_formulas: [
          'd \\parallel (\\alpha) \\Leftrightarrow d \\parallel d\' \\subset (\\alpha)',
          '(\\alpha) \\parallel (\\beta) \\Leftrightarrow \\exists a, b \\subset (\\alpha): a \\cap b = M,\\; a \\parallel (\\beta),\\; b \\parallel (\\beta)',
        ],
        exam_tips: [
          'Chứng minh // mp: tìm đường thẳng nằm trong mp mà song song',
          'Giao tuyến: dùng tính chất "2 mp // cắt mp thứ 3 → 2 giao tuyến //"',
          'Thiết diện: xác định giao tuyến từng cặp mặt phẳng',
        ],
        sample_questions: [
          {
            id: 'rev-geo-03',
            question_en: 'Given tetrahedron ABCD. Let M, N be midpoints of AB and CD respectively. Prove that MN is parallel to both planes (ACD) and (BCD).',
            question_vi: 'Cho tứ diện ABCD. Gọi M, N lần lượt là trung điểm AB và CD. Chứng minh MN song song với cả hai mặt phẳng (ACD) và (BCD).',
            difficulty: 'application',
            correct_answer: 'Chứng minh qua đường trung bình tam giác',
            solution_en: 'In triangle ABD, let P = midpoint BD. Then MP is midline of △ABD → MP // AD. Similarly in △BCD, NP is midline → NP // BC. Hence MN lies in plane (MNP) which is // to required planes.',
            solution_vi: 'Trong △ABD, gọi P là trung điểm BD. MP là đường trung bình △ABD → MP // AD. Tương tự NP // BC trong △BCD. Do đó MN nằm trong mp chứa đường // với các mp cần CM.',
          },
        ],
      },
      {
        id: 'perpendicular_space',
        name_vi: 'Quan hệ vuông góc trong không gian (đến bài đường thẳng vuông góc với mặt phẳng)',
        name_en: 'Perpendicular Relations in Space (up to line ⊥ plane)',
        description_vi: 'Đường thẳng vuông góc mặt phẳng, định lý 3 đường vuông góc, khoảng cách và góc.',
        description_en: 'Line perpendicular to plane, three-perpendicular theorem, distances and angles.',
        key_formulas: [
          'd \\perp (\\alpha) \\Leftrightarrow d \\perp a,\\; d \\perp b \\;(a \\cap b \\subset \\alpha)',
          '\\text{Định lý 3 đường vuông góc}',
          'd(M, (\\alpha)) = |MH| \\;\\text{với } H = \\text{hình chiếu}',
        ],
        exam_tips: [
          'Chứng minh ⊥ mp: tìm 2 đường thẳng cắt nhau trong mp mà đường thẳng vuông góc',
          'Góc giữa đường và mp = góc giữa đường và hình chiếu của nó',
          'Dùng tọa độ hóa khi hình có nhiều yếu tố vuông góc',
        ],
        sample_questions: [
          {
            id: 'rev-geo-04',
            question_en: 'Given a cube $ABCD.A\'B\'C\'D\'$ with edge $a$. Find the distance from point $A$ to the plane $(BDC\')$.',
            question_vi: 'Cho hình lập phương $ABCD.A\'B\'C\'D\'$ cạnh $a$. Tính khoảng cách từ $A$ đến mặt phẳng $(BDC\')$.',
            difficulty: 'advanced',
            correct_answer: 'a√3/3',
            solution_en: 'Using coordinates with $A=(0,0,0)$, the plane $(BDC\')$ has equation $x+y+z=a$. Distance = $\\frac{|0+0+0-a|}{\\sqrt{3}} = \\frac{a}{\\sqrt{3}} = \\frac{a\\sqrt{3}}{3}$.',
            solution_vi: 'Đặt hệ tọa độ $A=(0,0,0)$. Mặt phẳng $(BDC\')$: $x+y+z=a$. Khoảng cách = $\\frac{a}{\\sqrt{3}} = \\frac{a\\sqrt{3}}{3}$.',
          },
        ],
      },
    ],
  },

  // ============================
  // MẠCH 3: THỐNG KÊ, XÁC SUẤT, RỜI RẠC, SỐ HỌC
  // ============================
  {
    id: 'statistics_discrete',
    strand_vi: 'Thống kê, Xác suất, Rời rạc, Số học',
    strand_en: 'Statistics, Probability, Discrete Math & Number Theory',
    color: '#D97706',
    icon: '📊',
    part1_distribution: { understanding: 0, application: 1, advanced: 1 },
    part2_distribution: { understanding: 0, application: 1, advanced: 1 },
    total_questions: 4,
    topics: [
      {
        id: 'combinatorics_probability',
        name_vi: 'Tổ hợp, xác suất',
        name_en: 'Combinatorics & Probability',
        description_vi: 'Quy tắc đếm, hoán vị, chỉnh hợp, tổ hợp. Xác suất cổ điển, xác suất có điều kiện.',
        description_en: 'Counting principles, permutations, combinations. Classical and conditional probability.',
        key_formulas: [
          'P_n = n!',
          'A_n^k = \\frac{n!}{(n-k)!}',
          'C_n^k = \\binom{n}{k} = \\frac{n!}{k!(n-k)!}',
          'P(A) = \\frac{|A|}{|\\Omega|}',
          'P(A|B) = \\frac{P(A \\cap B)}{P(B)}',
        ],
        exam_tips: [
          'Phân biệt: có thứ tự → chỉnh hợp, không thứ tự → tổ hợp',
          'Xác suất phần bù: P(A) = 1 - P(not A)',
          'Bernoulli: P(X=k) = C(n,k) · pᵏ · (1-p)ⁿ⁻ᵏ',
        ],
        sample_questions: [
          {
            id: 'rev-stat-01',
            question_en: 'How many ways can 5 students be arranged in a row of 3 seats?',
            question_vi: 'Có bao nhiêu cách xếp 5 học sinh vào 3 ghế ngồi trên một hàng?',
            difficulty: 'application',
            options: ['A. 60', 'B. 120', 'C. 10', 'D. 15'],
            correct_answer: 'A',
            solution_en: '$A_5^3 = \\frac{5!}{2!} = 60$.',
            solution_vi: '$A_5^3 = \\frac{5!}{2!} = 60$.',
          },
        ],
      },
      {
        id: 'grouped_data_statistics',
        name_vi: 'Các số đặc trưng của mẫu số liệu ghép nhóm',
        name_en: 'Statistics: Measures of Grouped Data',
        description_vi: 'Trung bình, trung vị, tứ phân vị, phương sai, độ lệch chuẩn cho số liệu ghép nhóm.',
        description_en: 'Mean, median, quartiles, variance, standard deviation for grouped frequency data.',
        key_formulas: [
          '\\bar{x} = \\frac{\\sum f_i \\cdot x_i}{N}',
          'Me = L + \\frac{N/2 - F}{f_m} \\cdot h',
          'Q_1 = L + \\frac{N/4 - F}{f_m} \\cdot h',
          's^2 = \\frac{\\sum f_i(x_i - \\bar{x})^2}{N}',
        ],
        exam_tips: [
          'Xác định đúng lớp chứa trung vị (lớp có tần suất tích lũy ≥ N/2)',
          'Tứ phân vị Q₁, Q₃ tương tự trung vị nhưng dùng N/4 và 3N/4',
          'Đọc kỹ bảng tần số: phân biệt tần số và tần suất',
        ],
        sample_questions: [
          {
            id: 'rev-stat-02',
            question_en: 'Given grouped data with classes [10,20), [20,30), [30,40) having frequencies 5, 12, 8. Find the mean.',
            question_vi: 'Cho số liệu ghép nhóm: [10,20), [20,30), [30,40) có tần số lần lượt 5, 12, 8. Tính trung bình.',
            difficulty: 'application',
            correct_answer: '25.4',
            solution_en: 'Midpoints: 15, 25, 35. Mean = $(5×15 + 12×25 + 8×35)/(5+12+8) = (75+300+280)/25 = 655/25 = 26.2$.',
            solution_vi: 'Giá trị đại diện: 15, 25, 35. TB = $(75+300+280)/25 = 26.2$.',
          },
        ],
      },
      {
        id: 'dirichlet_invariance',
        name_vi: 'Bài toán thực tế: Nguyên lý Dirichlet, nguyên lý bất biến',
        name_en: 'Real-World Problems: Pigeonhole Principle, Invariance Principle',
        description_vi: 'Áp dụng nguyên lý Dirichlet, nguyên lý bất biến, đơn biến vào bài toán thực tế và số học.',
        description_en: 'Apply the Pigeonhole Principle, Invariance Principle, and Monovariants to real-world and number theory problems.',
        key_formulas: [
          '\\text{Nếu } n > k \\text{ vật vào } k \\text{ hộp → ∃ hộp chứa } \\geq 2 \\text{ vật}',
          '\\text{Bất biến: tìm đại lượng không đổi qua các phép biến đổi}',
          '\\text{Đơn biến: tìm đại lượng đơn điệu → chứng minh dừng/kết thúc}',
        ],
        exam_tips: [
          'Nguyên lý Dirichlet: xác định "chim bồ câu" và "chuồng"',
          'Bất biến: thử tính chẵn/lẻ, tổng, tích, đồng dư mod n',
          'Bài toán game/thuật toán → nghĩ về đơn biến (luôn tăng/giảm)',
        ],
        sample_questions: [
          {
            id: 'rev-stat-03',
            question_en: 'Prove that among any 13 people, at least 2 were born in the same month.',
            question_vi: 'Chứng minh rằng trong 13 người bất kỳ, có ít nhất 2 người sinh cùng tháng.',
            difficulty: 'application',
            correct_answer: 'Áp dụng nguyên lý Dirichlet',
            solution_en: 'There are 12 months (pigeonholes) and 13 people (pigeons). Since $13 > 12$, by the Pigeonhole Principle, at least 2 people share the same birth month.',
            solution_vi: 'Có 12 tháng (chuồng) và 13 người (chim). Vì $13 > 12$, theo nguyên lý Dirichlet, có ít nhất 2 người sinh cùng tháng.',
          },
        ],
      },
    ],
  },
];

// ============================================================
// TỔNG HỢP CẤU TRÚC ĐỀ THI
// ============================================================
export const EXAM_STRUCTURE = {
  total_questions: 22,
  duration_minutes: 90,
  scale: 10,
  parts: [
    {
      part: 'PART_1',
      name_vi: 'Phần I: Trắc nghiệm nhiều phương án lựa chọn',
      name_en: 'Part I: Multiple Choice Questions',
      question_count: 12,
      description: '12 câu trắc nghiệm 4 phương án A, B, C, D',
    },
    {
      part: 'PART_2',
      name_vi: 'Phần II: Trắc nghiệm trả lời ngắn',
      name_en: 'Part II: Short Answer Questions',
      question_count: 10,
      description: '10 câu trả lời ngắn (số, phân số, biểu thức)',
    },
  ],
  cognitive_levels: [
    { level: 'understanding', name_vi: 'Thông hiểu', name_en: 'Understanding', count: 6 },
    { level: 'application', name_vi: 'Vận dụng', name_en: 'Application', count: 9 },
    { level: 'advanced', name_vi: 'Vận dụng cao', name_en: 'Higher-order Thinking', count: 7 },
  ],
};
