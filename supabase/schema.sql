-- ====================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR HAI PHONG MATH OLYMPIAD (THPT)
-- Conforming to Hai Phong DOET Gifted High School Exam Matrix in English
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
-- Roles: 'teacher' | 'student'
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. EXAMS TABLE
-- Conforms to Hai Phong 22 questions / 90 minutes standard
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    mode TEXT NOT NULL DEFAULT 'bilingual' CHECK (mode IN ('bilingual', 'english_only')),
    duration_minutes INTEGER NOT NULL DEFAULT 90,
    is_published BOOLEAN NOT NULL DEFAULT false,
    access_code TEXT UNIQUE NOT NULL,
    exam_type TEXT NOT NULL DEFAULT 'haiphong_matrix' CHECK (exam_type IN ('haiphong_matrix', 'topic_practice', 'custom')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. QUESTIONS TABLE
-- 2 parts: PART_1 (12 MCQs: A,B,C,D) and PART_2 (10 Short Answer: numeric/fraction)
-- 3 Strands: algebra_calculus (9), geometry_measurement (9), statistics_discrete (4)
-- Difficulty: understanding (6), application (9), advanced (7)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    part TEXT NOT NULL CHECK (part IN ('PART_1', 'PART_2')),
    order_index INTEGER NOT NULL,
    strand TEXT NOT NULL CHECK (strand IN ('algebra_calculus', 'geometry_measurement', 'statistics_discrete')),
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('understanding', 'application', 'advanced')),
    question_en TEXT NOT NULL,
    question_vi TEXT,
    options_en JSONB, -- Array of 4 strings for PART_1: ["A...", "B...", "C...", "D..."]
    options_vi JSONB,
    correct_answer TEXT NOT NULL, -- e.g. "B" for PART_1 or "3/4" / "42" / "0.25" for PART_2
    acceptable_answers TEXT[], -- Alternative representations, e.g. ["1/2", "0.5"]
    solution_en TEXT NOT NULL,
    solution_vi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_exam_order UNIQUE (exam_id, order_index)
);

-- 4. ASSIGNMENTS & SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'completed')),
    score NUMERIC(5, 2), -- Scale of 10.00
    answers JSONB DEFAULT '{}'::jsonb, -- map of question_id -> user answer
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. STUDENT STUDY NOTES TABLE
CREATE TABLE IF NOT EXISTS student_study_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'bilingual' CHECK (mode IN ('bilingual', 'english_only')),
    content_markdown TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_study_notes ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can read profiles; users can update own profile
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Exams: Published exams viewable by students; teachers manage their exams
CREATE POLICY "Published exams are viewable by all authenticated users" ON exams
    FOR SELECT USING (is_published = true OR auth.uid() = teacher_id);
CREATE POLICY "Teachers can insert exams" ON exams
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update their own exams" ON exams
    FOR UPDATE USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete their own exams" ON exams
    FOR DELETE USING (auth.uid() = teacher_id);

-- Questions: Viewable if corresponding exam is viewable
CREATE POLICY "Questions are viewable if exam is viewable" ON questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exams
            WHERE exams.id = questions.exam_id
            AND (exams.is_published = true OR exams.teacher_id = auth.uid())
        )
    );
CREATE POLICY "Teachers can modify questions of their exams" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM exams
            WHERE exams.id = questions.exam_id
            AND exams.teacher_id = auth.uid()
        )
    );

-- Assignments: Students view and update their assignments; Teachers view assignments for their exams
CREATE POLICY "Students view their assignments" ON assignments
    FOR SELECT USING (
        student_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM exams
            WHERE exams.id = assignments.exam_id
            AND exams.teacher_id = auth.uid()
        )
    );
CREATE POLICY "Students can create and update their assignments" ON assignments
    FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can submit answers" ON assignments
    FOR UPDATE USING (student_id = auth.uid());

-- Study Notes: Students can CRUD their own notes
CREATE POLICY "Students manage their own study notes" ON student_study_notes
    FOR ALL USING (student_id = auth.uid());

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exams_access_code ON exams(access_code);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_exam ON assignments(exam_id);
