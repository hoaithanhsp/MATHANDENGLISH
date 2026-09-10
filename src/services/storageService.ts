/**
 * Storage Service — Firebase Realtime Database + localStorage fallback
 * Khi Firebase chưa config → dùng localStorage
 * Khi Firebase đã config → lưu lên Firebase + cache localStorage
 */

import { Exam, Assignment, StudentStudyNote, Profile, UserRole, MistakeEntry, MistakeReason, VocabWord } from '../types';
import { CHAPTER_STUDY_NOTES } from '../data/chapterStudyNotes';
import { ALL_HAIPHONG_PRELOADED_EXAMS } from '../data/haiPhongExams';
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
  MISTAKES: 'hp_math_mistakes',
  VOCAB: 'hp_math_vocab',
  AUTOSAVE_PREFIX: 'hp_exam_autosave_',
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
  full_name: 'Phạm Quang Huy',
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
      (e) => e && e.id !== 'hp-exam-sample-01' && e.access_code !== 'HP-MATH-2026'
    );

    // Tự động nạp các bộ đề thi chuẩn Hải Phòng (Mock 01, Mock 02, Code 136)
    let modified = false;
    for (const preloaded of ALL_HAIPHONG_PRELOADED_EXAMS) {
      const exists = cleaned.some(
        (e) => e.id === preloaded.id || e.access_code?.toUpperCase() === preloaded.access_code.toUpperCase()
      );
      if (!exists) {
        cleaned.push(preloaded);
        modified = true;
      }
    }

    if (cleaned.length !== raw.length || modified) {
      writeLocal(STORAGE_KEYS.EXAMS, cleaned);
    }
    return cleaned;
  },


  mergeExams(currentList: Exam[], newList: Exam[]): Exam[] {
    const map = new Map<string, Exam>();
    for (const item of currentList) {
      if (item && item.id) map.set(item.id, item);
    }
    for (const item of newList) {
      if (item && item.id) map.set(item.id, item);
    }
    return Array.from(map.values());
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
    return exams.find((e) => e.access_code?.toUpperCase() === norm);
  },

  /** Tra cứu đề thi theo mã phòng thi (tìm trong local cache + truy vấn trực tiếp từ Firebase Cloud) */
  async findExamByCodeAsync(code: string): Promise<Exam | undefined> {
    const norm = code.trim().toUpperCase();
    if (!norm) return undefined;

    // 1. Kiểm tra nhanh trong local memory/cache
    const localExams = this.getExams();
    const foundLocal = localExams.find((e) => e.access_code?.toUpperCase() === norm);
    if (foundLocal) return foundLocal;

    // 2. Tra cứu trực tiếp trên Firebase Realtime Database
    if (isFirebaseConfigured()) {
      try {
        const fbExams = await fbGet<Record<string, Exam>>('exams');
        if (fbExams) {
          const cloudExams = Object.values(fbExams).filter(
            (e) => e && e.id !== 'hp-exam-sample-01' && e.access_code !== 'HP-MATH-2026'
          );
          const merged = this.mergeExams(localExams, cloudExams);
          writeLocal(STORAGE_KEYS.EXAMS, merged);
          return merged.find((e) => e.access_code?.toUpperCase() === norm);
        }
      } catch (err) {
        console.error('Lỗi khi tra cứu đề thi trên Firebase:', err);
      }
    }

    // 3. Fallback tra cứu trong danh sách đề thi chuẩn tích hợp sẵn
    const preloaded = ALL_HAIPHONG_PRELOADED_EXAMS.find(
      (e) => e.access_code?.toUpperCase() === norm
    );
    if (preloaded) return preloaded;

    return undefined;
  },

  // Sync exams from Firebase (for initial load)
  async syncExamsFromFirebase(): Promise<Exam[]> {
    const current = this.getExams();
    if (!isFirebaseConfigured()) return current;

    try {
      const fbExams = await fbGet<Record<string, Exam>>('exams');
      if (fbExams) {
        const cloudExams = Object.values(fbExams).filter(
          (e) => e && e.id !== 'hp-exam-sample-01' && e.access_code !== 'HP-MATH-2026'
        );
        const merged = this.mergeExams(current, cloudExams);
        writeLocal(STORAGE_KEYS.EXAMS, merged);

        // Tự động đẩy các đề chỉ có ở local lên Firebase
        for (const localExam of current) {
          if (localExam.id && !cloudExams.some((c) => c.id === localExam.id)) {
            fbSet(`exams/${localExam.id}`, localExam).catch(console.error);
          }
        }

        return merged;
      } else {
        // Nếu Firebase chưa có danh sách nào nhưng local có đề, đẩy lên Firebase
        if (current.length > 0) {
          for (const localExam of current) {
            fbSet(`exams/${localExam.id}`, localExam).catch(console.error);
          }
        }
      }
    } catch (err) {
      console.warn('Sync exams warning:', err);
    }
    return current;
  },

  // Subscribe to realtime exam updates
  onExamsChanged(callback: (exams: Exam[]) => void): () => void {
    if (!isFirebaseConfigured()) return () => {};

    return fbOnValue('exams', (data) => {
      const current = this.getExams();
      if (data) {
        const cloudExams = (Object.values(data) as Exam[]).filter(
          (e) => e && e.id !== 'hp-exam-sample-01' && e.access_code !== 'HP-MATH-2026'
        );
        const merged = this.mergeExams(current, cloudExams);
        writeLocal(STORAGE_KEYS.EXAMS, merged);
        callback(merged);
      } else {
        callback(current);
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

  async updateAssignmentFeedback(assignmentId: string, feedback: string): Promise<void> {
    const list = this.getAssignments();
    const idx = list.findIndex((a) => a.id === assignmentId);
    if (idx >= 0) {
      list[idx].teacher_feedback = feedback;
      list[idx].graded_at = new Date().toISOString();
      writeLocal(STORAGE_KEYS.ASSIGNMENTS, list);

      if (isFirebaseConfigured()) {
        await fbSet(`assignments/${assignmentId}/teacher_feedback`, feedback);
        await fbSet(`assignments/${assignmentId}/graded_at`, list[idx].graded_at);
      }
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
  // Auto-Save for Live Exams
  // ========================================
  getExamAutoSave<T = any>(examId: string, studentKey: string): T | null {
    const key = `${STORAGE_KEYS.AUTOSAVE_PREFIX}${examId}_${studentKey}`;
    return readLocal<T | null>(key, null);
  },

  saveExamAutoSave(examId: string, studentKey: string, data: any): void {
    const key = `${STORAGE_KEYS.AUTOSAVE_PREFIX}${examId}_${studentKey}`;
    writeLocal(key, data);
  },

  clearExamAutoSave(examId: string, studentKey: string): void {
    const key = `${STORAGE_KEYS.AUTOSAVE_PREFIX}${examId}_${studentKey}`;
    localStorage.removeItem(key);
  },

  // ========================================
  // Smart Mistake Notebook (Sổ tay bài tập sai)
  // ========================================
  getMistakes(studentId?: string): MistakeEntry[] {
    const list = readLocal<MistakeEntry[]>(STORAGE_KEYS.MISTAKES, []);
    if (studentId) {
      return list.filter((m) => m.student_id === studentId);
    }
    return list;
  },

  saveMistake(entry: MistakeEntry): void {
    const list = this.getMistakes();
    // Tránh trùng lặp câu hỏi sai cho cùng học sinh
    const idx = list.findIndex(
      (m) => m.student_id === entry.student_id && m.question.id === entry.question.id
    );
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...entry };
    } else {
      list.unshift(entry);
    }
    writeLocal(STORAGE_KEYS.MISTAKES, list);
  },

  saveMistakes(entries: MistakeEntry[]): void {
    const list = this.getMistakes();
    for (const entry of entries) {
      const idx = list.findIndex(
        (m) => m.student_id === entry.student_id && m.question.id === entry.question.id
      );
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...entry };
      } else {
        list.unshift(entry);
      }
    }
    writeLocal(STORAGE_KEYS.MISTAKES, list);
  },

  updateMistakeReason(mistakeId: string, reason: MistakeReason, notes?: string): void {
    const list = this.getMistakes();
    const target = list.find((m) => m.id === mistakeId);
    if (target) {
      target.mistake_reason = reason;
      if (notes !== undefined) target.notes = notes;
      writeLocal(STORAGE_KEYS.MISTAKES, list);
    }
  },

  toggleMistakeMastered(mistakeId: string): void {
    const list = this.getMistakes();
    const target = list.find((m) => m.id === mistakeId);
    if (target) {
      target.mastered = !target.mastered;
      writeLocal(STORAGE_KEYS.MISTAKES, list);
    }
  },

  deleteMistake(mistakeId: string): void {
    const list = this.getMistakes().filter((m) => m.id !== mistakeId);
    writeLocal(STORAGE_KEYS.MISTAKES, list);
  },

  clearMistakes(): void {
    writeLocal(STORAGE_KEYS.MISTAKES, []);
  },

  // ========================================
  // Vocabulary & Flashcards
  // ========================================
  getVocabWords(): VocabWord[] {
    return readLocal<VocabWord[]>(STORAGE_KEYS.VOCAB, []);
  },

  saveVocabWord(word: VocabWord): void {
    const list = this.getVocabWords();
    const idx = list.findIndex((w) => w.id === word.id || w.term_en.toLowerCase() === word.term_en.toLowerCase());
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...word };
    } else {
      list.unshift(word);
    }
    writeLocal(STORAGE_KEYS.VOCAB, list);
  },

  deleteVocabWord(id: string): void {
    const list = this.getVocabWords().filter((w) => w.id !== id);
    writeLocal(STORAGE_KEYS.VOCAB, list);
  },

  toggleVocabBookmark(id: string): void {
    const list = this.getVocabWords();
    const item = list.find((w) => w.id === id);
    if (item) {
      item.is_bookmarked = !item.is_bookmarked;
      writeLocal(STORAGE_KEYS.VOCAB, list);
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
