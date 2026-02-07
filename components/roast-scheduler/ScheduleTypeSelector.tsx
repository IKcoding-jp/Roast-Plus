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
}

export function ScheduleTypeSelector({
  isRoasterOn,
  isRoast,
  isAfterPurge,
  isChaffCleaning,
  onTypeChange,
}: ScheduleTypeSelectorProps) {
  return (
    <div>
      <label className="mb-3 md:mb-4 block text-base md:text-lg font-medium text-center text-ink-sub">
        スケジュールタイプ <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <label
          className={`flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-5 rounded-lg border-2 cursor-pointer transition-all ${
            isRoasterOn ? 'border-orange-500 bg-orange-50' : 'border-edge bg-surface hover:border-edge-strong'
          }`}
        >
          <input
            type="checkbox"
            checked={isRoasterOn}
            onChange={() => onTypeChange('roasterOn')}
            className="sr-only"
          />
          <HiFire className={`text-3xl md:text-4xl ${
            isRoasterOn ? 'text-orange-500' : 'text-ink-muted'
          }`} />
          <span className={`text-base md:text-lg font-medium ${
            isRoasterOn ? 'text-orange-700' : 'text-ink-sub'
          }`}>
            焙煎機予熱
          </span>
        </label>
        <label
          className={`flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-5 rounded-lg border-2 cursor-pointer transition-all ${
            isRoast ? 'border-amber-500 bg-amber-50' : 'border-edge bg-surface hover:border-edge-strong'
          }`}
        >
          <input
            type="checkbox"
            checked={isRoast}
            onChange={() => onTypeChange('roast')}
            className="sr-only"
          />
          <PiCoffeeBeanFill className={`text-3xl md:text-4xl ${
            isRoast ? 'text-amber-700' : 'text-ink-muted'
          }`} />
          <span className={`text-base md:text-lg font-medium ${
            isRoast ? 'text-amber-700' : 'text-ink-sub'
          }`}>
            ロースト
          </span>
        </label>
        <label
          className={`flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-5 rounded-lg border-2 cursor-pointer transition-all ${
            isAfterPurge ? 'border-blue-500 bg-blue-50' : 'border-edge bg-surface hover:border-edge-strong'
          }`}
        >
          <input
            type="checkbox"
            checked={isAfterPurge}
            onChange={() => onTypeChange('afterPurge')}
            className="sr-only"
          />
          <FaSnowflake className={`text-3xl md:text-4xl ${
            isAfterPurge ? 'text-blue-500' : 'text-ink-muted'
          }`} />
          <span className={`text-base md:text-lg font-medium ${
            isAfterPurge ? 'text-blue-700' : 'text-ink-sub'
          }`}>
            アフターパージ
          </span>
        </label>
        <label
          className={`flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-5 rounded-lg border-2 cursor-pointer transition-all ${
            isChaffCleaning ? 'border-gray-500 bg-gray-50' : 'border-edge bg-surface hover:border-edge-strong'
          }`}
        >
          <input
            type="checkbox"
            checked={isChaffCleaning}
            onChange={() => onTypeChange('chaffCleaning')}
            className="sr-only"
          />
          <FaBroom className={`text-3xl md:text-4xl ${
            isChaffCleaning ? 'text-gray-700' : 'text-ink-muted'
          }`} />
          <span className={`text-base md:text-lg font-medium ${
            isChaffCleaning ? 'text-gray-700' : 'text-ink-sub'
          }`}>
            チャフのお掃除
          </span>
        </label>
      </div>
    </div>
  );
}
