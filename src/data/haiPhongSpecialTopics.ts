import { MathStrand } from '../types';

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
  sample_problems: {
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
    sample_problems: [
      {
        problem_en: 'Given a sequence $(u_n)$ with $u_1 = 2$ and recurrence $u_{n+1} = \\frac{u_n + 1}{u_n + 3}$ for all $n \\ge 1$. Evaluate $\\lim_{n \\to \\infty} u_n$.',
        problem_vi: 'Cho dãy số $(u_n)$ có $u_1 = 2$ và hệ thức truy hồi $u_{n+1} = \\frac{u_n+1}{u_n+3}$. Tính giới hạn của dãy số khi $n \\to \\infty$.',
        solution_en: 'The sequence is bounded below by 0 and decreasing, so it converges to $L \\ge 0$. Taking limits: $L = \\frac{L + 1}{L + 3} \\iff L^2 + 2L - 1 = 0 \\implies L = \\sqrt{2} - 1 \\approx 0.414$.',
        solution_vi: 'Dãy số dương, giảm và bị chặn dưới bởi 0 nên hội tụ về $L \\ge 0$. Giải phương trình $L = \\frac{L+1}{L+3} \\iff L^2 + 2L - 1 = 0 \\implies L = \\sqrt{2} - 1 \\approx 0.41$.',
        answer: '0.41 (hoặc \\sqrt{2}-1)'
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
    sample_problems: [
      {
        problem_en: 'Find the number of integral values of $m \\in [-10; 10]$ such that $\\log_2^2 x - (m + 2)\\log_2 x + 2m \\le 0$ has exactly 4 integer solutions for $x$.',
        problem_vi: 'Tìm số giá trị nguyên của tham số $m \\in [-10; 10]$ để bất phương trình có đúng 4 nghiệm nguyên $x$.',
        solution_en: 'Factoring yields $(\\log_2 x - 2)(\\log_2 x - m) \\le 0$. Examining intervals of $m$ reveals exactly 2 integer values of $m$.',
        solution_vi: 'Bất phương trình tương đương $(\\log_2 x - 2)(\\log_2 x - m) \\le 0$. Xét khoảng giá trị nguyên $x$ ta tìm được đúng 2 giá trị nguyên của $m$.',
        answer: '2'
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
    sample_problems: [
      {
        problem_en: 'A factory produces two products A and B. A needs 2h on machine 1, 1h on machine 2 (profit $40). B needs 1h on machine 1, 3h on machine 2 (profit $50). Machine 1 runs ≤ 80h/week, machine 2 ≤ 90h/week. What is the maximum weekly profit?',
        problem_vi: 'Xưởng sản xuất 2 sản phẩm A và B. Mỗi sp A cần 2h máy 1, 1h máy 2 (lãi 40$). Mỗi sp B cần 1h máy 1, 3h máy 2 (lãi 50$). Máy 1 chạy ≤ 80h/tuần, máy 2 ≤ 90h/tuần. Lợi nhuận tối đa hàng tuần là bao nhiêu?',
        solution_en: 'Vertices of feasible region: $(0, 0), (40, 0), (30, 20), (0, 30)$. Profit $F(30, 20) = 40(30) + 50(20) = $2200.',
        solution_vi: 'Các đỉnh của miền nghiệm: $(0; 0), (40; 0), (30; 20), (0; 30)$. Lợi nhuận tại $(30; 20)$ là $F = 40(30) + 50(20) = 2200$ USD.',
        answer: '2200'
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
    sample_problems: [
      {
        problem_en: 'Find the range of the function $y = 3\\sin(2x) - 4\\cos(2x) + 1$.',
        problem_vi: 'Tìm tập giá trị của hàm số $y = 3\\sin(2x) - 4\\cos(2x) + 1$.',
        solution_en: 'The amplitude is $\\sqrt{3^2 + 4^2} = 5$. Thus $-5 + 1 \\le y \\le 5 + 1 \\implies y \\in [-4; 6]$.',
        solution_vi: 'Biên độ hàm số là $\\sqrt{3^2 + 4^2} = 5$. Vậy $-5 + 1 \\le y \\le 5 + 1 \\implies [-4; 6]$.',
        answer: '[-4; 6]'
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
    sample_problems: [
      {
        problem_en: 'Pyramid $S.ABC$ with $SA \\perp (ABC), SA = 4$, $\\Delta ABC$ right-angled at $B$ with $AB = 3, BC = 4$. Find $\\sin$ of angle between $SC$ and $(SAB)$.',
        problem_vi: 'Hình chóp $S.ABC$ có $SA \\perp (ABC), SA = 4$, $\\Delta ABC$ vuông tại $B$ có $AB = 3, BC = 4$. Tính sin của góc giữa $SC$ và $(SAB)$.',
        solution_en: 'Since $BC \\perp AB$ and $BC \\perp SA$, $BC \\perp (SAB)$. Projection is $SB = 5$. $SC = \\sqrt{5^2 + 4^2} = \\sqrt{41}$. $\\sin = \\frac{BC}{SC} = \\frac{4}{\\sqrt{41}} \\approx 0.62$.',
        solution_vi: 'Vì $BC \\perp (SAB)$ nên hình chiếu của $SC$ lên $(SAB)$ là $SB = 5$. Cạnh huyền $SC = \\sqrt{41}$. Suy ra $\\sin = \\frac{4}{\\sqrt{41}} \\approx 0.62$.',
        answer: '0.62 (hoặc 4/\\sqrt{41})'
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
    sample_problems: [
      {
        problem_en: 'A whispering gallery has an elliptical ceiling with major axis 50m and distance between foci 40m. How high is the ceiling at the center?',
        problem_vi: 'Một phòng thì thầm có trần dạng elip trục lớn 50m và tiêu cự 40m. Chiều cao trần tại tâm phòng là bao nhiêu mét?',
        solution_en: 'Semi-major axis $a = 25$, semi-focal distance $c = 20$. Height is $b = \\sqrt{25^2 - 20^2} = \\sqrt{225} = 15$ meters.',
        solution_vi: 'Bán trục lớn $a = 25$m, bán tiêu cự $c = 20$m. Chiều cao trần tại tâm chính là $b = \\sqrt{25^2 - 20^2} = 15$ mét.',
        answer: '15'
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
    sample_problems: [
      {
        problem_en: 'In triangle $ABC$, sides are $a = 7, b = 8, c = 5$. Find the measure of angle $\\widehat{A}$.',
        problem_vi: 'Trong tam giác $ABC$, cho các cạnh $a = 7, b = 8, c = 5$. Tính số đo của góc $\\widehat{A}$.',
        solution_en: 'By Cosine Rule: $\\cos A = \\frac{8^2 + 5^2 - 7^2}{2 \\times 8 \\times 5} = \\frac{40}{80} = \\frac{1}{2} \\implies \\widehat{A} = 60^\\circ$.',
        solution_vi: 'Áp dụng định lý côsin: $\\cos A = \\frac{64 + 25 - 49}{80} = \\frac{1}{2} \\implies \\widehat{A} = 60^\\circ$.',
        answer: '60°'
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
    sample_problems: [
      {
        problem_en: 'What is the minimum number of points needed inside an equilateral triangle of side length 1 to ensure at least two points are at distance strictly less than 1/4?',
        problem_vi: 'Cần tối thiểu bao nhiêu điểm đặt trong tam giác đều cạnh 1 để chắc chắn có ít nhất 2 điểm cách nhau một khoảng nhỏ hơn 1/4?',
        solution_en: 'Divide into $4^2 = 16$ small equilateral triangles of side length $1/4$. By Pigeonhole, $16 + 1 = 17$ points are required.',
        solution_vi: 'Chia thành $4^2 = 16$ tam giác đều cạnh $1/4$. Theo Dirichlet, cần $16 + 1 = 17$ điểm.',
        answer: '17'
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
    sample_problems: [
      {
        problem_en: 'Numbers 1 to 2025 are on a board. Repeatedly replace two numbers a, b with |a - b| until 1 number remains. What is the parity of the final number (1 for odd, 0 for even)?',
        problem_vi: 'Trên bảng viết các số từ 1 đến 2025. Mỗi bước xóa a, b thay bằng |a-b| đến khi còn 1 số. Xác định tính chẵn lẻ của số cuối (1 nếu lẻ, 0 nếu chẵn)?',
        solution_en: 'Sum modulo 2 is invariant because $(a + b) - |a - b| = 2\\min(a, b) \\equiv 0 \\pmod 2$. The initial sum $S = 2025 \\times 1013$ is odd, so the final number is always odd. Enter 1.',
        solution_vi: 'Tính chẵn lẻ của tổng là bất biến modulo 2 vì độ giảm của tổng là $2\\min(a, b)$ chẵn. Tổng ban đầu $S = 2025 \\times 1013$ là số lẻ. Do đó số cuối cùng luôn là số lẻ. Nhập 1.',
        answer: '1'
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
    sample_problems: [
      {
        problem_en: 'How many 4-digit numbers formed from {1, 2, 3, 4, 5, 6} have digits in strictly increasing order?',
        problem_vi: 'Có bao nhiêu số tự nhiên 4 chữ số từ {1, 2, 3, 4, 5, 6} có các chữ số theo thứ tự tăng dần nghiêm ngặt?',
        solution_en: 'Any selection of 4 distinct digits can be arranged in strictly increasing order in only 1 way. Result: $C_6^4 = 15$.',
        solution_vi: 'Mỗi cách chọn 4 chữ số phân biệt chỉ xếp được duy nhất 1 số tăng dần. Số cách chọn là $C_6^4 = 15$.',
        answer: '15'
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
    sample_problems: [
      {
        problem_en: 'For grouped data with $n = 100$, group $[20; 30)$ contains $Q_1$ with frequency 25 and prior cumulative frequency 15. Find $Q_1$.',
        problem_vi: 'Mẫu ghép nhóm $n = 100$, nhóm chứa $Q_1$ là $[20; 30)$ có tần số 25, tích lũy trước đó là 15. Tính $Q_1$.',
        solution_en: '$Q_1 = 20 + \\frac{25 - 15}{25} \\times 10 = 20 + 4 = 24.0$.',
        solution_vi: '$Q_1 = 20 + \\frac{25 - 15}{25} \\cdot 10 = 24.0$.',
        answer: '24.0'
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
