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
  hints?: string[]; // Practice hints before revealing full solution
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
  score?: number; // scale 20.00 (theo chuẩn HSG Hải Phòng)
  answers: Record<string, string>; // question_id -> student answer
  tab_switch_count?: number; // Count of tab switches during live exam
  teacher_feedback?: string; // Lời phê / phản hồi dặn dò của giáo viên
  graded_at?: string;        // Thời điểm giáo viên nhận xét/chấm bài
  started_at?: string;
  submitted_at?: string;
  created_at: string;
}

export interface ExamSession {
  id: string;
  exam_id: string;
  access_code?: string;
  student_id: string;
  student_name: string;
  status: 'in_progress' | 'completed';
  started_at: string;
  last_active_at: string;
  answered_count: number;
  total_questions: number;
  submitted_at?: string;
  score?: number;
  correct_count?: number;
  wrong_count?: number;
  answers?: Record<string, string>;
  tab_switch_count?: number;
}

export interface ProofProblem {
  id: string;
  title: string;
  strand: MathStrand;
  difficulty: CognitiveLevel;
  topic: string;
  statement_en: string;
  statement_vi?: string;
  hints?: string[];
  key_vocabulary?: string[];
  sample_proof_en?: string;
}

export interface ProofFeedback {
  rigor_score: number; // Thang điểm độ chặt chẽ toán học (0 - 10)
  language_score: number; // Thang điểm tiếng Anh học thuật (0 - 10)
  grammar_issues?: { original: string; correction: string; explanation: string }[];
  math_reasoning_feedback?: string;
  polished_proof_en: string;
  pedagogical_advice?: string;
}

export type MistakeReason =
  | 'formula_error'
  | 'language_misinterpretation'
  | 'careless_calculation'
  | 'concept_gap'
  | 'other';

export interface MistakeEntry {
  id: string;
  student_id: string;
  question: Question;
  exam_title: string;
  student_answer: string;
  mistake_reason?: MistakeReason;
  notes?: string;
  timestamp: string;
  mastered?: boolean;
}

export interface VocabWord {
  id: string;
  term_en: string;
  pronunciation?: string;
  term_vi: string;
  strand?: MathStrand;
  definition: string;
  example?: string;
  is_bookmarked?: boolean;
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
      'System of Linear Inequalities in Two Variables & Linear Programming (Hệ BPT bậc nhất hai ẩn & Quy hoạch tuyến tính)',
      'Quadratic Functions & Real-World Applications (Hàm số bậc hai & Ứng dụng thực tế)',
      'Trigonometric Functions & Equations (Hàm số lượng giác, PT lượng giác)',
      'Sequences & Progressions (Cấp số cộng, cấp số nhân, dãy số)',
      'Limits of Sequences & Functions, Continuous Functions (Giới hạn dãy số, hàm số liên tục - Trọng tâm VDC Phần II)',
      'Exponential & Logarithmic Functions, Parametric Equations (Hàm số mũ, logarit, PT/BPT mũ - logarit chứa tham số)'
    ]
  },
  {
    strand: 'geometry_measurement',
    strand_name_vi: 'Hình học và Đo lường',
    strand_name_en: 'Geometry & Measurement',
    question_count: 9,
    topics: [
      'Trigonometric Relations in Triangles (Hệ thức lượng trong tam giác)',
      'Lines & Circles in the Coordinate Plane (PT đường thẳng & đường tròn Oxy)',
      'Conic Sections: Ellipse, Hyperbola, Parabola & Real-World Models (Ba đường conic & Bài toán thực tế cầu vòm, phòng thì thầm)',
      'Parallelism in Space (Quan hệ song song trong không gian)',
      'Perpendicularity in Space (Quan hệ vuông góc trong không gian - đến bài đường thẳng vuông góc mặt phẳng: góc, thiết diện, khoảng cách)'
    ]
  },
  {
    strand: 'statistics_discrete',
    strand_name_vi: 'Thống kê, Xác suất, Rời rạc, Số học',
    strand_name_en: 'Statistics, Probability, Discrete Math & Number Theory',
    question_count: 4,
    topics: [
      'Combinatorics & Classical Probability (Tổ hợp & Xác suất cổ điển)',
      'Grouped Data Statistics: Quartiles, Median, Mode (Các số đặc trưng của mẫu số liệu ghép nhóm - GDPT 2018)',
      'Pigeonhole Principle in Real-World Problems (Bài toán thực tế vận dụng nguyên lý Dirichlet chuồng - thỏ)',
      'Invariance Principle & Monovariants (Bài toán thực tế vận dụng nguyên lý bất biến và đơn biến)'
    ]
  }
];

export const DIFFICULTY_DISTRIBUTION = {
  understanding: { count: 8, percentage: '36.4%', name_vi: 'Thông hiểu (Phần I: 5 câu, Phần II: 3 câu)', name_en: 'Understanding' },
  application: { count: 9, percentage: '40.9%', name_vi: 'Vận dụng (Phần I: 5 câu, Phần II: 4 câu)', name_en: 'Application' },
  advanced: { count: 5, percentage: '22.7%', name_vi: 'Vận dụng cao (Phần I: 2 câu, Phần II: 3 câu)', name_en: 'Higher-order Thinking' }
};

