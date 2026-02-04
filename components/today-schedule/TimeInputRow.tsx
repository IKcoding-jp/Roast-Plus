'use client';

import { HiPlus } from 'react-icons/hi';
import { Button } from '@/components/ui';

export interface TimeInputRowProps {
  newHour: string;
  newMinute: string;
  addError: string;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
  onAdd: () => void;
  wrapperClassName: string;
  isChristmasMode?: boolean;
}

export function TimeInputRow({
  newHour,
  newMinute,
  addError,
  onHourChange,
  onMinuteChange,
  onAdd,
  wrapperClassName,
  isChristmasMode = false,
}: TimeInputRowProps) {
  const hourInputClass = `w-12 md:w-14 rounded-md border px-1.5 md:px-2 py-1 md:py-1.5 text-base md:text-base text-center focus:outline-none focus:ring-2 transition-all duration-300 ease-in-out [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
    addError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : isChristmasMode
        ? 'border-[#d4af37]/40 bg-white/10 text-[#f8f1e7] placeholder:text-[#f8f1e7]/40 focus:border-[#d4af37] focus:ring-[#d4af37]/50'
        : 'border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500'
  }`;
  const minuteInputClass = `w-12 md:w-14 rounded-md border px-1.5 md:px-2 py-1 md:py-1.5 text-base md:text-base text-center focus:outline-none focus:ring-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
    isChristmasMode
      ? 'border-[#d4af37]/40 bg-white/10 text-[#f8f1e7] placeholder:text-[#f8f1e7]/40 focus:border-[#d4af37] focus:ring-[#d4af37]/50'
      : 'border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500'
  }`;

  return (
    <div className={wrapperClassName}>
      <div className="flex items-center gap-1 md:gap-1.5">
        <input
          type="number"
          value={newHour}
          onChange={(e) => onHourChange(e.target.value)}
          min="0"
          max="23"
          className={hourInputClass}
          placeholder="時"
        />
        <span className={`text-base md:text-base ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>:</span>
        <input
          type="number"
          value={newMinute}
          onChange={(e) => onMinuteChange(e.target.value)}
          min="0"
          max="59"
          className={minuteInputClass}
          placeholder="分"
        />
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={onAdd}
        isChristmasMode={isChristmasMode}
        aria-label="時間ラベルを追加"
      >
        <HiPlus className="h-4 w-4" />
        <span>追加</span>
      </Button>
    </div>
  );
}
