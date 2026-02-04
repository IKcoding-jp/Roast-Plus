'use client';

import { NumberInput, Select } from '@/components/ui';

interface RoastFieldsProps {
  roastCount: string;
  bagCount: 1 | 2 | '';
  onRoastCountChange: (value: string) => void;
  onBagCountChange: (value: 1 | 2 | '') => void;
  isChristmasMode?: boolean;
}

const BAG_COUNT_OPTIONS = [
  { value: '1', label: '1袋' },
  { value: '2', label: '2袋' },
];

export function RoastFields({
  roastCount,
  bagCount,
  onRoastCountChange,
  onBagCountChange,
  isChristmasMode = false,
}: RoastFieldsProps) {
  return (
    <div className={`space-y-3 md:space-y-4 border-t pt-3 md:pt-4 ${
      isChristmasMode ? 'border-[#d4af37]/20' : 'border-gray-200'
    }`}>
      <NumberInput
        label="何回目 *"
        value={roastCount}
        onChange={(e) => onRoastCountChange(e.target.value)}
        min={1}
        placeholder="回数を入力"
        isChristmasMode={isChristmasMode}
      />

      <Select
        label="袋数"
        value={bagCount.toString()}
        onChange={(e) => onBagCountChange(e.target.value ? (parseInt(e.target.value, 10) as 1 | 2) : '')}
        options={BAG_COUNT_OPTIONS}
        placeholder="選択してください"
        isChristmasMode={isChristmasMode}
      />
    </div>
  );
}
