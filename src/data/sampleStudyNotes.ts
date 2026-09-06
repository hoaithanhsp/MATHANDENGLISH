import { StudentStudyNote } from '../types';

export const SAMPLE_STUDY_NOTES: StudentStudyNote[] = [
  {
    id: 'note-01',
    student_id: 'sample-student-id',
    topic: 'Pigeonhole Principle in Combinatorics (Nguyên lý Dirichlet trong Rời rạc)',
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `
# The Pigeonhole Principle (Dirichlet's Box Principle)
### *Nguyên lý Dirichlet trong giải toán HSG môn Toán*

---

## 1. Core Mathematical Theory (Lý thuyết cốt lõi)
**Basic Formulation:** If $n$ items (pigeons) are put into $k$ containers (holes) with $n > k$, then at least one container must contain at least two items.

**Generalized Formulation:** If $n$ items are distributed into $k$ containers, then at least one container contains at least $\\lceil n/k \\rceil$ items, and at least one container contains at most $\\lfloor n/k \\rfloor$ items.

> **Continuous & Geometric Form:** If a set of area/volume $S$ is covered by subsets with total measure $\\sum S_i > k \\cdot S$, then some point is covered by at least $k+1$ subsets.

---

## 2. Typical Problem-Solving Methods (Phương pháp giải điển hình)
1. **Method of Residue Classes (Thặng dư đồng dư):**
   - Partition numbers modulo $m$. For any $m+1$ integers, by Pigeonhole, at least two share the same remainder modulo $m$.
2. **Geometric Subdivision (Chia lưới hình học):**
   - In a square of side 1, divide into $k^2$ smaller squares of side $1/k$. By Pigeonhole, if more points than squares are chosen, two points lie in the same small square, giving distance bounded by $\\sqrt{2}/k$.
3. **Graph Coloring (Lý thuyết đồ thị & Định lý Ramsey):**
   - For $n=6$ vertices with edges colored red or blue, there always exists a monochromatic triangle ($R(3,3)=6$).
`,
    glossary: [
      {
        term_en: 'Pigeonhole Principle / Dirichlet Principle',
        term_vi: 'Nguyên lý Dirichlet / Nguyên lý chuồng bồ câu',
        definition: 'A fundamental counting theorem asserting that partitioning more objects than boxes forces an overlap.',
        example: 'Among any 13 people, at least two were born in the same month.'
      },
      {
        term_en: 'Residue class modulo m',
        term_vi: 'Lớp đồng dư theo modulo m',
        definition: 'The set of all integers with remainder $r$ upon division by $m$.',
        example: 'Any integer belongs to one of the residue classes $0, 1, \\dots, m-1$.'
      },
      {
        term_en: 'Monochromatic subgraph',
        term_vi: 'Đồ thị con đơn sắc',
        definition: 'A subgraph whose edges all receive the same assigned color.',
        example: 'Ramsey theorem ensures a monochromatic triangle $K_3$ in $K_6$.'
      }
    ],
    methods: [
      {
        name_en: 'Bounding Distance by Grid Partitioning',
        name_vi: 'Đánh giá khoảng cách qua phép phân hoạch lưới',
        steps: [
          'Decompose the bounded domain into $k$ convex subregions with small diameter.',
          'Count the given points $n > k$.',
          'Conclude two points fall in the same subregion and apply the diameter bound.'
        ],
        sample_problem: 'Given 5 points inside an equilateral triangle of side 2. Prove that there exist two points at distance $\\le 1$.',
        solution: 'Divide the equilateral triangle of side 2 into 4 smaller equilateral triangles of side 1 by connecting the midpoints of the sides. By Pigeonhole Principle, with 5 points placed into 4 small triangles, at least two points must lie in the same small triangle. Since the diameter of an equilateral triangle of side 1 is 1, the distance between these two points is $\\le 1$.'
      }
    ]
  },
  {
    id: 'note-02',
    student_id: 'sample-student-id',
    topic: 'Conic Sections in Plane Geometry (3 đường Conic trong Hình học phẳng)',
    mode: 'bilingual',
    created_at: new Date().toISOString(),
    content_markdown: `
# Conic Sections (Ellipse, Hyperbola, Parabola)
### *3 Đường Conic trong hình học toạ độ THPT*

---

## 1. Canonical Equations & Focal Geometry
| Curve | Canonical Equation | Eccentricity $e$ | Foci Distance |
| :--- | :--- | :--- | :--- |
| **Ellipse** | $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ ($a > b$) | $e = \\frac{c}{a} < 1$ | $c^2 = a^2 - b^2$ |
| **Hyperbola** | $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ | $e = \\frac{c}{a} > 1$ | $c^2 = a^2 + b^2$ |
| **Parabola** | $y^2 = 2px$ ($p > 0$) | $e = 1$ | Focus $F(p/2, 0)$, Directrix $x = -p/2$ |

---

## 2. Tangent Lines and Polar Coordinates
The tangent to an ellipse $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ at $M(x_0, y_0)$ is given by:
$$\\frac{x x_0}{a^2} + \\frac{y y_0}{b^2} = 1$$
`,
    glossary: [
      {
        term_en: 'Eccentricity (e)',
        term_vi: 'Tâm sai',
        definition: 'Ratio of distance to focus over distance to directrix.',
        example: 'For a circle $e = 0$, ellipse $0 < e < 1$, parabola $e = 1$, hyperbola $e > 1$.'
      },
      {
        term_en: 'Directrix',
        term_vi: 'Đường chuẩn',
        definition: 'A fixed line used in defining conic sections along with the focus.',
        example: 'The directrix of $y^2 = 4x$ is $x = -1$.'
      },
      {
        term_en: 'Asymptote',
        term_vi: 'Tiệm cận',
        definition: 'A line that a curve approaches arbitrary closely as it heads to infinity.',
        example: 'Hyperbola $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ has asymptotes $y = \\pm \\frac{b}{a}x$.'
      }
    ],
    methods: [
      {
        name_en: 'Tangency Condition with a Straight Line',
        name_vi: 'Điều kiện tiếp xúc của đường conic với đường thẳng',
        steps: [
          'Line $Ax + By + C = 0$',
          'For ellipse $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$: $a^2 A^2 + b^2 B^2 = C^2$.'
        ],
        sample_problem: 'Find $C$ so that $3x - 4y + C = 0$ is tangent to $\\frac{x^2}{16} + \\frac{y^2}{9} = 1$.',
        solution: 'Tangency condition: $a^2 A^2 + b^2 B^2 = C^2 \\iff 16(3^2) + 9((-4)^2) = C^2 \\iff 16(9) + 9(16) = 288 \\implies C = \\pm 12\\sqrt{2}$.'
      }
    ]
  }
];
