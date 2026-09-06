/**
 * TypeScript Data Models for Hai Phong Math Olympiad Platform
 * Strictly conforming to DOET Hai Phong Math Competition Matrix
 */

export type UserRole = 'teacher' | 'student';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

export type ExamMode = 'bilingual' | 'english_only';
export type ExamType = 'haiphong_matrix' | 'topic_practice' | 'custom';
export type QuestionPart = 'PART_1' | 'PART_2'; // PART_1 = 12 MCQs, PART_2 = 10 Short-answer
export type CognitiveLevel = 'understanding' | 'application' | 'advanced';
export type MathStrand = 'algebra_calculus' | 'geometry_measurement' | 'statistics_discrete';

export interface Question {
  id: string;
  exam_id: string;
  part: QuestionPart;
  order_index: number; // 1 to 22
  strand: MathStrand;
  topic: string;
  difficulty: CognitiveLevel;
  question_en: string;
  question_vi?: string;
  options_en?: string[]; // exactly 4 items for PART_1: ["A. ...", "B. ...", "C. ...", "D. ..."] or text without prefix
  options_vi?: string[];
  correct_answer: string; // "A"|"B"|"C"|"D" or numerical / fraction string like "42", "1/3", "-5.5"
  acceptable_answers?: string[];
  solution_en: string;
  solution_vi?: string;
}

export interface Exam {
  id: string;
  teacher_id?: string;
  title: string;
  description?: string;
  mode: ExamMode;
  duration_minutes: number; // default 90
  is_published: boolean;
  access_code: string;
  exam_type: ExamType;
  created_at: string;
  questions?: Question[];
}

export interface Assignment {
  id: string;
  exam_id: string;
  student_id: string;
  student_name?: string;
  status: 'assigned' | 'completed';
  score?: number; // scale 10.00
  answers: Record<string, string>; // question_id -> student answer
  started_at?: string;
  submitted_at?: string;
  created_at: string;
}

export interface StudentStudyNote {
  id: string;
  student_id: string;
  topic: string;
  mode: ExamMode;
  content_markdown: string;
  glossary?: { term_en: string; term_vi: string; definition: string; example: string }[];
  methods?: { name_en: string; name_vi: string; steps: string[]; sample_problem: string; solution: string }[];
  created_at: string;
}

// Matrix specification representation
export interface MatrixRule {
  strand: MathStrand;
  strand_name_vi: string;
  strand_name_en: string;
  question_count: number;
  topics: string[];
}

export const HAIPHONG_MATRIX_RULES: MatrixRule[] = [
  {
    strand: 'algebra_calculus',
    strand_name_vi: 'Đại số – Giải tích',
    strand_name_en: 'Algebra & Calculus',
    question_count: 9,
    topics: [
      'Trigonometry (Lượng giác)',
      'Sequences & Progressions (Dãy số, Cấp số cộng, Cấp số nhân)',
      'Limits & Continuous Functions (Giới hạn & Hàm số liên tục)',
      'Exponential & Logarithmic Functions (Mũ & Logarit)',
      'System of Linear Inequalities in Two Variables (Hệ BPT bậc nhất 2 ẩn)',
      'Quadratic Functions & Inequalities (Hàm số bậc hai)'
    ]
  },
  {
    strand: 'geometry_measurement',
    strand_name_vi: 'Hình học và Đo lường',
    strand_name_en: 'Geometry & Measurement',
    question_count: 9,
    topics: [
      'Trigonometric Relations in Triangles (Hệ thức lượng trong tam giác)',
      'Lines & Circles in the Coordinate Plane (PT đường thẳng & đường tròn)',
      'Conic Sections: Ellipse, Hyperbola, Parabola (3 đường Conic)',
      'Parallelism & Perpendicularity in Space (Quan hệ song song & vuông góc trong không gian)'
    ]
  },
  {
    strand: 'statistics_discrete',
    strand_name_vi: 'Thống kê, Xác suất, Rời rạc, Số học',
    strand_name_en: 'Statistics, Probability, Discrete Math & Number Theory',
    question_count: 4,
    topics: [
      'Combinatorics & Probability (Tổ hợp & Xác suất)',
      'Grouped Data Statistics: Quartiles, Median (Số liệu ghép nhóm)',
      'Pigeonhole Principle in Real-World Problems (Nguyên lý Dirichlet)',
      'Invariance Principle & Monovariants (Nguyên lý bất biến)'
    ]
  }
];

export const DIFFICULTY_DISTRIBUTION = {
  understanding: { count: 6, percentage: '27.3%', name_vi: 'Thông hiểu', name_en: 'Understanding' },
  application: { count: 9, percentage: '40.9%', name_vi: 'Vận dụng', name_en: 'Application' },
  advanced: { count: 7, percentage: '31.8%', name_vi: 'Vận dụng cao', name_en: 'Higher-order Thinking' }
};
