import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Volume2,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Sparkles,
  Layers,
  Plus,
  X,
  Languages
} from 'lucide-react';
import { VocabWord, MathStrand } from '../../types';
import { OLYMPIAD_VOCABULARY } from '../../data/olympiadVocabulary';
import { storageService } from '../../services/storageService';
import { MathRenderer } from '../MathRenderer';

export const InteractiveVocabModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dictionary' | 'flashcards'>('dictionary');
  const [words, setWords] = useState<VocabWord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStrand, setSelectedStrand] = useState<string>('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Add new word modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEn, setNewEn] = useState('');
  const [newVi, setNewVi] = useState('');
  const [newPron, setNewPron] = useState('');
  const [newDef, setNewDef] = useState('');
  const [newEx, setNewEx] = useState('');
  const [newStrand, setNewStrand] = useState<MathStrand>('algebra_calculus');

  const loadWords = () => {
    const saved = storageService.getVocabWords();
    if (saved && saved.length > 0) {
      setWords(saved);
    } else {
      // Initialize with default dictionary
      setWords(OLYMPIAD_VOCABULARY);
      OLYMPIAD_VOCABULARY.forEach((w) => storageService.saveVocabWord(w));
    }
  };

  useEffect(() => {
    loadWords();
  }, []);

  const handleToggleBookmark = (id: string) => {
    storageService.toggleVocabBookmark(id);
    loadWords();
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEn.trim() || !newVi.trim()) return;

    const newWord: VocabWord = {
      id: `custom-vocab-${Date.now()}`,
      term_en: newEn.trim(),
      term_vi: newVi.trim(),
      pronunciation: newPron.trim() || undefined,
      definition: newDef.trim() || 'Thuật ngữ toán học tiếng Anh.',
      example: newEx.trim() || undefined,
      strand: newStrand,
      is_bookmarked: true,
    };

    storageService.saveVocabWord(newWord);
    loadWords();
    setShowAddModal(false);
    setNewEn('');
    setNewVi('');
    setNewPron('');
    setNewDef('');
    setNewEx('');
  };

  // Filter words
  const filteredWords = words.filter((w) => {
    if (bookmarkedOnly && !w.is_bookmarked) return false;
    if (selectedStrand !== 'all' && w.strand !== selectedStrand) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEn = w.term_en.toLowerCase().includes(q);
      const matchVi = w.term_vi.toLowerCase().includes(q);
      const matchDef = w.definition.toLowerCase().includes(q);
      if (!matchEn && !matchVi && !matchDef) return false;
    }
    return true;
  });

  const flashcardList = filteredWords.length > 0 ? filteredWords : words;
  const currentCard = flashcardList[cardIndex % flashcardList.length];

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-blue-300 mb-2">
            <Languages className="w-3.5 h-3.5" />
            Interactive Math Vocabulary & Flashcards
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Từ Điển Thuật Ngữ Toán Tiếng Anh
          </h2>
          <p className="text-blue-200 text-xs sm:text-sm mt-1 max-w-xl">
            Kho 150+ thuật ngữ Toán Olympic đặc thù (Hải Phòng & Quốc tế). Tích hợp phát âm chuẩn IPA, định nghĩa, ví dụ và thẻ Flashcard Anki ghi nhớ siêu tốc.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-white text-teal-950 font-bold text-xs shadow-md hover:bg-blue-50 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Thêm Thuật Ngữ Mới
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Dictionary vs Flashcards */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'dictionary'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Tra Cứu Từ Điển ({words.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('flashcards');
              setIsFlipped(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'flashcards'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Thẻ Ghi Nhớ Flashcard
          </button>
        </div>

        <button
          onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
            bookmarkedOnly
              ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          {bookmarkedOnly ? 'Đang lọc từ đánh dấu' : 'Từ đã đánh dấu'}
        </button>
      </div>

      {/* ============================================================ */}
      {/* MODE 1: DICTIONARY LOOKUP */}
      {/* ============================================================ */}
      {activeTab === 'dictionary' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedStrand}
                onChange={(e) => setSelectedStrand(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="all">Tất cả mạch kiến thức</option>
                <option value="algebra_calculus">Đại số – Giải tích</option>
                <option value="geometry_measurement">Hình học – Đo lường</option>
                <option value="statistics_discrete">Xác suất – Rời rạc – Số học</option>
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tra từ tiếng Anh, tiếng Việt, định nghĩa..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Words Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWords.map((word) => (
              <div
                key={word.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-teal-300 dark:hover:border-teal-600 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-teal-600 dark:text-teal-400">
                          <MathRenderer content={word.term_en} inline />
                        </span>
                        <button
                          onClick={() => handleSpeak(word.term_en)}
                          className="p-1 rounded-full text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          title="Nghe phát âm chuẩn"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {word.pronunciation && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {word.pronunciation}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleBookmark(word.id)}
                      className={`p-1.5 rounded-lg transition ${
                        word.is_bookmarked
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                          : 'text-slate-300 hover:text-amber-500'
                      }`}
                      title={word.is_bookmarked ? 'Bỏ lưu' : 'Lưu vào thẻ ghi nhớ'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white flex items-baseline gap-1">
                    <span>👉</span> <MathRenderer content={word.term_vi} inline />
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    <MathRenderer content={word.definition} inline />
                  </div>
                </div>

                {word.example && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 italic">
                    <strong className="not-italic text-teal-600 dark:text-teal-400 font-semibold">Ví dụ: </strong>
                    <MathRenderer content={word.example} inline />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: ANKI FLASHCARD VIEW */}
      {/* ============================================================ */}
      {activeTab === 'flashcards' && currentCard && (
        <div className="max-w-xl mx-auto space-y-5 py-4">
          <div className="text-center text-xs text-slate-500">
            Thẻ <strong>{(cardIndex % flashcardList.length) + 1}</strong> / {flashcardList.length}
          </div>

          {/* Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[300px] rounded-3xl p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-teal-200 dark:border-teal-900 shadow-xl flex flex-col items-center justify-center text-center relative transition-all duration-300 hover:shadow-2xl select-none"
          >
            <span className="absolute top-4 right-4 text-slate-400 text-xs flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" /> Chạm để lật thẻ
            </span>

            {!isFlipped ? (
              // FRONT SIDE: English term + pronunciation
              <div className="space-y-4 animate-in fade-in flex flex-col items-center">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                  {currentCard.strand || 'Math Olympiad'}
                </span>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  <MathRenderer content={currentCard.term_en} inline />
                </h3>
                {currentCard.pronunciation && (
                  <p className="text-sm font-mono text-teal-600 dark:text-teal-400">
                    {currentCard.pronunciation}
                  </p>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(currentCard.term_en);
                  }}
                  className="px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900 transition flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                  title="Nghe phát âm chuẩn (Web Speech)"
                >
                  <Volume2 className="w-4 h-4" /> Phát âm Audio
                </button>
                <div className="pt-2 text-xs text-slate-400">
                  (Bấm vào thẻ để xem nghĩa và định nghĩa toán học)
                </div>
              </div>
            ) : (
              // BACK SIDE: Vietnamese + Definition + Example
              <div className="space-y-4 animate-in fade-in flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    <MathRenderer content={currentCard.term_vi} inline />
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(currentCard.term_en);
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    title="Nghe lại phát âm tiếng Anh"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-md text-center">
                  <MathRenderer content={currentCard.definition} inline />
                </div>
                {currentCard.example && (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-xs italic text-slate-600 dark:text-slate-300">
                    <strong className="not-italic font-semibold text-teal-600 dark:text-teal-400">Ví dụ: </strong>
                    <MathRenderer content={currentCard.example} inline />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Flashcard Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                setCardIndex((prev) => (prev > 0 ? prev - 1 : flashcardList.length - 1));
                setIsFlipped(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Thẻ trước
            </button>

            <button
              onClick={() => handleToggleBookmark(currentCard.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                currentCard.is_bookmarked
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
              {currentCard.is_bookmarked ? 'Đã lưu ghi nhớ' : 'Đánh dấu từ này'}
            </button>

            <button
              onClick={() => {
                setCardIndex((prev) => prev + 1);
                setIsFlipped(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              Thẻ kế tiếp <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Add Custom Word */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Thêm Thuật Ngữ Mới Vào Sổ Tay
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWord} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Thuật ngữ Tiếng Anh: *
                </label>
                <input
                  type="text"
                  required
                  value={newEn}
                  onChange={(e) => setNewEn(e.target.value)}
                  placeholder="VD: circumcenter, coprime..."
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Phiên âm IPA (tùy chọn):
                </label>
                <input
                  type="text"
                  value={newPron}
                  onChange={(e) => setNewPron(e.target.value)}
                  placeholder="VD: /ˈsɜrkəmˌsɛntər/"
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nghĩa Tiếng Việt: *
                </label>
                <input
                  type="text"
                  required
                  value={newVi}
                  onChange={(e) => setNewVi(e.target.value)}
                  placeholder="VD: tâm đường tròn ngoại tiếp"
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mạch kiến thức:
                </label>
                <select
                  value={newStrand}
                  onChange={(e) => setNewStrand(e.target.value as MathStrand)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="algebra_calculus">Đại số – Giải tích</option>
                  <option value="geometry_measurement">Hình học – Đo lường</option>
                  <option value="statistics_discrete">Xác suất – Rời rạc – Số học</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Định nghĩa ngắn gọn:
                </label>
                <textarea
                  rows={2}
                  value={newDef}
                  onChange={(e) => setNewDef(e.target.value)}
                  placeholder="Định nghĩa bản chất toán học..."
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Ví dụ minh họa:
                </label>
                <input
                  type="text"
                  value={newEx}
                  onChange={(e) => setNewEx(e.target.value)}
                  placeholder="VD: The centroid divides each median into 2:1 ratio."
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700"
                >
                  Lưu Thuật Ngữ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
