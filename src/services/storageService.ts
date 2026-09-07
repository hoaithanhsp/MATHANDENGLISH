/**
 * Storage Service — Firebase Realtime Database + localStorage fallback
 * Khi Firebase chưa config → dùng localStorage
 * Khi Firebase đã config → lưu lên Firebase + cache localStorage
 */

import { Exam, Assignment, StudentStudyNote, Profile, UserRole } from '../types';
import { CHAPTER_STUDY_NOTES } from '../data/chapterStudyNotes';
import {
  isFirebaseConfigured,
  fbSet,
  fbGet,
  fbRemove,
  fbOnValue,
} from '../lib/firebase';

const STORAGE_KEYS = {
  CURRENT_USER: 'hp_math_current_user',
  EXAMS: 'hp_math_exams',
  ASSIGNMENTS: 'hp_math_assignments',
  STUDY_NOTES: 'hp_math_study_notes',
  THEME: 'hp_math_theme',
};

const DEFAULT_TEACHER: Profile = {
  id: 'teacher-hp-01',
  email: 'giaovien@hpmath.edu.vn',
  role: 'teacher',
  full_name: 'Trần Hoài Thanh (THPT Khúc Thừa Dụ, TP.Hải Phòng)',
  created_at: new Date().toISOString(),
};

const DEFAULT_STUDENT: Profile = {
  id: 'student-hp-01',
  email: 'student.olympiad@haiphong.edu.vn',
  role: 'student',
  full_name: 'Học sinh',
  created_at: new Date().toISOString(),
};

// Helper: read from localStorage safely
const readLocal = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // ignore parse errors
    }
  }
  return fallback;
};

