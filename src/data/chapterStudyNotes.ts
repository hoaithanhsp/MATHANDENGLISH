import { StudentStudyNote } from '../types';

/**
 * Study Notes tự động từ 25 Chương Học liệu Toán Tiếng Anh
 * Tác giả: Trần Hoài Thanh — THPT Khúc Thừa Dụ, TP.Hải Phòng
 */

export const CHAPTER_STUDY_NOTES: StudentStudyNote[] = [
  {
    id: 'chapter-note-01',
    student_id: 'system',
    topic: `Chapter 1: `,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `📖 Chapter 1: Sets & Functions

Chapter Overview

In this chapter, you will explore the fundamental concepts of sets and functions, which form the foundation of modern mathematics. You will learn how to describe and manipulate sets using various operations, understand the concept of relations between sets, and master the definition and properties of functions.

Why is this important? Sets and functions are the building blocks of mathematical thinking. They provide a precise language for describing collections of objects and relationships between them. These concepts appear throughout mathematics—from algebra and geometry to calculus and beyond—and are essential for solving real-world problems in computer science, economics, engineering, and data analysis.

Connection to real life: When you organize your music playlist by genre, you're using set operations. When your GPS calculates distance based on your location, it's using a function. When a company analyzes customer data to predict sales, they're applying functions to sets of information. Understanding these concepts gives you powerful tools for organizing, analyzing, and solving problems systematically.

📚 VOCABULARY - TỪ VỰNG

📚 KEY TERMS FOR THIS CHAPTER

LOGIC & PROPOSITIONS (MỆNH ĐỀ)

• proposition /ˌprɒpəˈzɪʃən/ (n): mệnh đề
Ex: A proposition is a statement that is either true or false.

• negation /nɪˈɡeɪʃən/ (n): phủ định
Ex: The negation of "x > 5" is "x ≤ 5".

• conditional /kənˈdɪʃənəl/ (adj/n): mệnh đề kéo theo
Ex: "If P then Q" is a conditional statement.

• converse /ˈkɒnvɜːrs/ (n): mệnh đề đảo
Ex: The converse of "If P then Q" is "If Q then P".

• biconditional /ˌbaɪkənˈdɪʃənəl/ (n): mệnh đề tương đương
Ex: "P if and only if Q" is a biconditional statement.

• necessary condition /ˈnesəsəri kənˈdɪʃən/ (n): điều kiện cần
Ex: Q is a necessary condition for P.

• sufficient condition /səˈfɪʃənt kənˈdɪʃən/ (n): điều kiện đủ
Ex: P is a sufficient condition for Q.

SETS (TẬP HỢP)

• set /set/ (n): tập hợp
Ex: A set is a collection of distinct objects.

• element /ˈelɪmənt/ (n): phần tử
Ex: The number 5 is an element of the set {1,3,5,7}.

• subset /ˈsʌbset/ (n): tập con
Ex: {1,2} is a subset of {1,2,3}.

• empty set /ˈempti set/ (n): tập rỗng
Ex: The empty set contains no elements.

• union /ˈjuːnjən/ (n): phép hợp, hợp
Ex: The union of A and B contains all elements from both sets.

• intersection /ˌɪntərˈsekʃən/ (n): phép giao, giao
Ex: The intersection contains elements common to both sets.

• difference /ˈdɪfərəns/ (n): phép hiệu, hiệu
Ex: A \\ B is the set difference of A and B.

• complement /ˈkɒmplɪmənt/ (n): phần bù
Ex: The complement of A contains all elements not in A.

• Venn diagram /ven ˈdaɪəɡræm/ (n): biểu đồ Ven
Ex: We use Venn diagrams to visualize set relationships.

NUMBER SETS (CÁC TẬP SỐ)

• natural number /ˈnætʃərəl ˈnʌmbər/ (n): số tự nhiên
Ex: Natural numbers are ℕ = {0, 1, 2, 3, ...}.

• integer /ˈɪntɪdʒər/ (n): số nguyên
Ex: Integers include positive and negative whole numbers.

• rational number /ˈræʃənəl ˈnʌmbər/ (n): số hữu tỉ
Ex: A rational number can be written as a/b where a and b are integers and b ≠ 0.`,
    glossary: [
      { term_en: 'PROPOSITIONS', term_vi: 'MỆNH ĐỀ', definition: 'PROPOSITIONS — MỆNH ĐỀ', example: '' },
      { term_en: 'SETS', term_vi: 'TẬP HỢP', definition: 'SETS — TẬP HỢP', example: '' },
      { term_en: 'NUMBER SETS', term_vi: 'CÁC TẬP SỐ', definition: 'NUMBER SETS — CÁC TẬP SỐ', example: '' },
      { term_en: 'FUNCTIONS', term_vi: 'HÀM SỐ', definition: 'FUNCTIONS — HÀM SỐ', example: '' },
      { term_en: 'Proposition', term_vi: 'Mệnh đề', definition: 'Proposition — Mệnh đề', example: '' },
      { term_en: 'IS a proposition', term_vi: 'TRUE, as the solution x = 1 is an integer', definition: 'IS a proposition — TRUE, as the solution x = 1 is an integer', example: '' },
      { term_en: 'NOT a proposition', term_vi: 'it\'s a question', definition: 'NOT a proposition — it\'s a question', example: '' },
      { term_en: 'FALSE', term_vi: 'SAI', definition: 'FALSE — SAI', example: '' }
    ],
  },
  {
    id: 'chapter-note-02',
    student_id: 'system',
    topic: `Chapter 2: Quadratic Functions`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `📖 Chapter 2: Quadratic Functions

Chapter Overview

In this chapter, you will explore quadratic functions, one of the most important and widely-used types of functions in mathematics. You will learn how to work with quadratic functions algebraically, visualize them graphically as parabolas, and understand their key properties such as vertex, axis of symmetry, and intervals of increase and decrease.

Why is this important? Quadratic functions model countless real-world phenomena. When you throw a ball, its trajectory follows a parabolic path described by a quadratic function. When engineers design bridges or architects plan curved structures, they use parabolas. When businesses analyze profit and revenue, quadratic functions help them find optimal prices. Understanding quadratic functions gives you powerful tools for solving optimization problems and modeling physical motion.

Connection to real life: The path of a basketball shot, the shape of satellite dishes, the design of suspension bridge cables, the trajectory of water from a fountain, the profit curve of a business—all of these follow quadratic patterns. When you understand quadratic functions, you can predict maximum heights, find optimal solutions, and analyze how changing one variable affects another in countless practical situations.

📚 VOCABULARY - TỪ VỰNG

📖 2.1 DEFINITION OF QUADRATIC FUNCTIONS

ĐỊNH NGHĨA HÀM SỐ BẬC HAI

A. Real-World Context | Bối cảnh thực tế

Situation | Tình huống:

Mr. Viet has a 20-meter wire mesh fence. He wants to use this fence to enclose three sides of a rectangular garden plot against a wall to grow vegetables.

Bác Việt có một tấm lưới hình chữ nhật dài 20 m. Bác muốn dùng tấm lưới này rào chắn ba mặt áp bên bờ tường của khu vườn nhà mình thành một mảnh đất hình chữ nhật để trồng rau.

Question | Câu hỏi: How far from the wall should the corner posts be placed so that the enclosed area is maximized?

Hỏi hai cột góc hàng rào cần phải cắm cách bờ tường bao xa để mảnh đất được rào chắn của bác có diện tích lớn nhất?

Let x meters (0 < x < 10) be the distance from the corner post to the wall. Then:

•  Width of the plot = x meters

•  Length of the plot = (20 - 2x) meters

•  Area S(x) = x(20 - 2x) = -2x² + 20x square meters

Gọi x mét (0 < x < 10) là khoảng cách từ điểm cắm cọc đến bờ tường. Khi đó:

•  Chiều rộng = x mét

•  Chiều dài = (20 - 2x) mét

•  Diện tích S(x) = x(20 - 2x) = -2x² + 20x mét vuông

This is an example of a quadratic function.

Đây là một ví dụ về hàm số bậc hai.

📌 WORKED EXAMPLE 1 | VÍ DỤ MẪU 1

Identify which of the following are quadratic functions. For those that are, determine the coefficients a, b, and c.

Xác định hàm số nào sau đây là hàm số bậc hai. Với những hàm số bậc hai, xác định các hệ số a, b, c.

a) y = x⁴ + 3x² + 2

b) y = 7

c) y = -3x² + 1

d) y = (x - 1)(2 - 3x)

Solution | Giải:

a) NOT a quadratic function because the highest power of x is 4, not 2.
KHÔNG phải hàm số bậc hai vì bậc cao nhất của x là 4, không phải 2.

b) NOT a quadratic function because there is no x² term (this is a constant function).
KHÔNG phải hàm số bậc hai vì không có số hạng x² (đây là hàm hằng).`,
    glossary: [
      { term_en: 'Let x meters', term_vi: '0 < x < 10', definition: 'Let x meters — 0 < x < 10', example: '' },
      { term_en: 'Area S', term_vi: 'x', definition: 'Area S — x', example: '' },
      { term_en: 'The height h', term_vi: 'meters', definition: 'The height h — meters', example: '' },
      { term_en: 'The vertex is at', term_vi: '-b/2a, -Δ/4a', definition: 'The vertex is at — -b/2a, -Δ/4a', example: '' },
      { term_en: 'Point A', term_vi: '0, 4', definition: 'Point A — 0, 4', example: '' },
      { term_en: 'Plot the vertex I', term_vi: '-0.5, 4.5', definition: 'Plot the vertex I — -0.5, 4.5', example: '' },
      { term_en: 'The function is increasing on', term_vi: '-∞, -1/2', definition: 'The function is increasing on — -∞, -1/2', example: '' },
      { term_en: 'The function is decreasing on', term_vi: '-1/2, +∞', definition: 'The function is decreasing on — -1/2, +∞', example: '' }
    ],
  },
  {
    id: 'chapter-note-03',
    student_id: 'system',
    topic: `Chapter 3: Systems of Linear Inequalities in Two Variables`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `📖 Chapter 3: Systems of Linear Inequalities in Two Variables

Chapter Overview

In this chapter, you will explore linear inequalities in two variables and systems of such inequalities. You will learn how to represent solution regions graphically on the coordinate plane, understand the concept of feasible regions, and apply these tools to solve real-world optimization problems in business, economics, and resource allocation.

Why is this important? Linear inequalities and their systems are fundamental tools in operations research, economics, and business management. When a company needs to decide how many products to manufacture given limited resources, when a farmer needs to plan crop allocation with budget constraints, or when a logistics company needs to optimize delivery routes—all these situations involve systems of linear inequalities. Understanding these concepts gives you the mathematical foundation for linear programming and optimization theory.

Connection to real life: Every business faces constraints: limited budget, limited warehouse space, minimum production requirements, maximum capacity. When a store owner decides how many of each product to stock to maximize profit while staying within budget, they're solving a system of linear inequalities. When you plan your study schedule with time constraints and minimum requirements for each subject, you're working with inequalities. These mathematical tools help us make optimal decisions under real-world constraints.

📚 VOCABULARY - TỪ VỰNG

📖 3.1 LINEAR INEQUALITIES IN TWO VARIABLES

BẤT PHƯƠNG TRÌNH BẬC NHẤT HAI ẨN

A. Real-World Context | Bối cảnh thực tế

Situation | Tình huống:

On International Children's Day (June 1st), a movie theater shows an animated film. Tickets are sold in two categories:

•  Type 1 (for children aged 6-13): 50,000 VND per ticket

•  Type 2 (for people over 13): 100,000 VND per ticket

The theater calculates that to avoid losses, the total ticket revenue must be at least 20 million VND.

Nhân ngày Quốc tế Thiếu nhi 1-6, một rạp chiếu phim phục vụ các khán giả một bộ phim hoạt hình. Vé được bán ra có hai loại :

•  Loại 1 (dành cho trẻ từ 6-13 tuổi) : 50.000 đồng/vé

•  Loại 2 (dành cho người trên 13 tuổi) : 100.000 đồng/vé

Người ta tính toán rằng, để không phải bù lỗ thì số tiền vé thu được ở rạp chiếu phim này phải đạt tối thiểu 20 triệu đồng.

Question | Câu hỏi : In which cases will the theater have to cover losses?

Hỏi số lượng vé bán được trong những trường hợp nào thì rạp chiếu phim phải bù lỗ ?

Let x be the number of Type 1 tickets sold and y be the number of Type 2 tickets sold.

Gọi x là số vé loại 1 bán được và y là số vé loại 2 bán được.

Total revenue (in thousand VND) = 50x + 100y

Tổng doanh thu (nghìn đồng) = 50x + 100y

To avoid losses: 50x + 100y ≥ 20,000

The theater will have losses when: 50x + 100y < 20,000

This is an example of a linear inequality in two variables.

Đây là một ví dụ về bất phương trình bậc nhất hai ẩn.

📌 WORKED EXAMPLE 1 | VÍ DỤ MẪU 1

Which of the following are linear inequalities in two variables?`,
    glossary: [
      { term_en: 'Total revenue', term_vi: 'in thousand VND', definition: 'Total revenue — in thousand VND', example: '' },
      { term_en: 'Check', term_vi: '3, 4', definition: 'Check — 3, 4', example: '' },
      { term_en: 'FALSE', term_vi: '5 is not greater than 5', definition: 'FALSE — 5 is not greater than 5', example: '' },
      { term_en: 'Only', term_vi: '3, 4', definition: 'Only — 3, 4', example: '' },
      { term_en: 'So there are infinitely many values of x', term_vi: 'all non-negative real numbers', definition: 'So there are infinitely many values of x — all non-negative real numbers', example: '' },
      { term_en: 'Choose the origin O', term_vi: '0, 0', definition: 'Choose the origin O — 0, 0', example: '' },
      { term_en: 'Substitute', term_vi: '0, 0', definition: 'Substitute — 0, 0', example: '' },
      { term_en: 'An wants to rent a car', term_vi: 'with driver', definition: 'An wants to rent a car — with driver', example: '' }
    ],
  },
  {
    id: 'chapter-note-04',
    student_id: 'system',
    topic: `Chapter 4: Trigonometric Functions _ Chương 4_ Hàm Số Lượng Giác`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 4: Trigonometric Functions | Chương 4: Hàm Số Lượng Giác

📖 Chapter Overview | Tổng Quan Chương

Trigonometric functions are among the most important functions in mathematics, with applications spanning physics, engineering, music, medicine, and astronomy. From modeling the motion of a pendulum to analyzing sound waves, from predicting tides to understanding alternating current in electrical circuits, trigonometric functions provide the mathematical foundation for describing periodic phenomena — patterns that repeat at regular intervals.

Hàm số lượng giác là một trong những hàm số quan trọng nhất trong toán học, với ứng dụng trải rộng từ vật lý, kỹ thuật, âm nhạc, y học đến thiên văn học. Từ việc mô hình hóa chuyển động của con lắc đến phân tích sóng âm, từ dự đoán thủy triều đến hiểu về dòng điện xoay chiều trong mạch điện, hàm số lượng giác cung cấp nền tảng toán học để mô tả các hiện tượng tuần hoàn — các mẫu lặp lại theo chu kỳ đều đặn.

In this chapter, we will:

•  Extend the concept of angles beyond the familiar 0° to 180° range to include directed angles and angles of any magnitude

•  Introduce the unit circle (trigonometric circle) as a powerful tool for defining trigonometric functions

•  Study the six trigonometric functions: sine, cosine, tangent, cotangent, secant, and cosecant

•  Explore fundamental properties: periodicity, symmetry, and boundedness

•  Master essential trigonometric identities and transformation formulas

•  Apply these concepts to solve real-world problems

Trong chương này, chúng ta sẽ :

•  Mở rộng khái niệm góc từ phạm vi quen thuộc 0° đến 180° để bao gồm góc có hướng và góc có độ lớn bất kỳ

•  Giới thiệu đường tròn đơn vị (đường tròn lượng giác) như một công cụ mạnh mẽ để định nghĩa hàm số lượng giác

•  Nghiên cứu sáu hàm số lượng giác : sin, cosin, tang, cotang, secant và cosecant

•  Khám phá các tính chất cơ bản: tính tuần hoàn, tính đối xứng và tính bị chặn

•  Thành thạo các đồng nhất thức lượng giác và công thức biến đổi cơ bản

•  Áp dụng các khái niệm này để giải quyết các bài toán thực tế

📚 Bilingual Vocabulary | Từ Vựng Song Ngữ

A. Angles and Measurement | Góc và Đo Lường

B. The Unit Circle | Đường Tròn Đơn Vị

C. Trigonometric Functions | Hàm Số Lượng Giác

D. Properties and Characteristics | Tính Chất và Đặc Điểm

E. Identities and Formulas | Đồng Nhất Thức và Công Thức

4.1 Angles and Angle Measurement | Góc và Đo Góc

💡 Definition: Directed Angle | Định Nghĩa: Góc Có Hướng

💡 Definition: Radian Measure | Định Nghĩa: Đo Góc Bằng Radian

📌 Worked Example 4.1: Converting Between Degrees and Radians

Problem | Đề bài : Convert the following angle measures:

a) Convert 135° to radians | Chuyển 135° sang radian

b) Convert 5π/6 radians to degrees | Chuyển 5π/6 radian sang độ

