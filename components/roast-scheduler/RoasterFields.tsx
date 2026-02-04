'use client';

import { ALL_BEANS, type BeanName } from '@/lib/beanConfig';

interface RoasterFieldsProps {
  beanName: BeanName | '';
  beanName2: BeanName | '';
  blendRatio1: string;
  blendRatio2: string;
  weight: 200 | 300 | 500 | '';
  roastLevel: '浅煎り' | '中煎り' | '中深煎り' | '深煎り' | '';
  onBeanNameChange: (value: BeanName | '') => void;
  onBeanName2Change: (value: BeanName | '') => void;
  onBlendRatio1Change: (value: string) => void;
  onBlendRatio2Change: (value: string) => void;
  onWeightChange: (value: 200 | 300 | 500 | '') => void;
  onRoastLevelChange: (value: '浅煎り' | '中煎り' | '中深煎り' | '深煎り' | '') => void;
  isChristmasMode?: boolean;
}

export function RoasterFields({
  beanName,
  beanName2,
  blendRatio1,
  blendRatio2,
  weight,
  roastLevel,
  onBeanNameChange,
  onBeanName2Change,
  onBlendRatio1Change,
  onBlendRatio2Change,
  onWeightChange,
  onRoastLevelChange,
  isChristmasMode = false,
}: RoasterFieldsProps) {
  const labelClass = `mb-1 md:mb-2 block text-base md:text-lg font-medium ${
    isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'
  }`;
  const subLabelClass = `mb-1 md:mb-2 block text-sm md:text-base font-medium ${
    isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'
  }`;
  const selectClass = `w-full rounded-md border px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg focus:outline-none focus:ring-2 ${
    isChristmasMode
      ? 'border-[#d4af37]/40 bg-[#0a2f1a] text-[#f8f1e7] focus:border-[#d4af37] focus:ring-[#d4af37]/50'
      : 'border-gray-300 bg-white text-gray-900 focus:border-amber-500 focus:ring-amber-500'
  }`;
  const inputClass = `w-full rounded-md border px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg text-center focus:outline-none focus:ring-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
    isChristmasMode
      ? 'border-[#d4af37]/40 bg-white/10 text-[#f8f1e7] placeholder:text-[#f8f1e7]/40 focus:border-[#d4af37] focus:ring-[#d4af37]/50'
      : 'border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500'
  }`;

  return (
    <div className={`space-y-3 md:space-y-4 border-t pt-3 md:pt-4 ${
      isChristmasMode ? 'border-[#d4af37]/20' : 'border-gray-200'
    }`}>
      <div>
        <label className={labelClass}>豆の名前</label>
        <select
          value={beanName}
          onChange={(e) => {
            const value = e.target.value as BeanName | '';
            onBeanNameChange(value);
            // 1種類目が変更されたとき、2種類目が同じ豆の場合はクリア
            if (beanName2 === value && value !== '') {
              onBeanName2Change('');
              onBlendRatio1Change('');
              onBlendRatio2Change('');
            }
          }}
          className={selectClass}
        >
          <option value="">選択してください</option>
          {ALL_BEANS.map((bean) => (
            <option key={bean} value={bean}>
              {bean}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>
          2種類目の豆の名前
        </label>
        <select
          value={beanName2}
          onChange={(e) => {
            const value = e.target.value as BeanName | '';
            onBeanName2Change(value);
            // 2種類目を「なし」にした場合は割合もクリア
            if (!value) {
              onBlendRatio1Change('');
              onBlendRatio2Change('');
            }
          }}
          className={selectClass}
        >
          <option value="">なし</option>
          {ALL_BEANS.filter((bean) => bean !== beanName).map((bean) => (
            <option key={bean} value={bean}>
              {bean}
            </option>
          ))}
        </select>
      </div>

      {beanName2 && (
        <div>
          <label className={labelClass}>
            ブレンド割合 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div>
              <label className={subLabelClass}>
                {beanName}の割合
              </label>
              <input
                type="number"
                value={blendRatio1}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 10)) {
                    onBlendRatio1Change(value);
                  }
                }}
                min="0"
                max="10"
                required={!!beanName2}
                className={inputClass}
                placeholder="5"
              />
            </div>
            <div>
              <label className={subLabelClass}>
                {beanName2}の割合
              </label>
              <input
                type="number"
                value={blendRatio2}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 10)) {
                    onBlendRatio2Change(value);
                  }
                }}
                min="0"
                max="10"
                required={!!beanName2}
                className={inputClass}
                placeholder="5"
              />
            </div>
          </div>
          <p className={`mt-1 md:mt-2 text-sm md:text-base ${
            isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'
          }`}>
            合計が10になるように入力してください（例：5と5、8と2）
          </p>
        </div>
      )}

      <div>
        <label className={labelClass}>重さ</label>
        <select
          value={weight}
          onChange={(e) => onWeightChange(e.target.value ? (parseInt(e.target.value, 10) as 200 | 300 | 500) : '')}
          className={selectClass}
        >
          <option value="">選択してください</option>
          <option value="200">200g</option>
          <option value="300">300g</option>
          <option value="500">500g</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>焙煎度合い</label>
        <select
          value={roastLevel}
          onChange={(e) =>
            onRoastLevelChange(e.target.value as '浅煎り' | '中煎り' | '中深煎り' | '深煎り' | '')
          }
          className={selectClass}
        >
          <option value="">選択してください</option>
          <option value="浅煎り">浅煎り</option>
          <option value="中煎り">中煎り</option>
          <option value="中深煎り">中深煎り</option>
          <option value="深煎り">深煎り</option>
        </select>
      </div>
    </div>
  );
}
