'use client';

import { NumberInput, Select } from '@/components/ui';

interface RoastFieldsProps {
  roastCount: string;
  bagCount: 1 | 2 | '';
  onRoastCountChange: (value: string) => void;
  onBagCountChange: (value: 1 | 2 | '') => void;
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
}: RoastFieldsProps) {
  return (
    <div className="space-y-3 md:space-y-4 border-t pt-3 md:pt-4 border-edge">
      <NumberInput
        label="何回目 *"
        value={roastCount}
        onChange={(e) => onRoastCountChange(e.target.value)}
        min={1}
        placeholder="回数を入力"
      />

      <Select
        label="袋数"
        value={bagCount.toString()}
        onChange={(e) => onBagCountChange(e.target.value ? (parseInt(e.target.value, 10) as 1 | 2) : '')}
        options={BAG_COUNT_OPTIONS}
        placeholder="選択してください"
      />
    </div>
  );
}
