'use client';

import { HiPlus } from 'react-icons/hi';

export interface TimeInputRowProps {
  newHour: string;
  newMinute: string;
  addError: string;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
  onAdd: () => void;
  wrapperClassName: string;
  buttonClassName: string;
  labelClassName?: string;
}

export function TimeInputRow({
  newHour,
  newMinute,
  addError,
  onHourChange,
  onMinuteChange,
  onAdd,
  wrapperClassName,
  buttonClassName,
  labelClassName,
}: TimeInputRowProps) {
  const hourInputClass = `w-12 md:w-14 rounded-md border px-1.5 md:px-2 py-1 md:py-1.5 text-base md:text-base text-gray-900 text-center focus:outline-none focus:ring-2 transition-all duration-300 ease-in-out [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
    addError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'
  }`;
  const minuteInputClass =
    'w-12 md:w-14 rounded-md border border-gray-300 px-1.5 md:px-2 py-1 md:py-1.5 text-base md:text-base text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

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
        <span className="text-gray-600 text-base md:text-base">:</span>
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
      <button
        onClick={onAdd}
        className={buttonClassName}
        aria-label="時間ラベルを追加"
      >
        <HiPlus className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span className={labelClassName}>追加</span>
      </button>
    </div>
  );
}
