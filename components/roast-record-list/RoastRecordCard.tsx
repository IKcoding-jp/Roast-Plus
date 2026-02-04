'use client';

import { formatTime } from '@/lib/roastTimerUtils';
import { Card, IconButton } from '@/components/ui';
import { HiTrash, HiCalendar } from 'react-icons/hi';
import { MdTimer } from 'react-icons/md';
import { PiCoffeeBeanFill } from 'react-icons/pi';
import type { RoastTimerRecord } from '@/types';

interface RoastRecordCardProps {
  record: RoastTimerRecord;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClick: (id: string) => void;
  isChristmasMode?: boolean;
}

const formatDate = (dateStr: string) => {
  // YYYY-MM-DD形式をYYYY/MM/DD形式に変換
  const [year, month, day] = dateStr.split('-');
  return `${year}/${month}/${day}`;
};

const getRoastLevelColor = (
  level: '浅煎り' | '中煎り' | '中深煎り' | '深煎り'
) => {
  switch (level) {
    case '深煎り':
      return '#120C0A';
    case '中深煎り':
      return '#4E3526';
    case '中煎り':
      return '#745138';
    case '浅煎り':
      return '#C78F5D';
    default:
      return '#6B7280';
  }
};

export function RoastRecordCard({ record, onDelete, onClick, isChristmasMode = false }: RoastRecordCardProps) {
  return (
    <Card
      variant="hoverable"
      className="p-3 md:p-4 relative h-auto"
      onClick={() => onClick(record.id)}
      isChristmasMode={isChristmasMode}
    >
      {/* 削除ボタン（右上） */}
      <div className="absolute top-2 right-2 z-10">
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(record.id, e);
          }}
          size="md"
          title="削除"
          aria-label="削除"
          className="text-red-600 hover:bg-red-50"
          isChristmasMode={isChristmasMode}
        >
          <HiTrash className="h-4 w-4" />
        </IconButton>
      </div>

      {/* 豆名と焙煎度合い */}
      <div className="flex items-center gap-2 mb-3 pr-8">
        <div className="flex-shrink-0">
          <PiCoffeeBeanFill className={`h-4 w-4 md:h-5 md:w-5 ${isChristmasMode ? 'text-[#d4af37]' : 'text-amber-700'}`} />
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <h3 className={`text-base md:text-lg font-bold truncate ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-900'}`}>
            {record.beanName}
          </h3>
          <span
            className="inline-block px-2 py-0.5 text-white text-xs font-semibold rounded-full flex-shrink-0"
            style={{ backgroundColor: getRoastLevelColor(record.roastLevel) }}
          >
            {record.roastLevel}
          </span>
        </div>
      </div>

      {/* 詳細情報 */}
      <div className="space-y-2">
        {/* 焙煎時間 */}
        <div className="flex items-center gap-2">
          <MdTimer className={`h-4 w-4 flex-shrink-0 ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-400'}`} />
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-500'}`}>焙煎時間</span>
            <span className={`text-sm md:text-base font-medium font-mono ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-900'}`}>
              {formatTime(record.duration)}
            </span>
          </div>
        </div>

        {/* 重さ */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 flex items-center justify-center flex-shrink-0">
            <span className={`text-base ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-400'}`}>⚖</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-500'}`}>重さ</span>
            <span className={`text-sm md:text-base font-medium font-mono ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-900'}`}>
              {record.weight}g
            </span>
          </div>
        </div>

        {/* 焙煎日 */}
        <div className="flex items-center gap-2">
          <HiCalendar className={`h-4 w-4 flex-shrink-0 ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-400'}`} />
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-500'}`}>焙煎日</span>
            <span className={`text-sm md:text-base font-medium font-mono ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-900'}`}>
              {formatDate(record.roastDate)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
