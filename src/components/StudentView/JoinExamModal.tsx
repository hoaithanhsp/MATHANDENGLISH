import React, { useState, useEffect } from 'react';
import { KeyRound, X, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Exam } from '../../types';

interface JoinExamModalProps {
  isOpen: boolean;
  initialStudentName?: string;
  onClose: () => void;
  onJoinExam: (exam: Exam, studentName: string) => void;
  onFindExamByCode: (code: string) => Promise<Exam | undefined> | Exam | undefined;
}

export const JoinExamModal: React.FC<JoinExamModalProps> = ({
  isOpen,
  initialStudentName = '',
  onClose,
  onJoinExam,
  onFindExamByCode,
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [studentName, setStudentName] = useState(initialStudentName);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (initialStudentName) {
      setStudentName(initialStudentName);
    }
  }, [initialStudentName]);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCode = accessCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Vui lòng nhập mã phòng thi do giáo viên cung cấp.');
      return;
    }

    setIsSearching(true);
    try {
      const exam = await Promise.resolve(onFindExamByCode(cleanCode));
      if (!exam) {
        setErrorMsg(`Không tìm thấy đề thi với mã "${cleanCode}". Vui lòng kiểm tra lại mã phòng thi do giáo viên cung cấp.`);
        return;
      }

      if (!exam.is_published) {
        setErrorMsg('Đề thi này hiện đang tạm khóa hoặc chưa được giáo viên mở thi.');
        return;
      }

      onJoinExam(exam, studentName.trim() || 'Học sinh');
      onClose();
    } catch (err: any) {
      setErrorMsg(`Lỗi kết nối khi tra cứu: ${err?.message || 'Vui lòng kiểm tra kết nối mạng.'}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Vào Phòng Thi Tuyển Chọn
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nhập mã đề thi (Exam Access Code)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Họ và tên thí sinh:
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="VD: Nguyễn Văn A - THPT Khúc Thừa Dụ"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mã phòng thi (Access Code):
            </label>
            <input
              type="text"
              required
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="VD: HP-XXXX-2026"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-xs"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tìm phòng thi...</span>
                </>
              ) : (
                <>
                  <span>Bắt đầu làm bài</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
