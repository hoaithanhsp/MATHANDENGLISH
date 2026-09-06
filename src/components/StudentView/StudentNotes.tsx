import React, { useState } from 'react';
import { BookOpen, Trash2, Printer, Search, Calendar, FileText } from 'lucide-react';
import { StudentStudyNote } from '../../types';
import MathRenderer from '../MathRenderer';
import { printExamOrNotes } from '../../utils/printPdf';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<StudentStudyNote | null>(notes[0] || null);

  const filtered = notes.filter((n) =>
    n.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Vở Ghi Chép Chuyên Đề Của Tôi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tổng hợp bài học lý thuyết, thuật ngữ chuyên ngành và phương pháp giải đã lưu
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo chuyên đề..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Main Grid: Left Notes List, Right Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Chuyên đề đã lưu ({filtered.length})
          </h3>

          <div className="space-y-2.5">
            {filtered.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
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
                        if (selectedNote?.id === note.id) {
                          setSelectedNote(null);
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
            })}
          </div>
        </div>

        {/* Right Detail */}
        <div className="lg:col-span-2 space-y-4">
          {selectedNote ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[11px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                    Vở Ghi Bài Học
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedNote.topic}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => printExamOrNotes(`Vở ghi: ${selectedNote.topic}`)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    In / PDF
                  </button>
                </div>
              </div>

              {/* Theory Content with KaTeX */}
              <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm">
                <MathRenderer content={selectedNote.content_markdown} />
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-700">
              Chọn một bài ghi từ danh sách để xem nội dung chi tiết.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