// Helper: write to localStorage
const writeLocal = (key: string, data: any): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const storageService = {
  // ========================================
  // Profiles & Role
  // ========================================
  getCurrentUser(): Profile {
    return readLocal<Profile>(STORAGE_KEYS.CURRENT_USER, DEFAULT_TEACHER);
  },

  setCurrentRole(role: UserRole): Profile {
    const user = role === 'teacher' ? DEFAULT_TEACHER : DEFAULT_STUDENT;
    writeLocal(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },

  setCurrentUser(profile: Profile): void {
    writeLocal(STORAGE_KEYS.CURRENT_USER, profile);
  },

  // ========================================
  // Exams — Firebase + localStorage
  // ========================================
  getExams(): Exam[] {
    const raw = readLocal<Exam[]>(STORAGE_KEYS.EXAMS, []);
    // Tự động thanh lọc các đề thi demo cũ nếu còn lưu trong localStorage
    const cleaned = raw.filter(
      (e) => e.id !== 'hp-exam-sample-01' && e.access_code !== 'HP-MATH-2026'
    );
    if (cleaned.length !== raw.length) {
      writeLocal(STORAGE_KEYS.EXAMS, cleaned);
    }
    return cleaned;
  },

  async saveExam(exam: Exam): Promise<void> {
    // Always save to localStorage first (instant)
    const exams = this.getExams();
    const idx = exams.findIndex((e) => e.id === exam.id);
    if (idx >= 0) {
      exams[idx] = exam;
    } else {
      exams.unshift(exam);
    }
    writeLocal(STORAGE_KEYS.EXAMS, exams);

    // Also save to Firebase if configured
    if (isFirebaseConfigured()) {
      await fbSet(`exams/${exam.id}`, exam);
    }
  },

  async deleteExam(examId: string): Promise<void> {
    const exams = this.getExams().filter((e) => e.id !== examId);
    writeLocal(STORAGE_KEYS.EXAMS, exams);

    if (isFirebaseConfigured()) {
      await fbRemove(`exams/${examId}`);
    }
  },

  getExamByAccessCode(code: string): Exam | undefined {
    const exams = this.getExams();
    const norm = code.trim().toUpperCase();
    return exams.find((e) => e.access_code.toUpperCase() === norm);
  },

  // Sync exams from Firebase (for initial load)
  async syncExamsFromFirebase(): Promise<Exam[]> {
    if (!isFirebaseConfigured()) return this.getExams();

    const fbExams = await fbGet<Record<string, Exam>>('exams');
    if (fbExams) {
      const exams = Object.values(fbExams).filter(
        (e) => e.id !== 'hp-exam-sample-01' && e.access_code !== 'HP-MATH-2026'
      );
      writeLocal(STORAGE_KEYS.EXAMS, exams);
      return exams;
    }
    return this.getExams();
  },

  // Subscribe to realtime exam updates
  onExamsChanged(callback: (exams: Exam[]) => void): () => void {
    if (!isFirebaseConfigured()) return () => {};

    return fbOnValue('exams', (data) => {
      if (data) {
        const exams = (Object.values(data) as Exam[]).filter(
          (e) => e.id !== 'hp-exam-sample-01' && e.access_code !== 'HP-MATH-2026'
        );
        writeLocal(STORAGE_KEYS.EXAMS, exams);
        callback(exams);
      } else {
        writeLocal(STORAGE_KEYS.EXAMS, []);
        callback([]);
      }
    });
  },

  // ========================================
  // Assignments
  // ========================================
  getAssignments(): Assignment[] {
    return readLocal<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  },

  async saveAssignment(assignment: Assignment): Promise<void> {
    const list = this.getAssignments();
    const idx = list.findIndex((a) => a.id === assignment.id);
    if (idx >= 0) {
      list[idx] = assignment;
    } else {
      list.unshift(assignment);
    }
    writeLocal(STORAGE_KEYS.ASSIGNMENTS, list);

    if (isFirebaseConfigured()) {
      await fbSet(`assignments/${assignment.id}`, assignment);
    }
  },

  // Sync assignments from Firebase (for initial load — GV side)
  async syncAssignmentsFromFirebase(): Promise<Assignment[]> {
    if (!isFirebaseConfigured()) return this.getAssignments();

    const fbData = await fbGet<Record<string, Assignment>>('assignments');
    if (fbData) {
      const list = Object.values(fbData);
      if (list.length > 0) {
        writeLocal(STORAGE_KEYS.ASSIGNMENTS, list);
        return list;
      }
    }
    return this.getAssignments();
  },

  // Subscribe to realtime assignment updates (GV nhận bài HS nộp)
  onAssignmentsChanged(callback: (assignments: Assignment[]) => void): () => void {
    if (!isFirebaseConfigured()) return () => {};

    return fbOnValue('assignments', (data) => {
      if (data) {
        const list = Object.values(data) as Assignment[];
        writeLocal(STORAGE_KEYS.ASSIGNMENTS, list);
        callback(list);
      }
    });
  },

  // ========================================
  // Study Notes
  // ========================================
  getStudyNotes(): StudentStudyNote[] {
    const raw = readLocal<StudentStudyNote[]>(STORAGE_KEYS.STUDY_NOTES, []);
    // Lọc bỏ các ghi chú demo mẫu
    const cleaned = raw.filter(
      (n) => n.id !== 'note-01' && n.id !== 'note-02' && n.student_id !== 'sample-student-id'
    );
    if (raw.length > 0) {
      if (cleaned.length !== raw.length) {
        writeLocal(STORAGE_KEYS.STUDY_NOTES, cleaned);
      }
      return cleaned;
    }
    // Nạp mặc định: 25 chương học liệu Toán Tiếng Anh chuẩn
    const initial = [...CHAPTER_STUDY_NOTES];
    writeLocal(STORAGE_KEYS.STUDY_NOTES, initial);
    return initial;
  },

  async saveStudyNote(note: StudentStudyNote): Promise<void> {
    const list = this.getStudyNotes();
    const idx = list.findIndex((n) => n.id === note.id);
    if (idx >= 0) {
      list[idx] = note;
    } else {
      list.unshift(note);
    }
    writeLocal(STORAGE_KEYS.STUDY_NOTES, list);

    if (isFirebaseConfigured()) {
      await fbSet(`study_notes/${note.id}`, note);
    }
  },

  async deleteStudyNote(id: string): Promise<void> {
    const list = this.getStudyNotes().filter((n) => n.id !== id);
    writeLocal(STORAGE_KEYS.STUDY_NOTES, list);

    if (isFirebaseConfigured()) {
      await fbRemove(`study_notes/${id}`);
    }
  },

  // ========================================
  // Theme
  // ========================================
  getTheme(): 'light' | 'dark' {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light';
  },

  setTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
};
