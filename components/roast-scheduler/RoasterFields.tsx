'use client';

import { useMemo } from 'react';
import { ALL_BEANS, type BeanName } from '@/lib/beanConfig';
import { Select, NumberInput } from '@/components/ui';

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

const WEIGHT_OPTIONS = [
  { value: '200', label: '200g' },
  { value: '300', label: '300g' },
  { value: '500', label: '500g' },
];

const ROAST_LEVEL_OPTIONS = [
  { value: '浅煎り', label: '浅煎り' },
  { value: '中煎り', label: '中煎り' },
  { value: '中深煎り', label: '中深煎り' },
  { value: '深煎り', label: '深煎り' },
];

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
  // 豆の選択肢を生成
  const beanOptions = useMemo(
    () => ALL_BEANS.map((bean) => ({ value: bean, label: bean })),
    []
  );

  // 2種類目の豆の選択肢（1種類目で選択した豆を除外）
  const bean2Options = useMemo(
    () => ALL_BEANS.filter((bean) => bean !== beanName).map((bean) => ({ value: bean, label: bean })),
    [beanName]
  );

  const handleBeanNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as BeanName | '';
    onBeanNameChange(value);
    // 1種類目が変更されたとき、2種類目が同じ豆の場合はクリア
    if (beanName2 === value && value !== '') {
      onBeanName2Change('');
      onBlendRatio1Change('');
      onBlendRatio2Change('');
    }
  };

  const handleBeanName2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as BeanName | '';
    onBeanName2Change(value);
    // 2種類目を「なし」にした場合は割合もクリア
    if (!value) {
      onBlendRatio1Change('');
      onBlendRatio2Change('');
    }
  };

  const handleBlendRatio1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 10)) {
      onBlendRatio1Change(value);
    }
  };

  const handleBlendRatio2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 10)) {
      onBlendRatio2Change(value);
    }
  };

  return (
    <div className={`space-y-3 md:space-y-4 border-t pt-3 md:pt-4 ${
      isChristmasMode ? 'border-[#d4af37]/20' : 'border-gray-200'
    }`}>
      <Select
        label="豆の名前"
        value={beanName}
        onChange={handleBeanNameChange}
        options={beanOptions}
        placeholder="選択してください"
        isChristmasMode={isChristmasMode}
      />

      <Select
        label="2種類目の豆の名前"
        value={beanName2}
        onChange={handleBeanName2Change}
        options={bean2Options}
        placeholder="なし"
        isChristmasMode={isChristmasMode}
      />

      {beanName2 && (
        <div>
          <div className={`mb-1 md:mb-2 block text-base md:text-lg font-medium ${
            isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'
          }`}>
            ブレンド割合 <span className="text-red-500">*</span>
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <NumberInput
              label={`${beanName}の割合`}
              value={blendRatio1}
              onChange={handleBlendRatio1Change}
              min={0}
              max={10}
              placeholder="5"
              isChristmasMode={isChristmasMode}
            />
            <NumberInput
              label={`${beanName2}の割合`}
              value={blendRatio2}
              onChange={handleBlendRatio2Change}
              min={0}
              max={10}
              placeholder="5"
              isChristmasMode={isChristmasMode}
            />
          </div>
          <p className={`mt-1 md:mt-2 text-sm md:text-base ${
            isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'
          }`}>
            合計が10になるように入力してください（例：5と5、8と2）
          </p>
        </div>
      )}

      <Select
        label="重さ"
        value={weight.toString()}
        onChange={(e) => onWeightChange(e.target.value ? (parseInt(e.target.value, 10) as 200 | 300 | 500) : '')}
        options={WEIGHT_OPTIONS}
        placeholder="選択してください"
        isChristmasMode={isChristmasMode}
      />

      <Select
        label="焙煎度合い"
        value={roastLevel}
        onChange={(e) => onRoastLevelChange(e.target.value as '浅煎り' | '中煎り' | '中深煎り' | '深煎り' | '')}
        options={ROAST_LEVEL_OPTIONS}
        placeholder="選択してください"
        isChristmasMode={isChristmasMode}
      />
    </div>
  );
}
