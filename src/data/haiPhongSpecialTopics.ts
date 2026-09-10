import { MathStrand } from '../types';

export interface TopicGlossaryItem {
  term_en: string;
  term_vi: string;
  pronunciation?: string;
  definition: string;
  example?: string;
}

export interface OlympiadSpecialTopic {
  id: string;
  topic_number: number;
  title_vi: string;
  title_en: string;
  strand: MathStrand;
  exam_weight: string;
  summary: string;
  content_markdown: string;
  key_formulas: string[];
  glossary?: TopicGlossaryItem[];
  sample_problems?: {
    problem_en: string;
    problem_vi: string;
    solution_en: string;
    solution_vi: string;
    answer?: string;
  }[];
}

export const HAIPHONG_SPECIAL_TOPICS: OlympiadSpecialTopic[] = [
  {
    id: 'hp-topic-01',
    topic_number: 1,
    title_vi: 'Dãy Số & Giới Hạn Nâng Cao',
    title_en: 'Advanced Sequences, Recurrences & Limits',
    strand: 'algebra_calculus',
    exam_weight: 'Phần II: 2 câu VDC (Chiếm trọng số cao nhất)',
    summary: 'Tìm số hạng tổng quát của dãy truy hồi tuyến tính, phân tuyến tính; tính giới hạn bằng định lý kẹp và định lý Weierstrass dãy đơn điệu bị chặn.',
    key_formulas: [
      'Dãy truy hồi $u_{n+1} = au_n + b$: Điểm bất động $c = \\frac{b}{1-a}$, đặt $v_n = u_n - c \\implies v_n = v_1 a^{n-1}$',
      'Dãy phân tuyến tính $u_{n+1} = \\frac{au_n + b}{cu_n + d}$: Xét nghiệm $x_1, x_2$ của phương trình đặc trưng $cx^2 + (d-a)x - b = 0$',
      'Định lý kẹp: Nếu $a_n \\le u_n \\le b_n$ và $\\lim a_n = \\lim b_n = L \\implies \\lim u_n = L$',
      'Định lý Weierstrass: Mọi dãy đơn điệu tăng và bị chặn trên đều hội tụ'
    ],
    content_markdown: `### I. Phương pháp giải dãy số truy hồi VDC
1. **Dãy truy hồi tuyến tính cấp 1:** $u_{n+1} = a u_n + b$. Sử dụng điểm bất động $c = \\frac{b}{1-a}$, chuyển về cấp số nhân $u_n - c = a^{n-1}(u_1 - c)$.
2. **Dãy truy hồi phân tuyến tính:** $u_{n+1} = \\frac{a u_n + b}{c u_n + d}$. Xét phương trình đặc trưng tìm nghiệm $x_1, x_2$, xét tỉ số $\\frac{u_n - x_1}{u_n - x_2}$ tạo thành cấp số nhân.
3. **Giới hạn dãy số:** Áp dụng định lý Weierstrass (dãy tăng + bị chặn trên $\\implies$ có giới hạn $L$) rồi giải phương trình $L = f(L)$.`,
    glossary: [
      {
        term_en: 'recurrence relation',
        pronunciation: '/rɪˈkɜːrəns rɪˈleɪʃən/',
        term_vi: 'hệ thức truy hồi',
        definition: 'An equation that recursively defines a sequence; each term is expressed as a function of the preceding terms.',
        example: 'The sequence satisfies the fractional linear recurrence $u_{n+1} = \\frac{u_n + 1}{u_n + 3}$.'
      },
      {
        term_en: 'general term',
        pronunciation: '/ˈdʒɛnərəl tɜːrm/',
        term_vi: 'số hạng tổng quát (u_n)',
        definition: 'A formula giving the value of the n-th term of a sequence directly from its index n.',
        example: 'The general term of the geometric sequence is $u_n = u_1 \\cdot q^{n-1}$.'
      },
      {
        term_en: 'limit of sequence',
        pronunciation: '/ˈlɪmɪt əv ˈsiːkwəns/',
        term_vi: 'giới hạn của dãy số',
        definition: 'The value L that terms of sequence approach as index n tends to infinity: $\\lim_{n \\to \\infty} u_n = L$.',
        example: '$\\lim_{n \\to \\infty} \\frac{2n + 1}{n + 3} = 2$.'
      },
      {
        term_en: 'squeeze theorem',
        pronunciation: '/skwiːz ˈθɪərəm/',
        term_vi: 'định lý kẹp (Sandwich Theorem)',
        definition: 'If $a_n \\le u_n \\le b_n$ for all n and $\\lim a_n = \\lim b_n = L$, then $\\lim u_n = L$.',
        example: 'Since $-\\frac{1}{n} \\le \\frac{\\sin n}{n} \\le \\frac{1}{n}$, by the Squeeze Theorem $\\lim_{n \\to \\infty} \\frac{\\sin n}{n} = 0$.'
      },
      {
        term_en: 'Weierstrass theorem',
        pronunciation: '/ˈvaɪərʃtrɑːs ˈθɪərəm/',
        term_vi: 'định lý Weierstrass (đơn điệu & bị chặn)',
        definition: 'Every bounded monotonic sequence of real numbers is convergent.',
        example: 'A sequence that is monotonically increasing and bounded above by M converges to a finite limit $L \\le M$.'
      },
      {
        term_en: 'fixed point',
        pronunciation: '/fɪkst pɔɪnt/',
        term_vi: 'điểm bất động',
        definition: 'A real value c satisfying $f(c) = c$; used to construct auxiliary geometric sequences $v_n = u_n - c$.',
        example: 'For $u_{n+1} = a u_n + b$ with $a \\ne 1$, the fixed point is $c = \\frac{b}{1-a}$.'
      },
      {
        term_en: 'convergent sequence',
        pronunciation: '/kənˈvɜːrdʒənt ˈsiːkwəns/',
        term_vi: 'dãy số hội tụ',
        definition: 'A sequence whose terms approach a specific finite real number as n approaches infinity.',
        example: 'Sequence $u_n = \\frac{1}{2^n}$ is convergent with limit 0.'
      },
      {
        term_en: 'divergent sequence',
        pronunciation: '/daɪˈvɜːrdʒənt ˈsiːkwəns/',
        term_vi: 'dãy số phân kỳ',
        definition: 'A sequence that does not converge to any finite limit (tends to $\\pm \\infty$ or oscillates).',
        example: 'The sequence $u_n = (-1)^n$ oscillates and is divergent.'
      }
    ]
  },
  {
    id: 'hp-topic-02',
    topic_number: 2,
    title_vi: 'Hàm Số Mũ & Logarit Chứa Tham Số',
    title_en: 'Parametric Exponential & Logarithmic Equations',
    strand: 'algebra_calculus',
    exam_weight: 'Phần I: 1 câu VDC + Phần II: 1 câu VDC',
    summary: 'Phương trình, bất phương trình mũ và logarit chứa tham số m; số nghiệm nguyên; bài toán ứng dụng thực tế về lãi kép và tăng trưởng mũ.',
    key_formulas: [
      'Điều kiện xác định logarit: $\\log_a b$ xác định khi $0 < a \\ne 1$ và $b > 0$',
      'Đặt ẩn phụ $t = a^x > 0$ hoặc $t = \\log_a x$',
      'Biến đổi vi phân / khảo sát hàm đặc trưng $f(u) = f(v) \\iff u = v$',
      'Lãi kép và tăng trưởng mũ: $P_n = P_0 (1 + r)^n$'
    ],
    content_markdown: `### I. Trọng tâm bài toán tham số Mũ - Logarit
1. **Đổi biến số:** Đặt $t = a^x$ (điều kiện $t > 0$) hoặc $t = \\log_a x$ ($t \\in \\mathbb{R}$). Chuyển phương trình về bậc hai theo $t$, áp dụng định lý Viète và so sánh nghiệm với 0.
2. **Đếm số nghiệm nguyên:** Khảo sát hàm số hoặc cô lập tham số $m$, lập bảng biến thiên để xác định số nghiệm nguyên $x$.
3. **Bài toán thực tế:** Tính chu kỳ bán rã, bài toán tăng trưởng dân số, lãi suất ngân hàng.`,
    glossary: [
      {
        term_en: 'exponential function',
        pronunciation: '/ˌɛkspoʊˈnɛnʃəl ˈfʌŋkʃən/',
        term_vi: 'hàm số mũ',
        definition: 'A function of the form $f(x) = a^x$, where base $a > 0$ and $a \\ne 1$. Strictly increasing when $a > 1$.',
        example: '$f(x) = 2^x$ is strictly increasing across all real numbers $\\mathbb{R}$.'
      },
      {
        term_en: 'logarithmic function',
        pronunciation: '/ˌlɔːɡəˈrɪðmɪk ˈfʌŋkʃən/',
        term_vi: 'hàm số logarit',
        definition: 'The inverse function of exponentiation: $y = \\log_a x \\iff a^y = x$ for $x > 0, a > 0, a \\ne 1$.',
        example: '$\\log_2 16 = 4$ because $2^4 = 16$.'
      },
      {
        term_en: 'parameter',
        pronunciation: '/pəˈræmɪtər/',
        term_vi: 'tham số (m)',
        definition: 'A constant variable in an equation whose numerical value controls the number and nature of roots.',
        example: 'Find all integral values of parameter m such that the equation has exactly 3 distinct roots.'
      },
      {
        term_en: 'domain of definition',
        pronunciation: '/doʊˈmeɪn əv ˌdɛfəˈnɪʃən/',
        term_vi: 'tập xác định',
        definition: 'The complete set of input values x for which the mathematical expression is legitimate and non-zero.',
        example: 'The domain of $\\log_3(x^2 - 4)$ is $(-\\infty, -2) \\cup (2, +\\infty)$.'
      },
      {
        term_en: 'compound interest',
        pronunciation: '/ˈkɑːmpaʊnd ˈɪntrəst/',
        term_vi: 'lãi kép',
        definition: 'Interest calculated on the initial principal plus all previously accumulated interest: $A = P(1 + r)^n$.',
        example: 'An investment with annual compound interest rate $r = 7\\%$ doubles in approximately 10 years.'
      },
      {
        term_en: 'strictly monotonic',
        pronunciation: '/ˈstrɪktli ˌmɑːnəˈtɑːnɪk/',
        term_vi: 'đơn điệu ngặt (đồng biến/nghịch biến)',
        definition: 'A property of function where $f(u) = f(v) \\iff u = v$, enabling rapid solution of transcendental equations.',
        example: 'Since $f(t) = t + 3^t$ is strictly monotonic, $f(x^2) = f(2x) \\iff x^2 = 2x$.'
      }
    ]
  },
  {
    id: 'hp-topic-03',
    topic_number: 3,
    title_vi: 'Quy Hoạch Tuyến Tính & Hệ BPT Bậc Nhất Hai Ẩn',
    title_en: 'Linear Programming & Feasible Regions',
    strand: 'algebra_calculus',
    exam_weight: 'Phần I: 1 câu VD + Phần II: 1 câu VD (Bài toán thực tế)',
    summary: 'Biểu diễn hình học miền nghiệm đa giác của hệ BPT bậc nhất hai ẩn; định lý cực trị trên tập lồi; tối ưu hóa chi phí, nhân công, thời gian máy móc.',
    key_formulas: [
      'Miền nghiệm của hệ BPT bậc nhất hai ẩn là một đa giác lồi (hoặc miền không bị chặn)',
      'Hàm mục tiêu $F(x, y) = ax + by + c$ luôn đạt GTLN và GTNN tại các đỉnh (vertices) của miền nghiệm đa giác',
      'Bước 1: Lập hệ bất phương trình từ bài toán thực tế',
      'Bước 2: Tìm tọa độ tất cả các đỉnh giao điểm của miền nghiệm',
      'Bước 3: Tính giá trị hàm mục tiêu tại từng đỉnh và kết luận giá trị tối ưu'
    ],
    content_markdown: `### I. Quy trình giải bài toán Quy hoạch tuyến tính thực tế
1. **Gọi ẩn:** Đặt $x, y$ là số lượng sản phẩm/giờ máy móc với điều kiện $x, y \\ge 0$.
2. **Thiết lập hệ bất phương trình:** Chuyển đổi các giới hạn về thời gian, nhân lực, vốn đầu tư thành các bất phương trình bậc nhất $a_i x + b_i y \\le c_i$.
3. **Xác định các đỉnh của miền nghiệm:** Giải các hệ phương trình 2 ẩn để tìm tọa độ các giao điểm.
4. **Đánh giá hàm mục tiêu:** Thay tọa độ các đỉnh vào $F(x, y) = ax + by$ để tìm GTLN hoặc GTNN.`,
    glossary: [
      {
        term_en: 'linear programming',
        pronunciation: '/ˈlɪniər ˈproʊɡræmɪŋ/',
        term_vi: 'quy hoạch tuyến tính',
        definition: 'A mathematical optimization method for maximizing or minimizing a linear objective function under linear constraints.',
        example: 'Solving a linear programming model to maximize factory profit under warehouse and raw material limits.'
      },
      {
        term_en: 'feasible region',
        pronunciation: '/ˈfiːzəbəl ˈriːdʒən/',
        term_vi: 'miền nghiệm khả thi',
        definition: 'The set of all points $(x, y)$ in the Cartesian plane satisfying all simultaneous linear inequality constraints.',
        example: 'The feasible region formed by the constraints is a bounded convex polygon.'
      },
      {
        term_en: 'objective function',
        pronunciation: '/əbˈdʒɛktɪv ˈfʌŋkʃən/',
        term_vi: 'hàm mục tiêu',
        definition: 'The linear expression $F(x, y) = ax + by + c$ whose value must be optimized (maximized or minimized).',
        example: 'Maximize the objective profit function $F(x, y) = 40x + 50y$.'
      },
      {
        term_en: 'vertex / vertices',
        pronunciation: '/ˈvɜːrtɛks/',
        term_vi: 'đỉnh của miền nghiệm đa giác',
        definition: 'The corner intersection points of bounding constraint lines in the feasible region.',
        example: 'The optimal value of the linear objective function always occurs at one of the vertices of the feasible region.'
      },
      {
        term_en: 'linear constraint',
        pronunciation: '/ˈlɪniər kənˈstreɪnt/',
        term_vi: 'ràng buộc tuyến tính',
        definition: 'A condition on variables represented by a linear inequality such as $a x + b y \\le c$.',
        example: 'Machine time constraint: $2x + 3y \\le 120$ hours.'
      },
      {
        term_en: 'convex polygon',
        pronunciation: '/ˈkɑːnvɛks ˈpɑːliɡɑːn/',
        term_vi: 'đa giác lồi',
        definition: 'A polygon where every interior line segment between any two points lies completely within the interior.',
        example: 'The feasible region of a solvable system of linear inequalities is always a convex polygon.'
      }
    ]
  },
  {
    id: 'hp-topic-04',
    topic_number: 4,
    title_vi: 'Hàm Số Bậc Hai & Phương Trình Lượng Giác Nâng Cao',
    title_en: 'Quadratic Functions & Advanced Trigonometry',
    strand: 'algebra_calculus',
    exam_weight: 'Phần I: 2 câu TH + 1 câu VD',
    summary: 'Khảo sát và ứng dụng parabol thực tế; giá trị lớn nhất, nhỏ nhất của biểu thức lượng giác; giải phương trình lượng giác bằng biến đổi tích - tổng, đặt ẩn phụ.',
    key_formulas: [
      'Đỉnh parabol $y = ax^2 + bx + c$ có $x_0 = -\\frac{b}{2a}$, $y_0 = -\\frac{\\Delta}{4a}$',
      'Biến đổi biên độ: $-\\sqrt{a^2 + b^2} \\le a\\sin x + b\\cos x \\le \\sqrt{a^2 + b^2}$',
      'Công thức nhân ba: $\\sin 3x = 3\\sin x - 4\\sin^3 x$; $\\cos 3x = 4\\cos^3 x - 3\\cos x$'
    ],
    content_markdown: `### I. Kỹ năng trọng tâm
- **Parabol thực tế:** Cổng vòm parabol, quỹ đạo chuyển động ném xiên trong Vật lý. Gắn hệ trục tọa độ tại đỉnh hoặc chân vòm để lập phương trình $y = ax^2 + bx + c$.
- **Lượng giác:** Đưa phương trình về dạng tích hoặc phương trình thuần nhất bậc hai đối với $\\sin x$ và $\\cos x$.`,
    glossary: [
      {
        term_en: 'parabola',
        pronunciation: '/pəˈræbələ/',
        term_vi: 'đường parabol',
        definition: 'A symmetrical U-shaped plane curve that is the graph of a quadratic function $y = ax^2 + bx + c$.',
        example: 'The trajectory of water from a fountain models a downward-opening parabola.'
      },
      {
        term_en: 'vertex of parabola',
        pronunciation: '/ˈvɜːrtɛks əv pəˈræbələ/',
        term_vi: 'đỉnh parabol',
        definition: 'The maximum or minimum point of a parabola, with coordinates $I\\left(-\\frac{b}{2a}, -\\frac{\\Delta}{4a}\\right)$.',
        example: 'The maximum height of the parabolic arch occurs exactly at its vertex.'
      },
      {
        term_en: 'axis of symmetry',
        pronunciation: '/ˈæksɪs əv ˈsɪmɪtri/',
        term_vi: 'trục đối xứng',
        definition: 'The vertical line $x = -\\frac{b}{2a}$ that divides a parabola into two congruent, mirror halves.',
        example: 'Parabola $y = x^2 - 4x + 3$ has axis of symmetry $x = 2$.'
      },
      {
        term_en: 'amplitude',
        pronunciation: '/ˈæmplɪtuːd/',
        term_vi: 'biên độ dao động',
        definition: 'The maximum absolute value of a periodic trigonometric expression; for $a\\sin x + b\\cos x$, amplitude is $\\sqrt{a^2 + b^2}$.',
        example: 'The expression $3\\sin x - 4\\cos x$ has amplitude $\\sqrt{3^2 + 4^2} = 5$.'
      },
      {
        term_en: 'trigonometric identity',
        pronunciation: '/ˌtrɪɡənəˈmɛtrɪk aɪˈdɛntəti/',
        term_vi: 'hằng đẳng thức lượng giác',
        definition: 'An equation involving trigonometric functions that is true for every single value in its domain.',
        example: '$\\sin^2 x + \\cos^2 x = 1$ and $\\sin 2x = 2\\sin x \\cos x$.'
      },
      {
        term_en: 'auxiliary angle method',
        pronunciation: '/ɔːɡˈzɪliəri ˈæŋɡəl ˈmɛθəd/',
        term_vi: 'phương pháp góc phụ',
        definition: 'Dividing $a\\sin x + b\\cos x$ by $\\sqrt{a^2 + b^2}$ to transform it into $\\sqrt{a^2 + b^2}\\sin(x + \\alpha)$.',
        example: 'Solve $a\\sin x + b\\cos x = c$ by comparing $c^2$ with $a^2 + b^2$.'
      }
    ]
  },
  {
    id: 'hp-topic-05',
    topic_number: 5,
    title_vi: 'HHKG: Quan Hệ Song Song & Vuông Góc (Đến Đường Vuông Góc Mặt)',
    title_en: 'Solid Geometry: Parallelism & Perpendicularity',
    strand: 'geometry_measurement',
    exam_weight: 'Phần I: 2 câu + Phần II: 2 câu (Giới hạn đến đường thẳng ⊥ mặt phẳng)',
    summary: 'Chứng minh đường thẳng song song/vuông góc với mặt phẳng; xác định góc giữa đường thẳng và mặt phẳng; thiết diện vuông góc với đường thẳng; khoảng cách giữa hai đường thẳng chéo nhau.',
    key_formulas: [
      '$d \\perp (P) \\iff d \\perp a$ và $d \\perp b$ với $a, b \\subset (P)$ cắt nhau',
      'Định lý ba đường vuông góc: $d \\perp a \\iff d\' \\perp a$ (với $d\'$ là hình chiếu của $d$ lên mặt phẳng chứa $a$)',
      'Góc giữa đường thẳng $d$ và $(P)$ là góc giữa $d$ và hình chiếu vuông góc $d\'$ của nó lên $(P)$',
      'Khoảng cách giữa hai đường chéo nhau song song với hai mặt phẳng đáy: $d(a, b) = d((P), (Q))$'
    ],
    content_markdown: `### I. Giới hạn kiến thức theo quyết định Sở GD&ĐT Hải Phòng
- Phạm vi: Quan hệ song song và quan hệ vuông góc (đến hết bài đường thẳng vuông góc với mặt phẳng).
- Các dạng bài trọng tâm:
  1. Tìm thiết diện qua một điểm và vuông góc với một cạnh của hình chóp/lăng trụ.
  2. Tính sin/cos của góc giữa đường thẳng và mặt phẳng.
  3. Khoảng cách giữa 2 đường chéo nhau thuộc 2 đáy song song.`,
    glossary: [
      {
        term_en: 'perpendicularity',
        pronunciation: '/ˌpɜːrpənˈdɪkjələr/',
        term_vi: 'quan hệ vuông góc',
        definition: 'A line is perpendicular to a plane if and only if it is perpendicular to every line lying in that plane.',
        example: '$d \\perp (P) \\iff d \\perp a$ and $d \\perp b$ where a, b are two intersecting lines in (P).'
      },
      {
        term_en: 'skew lines',
        pronunciation: '/skjuː laɪnz/',
        term_vi: 'hai đường thẳng chéo nhau',
        definition: 'Two lines in 3-dimensional space that are neither intersecting nor parallel.',
        example: 'Opposite edges in a regular tetrahedron are skew lines.'
      },
      {
        term_en: 'orthogonal projection',
        pronunciation: '/ɔːrˈθɑːɡənəl prəˈdʒɛkʃən/',
        term_vi: 'hình chiếu vuông góc',
        definition: 'The perpendicular projection of a spatial geometric object onto a target reference plane.',
        example: 'Point H is the orthogonal projection of top vertex S onto the base plane (ABC).'
      },
      {
        term_en: 'cross-section',
        pronunciation: '/ˈkrɔːs ˌsɛkʃən/',
        term_vi: 'thiết diện',
        definition: 'The 2D plane geometric polygon produced when a 3D solid is sliced by a cutting plane.',
        example: 'Find the area of the triangular cross-section of the pyramid formed by plane $(\\alpha)$.'
      },
      {
        term_en: 'dihedral angle',
        pronunciation: '/daɪˈhiːdrəl ˈæŋɡəl/',
        term_vi: 'góc nhị diện (góc giữa hai mặt phẳng)',
        definition: 'The angle formed by two intersecting planes, measured perpendicular to their line of intersection.',
        example: 'Calculate the measure of the dihedral angle between lateral face (SAB) and base (ABC).'
      },
      {
        term_en: 'distance between skew lines',
        pronunciation: '/ˈdɪstəns bɪˈtwiːn skjuː laɪnz/',
        term_vi: 'khoảng cách giữa hai đường thẳng chéo nhau',
        definition: 'The length of the unique shortest line segment perpendicular to both skew lines.',
        example: 'Distance $d(a, b) = d(a, (Q))$ where plane (Q) contains line b and is parallel to line a.'
      }
    ]
  },
  {
    id: 'hp-topic-06',
    topic_number: 6,
    title_vi: 'Hình Học Giải Tích Oxy & Ba Đường Conic Thực Tế',
    title_en: 'Conic Sections in Real-World Contexts (Oxy)',
    strand: 'geometry_measurement',
    exam_weight: 'Phần I: 2 câu + Phần II: 1 câu VDC',
    summary: 'Phương trình chính tắc của Elip, Hypebol, Parabol; bài toán thực tế về cầu vòm elip, phòng thì thầm (whispering gallery), gương phản xạ parabol và chảo vệ tinh.',
    key_formulas: [
      'Elip: $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ với $c^2 = a^2 - b^2$, tiêu cự $2c$, độ dài trục lớn $2a$',
      'Hypebol: $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ với $c^2 = a^2 + b^2$, hai đường tiệm cận $y = \\pm \\frac{b}{a}x$',
      'Parabol: $y^2 = 2px$ hoặc $x^2 = 4py$, tiêu điểm $F(0, p)$, khoảng cách từ đỉnh đến tiêu điểm là $p$',
      'Tính chất quang học của Elip: Tia phát ra từ một tiêu điểm sẽ phản xạ đến tiêu điểm kia'
    ],
    content_markdown: `### I. Ba đường Conic trong đề thi Hải Phòng
Đề thi Hải Phòng luôn có các câu hỏi ứng dụng thực tế về đường conic:
1. **Cầu vòm nửa Elip:** Trục lớn $2a$ là chiều dài nhịp cầu, bán trục bé $b$ là chiều cao tối đa tại trung tâm. Tính chiều cao tại một vị trí cách tâm khoảng cách $x_0$.
2. **Phòng thì thầm (Whispering Gallery):** Hai người đứng tại hai tiêu điểm $F_1, F_2$ có thể thì thầm nghe thấy nhau. Chiều cao trần ở chính giữa là $b = \\sqrt{a^2 - c^2}$.
3. **Chảo parabol thu sóng:** Lập phương trình $x^2 = 4py$ từ bán kính miệng chảo và độ sâu, từ đó xác định vị trí đặt đầu thu tín hiệu tại tiêu điểm $F(0, p)$.`,
    glossary: [
      {
        term_en: 'conic section',
        pronunciation: '/ˈkɑːnɪk ˈsɛkʃən/',
        term_vi: 'đường conic',
        definition: 'Any curve formed by the intersection of the surface of a cone with a flat plane: ellipse, hyperbola, or parabola.',
        example: 'The eccentricity e classifies the conic: $e < 1$ (ellipse), $e = 1$ (parabola), $e > 1$ (hyperbola).'
      },
      {
        term_en: 'ellipse',
        pronunciation: '/ɪˈlɪps/',
        term_vi: 'đường elip',
        definition: 'The locus of points P where the sum of distances to two fixed foci is constant: $PF_1 + PF_2 = 2a$.',
        example: 'Standard equation: $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ where $c^2 = a^2 - b^2$.'
      },
      {
        term_en: 'hyperbola',
        pronunciation: '/haɪˈpɜːrbələ/',
        term_vi: 'đường hypebol',
        definition: 'The locus of points P where the absolute difference of distances to two fixed foci is constant: $|PF_1 - PF_2| = 2a$.',
        example: 'Standard equation: $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ with asymptotes $y = \\pm \\frac{b}{a}x$.'
      },
      {
        term_en: 'focal length / foci',
        pronunciation: '/ˈfoʊkəl lɛŋkθ/',
        term_vi: 'tiêu cự / tiêu điểm',
        definition: 'Foci are the fixed reference points $F_1, F_2$ inside a conic; the focal length is the distance $2c$ between them.',
        example: 'The distance between the two foci of the whispering gallery is $2c = 40$ meters.'
      },
      {
        term_en: 'whispering gallery',
        pronunciation: '/ˈwɪspərɪŋ ˈɡæləri/',
        term_vi: 'phòng thì thầm (ứng dụng tiêu điểm elip)',
        definition: 'An elliptical chamber where a whisper originating at one focus is reflected and clearly heard at the other focus.',
        example: 'Sound waves emitted at focus $F_1$ reflect off the elliptical ceiling directly to focus $F_2$.'
      },
      {
        term_en: 'asymptote',
        pronunciation: '/ˈæsɪmptoʊt/',
        term_vi: 'đường tiệm cận',
        definition: 'A straight line that a hyperbolic curve approaches infinitely closely without ever intersecting.',
        example: 'The hyperbola $\\frac{x^2}{9} - \\frac{y^2}{16} = 1$ has asymptotes $y = \\pm \\frac{4}{3}x$.'
      }
    ]
  },
  {
    id: 'hp-topic-07',
    topic_number: 7,
    title_vi: 'Hệ Thức Lượng Trong Tam Giác & Đo Đạc Thực Tế',
    title_en: 'Trigonometric Relations in Triangles & Practical Measurement',
    strand: 'geometry_measurement',
    exam_weight: 'Phần I: 1 câu TH + 1 câu VD',
    summary: 'Định lý sin, định lý cosin, công thức tính diện tích tam giác (Heron, bán kính đường tròn ngoại tiếp R, nội tiếp r); giải tam giác trong bài toán đo khoảng cách thực tế.',
    key_formulas: [
      'Định lý côsin: $a^2 = b^2 + c^2 - 2bc\\cos A$',
      'Định lý sin: $\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R$',
      'Diện tích tam giác: $S = \\frac{1}{2}ab\\sin C = \\frac{abc}{4R} = pr = \\sqrt{p(p-a)(p-b)(p-c)}$'
    ],
    content_markdown: `### I. Ứng dụng thực tế của Hệ thức lượng
- Đo chiều cao tháp/cột cờ không thể tiếp cận chân tháp bằng giác kế (2 góc ngắm).
- Đo khoảng cách giữa hai điểm qua hồ nước hoặc chướng ngại vật bằng định lý Cosin.`,
    glossary: [
      {
        term_en: 'Law of Cosines',
        pronunciation: '/lɔː əv ˈkoʊsaɪnz/',
        term_vi: 'định lý côsin',
        definition: 'A fundamental theorem relating the three sides of a triangle to the cosine of one of its angles: $a^2 = b^2 + c^2 - 2bc\\cos A$.',
        example: 'Apply the Law of Cosines to find the distance across an impassable lake.'
      },
      {
        term_en: 'Law of Sines',
        pronunciation: '/lɔː əv saɪnz/',
        term_vi: 'định lý sin',
        definition: 'The ratio of each side of a triangle to the sine of its opposite angle equals the diameter of circumcircle: $\\frac{a}{\\sin A} = 2R$.',
        example: 'Use the Law of Sines to compute circumradius R of the triangle.'
      },
      {
        term_en: 'Heron\'s formula',
        pronunciation: '/ˈhɛrənz ˈfɔːrmjələ/',
        term_vi: 'công thức Hê-rông (diện tích tam giác)',
        definition: 'Calculates the area of a triangle given all three side lengths and semi-perimeter p: $S = \\sqrt{p(p-a)(p-b)(p-c)}$.',
        example: 'For sides 5, 7, 8: semi-perimeter $p = 10$, so $S = \\sqrt{10(5)(3)(2)} = 10\\sqrt{3}$.'
      },
      {
        term_en: 'circumradius',
        pronunciation: '/ˈsɜːrkəmˌreɪdiəs/',
        term_vi: 'bán kính đường tròn ngoại tiếp (R)',
        definition: 'The radius of the unique circle passing through all three vertices of a triangle: $R = \\frac{abc}{4S}$.',
        example: 'In a right-angled triangle, the circumradius equals half the hypotenuse.'
      },
      {
        term_en: 'inradius',
        pronunciation: '/ˈɪnˌreɪdiəs/',
        term_vi: 'bán kính đường tròn nội tiếp (r)',
        definition: 'The radius of the inscribed circle tangent to all three sides of a triangle: $r = \\frac{S}{p}$.',
        example: 'The inradius of a triangle with area $S = 24$ and perimeter $2p = 24$ is $r = 2$.'
      },
      {
        term_en: 'theodolite',
        pronunciation: '/θiˈɑːdəlaɪt/',
        term_vi: 'giác kế / máy kinh vĩ',
        definition: 'A precision surveying instrument used for measuring angles in the horizontal and vertical planes.',
        example: 'Surveyors use a theodolite to measure the elevation angle to the summit of a mountain.'
      }
    ]
  },
  {
    id: 'hp-topic-08',
    topic_number: 8,
    title_vi: 'Nguyên Lý Dirichlet (Chuồng - Thỏ) Trong Hình Học & Số Học',
    title_en: 'Pigeonhole Principle in Geometry & Number Theory',
    strand: 'statistics_discrete',
    exam_weight: 'Phần II: 1 câu Vận dụng cao ("Thương hiệu" đề Hải Phòng)',
    summary: 'Nguyên lý Dirichlet cơ bản và mở rộng; kỹ thuật phân chia hình thành các ngăn chuồng (tam giác đều, lưới ô vuông); nguyên lý Dirichlet áp dụng cho tính chẵn lẻ và số dư.',
    key_formulas: [
      'Nguyên lý cơ bản: Nếu xếp $n+1$ con thỏ vào $n$ cái lồng thì luôn có ít nhất một lồng chứa từ 2 con thỏ trở lên',
      'Dạng mở rộng: Nếu xếp $nk + 1$ thỏ vào $n$ lồng thì tồn tại một lồng chứa ít nhất $k + 1$ thỏ',
      'Phân chia tam giác đều: Chia tam giác đều cạnh 1 thành $k^2$ tam giác nhỏ cạnh $1/k$. Đường kính tối đa mỗi tam giác nhỏ là $1/k$',
      'Lưới điểm nguyên: $n$ điểm nguyên trong không gian $d$ chiều có $2^d$ bộ tính chẵn lẻ. Nếu số điểm $\\ge 2^d + 1$, luôn có 2 điểm có trung điểm nguyên'
    ],
    content_markdown: `### I. Kỹ thuật "Tạo Chuồng" kinh điển trong các kỳ thi HSG
1. **Chia miền diện tích:**
   - Tam giác đều cạnh 1 chia thành $k^2$ tam giác con cạnh $1/k$. Chọn số điểm $N = k^2 + 1$.
   - Hình vuông đơn vị $1 \\times 1$ chia thành $k^2$ ô vuông nhỏ cạnh $1/k$. Khoảng cách lớn nhất giữa hai điểm trong cùng ô là $\\frac{\\sqrt{2}}{k}$.
2. **Xét số dư và tính chẵn lẻ:**
   - Trong không gian 2D: $(x, y) \\pmod 2$ có $2^2 = 4$ trạng thái $\\implies 5$ điểm nguyên chắc chắn có 2 điểm có trung điểm nguyên.
   - Trong không gian 3D: $(x, y, z) \\pmod 2$ có $2^3 = 8$ trạng thái $\\implies 9$ điểm nguyên chắc chắn có 2 điểm có trung điểm nguyên.`,
    glossary: [
      {
        term_en: 'Pigeonhole Principle',
        pronunciation: '/ˈpɪdʒɪnhoʊl ˈprɪnsəpəl/',
        term_vi: 'nguyên lý Dirichlet (nguyên lý chuồng - thỏ)',
        definition: 'If n items are placed into m pigeonholes with $n > m$, then at least one pigeonhole must contain more than one item.',
        example: 'By the Pigeonhole Principle, among 13 randomly selected individuals, at least two share the same birth month.'
      },
      {
        term_en: 'generalized Pigeonhole Principle',
        pronunciation: '/ˈdʒɛnərəlaɪzd .../',
        term_vi: 'nguyên lý Dirichlet mở rộng',
        definition: 'If n items are distributed into k containers, at least one container holds at least $\\lceil n/k \\rceil$ items.',
        example: 'If 50 pigeons inhabit 7 pigeonholes, at least one pigeonhole must contain $\\lceil 50/7 \\rceil = 8$ pigeons.'
      },
      {
        term_en: 'lattice point',
        pronunciation: '/ˈlætɪs pɔɪnt/',
        term_vi: 'điểm nguyên',
        definition: 'A point in Cartesian coordinate space whose coordinates are all integers: $(x, y) \\in \\mathbb{Z}^2$.',
        example: 'Among any 5 lattice points in the plane, at least one pair has an integer midpoint.'
      },
      {
        term_en: 'partition',
        pronunciation: '/pɑːrˈtɪʃən/',
        term_vi: 'sự phân hoạch',
        definition: 'A division of a geometric region or set into non-overlapping smaller cells whose union is the whole set.',
        example: 'Partitioning an equilateral triangle into 16 smaller equilateral triangles of side 1/4.'
      },
      {
        term_en: 'extremal principle',
        pronunciation: '/ɛkˈstriːməl ˈprɪnsəpəl/',
        term_vi: 'nguyên lý cực hạn',
        definition: 'A proof technique that focuses on the element with the maximum or minimum value in a finite discrete system.',
        example: 'Consider the pair of points achieving the strictly minimal Euclidean distance in the set.'
      }
    ]
  },
  {
    id: 'hp-topic-09',
    topic_number: 9,
    title_vi: 'Nguyên Lý Bất Biến & Đơn Biến (Invariants & Monovariants)',
    title_en: 'Invariance Principle & Monovariants',
    strand: 'statistics_discrete',
    exam_weight: 'Phần II: 1 câu Vận dụng cao',
    summary: 'Tìm đại lượng không đổi qua các phép biến đổi liên tiếp; bất biến tính chẵn lẻ, bất biến tô màu bàn cờ; nguyên lý đơn biến (đơn điệu tiến tới trạng thái dừng).',
    key_formulas: [
      'Bất biến Modulo 2: Thay $(a, b)$ bằng $|a - b|$ hoặc $a + b - 1$ giữ nguyên tính chẵn lẻ của tổng $\\pmod 2$',
      'Bất biến tô màu bàn cờ: Mỗi quân domino $1 \\times 2$ luôn phủ đúng 1 ô đen và 1 ô trắng',
      'Đại lượng đơn biến (Monovariant): Một đại lượng $M(S)$ có giá trị nguyên dương và giảm ngặt sau mỗi bước $\\implies$ quá trình bắt buộc phải dừng sau hữu hạn bước'
    ],
    content_markdown: `### I. Nhận diện bài toán Bất biến trong đề thi
- Bài toán biến đổi số trên bảng (xóa 2 số thay bằng 1 số).
- Bài toán trò chơi và lát gạch bàn cờ (tô màu xen kẽ).
- **Chiến lược:** Luôn tìm một biểu thức đại số $I(S)$ sao cho $I(S_{k+1}) \\equiv I(S_k) \\pmod m$.`,
    glossary: [
      {
        term_en: 'invariant',
        pronunciation: '/ɪnˈvɛriənt/',
        term_vi: 'đại lượng bất biến',
        definition: 'A property or numerical value of a mathematical system that remains strictly unchanged under allowable moves or transformations.',
        example: 'The parity of the sum of integers written on the board is an invariant modulo 2.'
      },
      {
        term_en: 'monovariant',
        pronunciation: '/ˌmɑːnəˈvɛriənt/',
        term_vi: 'đại lượng đơn biến (bán bất biến)',
        definition: 'A non-negative quantity that changes monotonically (strictly decreases or increases) after each operational step.',
        example: 'A strictly decreasing integer monovariant bounded below by 0 guarantees the algorithm must terminate.'
      },
      {
        term_en: 'parity',
        pronunciation: '/ˈpærəti/',
        term_vi: 'tính chẵn lẻ',
        definition: 'The fundamental mathematical property of an integer of being either even ($2k$) or odd ($2k+1$).',
        example: 'The parity of the sum of two odd numbers is always even.'
      },
      {
        term_en: 'congruence / modulo',
        pronunciation: '/ˈkɑːŋɡruəns/',
        term_vi: 'đồng dư thức / mô-đun',
        definition: '$a \\equiv b \\pmod m$ signifies that $m$ divides the difference $(a - b)$ with remainder 0.',
        example: '$17 \\equiv 5 \\pmod 6$ because $17 - 5 = 12$ is divisible by 6.'
      },
      {
        term_en: 'chessboard coloring',
        pronunciation: '/ˈtʃɛsbɔːrd ˈkʌlərɪŋ/',
        term_vi: 'phương pháp tô màu bàn cờ',
        definition: 'Assigning alternating colors (e.g., black and white) to grid cells to prove the impossibility of certain tiling configurations.',
        example: 'A $1 \\times 2$ domino always covers exactly one white square and one black square.'
      }
    ]
  },
  {
    id: 'hp-topic-10',
    topic_number: 10,
    title_vi: 'Tổ Hợp & Xác Suất Nâng Cao',
    title_en: 'Advanced Combinatorics & Probability',
    strand: 'statistics_discrete',
    exam_weight: 'Phần I: 1 câu + Phần II: 1 câu',
    summary: 'Quy tắc cộng, quy tắc nhân, hoán vị, chỉnh hợp, tổ hợp; bài toán đếm chữ số với điều kiện thứ tự; xác suất hình học và biến cố độc lập.',
    key_formulas: [
      'Số cách chọn $k$ phần tử từ $n$ phần tử không kể thứ tự: $C_n^k = \\frac{n!}{k!(n-k)!}$',
      'Đếm thứ tự tăng nghiêm ngặt: Mỗi tập con $k$ chữ số chỉ tạo được duy nhất 1 số có các chữ số tăng dần',
      'Xác suất cổ điển: $P(A) = \\frac{n(A)}{n(\\Omega)}$',
      'Công thức xác suất của biến cố đối: $P(\\bar{A}) = 1 - P(A)$'
    ],
    content_markdown: `### I. Phương pháp đếm tổ hợp nâng cao
- **Phương pháp vách ngăn (Stars and Bars):** Số nghiệm nguyên dương của phương trình $x_1 + x_2 + \\dots + x_k = n$ là $C_{n-1}^{k-1}$.
- **Đếm bằng phần bù:** Khi biến cố $A$ có quá nhiều trường hợp phức tạp, hãy đếm biến cố đối $\\bar{A}$.`,
    glossary: [
      {
        term_en: 'permutation',
        pronunciation: '/ˌpɜːrmjuˈteɪʃən/',
        term_vi: 'hoán vị / chỉnh hợp',
        definition: 'An ordered arrangement of elements chosen from a set: $P(n, k) = \\frac{n!}{(n - k)!}$.',
        example: 'The number of permutations of 5 students seated in a row is $5! = 120$.'
      },
      {
        term_en: 'combination',
        pronunciation: '/ˌkɑːmbɪˈneɪʃən/',
        term_vi: 'tổ hợp',
        definition: 'An unordered selection of k distinct items from a collection of n items: $C_n^k = \\binom{n}{k} = \\frac{n!}{k!(n - k)!}$.',
        example: 'Selecting 3 contestants out of 10 gives $\\binom{10}{3} = 120$ combinations.'
      },
      {
        term_en: 'sample space',
        pronunciation: '/ˈsæmpəl speɪs/',
        term_vi: 'không gian mẫu (\\Omega)',
        definition: 'The comprehensive set of all possible outcomes of a random probability experiment.',
        example: 'When tossing a fair coin twice, the sample space is $\\Omega = \\{HH, HT, TH, TT\\}$.'
      },
      {
        term_en: 'independent events',
        pronunciation: '/ˌɪndɪˈpɛndənt ɪˈvɛnts/',
        term_vi: 'các biến cố độc lập',
        definition: 'Two events A and B where the occurrence of A does not alter the probability of B: $P(A \\cap B) = P(A) \\cdot P(B)$.',
        example: 'Rolling an even number on a die and flipping heads on a coin are independent events.'
      },
      {
        term_en: 'complementary event',
        pronunciation: '/ˌkɑːmplɪˈmɛntəri ɪˈvɛnt/',
        term_vi: 'biến cố đối (\\bar{A})',
        definition: 'The event that occurs if and only if event A does not occur: $P(\\bar{A}) = 1 - P(A)$.',
        example: 'Getting at least one six when throwing 3 dice is easily calculated via its complement: $1 - (5/6)^3$.'
      },
      {
        term_en: 'stars and bars',
        pronunciation: '/stɑːrz ænd bɑːrz/',
        term_vi: 'phương pháp vách ngăn',
        definition: 'A visual combinatorial method used to count the number of non-negative integer solutions to $x_1 + x_2 + \\dots + x_k = n$.',
        example: 'The number of ways to distribute 10 identical candies among 3 children is $\\binom{10 + 3 - 1}{3 - 1} = \\binom{12}{2} = 66$.'
      }
    ]
  },
  {
    id: 'hp-topic-11',
    topic_number: 11,
    title_vi: 'Mẫu Số Liệu Ghép Nhóm & Thống Kê Đo Xu Thế Trung Tâm',
    title_en: 'Grouped Data Statistics & Measures of Central Tendency',
    strand: 'statistics_discrete',
    exam_weight: 'Phần I: 1 câu TH + Phần II: 1 câu VD (Chương trình mới GDPT 2018)',
    summary: 'Tính số trung bình, trung vị (Median), tứ phân vị (Quartiles: Q1, Q2, Q3) và Mốt (Mode) cho mẫu số liệu ghép nhóm theo chuẩn SGK lớp 11 mới.',
    key_formulas: [
      'Số trung bình: $\\bar{x} = \\frac{\\sum f_i c_i}{n}$ với $c_i$ là giá trị đại diện của nhóm $[u_i; u_{i+1})$',
      'Trung vị: $M_e = u_m + \\frac{\\frac{n}{2} - C}{n_m} \\cdot h$ với nhóm $[u_m; u_{m+1})$ là nhóm chứa trung vị, $C$ là tần số tích lũy nhóm trước, $h$ là độ dài nhóm',
      'Tứ phân vị thứ nhất $Q_1$: $Q_1 = u_p + \\frac{\\frac{n}{4} - C}{n_p} \\cdot h$',
      'Tứ phân vị thứ ba $Q_3$: $Q_3 = u_q + \\frac{\\frac{3n}{4} - C}{n_q} \\cdot h$',
      'Mốt: $M_o = u_k + \\frac{n_k - n_{k-1}}{(n_k - n_{k-1}) + (n_k - n_{k+1})} \\cdot h$'
    ],
    content_markdown: `### I. Lưu ý quan trọng khi làm bài thống kê ghép nhóm
1. **Giá trị đại diện:** $c_i = \\frac{u_i + u_{i+1}}{2}$.
2. **Xác định nhóm chứa trung vị hoặc tứ phân vị:** Lập cột tần số tích lũy $cf_i$ để xác định nhóm chứa vị trí $\\frac{n}{2}$ (cho $M_e$) hoặc $\\frac{n}{4}$ (cho $Q_1$).
3. **Độ chính xác:** Tính toán cẩn thận phần thập phân để điền đúng ở câu trả lời ngắn Phần II.`,
    glossary: [
      {
        term_en: 'grouped data',
        pronunciation: '/ɡruːpt ˈdeɪtə/',
        term_vi: 'mẫu số liệu ghép nhóm',
        definition: 'Continuous or discrete data organized into frequency classes or intervals $[u_i; u_{i+1})$ rather than individual values.',
        example: 'Height distribution of 100 students grouped into 5-cm intervals.'
      },
      {
        term_en: 'representative value',
        pronunciation: '/ˌrɛprɪˈzɛntətɪv ˈvæljuː/',
        term_vi: 'giá trị đại diện của nhóm (c_i)',
        definition: 'The midpoint of a class interval: $c_i = \\frac{u_i + u_{i+1}}{2}$.',
        example: 'The representative value of class interval $[20; 30)$ is $c_i = 25$.'
      },
      {
        term_en: 'median of grouped data',
        pronunciation: '/ˈmiːdiən əv ɡruːpt ˈdeɪtə/',
        term_vi: 'trung vị của mẫu ghép nhóm (M_e)',
        definition: 'The statistical value that divides the grouped dataset exactly in half ($50\\%$ above and $50\\%$ below).',
        example: '$M_e = u_m + \\frac{n/2 - C}{n_m} \\cdot h$ where $u_m$ is the lower class boundary of the median group.'
      },
      {
        term_en: 'quartiles',
        pronunciation: '/ˈkwɔːrtaɪlz/',
        term_vi: 'các tứ phân vị (Q1, Q2, Q3)',
        definition: 'Values that partition sorted numerical data into four equal quarters: $Q_1$ (25th percentile), $Q_2$ (median), $Q_3$ (75th percentile).',
        example: 'The first quartile $Q_1$ denotes that $25\\%$ of observations lie below this threshold.'
      },
      {
        term_en: 'mode of grouped data',
        pronunciation: '/moʊd əv ɡruːpt ˈdeɪtə/',
        term_vi: 'mốt của mẫu số liệu ghép nhóm (M_o)',
        definition: 'The value that occurs with greatest frequency density in a continuous grouped distribution.',
        example: 'Calculated using the modal interval containing highest absolute frequency.'
      },
      {
        term_en: 'standard deviation',
        pronunciation: '/ˈstændərd ˌdiːviˈeɪʃən/',
        term_vi: 'độ lệch chuẩn (s = \\sqrt{s^2})',
        definition: 'A measure of the dispersion or spread of values around the arithmetic mean; square root of sample variance.',
        example: 'A low standard deviation indicates that data points cluster tightly around the mean $\\bar{x}$.'
      }
    ]
  }
];

