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
}: RoasterFieldsProps) {
  return (
    <div className="space-y-3 md:space-y-4 border-t border-gray-200 pt-3 md:pt-4">
      <div>
        <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-gray-700">豆の名前</label>
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
          className="w-full rounded-md border border-gray-300 px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg text-gray-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
        <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-gray-700">
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
          className="w-full rounded-md border border-gray-300 px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg text-gray-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
          <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-gray-700">
            ブレンド割合 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <div>
              <label className="mb-1 md:mb-2 block text-sm md:text-base font-medium text-gray-600">
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
                className="w-full rounded-md border border-gray-300 px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="5"
              />
            </div>
            <div>
              <label className="mb-1 md:mb-2 block text-sm md:text-base font-medium text-gray-600">
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
                className="w-full rounded-md border border-gray-300 px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="5"
              />
            </div>
          </div>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-500">
            合計が10になるように入力してください（例：5と5、8と2）
          </p>
        </div>
      )}

      <div>
        <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-gray-700">重さ</label>
        <select
          value={weight}
          onChange={(e) => onWeightChange(e.target.value ? (parseInt(e.target.value, 10) as 200 | 300 | 500) : '')}
          className="w-full rounded-md border border-gray-300 px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg text-gray-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">選択してください</option>
          <option value="200">200g</option>
          <option value="300">300g</option>
          <option value="500">500g</option>
        </select>
      </div>

      <div>
        <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-gray-700">焙煎度合い</label>
        <select
          value={roastLevel}
          onChange={(e) =>
            onRoastLevelChange(e.target.value as '浅煎り' | '中煎り' | '中深煎り' | '深煎り' | '')
          }
          className="w-full rounded-md border border-gray-300 px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg text-gray-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
