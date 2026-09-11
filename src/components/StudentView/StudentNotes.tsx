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
  FolderOpen,
  FileDown
} from 'lucide-react';
import { StudentStudyNote } from '../../types';
import MathRenderer from '../MathRenderer';
import { printExamOrNotes } from '../../utils/printPdf';
import { GIAO_AN_SESSIONS, GiaoAnSession } from '../../data/giaoanData';
import { VO_GHI_CHAPTERS, VoGhiChapter } from '../../data/voghiData';

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
  const [selectedVoGhi, setSelectedVoGhi] = useState<VoGhiChapter>(VO_GHI_CHAPTERS[0]);

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

  // Filter vo ghi chapters
  const filteredVoGhi = VO_GHI_CHAPTERS.filter((v) => {
    const q = searchTerm.toLowerCase();
    return (
      v.title.toLowerCase().includes(q) ||
      v.title_vi.toLowerCase().includes(q) ||
      `chương ${v.chapter_number}`.includes(q) ||
      `chapter ${v.chapter_number}`.includes(q)
    );
  });

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
          <span>Vở Ghi Cá Nhân Đã Lưu ({VO_GHI_CHAPTERS.length})</span>
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
                100% PDF Chuẩn
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

                  {/* Actions: Download PDF & DOCX */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/giaoan/${selectedSession.pdf_file_name}`}
                      download={selectedSession.pdf_file_name}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-xs"
                      title="Tải file PDF giữ nguyên định dạng gốc"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải PDF
                    </a>
                    <a
                      href={`/giaoan/${selectedSession.file_name}`}
                      download={selectedSession.file_name}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                      title="Tải file Word DOCX gốc của bài giảng"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      DOCX
                    </a>
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

                {/* PDF Viewer */}
                <div className="space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-2">
                    Nội Dung Giáo Án Chi Tiết (PDF)
                  </div>
                  <iframe
                    src={`/giaoan/${selectedSession.pdf_file_name}`}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700"
                    style={{ height: '80vh', minHeight: '500px' }}
                    title={`Giáo án: ${selectedSession.title}`}
                  />
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
        /* 25 CHAPTER PDF NOTEBOOKS */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chapter List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                Vở Ghi Ôn Tập ({filteredVoGhi.length} Chương)
              </h3>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                100% PDF Chuẩn
              </span>
            </div>

            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {filteredVoGhi.map((chapter) => {
                const isSelected = selectedVoGhi?.id === chapter.id;
                return (
                  <div
                    key={chapter.id}
                    onClick={() => setSelectedVoGhi(chapter)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-500 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {chapter.chapter_number}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                          {chapter.title_vi}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2 pl-8 font-serif italic">
                      {chapter.title}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60 pl-8">
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {chapter.file_size}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        PDF
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Chapter PDF Detail */}
          <div className="lg:col-span-2 space-y-4">
            {selectedVoGhi ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Chương {selectedVoGhi.chapter_number} / 25
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedVoGhi.title_vi}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      {selectedVoGhi.title}
                    </p>
                  </div>

                  {/* Actions: Download PDF */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/vo-ghi/${encodeURIComponent(selectedVoGhi.pdf_file_name)}`}
                      download={selectedVoGhi.pdf_file_name}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
                      title="Tải file PDF vở ghi"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải PDF
                    </a>
                  </div>
                </div>

                {/* PDF Viewer */}
                <div className="space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-2">
                    Nội Dung Vở Ghi (PDF)
                  </div>
                  <iframe
                    src={`/vo-ghi/${encodeURIComponent(selectedVoGhi.pdf_file_name)}`}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700"
                    style={{ height: '80vh', minHeight: '500px' }}
                    title={`Vở ghi: ${selectedVoGhi.title_vi}`}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-700">
                Chọn một chương từ danh sách bên trái để xem nội dung.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentNotes;
