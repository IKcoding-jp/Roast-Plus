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
import { Button, IconButton, Input } from '@/components/ui';

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
  isChristmasMode?: boolean;
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
  isChristmasMode = false,
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

  // クリスマスモード用のスタイル
  const modalBgClass = isChristmasMode ? 'bg-[#0a2f1a]' : 'bg-white';
  const modalBorderClass = isChristmasMode ? 'border-[#d4af37]/30' : 'border-stone-100';
  const textPrimaryClass = isChristmasMode ? 'text-[#f8f1e7]' : 'text-stone-800';
  const textLabelClass = isChristmasMode ? 'text-[#d4af37]/80' : 'text-stone-400';
  const iconBgClass = isChristmasMode ? 'bg-[#d4af37]/20' : 'bg-amber-50';
  const iconColorClass = isChristmasMode ? 'text-[#d4af37]' : 'text-amber-600';
  const footerBgClass = isChristmasMode ? 'bg-white/5' : 'bg-stone-50/50';

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
            className={`relative ${modalBgClass} rounded-[3rem] shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col border ${modalBorderClass}`}
          >
            {/* ヘッダー */}
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${iconBgClass} rounded-xl`}>
                  <Faders size={24} weight="fill" className={iconColorClass} />
                </div>
                <h2 className={`text-2xl font-black ${textPrimaryClass} tracking-tight`}>フィルター設定</h2>
              </div>
              <IconButton
                variant="ghost"
                onClick={onClose}
                aria-label="閉じる"
                isChristmasMode={isChristmasMode}
              >
                <X size={24} weight="bold" />
              </IconButton>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8">
              {/* 検索バー */}
              <div className="space-y-3">
                <label className={`flex items-center gap-2 text-xs font-black ${textLabelClass} uppercase tracking-widest ml-1`}>
                  <MagnifyingGlass size={16} weight="bold" />
                  豆の名前で検索
                </label>
                <Input
                  type="text"
                  value={tempSearchQuery}
                  onChange={(e) => setTempSearchQuery(e.target.value)}
                  placeholder="豆の名前を入力..."
                  isChristmasMode={isChristmasMode}
                />
              </div>

              {/* ソート */}
              <div className="space-y-3">
                <label className={`flex items-center gap-2 text-xs font-black ${textLabelClass} uppercase tracking-widest ml-1`}>
                  <SortAscending size={16} weight="bold" />
                  並び替え
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'newest', label: '新しい順' },
                    { id: 'oldest', label: '古い順' },
                    { id: 'beanName', label: '豆の名前順' },
                  ].map((opt) => (
                    <Button
                      key={opt.id}
                      variant={tempSortOption === opt.id ? 'primary' : 'ghost'}
                      onClick={() => setTempSortOption(opt.id as SortOption)}
                      isChristmasMode={isChristmasMode}
                      className="justify-start"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 日付範囲 */}
              <div className="space-y-3">
                <label className={`flex items-center gap-2 text-xs font-black ${textLabelClass} uppercase tracking-widest ml-1`}>
                  <CalendarBlank size={16} weight="bold" />
                  日付範囲
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={tempDateFrom}
                    onChange={(e) => setTempDateFrom(e.target.value)}
                    isChristmasMode={isChristmasMode}
                  />
                  <Input
                    type="date"
                    value={tempDateTo}
                    onChange={(e) => setTempDateTo(e.target.value)}
                    isChristmasMode={isChristmasMode}
                  />
                </div>
              </div>

              {/* 焙煎度合い */}
              <div className="space-y-3 pb-4">
                <label className={`flex items-center gap-2 text-xs font-black ${textLabelClass} uppercase tracking-widest ml-1`}>
                  <Thermometer size={16} weight="bold" />
                  焙煎度合い
                </label>
                <div className="flex flex-wrap gap-2">
                  {ROAST_LEVELS.map((level) => (
                    <Button
                      key={level}
                      variant={tempSelectedRoastLevels.includes(level) ? 'coffee' : 'ghost'}
                      size="sm"
                      onClick={() => handleRoastLevelToggle(level)}
                      isChristmasMode={isChristmasMode}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* フッター */}
            <div className={`p-8 pt-4 ${footerBgClass} flex flex-col gap-3`}>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  isChristmasMode={isChristmasMode}
                  className="mx-auto"
                >
                  フィルターをリセット
                </Button>
              )}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  isChristmasMode={isChristmasMode}
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApply}
                  isChristmasMode={isChristmasMode}
                  className="flex-1"
                >
                  適用
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
