/**
 * Storage Service — Firebase Realtime Database + localStorage fallback
 * Khi Firebase chưa config → dùng localStorage
 * Khi Firebase đã config → lưu lên Firebase + cache localStorage
 */

import { Exam, Assignment, StudentStudyNote, Profile, UserRole } from '../types';
import { SAMPLE_HAIPHONG_EXAM } from '../data/sampleExam';
import { SAMPLE_STUDY_NOTES } from '../data/sampleStudyNotes';
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
  email: 'teacher.math@chuyenhaiphong.edu.vn',
  role: 'teacher',
  full_name: 'ThS. Nguyễn Văn Hải (Tổ Toán - THPT Chuyên Trần Phú)',
  created_at: new Date().toISOString(),
};

const DEFAULT_STUDENT: Profile = {
  id: 'student-hp-01',
  email: 'student.olympiad@haiphong.edu.vn',
  role: 'student',
  full_name: 'Trần Minh Quang (Đội tuyển HSG Toán Hải Phòng)',
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

  // ========================================
  // Exams — Firebase + localStorage
  // ========================================
  getExams(): Exam[] {
    const local = readLocal<Exam[]>(STORAGE_KEYS.EXAMS, []);
    if (local.length > 0) return local;
    const initial = [SAMPLE_HAIPHONG_EXAM];
    writeLocal(STORAGE_KEYS.EXAMS, initial);
    return initial;
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
      const exams = Object.values(fbExams);
      if (exams.length > 0) {
        writeLocal(STORAGE_KEYS.EXAMS, exams);
        return exams;
      }
    }
    return this.getExams();
  },

  // Subscribe to realtime exam updates
  onExamsChanged(callback: (exams: Exam[]) => void): () => void {
    if (!isFirebaseConfigured()) return () => {};

    return fbOnValue('exams', (data) => {
      if (data) {
        const exams = Object.values(data) as Exam[];
        writeLocal(STORAGE_KEYS.EXAMS, exams);
        callback(exams);
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

  // ========================================
  // Study Notes
  // ========================================
  getStudyNotes(): StudentStudyNote[] {
    const local = readLocal<StudentStudyNote[]>(STORAGE_KEYS.STUDY_NOTES, []);
    if (local.length > 0) return local;
    const initial = SAMPLE_STUDY_NOTES;
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