c) Find the arc length of a circle with radius 8 cm subtended by a central angle of π/3 radians | Tìm độ dài cung của đường tròn bán kính 8 cm chắn bởi góc ở tâm π/3 radian

Solution | Lời giải:

a) To convert from degrees to radians, multiply by π/180:

Để chuyển từ độ sang radian, nhân với π/180:`,
    glossary: [
      { term_en: 'Introduce the unit circle', term_vi: 'trigonometric circle', definition: 'Introduce the unit circle — trigonometric circle', example: '' },
      { term_en: 'Quadrant II', term_vi: 'between π/2 and π', definition: 'Quadrant II — between π/2 and π', example: '' },
      { term_en: 'Use the periodicity of sine', term_vi: 'period 2π', definition: 'Use the periodicity of sine — period 2π', example: '' },
      { term_en: 'Odd function', term_vi: 'symmetric about origin', definition: 'Odd function — symmetric about origin', example: '' },
      { term_en: 'Even function', term_vi: 'symmetric about y-axis', definition: 'Even function — symmetric about y-axis', example: '' },
      { term_en: 'The systolic', term_vi: 'maximum', definition: 'The systolic — maximum', example: '' },
      { term_en: 'Hg and the diastolic', term_vi: 'minimum', definition: 'Hg and the diastolic — minimum', example: '' },
      { term_en: 'Since P', term_vi: '0', definition: 'Since P — 0', example: '' }
    ],
  },
  {
    id: 'chapter-note-05',
    student_id: 'system',
    topic: `Chapter 5: Trigonometric Equations _ Chương 5_ Phương Trình Lượng Giác`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 5: Trigonometric Equations | Chương 5: Phương Trình Lượng Giác

📖 Chapter Overview | Tổng Quan Chương

Trigonometric equations are equations that involve trigonometric functions of unknown angles. Solving these equations is a fundamental skill in mathematics with far-reaching applications in physics, engineering, astronomy, and many other fields. From determining the optimal angle to launch a projectile to analyzing alternating current in electrical circuits, from predicting tidal patterns to modeling sound waves, trigonometric equations provide the mathematical tools to answer critical questions about periodic phenomena.

Phương trình lượng giác là các phương trình chứa các hàm số lượng giác của góc chưa biết. Giải các phương trình này là một kỹ năng cơ bản trong toán học với ứng dụng rộng rãi trong vật lý, kỹ thuật, thiên văn học và nhiều lĩnh vực khác. Từ việc xác định góc tối ưu để phóng một vật thể đến phân tích dòng điện xoay chiều trong mạch điện, từ dự đoán mẫu thủy triều đến mô hình hóa sóng âm, phương trình lượng giác cung cấp các công cụ toán học để trả lời các câu hỏi quan trọng về hiện tượng tuần hoàn.

In this chapter, we will:

•  Master the four basic trigonometric equations: sin x = m, cos x = m, tan x = m, and cot x = m

•  Learn to express solutions using general formulas with parameter k in mathbbZ

•  Understand the geometric interpretation of solutions on the unit circle

•  Apply algebraic techniques to reduce complex equations to basic forms

•  Solve trigonometric equations with conditions (finding solutions in specific intervals)

•  Use trigonometric equations to model and solve real-world problems

Trong chương này, chúng ta sẽ :

•  Thành thạo bốn phương trình lượng giác cơ bản: sin x = m, cos x = m, tan x = m và cot x = m

•  Học cách biểu diễn nghiệm bằng công thức tổng quát với tham số k in mathbbZ

•  Hiểu ý nghĩa hình học của nghiệm trên đường tròn lượng giác

•  Áp dụng kỹ thuật đại số để đưa phương trình phức tạp về dạng cơ bản

•  Giải phương trình lượng giác có điều kiện (tìm nghiệm trong khoảng cụ thể)

•  Sử dụng phương trình lượng giác để mô hình hóa và giải quyết các bài toán thực tế

📚 Bilingual Vocabulary | Từ Vựng Song Ngữ

A. Equations and Solutions | Phương Trình và Nghiệm

B. Solution Methods | Phương Pháp Giải

C. Interval Notation | Ký Hiệu Khoảng

D. Special Terms | Thuật Ngữ Đặc Biệt

5.1 Basic Trigonometric Equations | Phương Trình Lượng Giác Cơ Bản

💡 Definition: Equivalent Equations | Định Nghĩa: Phương Trình Tương Đương

💡 The Equation sin x = m | Phương Trình sin x = m

📌 Worked Example 5.1: Solving sin x = m

Problem | Đề bài : Solve the following equations:

Giải các phương trình sau:

a) sin x = √3/2

b) sin x = -1/2

c) sin x = 2

Solution | Lời giải:

a) We need to find α in [-π/2, π/2] such that sin α = √3/2.

Ta cần tìm α in [-π/2, π/2] sao cho sin α = √3/2.

From the special angles table: α = π/3

Từ bảng các góc đặc biệt: α = π/3

Therefore: sin x = √3/2 Leftrightarrow begincases x = π/3 + k2π \\ x = π - π/3 + k2π = 2π/3 + k2π endcases   (k in mathbbZ)`,
    glossary: [
      { term_en: 'Solve trigonometric equations with conditions', term_vi: 'finding solutions in specific intervals', definition: 'Solve trigonometric equations with conditions — finding solutions in specific intervals', example: '' },
      { term_en: 'Combine solutions', term_vi: 'avoiding duplicates', definition: 'Combine solutions — avoiding duplicates', example: '' },
      { term_en: 'The horizontal range R', term_vi: 'distance traveled', definition: 'The horizontal range R — distance traveled', example: '' },
      { term_en: 'Find the launch angle', term_vi: 's', definition: 'Find the launch angle — s', example: '' },
      { term_en: 'The voltage in an AC circuit is given by V', term_vi: 't', definition: 'The voltage in an AC circuit is given by V — t', example: '' },
      { term_en: 'When V', term_vi: 't', definition: 'When V — t', example: '' },
      { term_en: 'Khi V', term_vi: 't', definition: 'Khi V — t', example: '' },
      { term_en: 'First three times', term_vi: 'in order', definition: 'First three times — in order', example: '' }
    ],
  },
  {
    id: 'chapter-note-06',
    student_id: 'system',
    topic: `Chapter 6: Sequences and Series _ Chương 6_ Dãy Số và Cấp Số`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 6: Sequences and Series | Chương 6: Dãy Số và Cấp Số

📖 Chapter Overview | Tổng Quan Chương

Sequences and series are fundamental concepts in mathematics that describe ordered lists of numbers and their sums. From modeling population growth to calculating loan payments, from analyzing compound interest to understanding the Fibonacci pattern in nature, sequences and series provide powerful tools for describing patterns and solving real-world problems.

Dãy số và cấp số là các khái niệm cơ bản trong toán học mô tả các danh sách có thứ tự của các số và tổng của chúng. Từ việc mô hình hóa tăng trưởng dân số đến tính toán các khoản thanh toán vay, từ phân tích lãi suất kép đến hiểu mẫu Fibonacci trong tự nhiên, dãy số và cấp số cung cấp các công cụ mạnh mẽ để mô tả các mẫu và giải quyết các vấn đề thực tế.

In this chapter, we will:

•  Understand the concept of sequences (finite and infinite)

•  Learn different ways to define sequences: explicit formulas and recursive formulas

•  Study arithmetic sequences (sequences with constant difference)

•  Study geometric sequences (sequences with constant ratio)

•  Master formulas for the nth term and sum of n terms

•  Apply sequences and series to solve practical problems in finance, science, and everyday life

Trong chương này, chúng ta sẽ :

•  Hiểu khái niệm về dãy số (hữu hạn và vô hạn)

•  Học các cách khác nhau để định nghĩa dãy số: công thức tổng quát và công thức truy hồi

•  Nghiên cứu cấp số cộng (dãy số có hiệu không đổi)

•  Nghiên cứu cấp số nhân (dãy số có tỉ số không đổi)

•  Thành thạo công thức cho số hạng thứ n và tổng n số hạng đầu

•  Áp dụng dãy số và cấp số để giải quyết các bài toán thực tế trong tài chính, khoa học và đời sống hàng ngày

📚 Bilingual Vocabulary | Từ Vựng Song Ngữ

A. Sequences | Dãy Số

B. Properties of Sequences | Tính Chất Dãy Số

C. Arithmetic Sequences | Cấp Số Cộng

D. Geometric Sequences | Cấp Số Nhân

E. Series | Chuỗi

6.1 Sequences | Dãy Số

💡 Definition: Sequence | Định Nghĩa: Dãy Số

📌 Worked Example 6.1: Identifying Sequences

Problem | Đề bài : Consider the following sequences:

Xét các dãy số sau :

a) The sequence of all positive odd integers: 1, 3, 5, 7, 9, ldots

Dãy số các số tự nhiên lẻ : 1, 3, 5, 7, 9, ldots

b) The sequence of perfect squares less than 50: 1, 4, 9, 16, 25, 36, 49

Dãy số các số chính phương nhỏ hơn 50: 1, 4, 9, 16, 25, 36, 49

For each sequence, determine:

•  Whether it is finite or infinite

•  The first term

•  The general term (if possible)

Với mỗi dãy số, xác định:

•  Dãy số hữu hạn hay vô hạn

•  Số hạng đầu

•  Số hạng tổng quát (nếu có thể)

Solution | Lời giải:

a) Sequence of positive odd integers | Dãy số các số tự nhiên lẻ :

•  This is an infinite sequence (dãy số vô hạn) because odd integers continue indefinitely.

•  First term: u₁ = 1

•  General term: u_n = 2n - 1 for n in mathbbN^*

Verification: u₁ = 2(1) - 1 = 1, u₂ = 2(2) - 1 = 3, u₃ = 2(3) - 1 = 5, etc.

b) Perfect squares less than 50 | Các số chính phương nhỏ hơn 50:

•  This is a finite sequence (dãy số hữu hạn) with 7 terms.

