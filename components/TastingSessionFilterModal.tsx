import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass,
  X,
  Faders,
  CalendarBlank,
  SortAscending,
  Thermometer,
} from 'phosphor-react';
import { ROAST_LEVELS } from '@/lib/constants';

type SortOption = 'newest' | 'oldest' | 'beanName';

interface TastingSessionFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  sortOption: SortOption;
  dateFrom: string;
  dateTo: string;
  selectedRoastLevels: Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'>;
  onApply: (filters: {
    searchQuery: string;
    sortOption: SortOption;
    dateFrom: string;
    dateTo: string;
    selectedRoastLevels: Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'>;
  }) => void;
}

export function TastingSessionFilterModal({
  isOpen,
  onClose,
  searchQuery,
  sortOption,
  dateFrom,
  dateTo,
  selectedRoastLevels,
  onApply,
}: TastingSessionFilterModalProps) {
  const [tempSearchQuery, setTempSearchQuery] = useState(searchQuery);
  const [tempSortOption, setTempSortOption] = useState(sortOption);
  const [tempDateFrom, setTempDateFrom] = useState(dateFrom);
  const [tempDateTo, setTempDateTo] = useState(dateTo);
  const [tempSelectedRoastLevels, setTempSelectedRoastLevels] = useState(selectedRoastLevels);

  // モーダルが開かれたときに現在の値を設定
  useEffect(() => {
    if (isOpen) {
      setTempSearchQuery(searchQuery);
      setTempSortOption(sortOption);
      setTempDateFrom(dateFrom);
      setTempDateTo(dateTo);
      setTempSelectedRoastLevels(selectedRoastLevels);
    }
  }, [isOpen, searchQuery, sortOption, dateFrom, dateTo, selectedRoastLevels]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleRoastLevelToggle = (level: '浅煎り' | '中煎り' | '中深煎り' | '深煎り') => {
    setTempSelectedRoastLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleApply = () => {
    onApply({
      searchQuery: tempSearchQuery,
      sortOption: tempSortOption,
      dateFrom: tempDateFrom,
      dateTo: tempDateTo,
      selectedRoastLevels: tempSelectedRoastLevels,
    });
    onClose();
  };

  const handleReset = () => {
    setTempSearchQuery('');
    setTempSortOption('newest');
    setTempDateFrom('');
    setTempDateTo('');
    setTempSelectedRoastLevels([]);
  };

  const hasActiveFilters =
    tempSearchQuery.trim() || tempDateFrom || tempDateTo || tempSelectedRoastLevels.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-[3rem] shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col border border-stone-100"
          >
            {/* ヘッダー */}
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <Faders size={24} weight="fill" className="text-amber-600" />
                </div>
                <h2 className="text-2xl font-black text-stone-800 tracking-tight">フィルター設定</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-stone-50 rounded-full transition-colors text-stone-400"
                aria-label="閉じる"
              >
                <X size={24} weight="bold" />
              </button>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8">
              {/* 検索バー */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                  <MagnifyingGlass size={16} weight="bold" />
                  豆の名前で検索
                </label>
                <input
                  type="text"
                  value={tempSearchQuery}
                  onChange={(e) => setTempSearchQuery(e.target.value)}
                  placeholder="豆の名前を入力..."
                  className="w-full px-5 py-4 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all text-stone-800 font-bold placeholder:text-stone-300"
                />
              </div>

              {/* ソート */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                  <SortAscending size={16} weight="bold" />
                  並び替え
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'newest', label: '新しい順' },
                    { id: 'oldest', label: '古い順' },
                    { id: 'beanName', label: '豆の名前順' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTempSortOption(opt.id as SortOption)}
                      className={`px-5 py-3.5 rounded-2xl text-left font-bold transition-all border-2 ${
                        tempSortOption === opt.id
                          ? 'bg-amber-50 border-amber-500 text-amber-700'
                          : 'bg-stone-50 border-transparent text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 日付範囲 */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                  <CalendarBlank size={16} weight="bold" />
                  日付範囲
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={tempDateFrom}
                    onChange={(e) => setTempDateFrom(e.target.value)}
                    className="px-4 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all text-stone-800 font-bold text-sm"
                  />
                  <input
                    type="date"
                    value={tempDateTo}
                    onChange={(e) => setTempDateTo(e.target.value)}
                    className="px-4 py-3.5 bg-stone-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all text-stone-800 font-bold text-sm"
                  />
                </div>
              </div>

              {/* 焙煎度合い */}
              <div className="space-y-3 pb-4">
                <label className="flex items-center gap-2 text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                  <Thermometer size={16} weight="bold" />
                  焙煎度合い
                </label>
                <div className="flex flex-wrap gap-2">
                  {ROAST_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => handleRoastLevelToggle(level)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${
                        tempSelectedRoastLevels.includes(level)
                          ? 'bg-stone-800 border-stone-800 text-white'
                          : 'bg-stone-50 border-transparent text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* フッター */}
            <div className="p-8 pt-4 bg-stone-50/50 flex flex-col gap-3">
              {hasActiveFilters && (
                <button
                  onClick={handleReset}
                  className="text-xs font-black text-amber-600 uppercase tracking-widest hover:underline mb-2 mx-auto"
                >
                  フィルターをリセット
                </button>
              )}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-white border-2 border-stone-100 text-stone-400 rounded-2xl font-black transition-all hover:bg-stone-100"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-6 py-4 bg-stone-800 text-white rounded-2xl font-black transition-all hover:bg-stone-900 shadow-xl shadow-stone-200"
                >
                  適用
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
