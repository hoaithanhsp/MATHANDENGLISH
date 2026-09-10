/**
 * Storage Service — Firebase Realtime Database + localStorage fallback
 * Khi Firebase chưa config → dùng localStorage
 * Khi Firebase đã config → lưu lên Firebase + cache localStorage
 */

import { Exam, Assignment, ExamSession, StudentStudyNote, Profile, UserRole, MistakeEntry, MistakeReason, VocabWord } from '../types';
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
  AI_QUESTS_PREFIX: 'hp_ai_quests_',
  DELETED_EXAMS: 'hp_math_deleted_exams',
  EXAM_SESSIONS: 'hp_math_exam_sessions',
};

let _examSessionChannel: BroadcastChannel | null = null;
const getExamSessionChannel = (): BroadcastChannel | null => {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  if (!_examSessionChannel) {
    try {
      _examSessionChannel = new BroadcastChannel('hp_exam_sessions_channel');
    } catch {
      _examSessionChannel = null;
    }
  }
  return _examSessionChannel;
};

const notifySessionChange = (examId: string, session: ExamSession) => {
  const channel = getExamSessionChannel();
  if (channel) {
    try {
      channel.postMessage({ type: 'SESSION_UPDATE', examId, session, timestamp: Date.now() });
    } catch {
      // ignore
    }
  }
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
  getDeletedExamIds(): Set<string> {
    const list = readLocal<string[]>(STORAGE_KEYS.DELETED_EXAMS, []);
    return new Set(list);
  },

  markExamDeleted(examId: string): void {
    const set = this.getDeletedExamIds();
    set.add(examId);
    writeLocal(STORAGE_KEYS.DELETED_EXAMS, Array.from(set));
  },

  unmarkExamDeleted(examId: string): void {
    const set = this.getDeletedExamIds();
    if (set.has(examId)) {
      set.delete(examId);
      writeLocal(STORAGE_KEYS.DELETED_EXAMS, Array.from(set));
    }
  },

  getExams(): Exam[] {
    const raw = readLocal<Exam[]>(STORAGE_KEYS.EXAMS, []);
    const deletedIds = this.getDeletedExamIds();

    // Tự động thanh lọc các đề thi demo cũ và các đề thi đã bị xóa
    const cleaned = raw.filter(
      (e) => e && e.id && !deletedIds.has(e.id) && e.id !== 'hp-exam-sample-01' && e.access_code !== 'HP-MATH-2026'
    );

    // Tự động nạp các bộ đề thi chuẩn Hải Phòng nếu chưa từng bị xóa
    let modified = false;
    for (const preloaded of ALL_HAIPHONG_PRELOADED_EXAMS) {
      if (deletedIds.has(preloaded.id)) continue;
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
    const deletedIds = this.getDeletedExamIds();
    const map = new Map<string, Exam>();
    for (const item of currentList) {
      if (item && item.id && !deletedIds.has(item.id)) map.set(item.id, item);
    }
    for (const item of newList) {
      if (item && item.id && !deletedIds.has(item.id)) map.set(item.id, item);
    }
    return Array.from(map.values());
  },

  async saveExam(exam: Exam): Promise<void> {
    // Phục hồi lại nếu trước đó từng bị đánh dấu xóa
    this.unmarkExamDeleted(exam.id);

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
    // 1. Đánh dấu vĩnh viễn vào danh sách đã xóa để không bị nạp lại
    this.markExamDeleted(examId);

    // 2. Lọc bỏ ngay khỏi localStorage cache
    const current = readLocal<Exam[]>(STORAGE_KEYS.EXAMS, []);
    const filtered = current.filter((e) => e && e.id !== examId);
    writeLocal(STORAGE_KEYS.EXAMS, filtered);

    // 3. Xóa trên Firebase Cloud Realtime Database
    if (isFirebaseConfigured()) {
      await fbRemove(`exams/${examId}`);
      await fbRemove(`exam_sessions/${examId}`);
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
      const deletedIds = this.getDeletedExamIds();
      const current = this.getExams().filter((e) => !deletedIds.has(e.id));
      if (data) {
        const cloudExams = (Object.values(data) as Exam[]).filter(
          (e) => e && e.id && !deletedIds.has(e.id) && e.id !== 'hp-exam-sample-01' && e.access_code !== 'HP-MATH-2026'
        );
        const merged = this.mergeExams(current, cloudExams).filter((e) => !deletedIds.has(e.id));
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

  async deleteAssignment(assignmentId: string): Promise<void> {
    const list = this.getAssignments();
    const target = list.find((a) => a.id === assignmentId);
    const filtered = list.filter((a) => a.id !== assignmentId);
    writeLocal(STORAGE_KEYS.ASSIGNMENTS, filtered);

    // Xóa bộ nhớ tạm autosave nếu có
    if (target) {
      this.clearExamAutoSave(target.exam_id, target.student_id);
    }

    // Xóa trên Firebase Cloud Realtime Database
    if (isFirebaseConfigured()) {
      try {
        await fbRemove(`assignments/${assignmentId}`);
      } catch (err) {
        console.warn('Xóa assignment trên Firebase warning:', err);
      }
    }
  },

  async resetAllAssignments(): Promise<void> {
    writeLocal(STORAGE_KEYS.ASSIGNMENTS, []);

    // Xóa tất cả bộ nhớ tạm autosave
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEYS.AUTOSAVE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }

    // Xóa toàn bộ node assignments trên Firebase
    if (isFirebaseConfigured()) {
      try {
        await fbRemove('assignments');
      } catch (err) {
        console.warn('Reset toàn bộ assignments trên Firebase warning:', err);
      }
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
  // Exam Sessions (Live Monitoring) — Multi-tier Realtime Sync
  // Lưu đa tầng: Local Cache + BroadcastChannel + Firebase (exams/${examId}/live_sessions)
  // Lưu ý: Node 'exams' trên Firebase đã có quyền read/write 100%, bảo đảm không bao giờ bị 401
  // ========================================
  getLocalSessionsMap(): Record<string, Record<string, ExamSession>> {
    return readLocal<Record<string, Record<string, ExamSession>>>(STORAGE_KEYS.EXAM_SESSIONS, {});
  },

  saveLocalSession(session: ExamSession): void {
    const map = this.getLocalSessionsMap();
    const examId = session.exam_id;
    if (!map[examId]) {
      map[examId] = {};
    }
    map[examId][session.id] = { ...session };
    // Nếu có access_code, lưu tham chiếu cả vào access_code
    if (session.access_code && session.access_code !== examId) {
      if (!map[session.access_code]) {
        map[session.access_code] = {};
      }
      map[session.access_code][session.id] = { ...session };
    }
    writeLocal(STORAGE_KEYS.EXAM_SESSIONS, map);
    notifySessionChange(examId, session);
  },

  async saveExamSession(session: ExamSession): Promise<void> {
    // 1. Lưu ngay vào local cache + broadcast channel (tức thì 0ms)
    this.saveLocalSession(session);

    // 2. Gửi đồng bộ lên Firebase Realtime Database
    if (isFirebaseConfigured()) {
      try {
        // A. Lưu vào node exams/.../live_sessions (Node 'exams' có quyền read/write 100%, không bao giờ bị 401)
        await fbSet(`exams/${session.exam_id}/live_sessions/${session.id}`, session);
        if (session.access_code && session.access_code !== session.exam_id) {
          await fbSet(`exams/${session.access_code}/live_sessions/${session.id}`, session);
        }

        // B. Đồng thời gửi kèm vào node exam_sessions (dành cho môi trường có rules mở)
        fbSet(`exam_sessions/${session.exam_id}/${session.id}`, session).catch(() => {});
        if (session.access_code && session.access_code !== session.exam_id) {
          fbSet(`exam_sessions_by_code/${session.access_code}/${session.id}`, session).catch(() => {});
        }
      } catch (err) {
        console.warn('Sync session to Firebase warning:', err);
      }
    }
  },

  async updateExamSessionProgress(
    examId: string,
    sessionId: string,
    answeredCount: number,
    extra?: { answers?: Record<string, string>; tabSwitchCount?: number; accessCode?: string }
  ): Promise<void> {
    const now = new Date().toISOString();
    // 1. Cập nhật local cache
    const map = this.getLocalSessionsMap();
    let existing = map[examId]?.[sessionId];
    if (!existing && extra?.accessCode && map[extra.accessCode]?.[sessionId]) {
      existing = map[extra.accessCode][sessionId];
    }
    if (existing) {
      existing.answered_count = answeredCount;
      existing.last_active_at = now;
      if (extra?.answers) existing.answers = extra.answers;
      if (typeof extra?.tabSwitchCount === 'number') existing.tab_switch_count = extra.tabSwitchCount;
      if (extra?.accessCode) existing.access_code = extra.accessCode;
      this.saveLocalSession(existing);
    } else {
      const dummy: ExamSession = {
        id: sessionId,
        exam_id: examId,
        access_code: extra?.accessCode,
        student_id: 'student-unknown',
        student_name: 'Thí sinh',
        status: 'in_progress',
        started_at: now,
        last_active_at: now,
        answered_count: answeredCount,
        total_questions: 22,
        answers: extra?.answers,
        tab_switch_count: extra?.tabSwitchCount,
      };
      this.saveLocalSession(dummy);
    }

    // 2. Gửi lên Firebase Realtime Database
    if (isFirebaseConfigured()) {
      try {
        // Cập nhật node exams/.../live_sessions (an toàn 100%)
        await fbSet(`exams/${examId}/live_sessions/${sessionId}/answered_count`, answeredCount);
        await fbSet(`exams/${examId}/live_sessions/${sessionId}/last_active_at`, now);
        if (extra?.answers) {
          await fbSet(`exams/${examId}/live_sessions/${sessionId}/answers`, extra.answers);
        }
        if (typeof extra?.tabSwitchCount === 'number') {
          await fbSet(`exams/${examId}/live_sessions/${sessionId}/tab_switch_count`, extra.tabSwitchCount);
        }

        // Cập nhật phụ vào node exam_sessions
        fbSet(`exam_sessions/${examId}/${sessionId}/answered_count`, answeredCount).catch(() => {});
        fbSet(`exam_sessions/${examId}/${sessionId}/last_active_at`, now).catch(() => {});
        if (extra?.answers) {
          fbSet(`exam_sessions/${examId}/${sessionId}/answers`, extra.answers).catch(() => {});
        }
        if (typeof extra?.tabSwitchCount === 'number') {
          fbSet(`exam_sessions/${examId}/${sessionId}/tab_switch_count`, extra.tabSwitchCount).catch(() => {});
        }
      } catch (err) {
        console.warn('Update session progress on Firebase warning:', err);
      }
    }
  },

  async completeExamSession(
    examId: string,
    sessionId: string,
    result: {
      score: number;
      correct_count: number;
      wrong_count: number;
      answers: Record<string, string>;
      tab_switch_count: number;
    },
    accessCode?: string
  ): Promise<void> {
    const now = new Date().toISOString();
    // 1. Cập nhật local cache
    const map = this.getLocalSessionsMap();
    let existing = map[examId]?.[sessionId];
    if (!existing && accessCode && map[accessCode]?.[sessionId]) {
      existing = map[accessCode][sessionId];
    }
    if (!existing) {
      for (const group of Object.values(map)) {
        if (group && group[sessionId]) {
          existing = group[sessionId];
          break;
        }
      }
    }

    if (existing) {
      existing.status = 'completed';
      existing.submitted_at = now;
      existing.last_active_at = now;
      existing.score = result.score;
      existing.correct_count = result.correct_count;
      existing.wrong_count = result.wrong_count;
      existing.answers = result.answers;
      existing.tab_switch_count = result.tab_switch_count;
      this.saveLocalSession(existing);
    } else {
      const completedSession: ExamSession = {
        id: sessionId,
        exam_id: examId,
        access_code: accessCode,
        student_id: 'student-hp-01',
        student_name: 'Thí sinh',
        status: 'completed',
        started_at: now,
        submitted_at: now,
        last_active_at: now,
        score: result.score,
        correct_count: result.correct_count,
        wrong_count: result.wrong_count,
        answered_count: Object.keys(result.answers || {}).length,
        total_questions: 22,
        answers: result.answers,
        tab_switch_count: result.tab_switch_count,
      };
      existing = completedSession;
      this.saveLocalSession(completedSession);
    }

    // 2. Gửi đồng bộ nguyên khối (atomic) lên Firebase Realtime Database
    if (isFirebaseConfigured() && existing) {
      try {
        // Cập nhật node exams/.../live_sessions
        await fbSet(`exams/${examId}/live_sessions/${sessionId}`, existing);
        if (accessCode && accessCode !== examId) {
          await fbSet(`exams/${accessCode}/live_sessions/${sessionId}`, existing);
        }

        // Cập nhật phụ vào node exam_sessions
        fbSet(`exam_sessions/${examId}/${sessionId}`, existing).catch(() => {});
        if (accessCode && accessCode !== examId) {
          fbSet(`exam_sessions_by_code/${accessCode}/${sessionId}`, existing).catch(() => {});
        }
      } catch (err) {
        console.warn('Complete exam session on Firebase warning:', err);
      }
    }
  },

  onExamSessionsChanged(
    examId: string,
    callback: (sessions: ExamSession[]) => void,
    accessCode?: string
  ): () => void {
    // 1. Helper lọc sessions từ local map
    const getFilteredLocal = (): ExamSession[] => {
      const map = this.getLocalSessionsMap();
      const sessionMap = new Map<string, ExamSession>();

      // Lấy từ examId
      if (map[examId]) {
        Object.values(map[examId]).forEach((s) => {
          if (s && s.id) sessionMap.set(s.id, s);
        });
      }
      // Lấy từ accessCode
      if (accessCode && map[accessCode]) {
        Object.values(map[accessCode]).forEach((s) => {
          if (s && s.id) sessionMap.set(s.id, s);
        });
      }
      // Quét toàn bộ map để không bỏ sót session nào có exam_id hoặc access_code khớp
      Object.values(map).forEach((group) => {
        Object.values(group).forEach((s) => {
          if (!s || !s.id) return;
          const matchExamId = s.exam_id === examId;
          const matchAccessCode =
            accessCode &&
            (s.access_code?.toUpperCase() === accessCode.toUpperCase() ||
              s.exam_id?.toUpperCase() === accessCode.toUpperCase());
          if (matchExamId || matchAccessCode) {
            sessionMap.set(s.id, s);
          }
        });
      });

      return Array.from(sessionMap.values());
    };

    // Phản hồi tức thì ngay 0ms với local cache
    callback(getFilteredLocal());

    // 2. Lắng nghe BroadcastChannel (đồng bộ tức thì giữa các tab trình duyệt)
    const channel = getExamSessionChannel();
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SESSION_UPDATE') {
        callback(getFilteredLocal());
      }
    };
    if (channel) {
      channel.addEventListener('message', handleBroadcast);
    }

    // 3. Lắng nghe window storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.EXAM_SESSIONS) {
        callback(getFilteredLocal());
      }
    };
    window.addEventListener('storage', handleStorage);

    // 4. Lắng nghe Firebase Realtime Database
    const unsubs: Array<() => void> = [];
    if (isFirebaseConfigured()) {
      try {
        // Lắng nghe chính tại exams/${examId}/live_sessions (Node 'exams' đảm bảo quyền read/write 100%)
        const unsubExamLive = fbOnValue(`exams/${examId}/live_sessions`, (data) => {
          if (data) {
            const cloudSessions = Object.values(data) as ExamSession[];
            const map = this.getLocalSessionsMap();
            if (!map[examId]) map[examId] = {};
            cloudSessions.forEach((s) => {
              if (s && s.id) {
                map[examId][s.id] = s;
              }
            });
            writeLocal(STORAGE_KEYS.EXAM_SESSIONS, map);
          }
          callback(getFilteredLocal());
        });
        unsubs.push(unsubExamLive);

        // Nếu có accessCode và khác examId, lắng nghe thêm cả accessCode
        if (accessCode && accessCode !== examId) {
          const unsubAccessCodeLive = fbOnValue(`exams/${accessCode}/live_sessions`, (data) => {
            if (data) {
              const cloudSessions = Object.values(data) as ExamSession[];
              const map = this.getLocalSessionsMap();
              if (!map[accessCode]) map[accessCode] = {};
              cloudSessions.forEach((s) => {
                if (s && s.id) {
                  map[accessCode][s.id] = s;
                }
              });
              writeLocal(STORAGE_KEYS.EXAM_SESSIONS, map);
            }
            callback(getFilteredLocal());
          });
          unsubs.push(unsubAccessCodeLive);
        }

        // Lắng nghe thêm node exam_sessions (phụ)
        const unsubLegacy = fbOnValue(`exam_sessions/${examId}`, (data) => {
          if (data) {
            const cloudSessions = Object.values(data) as ExamSession[];
            const map = this.getLocalSessionsMap();
            if (!map[examId]) map[examId] = {};
            cloudSessions.forEach((s) => {
              if (s && s.id) {
                map[examId][s.id] = s;
              }
            });
            writeLocal(STORAGE_KEYS.EXAM_SESSIONS, map);
          }
          callback(getFilteredLocal());
        });
        unsubs.push(unsubLegacy);
      } catch (err) {
        console.warn('Firebase onExamSessionsChanged listener warning:', err);
      }
    }

    return () => {
      if (channel) {
        channel.removeEventListener('message', handleBroadcast);
      }
      window.removeEventListener('storage', handleStorage);
      unsubs.forEach((unsub) => {
        try {
          unsub();
        } catch {
          // ignore
        }
      });
    };
  },

  async getExamSessions(examId: string, accessCode?: string): Promise<ExamSession[]> {
    const map = this.getLocalSessionsMap();
    const sessionMap = new Map<string, ExamSession>();

    // 1. Lấy từ local
    if (map[examId]) {
      Object.values(map[examId]).forEach((s) => {
        if (s && s.id) sessionMap.set(s.id, s);
      });
    }
    if (accessCode && map[accessCode]) {
      Object.values(map[accessCode]).forEach((s) => {
        if (s && s.id) sessionMap.set(s.id, s);
      });
    }
    Object.values(map).forEach((group) => {
      Object.values(group).forEach((s) => {
        if (!s || !s.id) return;
        if (
          s.exam_id === examId ||
          (accessCode &&
            (s.access_code?.toUpperCase() === accessCode.toUpperCase() ||
              s.exam_id?.toUpperCase() === accessCode.toUpperCase()))
        ) {
          sessionMap.set(s.id, s);
        }
      });
    });

    // 2. Lấy thêm từ Firebase Realtime Database
    if (isFirebaseConfigured()) {
      try {
        // Đọc từ exams/${examId}/live_sessions (100% quyền truy cập)
        const liveData = await fbGet<Record<string, ExamSession>>(`exams/${examId}/live_sessions`);
        if (liveData) {
          Object.values(liveData).forEach((s) => {
            if (s && s.id) sessionMap.set(s.id, s);
          });
        }
        if (accessCode && accessCode !== examId) {
          const accessLiveData = await fbGet<Record<string, ExamSession>>(`exams/${accessCode}/live_sessions`);
          if (accessLiveData) {
            Object.values(accessLiveData).forEach((s) => {
              if (s && s.id) sessionMap.set(s.id, s);
            });
          }
        }
        // Đọc thêm từ exam_sessions (phụ)
        const legacyData = await fbGet<Record<string, ExamSession>>(`exam_sessions/${examId}`);
        if (legacyData) {
          Object.values(legacyData).forEach((s) => {
            if (s && s.id) sessionMap.set(s.id, s);
          });
        }
      } catch {
        // ignore
      }
    }

    return Array.from(sessionMap.values());
  },

  /** Lấy tất cả sessions của tất cả exams (cho lịch sử học tập & giám sát toàn diện) */
  async getAllExamSessions(): Promise<ExamSession[]> {
    const map = this.getLocalSessionsMap();
    const sessionMap = new Map<string, ExamSession>();

    // 1. Lấy từ local
    Object.values(map).forEach((group) => {
      Object.values(group).forEach((s) => {
        if (s && s.id) sessionMap.set(s.id, s);
      });
    });

    // 2. Lấy từ Firebase nếu có
    if (isFirebaseConfigured()) {
      try {
        // Lấy từ exams (duyệt các đề thi để lấy live_sessions)
        const fbExams = await fbGet<Record<string, any>>('exams');
        if (fbExams) {
          for (const examData of Object.values(fbExams)) {
            if (examData && examData.live_sessions) {
              for (const s of Object.values(examData.live_sessions as Record<string, ExamSession>)) {
                if (s && s.id) sessionMap.set(s.id, s);
              }
            }
          }
        }

        // Lấy từ exam_sessions (nếu có)
        const legacyData = await fbGet<Record<string, Record<string, ExamSession>>>('exam_sessions');
        if (legacyData) {
          for (const examSessions of Object.values(legacyData)) {
            for (const s of Object.values(examSessions)) {
              if (s && s.id) sessionMap.set(s.id, s);
            }
          }
        }
      } catch {
        // ignore
      }
    }

    return Array.from(sessionMap.values());
  },

  /** Dọn dẹp/Reset phiên thi trong phòng thi (cho đề thi cụ thể hoặc toàn bộ) */
  async clearExamSessions(examId?: string): Promise<void> {
    const map = this.getLocalSessionsMap();
    if (examId) {
      delete map[examId];
    } else {
      for (const k of Object.keys(map)) delete map[k];
    }
    writeLocal(STORAGE_KEYS.EXAM_SESSIONS, map);

    if (isFirebaseConfigured()) {
      try {
        if (examId) {
          await fbRemove(`exams/${examId}/live_sessions`);
          fbRemove(`exam_sessions/${examId}`).catch(() => {});
        } else {
          // Xóa tất cả live_sessions trong exams
          const fbExams = await fbGet<Record<string, any>>('exams');
          if (fbExams) {
            for (const id of Object.keys(fbExams)) {
              fbRemove(`exams/${id}/live_sessions`).catch(() => {});
            }
          }
          fbRemove('exam_sessions').catch(() => {});
        }
      } catch (err) {
        console.warn('Clear exam sessions on Firebase warning:', err);
      }
    }
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

  // ========================================
  // Live Stats & Realtime Tracking
  // ========================================
  getTodayDateKey(): string {
    return new Date().toISOString().slice(0, 10);
  },

  getAiQuestsToday(): number {
    const todayKey = this.getTodayDateKey();
    return readLocal<number>(`${STORAGE_KEYS.AI_QUESTS_PREFIX}${todayKey}`, 0);
  },

  async incrementAiQuests(count: number = 1): Promise<number> {
    const todayKey = this.getTodayDateKey();
    const localKey = `${STORAGE_KEYS.AI_QUESTS_PREFIX}${todayKey}`;
    const current = readLocal<number>(localKey, 0);
    const updated = current + count;
    writeLocal(localKey, updated);

    if (isFirebaseConfigured()) {
      try {
        const cloudCount = (await fbGet<number>(`stats/daily_ai_quests/${todayKey}`)) || 0;
        const newCloud = cloudCount + count;
        await fbSet(`stats/daily_ai_quests/${todayKey}`, newCloud);
        return newCloud;
      } catch (err) {
        console.warn('Error updating AI quests counter to Firebase:', err);
      }
    }
    return updated;
  },

  onAiQuestsChanged(callback: (count: number) => void): () => void {
    const todayKey = this.getTodayDateKey();
    const localKey = `${STORAGE_KEYS.AI_QUESTS_PREFIX}${todayKey}`;
    const localVal = readLocal<number>(localKey, 0);
    callback(localVal);

    if (!isFirebaseConfigured()) return () => {};

    return fbOnValue(`stats/daily_ai_quests/${todayKey}`, (data) => {
      const val = typeof data === 'number' ? data : (data ? Number(data) : 0);
      writeLocal(localKey, val);
      callback(val);
    });
  },

  onActiveSessionsCountChanged(callback: (activeCount: number) => void): () => void {
    if (!isFirebaseConfigured()) {
      callback(0);
      return () => {};
    }

    return fbOnValue('exam_sessions', (data) => {
      if (!data) {
        callback(0);
        return;
      }
      const now = Date.now();
      let count = 0;
      try {
        const examGroups = Object.values(data as Record<string, Record<string, ExamSession>>);
        for (const examGroup of examGroups) {
          if (examGroup && typeof examGroup === 'object') {
            for (const session of Object.values(examGroup)) {
              if (
                session &&
                session.status === 'in_progress' &&
                session.last_active_at
              ) {
                const diffMs = now - new Date(session.last_active_at).getTime();
                // Nếu heartbeat trong vòng 3 phút thì tính là đang online
                if (diffMs >= 0 && diffMs < 3 * 60 * 1000) {
                  count++;
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error counting active sessions:', err);
      }
      callback(count);
    });
  },
};
