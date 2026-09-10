import { VocabWord } from '../types';

export const OLYMPIAD_VOCABULARY: VocabWord[] = [
  // ==========================================
  // I. SỐ HỌC & RỜI RẠC (NUMBER THEORY & DISCRETE)
  // ==========================================
  {
    id: 'v-01',
    term_en: 'coprime',
    pronunciation: '/ˌkoʊˈpraɪm/',
    term_vi: 'nguyên tố cùng nhau',
    strand: 'statistics_discrete',
    definition: 'Two integers a and b are coprime if their greatest common divisor is 1, i.e., gcd(a, b) = 1.',
    example: '8 and 9 are coprime because gcd(8, 9) = 1.'
  },
  {
    id: 'v-02',
    term_en: 'relatively prime',
    pronunciation: '/ˈrɛlətɪvli praɪm/',
    term_vi: 'nguyên tố cùng nhau (tương đương coprime)',
    strand: 'statistics_discrete',
    definition: 'Having no common divisor other than 1.',
    example: '14 and 15 are relatively prime.'
  },
  {
    id: 'v-03',
    term_en: 'divisibility',
    pronunciation: '/dɪˌvɪzəˈbɪlɪti/',
    term_vi: 'tính chia hết',
    strand: 'statistics_discrete',
    definition: 'The capacity of a number to be divided by another without a remainder. Denoted by a | b (a divides b).',
    example: 'If a | b and a | c, then a | (b + c).'
  },
  {
    id: 'v-04',
    term_en: 'greatest common divisor (GCD)',
    pronunciation: '/ˈɡreɪtɪst ˈkɑmən dɪˈvaɪzər/',
    term_vi: 'ước chung lớn nhất (ƯCLN)',
    strand: 'statistics_discrete',
    definition: 'The largest positive integer that divides each of two or more integers.',
    example: 'gcd(24, 36) = 12.'
  },
  {
    id: 'v-05',
    term_en: 'least common multiple (LCM)',
    pronunciation: '/list ˈkɑmən ˈmʌltəpəl/',
    term_vi: 'bội chung nhỏ nhất (BCNN)',
    strand: 'statistics_discrete',
    definition: 'The smallest positive integer that is divisible by both numbers.',
    example: 'lcm(4, 6) = 12.'
  },
  {
    id: 'v-06',
    term_en: 'congruence',
    pronunciation: '/ˈkɑŋɡruəns/',
    term_vi: 'đồng dư thức',
    strand: 'statistics_discrete',
    definition: 'a ≡ b (mod m) means that m divides the difference (a - b).',
    example: '17 ≡ 5 (mod 6) because 6 divides (17 - 5) = 12.'
  },
  {
    id: 'v-07',
    term_en: 'modulo',
    pronunciation: '/ˈmɑdʒəˌloʊ/',
    term_vi: 'theo mô-đun (số dư)',
    strand: 'statistics_discrete',
    definition: 'Arithmetic operation producing the remainder of a division.',
    example: '25 mod 7 = 4.'
  },
  {
    id: 'v-08',
    term_en: 'Diophantine equation',
    pronunciation: '/ˌdaɪəˈfæntaɪn ɪˈkweɪʒən/',
    term_vi: 'phương trình Đi-ô-phăng (nghiệm nguyên)',
    strand: 'statistics_discrete',
    definition: 'A polynomial equation whose solutions are sought only in integers.',
    example: 'Find all integer solutions to x² - y² = 15.'
  },
  {
    id: 'v-09',
    term_en: 'Pigeonhole Principle',
    pronunciation: '/ˈpɪdʒənˌhoʊl ˈprɪnsəpəl/',
    term_vi: 'nguyên lý Dirichlet (nguyên lý lồng chim)',
    strand: 'statistics_discrete',
    definition: 'If n items are put into m containers with n > m, at least one container must contain more than one item.',
    example: 'Among 13 people, at least two were born in the same month.'
  },
  {
    id: 'v-10',
    term_en: 'invariant',
    pronunciation: '/ɪnˈvɛriənt/',
    term_vi: 'đại lượng bất biến',
    strand: 'statistics_discrete',
    definition: 'A property of a mathematical system that remains unchanged after operations or transformations.',
    example: 'The parity of the sum of numbers remains invariant under swapping operations.'
  },
  {
    id: 'v-11',
    term_en: 'permutation',
    pronunciation: '/ˌpɜrmjəˈteɪʃən/',
    term_vi: 'hoán vị / chỉnh hợp',
    strand: 'statistics_discrete',
    definition: 'An arrangement of objects in a specific ordered sequence. P(n, k) = n! / (n - k)!',
    example: 'Number of permutations of 5 students in a line is 5! = 120.'
  },
  {
    id: 'v-12',
    term_en: 'combination',
    pronunciation: '/ˌkɑmbəˈneɪʃən/',
    term_vi: 'tổ hợp',
    strand: 'statistics_discrete',
    definition: 'A selection of items from a collection, where the order of selection does not matter. C(n, k) = n! / (k!(n - k)!).',
    example: 'Choosing 3 players out of 10 gives C(10, 3) = 120.'
  },
  {
    id: 'v-13',
    term_en: 'Inclusion-Exclusion Principle',
    pronunciation: '/ɪnˈkluʒən ɪkˈskluʒən/',
    term_vi: 'nguyên lý bù trừ',
    strand: 'statistics_discrete',
    definition: '|A ∪ B| = |A| + |B| - |A ∩ B|.',
    example: 'Used to count the number of integers divisible by 3 or 5.'
  },
  {
    id: 'v-14',
    term_en: 'parity',
    pronunciation: '/ˈpærəti/',
    term_vi: 'tính chẵn lẻ',
    strand: 'statistics_discrete',
    definition: 'The property of an integer being even or odd.',
    example: 'The parity of the sum of two odd numbers is even.'
  },
  {
    id: 'v-15',
    term_en: 'composite number',
    pronunciation: '/kəmˈpɑzɪt ˈnʌmbər/',
    term_vi: 'hợp số',
    strand: 'statistics_discrete',
    definition: 'A positive integer greater than 1 that has a positive divisor other than 1 and itself.',
    example: '4, 6, 8, 9 are composite numbers.'
  },

  // ==========================================
  // II. HÌNH HỌC & ĐO LƯỜNG (GEOMETRY & MEASUREMENT)
  // ==========================================
  {
    id: 'v-16',
    term_en: 'collinear',
    pronunciation: '/koʊˈlɪniər/',
    term_vi: 'thẳng hàng',
    strand: 'geometry_measurement',
    definition: 'Points lying on the same straight line.',
    example: 'Points A, B, and C are collinear if area of triangle ABC = 0.'
  },
  {
    id: 'v-17',
    term_en: 'concurrent',
    pronunciation: '/kənˈkɜrənt/',
    term_vi: 'đồng quy (cùng cắt nhau tại 1 điểm)',
    strand: 'geometry_measurement',
    definition: 'Lines or curves that intersect at a single common point.',
    example: 'The three medians of any triangle are concurrent at the centroid.'
  },
  {
    id: 'v-18',
    term_en: 'centroid',
    pronunciation: '/ˈsɛntrɔɪd/',
    term_vi: 'trọng tâm tam giác',
    strand: 'geometry_measurement',
    definition: 'The intersection point of the three medians of a triangle, dividing each median in a 2:1 ratio.',
    example: 'G is the centroid, so AG = 2/3 * AM.'
  },
  {
    id: 'v-19',
    term_en: 'orthocenter',
    pronunciation: '/ˈɔrθəˌsɛntər/',
    term_vi: 'trực tâm tam giác (giao điểm 3 đường cao)',
    strand: 'geometry_measurement',
    definition: 'The point where the three altitudes of a triangle intersect.',
    example: 'In an acute triangle, the orthocenter lies inside the triangle.'
  },
  {
    id: 'v-20',
    term_en: 'circumcenter',
    pronunciation: '/ˈsɜrkəmˌsɛntər/',
    term_vi: 'tâm đường tròn ngoại tiếp',
    strand: 'geometry_measurement',
    definition: 'The center of the circle that passes through all three vertices of a triangle (intersection of perpendicular bisectors).',
    example: 'In a right triangle, the circumcenter is the midpoint of the hypotenuse.'
  },
  {
    id: 'v-21',
    term_en: 'incenter',
    pronunciation: '/ˈɪnˌsɛntər/',
    term_vi: 'tâm đường tròn nội tiếp',
    strand: 'geometry_measurement',
    definition: 'The center of the circle inscribed in a triangle (intersection of angle bisectors).',
    example: 'The distance from the incenter to all three sides is the inradius r.'
  },
  {
    id: 'v-22',
    term_en: 'cyclic quadrilateral',
    pronunciation: '/ˈsaɪklɪk ˌkwɑdrəˈlætərəl/',
    term_vi: 'tứ giác nội tiếp',
    strand: 'geometry_measurement',
    definition: 'A quadrilateral whose vertices all lie on a single circle. Opposite angles sum to 180°.',
    example: 'ABCD is cyclic implies ∠A + ∠C = 180°.'
  },
  {
    id: 'v-23',
    term_en: 'perpendicular bisector',
    pronunciation: '/ˌpɜrpənˈdɪkjələr baɪˈsɛktər/',
    term_vi: 'đường trung trực',
    strand: 'geometry_measurement',
    definition: 'A line perpendicular to a segment at its midpoint.',
    example: 'Any point on the perpendicular bisector of AB is equidistant from A and B.'
  },
  {
    id: 'v-24',
    term_en: 'tangent',
    pronunciation: '/ˈtændʒənt/',
    term_vi: 'tiếp tuyến / hàm tang',
    strand: 'geometry_measurement',
    definition: 'A straight line that touches a curve or circle at exactly one point without crossing it.',
    example: 'The radius drawn to the point of tangency is perpendicular to the tangent line.'
  },
  {
    id: 'v-25',
    term_en: 'secant',
    pronunciation: '/ˈsikənt/',
    term_vi: 'cát tuyến / hàm sec',
    strand: 'geometry_measurement',
    definition: 'A line that intersects a circle or curve at two points.',
    example: 'Secant line PQ intersects circle C at points P and Q.'
  },
  {
    id: 'v-26',
    term_en: 'conic section',
    pronunciation: '/ˈkɑnɪk ˈsɛkʃən/',
    term_vi: 'đường conic (elip, hypebol, parabol)',
    strand: 'geometry_measurement',
    definition: 'A curve obtained as the intersection of a cone with a plane.',
    example: 'The eccentricity e determines the conic: e < 1 (ellipse), e = 1 (parabola), e > 1 (hyperbola).'
  },
  {
    id: 'v-27',
    term_en: 'eccentricity',
    pronunciation: '/ˌɛksɛnˈtrɪsɪti/',
    term_vi: 'tâm sai',
    strand: 'geometry_measurement',
    definition: 'The ratio e = c / a describing the flatness of a conic section.',
    example: 'A circle is an ellipse with eccentricity e = 0.'
  },
  {
    id: 'v-28',
    term_en: 'asymptote',
    pronunciation: '/ˈæsɪmptoʊt/',
    term_vi: 'đường tiệm cận',
    strand: 'geometry_measurement',
    definition: 'A straight line that a curve approaches arbitrarily closely as it heads toward infinity.',
    example: 'The hyperbola x²/a² - y²/b² = 1 has asymptotes y = ±(b/a)x.'
  },
  {
    id: 'v-29',
    term_en: 'skew lines',
    pronunciation: '/skju laɪnz/',
    term_vi: 'hai đường thẳng chéo nhau trong không gian',
    strand: 'geometry_measurement',
    definition: 'Two lines in three-dimensional space that are neither parallel nor intersecting.',
    example: 'Opposite edges of a regular tetrahedron are skew lines.'
  },
  {
    id: 'v-30',
    term_en: 'dihedral angle',
    pronunciation: '/daɪˈhidrəl ˈæŋɡəl/',
    term_vi: 'góc nhị diện (góc giữa hai mặt phẳng)',
    strand: 'geometry_measurement',
    definition: 'The angle between two intersecting planes.',
    example: 'Calculate the dihedral angle between plane (SAB) and plane (ABC).'
  },

  // ==========================================
  // III. ĐẠI SỐ & GIẢI TÍCH (ALGEBRA & CALCULUS)
  // ==========================================
  {
    id: 'v-31',
    term_en: 'arithmetic progression (AP)',
    pronunciation: '/ˌærɪθˈmɛtɪk prəˈɡrɛʃən/',
    term_vi: 'cấp số cộng',
    strand: 'algebra_calculus',
    definition: 'A sequence of numbers such that the difference between the consecutive terms is constant (common difference d).',
    example: 'u_n = u_1 + (n - 1)d.'
  },
  {
    id: 'v-32',
    term_en: 'geometric progression (GP)',
    pronunciation: '/ˌdʒiəˈmɛtrɪk prəˈɡrɛʃən/',
    term_vi: 'cấp số nhân',
    strand: 'algebra_calculus',
    definition: 'A sequence where each term after the first is found by multiplying the previous one by a fixed number (common ratio q).',
    example: 'u_n = u_1 * q^(n - 1).'
  },
  {
    id: 'v-33',
    term_en: 'common difference',
    pronunciation: '/ˈkɑmən ˈdɪfərəns/',
    term_vi: 'công sai (cấp số cộng)',
    strand: 'algebra_calculus',
    definition: 'The difference between consecutive terms in an arithmetic progression, d = u_{n+1} - u_n.',
    example: 'In sequence 2, 5, 8, 11..., the common difference is d = 3.'
  },
  {
    id: 'v-34',
    term_en: 'common ratio',
    pronunciation: '/ˈkɑmən ˈreɪʃioʊ/',
    term_vi: 'công bội (cấp số nhân)',
    strand: 'algebra_calculus',
    definition: 'The ratio between consecutive terms in a geometric progression, q = u_{n+1} / u_n.',
    example: 'In sequence 3, 6, 12, 24..., the common ratio is q = 2.'
  },
  {
    id: 'v-35',
    term_en: 'continuous function',
    pronunciation: '/kənˈtɪnjuəs ˈfʌŋkʃən/',
    term_vi: 'hàm số liên tục',
    strand: 'algebra_calculus',
    definition: 'A function for which small changes in the input result in small changes in the output (lim_{x→x0} f(x) = f(x0)).',
    example: 'Polynomial and trigonometric functions are continuous on their domains.'
  },
  {
    id: 'v-36',
    term_en: 'limit',
    pronunciation: '/ˈlɪmɪt/',
    term_vi: 'giới hạn',
    strand: 'algebra_calculus',
    definition: 'The value that a function or sequence approaches as the input or index approaches some value.',
    example: 'lim_{x→0} (sin x / x) = 1.'
  },
  {
    id: 'v-37',
    term_en: 'monotonicity',
    pronunciation: '/ˌmɑnətəˈnɪsəti/',
    term_vi: 'tính đơn điệu (đồng biến / nghịch biến)',
    strand: 'algebra_calculus',
    definition: 'Property of a function that either never increases or never decreases.',
    example: 'Function f(x) = 2x + 1 is strictly increasing on R.'
  },
  {
    id: 'v-38',
    term_en: 'trigonometric identity',
    pronunciation: '/ˌtrɪɡənəˈmɛtrɪk aɪˈdɛntəti/',
    term_vi: 'hằng đẳng thức lượng giác',
    strand: 'algebra_calculus',
    definition: 'An equation involving trigonometric functions that is true for every value of the occurring variables.',
    example: 'sin²(x) + cos²(x) = 1.'
  },
  {
    id: 'v-39',
    term_en: 'domain',
    pronunciation: '/doʊˈmeɪn/',
    term_vi: 'tập xác định',
    strand: 'algebra_calculus',
    definition: 'The set of all possible inputs for a function.',
    example: 'The domain of f(x) = sqrt(x - 2) is [2, +∞).'
  },
  {
    id: 'v-40',
    term_en: 'range',
    pronunciation: '/reɪndʒ/',
    term_vi: 'tập giá trị',
    strand: 'algebra_calculus',
    definition: 'The set of all actual output values produced by a function.',
    example: 'The range of f(x) = sin(x) is [-1, 1].'
  },

  // ==========================================
  // IV. XÁC SUẤT & THỐNG KÊ (PROBABILITY & STATISTICS)
  // ==========================================
  {
    id: 'v-41',
    term_en: 'random variable',
    pronunciation: '/ˈrændəm ˈvɛriəbəl/',
    term_vi: 'biến ngẫu nhiên',
    strand: 'statistics_discrete',
    definition: 'A variable whose possible values are numerical outcomes of a random phenomenon.',
    example: 'Let X be the number of heads obtained in 3 coin tosses.'
  },
  {
    id: 'v-42',
    term_en: 'expected value',
    pronunciation: '/ɪkˈspɛktɪd ˈvælju/',
    term_vi: 'kỳ vọng toán học',
    strand: 'statistics_discrete',
    definition: 'The anticipated value for an investment or random experiment; weighted average E[X] = Σ x_i * p_i.',
    example: 'The expected value of a fair 6-sided die roll is 3.5.'
  },
  {
    id: 'v-43',
    term_en: 'variance',
    pronunciation: '/ˈvɛriəns/',
    term_vi: 'phương sai (s²)',
    strand: 'statistics_discrete',
    definition: 'The average of the squared differences from the Mean; measures dispersion.',
    example: 'Var(X) = E[X²] - (E[X])².'
  },
  {
    id: 'v-44',
    term_en: 'standard deviation',
    pronunciation: '/ˈstændərd ˌdiviˈeɪʃən/',
    term_vi: 'độ lệch chuẩn (s = √phương sai)',
    strand: 'statistics_discrete',
    definition: 'A measure of the amount of variation or dispersion of a set of values, equal to square root of variance.',
    example: 'A low standard deviation indicates that values are clustered close to the mean.'
  },
  {
    id: 'v-45',
    term_en: 'conditional probability',
    pronunciation: '/kənˈdɪʃənəl ˌprɑbəˈbɪlɪti/',
    term_vi: 'xác suất có điều kiện',
    strand: 'statistics_discrete',
    definition: 'Probability of an event occurring, given that another event has already occurred: P(A|B) = P(A ∩ B) / P(B).',
    example: 'P(Ace | Red card) = 2/26 = 1/13.'
  },
  // ==========================================
  // IV. THUẬT NGỮ CHUẨN MA TRẬN HẢI PHÒNG 2025
  // ==========================================
  {
    id: 'v-46',
    term_en: 'feasible region',
    pronunciation: '/ˈfiːzəbəl ˈriːdʒən/',
    term_vi: 'miền nghiệm (miền chấp nhận được)',
    strand: 'algebra_calculus',
    definition: 'The set of all possible points of an optimization problem that satisfy the problem constraints.',
    example: 'The vertices of the feasible region of the linear system are (0, 0), (40, 0), (30, 20), (0, 30).'
  },
  {
    id: 'v-47',
    term_en: 'linear programming',
    pronunciation: '/ˈlɪniər ˈproʊɡræmɪŋ/',
    term_vi: 'quy hoạch tuyến tính',
    strand: 'algebra_calculus',
    definition: 'A method to achieve the best outcome in a mathematical model whose requirements are represented by linear relationships.',
    example: 'Solve the linear programming problem to maximize weekly profit.'
  },
  {
    id: 'v-48',
    term_en: 'objective function',
    pronunciation: '/əbˈdʒɛktɪv ˈfʌŋkʃən/',
    term_vi: 'hàm mục tiêu',
    strand: 'algebra_calculus',
    definition: 'The real-valued function F(x, y) whose value is to be either minimized or maximized over the feasible region.',
    example: 'Maximize the objective profit function F(x, y) = 40x + 50y.'
  },
  {
    id: 'v-49',
    term_en: 'recurrence relation',
    pronunciation: '/rɪˈkɜːrəns rɪˈleɪʃən/',
    term_vi: 'hệ thức truy hồi',
    strand: 'algebra_calculus',
    definition: 'An equation that recursively defines a sequence; each term is given as a function of the preceding terms.',
    example: 'The sequence satisfies the recurrence u_{n+1} = (u_n + 1)/(u_n + 3).'
  },
  {
    id: 'v-50',
    term_en: 'squeeze theorem',
    pronunciation: '/skwiːz ˈθɪərəm/',
    term_vi: 'định lý kẹp (Sandwich Theorem)',
    strand: 'algebra_calculus',
    definition: 'If a_n ≤ u_n ≤ b_n for all n and lim a_n = lim b_n = L, then lim u_n = L.',
    example: 'Use the Squeeze Theorem to calculate the limit of the sequence.'
  },
  {
    id: 'v-51',
    term_en: 'conic sections',
    pronunciation: '/ˈkɑnɪk ˈsɛkʃənz/',
    term_vi: 'ba đường conic (elip, hypebol, parabol)',
    strand: 'geometry_measurement',
    definition: 'Curves obtained by the intersection of the surface of a cone with a plane: ellipse, parabola, and hyperbola.',
    example: 'The focal length of the ellipse is 2c.'
  },
  {
    id: 'v-52',
    term_en: 'whispering gallery',
    pronunciation: '/ˈwɪspərɪŋ ˈɡæləri/',
    term_vi: 'phòng thì thầm (ứng dụng tiêu điểm elip)',
    strand: 'geometry_measurement',
    definition: 'An elliptical room under which whispers at one focus can be heard clearly at the other focus due to reflection.',
    example: 'Sound waves originating at one focus of an ellipse reflect to the opposite focus.'
  },
  {
    id: 'v-53',
    term_en: 'cross-section',
    pronunciation: '/ˈkrɔːs ˌsɛkʃən/',
    term_vi: 'thiết diện',
    strand: 'geometry_measurement',
    definition: 'The intersection of a solid three-dimensional figure with a cutting plane.',
    example: 'Find the area of the cross-section of the pyramid formed by plane (P).'
  },
  {
    id: 'v-54',
    term_en: 'skew lines',
    pronunciation: '/skjuː laɪnz/',
    term_vi: 'hai đường thẳng chéo nhau trong không gian',
    strand: 'geometry_measurement',
    definition: 'Two lines in three-dimensional space that do not intersect and are not parallel.',
    example: 'Calculate the distance between two skew lines in the cube.'
  },
  {
    id: 'v-55',
    term_en: 'pigeonhole principle',
    pronunciation: '/ˈpɪdʒɪnhoʊl ˈprɪnsəpəl/',
    term_vi: 'nguyên lý Dirichlet (nguyên lý chuồng - thỏ)',
    strand: 'statistics_discrete',
    definition: 'If n items are put into m containers, and n > m, then at least one container must contain more than one item.',
    example: 'By the Pigeonhole Principle, among 17 points in an equilateral triangle of side 1, at least two are closer than 1/4.'
  },
  {
    id: 'v-56',
    term_en: 'invariant',
    pronunciation: '/ɪnˈvɛriənt/',
    term_vi: 'đại lượng bất biến',
    strand: 'statistics_discrete',
    definition: 'A quantity or property that remains unchanged when a specific sequence of operations is performed.',
    example: 'The parity of the sum of numbers on the board is an invariant.'
  },
  {
    id: 'v-57',
    term_en: 'monovariant',
    pronunciation: '/ˌmɑnəˈvɛriənt/',
    term_vi: 'đại lượng đơn biến (bán bất biến)',
    strand: 'statistics_discrete',
    definition: 'A quantity that changes monotonically (strictly increases or decreases) with each step, proving termination.',
    example: 'A positive integer monovariant that decreases strictly guarantees the process must terminate.'
  },
  {
    id: 'v-58',
    term_en: 'grouped data',
    pronunciation: '/ɡrupt ˈdeɪtə/',
    term_vi: 'mẫu số liệu ghép nhóm',
    strand: 'statistics_discrete',
    definition: 'Data that has been bundled together in categories or intervals rather than presented individually.',
    example: 'Calculate the median and quartiles of the grouped data distribution.'
  },
  {
    id: 'v-59',
    term_en: 'quartile',
    pronunciation: '/ˈkwɔːrtaɪl/',
    term_vi: 'tứ phân vị (Q1, Q2, Q3)',
    strand: 'statistics_discrete',
    definition: 'Values that divide a list of numbers into four equal parts: Q1 (25%), Q2/Median (50%), Q3 (75%).',
    example: 'The first quartile Q1 for the grouped data is 24.0.'
  },
  {
    id: 'v-60',
    term_en: 'mode of grouped data',
    pronunciation: '/moʊd əv ɡrupt ˈdeɪtə/',
    term_vi: 'mốt của mẫu số liệu ghép nhóm (Mo)',
    strand: 'statistics_discrete',
    definition: 'The estimated value that appears most frequently in a grouped dataset, calculated from the modal interval.',
    example: 'The modal group is [160; 165) with frequency 14.'
  }
];

