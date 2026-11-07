import React from 'react';
import { Languages } from 'lucide-react';

interface TranslateButtonProps {
  shown: boolean;
  onClick: () => void;
  /** Nhãn khi đang ẩn bản dịch (mặc định "Dịch") */
  label?: string;
  className?: string;
}

/**
 * Nút "Dịch" cho đề song ngữ: mặc định chỉ hiện tiếng Anh,
 * bấm để hiện bản dịch tiếng Việt, bấm lần nữa để ẩn.
 */
export const TranslateButton: React.FC<TranslateButtonProps> = ({ shown, onClick, label = 'Dịch', className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={shown}
    title={shown ? 'Ẩn bản dịch tiếng Việt' : 'Hiện bản dịch tiếng Việt'}
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
      shown
        ? 'bg-teal-600 border-teal-600 text-white hover:bg-teal-700'
        : 'bg-white dark:bg-slate-800 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50'
    } ${className}`}
  >
    <Languages className="w-3.5 h-3.5" />
    {shown ? 'Ẩn bản dịch' : label}
  </button>
);

export default TranslateButton;