•  First term: u₁ = 1`,
    glossary: [
      { term_en: 'Understand the concept of sequences', term_vi: 'finite and infinite', definition: 'Understand the concept of sequences — finite and infinite', example: '' },
      { term_en: 'Study arithmetic sequences', term_vi: 'sequences with constant difference', definition: 'Study arithmetic sequences — sequences with constant difference', example: '' },
      { term_en: 'Study geometric sequences', term_vi: 'sequences with constant ratio', definition: 'Study geometric sequences — sequences with constant ratio', example: '' },
      { term_en: 'The general term', term_vi: 'if possible', definition: 'The general term — if possible', example: '' },
      { term_en: 'This is an infinite sequence', term_vi: 'dãy số vô hạn', definition: 'This is an infinite sequence — dãy số vô hạn', example: '' },
      { term_en: 'This is a finite sequence', term_vi: 'dãy số hữu hạn', definition: 'This is a finite sequence — dãy số hữu hạn', example: '' },
      { term_en: 'Finite', term_vi: '7 terms', definition: 'Finite — 7 terms', example: '' },
      { term_en: 'The sequence is bounded', term_vi: 'bị chặn', definition: 'The sequence is bounded — bị chặn', example: '' }
    ],
  },
  {
    id: 'chapter-note-07',
    student_id: 'system',
    topic: `Chapter 7: Limits of Functions _ Chương 7_ Giới Hạn Của Hàm Số`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 7: Limits of Functions | Chương 7: Giới Hạn Của Hàm Số

📖 Chapter Overview | Tổng Quan Chương

Limits are one of the most fundamental concepts in calculus and mathematical analysis. They provide the foundation for understanding continuity, derivatives, and integrals. The concept of a limit allows us to describe the behavior of a function as the input approaches a particular value, even when the function may not be defined at that exact point.

Giới hạn là một trong những khái niệm cơ bản nhất trong giải tích và phân tích toán học. Chúng cung cấp nền tảng để hiểu về tính liên tục, đạo hàm và tích phân. Khái niệm giới hạn cho phép chúng ta mô tả hành vi của một hàm số khi biến số tiến đến một giá trị cụ thể, ngay cả khi hàm số có thể không xác định tại chính điểm đó.

From Einstein's theory of relativity to calculating instantaneous velocity, from understanding asymptotic behavior to modeling continuous change, limits are the mathematical language that bridges the discrete and the continuous, the finite and the infinite.

Từ thuyết tương đối của Einstein đến tính vận tốc tức thời, từ hiểu hành vi tiệm cận đến mô hình hóa sự thay đổi liên tục, giới hạn là ngôn ngữ toán học kết nối giữa rời rạc và liên tục, giữa hữu hạn và vô hạn.

In this chapter, we will:

•  Understand the intuitive and formal concept of limits

•  Master limit laws and computation techniques

•  Study one-sided limits (left and right limits)

•  Explore limits at infinity and infinite limits

•  Identify and evaluate indeterminate forms

•  Apply limits to solve real-world problems

Trong chương này, chúng ta sẽ :

•  Hiểu khái niệm trực quan và chính thức về giới hạn

•  Thành thạo các quy tắc giới hạn và kỹ thuật tính toán

•  Nghiên cứu giới hạn một phía (giới hạn trái và phải)

•  Khám phá giới hạn tại vô cực và giới hạn vô cực

•  Nhận biết và tính các dạng vô định

•  Áp dụng giới hạn để giải quyết các bài toán thực tế

📚 Bilingual Vocabulary | Từ Vựng Song Ngữ

A. Basic Limit Concepts | Khái Niệm Giới Hạn Cơ Bản

B. Types of Limits | Các Loại Giới Hạn

C. Indeterminate Forms | Dạng Vô Định

D. Techniques and Properties | Kỹ Thuật và Tính Chất

E. Asymptotes | Tiệm Cận

7.1 The Concept of Limit | Khái Niệm Giới Hạn

💡 Definition : Limit of a Function | Định Nghĩa : Giới Hạn Của Hàm Số

⚠️ Important Note

The limit lim_{x \\to x_0} f(x) depends only on the values of f(x) near x₀, not on the value of f(x₀) itself. The function may not even be defined at x₀.

Giới hạn lim_{x \\to x_0} f(x) chỉ phụ thuộc vào giá trị của f(x) gần x₀, **không phụ thuộc vào giá trị **f(x₀). Hàm số thậm chí có thể không xác định tại x₀.

📌 Worked Example 7.1: Understanding Limits

Problem | Đề bài : Consider the function f(x) = x² - 4/x - 2.

Xét hàm số f(x) = x² - 4/x - 2.

a) Find the domain of f(x).

Tìm tập xác định của f(x).

b) Simplify f(x) for x 
eq 2.

Rút gọn f(x) với x 
eq 2.

c) Find lim_{x \\to 2} f(x).

Tìm lim_{x \\to 2} f(x).

Solution | Lời giải:

a) Domain | Tập xác định:

The function is undefined when the denominator equals zero:

Hàm số không xác định khi mẫu số bằng không :`,
    glossary: [
      { term_en: 'Consider the function f', term_vi: 'x', definition: 'Consider the function f — x', example: '' },
      { term_en: 'Find the domain of f', term_vi: 'x', definition: 'Find the domain of f — x', example: '' },
      { term_en: 'Simplify f', term_vi: 'x', definition: 'Simplify f — x', example: '' },
      { term_en: 'Since f', term_vi: 'x', definition: 'Since f — x', example: '' },
      { term_en: 'Even though f', term_vi: '2', definition: 'Even though f — 2', example: '' },
      { term_en: 'Its height', term_vi: 'in meters', definition: 'Its height — in meters', example: '' },
      { term_en: 'Direct substitution', term_vi: 'when possible', definition: 'Direct substitution — when possible', example: '' },
      { term_en: 'Factoring', term_vi: 'for $$0/0$$ forms', definition: 'Factoring — for $$0/0$$ forms', example: '' }
    ],
  },
  {
    id: 'chapter-note-08',
    student_id: 'system',
    topic: `Chapter 8: Continuity _ Chương 8_ Hàm Số Liên Tục`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 8: Continuity | Chương 8: Hàm Số Liên Tục

📖 Chapter Overview | Tổng Quan Chương

Continuity is one of the most intuitive yet profound concepts in mathematics. It captures the idea that small changes in input produce small changes in output—there are no sudden jumps or breaks. From the smooth flight of an airplane to the continuous flow of water, from the unbroken curve of a bridge to the seamless change of temperature throughout the day, continuity is the mathematical language that describes uninterrupted change.

Tính liên tục là một trong những khái niệm trực quan nhưng sâu sắc nhất trong toán học. Nó nắm bắt ý tưởng rằng những thay đổi nhỏ trong đầu vào tạo ra những thay đổi nhỏ trong đầu ra—không có bước nhảy đột ngột hay gián đoạn. Từ chuyến bay êm ái của máy bay đến dòng chảy liên tục của nước, từ đường cong liền mạch của cây cầu đến sự thay đổi liền lạc của nhiệt độ suốt cả ngày, tính liên tục là ngôn ngữ toán học mô tả sự thay đổi không gián đoạn.

The concept of continuity builds directly on limits. A function is continuous at a point if its limit at that point equals its value at that point. This simple definition has far-reaching consequences: continuous functions preserve intervals, attain maximum and minimum values on closed intervals, and take on all intermediate values between any two points.

Khái niệm tính liên tục được xây dựng trực tiếp từ giới hạn. Một hàm số liên tục tại một điểm nếu giới hạn của nó tại điểm đó bằng giá trị của nó tại điểm đó. Định nghĩa đơn giản này có những hệ quả sâu rộng : các hàm số liên tục bảo toàn các khoảng, đạt giá trị lớn nhất và nhỏ nhất trên các đoạn đóng, và nhận mọi giá trị trung gian giữa hai điểm bất kỳ.

In this chapter, we will:

•  Understand the definition of continuity at a point and on an interval

•  Study properties of continuous functions

•  Learn to identify discontinuities and classify their types

•  Explore the Intermediate Value Theorem and its applications

•  Apply continuity to solve equations and real-world problems

Trong chương này, chúng ta sẽ :

•  Hiểu định nghĩa tính liên tục tại một điểm và trên một khoảng

•  Nghiên cứu các tính chất của hàm số liên tục

•  Học cách nhận biết điểm gián đoạn và phân loại các dạng gián đoạn

•  Khám phá Định lý Giá trị Trung gian và ứng dụng của nó

•  Áp dụng tính liên tục để giải phương trình và các bài toán thực tế

📚 Bilingual Vocabulary | Từ Vựng Song Ngữ

A. Basic Continuity Concepts | Khái Niệm Liên Tục Cơ Bản

B. Types of Discontinuity | Các Loại Gián Đoạn

C. Properties and Theorems | Tính Chất và Định Lý

D. Operations and Applications | Phép Toán và Ứng Dụng

8.1 Continuity at a Point | Tính Liên Tục Tại Một Điểm

Definition | Định Nghĩa

Intuitive Understanding:

A function is continuous at a point if you can draw its graph through that point without lifting your pencil from the paper. There are no jumps, holes, or breaks at that point.

Hiểu Trực Quan:

Một hàm số liên tục tại một điểm nếu bạn có thể vẽ đồ thị của nó qua điểm đó mà không cần nhấc bút khỏi giấy. Không có bước nhảy, lỗ hổng, hay gián đoạn tại điểm đó.`,
    glossary: [
      { term_en: 'Determine whether the function f', term_vi: 'x', definition: 'Determine whether the function f — x', example: '' },
      { term_en: 'Check if f', term_vi: '2', definition: 'Check if f — 2', example: '' },
      { term_en: 'This is a removable discontinuity', term_vi: 'a "hole" in the graph', definition: 'This is a removable discontinuity — a "hole" in the graph', example: '' },
      { term_en: 'Trigonometric functions', term_vi: 'sin x, cos x, tan x, cot x', definition: 'Trigonometric functions — sin x, cos x, tan x, cot x', example: '' },
      { term_en: 'Exponential functions', term_vi: 'a^x, e^x', definition: 'Exponential functions — a^x, e^x', example: '' },
      { term_en: 'Logarithmic functions', term_vi: 'log_a x, ln x', definition: 'Logarithmic functions — log_a x, ln x', example: '' },
      { term_en: 'Continuous on', term_vi: '-∞, ∞', definition: 'Continuous on — -∞, ∞', example: '' },
      { term_en: 'If you draw a continuous curve from point', term_vi: 'a, f(a', definition: 'If you draw a continuous curve from point — a, f(a', example: '' }
    ],
  },
  {
    id: 'chapter-note-09',
    student_id: 'system',
    topic: `Chapter 9: Introduction to Derivatives _ Chương 9_ Giới Thiệu Về Đạo Hàm`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 9: Introduction to Derivatives | Chương 9: Giới Thiệu Về Đạo Hàm

📖 Chapter Overview | Tổng Quan Chương

The derivative is arguably the most important concept in calculus. It represents instantaneous rate of change—how fast something is changing at a precise moment in time. From the velocity of a rocket to the rate at which a disease spreads, from the slope of a curve to the sensitivity of financial markets, derivatives provide the mathematical language for describing dynamic change.

Đạo hàm có lẽ là khái niệm quan trọng nhất trong giải tích. Nó biểu diễn tốc độ thay đổi tức thời—mức độ nhanh chóng của sự thay đổi tại một thời điểm chính xác. Từ vận tốc của tên lửa đến tốc độ lây lan của dịch bệnh, từ độ dốc của đường cong đến độ nhạy của thị trường tài chính, đạo hàm cung cấp ngôn ngữ toán học để mô tả sự thay đổi động.

The concept of the derivative emerged from two classical problems: finding tangent lines to curves and determining instantaneous velocity. These seemingly different problems led to the same mathematical idea—the limit of a difference quotient. This unification is one of the great triumphs of calculus.

Khái niệm đạo hàm xuất hiện từ hai bài toán cổ điển : tìm tiếp tuyến của đường cong và xác định vận tốc tức thời. Hai bài toán tưởng chừng khác nhau này dẫn đến cùng một ý tưởng toán học—giới hạn của tỷ số sai phân. Sự thống nhất này là một trong những thành tựu vĩ đại của giải tích.

In this chapter, we will:

•  Understand the concept of average rate of change

•  Define the derivative as a limit

•  Interpret derivatives geometrically (tangent lines) and physically (instantaneous velocity)

•  Learn derivative notation and terminology

•  Compute derivatives using the limit definition

•  Understand the relationship between differentiability and continuity

•  Apply derivatives to solve real-world problems

Trong chương này, chúng ta sẽ :

•  Hiểu khái niệm tốc độ thay đổi trung bình

•  Định nghĩa đạo hàm như một giới hạn

•  Giải thích đạo hàm theo hình học (tiếp tuyến) và vật lý (vận tốc tức thời)

•  Học ký hiệu và thuật ngữ đạo hàm

•  Tính đạo hàm bằng định nghĩa giới hạn

•  Hiểu mối quan hệ giữa tính khả vi và tính liên tục

•  Áp dụng đạo hàm để giải quyết các bài toán thực tế

📚 Bilingual Vocabulary | Từ Vựng Song Ngữ

A. Basic Derivative Concepts | Khái Niệm Đạo Hàm Cơ Bản

B. Geometric Interpretation | Giải Thích Hình Học

C. Derivative Notation | Ký Hiệu Đạo Hàm

D. Physical Applications | Ứng Dụng Vật Lý

9.1 Average Rate of Change | Tốc Độ Thay Đổi Trung Bình

The Concept | Khái Niệm

The average rate of change of a function f over an interval [a, b] measures how much the function changes, on average, per unit change in the input.

Tốc độ thay đổi trung bình của hàm số f trên khoảng [a, b] đo lường mức độ thay đổi của hàm số, trung bình, trên mỗi đơn vị thay đổi của biến đầu vào.

Geometric Interpretation:

The average rate of change is the slope of the secant line connecting the points (a, f(a)) and (b, f(b)) on the graph of f.

Giải Thích Hình Học:

Tốc độ thay đổi trung bình là độ dốc của cát tuyến nối hai điểm (a, f(a)) và (b, f(b)) trên đồ thị của f.`,
    glossary: [
      { term_en: 'Interpret derivatives geometrically', term_vi: 'tangent lines', definition: 'Interpret derivatives geometrically — tangent lines', example: '' },
      { term_en: 'Its height', term_vi: 'in meters', definition: 'Its height — in meters', example: '' },
      { term_en: 'Calculate h', term_vi: '3', definition: 'Calculate h — 3', example: '' },
      { term_en: 'Find the average rate of change of f', term_vi: 'x', definition: 'Find the average rate of change of f — x', example: '' },
      { term_en: 'If s', term_vi: 't', definition: 'If s — t', example: '' },
      { term_en: 'Use the definition to find the derivative of f', term_vi: 'x', definition: 'Use the definition to find the derivative of f — x', example: '' },
      { term_en: 'Calculate f', term_vi: '3 + h', definition: 'Calculate f — 3 + h', example: '' },
      { term_en: 'Find the equation of the tangent line to f', term_vi: 'x', definition: 'Find the equation of the tangent line to f — x', example: '' }
    ],
  },
  {
    id: 'chapter-note-10',
    student_id: 'system',
    topic: `Chapter 10: Exponential Functions (Hàm số Mũ)`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 10: Exponential Functions (Hàm số Mũ)

📖 Chapter Overview

Exponential functions are among the most important mathematical models in science, economics, and everyday life. They describe phenomena involving rapid growth or decay, from population dynamics and compound interest to radioactive decay and viral spread. In this chapter, we explore the definition, properties, and graphs of exponential functions, building on our understanding of exponents with real numbers. We'll discover why these functions are so powerful and how they connect to real-world applications.

📚 Bilingual Vocabulary (Từ vựng Song ngữ)

Basic Concepts (Khái niệm Cơ bản)

Properties and Behavior (Tính chất và Hành vi)

Special Numbers and Applications (Số Đặc biệt và Ứng dụng)

10.1 Definition and Recognition (Định nghĩa và Nhận dạng)

Definition of Exponential Function

Key points:

•  The base a must be positive: a > 0

•  The base cannot equal 1: a 
eq 1 (because 1^x = 1 for all x, which is a constant function)

•  The exponent x can be any real number

•  The output a^x is always positive

Recognizing Exponential Functions

An exponential function has the variable in the exponent, not in the base.

Exponential functions:

•  y = 2^x (base 2)

•  y = (1/3)^x (base 1/3)

•  y = e^x (base e)

•  y = 5 · 3^x (exponential with coefficient)

NOT exponential functions:

•  y = x² (power function, variable is the base)

•  y = x⁻¹ (power function)

•  y = 1^x = 1 (constant function, base equals 1)

10.2 Properties of Exponential Functions (Tính chất của Hàm số Mũ)

General Properties

For the exponential function y = a^x where a > 0 and a 
eq 1:

Monotonicity (Behavior)

The behavior of y = a^x depends on the value of the base a:

Case 1: When a > 1

•  The function is increasing (strictly monotone increasing) on mathbbR

•  As x → +∞, we have a^x → +∞ (grows without bound)

•  As x → -∞, we have a^x → 0⁺ (approaches zero from above)

•  Larger values of a produce steeper growth

Case 2: When 0 < a < 1

•  The function is decreasing (strictly monotone decreasing) on mathbbR

•  As x → +∞, we have a^x → 0⁺ (approaches zero from above)

•  As x → -∞, we have a^x → +∞ (grows without bound)

•  This represents exponential decay

Important Inequality

For exponential functions with base a > 1:
a^{x_1} < a^{x_2}   if and only if   x₁ < x₂

For exponential functions with base 0 < a < 1:
a^{x_1} > a^{x_2}   if and only if   x₁ < x₂

10.3 Graphs of Exponential Functions (Đồ thị Hàm số Mũ)

Graph of y = a^x when a > 1

The graph has these characteristics:

•  Passes through the point (0, 1)

•  Passes through the point (1, a)

•  Increases from left to right

•  Lies entirely above the x-axis

•  Approaches the x-axis as x → -∞

•  Rises steeply as x → +∞

Table of values for y = 2^x:

Graph of y = a^x when 0 < a < 1

The graph has these characteristics:

•  Passes through the point (0, 1)

•  Passes through the point (1, a)

•  Decreases from left to right

•  Lies entirely above the x-axis

•  Approaches the x-axis as x → +∞

•  Rises steeply as x → -∞

Table of values for y = (1/2)^x:

Symmetry Property`,
    glossary: [
      { term_en: 'Exponential Functions', term_vi: 'Hàm số Mũ', definition: 'Exponential Functions — Hàm số Mũ', example: '' },
      { term_en: 'Bilingual Vocabulary', term_vi: 'Từ vựng Song ngữ', definition: 'Bilingual Vocabulary — Từ vựng Song ngữ', example: '' },
      { term_en: 'Basic Concepts', term_vi: 'Khái niệm Cơ bản', definition: 'Basic Concepts — Khái niệm Cơ bản', example: '' },
      { term_en: 'Properties and Behavior', term_vi: 'Tính chất và Hành vi', definition: 'Properties and Behavior — Tính chất và Hành vi', example: '' },
      { term_en: 'Special Numbers and Applications', term_vi: 'Số Đặc biệt và Ứng dụng', definition: 'Special Numbers and Applications — Số Đặc biệt và Ứng dụng', example: '' },
      { term_en: 'Definition and Recognition', term_vi: 'Định nghĩa và Nhận dạng', definition: 'Definition and Recognition — Định nghĩa và Nhận dạng', example: '' },
      { term_en: 'Properties of Exponential Functions', term_vi: 'Tính chất của Hàm số Mũ', definition: 'Properties of Exponential Functions — Tính chất của Hàm số Mũ', example: '' },
      { term_en: 'Monotonicity', term_vi: 'Behavior', definition: 'Monotonicity — Behavior', example: '' }
    ],
  },
  {
    id: 'chapter-note-11',
    student_id: 'system',
    topic: `Chapter 11: Logarithmic Functions (Hàm số Logarit)`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 11: Logarithmic Functions (Hàm số Logarit)

📖 Chapter Overview

Logarithmic functions are the inverse functions of exponential functions, providing us with powerful tools to solve exponential equations and model phenomena where we need to determine the exponent. From measuring earthquake intensity on the Richter scale to calculating pH levels in chemistry, from determining sound intensity in decibels to analyzing data compression in computer science, logarithms are indispensable in modern science and technology. In this chapter, we explore the definition, properties, and graphs of logarithmic functions, along with their deep connection to exponential functions.

📚 Bilingual Vocabulary (Từ vựng Song ngữ)

Basic Concepts (Khái niệm Cơ bản)

Properties and Operations (Tính chất và Phép toán)

Graph and Behavior (Đồ thị và Hành vi)

Applications (Ứng dụng)

11.1 Definition of Logarithm (Định nghĩa Logarit)

The Concept of Logarithm

The logarithm answers the question: "To what power must we raise the base to get a certain number?"

Key restrictions:

•  The base a must satisfy: a > 0 and a 
eq 1

•  The argument M must be positive: M > 0

•  There is no logarithm of zero or negative numbers

Connection to Exponential Functions

Logarithmic and exponential functions are inverse operations:

•  If y = a^x, then x = log_a y

•  If y = log_a x, then x = a^y

Examples:

•  log₂ 8 = 3 because 2³ = 8

•  log₁₀ 100 = 2 because 10² = 100

•  log₅ 1/25 = -2 because 5⁻² = 1/25

Basic Properties from Definition

11.2 Properties of Logarithms (Tính chất của Logarit)

Logarithm Rules

Proof of Product Rule:

Let log_a M = x and log_a N = y. Then a^x = M and a^y = N.

Therefore: MN = a^x · a^y = a^{x+y}

Taking logarithm base a: log_a(MN) = x + y = log_a M + log_a N

Change of Base Formula

Special cases:

•  log_a b = 1/log_b a (reciprocal relationship)

•  log_{a^k} M = 1/k log_a M

Proof:

Let y = log_a M. Then a^y = M.

Taking log_b of both sides: log_b(a^y) = log_b M

Using the power rule: y log_b a = log_b M

Therefore: y = log_b M/log_b a, which means log_a M = log_b M/log_b a

11.3 Common and Natural Logarithms (Logarit Thập phân và Tự nhiên)

Common Logarithm (Base 10)

The common logarithm is the logarithm with base 10, denoted log x or lg x.

log x = log₁₀ x

Common logarithms are widely used in scientific notation and practical calculations.

Examples:

•  log 1000 = 3 (because 10³ = 1000)

•  log 0.01 = -2 (because 10⁻² = 0.01)

•  log √10 = 1/2 (because 10^{1/2} = √10)

Natural Logarithm (Base e)

The natural logarithm is the logarithm with base e ≈ 2.71828, denoted ln x.

ln x = log_e x

Natural logarithms are fundamental in calculus and appear naturally in growth and decay models.

Properties of ln x:

•  ln 1 = 0

•  ln e = 1

•  ln(e^x) = x

•  e^{\\ln x} = x

Relationship Between Common and Natural Logarithms

Using the change of base formula:
log x = ln x/ln 10 ≈ ln x/2.303

ln x = log x/log e ≈ 2.303 log x

11.4 The Logarithmic Function (Hàm số Logarit)

Definition

Properties of Logarithmic Functions

For the logarithmic function y = log_a x where a > 0 and a 
eq 1:`,
    glossary: [
      { term_en: 'Logarithmic Functions', term_vi: 'Hàm số Logarit', definition: 'Logarithmic Functions — Hàm số Logarit', example: '' },
      { term_en: 'Bilingual Vocabulary', term_vi: 'Từ vựng Song ngữ', definition: 'Bilingual Vocabulary — Từ vựng Song ngữ', example: '' },
      { term_en: 'Basic Concepts', term_vi: 'Khái niệm Cơ bản', definition: 'Basic Concepts — Khái niệm Cơ bản', example: '' },
      { term_en: 'Properties and Operations', term_vi: 'Tính chất và Phép toán', definition: 'Properties and Operations — Tính chất và Phép toán', example: '' },
      { term_en: 'Graph and Behavior', term_vi: 'Đồ thị và Hành vi', definition: 'Graph and Behavior — Đồ thị và Hành vi', example: '' },
      { term_en: 'Applications', term_vi: 'Ứng dụng', definition: 'Applications — Ứng dụng', example: '' },
      { term_en: 'Definition of Logarithm', term_vi: 'Định nghĩa Logarit', definition: 'Definition of Logarithm — Định nghĩa Logarit', example: '' },
      { term_en: 'Properties of Logarithms', term_vi: 'Tính chất của Logarit', definition: 'Properties of Logarithms — Tính chất của Logarit', example: '' }
    ],
  },
  {
    id: 'chapter-note-12',
    student_id: 'system',
    topic: `Chapter 12: Exponential and Logarithmic Equations (Phương trình Mũ và Logarit)`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 12: Exponential and Logarithmic Equations (Phương trình Mũ và Logarit)

📖 Chapter Overview

Exponential and logarithmic equations appear frequently in real-world applications, from calculating investment growth and radioactive decay to determining the time needed for populations to reach certain levels. In this chapter, we develop systematic techniques for solving these equations and inequalities. We'll learn when to use logarithms to "bring down" exponents, how to apply the properties of logarithms to simplify complex expressions, and how to check our solutions carefully to avoid extraneous roots. These problem-solving skills are essential for modeling and analyzing exponential phenomena in science, economics, and everyday life.

📚 Bilingual Vocabulary (Từ vựng Song ngữ)

Basic Concepts (Khái niệm Cơ bản)

Solution Methods (Phương pháp Giải)

Key Terms (Thuật ngữ Quan trọng)

12.1 Exponential Equations (Phương trình Mũ)

Basic Exponential Equation

Solution:

•  If b ≤ 0: No solution (since a^x > 0 for all x)

•  If b > 0: Unique solution x = log_a b

Method 1: Same Base Method

When both sides can be expressed as powers of the same base, we can equate the exponents.

Strategy:

1.  Express both sides as powers of the same base

2.  Set the exponents equal

3.  Solve the resulting equation

Method 2: Taking Logarithms

When the same base method is not convenient, take logarithms of both sides.

Strategy:

1.  Isolate the exponential expression

2.  Take logarithm (common or natural) of both sides

3.  Use the power rule: log(a^x) = xlog a

4.  Solve for the variable

12.2 Logarithmic Equations (Phương trình Logarit)

Basic Logarithmic Equation

Solution: x = a^b (unique solution)

Method: Same Base Method

Strategy:

1.  Check domain: Identify restrictions (arguments must be positive)

2.  Combine logarithms: Use properties to get single logarithm on each side

3.  Equate arguments: If bases are equal, set arguments equal

4.  Solve and verify: Check solutions against domain restrictions

⚠️ Critical: Always check that solutions satisfy the domain restrictions. Extraneous solutions often arise in logarithmic equations.

12.3 Exponential Inequalities (Bất phương trình Mũ)

Basic Exponential Inequality

The basic form is: a^x > b (or ≥, <, ≤) where a > 0, a 
eq 1

Solution depends on the base:

Key principle: The direction of the inequality reverses when the base is between 0 and 1.

12.4 Logarithmic Inequalities (Bất phương trình Logarit)

Basic Logarithmic Inequality

The basic form is: log_a x > b (or ≥, <, ≤) where a > 0, a 
eq 1

Solution depends on the base:

Key principle: The direction of the inequality reverses when the base is between 0 and 1.

⚠️ Critical: Always maintain domain restrictions (x > 0) when solving logarithmic inequalities.

📝 Worked Examples (Ví dụ Mẫu)

Example 1: Exponential Equation - Same Base Method

Problem: Solve 3^{x+1} = 1/3^{1-2x}

Solution:

First, rewrite the right side with base 3:
1/3^{1-2x} = 3^{-(1-2x)} = 3^{2x-1}

The equation becomes:
3^{x+1} = 3^{2x-1}

Since the bases are equal, we can equate the exponents:
x + 1 = 2x - 1`,
    glossary: [
      { term_en: 'Exponential and Logarithmic Equations', term_vi: 'Phương trình Mũ và Logarit', definition: 'Exponential and Logarithmic Equations — Phương trình Mũ và Logarit', example: '' },
      { term_en: 'Bilingual Vocabulary', term_vi: 'Từ vựng Song ngữ', definition: 'Bilingual Vocabulary — Từ vựng Song ngữ', example: '' },
      { term_en: 'Basic Concepts', term_vi: 'Khái niệm Cơ bản', definition: 'Basic Concepts — Khái niệm Cơ bản', example: '' },
      { term_en: 'Solution Methods', term_vi: 'Phương pháp Giải', definition: 'Solution Methods — Phương pháp Giải', example: '' },
      { term_en: 'Key Terms', term_vi: 'Thuật ngữ Quan trọng', definition: 'Key Terms — Thuật ngữ Quan trọng', example: '' },
      { term_en: 'Exponential Equations', term_vi: 'Phương trình Mũ', definition: 'Exponential Equations — Phương trình Mũ', example: '' },
      { term_en: 'No solution', term_vi: 'since a^x > 0 for all x', definition: 'No solution — since a^x > 0 for all x', example: '' },
      { term_en: 'Take logarithm', term_vi: 'common or natural', definition: 'Take logarithm — common or natural', example: '' }
    ],
  },
  {
    id: 'chapter-note-13',
    student_id: 'system',
    topic: `Chapter 13: Derivative Rules (Quy tắc Tính Đạo hàm)`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 13: Derivative Rules (Quy tắc Tính Đạo hàm)

📖 Chapter Overview

Computing derivatives using the limit definition can be tedious and time-consuming. Fortunately, mathematicians have developed efficient rules and formulas that allow us to find derivatives quickly and systematically. In this chapter, we explore the fundamental rules of differentiation: the power rule, sum and difference rules, product and quotient rules, and the chain rule. We'll also learn the derivatives of common functions including polynomials, exponential, logarithmic, and trigonometric functions. These rules are the essential tools that make calculus practical for solving real-world problems in physics, engineering, economics, and beyond.

📚 Bilingual Vocabulary (Từ vựng Song ngữ)

Basic Rules (Quy tắc Cơ bản)

Advanced Rules (Quy tắc Nâng cao)

Function Types (Loại Hàm số)

13.1 Basic Derivative Rules (Quy tắc Cơ bản)

Constant Rule

Explanation: A constant function has a horizontal graph with slope 0, so its derivative is 0 everywhere.

Examples:

•  d/dx(5) = 0

•  d/dx(π) = 0

•  d/dx(-100) = 0

Power Rule

This is one of the most important and frequently used differentiation rules.

Examples:

•  d/dx(x) = 1 · x⁰ = 1

•  d/dx(x²) = 2x

•  d/dx(x³) = 3x²

•  d/dx(x¹⁰) = 10x⁹

•  d/dx(√x) = d/dx(x^{1/2}) = 1/2x^{-1/2} = 1/2√x

•  d/dx(1/x) = d/dx(x⁻¹) = -x⁻² = -1/x²

Constant Multiple Rule

Explanation: Constants can be "pulled out" of the derivative.

Examples:

•  d/dx(3x²) = 3 · d/dx(x²) = 3 · 2x = 6x

•  d/dx(-5x⁴) = -5 · 4x³ = -20x³

•  d/dx(2√x) = 2 · 1/2√x = 1/√x

Sum and Difference Rules

Explanation: The derivative of a sum (or difference) is the sum (or difference) of the derivatives.

Examples:

•  d/dx(x³ + x²) = 3x² + 2x

•  d/dx(5x⁴ - 3x² + 7) = 20x³ - 6x

•  d/dx(x² + √x - 1/x) = 2x + 1/2√x + 1/x²

13.2 Product and Quotient Rules (Quy tắc Tích và Thương)

Product Rule

Memory aid: (fg)' = f'g + fg' (first times second's derivative plus second times first's derivative)

Important: (fg)' 
eq f'g' — This is a common mistake!

Examples:

1.  d/dx[(x²)(x³)] = (2x)(x³) + (x²)(3x²) = 2x⁴ + 3x⁴ = 5x⁴

(Note: We could also simplify first: x² · x³ = x⁵, so d/dx(x⁵) = 5x⁴)

2.  d/dx[(x² + 1)(x³ - 2x)]

Let f(x) = x² + 1 and g(x) = x³ - 2x

f'(x) = 2x and g'(x) = 3x² - 2

(fg)' = (2x)(x³ - 2x) + (x² + 1)(3x² - 2)
= 2x⁴ - 4x² + 3x⁴ - 2x² + 3x² - 2
= 5x⁴ - 3x² - 2

Quotient Rule

Memory aid: (f/g)' = f'g - fg'/g² — "lo d-hi minus hi d-lo over lo-lo"

Important: The order matters! It's f'g - fg', not fg' - f'g.

Examples:

1.  d/dx(x²/x + 1)

Let f(x) = x² and g(x) = x + 1

f'(x) = 2x and g'(x) = 1

d/dx(x²/x + 1) = (2x)(x+1) - (x²)(1)/(x+1)² = 2x² + 2x - x²/(x+1)² = x² + 2x/(x+1)²

2.  d/dx(x - 1/2x + 1)

= (1)(2x+1) - (x-1)(2)/(2x+1)² = 2x + 1 - 2x + 2/(2x+1)² = 3/(2x+1)²

13.3 The Chain Rule (Quy tắc Hàm hợp)

Composite Functions

A composite function is a function formed by applying one function to the result of another.

If y = f(u) and u = g(x), then y = f(g(x)) is a composite function.

Examples:

•  y = (x² + 1)³ — outer: u³, inner: u = x² + 1

•  y = √x² + 5 — outer: √u, inner: u = x² + 5`,
    glossary: [
      { term_en: 'Derivative Rules', term_vi: 'Quy tắc Tính Đạo hàm', definition: 'Derivative Rules — Quy tắc Tính Đạo hàm', example: '' },
      { term_en: 'Bilingual Vocabulary', term_vi: 'Từ vựng Song ngữ', definition: 'Bilingual Vocabulary — Từ vựng Song ngữ', example: '' },
      { term_en: 'Basic Rules', term_vi: 'Quy tắc Cơ bản', definition: 'Basic Rules — Quy tắc Cơ bản', example: '' },
      { term_en: 'Advanced Rules', term_vi: 'Quy tắc Nâng cao', definition: 'Advanced Rules — Quy tắc Nâng cao', example: '' },
      { term_en: 'Function Types', term_vi: 'Loại Hàm số', definition: 'Function Types — Loại Hàm số', example: '' },
      { term_en: 'Basic Derivative Rules', term_vi: 'Quy tắc Cơ bản', definition: 'Basic Derivative Rules — Quy tắc Cơ bản', example: '' },
      { term_en: 'The derivative of a sum', term_vi: 'or difference', definition: 'The derivative of a sum — or difference', example: '' },
      { term_en: 'Product and Quotient Rules', term_vi: 'Quy tắc Tích và Thương', definition: 'Product and Quotient Rules — Quy tắc Tích và Thương', example: '' }
    ],
  },
  {
    id: 'chapter-note-14',
    student_id: 'system',
    topic: `Chapter 14: Second Derivatives (Đạo hàm Cấp hai)`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 14: Second Derivatives (Đạo hàm Cấp hai)

Chapter Overview

The second derivative is the derivative of the first derivative. While the first derivative tells us about the rate of change and slope of a function, the second derivative provides information about how that rate of change is itself changing. This concept is fundamental in understanding acceleration in physics, concavity in curve sketching, and optimization in economics.

In this chapter, we will:

•  Define the second derivative and higher-order derivatives

•  Learn how to compute second derivatives using derivative rules

•  Understand the physical interpretation of second derivatives as acceleration

•  Apply second derivatives to analyze the concavity of functions

•  Solve real-world problems involving acceleration and motion

14.1 Bilingual Vocabulary (Từ vựng Song ngữ)

Core Concepts

Mathematical Notation

14.2 Definition and Notation (Định nghĩa và Ký hiệu)

The Second Derivative

Common Notations:

If y = f(x), the second derivative can be written as:

•  f''(x) (prime notation)

•  d²y/dx² (Leibniz notation)

•  d²f/dx² (alternative Leibniz notation)

•  y'' (simplified prime notation)

Higher-Order Derivatives

The process can be continued to find third, fourth, and higher-order derivatives:

Note: For derivatives of order four and higher, we typically use the notation f⁽ⁿ⁾(x) instead of multiple primes.

14.3 Computing Second Derivatives (Tính Đạo hàm Cấp hai)

To find the second derivative, we simply differentiate the first derivative.

Example 14.1: Polynomial Function

Find the second derivative of f(x) = 3x⁴ - 5x³ + 2x² - 7x + 1

Solution:

Step 1: Find the first derivative using the power rule:

f'(x) = 12x³ - 15x² + 4x - 7

Step 2: Differentiate again to find the second derivative:

f''(x) = d/dx[12x³ - 15x² + 4x - 7]

f''(x) = 36x² - 30x + 4

Answer: f''(x) = 36x² - 30x + 4

Example 14.2: Exponential Function

Find the second derivative of y = e^{2x}

Solution:

Step 1: Find the first derivative using the chain rule:

dy/dx = e^{2x} · 2 = 2e^{2x}

Step 2: Differentiate again:

d²y/dx² = d/dx[2e^{2x}] = 2 · e^{2x} · 2 = 4e^{2x}

Answer: d²y/dx² = 4e^{2x}

Example 14.3: Trigonometric Function

Find the second derivative of f(x) = sin(3x)

Solution:

Step 1: Find the first derivative:

f'(x) = cos(3x) · 3 = 3cos(3x)

Step 2: Find the second derivative:

f''(x) = 3 · [-sin(3x)] · 3 = -9sin(3x)

Answer: f''(x) = -9sin(3x)

Example 14.4: Product Rule Application

Find the second derivative of f(x) = x² · e^x

Solution:

Step 1: Find the first derivative using the product rule:

f'(x) = (x²)' · e^x + x² · (e^x)'

f'(x) = 2x · e^x + x² · e^x = e^x(2x + x²)

Step 2: Find the second derivative using the product rule again:

f''(x) = (e^x)' · (2x + x²) + e^x · (2x + x²)'

f''(x) = e^x · (2x + x²) + e^x · (2 + 2x)

f''(x) = e^x(2x + x² + 2 + 2x)

f''(x) = e^x(x² + 4x + 2)

Answer: f''(x) = e^x(x² + 4x + 2)

14.4 Physical Interpretation: Acceleration (Ý nghĩa Vật lý: Gia tốc)

Position, Velocity, and Acceleration

In physics, if an object moves along a straight line with position function s(t) at time t:`,
    glossary: [
      { term_en: 'Second Derivatives', term_vi: 'Đạo hàm Cấp hai', definition: 'Second Derivatives — Đạo hàm Cấp hai', example: '' },
      { term_en: 'Bilingual Vocabulary', term_vi: 'Từ vựng Song ngữ', definition: 'Bilingual Vocabulary — Từ vựng Song ngữ', example: '' },
      { term_en: 'Definition and Notation', term_vi: 'Định nghĩa và Ký hiệu', definition: 'Definition and Notation — Định nghĩa và Ký hiệu', example: '' },
      { term_en: 'Computing Second Derivatives', term_vi: 'Tính Đạo hàm Cấp hai', definition: 'Computing Second Derivatives — Tính Đạo hàm Cấp hai', example: '' },
      { term_en: 'Find the second derivative of f', term_vi: 'x', definition: 'Find the second derivative of f — x', example: '' },
      { term_en: 'Acceleration', term_vi: 'Ý nghĩa Vật lý: Gia tốc', definition: 'Acceleration — Ý nghĩa Vật lý: Gia tốc', example: '' },
      { term_en: 'If a', term_vi: 't', definition: 'If a — t', example: '' },
      { term_en: 'A particle moves along a line with position function s', term_vi: 't', definition: 'A particle moves along a line with position function s — t', example: '' }
    ],
  },
  {
    id: 'chapter-note-15',
    student_id: 'system',
    topic: `Chapter 15: Vectors in Space (Vector trong Không gian)`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 15: Vectors in Space (Vector trong Không gian)

Chapter Overview

Vectors are fundamental mathematical objects that have both magnitude (size) and direction. Unlike scalars, which only have magnitude (such as temperature or mass), vectors are used to represent quantities like force, velocity, and displacement. In three-dimensional space, vectors become essential tools for describing positions, movements, and relationships between objects.

In this chapter, we will:

•  Define vectors in three-dimensional space and their properties

•  Learn vector operations: addition, subtraction, and scalar multiplication

•  Understand the geometric interpretation of vector operations

•  Apply the parallelogram rule and triangle rule

•  Work with the dot product (scalar product) and its applications

•  Solve real-world problems involving forces, velocities, and displacements

15.1 Bilingual Vocabulary (Từ vựng Song ngữ)

Core Concepts

Vector Operations

Geometric Terms

15.2 Vectors in Three-Dimensional Space (Vector trong Không gian Ba chiều)

Definition of a Vector

Notation:

•  Bold lowercase letters: a, b, v

•  Arrows over letters: veca, vecb, vecv

•  Letters with arrows: overrightarrowAB

Magnitude of a Vector

The magnitude (or length) of vector vecAB is the distance from A to B, denoted:

|vecAB| = AB

For a vector veca, we write |veca| or |veca|.

Equal Vectors

Important: Equal vectors do not need to have the same initial point. They can be translated in space while remaining equal.

Example 15.1: Equal Vectors in a Cube

Consider a cube ABCD. A'B'C'D' with edge length 1. Which of the following statements are true?

(a) vecAA' = vecBC

(b) vecAA' = vecCC'

(c) vecAA' = vecB'B

Solution:

(a) The edges AA' and BC are skew lines (not coplanar), so vectors vecAA' and vecBC are not parallel. Therefore, vecAA' 
eq vecBC. False

(b) Since ACC'A' is a parallelogram, AA' ∥ CC' and AA' = CC'. The vectors vecAA' and vecCC' have the same length and the same direction. Therefore, vecAA' = vecCC'. True

(c) Vectors vecAA' and vecB'B have the same length but opposite directions. Therefore, vecAA' 
eq vecB'B. False

Answer: Only statement (b) is true.

Special Vectors

1. Zero Vector (vec0)

•  A vector with magnitude 0

•  Has no specific direction

•  For any point A: vecAA = vec0

2. Unit Vector

•  A vector with magnitude 1

•  Used to indicate direction only

3. Opposite Vectors

•  Vectors veca and vecb are opposite if they have the same magnitude but opposite directions

•  We write: vecb = -veca

•  Note: vecBA = -vecAB

15.3 Vector Addition (Phép Cộng Vector)

Triangle Rule

Geometric interpretation: If you travel from A to B, then from B to C, the net displacement is from A to C.

Parallelogram Rule

Properties of Vector Addition

For any vectors veca, vecb, vecc in space:

1.  Commutative property: veca + vecb = vecb + veca

2.  Associative property: (veca + vecb) + vecc = veca + (vecb + vecc)

3.  Identity property: veca + vec0 = vec0 + veca = veca

4.  Inverse property: veca + (-veca) = vec0

Example 15.2: Vector Addition in a Cube

In a cube ABCD. A'B'C'D' with edge length 1, calculate the magnitude of vecBC + vecDD'.`,
    glossary: [
      { term_en: 'Vectors in Space', term_vi: 'Vector trong Không gian', definition: 'Vectors in Space — Vector trong Không gian', example: '' },
      { term_en: 'Work with the dot product', term_vi: 'scalar product', definition: 'Work with the dot product — scalar product', example: '' },
      { term_en: 'Bilingual Vocabulary', term_vi: 'Từ vựng Song ngữ', definition: 'Bilingual Vocabulary — Từ vựng Song ngữ', example: '' },
      { term_en: 'Dimensional Space', term_vi: 'Vector trong Không gian Ba chiều', definition: 'Dimensional Space — Vector trong Không gian Ba chiều', example: '' },
      { term_en: 'The magnitude', term_vi: 'or length', definition: 'The magnitude — or length', example: '' },
      { term_en: 'BC are skew lines', term_vi: 'not coplanar', definition: 'BC are skew lines — not coplanar', example: '' },
      { term_en: 'Only statement', term_vi: 'b', definition: 'Only statement — b', example: '' },
      { term_en: 'Zero Vector', term_vi: 'vec0', definition: 'Zero Vector — vec0', example: '' }
    ],
  },
  {
    id: 'chapter-note-16',
    student_id: 'system',
    topic: `Chapter 16: Trigonometric Ratios in Triangles (Tỉ số Lượng giác trong Tam giác)`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 16: Trigonometric Ratios in Triangles (Tỉ số Lượng giác trong Tam giác)

Chapter Overview

Trigonometric ratios extend beyond right triangles to apply to any triangle. The Law of Sines and Law of Cosines are powerful tools that allow us to solve triangles when we know certain combinations of sides and angles. These laws have practical applications in navigation, surveying, architecture, astronomy, and many fields requiring distance and angle measurements.

In this chapter, we will:

•  Extend trigonometric ratios to angles from 0° to 180°

•  Learn the Law of Cosines and its applications

•  Learn the Law of Sines and its applications

•  Study formulas for calculating triangle area

•  Solve triangles given various combinations of sides and angles

•  Apply these concepts to real-world problems in surveying and navigation

16.1 Bilingual Vocabulary (Từ vựng Song ngữ)

Core Concepts

Laws and Formulas

Triangle Elements

16.2 Trigonometric Ratios for Angles 0° to 180° (Tỉ số Lượng giác cho Góc từ 0° đến 180°)

Extended Definition

In Grade 9, you learned trigonometric ratios for acute angles (0° < α < 90°). Now we extend these definitions to any angle from 0° to 180°.

Special Values

Supplementary Angle Identities

Key insight: Supplementary angles have equal sines but opposite cosines, tangents, and cotangents.

Example 16.1: Finding Trigonometric Values

Find all trigonometric values of 135°.

Solution:

Since 135° = 180° - 45°, we use the supplementary angle identities:

sin 135° = sin(180° - 45°) = sin 45° = √2/2

cos 135° = cos(180° - 45°) = -cos 45° = -√2/2

tan 135° = tan(180° - 45°) = -tan 45° = -1

cot 135° = cot(180° - 45°) = -cot 45° = -1

Answer:

•  sin 135° = √2/2

•  cos 135° = -√2/2

•  tan 135° = -1

•  cot 135° = -1

16.3 The Law of Cosines (Định lý Cosin)

The Law of Cosines is a generalization of the Pythagorean theorem that works for any triangle, not just right triangles.

Alternative forms (solving for the angle):

cos A = b² + c² - a²/2bc

cos B = c² + a² - b²/2ca

cos C = a² + b² - c²/2ab

Note: When C = 90°, cos C = 0, and the Law of Cosines reduces to the Pythagorean theorem: c² = a² + b²

Example 16.2: Using the Law of Cosines (SAS Case)

In triangle ABC, AB = 5, AC = 8, and ∠A = 120°. Find BC.

Solution:

We know two sides and the included angle (SAS case). Using the Law of Cosines:

BC² = AB² + AC² - 2 · AB · AC · cos A

BC² = 5² + 8² - 2(5)(8)cos 120°

BC² = 25 + 64 - 80 · (-1/2)

BC² = 89 + 40 = 129

BC = √129 ≈ 11.36

Answer: BC = √129 ≈ 11.36

Example 16.3: Using the Law of Cosines (SSS Case)

In triangle ABC, a = 7, b = 8, c = 5. Find angle C.

Solution:

We know all three sides (SSS case). Using the Law of Cosines:

cos C = a² + b² - c²/2ab

cos C = 7² + 8² - 5²/2(7)(8)

cos C = 49 + 64 - 25/112 = 88/112 = 11/14

C = arccos(11/14) ≈ 38.21°

Answer: C ≈ 38.21°

16.4 The Law of Sines (Định lý Sin)

The Law of Sines relates the sides of a triangle to the sines of its angles.

Useful forms:

•  a = 2Rsin A, b = 2Rsin B, c = 2Rsin C

•  sin A = a/2R, sin B = b/2R, sin C = c/2R

•  a/b = sin A/sin B

Example 16.4: Using the Law of Sines (ASA Case)`,
    glossary: [
      { term_en: 'Trigonometric Ratios in Triangles', term_vi: 'Tỉ số Lượng giác trong Tam giác', definition: 'Trigonometric Ratios in Triangles — Tỉ số Lượng giác trong Tam giác', example: '' },
      { term_en: 'Bilingual Vocabulary', term_vi: 'Từ vựng Song ngữ', definition: 'Bilingual Vocabulary — Từ vựng Song ngữ', example: '' },
      { term_en: 'The Law of Cosines', term_vi: 'Định lý Cosin', definition: 'The Law of Cosines — Định lý Cosin', example: '' },
      { term_en: 'Alternative forms', term_vi: 'solving for the angle', definition: 'Alternative forms — solving for the angle', example: '' },
      { term_en: 'Using the Law of Cosines', term_vi: 'SAS Case', definition: 'Using the Law of Cosines — SAS Case', example: '' },
      { term_en: 'We know two sides and the included angle', term_vi: 'SAS case', definition: 'We know two sides and the included angle — SAS case', example: '' },
      { term_en: 'We know all three sides', term_vi: 'SSS case', definition: 'We know all three sides — SSS case', example: '' },
      { term_en: 'The Law of Sines', term_vi: 'Định lý Sin', definition: 'The Law of Sines — Định lý Sin', example: '' }
    ],
  },
  {
    id: 'chapter-note-17',
    student_id: 'system',
    topic: `Chapter 17: Equations of Lines (Phương trình Đường thẳng)`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 17: Equations of Lines (Phương trình Đường thẳng)

Chapter Overview

In coordinate geometry, a line can be represented algebraically by an equation. This powerful connection between algebra and geometry allows us to use algebraic methods to solve geometric problems and vice versa. Understanding different forms of line equations—general form, slope-intercept form, parametric form, and point-slope form—gives us flexibility in solving various problems.

In this chapter, we will:

•  Learn about direction vectors and normal vectors of lines

•  Write equations of lines in general form and parametric form

•  Convert between different forms of line equations

•  Find the angle between two lines and determine their relative positions

•  Calculate the distance from a point to a line

•  Apply line equations to solve real-world problems

17.1 Bilingual Vocabulary (Từ vựng Song ngữ)

Core Concepts

Forms of Line Equations

Relative Positions

17.2 Direction Vectors and Normal Vectors (Vectơ Chỉ phương và Vectơ Pháp tuyến)

Direction Vector

Normal Vector

Relationship Between Direction and Normal Vectors

Example 17.1: Finding Direction and Normal Vectors

In the coordinate plane, triangle ABC has vertices A(3, 1), B(4, 0), C(5, 3). Find:

(a) A normal vector of the perpendicular bisector of AB

(b) A normal vector of the altitude from A

Solution:

(a) The perpendicular bisector of AB is perpendicular to AB.

vecAB = (4-3, 0-1) = (1, -1)

Since the perpendicular bisector is perpendicular to AB, vecAB is a normal vector.

Answer: vecn = (1, -1)

(b) The altitude from A is perpendicular to BC.

vecBC = (5-4, 3-0) = (1, 3)

Since the altitude is perpendicular to BC, vecBC is a normal vector of the altitude.

Answer: vecn = (1, 3)

17.3 General Form of Line Equations (Phương trình Tổng quát)

Derivation

Consider a line ell passing through point A(x₀, y₀) with normal vector vecn(a, b).

A point M(x, y) lies on ell if and only if vecAM perp vecn, which means:

vecAM · vecn = 0

(x - x₀, y - y₀) · (a, b) = 0

a(x - x₀) + b(y - y₀) = 0

Expanding: ax + by - ax₀ - by₀ = 0

Let c = -ax₀ - by₀, we get:

Important notes:

•  Every line in the plane has an equation of the form ax + by + c = 0

•  Conversely, every equation ax + by + c = 0 (with a, b not both zero) represents a line

•  The coefficients a, b give a normal vector vecn(a, b)

Example 17.2: Writing General Form Equation

Write the general form equation of the line passing through A(2, 1) with normal vector vecn(3, 4).

Solution:

Using the point-normal form:

3(x - 2) + 4(y - 1) = 0

3x - 6 + 4y - 4 = 0

3x + 4y - 10 = 0

Answer: 3x + 4y - 10 = 0

Special Cases

1. Vertical line (b = 0):

•  Equation: x = m (or ax + c = 0)

•  Perpendicular to the x-axis

•  Normal vector: (1, 0)

2. Horizontal line (a = 0):

•  Equation: y = n (or by + c = 0)

•  Perpendicular to the y-axis

•  Normal vector: (0, 1)

3. Non-vertical line (b 
eq 0):

•  Can be written as: y = mx + p

•  Where m = -a/b (slope) and p = -c/b (y-intercept)

Example 17.3: Connection to Linear Functions

Write the general form equation of the line passing through A(0, b) with normal vector vecn(a, -1). What is the relationship to the graph of y = ax + b?`,
    glossary: [
      { term_en: 'Equations of Lines', term_vi: 'Phương trình Đường thẳng', definition: 'Equations of Lines — Phương trình Đường thẳng', example: '' },
      { term_en: 'Bilingual Vocabulary', term_vi: 'Từ vựng Song ngữ', definition: 'Bilingual Vocabulary — Từ vựng Song ngữ', example: '' },
      { term_en: 'Direction Vectors and Normal Vectors', term_vi: 'Vectơ Chỉ phương và Vectơ Pháp tuyến', definition: 'Direction Vectors and Normal Vectors — Vectơ Chỉ phương và Vectơ Pháp tuyến', example: '' },
      { term_en: 'ABC has vertices A', term_vi: '3, 1', definition: 'ABC has vertices A — 3, 1', example: '' },
      { term_en: 'General Form of Line Equations', term_vi: 'Phương trình Tổng quát', definition: 'General Form of Line Equations — Phương trình Tổng quát', example: '' },
      { term_en: 'Consider a line ell passing through point A', term_vi: 'x₀, y₀', definition: 'Consider a line ell passing through point A — x₀, y₀', example: '' },
      { term_en: 'A point M', term_vi: 'x, y', definition: 'A point M — x, y', example: '' },
      { term_en: 'Vertical line', term_vi: 'b = 0', definition: 'Vertical line — b = 0', example: '' }
    ],
  },
  {
    id: 'chapter-note-18',
    student_id: 'system',
    topic: `Chapter 18: Equations of Circles (Phương trình Đường tròn)`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 18: Equations of Circles (Phương trình Đường tròn)

Chapter Overview

A circle is one of the most fundamental shapes in geometry, defined as the set of all points equidistant from a fixed center point. In coordinate geometry, we can represent circles algebraically using equations, which allows us to apply algebraic methods to solve geometric problems involving circles. Understanding circle equations is essential for applications in physics, engineering, computer graphics, and many other fields.

In this chapter, we will:

•  Derive the standard equation of a circle

•  Learn to identify the center and radius from a circle equation

•  Convert between standard and general forms

•  Write equations of circles given various conditions

•  Find equations of tangent lines to circles

•  Solve real-world problems involving circles

18.1 Bilingual Vocabulary (Từ vựng Song ngữ)

Core Concepts

Equation Forms

Related Terms

18.2 Standard Form of Circle Equation (Dạng Chuẩn)

Derivation

Consider a circle with center I(a, b) and radius R > 0. A point M(x, y) lies on the circle if and only if the distance from M to I equals R:

IM = R

Using the distance formula:

√(x-a)² + (y-b)² = R

Squaring both sides:

Special case: If the center is at the origin (0, 0), the equation becomes:

x² + y² = R²

Example 18.1: Finding Center and Radius

Find the center and radius of the circle: (x - 2)² + (y + 3)² = 16

Solution:

Comparing with the standard form (x - a)² + (y - b)² = R²:

•  a = 2, b = -3, so the center is I(2, -3)

•  R² = 16, so R = 4

Answer: Center: (2, -3); Radius: 4

Example 18.2: Writing Circle Equation from Center and Radius

Write the equation of the circle with center I(-2, 5) and radius R = 7.

Solution:

Using the standard form with a = -2, b = 5, R = 7:

(x - (-2))² + (y - 5)² = 7²

(x + 2)² + (y - 5)² = 49

Answer: (x + 2)² + (y - 5)² = 49

18.3 General Form of Circle Equation (Dạng Tổng quát)

Converting from Standard to General Form

Expanding the standard form (x - a)² + (y - b)² = R²:

x² - 2ax + a² + y² - 2by + b² = R²

x² + y² - 2ax - 2by + (a² + b² - R²) = 0

Let D = -2a, E = -2b, and F = a² + b² - R²:

Important cases:

•  If D² + E² - 4F > 0: equation represents a circle

•  If D² + E² - 4F = 0: equation represents a single point

•  If D² + E² - 4F < 0: equation has no real solutions (empty set)

Example 18.3: Identifying Circle from General Form

Determine whether each equation represents a circle. If so, find the center and radius.

(a) x² + y² - 2x + 4y + 6 = 0

(b) x² + y² + 6x - 4y + 2 = 0

Solution:

(a) Here D = -2, E = 4, F = 6

Check: D² + E² - 4F = (-2)² + 4² - 4(6) = 4 + 16 - 24 = -4 < 0

Since D² + E² - 4F < 0, this does not represent a circle.

(b) Here D = 6, E = -4, F = 2

Check: D² + E² - 4F = 6² + (-4)² - 4(2) = 36 + 16 - 8 = 44 > 0

This does represent a circle.

Center: (-6/2, --4/2) = (-3, 2)

Radius: R = 1/2√44 = 1/2 · 2√11 = √11

Answer:

•  (a) Not a circle

•  (b) Circle with center (-3, 2) and radius √11

Example 18.4: Converting Between Forms

Convert to standard form: x² + y² - 4x + 6y - 3 = 0

Solution:

Method 1: Completing the square`,
    glossary: [
      { term_en: 'Equations of Circles', term_vi: 'Phương trình Đường tròn', definition: 'Equations of Circles — Phương trình Đường tròn', example: '' },
      { term_en: 'Bilingual Vocabulary', term_vi: 'Từ vựng Song ngữ', definition: 'Bilingual Vocabulary — Từ vựng Song ngữ', example: '' },
      { term_en: 'Standard Form of Circle Equation', term_vi: 'Dạng Chuẩn', definition: 'Standard Form of Circle Equation — Dạng Chuẩn', example: '' },
      { term_en: 'Consider a circle with center I', term_vi: 'a, b', definition: 'Consider a circle with center I — a, b', example: '' },
      { term_en: 'A point M', term_vi: 'x, y', definition: 'A point M — x, y', example: '' },
      { term_en: 'If the center is at the origin', term_vi: '0, 0', definition: 'If the center is at the origin — 0, 0', example: '' },
      { term_en: 'Comparing with the standard form', term_vi: 'x - a', definition: 'Comparing with the standard form — x - a', example: '' },
      { term_en: 'Write the equation of the circle with center I', term_vi: '-2, 5', definition: 'Write the equation of the circle with center I — -2, 5', example: '' }
    ],
  },
  {
    id: 'chapter-note-19',
    student_id: 'system',
    topic: `Chapter 19: Conic Sections (Ba Đường Conic)`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 19: Conic Sections (Ba Đường Conic)

Chapter Overview

Conic sections are curves obtained by intersecting a plane with a double cone. These elegant curves—ellipse, hyperbola, and parabola—have fascinated mathematicians since ancient Greece and appear throughout nature and technology.

From planetary orbits (Kepler's laws) to satellite dishes, architectural domes, and medical devices, conic sections are fundamental to understanding our world. This chapter explores their geometric definitions, standard equations, and real-world applications.

Real-world connections:

•  Astronomy: Planetary orbits are ellipses with the Sun at one focus

•  Engineering: Parabolic reflectors in telescopes and satellite dishes

•  Architecture: Elliptical domes and hyperbolic cooling towers

•  Medicine: Elliptical mirrors in lithotripsy (kidney stone treatment)

•  Physics: Projectile motion follows parabolic paths

19.1 Bilingual Vocabulary (Từ vựng Song ngữ)

Core Concepts

Key Elements

Equation Forms

Properties

19.2 The Ellipse (Elip)

Definition

Intuitive understanding: Imagine pinning two ends of a string at points F₁ and F₂, then stretching the string with a pencil and moving it around—the pencil traces an ellipse.

Standard Form of Ellipse

Key relationships:

•  a² = b² + c² (Pythagorean-like relation)

•  For any point M on the ellipse: MF₁ + MF₂ = 2a

Properties of Ellipse

1.  Vertices: (± a, 0) and (0, ± b)

2.  Center: (0, 0)

3.  Axes of symmetry: Both x-axis and y-axis

4.  Domain: -a ≤ x ≤ a

5.  Range: -b ≤ y ≤ b

19.3 The Hyperbola (Hypebol)

Definition

Note: A hyperbola has two branches:

•  One branch: MF₁ - MF₂ = 2a

•  Other branch: MF₂ - MF₁ = 2a

Standard Form of Hyperbola

Key relationships:

•  c² = a² + b²

•  Asymptotes: y = ± b/ax

Properties of Hyperbola

1.  Vertices: (± a, 0)

2.  Center: (0, 0)

3.  Asymptotes: y = ± b/ax (the branches approach these lines)

4.  Axes of symmetry: Both x-axis and y-axis

5.  Domain: x ≤ -a or x ≥ a

19.4 The Parabola (Parabol)

Definition

Standard Form of Parabola

Note: The parabola y = ax² can be written in standard form by rotation and translation.

Properties of Parabola

1.  Vertex: (0, 0)

2.  Axis of symmetry: x-axis

3.  Focus: (p/2, 0)

4.  Directrix: x = -p/2

5.  Domain: x ≥ 0

6.  Range: All real numbers

19.5 Summary Table of Conic Sections

Memory aid:

•  Ellipse: Sum (+) in definition → Plus (+) in equation

•  Hyperbola: Difference (-) in definition → Minus (-) in equation

•  Parabola: Equal distances → One variable squared

19.6 Worked Examples

Example 1: Finding Elements of an Ellipse

Problem: Given the ellipse x²/25 + y²/16 = 1, find:
a) The foci and focal distance
b) The sum of distances from any point on the ellipse to the two foci

Solution:

a) From the equation, we have:

•  a² = 25 Rightarrow a = 5

•  b² = 16 Rightarrow b = 4

•  c = √a² - b² = √25 - 16 = √9 = 3

Therefore:

•  Foci: F₁(-3, 0) and F₂(3, 0)

•  Focal distance: 2c = 6

b) For any point M on the ellipse:
MF₁ + MF₂ = 2a = 2(5) = 10

Answer: Foci at (± 3, 0), focal distance = 6, sum of distances = 10.

Example 2: Finding the Equation of an Ellipse`,
    glossary: [
      { term_en: 'Conic Sections', term_vi: 'Ba Đường Conic', definition: 'Conic Sections — Ba Đường Conic', example: '' },
      { term_en: 'From planetary orbits', term_vi: 'Kepler\'s laws', definition: 'From planetary orbits — Kepler\'s laws', example: '' },
      { term_en: 'Elliptical mirrors in lithotripsy', term_vi: 'kidney stone treatment', definition: 'Elliptical mirrors in lithotripsy — kidney stone treatment', example: '' },
      { term_en: 'Bilingual Vocabulary', term_vi: 'Từ vựng Song ngữ', definition: 'Bilingual Vocabulary — Từ vựng Song ngữ', example: '' },
      { term_en: 'The Ellipse', term_vi: 'Elip', definition: 'The Ellipse — Elip', example: '' },
      { term_en: 'The Hyperbola', term_vi: 'Hypebol', definition: 'The Hyperbola — Hypebol', example: '' },
      { term_en: 'The Parabola', term_vi: 'Parabol', definition: 'The Parabola — Parabol', example: '' },
      { term_en: 'Plus', term_vi: '+', definition: 'Plus — +', example: '' }
    ],
  },
  {
    id: 'chapter-note-20',
    student_id: 'system',
    topic: `Chapter 20: Coordinate Systems in Space (Hệ Tọa độ Không gian)`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 20: Coordinate Systems in Space (Hệ Tọa độ Không gian)

Chapter Overview

Three-dimensional coordinate systems extend our understanding of geometry from the plane to space. The Oxyz coordinate system allows us to precisely locate points, describe vectors, and represent geometric objects like spheres, planes, and lines in three-dimensional space.

This chapter establishes the foundation for spatial geometry by introducing coordinates, distance formulas, and the equation of a sphere. These concepts are essential for understanding 3D graphics, engineering design, physics simulations, and navigation systems.

Real-world connections:

•  GPS Navigation: Locating positions on Earth using 3D coordinates

•  Computer Graphics: Rendering 3D models and animations

•  Architecture: Designing buildings and structures in 3D space

•  Physics: Describing motion and forces in three dimensions

•  Astronomy: Mapping positions of celestial bodies

20.1 Bilingual Vocabulary (Từ vựng Song ngữ)

Core Concepts

Coordinate Elements

Geometric Objects

Distance and Measurement

20.2 The Oxyz Coordinate System

Definition and Structure

Convention: We typically use a right-handed coordinate system where:

•  The x-axis points "right"

•  The y-axis points "forward" or "into the page"

•  The z-axis points "up"

Coordinate Planes

The three axes determine three coordinate planes:

1.  xy-plane (Oxy): Contains the x-axis and y-axis, equation z = 0

2.  xz-plane (Oxz): Contains the x-axis and z-axis, equation y = 0

3.  yz-plane (Oyz): Contains the y-axis and z-axis, equation x = 0

20.3 Coordinates of Points in Space

Point Coordinates

Geometric interpretation: To locate point M(x, y, z):

1.  Move x units along the x-axis

2.  Move y units parallel to the y-axis

3.  Move z units parallel to the z-axis

Special Points

•  Origin: O(0, 0, 0)

•  On x-axis: (x, 0, 0)

•  On y-axis: (0, y, 0)

•  On z-axis: (0, 0, z)

•  On xy-plane: (x, y, 0)

•  On xz-plane: (x, 0, z)

•  On yz-plane: (0, y, z)

20.4 Vectors in Space

Vector Coordinates

Vector from Two Points

Vector Operations

1.  Addition: vecu + vecv = (a₁ + a₂, b₁ + b₂, c₁ + c₂)

2.  Scalar multiplication: kvecv = (ka, kb, kc)

3.  Dot product: vecu · vecv = a₁a₂ + b₁b₂ + c₁c₂

4.  Magnitude: |vecv| = √a² + b² + c²

20.5 Distance Formula in Space

Distance Between Two Points

Derivation: The distance formula comes from applying the Pythagorean theorem twice:

1.  First in the xy-plane to find the horizontal distance

2.  Then in the vertical direction to include the z-component

Midpoint Formula

20.6 Equation of a Sphere

Definition

Standard Equation

General Form

A sphere can also be written in general form:

x² + y² + z² + Dx + Ey + Fz + G = 0

This represents a sphere if and only if:

D² + E² + F² - 4G > 0

In this case:

•  Center: I(-D/2, -E/2, -F/2)

•  Radius: R = 1/2√D² + E² + F² - 4G

Position of a Point Relative to a Sphere

For a sphere (x - a)² + (y - b)² + (z - c)² = R² and point M(x₀, y₀, z₀):

•  M is on the sphere if (x₀ - a)² + (y₀ - b)² + (z₀ - c)² = R²

•  M is inside the sphere if (x₀ - a)² + (y₀ - b)² + (z₀ - c)² < R²`,
    glossary: [
      { term_en: 'Coordinate Systems in Space', term_vi: 'Hệ Tọa độ Không gian', definition: 'Coordinate Systems in Space — Hệ Tọa độ Không gian', example: '' },
      { term_en: 'Bilingual Vocabulary', term_vi: 'Từ vựng Song ngữ', definition: 'Bilingual Vocabulary — Từ vựng Song ngữ', example: '' },
      { term_en: 'To locate point M', term_vi: 'x, y, z', definition: 'To locate point M — x, y, z', example: '' },
      { term_en: 'For a sphere', term_vi: 'x - a', definition: 'For a sphere — x - a', example: '' },
      { term_en: 'M is on the sphere if', term_vi: 'x₀ - a', definition: 'M is on the sphere if — x₀ - a', example: '' },
      { term_en: 'M is inside the sphere if', term_vi: 'x₀ - a', definition: 'M is inside the sphere if — x₀ - a', example: '' },
      { term_en: 'M is outside the sphere if', term_vi: 'x₀ - a', definition: 'M is outside the sphere if — x₀ - a', example: '' },
      { term_en: 'Find the distance between points A', term_vi: '1, -2, 3', definition: 'Find the distance between points A — 1, -2, 3', example: '' }
    ],
  },
  {
    id: 'chapter-note-21',
    student_id: 'system',
    topic: `Chapter 21: Parallel Relations in Space (Quan hệ Song song trong Không gian)`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 21: Parallel Relations in Space (Quan hệ Song song trong Không gian)

Chapter Overview

Parallel relations in three-dimensional space extend our understanding of parallelism from the plane to space. In spatial geometry, we study three fundamental parallel relationships: two parallel lines, a line parallel to a plane, and two parallel planes.

Understanding these relationships is essential for analyzing the structure of buildings, bridges, and mechanical systems, as well as for solving geometric problems involving pyramids, prisms, and other 3D shapes.

Real-world connections:

•  Architecture: Parallel beams in building structures

•  Civil Engineering: Elevated highways and overpasses

•  Manufacturing: Parallel surfaces in machined parts

•  Design: CAD modeling with parallel constraints

•  Transportation: Railway tracks and parallel roads

21.1 Bilingual Vocabulary (Từ vựng Song ngữ)

Core Concepts

Relative Positions

Line and Plane Relations

Plane Relations

21.2 Relative Positions of Two Lines in Space

Four Possible Positions

Key distinction:

•  Coplanar lines (cases 1-3): Both lines lie in the same plane

•  Skew lines (case 4): No plane contains both lines

Definition of Parallel Lines

Definition of Skew Lines

21.3 Properties of Parallel Lines in Space

Property 1: Uniqueness of Parallel Through a Point

This is the 3D version of the parallel postulate from plane geometry.

Property 2: Transitivity of Parallelism

Application: This property is useful for proving lines are parallel without directly showing they are coplanar.

Property 3: Three Planes Theorem

Consequence: If two planes contain two parallel lines, then their line of intersection (if it exists) is parallel to both lines or coincides with one of them.

21.4 Line Parallel to a Plane

Definition

Three possible positions of a line relative to a plane:

1.  Line lies in the plane: d subset (P)

2.  Line intersects the plane: d cap (P) = {M} (one point)

3.  Line is parallel to the plane: d parallel (P) (no common points)

Condition for Line Parallel to Plane

Proof strategy: To show d parallel (P), find a line d' in (P) such that d parallel d'.

Property of Line Parallel to Plane

21.5 Parallel Planes

Definition

Note: Two distinct planes either intersect along a line or are parallel.

Condition for Parallel Planes

Proof strategy: To show (P) parallel (Q), find two intersecting lines in (P) that are both parallel to (Q).

Properties of Parallel Planes

21.6 Worked Examples

Example 1: Identifying Relative Positions of Lines

Problem: In a rectangular box (cuboid) ABCD.A'B'C'D', identify the relative position of each pair of lines:
a) AB and CD
b) AB and B'C'
c) AB and CC'
d) AC and B'D'

Solution:

a) AB and CD are parallel (both lie in plane ABCD and are opposite sides of a rectangle).

b) AB and B'C' are skew (AB is in the bottom face, B'C' is in the top face, and they are not parallel).

c) AB and CC' are skew (AB is horizontal, CC' is vertical, and they don't intersect).

d) AC and B'D' are parallel (both are diagonals of congruent rectangles in parallel planes).`,
    glossary: [
      { term_en: 'Parallel Relations in Space', term_vi: 'Quan hệ Song song trong Không gian', definition: 'Parallel Relations in Space — Quan hệ Song song trong Không gian', example: '' },
      { term_en: 'Bilingual Vocabulary', term_vi: 'Từ vựng Song ngữ', definition: 'Bilingual Vocabulary — Từ vựng Song ngữ', example: '' },
      { term_en: 'Coplanar lines', term_vi: 'cases 1-3', definition: 'Coplanar lines — cases 1-3', example: '' },
      { term_en: 'Skew lines', term_vi: 'case 4', definition: 'Skew lines — case 4', example: '' },
      { term_en: 'To show d parallel', term_vi: 'P', definition: 'To show d parallel — P', example: '' },
      { term_en: 'To show', term_vi: 'P', definition: 'To show — P', example: '' },
      { term_en: 'In a rectangular box', term_vi: 'cuboid', definition: 'In a rectangular box — cuboid', example: '' },
      { term_en: 'AB and CD are parallel', term_vi: 'both lie in plane ABCD and are opposite sides of a rectangle', definition: 'AB and CD are parallel — both lie in plane ABCD and are opposite sides of a rectangle', example: '' }
    ],
  },
  {
    id: 'chapter-note-22',
    student_id: 'system',
    topic: `Chapter 22: Perpendicular Relations in Space (Quan hệ Vuông góc trong Không gian)`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 22: Perpendicular Relations in Space (Quan hệ Vuông góc trong Không gian)

Chapter Overview

Perpendicular relations in three-dimensional space are fundamental to understanding spatial geometry. This chapter explores three key perpendicular relationships: angle between two lines, line perpendicular to a plane, and two perpendicular planes.

These concepts are essential for analyzing the structure of buildings, calculating distances and angles in 3D, and solving geometric problems involving pyramids, prisms, and other spatial figures. The Three Perpendiculars Theorem provides a powerful tool for proving perpendicularity in space.

Real-world connections:

•  Architecture: Vertical columns perpendicular to horizontal floors

•  Engineering: Perpendicular supports in bridge construction

•  Navigation: Vertical plumb lines and horizontal reference planes

•  Manufacturing: Perpendicular surfaces in machined parts

•  Astronomy: Earth's axis and orbital plane

22.1 Bilingual Vocabulary (Từ vựng Song ngữ)

Core Concepts

Line and Plane Perpendicularity

Plane Perpendicularity

Angles and Distances

22.2 Angle Between Two Lines in Space

Definition

Convention: We always take the acute angle (or right angle) between the lines.

Perpendicular Lines

22.3 Line Perpendicular to a Plane

Definition

This is a very strong condition—perpendicular to ALL lines in the plane, not just some lines.

Criterion for Line Perpendicular to Plane

Proof strategy: To show d perp (P), find two intersecting lines in (P) and show d is perpendicular to both.

Properties of Line Perpendicular to Plane

22.4 Orthogonal Projection

Definition

Properties of orthogonal projection:

•  Projection of a point is a point

•  Projection of a line (not perpendicular to the plane) is a line

•  Projection of a line perpendicular to the plane is a point

•  Projection preserves collinearity and betweenness

22.5 Three Perpendiculars Theorem

The Theorem

Significance: This theorem allows us to check perpendicularity between a line and its projection in the plane, which is often easier than checking perpendicularity in 3D.

Typical application: To prove b perp d (where d is not in (P)), we:

1.  Find the projection d' of d onto (P)

2.  Prove b perp d' (in the plane)

3.  Conclude b perp d

22.6 Angle Between Line and Plane

Definition

Note: The angle between a line and a plane is the smallest angle between the line and any line in the plane.

Computing the Angle

To find the angle θ between line d and plane (P):

1.  Find point A on d

2.  Find the orthogonal projection H of A onto (P)

3.  Find another point B on d and its projection B' onto (P)

4.  The angle angle AHB' (or angle BAH) is the angle between d and (P)

Formula: If AH is the perpendicular distance and AB is a segment on the line:

sin θ = AH/AB

22.7 Perpendicular Planes

Angle Between Two Planes

Perpendicular Planes

Criterion for Perpendicular Planes

Dihedral Angle

Note: All plane angles of the same dihedral angle are equal.

22.8 Worked Examples

Example 1: Proving Line Perpendicular to Plane

Problem: Given pyramid S.ABC with SA perp AB, SA perp AC, and AB perp AC. Prove that SA perp (ABC).`,
    glossary: [
      { term_en: 'Perpendicular Relations in Space', term_vi: 'Quan hệ Vuông góc trong Không gian', definition: 'Perpendicular Relations in Space — Quan hệ Vuông góc trong Không gian', example: '' },
      { term_en: 'Bilingual Vocabulary', term_vi: 'Từ vựng Song ngữ', definition: 'Bilingual Vocabulary — Từ vựng Song ngữ', example: '' },
      { term_en: 'We always take the acute angle', term_vi: 'or right angle', definition: 'We always take the acute angle — or right angle', example: '' },
      { term_en: 'To show d perp', term_vi: 'P', definition: 'To show d perp — P', example: '' },
      { term_en: 'Projection of a line', term_vi: 'not perpendicular to the plane', definition: 'Projection of a line — not perpendicular to the plane', example: '' },
      { term_en: 'To prove b perp d', term_vi: 'where d is not in (P', definition: 'To prove b perp d — where d is not in (P', example: '' },
      { term_en: 'Find the orthogonal projection H of A onto', term_vi: 'P', definition: 'Find the orthogonal projection H of A onto — P', example: '' },
      { term_en: 'Prove that SA perp', term_vi: 'ABC', definition: 'Prove that SA perp — ABC', example: '' }
    ],
  },
  {
    id: 'chapter-note-23',
    student_id: 'system',
    topic: `Chapter 23: Combinatorics`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 23: Combinatorics

📋 Overview

Combinatorics (Tổ hợp) is the branch of mathematics concerned with counting, arranging, and selecting objects. This chapter introduces fundamental counting principles and formulas that form the foundation for probability theory and many real-world applications.

What you'll master:

•  Counting Principles: Addition and multiplication rules for systematic counting

•  Permutations: Arrangements where order matters

•  Arrangements: Selecting and ordering subsets of objects

•  Combinations: Selections where order doesn't matter

Real-world connections:

•  Password security and cryptography

•  Tournament scheduling and bracket design

•  Probability calculations in games and statistics

•  Resource allocation and optimization problems

📚 Vocabulary & Terminology

Core Terms

Advanced Terms

🎯 Theory

1. Counting Principles (Quy tắc đếm)

1.1 Addition Rule (Quy tắc cộng)

Principle: If an action can be performed in m ways OR another action can be performed in n ways (and the two actions cannot occur simultaneously), then there are m + n ways to perform either action.

Mathematical statement:
|A cup B| = |A| + |B|   when  A cap B = emptyset

Example: A student can travel from home to school by bus (3 routes) OR by bicycle (2 routes). Total ways = 3 + 2 = 5 ways.

1.2 Multiplication Rule (Quy tắc nhân)

Principle: If an action consists of k steps performed in sequence, where step 1 can be done in n₁ ways, step 2 in n₂ ways, ..., and step k in n_k ways, then the entire action can be performed in:

n₁ × n₂ × cdots × n_k  ways

Example: A 3-digit PIN code where each digit can be 0-9 has 10 × 10 × 10 = 1000 possible codes.

1.3 Tree Diagrams (Sơ đồ hình cây)

Tree diagrams provide a visual method for systematic counting, especially useful when the number of choices at each step is small.

Structure:

•  Each branch represents a choice

•  Paths from root to leaves represent complete outcomes

•  Total outcomes = number of leaf nodes

2. Permutations (Hoán vị)

2.1 Permutations of n Distinct Objects

Definition: A permutation of n distinct objects is an arrangement of all n objects in a specific order.

Formula:
P_n = n! = n × (n-1) × (n-2) × cdots × 2 × 1

Convention: 0! = 1

Example: The number of ways to arrange 5 books on a shelf is:
P₅ = 5! = 5 × 4 × 3 × 2 × 1 = 120

2.2 Circular Permutations (Hoán vị vòng tròn)

When arranging n objects in a circle, rotations are considered identical.

Formula:
P_{\\text{circular}} = (n-1)!

Example: Seating 6 people around a circular table: (6-1)! = 5! = 120 ways.

3. Arrangements (Chỉnh hợp)

3.1 Arrangements of k Objects from n

Definition: An arrangement (or k-permutation) of k objects selected from n distinct objects is an ordered selection where order matters.

Formula:
A_n^k = n!/(n-k)! = n × (n-1) × cdots × (n-k+1)

Conditions: 1 ≤ k ≤ n

Example: Selecting and arranging 3 students from a class of 20 for president, vice-president, and secretary:
A₂₀³ = 20!/17! = 20 × 19 × 18 = 6840

3.2 Key Properties

1.  A_nⁿ = n! (arrangement of all objects = permutation)

2.  A_n¹ = n (selecting one object)`,
    glossary: [
      { term_en: 'Combinatorics', term_vi: 'Tổ hợp', definition: 'Combinatorics — Tổ hợp', example: '' },
      { term_en: 'Counting Principles', term_vi: 'Quy tắc đếm', definition: 'Counting Principles — Quy tắc đếm', example: '' },
      { term_en: 'Addition Rule', term_vi: 'Quy tắc cộng', definition: 'Addition Rule — Quy tắc cộng', example: '' },
      { term_en: 'A student can travel from home to school by bus', term_vi: '3 routes', definition: 'A student can travel from home to school by bus — 3 routes', example: '' },
      { term_en: 'OR by bicycle', term_vi: '2 routes', definition: 'OR by bicycle — 2 routes', example: '' },
      { term_en: 'Multiplication Rule', term_vi: 'Quy tắc nhân', definition: 'Multiplication Rule — Quy tắc nhân', example: '' },
      { term_en: 'Tree Diagrams', term_vi: 'Sơ đồ hình cây', definition: 'Tree Diagrams — Sơ đồ hình cây', example: '' },
      { term_en: 'Permutations', term_vi: 'Hoán vị', definition: 'Permutations — Hoán vị', example: '' }
    ],
  },
  {
    id: 'chapter-note-24',
    student_id: 'system',
    topic: `Chapter 24: Probability Basics`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 24: Probability Basics

📋 Overview

Probability (Xác suất) is the mathematical study of randomness and uncertainty. It provides a framework for quantifying how likely events are to occur, forming the foundation for statistics, decision-making, and scientific reasoning.

What you'll master:

•  Sample Spaces and Events: The fundamental language of probability

•  Probability Axioms: Basic rules governing probability calculations

•  Compound Events: Union, intersection, and complement of events

•  Addition Rule: Computing probabilities of "or" events

•  Multiplication Rule: Computing probabilities of "and" events

•  Conditional Probability: Probability with given information

•  Independence: When events don't influence each other

Real-world connections:

•  Medical diagnosis and treatment effectiveness

•  Risk assessment in insurance and finance

•  Quality control in manufacturing

•  Weather forecasting and climate modeling

•  Game theory and strategic decision-making

📚 Vocabulary & Terminology

Core Terms

Advanced Terms

🎯 Theory

1. Random Experiments and Sample Spaces

1.1 Random Experiments (Phép thử ngẫu nhiên)

Definition: A random experiment is an action or process that:

1.  Can be repeated under the same conditions

2.  Has a well-defined set of possible outcomes

3.  Has an uncertain outcome before the experiment is performed

Examples:

•  Tossing a coin

•  Rolling a die

•  Drawing a card from a deck

•  Measuring the lifetime of a light bulb

1.2 Sample Space (Không gian mẫu)

Definition: The sample space Ω (or S) is the set of all possible outcomes of a random experiment.

Examples:

Notation: n(Ω) or |Ω| denotes the number of outcomes in the sample space.

1.3 Events (Biến cố)

Definition: An event is a subset of the sample space. An event occurs if the outcome of the experiment belongs to that subset.

Types of events:

1.  Certain event (Biến cố chắc chắn): Ω (always occurs)

2.  Impossible event (Biến cố không thể) : emptyset (never occurs)

3.  Elementary event (Biến cố sơ cấp): Contains exactly one outcome

4.  Compound event (Biến cố phức hợp): Contains multiple outcomes

Example: Rolling a die (Ω = {1, 2, 3, 4, 5, 6})

•  Event A: "Roll an even number" = {2, 4, 6}

•  Event B: "Roll a number greater than 4" = {5, 6}

2. Probability of an Event

2.1 Classical Definition (Định nghĩa cổ điển)

For a random experiment with equally likely outcomes:

P(A) = n(A)/n(Ω) = Number of favorable outcomes/Total number of outcomes

Conditions: All outcomes must be equally likely.

2.2 Axioms of Probability (Tiên đề xác suất)

For any event A:

1.  Non-negativity: 0 ≤ P(A) ≤ 1

2.  Certainty: P(Ω) = 1

3.  Impossibility: P(emptyset) = 0

4.  Complement rule: P(overlineA) = 1 - P(A)

3. Operations on Events

3.1 Complement of an Event (Biến cố đối)

Definition: The complement of event A, denoted overlineA or A^c, is the event that A does not occur.

Formula:
P(overlineA) = 1 - P(A)

Example: If P(rain) = 0.3, then P(no rain) = 1 - 0.3 = 0.7

3.2 Union of Events (Biến cố hợp)

Definition: The union A cup B is the event that A occurs OR B occurs (or both).`,
    glossary: [
      { term_en: 'Probability', term_vi: 'Xác suất', definition: 'Probability — Xác suất', example: '' },
      { term_en: 'Random Experiments', term_vi: 'Phép thử ngẫu nhiên', definition: 'Random Experiments — Phép thử ngẫu nhiên', example: '' },
      { term_en: 'Sample Space', term_vi: 'Không gian mẫu', definition: 'Sample Space — Không gian mẫu', example: '' },
      { term_en: 'Events', term_vi: 'Biến cố', definition: 'Events — Biến cố', example: '' },
      { term_en: 'Certain event', term_vi: 'Biến cố chắc chắn', definition: 'Certain event — Biến cố chắc chắn', example: '' },
      { term_en: 'Impossible event', term_vi: 'Biến cố không thể', definition: 'Impossible event — Biến cố không thể', example: '' },
      { term_en: 'Elementary event', term_vi: 'Biến cố sơ cấp', definition: 'Elementary event — Biến cố sơ cấp', example: '' },
      { term_en: 'Compound event', term_vi: 'Biến cố phức hợp', definition: 'Compound event — Biến cố phức hợp', example: '' }
    ],
  },
  {
    id: 'chapter-note-25',
    student_id: 'system',
    topic: `Chapter 25: Statistics`,
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `Chapter 25: Statistics

📋 Overview

Statistics (Thống kê) is the science of collecting, organizing, analyzing, and interpreting data. Descriptive statistics focuses on summarizing and describing the main features of a dataset using numerical measures and visualizations.

What you'll master:

•  Measures of Central Tendency: Mean, median, mode, and quartiles

•  Measures of Dispersion: Range, interquartile range, variance, and standard deviation

•  Data Visualization: Interpreting histograms, box plots, and dot plots

•  Outlier Detection: Identifying unusual values in datasets

•  Data Interpretation: Drawing meaningful conclusions from statistical summaries

Real-world connections:

•  Educational assessment and student performance analysis

•  Quality control in manufacturing

•  Public health and epidemiology

•  Economic indicators and market research

•  Scientific research and experimental design

📚 Vocabulary & Terminology

Core Terms

Measures of Central Tendency

Measures of Dispersion

Data Visualization

🎯 Theory

1. Measures of Central Tendency (Số đặc trưng đo xu thế trung tâm)

These measures describe the "center" or "typical value" of a dataset.

1.1 Mean (Số trung bình)

Definition: The mean (or arithmetic average) is the sum of all values divided by the number of values.

Formula: For dataset x₁, x₂, ldots, x_n:

overlinex = x₁ + x₂ + cdots + x_n/n = 1/nsum_{i=1}ⁿ x_i

Properties:

•  Uses all data values

•  Sensitive to outliers (extreme values can distort the mean)

•  Unique (every dataset has exactly one mean)

When to use: When data is roughly symmetric without extreme outliers.

1.2 Median (Trung vị)

Definition: The median is the middle value when data is arranged in order.

Finding the median:

1.  Arrange data in ascending order

2.  If n is odd: Median = middle value (position n+1/2)

3.  If n is even: Median = average of two middle values (positions n/2 and n/2 + 1)

Properties:

•  Not affected by outliers (robust measure)

•  Divides data into two equal halves

•  Better than mean for skewed distributions

When to use: When data contains outliers or is skewed.

1.3 Mode (Mốt)

Definition: The mode is the value that occurs most frequently.

Properties:

•  A dataset can have no mode (all values occur once)

•  A dataset can have multiple modes (bimodal, multimodal)

•  Most useful for categorical data

When to use: For categorical data or to identify the most common value.

1.4 Quartiles (Tứ phân vị)

Definition: Quartiles divide ordered data into four equal parts.

•  Q₁ (first quartile): 25% of data is below this value

•  Q₂ (second quartile): The median (50% below)

•  Q₃ (third quartile): 75% of data is below this value

Finding quartiles:

1.  Find Q₂ (the median of the entire dataset)

2.  Find Q₁: Median of the lower half (data below Q₂)

3.  Find Q₃: Median of the upper half (data above Q₂)

Note: When n is odd, exclude the median when finding Q₁ and Q₃.

2. Measures of Dispersion (Số đặc trưng đo độ phân tán)

These measures describe how spread out the data is.

2.1 Range (Khoảng biến thiên)

Definition: The range is the difference between the maximum and minimum values.`,
    glossary: [
      { term_en: 'Statistics', term_vi: 'Thống kê', definition: 'Statistics — Thống kê', example: '' },
      { term_en: 'Measures of Central Tendency', term_vi: 'Số đặc trưng đo xu thế trung tâm', definition: 'Measures of Central Tendency — Số đặc trưng đo xu thế trung tâm', example: '' },
      { term_en: 'Mean', term_vi: 'Số trung bình', definition: 'Mean — Số trung bình', example: '' },
      { term_en: 'The mean', term_vi: 'or arithmetic average', definition: 'The mean — or arithmetic average', example: '' },
      { term_en: 'Sensitive to outliers', term_vi: 'extreme values can distort the mean', definition: 'Sensitive to outliers — extreme values can distort the mean', example: '' },
      { term_en: 'Unique', term_vi: 'every dataset has exactly one mean', definition: 'Unique — every dataset has exactly one mean', example: '' },
      { term_en: 'Median', term_vi: 'Trung vị', definition: 'Median — Trung vị', example: '' },
      { term_en: 'Not affected by outliers', term_vi: 'robust measure', definition: 'Not affected by outliers — robust measure', example: '' }
    ],
  },
];
