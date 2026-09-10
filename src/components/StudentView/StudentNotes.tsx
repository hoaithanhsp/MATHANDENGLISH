import React, { useState } from 'react';
import {
  BookOpen,
  Trash2,
  Printer,
  Search,
  Calendar,
  FileText,
  Download,
  GraduationCap,
  Sparkles,
  Layers,
  Languages,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { StudentStudyNote } from '../../types';
import MathRenderer from '../MathRenderer';
import { printExamOrNotes } from '../../utils/printPdf';
import { GIAO_AN_SESSIONS, GiaoAnSession } from '../../data/giaoanData';

interface StudentNotesProps {
  notes: StudentStudyNote[];
  onDeleteNote: (id: string) => void;
  onSelectTopic: (topic: string) => void;
}

export const StudentNotes: React.FC<StudentNotesProps> = ({
  notes,
  onDeleteNote,
  onSelectTopic,
}) => {
  // Mode: 'curriculum' (13 official lesson plans) vs 'personal' (user-saved notes)
  const [activeSource, setActiveSource] = useState<'curriculum' | 'personal'>('curriculum');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<GiaoAnSession>(GIAO_AN_SESSIONS[0]);
  const [selectedPersonalNote, setSelectedPersonalNote] = useState<StudentStudyNote | null>(notes[0] || null);

  // Filter 13 official lesson plans
  const filteredSessions = GIAO_AN_SESSIONS.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.topic.toLowerCase().includes(q) ||
      s.title_en.toLowerCase().includes(q) ||
      s.file_name.toLowerCase().includes(q)
    );
  });

  // Filter personal notes
  const filteredPersonal = notes.filter((n) =>
    n.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              THPT Khúc Thừa Dụ • Hải Phòng
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              Chương trình bồi dưỡng HSG Toán bằng Tiếng Anh
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Vở Ghi Ôn Tập & Hệ Thống 13 Giáo Án Bồi Dưỡng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Toàn bộ 13 bài giảng chuyên sâu chuẩn ma trận Sở GD&ĐT Hải Phòng và vở ghi chép cá nhân
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm bài học, chuyên đề, từ khóa..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Tabs Selector: 13 Official Sessions vs Personal Notes */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
        <button
          onClick={() => setActiveSource('curriculum')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
            activeSource === 'curriculum'
              ? 'bg-teal-600 text-white shadow-teal-500/20'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>13 Giáo Án Bồi Dưỡng Chính Khóa ({GIAO_AN_SESSIONS.length} Buổi)</span>
        </button>

        <button
          onClick={() => setActiveSource('personal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
            activeSource === 'personal'
              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Vở Ghi Cá Nhân Đã Lưu ({notes.length})</span>
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      {activeSource === 'curriculum' ? (
        /* 13 OFFICIAL SESSIONS */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: 13 Sessions List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-500" />
                Danh mục 13 Buổi Học ({filteredSessions.length})
              </h3>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                100% DOCX Chuẩn
              </span>
            </div>

            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {filteredSessions.map((session) => {
                const isSelected = selectedSession?.id === session.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-teal-50/80 dark:bg-teal-950/50 border-teal-500 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isSelected
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {session.session_number}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                          {session.title}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2 pl-8 font-serif italic">
                      {session.title_en}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60 pl-8">
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {session.file_size}
                      </span>
                      <span className="text-teal-600 dark:text-teal-400 font-medium">
                        {session.vocabulary?.length ? `${session.vocabulary.length} từ vựng` : 'Đề luyện thi'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Lesson Plan Detail */}
          <div className="lg:col-span-2 space-y-4">
            {selectedSession ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                        Buổi {selectedSession.session_number} / 13
                      </span>
                      <span className="text-xs text-slate-400">
                        Giáo viên: <strong>{selectedSession.teacher}</strong> ({selectedSession.school})
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedSession.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      {selectedSession.title_en}
                    </p>
                  </div>

                  {/* Actions: Download docx & Print */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/giaoan/${selectedSession.file_name}`}
                      download={selectedSession.file_name}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-xs"
                      title="Tải file Word DOCX gốc của bài giảng"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải File Word (.docx)
                    </a>
                    <button
                      onClick={() => printExamOrNotes(selectedSession.title)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                      title="In hoặc xuất PDF bài giảng"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      In / PDF
                    </button>
                  </div>
                </div>

                {/* Vocabulary Card if available */}
                {selectedSession.vocabulary && selectedSession.vocabulary.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Languages className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      Thuật Ngữ Toán Chuyên Ngành Trong Buổi Học (Key Vocabulary)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                            <th className="pb-1.5 font-bold">Thuật ngữ Tiếng Anh</th>
                            <th className="pb-1.5 font-bold">Phiên âm IPA</th>
                            <th className="pb-1.5 font-bold">Nghĩa Tiếng Việt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {selectedSession.vocabulary.map((v, vIdx) => (
                            <tr key={vIdx} className="hover:bg-teal-50/40 dark:hover:bg-teal-950/20">
                              <td className="py-1.5 font-bold text-teal-600 dark:text-teal-400 font-mono">
                                {v.term_en}
                              </td>
                              <td className="py-1.5 text-slate-400 font-mono text-[11px]">
                                {v.pronunciation || '—'}
                              </td>
                              <td className="py-1.5 text-slate-700 dark:text-slate-300 font-medium">
                                {v.term_vi}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Full Markdown Lesson Content with KaTeX */}
                <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-2">
                    Nội Dung Giáo Án Chi Tiết
                  </div>
                  <MathRenderer content={selectedSession.content_markdown} />
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-700">
                Chọn một giáo án từ danh sách bên trái để xem nội dung chi tiết.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* PERSONAL NOTES (USER SAVED) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              Ghi chú cá nhân đã lưu ({filteredPersonal.length})
            </h3>

            <div className="space-y-2.5">
              {filteredPersonal.length > 0 ? (
                filteredPersonal.map((note) => {
                  const isSelected = selectedPersonalNote?.id === note.id;
                  return (
                    <div
                      key={note.id}
                      onClick={() => setSelectedPersonalNote(note)}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                          {note.topic}
                        </span>
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {note.mode === 'bilingual' ? 'Song ngữ' : 'Tiếng Anh'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(note.created_at).toLocaleDateString('vi-VN')}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNote(note.id);
                            if (selectedPersonalNote?.id === note.id) {
                              setSelectedPersonalNote(null);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-500 p-1"
                          title="Xóa vở ghi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-slate-400 text-xs space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Chưa có bài ghi cá nhân nào</p>
                  <p className="text-[11px] text-slate-400">
                    Hãy vào "Tự học chuyên đề" để lưu thêm kiến thức vào đây.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Detail */}
          <div className="lg:col-span-2 space-y-4">
            {selectedPersonalNote ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                      Vở Ghi Cá Nhân
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedPersonalNote.topic}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => printExamOrNotes(`Vở ghi: ${selectedPersonalNote.topic}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      In / PDF
                    </button>
                  </div>
                </div>

                {/* Theory Content with KaTeX */}
                <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm">
                  <MathRenderer content={selectedPersonalNote.content_markdown} />
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
                  Chưa Có Ghi Chú Cá Nhân
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Bạn có thể tra cứu thêm bất kỳ chuyên đề nào từ <strong>"Tự học chuyên đề"</strong> và lưu vào vở ghi cá nhân này.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onSelectTopic('Lượng Giác')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition"
                  >
                    Mở Tự học chuyên đề
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentNotes;
