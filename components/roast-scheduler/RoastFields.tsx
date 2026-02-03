'use client';

interface RoastFieldsProps {
  roastCount: string;
  bagCount: 1 | 2 | '';
  onRoastCountChange: (value: string) => void;
  onBagCountChange: (value: 1 | 2 | '') => void;
}

export function RoastFields({ roastCount, bagCount, onRoastCountChange, onBagCountChange }: RoastFieldsProps) {
  return (
    <div className="space-y-3 md:space-y-4 border-t border-gray-200 pt-3 md:pt-4">
      <div>
        <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-gray-700">
          何回目 <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={roastCount}
          onChange={(e) => onRoastCountChange(e.target.value)}
          required
          min="1"
          className="w-full rounded-md border border-gray-300 px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="回数を入力"
        />
      </div>

      <div>
        <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-gray-700">袋数</label>
        <select
          value={bagCount}
          onChange={(e) => onBagCountChange(e.target.value ? (parseInt(e.target.value, 10) as 1 | 2) : '')}
          className="w-full rounded-md border border-gray-300 px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg text-gray-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">選択してください</option>
          <option value="1">1袋</option>
          <option value="2">2袋</option>
        </select>
      </div>
    </div>
  );
}
