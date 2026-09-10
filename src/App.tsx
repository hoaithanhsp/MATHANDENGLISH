import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { ExamGenerator } from './components/TeacherView/ExamGenerator';
import { ExamManagement } from './components/TeacherView/ExamManagement';
import { StudentSubmissions } from './components/TeacherView/StudentSubmissions';
import { MatrixGuide } from './components/TeacherView/MatrixGuide';
import { StudyAssistant } from './components/StudentView/StudyAssistant';
import { MockTestRunner } from './components/StudentView/MockTestRunner';
import { StudentNotes } from './components/StudentView/StudentNotes';
import { ReviewSection } from './components/StudentView/ReviewSection';
import { MistakeNotebook } from './components/StudentView/MistakeNotebook';
import { InteractiveVocabModal } from './components/StudentView/InteractiveVocabModal';
import { OlympicProofStudio } from './components/StudentView/OlympicProofStudio';
import { TeamCompetencyRadar } from './components/TeacherView/TeamCompetencyRadar';
import { JoinExamModal } from './components/StudentView/JoinExamModal';
import { SchemaModal } from './components/SchemaModal';
import { SettingsModal } from './components/SettingsModal';
import { VisitCounter } from './components/VisitCounter';
import { storageService } from './services/storageService';
import { onAuthChanged, logout, getProfileFromDb, getRoleFromEmail, findAccountByEmail } from './services/authService';
import { fbSet } from './lib/firebase';
import { Exam, Assignment, StudentStudyNote, Profile, UserRole, Question } from './types';
import { Loader2 } from 'lucide-react';

