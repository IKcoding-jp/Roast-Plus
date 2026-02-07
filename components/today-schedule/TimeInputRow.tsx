'use client';

import { HiPlus } from 'react-icons/hi';
import { Button, NumberInput } from '@/components/ui';

export interface TimeInputRowProps {
  newHour: string;
  newMinute: string;
  addError: string;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
  onAdd: () => void;
  wrapperClassName: string;
}

export function TimeInputRow({
  newHour,
  newMinute,
  addError,
  onHourChange,
  onMinuteChange,
  onAdd,
  wrapperClassName,
}: TimeInputRowProps) {
  return (
    <div className={wrapperClassName}>
      <div className="flex items-center gap-1 md:gap-1.5">
        <NumberInput
          value={newHour}
          onChange={(e) => onHourChange(e.target.value)}
          min={0}
          max={23}
          placeholder="時"
          error={addError ? ' ' : undefined}
          className="w-12 md:w-14 !px-1.5 !py-1 !text-base !min-h-0"
        />
        <span className="text-base text-ink-sub">:</span>
        <NumberInput
          value={newMinute}
          onChange={(e) => onMinuteChange(e.target.value)}
          min={0}
          max={59}
          placeholder="分"
          className="w-12 md:w-14 !px-1.5 !py-1 !text-base !min-h-0"
        />
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={onAdd}
        aria-label="時間ラベルを追加"
      >
        <HiPlus className="h-4 w-4" />
        <span>追加</span>
      </Button>
    </div>
  );
}
