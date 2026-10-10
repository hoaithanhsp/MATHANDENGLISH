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
import { StudentLearningHistory } from './components/TeacherView/StudentLearningHistory';
import { JoinExamModal } from './components/StudentView/JoinExamModal';
import { SchemaModal } from './components/SchemaModal';
import { SettingsModal } from './components/SettingsModal';
import { VisitCounter } from './components/VisitCounter';
import { storageService } from './services/storageService';
import { onAuthChanged, logout, getProfileFromDb, getRoleFromEmail, findAccountByEmail } from './services/authService';
import { fbSet } from './lib/firebase';
import { Exam, Assignment, StudentStudyNote, Profile, UserRole, Question } from './types';
import { exportExamToDocx } from './utils/docxExport';
import { printHaiPhongExam } from './utils/printPdf';
import {
  Loader2,
  Sparkles,
  Download,
  FileCheck,
  Search,
  Filter,
  BookOpen,
  Clock,
  Printer,
  Play,
  FileText,
  Check,
  Copy,
  Layers,
} from 'lucide-react';

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

  // Kho đề thi (Student Mock Bank) search & filters
  const [mockSearch, setMockSearch] = useState('');
  const [mockFilter, setMockFilter] = useState<'all' | 'ai' | 'official'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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

  const handleResetAssignment = async (id: string) => {
    await storageService.deleteAssignment(id);
    setAssignments(storageService.getAssignments());
  };

  const handleResetAllAssignments = async () => {
    await storageService.resetAllAssignments();
    setAssignments([]);
  };

  // Student starts topical practice
  const handleStartPracticeQuiz = (topic: string, questions: Question[]) => {
    storageService.incrementAiQuests(questions.length);
    const practiceExam: Exam = {
      id: `practice-${Date.now()}`,
      title: `Bài tập luyện chuyên đề: ${topic}`,
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
          <Loader2 className="w-8 h-8 animate-spin text-teal-500 mx-auto" />
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
                    onStartTestNow={(exam) => {
                      handleSaveExam(exam);
                      setActiveRunningExam(exam);
                    }}
                    onDeleteExam={handleDeleteExam}
                    exams={exams}
                    assignments={assignments}
                  />
                )}
                {activeTab === 'teacher_exams' && (
                  <ExamManagement
                    exams={exams}
                    onSaveExam={handleSaveExam}
                    onDeleteExam={handleDeleteExam}
                    onNavigateToGenerate={() => setActiveTab('teacher_generate')}
                    onStartTestNow={(exam) => {
                      handleSaveExam(exam);
                      setActiveRunningExam(exam);
                    }}
                  />
                )}
                {activeTab === 'teacher_submissions' && (
                  <StudentSubmissions
                    assignments={assignments}
                    exams={exams}
                    onResetAssignment={handleResetAssignment}
                    onResetAllAssignments={handleResetAllAssignments}
                  />
                )}
                {activeTab === 'teacher_radar' && (
                  <TeamCompetencyRadar assignments={assignments} exams={exams} />
                )}
                {activeTab === 'teacher_history' && (
                  <StudentLearningHistory assignments={assignments} exams={exams} />
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
                {activeTab === 'student_generate' && (
                  <ExamGenerator
                    isStudentMode={true}
                    onSaveExam={handleSaveExam}
                    onNavigateToBank={() => setActiveTab('student_mock')}
                    onStartTestNow={(exam) => {
                      handleSaveExam(exam);
                      setActiveRunningExam(exam);
                    }}
                    onDeleteExam={handleDeleteExam}
                    exams={exams}
                    assignments={assignments}
                  />
                )}
                {activeTab === 'student_assistant' && (
                  <StudyAssistant
                    onSaveNote={handleSaveNote}
                    onStartPracticeQuiz={handleStartPracticeQuiz}
                  />
                )}
                {activeTab === 'student_review' && <ReviewSection />}
                {activeTab === 'student_mock' && (() => {
                  const publishedExams = exams.filter((e) => Boolean(e && e.is_published));
                  const aiMockCount = publishedExams.filter((e) => Boolean(e.is_ai_generated || e.id?.startsWith('exam-') || e.id?.startsWith('practice-') || e.exam_type === 'topic_practice')).length;
                  const officialMockCount = publishedExams.length - aiMockCount;

                  const filteredMockExams = publishedExams.filter((exam) => {
                    const q = mockSearch.toLowerCase().trim();
                    const matchSearch =
                      !q ||
                      (exam.title && exam.title.toLowerCase().includes(q)) ||
                      (exam.access_code && exam.access_code.toLowerCase().includes(q)) ||
                      (exam.topic_focus && exam.topic_focus.toLowerCase().includes(q)) ||
                      (exam.description && exam.description.toLowerCase().includes(q));

                    if (!matchSearch) return false;

                    const isAi = Boolean(exam.is_ai_generated || exam.id?.startsWith('exam-') || exam.id?.startsWith('practice-') || exam.exam_type === 'topic_practice');
                    if (mockFilter === 'ai') return isAi;
                    if (mockFilter === 'official') return !isAi;
                    return true;
                  });

                  return (
                    <div className="space-y-6">
                      {/* Header Kho Đề Thi */}
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="p-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                              <BookOpen className="w-4 h-4" />
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                              Kho Đề Thi & Ôn Luyện HSG
                            </span>
                          </div>
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Kho Đề Thi & Phòng Luyện Thi Chuẩn Ma Trận Hải Phòng (90 phút)
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                            Kho lưu trữ toàn bộ đề thi chuẩn và đề thi AI đã lưu. Bạn có thể <strong>lấy ra làm bài bất cứ lúc nào</strong>, hoặc <strong>tải về file Word (.docx)</strong> sạch hoặc kèm đáp án để in và tự luyện.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          <button
                            onClick={() => setActiveTab('student_generate')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 transition shadow-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Tự tạo đề AI mới
                          </button>
                          <button
                            onClick={() => setIsJoinModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
                          >
                            Nhập mã phòng thi (Access Code)
                          </button>
                        </div>
                      </div>

                      {/* Search Bar & Filter Tabs */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                        <div className="relative flex-1 max-w-md">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={mockSearch}
                            onChange={(e) => setMockSearch(e.target.value)}
                            placeholder="Tìm kiếm đề trong kho theo tên đề, mã đề, chủ đề..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl shrink-0 overflow-x-auto">
                          <button
                            type="button"
                            onClick={() => setMockFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                              mockFilter === 'all'
                                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Tất cả đề ({publishedExams.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setMockFilter('ai')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
                              mockFilter === 'ai'
                                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <Sparkles className="w-3 h-3 text-teal-500" />
                            Đề AI tự tạo ({aiMockCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => setMockFilter('official')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                              mockFilter === 'official'
                                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Đề chuẩn Sở ({officialMockCount})
                          </button>
                        </div>
                      </div>

                      {/* Exam Cards Grid */}
                      {filteredMockExams.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {filteredMockExams.map((exam) => (
                            <div
                              key={exam.id}
                              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-600 transition group"
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                      {exam.questions?.length || 22} câu hỏi
                                    </span>
                                    {exam.is_ai_generated ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5" />
                                        Đề AI
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                        Đề chuẩn Sở
                                      </span>
                                    )}
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                      {exam.mode === 'bilingual' ? 'Song ngữ' : 'Tiếng Anh'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                      {exam.access_code}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCode(exam.access_code)}
                                      className="p-1 text-slate-400 hover:text-teal-600 transition"
                                      title="Sao chép mã phòng thi"
                                    >
                                      {copiedCode === exam.access_code ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                                  {exam.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                  {exam.topic_focus ? (
                                    <span className="text-teal-700 dark:text-teal-300 font-medium">
                                      🎯 Chủ đề: {exam.topic_focus}
                                    </span>
                                  ) : (
                                    exam.description
                                  )}
                                </p>
                              </div>

                              {/* Thao tác đề: Làm bài ngay + Tải File Word + In PDF */}
                              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-750 space-y-2.5">
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {exam.duration_minutes} phút
                                  </span>
                                  <span className="text-[11px] italic">
                                    {exam.questions?.length || 22} câu / 20.0 điểm
                                  </span>
                                </div>

                                {/* Nút Làm bài ngay */}
                                <button
                                  onClick={() => setActiveRunningExam(exam)}
                                  className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 transition shadow-xs flex items-center justify-center gap-1.5"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  <span>{exam.is_ai_generated ? 'Lấy Ra Làm Lại / Bắt Đầu' : 'Lấy Ra Làm Bài Ngay'}</span>
                                </button>

                                {/* Các nút Tải Word & In PDF */}
                                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      exportExamToDocx({
                                        exam,
                                        includeSolutions: false,
                                        mode: exam.mode === 'bilingual' ? 'bilingual' : 'english_only',
                                      })
                                    }
                                    className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition flex items-center justify-center gap-1 border border-blue-200 dark:border-blue-900/40"
                                    title="Tải về file Word (.docx) đề thi không kèm đáp án"
                                  >
                                    <Download className="w-3 h-3 text-blue-600" />
                                    <span>Đề Word</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      exportExamToDocx({
                                        exam,
                                        includeSolutions: true,
                                        mode: exam.mode === 'bilingual' ? 'bilingual' : 'english_only',
                                      })
                                    }
                                    className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition flex items-center justify-center gap-1 border border-teal-200 dark:border-teal-900/40"
                                    title="Tải về file Word (.docx) có kèm đáp án và lời giải chi tiết"
                                  >
                                    <FileCheck className="w-3 h-3 text-teal-600" />
                                    <span>Đ/Án Word</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => printHaiPhongExam(exam, { sheetType: 'question_sheet' })}
                                    className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition flex items-center justify-center gap-1"
                                    title="In đề thi chuẩn mẫu Sở GD&ĐT Hải Phòng"
                                  >
                                    <Printer className="w-3 h-3" />
                                    <span>In PDF</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center font-bold text-lg">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                            {mockSearch ? 'Không tìm thấy đề thi phù hợp trong kho' : 'Chưa có đề thi nào trong kho'}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            {mockSearch
                              ? 'Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc chọn lọc tất cả đề.'
                              : 'Bạn có thể tự tạo đề mới bằng AI (chuẩn ma trận Hải Phòng 22 câu) để lưu vào kho và lấy ra luyện tập bất cứ lúc nào!'}
                          </p>
                          <div className="pt-2 flex items-center justify-center gap-3">
                            <button
                              onClick={() => setActiveTab('student_generate')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Tự Tạo Đề AI Ngay
                            </button>
                            <button
                              onClick={() => setIsJoinModalOpen(true)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 transition shadow-xs"
                            >
                              Nhập mã phòng thi
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
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
          Hệ thống dạy & học đội tuyển HSG Toán THPT bằng tiếng Anh • Chuẩn ma trận Sở GD&ĐT Hải Phòng
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