export const HAIPHONG_12_WEEK_ROADMAP = [
  {
    phase: 1,
    phase_name: 'Giai đoạn 1: Nền tảng & Hệ thống hóa (Tuần 1 - 3)',
    description: 'Củng cố toàn bộ kiến thức THCS + Toán 10, 11 theo ma trận; hệ thống hóa lý thuyết và công thức; làm quen thuật ngữ tiếng Anh.',
    weeks: [
      {
        week: 1,
        title: 'Tuần 1: Đại số & Hàm số (Hệ BPT bậc nhất hai ẩn, Hàm số bậc hai, Mũ & Logarit cơ bản)',
        tasks: [
          'Ôn lý thuyết miền nghiệm, vẽ đồ thị hàm bậc hai',
          'Học 30 thuật ngữ Tiếng Anh về Algebra & Functions',
          'Luyện 15 bài trắc nghiệm Thông hiểu - Vận dụng'
        ]
      },
      {
        week: 2,
        title: 'Tuần 2: Hình học phẳng & Conic (Hệ thức lượng tam giác, Oxy, 3 đường conic)',
        tasks: [
          'Học công thức Elip, Parabol, Hypebol và bài toán thực tế',
          'Học thuật ngữ Geometry & Measurement',
          'Luyện bài tập tính góc, khoảng cách, diện tích'
        ]
      },
      {
        week: 3,
        title: 'Tuần 3: Dãy số, Thống kê & Xác suất cơ bản',
        tasks: [
          'Cấp số cộng, cấp số nhân, công thức số liệu ghép nhóm',
          'Thuật ngữ Probability & Statistics',
          'Làm đề kiểm tra đánh giá giai đoạn 1 (45 phút)'
        ]
      }
    ]
  },
  {
    phase: 2,
    phase_name: 'Giai đoạn 2: Chuyên sâu Vận dụng cao theo mạch (Tuần 4 - 8)',
    description: 'Bồi dưỡng chuyên đề Vận dụng cao phân loại thí sinh giỏi theo đúng ma trận của Sở GD&ĐT Hải Phòng.',
    weeks: [
      {
        week: 4,
        title: 'Tuần 4: Chuyên đề Dãy số truy hồi & Giới hạn nâng cao (Phần II VDC)',
        tasks: [
          'Hệ thức truy hồi tuyến tính, phân tuyến tính, điểm bất động',
          'Định lý kẹp và định lý Weierstrass',
          'Giải 10 bài toán giới hạn mức VDC'
        ]
      },
      {
        week: 5,
        title: 'Tuần 5: Chuyên đề Mũ & Logarit chứa tham số',
        tasks: [
          'Bất phương trình logarit đếm số nghiệm nguyên',
          'Phương trình mũ tham số dùng định lý Viète',
          'Luyện dạng bài điền đáp án ngắn Phần II'
        ]
      },
      {
        week: 6,
        title: 'Tuần 6: Chuyên đề HHKG Song song & Vuông góc (Đến bài đường thẳng ⊥ mặt phẳng)',
        tasks: [
          'Chứng minh vuông góc, xác định góc giữa đường và mặt',
          'Thiết diện vuông góc của hình chóp',
          'Khoảng cách giữa hai đường thẳng chéo nhau'
        ]
      },
      {
        week: 7,
        title: 'Tuần 7: Chuyên đề Ứng dụng thực tế: Quy hoạch tuyến tính & Conic',
        tasks: [
          'Bài toán tối ưu chi phí xưởng sản xuất',
          'Cầu vòm elip, phòng thì thầm, chảo thu sóng parabol',
          'Luyện kỹ năng giải nhanh chính xác số thập phân'
        ]
      },
      {
        week: 8,
        title: 'Tuần 8: Chuyên đề Toán rời rạc: Nguyên lý Dirichlet & Bất biến',
        tasks: [
          'Kỹ thuật phân chia tam giác đều và ô lưới điểm nguyên',
          'Bất biến tính chẵn lẻ modulo 2 trên bảng số, lát domino',
          'Tài liệu Olympic quốc tế Yufei Zhao (MIT)'
        ]
      }
    ]
  },
  {
    phase: 3,
    phase_name: 'Giai đoạn 3: Tổng luyện đề thực chiến 90 phút (Tuần 9 - 12)',
    description: 'Luyện đề chuẩn 22 câu / 90 phút bấm giờ thi thực tế, rèn kỹ năng phân bổ thời gian và tránh sai sót.',
    weeks: [
      {
        week: 9,
        title: 'Tuần 9: Luyện Đề Thi Tham Khảo Hải Phòng (Code 136 & Đề các năm)',
        tasks: [
          'Làm đề bấm giờ 90 phút',
          'Chữa chi tiết, rà soát lỗ hổng từ vựng tiếng Anh'
        ]
      },
      {
        week: 10,
        title: 'Tuần 10: Luyện Đề Minh Họa Số 01 Chuẩn Ma Trận 2025',
        tasks: [
          'Thực hành 12 câu Phần I (mục tiêu 25 phút)',
          'Thực hành 10 câu Phần II (mục tiêu 55 phút, 10 phút kiểm tra)'
        ]
      },
      {
        week: 11,
        title: 'Tuần 11: Luyện Đề Minh Họa Số 02 Chuẩn Ma Trận 2025',
        tasks: [
          'Thi thử trực tuyến có giám sát tab switch',
          'Rèn kỹ năng tính nhẩm và kiểm tra kết quả Phần II'
        ]
      },
      {
        week: 12,
        title: 'Tuần 12: Tổng ôn chiến thuật & Tâm lý phòng thi',
        tasks: [
          'Học lại toàn bộ sổ tay lỗi sai (Mistake Notebook)',
          'Ôn nhanh từ điển thuật ngữ toán tiếng Anh',
          'Tự tin bước vào kỳ thi chính thức!'
        ]
      }
    ]
  }
];