export default function App() {
  // Auth state
  const [authProfile, setAuthProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Current user & role
  const [currentUser, setCurrentUser] = useState<Profile>(() => storageService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>(() =>
    currentUser.role === 'teacher' ? 'teacher_generate' : 'student_assistant'
  );

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => storageService.getTheme());

  // Database / Storage states
  const [exams, setExams] = useState<Exam[]>(() => storageService.getExams());
  const [assignments, setAssignments] = useState<Assignment[]>(() => storageService.getAssignments());
  const [notes, setNotes] = useState<StudentStudyNote[]>(() => storageService.getStudyNotes());

  // Active Running Exam (for Mock test runner)
  const [activeRunningExam, setActiveRunningExam] = useState<Exam | null>(null);
  const [activeStudentName, setActiveStudentName] = useState('');

  // Modals
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User đã đăng nhập → lấy profile từ DB
        let profile = await getProfileFromDb(firebaseUser.uid);
        const predefined = findAccountByEmail(firebaseUser.email || '');

        // Nếu chưa có profile hoặc tên trong DB khác tên mới cập nhật của danh sách HS
        if (!profile || (predefined && profile.full_name !== predefined.displayName)) {
          profile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: getRoleFromEmail(firebaseUser.email || ''),
            full_name: predefined?.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            created_at: profile?.created_at || new Date().toISOString(),
          };
          // Cập nhật lại vào Realtime Database
          await fbSet(`profiles/${firebaseUser.uid}`, profile);
        }
        setAuthProfile(profile);
        setCurrentUser(profile);
        setActiveStudentName(profile.full_name);
        storageService.setCurrentUser(profile);
        setActiveTab(profile.role === 'teacher' ? 'teacher_generate' : 'student_assistant');
      } else {
        setAuthProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  // Theme setup effect
  useEffect(() => {
    storageService.setTheme(theme);
  }, [theme]);

  // Sync Firebase data when authenticated + subscribe realtime
  useEffect(() => {
    if (!authProfile) return;

    // Initial sync from Firebase
    storageService.syncExamsFromFirebase().then((fbExams) => {
      if (fbExams.length > 0) setExams(fbExams);
    });
    storageService.syncAssignmentsFromFirebase().then((fbAssignments) => {
      if (fbAssignments.length > 0) setAssignments(fbAssignments);
    });

    // Subscribe to realtime updates
    const unsubExams = storageService.onExamsChanged((updatedExams) => {
      setExams(updatedExams);
    });
    const unsubAssignments = storageService.onAssignmentsChanged((updatedAssignments) => {
      setAssignments(updatedAssignments);
    });

    return () => {
      unsubExams();
      unsubAssignments();
    };
  }, [authProfile]);

  const handleToggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  const handleLoginSuccess = (profile: Profile) => {
    setAuthProfile(profile);
    setCurrentUser(profile);
    setActiveStudentName(profile.full_name);
    storageService.setCurrentUser(profile);
    setActiveTab(profile.role === 'teacher' ? 'teacher_generate' : 'student_assistant');
  };

  const handleLogout = async () => {
    await logout();
    setAuthProfile(null);
    setActiveRunningExam(null);
  };

  const handleSwitchRole = (newRole: UserRole) => {
    // Role is now determined by login — don't allow switching
    // But we keep this to avoid breaking Navbar props
    const user = { ...currentUser, role: newRole };
    setCurrentUser(user);
    if (newRole === 'teacher') {
      setActiveTab('teacher_generate');
    } else {
      setActiveTab('student_assistant');
    }
  };

  // Exam actions
  const handleSaveExam = async (exam: Exam) => {
    await storageService.saveExam(exam);
    setExams(storageService.getExams());
  };

  const handleDeleteExam = async (id: string) => {
    await storageService.deleteExam(id);
    setExams(storageService.getExams());
  };

  // Notes actions
  const handleSaveNote = (note: StudentStudyNote) => {
    storageService.saveStudyNote(note);
    setNotes(storageService.getStudyNotes());
  };

  const handleDeleteNote = (id: string) => {
    storageService.deleteStudyNote(id);
    setNotes(storageService.getStudyNotes());
  };

  // Assignment actions
  const handleFinishExam = (assignment: Assignment) => {
    storageService.saveAssignment(assignment);
    setAssignments(storageService.getAssignments());
  };

  // Student starts topical practice
  const handleStartPracticeQuiz = (topic: string, questions: Question[]) => {
    const practiceExam: Exam = {
      id: `practice-${Date.now()}`,
      title: `Bài Tập Luyện Chuyên Đề: ${topic}`,
      description: `Bài tập trắc nghiệm & điền đáp số theo chuyên đề ${topic}`,
      mode: 'bilingual',
      duration_minutes: 30,
      is_published: true,
      access_code: `QUIZ-${Math.floor(Math.random() * 9000 + 1000)}`,
      exam_type: 'topic_practice',
      created_at: new Date().toISOString(),
      questions,
    };
    setActiveRunningExam(practiceExam);
  };

  // Student joins exam via code
  const handleJoinExam = (exam: Exam, studentName: string) => {
    setActiveStudentName(studentName);
    setActiveRunningExam(exam);
  };

  // ========================================
  // LOADING SCREEN
  // ========================================
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-sm text-slate-500">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // LOGIN SCREEN (chưa đăng nhập)
  // ========================================
  if (!authProfile) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // ========================================
  // MAIN APP (đã đăng nhập)
  // ========================================
  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Primary Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSwitchRole={handleSwitchRole}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSchema={() => setIsSchemaModalOpen(true)}
        onOpenQuickJoin={() => setIsJoinModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* If an active exam is being taken */}
        {activeRunningExam ? (
          <MockTestRunner
            exam={activeRunningExam}
            studentName={activeStudentName}
            studentId={currentUser.id}
            onFinishExam={(asgn) => {
              handleFinishExam(asgn);
            }}
            onExit={() => setActiveRunningExam(null)}
          />
        ) : (
          <>
            {/* TEACHER TABS */}
            {currentUser.role === 'teacher' && (
              <>
                {activeTab === 'teacher_generate' && (
                  <ExamGenerator
                    onSaveExam={handleSaveExam}
                    onNavigateToBank={() => setActiveTab('teacher_exams')}
                  />
                )}
                {activeTab === 'teacher_exams' && (
                  <ExamManagement
                    exams={exams}
                    onSaveExam={handleSaveExam}
                    onDeleteExam={handleDeleteExam}
                    onNavigateToGenerate={() => setActiveTab('teacher_generate')}
                  />
                )}
                {activeTab === 'teacher_submissions' && (
                  <StudentSubmissions assignments={assignments} exams={exams} />
                )}
                {activeTab === 'teacher_radar' && (
                  <TeamCompetencyRadar assignments={assignments} exams={exams} />
                )}
                {activeTab === 'matrix_guide' && <MatrixGuide />}
                {activeTab === 'student_notes' && (
                  <StudentNotes
                    notes={notes}
                    onDeleteNote={handleDeleteNote}
                    onSelectTopic={(topic) => {
                      setActiveTab('student_assistant');
                    }}
                  />
                )}
              </>
            )}

            {/* STUDENT TABS */}
            {currentUser.role === 'student' && (
              <>
                {activeTab === 'student_assistant' && (
                  <StudyAssistant
                    onSaveNote={handleSaveNote}
                    onStartPracticeQuiz={handleStartPracticeQuiz}
                  />
                )}
                {activeTab === 'student_review' && <ReviewSection />}
                {activeTab === 'student_mock' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          Phòng Luyện Thi Chuẩn Ma Trận Hải Phòng (90 Phút)
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Chọn một đề thi có sẵn bên dưới hoặc nhập mã đề thi từ thầy cô giáo để bắt đầu làm bài.
                        </p>
                      </div>

                      <button
                        onClick={() => setIsJoinModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs shrink-0"
                      >
                        Nhập Mã Phòng Thi (Access Code)
                      </button>
                    </div>

                    {exams.filter((e) => e.is_published).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {exams
                          .filter((e) => e.is_published)
                          .map((exam) => (
                            <div
                              key={exam.id}
                              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-600 transition group"
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                    {exam.questions?.length || 22} câu hỏi
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-400">
                                    {exam.access_code}
                                  </span>
                                </div>

                                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                                  {exam.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                  {exam.description}
                                </p>
                              </div>

                              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between">
                                <span className="text-xs text-slate-400">
                                  Thời gian: {exam.duration_minutes} phút
                                </span>
                                <button
                                  onClick={() => setActiveRunningExam(exam)}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 group-hover:bg-emerald-700 transition shadow-xs"
                                >
                                  Bắt Đầu Thi
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center font-bold text-lg">
                          📝
                        </div>
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                          Chưa Có Đề Thi Nào Đang Mở
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                          Hiện tại chưa có đề thi chính thức nào được mở trong danh sách. Nếu Thầy/Cô đã cung cấp mã phòng thi (Access Code), bạn hãy bấm nút bên dưới để vào thi ngay.
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => setIsJoinModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
                          >
                            Nhập Mã Phòng Thi (Access Code)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'student_proof' && (
                  <OlympicProofStudio />
                )}
                {activeTab === 'student_mistakes' && (
                  <MistakeNotebook
                    onPracticeMistakes={(practiceExam) => {
                      setActiveRunningExam(practiceExam);
                    }}
                  />
                )}
                {activeTab === 'student_vocab' && (
                  <InteractiveVocabModal />
                )}
                {activeTab === 'student_notes' && (
                  <StudentNotes
                    notes={notes}
                    onDeleteNote={handleDeleteNote}
                    onSelectTopic={(topic) => {
                      setActiveTab('student_assistant');
                    }}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-4 text-center space-y-2">
        <VisitCounter />
        <p className="text-xs text-slate-400">
          Hệ Thống Dạy & Học Đội Tuyển HSG Toán THPT Bằng Tiếng Anh • Chuẩn Ma Trận Sở GD&ĐT Hải Phòng
        </p>
        <p className="text-[10px] text-slate-400/70">
          Tác giả: <strong>Trần Hoài Thanh</strong> — THPT Khúc Thừa Dụ, TP.Hải Phòng — Zalo: 0348296773
        </p>
        <p className="text-[11px] text-slate-400/60 italic mt-2 leading-relaxed max-w-md mx-auto">
          "Có công trời chẳng phụ lòng,<br />
          Kiên tâm bền chí, ắt mong quả lành.<br />
          Đường đời dẫu lắm chông chênh,<br />
          Gieo bằng nỗ lực, gặt thành ước mơ."
        </p>
      </footer>

      {/* Modals */}
      <SchemaModal isOpen={isSchemaModalOpen} onClose={() => setIsSchemaModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <JoinExamModal
        isOpen={isJoinModalOpen}
        initialStudentName={currentUser.full_name}
        onClose={() => setIsJoinModalOpen(false)}
        onJoinExam={handleJoinExam}
        onFindExamByCode={(code) => storageService.findExamByCodeAsync(code)}
      />
    </div>
  );
}
