'use client';

import { HiFire } from 'react-icons/hi';
import { FaSnowflake, FaBroom } from 'react-icons/fa';
import { PiCoffeeBeanFill } from 'react-icons/pi';

interface ScheduleTypeSelectorProps {
  isRoasterOn: boolean;
  isRoast: boolean;
  isAfterPurge: boolean;
  isChaffCleaning: boolean;
  onTypeChange: (type: 'roasterOn' | 'roast' | 'afterPurge' | 'chaffCleaning') => void;
  isChristmasMode?: boolean;
}

export function ScheduleTypeSelector({
  isRoasterOn,
  isRoast,
  isAfterPurge,
  isChaffCleaning,
  onTypeChange,
  isChristmasMode = false,
}: ScheduleTypeSelectorProps) {
  // クリスマスモード用のスタイル
  const getTypeStyle = (isSelected: boolean, selectedColor: string, selectedBg: string) => {
    if (isChristmasMode) {
      return isSelected
        ? `border-[#d4af37] bg-[#d4af37]/20`
        : `border-[#d4af37]/30 bg-white/5 hover:border-[#d4af37]/50`;
    }
    return isSelected
      ? `border-${selectedColor}-500 bg-${selectedColor}-50`
      : 'border-gray-200 bg-white hover:border-gray-300';
  };

  return (
    <div>
      <label className={`mb-3 md:mb-4 block text-base md:text-lg font-medium text-center ${
        isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'
      }`}>
        スケジュールタイプ <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <label
          className={`flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-5 rounded-lg border-2 cursor-pointer transition-all ${
            isChristmasMode
              ? isRoasterOn ? 'border-[#d4af37] bg-[#d4af37]/20' : 'border-[#d4af37]/30 bg-white/5 hover:border-[#d4af37]/50'
              : isRoasterOn ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <input
            type="checkbox"
            checked={isRoasterOn}
            onChange={() => onTypeChange('roasterOn')}
            className="sr-only"
          />
          <HiFire className={`text-3xl md:text-4xl ${
            isChristmasMode
              ? isRoasterOn ? 'text-[#d4af37]' : 'text-[#f8f1e7]/40'
              : isRoasterOn ? 'text-orange-500' : 'text-gray-400'
          }`} />
          <span className={`text-base md:text-lg font-medium ${
            isChristmasMode
              ? isRoasterOn ? 'text-[#d4af37]' : 'text-[#f8f1e7]/70'
              : isRoasterOn ? 'text-orange-700' : 'text-gray-700'
          }`}>
            焙煎機予熱
          </span>
        </label>
        <label
          className={`flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-5 rounded-lg border-2 cursor-pointer transition-all ${
            isChristmasMode
              ? isRoast ? 'border-[#d4af37] bg-[#d4af37]/20' : 'border-[#d4af37]/30 bg-white/5 hover:border-[#d4af37]/50'
              : isRoast ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <input
            type="checkbox"
            checked={isRoast}
            onChange={() => onTypeChange('roast')}
            className="sr-only"
          />
          <PiCoffeeBeanFill className={`text-3xl md:text-4xl ${
            isChristmasMode
              ? isRoast ? 'text-[#d4af37]' : 'text-[#f8f1e7]/40'
              : isRoast ? 'text-amber-700' : 'text-gray-400'
          }`} />
          <span className={`text-base md:text-lg font-medium ${
            isChristmasMode
              ? isRoast ? 'text-[#d4af37]' : 'text-[#f8f1e7]/70'
              : isRoast ? 'text-amber-700' : 'text-gray-700'
          }`}>
            ロースト
          </span>
        </label>
        <label
          className={`flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-5 rounded-lg border-2 cursor-pointer transition-all ${
            isChristmasMode
              ? isAfterPurge ? 'border-[#d4af37] bg-[#d4af37]/20' : 'border-[#d4af37]/30 bg-white/5 hover:border-[#d4af37]/50'
              : isAfterPurge ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <input
            type="checkbox"
            checked={isAfterPurge}
            onChange={() => onTypeChange('afterPurge')}
            className="sr-only"
          />
          <FaSnowflake className={`text-3xl md:text-4xl ${
            isChristmasMode
              ? isAfterPurge ? 'text-[#d4af37]' : 'text-[#f8f1e7]/40'
              : isAfterPurge ? 'text-blue-500' : 'text-gray-400'
          }`} />
          <span className={`text-base md:text-lg font-medium ${
            isChristmasMode
              ? isAfterPurge ? 'text-[#d4af37]' : 'text-[#f8f1e7]/70'
              : isAfterPurge ? 'text-blue-700' : 'text-gray-700'
          }`}>
            アフターパージ
          </span>
        </label>
        <label
          className={`flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-5 rounded-lg border-2 cursor-pointer transition-all ${
            isChristmasMode
              ? isChaffCleaning ? 'border-[#d4af37] bg-[#d4af37]/20' : 'border-[#d4af37]/30 bg-white/5 hover:border-[#d4af37]/50'
              : isChaffCleaning ? 'border-gray-500 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <input
            type="checkbox"
            checked={isChaffCleaning}
            onChange={() => onTypeChange('chaffCleaning')}
            className="sr-only"
          />
          <FaBroom className={`text-3xl md:text-4xl ${
            isChristmasMode
              ? isChaffCleaning ? 'text-[#d4af37]' : 'text-[#f8f1e7]/40'
              : isChaffCleaning ? 'text-gray-700' : 'text-gray-400'
          }`} />
          <span className={`text-base md:text-lg font-medium ${
            isChristmasMode
              ? isChaffCleaning ? 'text-[#d4af37]' : 'text-[#f8f1e7]/70'
              : isChaffCleaning ? 'text-gray-700' : 'text-gray-700'
          }`}>
            チャフのお掃除
          </span>
        </label>
      </div>
    </div>
  );
}
