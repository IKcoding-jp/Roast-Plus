'use client';

interface RoastFieldsProps {
  roastCount: string;
  bagCount: 1 | 2 | '';
  onRoastCountChange: (value: string) => void;
  onBagCountChange: (value: 1 | 2 | '') => void;
  isChristmasMode?: boolean;
}

export function RoastFields({
  roastCount,
  bagCount,
  onRoastCountChange,
  onBagCountChange,
  isChristmasMode = false,
}: RoastFieldsProps) {
  const labelClass = `mb-1 md:mb-2 block text-base md:text-lg font-medium ${
    isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'
  }`;
  const inputClass = `w-full rounded-md border px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg focus:outline-none focus:ring-2 ${
    isChristmasMode
      ? 'border-[#d4af37]/40 bg-white/10 text-[#f8f1e7] placeholder:text-[#f8f1e7]/40 focus:border-[#d4af37] focus:ring-[#d4af37]/50'
      : 'border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500'
  }`;
  const selectClass = `w-full rounded-md border px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg focus:outline-none focus:ring-2 ${
    isChristmasMode
      ? 'border-[#d4af37]/40 bg-[#0a2f1a] text-[#f8f1e7] focus:border-[#d4af37] focus:ring-[#d4af37]/50'
      : 'border-gray-300 bg-white text-gray-900 focus:border-amber-500 focus:ring-amber-500'
  }`;

  return (
    <div className={`space-y-3 md:space-y-4 border-t pt-3 md:pt-4 ${
      isChristmasMode ? 'border-[#d4af37]/20' : 'border-gray-200'
    }`}>
      <div>
        <label className={labelClass}>
          何回目 <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={roastCount}
          onChange={(e) => onRoastCountChange(e.target.value)}
          required
          min="1"
          className={inputClass}
          placeholder="回数を入力"
        />
      </div>

      <div>
        <label className={labelClass}>袋数</label>
        <select
          value={bagCount}
          onChange={(e) => onBagCountChange(e.target.value ? (parseInt(e.target.value, 10) as 1 | 2) : '')}
          className={selectClass}
        >
          <option value="">選択してください</option>
          <option value="1">1袋</option>
          <option value="2">2袋</option>
        </select>
      </div>
    </div>
  );
}
