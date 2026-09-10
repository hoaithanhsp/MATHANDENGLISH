import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  ChevronDown,
  ChevronUp,
  Award,
  XCircle,
  Activity,
  ShieldAlert,
  RefreshCw,
  Filter,
  Users,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { ExamSession, Exam } from '../../types';
import { storageService } from '../../services/storageService';
import { isMathAnswerCorrect } from '../../utils/mathAnswerEvaluator';

interface LiveMonitorPanelProps {
  exam: Exam;
}

export const LiveMonitorPanel: React.FC<LiveMonitorPanelProps> = ({ exam }) => {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [allSessions, setAllSessions] = useState<ExamSession[]>([]);
  const [filterScope, setFilterScope] = useState<'current' | 'all'>('current');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch / Sync sessions
  const loadSessions = useCallback(async () => {
    try {
      const [currentExamSessions, all] = await Promise.all([
        storageService.getExamSessions(exam.id, exam.access_code),
        storageService.getAllExamSessions(),
      ]);

      setSessions(
        currentExamSessions.sort(
          (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
        )
      );
      setAllSessions(
        all.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      );
    } catch (err) {
      console.warn('Lỗi tải sessions:', err);
    }
  }, [exam.id, exam.access_code]);

  // Realtime subscription (Local BroadcastChannel + Storage Event + Firebase RTDB)
  useEffect(() => {
    loadSessions();

    const unsub = storageService.onExamSessionsChanged(
      exam.id,
      (updated) => {
        setSessions(
          [...updated].sort(
            (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
          )
        );
        // Đồng thời cập nhật danh sách allSessions
        storageService.getAllExamSessions().then((all) => {
          setAllSessions(
            all.sort(
              (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
            )
          );
        });
      },
      exam.access_code
    );

    return () => unsub();
  }, [exam.id, exam.access_code, loadSessions]);

  // Clock tick for duration
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadSessions();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleClearSessions = async () => {
    const isCurrentScope = filterScope === 'current';
    const targetName = isCurrentScope ? `phòng thi đề "${exam.access_code}"` : 'toàn bộ các phòng thi';
    if (!window.confirm(`Thầy/Cô có chắc muốn dọn dẹp/reset danh sách thí sinh trong ${targetName}?`)) {
      return;
    }
    setIsRefreshing(true);
    try {
      if (isCurrentScope) {
        await storageService.clearExamSessions(exam.id);
        if (exam.access_code && exam.access_code !== exam.id) {
          await storageService.clearExamSessions(exam.access_code);
        }
      } else {
        await storageService.clearExamSessions();
      }
      await loadSessions();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Lấy danh sách assignments đã nộp để đối chiếu trạng thái
  const assignments = storageService.getAssignments();

  // Chọn danh sách hiển thị tùy theo filterScope và chuẩn hóa trạng thái đã nộp
  const activeListRaw = filterScope === 'current' ? sessions : allSessions;
  const activeList: ExamSession[] = activeListRaw.map((s) => {
    // Nếu session đã có status === 'completed' thì giữ nguyên
    if (s.status === 'completed') return s;

    // Đối chiếu với danh sách assignments đã nộp:
    // Nếu học sinh đã có bài nộp cho đề này, chắc chắn học sinh đã nộp bài!
    const matchingAsgn = assignments.find((a) => {
      const matchExam = a.exam_id === s.exam_id || a.exam_id === exam.id || a.exam_id === exam.access_code;
      const matchStudent =
        (a.student_id && s.student_id && a.student_id === s.student_id) ||
        (a.student_name && s.student_name && a.student_name.trim().toLowerCase() === s.student_name.trim().toLowerCase());
      return matchExam && matchStudent;
    });

    if (matchingAsgn) {
      return {
        ...s,
        status: 'completed',
        score: typeof s.score === 'number' ? s.score : matchingAsgn.score,
        submitted_at: s.submitted_at || matchingAsgn.submitted_at || matchingAsgn.created_at,
        tab_switch_count: typeof s.tab_switch_count === 'number' ? s.tab_switch_count : matchingAsgn.tab_switch_count,
        answers: s.answers || matchingAsgn.answers,
      };
    }

    return s;
  });

  const inProgress = activeList.filter((s) => s.status === 'in_progress');
  const completed = activeList.filter((s) => s.status === 'completed');

  const formatDuration = (startedAt: string) => {
    const elapsed = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m} phút ${s.toString().padStart(2, '0')} giây`;
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getExamDuration = (session: ExamSession) => {
    if (!session.submitted_at) return '—';
    const elapsed = Math.max(
      0,
      Math.floor(
        (new Date(session.submitted_at).getTime() - new Date(session.started_at).getTime()) / 1000
      )
    );
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m} phút ${s.toString().padStart(2, '0')} giây`;
  };

  const questions = exam.questions || [];

  return (
    <div className="space-y-4">
      {/* Control Bar: Filter Scope & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setFilterScope('current')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              filterScope === 'current'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Đề này ({exam.access_code})
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
              {sessions.length}
            </span>
          </button>
          <button
            onClick={() => setFilterScope('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              filterScope === 'all'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Tất cả thí sinh
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
              {allSessions.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>Đang trực tiếp</span>
          </div>

          {activeList.length > 0 && (
            <button
              onClick={handleClearSessions}
              disabled={isRefreshing}
              title="Dọn dẹp / Reset danh sách thí sinh trong phòng thi"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dọn phòng</span>
            </button>
          )}

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Làm mới danh sách thí sinh"
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {activeList.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-center border border-dashed border-slate-300 dark:border-slate-600">
          <Radio className="w-8 h-8 mx-auto text-slate-400 mb-2 animate-pulse" />
          <p className="text-sm text-slate-700 dark:text-slate-300 font-bold">
            Chưa có học sinh nào vào phòng thi
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Khi học sinh nhập mã phòng thi{' '}
            <span className="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.5 rounded">
              {exam.access_code}
            </span>{' '}
            và bắt đầu làm bài, danh sách thí sinh và tiến độ sẽ hiển thị tức thì tại đây.
          </p>
          {allSessions.length > 0 && filterScope === 'current' && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                💡 Phát hiện đang có <b>{allSessions.length}</b> thí sinh làm bài ở các đề thi khác.
              </p>
              <button
                onClick={() => setFilterScope('all')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-xs"
              >
                <Users className="w-3.5 h-3.5" />
                Xem tất cả thí sinh đang thi
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Header Stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {inProgress.length} đang thi
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                {completed.length} đã nộp bài
              </span>
            </div>
            {activeList.some((s) => (s.tab_switch_count ?? 0) > 0) && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  {activeList.filter((s) => (s.tab_switch_count ?? 0) > 0).length} cảnh báo chuyển tab
                </span>
              </div>
            )}
          </div>

          {/* In Progress */}
          {inProgress.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Đang làm bài ({inProgress.length})
              </h4>
              {inProgress.map((session) => (
                <div
                  key={session.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800/50 p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {(session.student_name || 'HS')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-800 dark:text-white">
                            {session.student_name}
                          </p>
                          {session.access_code && session.access_code !== exam.access_code && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Mã: {session.access_code}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Bắt đầu: {formatTime(session.started_at)} • Cập nhật gần nhất:{' '}
                          {formatTime(session.last_active_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 justify-end">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-mono font-bold">
                          {formatDuration(session.started_at)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Đã làm:{' '}
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {session.answered_count}/{session.total_questions || 22} câu
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          session.total_questions > 0
                            ? Math.min(100, (session.answered_count / session.total_questions) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  {(session.tab_switch_count ?? 0) > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">
                        Đã chuyển tab {session.tab_switch_count} lần trong khi làm bài
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-blue-500" />
                Đã nộp bài ({completed.length})
              </h4>
              {completed.map((session) => {
                const isExpanded = expandedSession === session.id;
                return (
                  <div
                    key={session.id}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 transition text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {(session.student_name || 'HS')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-800 dark:text-white">
                              {session.student_name}
                            </p>
                            {session.access_code && session.access_code !== exam.access_code && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                Mã: {session.access_code}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Thời gian thi: {getExamDuration(session)} • Nộp lúc:{' '}
                            {formatTime(session.submitted_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-amber-500" />
                            <span className="text-base font-bold text-slate-800 dark:text-white">
                              {(session.score ?? 0).toFixed(2)}/20.00
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              ✓ {session.correct_count ?? 0}
                            </span>
                            <span className="text-rose-500 font-medium">
                              ✗ {session.wrong_count ?? 0}
                            </span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && session.answers && (
                      <div className="border-t border-slate-100 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/50">
                        <h5 className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" /> Chi tiết đáp án từng câu
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {questions.map((q) => {
                            const studentAns = session.answers?.[q.id] || '—';
                            const isCorrect =
                              q.part === 'PART_1'
                                ? studentAns.trim().toUpperCase() ===
                                  q.correct_answer.trim().toUpperCase()
                                : isMathAnswerCorrect(
                                    studentAns,
                                    q.correct_answer,
                                    q.acceptable_answers
                                  );
                            return (
                              <div
                                key={q.id}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${
                                  isCorrect
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                                }`}
                              >
                                <span className="font-bold text-slate-600 dark:text-slate-300 w-8 shrink-0">
                                  C{q.order_index}
                                </span>
                                {isCorrect ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                )}
                                <span className="truncate text-slate-700 dark:text-slate-300">
                                  HS:{' '}
                                  <span className="font-mono font-bold">
                                    {studentAns || '(bỏ trống)'}
                                  </span>
                                </span>
                                {!isCorrect && (
                                  <span className="ml-auto text-emerald-700 dark:text-emerald-400 font-mono font-bold shrink-0">
                                    ĐA: {q.correct_answer}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {(session.tab_switch_count ?? 0) > 0 && (
                          <div className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                              ⚠️ Học sinh đã chuyển tab {session.tab_switch_count} lần trong quá
                              trình thi
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
