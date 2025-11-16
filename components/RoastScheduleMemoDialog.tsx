'use client';

import { useState, useEffect } from 'react';
import type { RoastSchedule } from '@/types';
import { ALL_BEANS, getRoastMachineMode, getRoastMachineModeForBlend, type BeanName } from '@/lib/beanConfig';
import { HiX, HiFire } from 'react-icons/hi';
import { FaSnowflake, FaBroom } from 'react-icons/fa';
import { PiCoffeeBeanFill } from 'react-icons/pi';

interface RoastScheduleMemoDialogProps {
  schedule: RoastSchedule | null;
  selectedDate: string; // YYYY-MM-DD形式
  onSave: (schedule: RoastSchedule) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
}

export function RoastScheduleMemoDialog({
  schedule,
  selectedDate,
  onSave,
  onDelete,
  onCancel,
}: RoastScheduleMemoDialogProps) {
  // 時間を時・分に分割
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: '', minute: '' };
    const [hour, minute] = timeStr.split(':');
    return { hour: hour || '', minute: minute || '' };
  };

  const initialTime = parseTime(schedule?.time || '');
  const [hour, setHour] = useState(initialTime.hour);
  const [minute, setMinute] = useState(initialTime.minute);
  const [isRoasterOn, setIsRoasterOn] = useState(schedule?.isRoasterOn || false);
  const [isRoast, setIsRoast] = useState(schedule?.isRoast || false);
  const [isAfterPurge, setIsAfterPurge] = useState(schedule?.isAfterPurge || false);
  const [isChaffCleaning, setIsChaffCleaning] = useState(schedule?.isChaffCleaning || false);
  // ブレンド割合をパースする関数
  const parseBlendRatio = (ratio: string | undefined): { ratio1: string; ratio2: string } => {
    if (!ratio) return { ratio1: '', ratio2: '' };
    const [ratio1, ratio2] = ratio.split(':');
    return { ratio1: ratio1 || '', ratio2: ratio2 || '' };
  };

  const initialBlendRatio = parseBlendRatio(schedule?.blendRatio);
  const [beanName, setBeanName] = useState<BeanName | ''>((schedule?.beanName as BeanName | undefined) || '');
  const [beanName2, setBeanName2] = useState<BeanName | ''>((schedule?.beanName2 as BeanName | undefined) || '');
  const [blendRatio1, setBlendRatio1] = useState<string>(initialBlendRatio.ratio1);
  const [blendRatio2, setBlendRatio2] = useState<string>(initialBlendRatio.ratio2);
  const [weight, setWeight] = useState<200 | 300 | 500 | ''>(schedule?.weight || '');
  const [roastLevel, setRoastLevel] = useState<
    '浅煎り' | '中煎り' | '中深煎り' | '深煎り' | ''
  >(schedule?.roastLevel || '');
  const [roastCount, setRoastCount] = useState(schedule?.roastCount?.toString() || '');
  const [bagCount, setBagCount] = useState<1 | 2 | ''>(schedule?.bagCount || '');

  // scheduleが変更されたときにstateを更新
  useEffect(() => {
    const parsedTime = parseTime(schedule?.time || '');
    setHour(parsedTime.hour);
    setMinute(parsedTime.minute);
    setIsRoasterOn(schedule?.isRoasterOn || false);
    setIsRoast(schedule?.isRoast || false);
    setIsAfterPurge(schedule?.isAfterPurge || false);
    setIsChaffCleaning(schedule?.isChaffCleaning || false);
    setBeanName((schedule?.beanName as BeanName | undefined) || '');
    setBeanName2((schedule?.beanName2 as BeanName | undefined) || '');
    const parsedBlendRatio = parseBlendRatio(schedule?.blendRatio);
    setBlendRatio1(parsedBlendRatio.ratio1);
    setBlendRatio2(parsedBlendRatio.ratio2);
    setWeight(schedule?.weight || '');
    setRoastLevel(schedule?.roastLevel || '');
    setRoastCount(schedule?.roastCount?.toString() || '');
    setBagCount(schedule?.bagCount || '');
  }, [schedule]);

  // ブレンド割合を結合する関数
  const combineBlendRatio = (ratio1: string, ratio2: string): string | undefined => {
    if (!ratio1 || !ratio2) return undefined;
    return `${ratio1}:${ratio2}`;
  };

  // 豆の名前が変更されたら、Gモードを自動設定
  useEffect(() => {
    if (beanName && isRoasterOn) {
      // モードは自動設定されるが、UIには表示しない（内部で使用）
      // ブレンド対応のため、getRoastMachineModeForBlendを使用
    }
  }, [beanName, beanName2, blendRatio1, blendRatio2, isRoasterOn]);

  // メモタイプの排他的選択
  const handleMemoTypeChange = (type: 'roasterOn' | 'roast' | 'afterPurge' | 'chaffCleaning') => {
    setIsRoasterOn(type === 'roasterOn');
    setIsRoast(type === 'roast');
    setIsAfterPurge(type === 'afterPurge');
    setIsChaffCleaning(type === 'chaffCleaning');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!isRoasterOn && !isRoast && !isAfterPurge && !isChaffCleaning) {
      alert('スケジュールタイプを選択してください');
      return;
    }

    if (isRoasterOn) {
      // 2種類目の豆が選択されている場合は割合入力必須
      if (beanName2) {
        if (!blendRatio1 || !blendRatio2) {
          alert('ブレンド割合を入力してください');
          return;
        }
        // 合計が10になることを検証
        const ratio1 = parseInt(blendRatio1, 10);
        const ratio2 = parseInt(blendRatio2, 10);
        if (isNaN(ratio1) || isNaN(ratio2) || ratio1 + ratio2 !== 10) {
          alert('ブレンド割合の合計は10になる必要があります（例：5と5、8と2）');
          return;
        }
      }
    }

    if (isRoast) {
      if (!roastCount) {
        alert('何回目を入力してください');
        return;
      }
    }

    if (!isAfterPurge && (!hour || !minute)) {
      alert('時間を入力してください');
      return;
    }

    const blendRatio = combineBlendRatio(blendRatio1, blendRatio2);
    const roastMachineMode = getRoastMachineModeForBlend(
      beanName as BeanName | undefined,
      beanName2 as BeanName | undefined,
      blendRatio
    );

    // 時・分をHH:mm形式に変換
    const formattedTime = hour && minute ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}` : '';

    const newSchedule: RoastSchedule = {
      id: schedule?.id || `roast-${Date.now()}`,
      date: schedule?.date || selectedDate, // 既存の場合はschedule.date、新規の場合はselectedDate
      time: isAfterPurge ? '' : formattedTime, // アフターパージの場合は時間なし
      isRoasterOn: isRoasterOn || undefined,
      isRoast: isRoast || undefined,
      isAfterPurge: isAfterPurge || undefined,
      isChaffCleaning: isChaffCleaning || undefined,
      beanName: isRoasterOn ? (beanName as BeanName) : undefined,
      beanName2: isRoasterOn && beanName2 ? (beanName2 as BeanName) : undefined,
      blendRatio: isRoasterOn && beanName2 && blendRatio ? blendRatio : undefined,
      roastMachineMode,
      weight: isRoasterOn ? (weight as 200 | 300 | 500) : undefined,
      roastLevel: isRoasterOn ? (roastLevel as '浅煎り' | '中煎り' | '中深煎り' | '深煎り') : undefined,
      roastCount: isRoast ? parseInt(roastCount, 10) : undefined,
      bagCount: isRoast && bagCount ? (bagCount as 1 | 2) : undefined,
      order: schedule?.order,
    };

    onSave(newSchedule);
  };

  const handleDelete = () => {
    if (schedule && onDelete) {
      onDelete(schedule.id);
      onCancel();
    }
  };

  // プレビューテキストの生成
  const getPreviewText = () => {
    if (isRoasterOn) {
      const mode = getRoastMachineModeForBlend(
        beanName as BeanName | undefined,
        beanName2 as BeanName | undefined,
        combineBlendRatio(blendRatio1, blendRatio2)
      );
      
      let beanText = '';
      const blendRatio = combineBlendRatio(blendRatio1, blendRatio2);
      if (beanName2 && blendRatio) {
        // ブレンドの場合
        const [ratio1, ratio2] = blendRatio.split(':');
        beanText = `${beanName}${ratio1}:${beanName2}${ratio2}`;
      } else if (beanName) {
        // 単体の場合
        beanText = beanName;
      }
      
      const weightText = weight ? `${weight}g` : '';
      const levelText = roastLevel || '';
      const modeText = mode ? `(${mode})` : '';
      
      // スマホでのレイアウト: 3行に分ける
      const parts = [];
      parts.push('焙煎機予熱');
      if (beanText) {
        parts.push(beanText);
      }
      const detailParts = [modeText, weightText, levelText].filter(Boolean);
      if (detailParts.length > 0) {
        parts.push(detailParts.join(' '));
      }
      
      return parts.join('\n');
    }
    if (isRoast) {
      const countText = roastCount ? `${roastCount}回目` : '?回目';
      const bagText = bagCount ? `${bagCount}袋` : '';
      if (bagText) {
        return `ロースト${countText}・${bagText}`;
      } else {
        return `ロースト${countText}`;
      }
    }
    if (isAfterPurge) {
      return 'アフターパージ';
    }
    if (isChaffCleaning) {
      return 'チャフのお掃除';
    }
    return '';
  };

  // プレビューの色
  const getPreviewColor = () => {
    if (isRoasterOn) return 'bg-orange-100 border-orange-300 text-orange-800';
    if (isRoast) return 'bg-amber-100 border-amber-300 text-amber-800';
    if (isAfterPurge) return 'bg-blue-100 border-blue-300 text-blue-800';
    if (isChaffCleaning) return 'bg-gray-100 border-gray-300 text-gray-800';
    return 'bg-gray-100 border-gray-300 text-gray-800';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-[100] p-4"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-gray-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 md:px-8 py-4 md:py-5 flex items-center justify-between">
          <h3 className="text-2xl md:text-2xl font-semibold text-gray-800">
            {schedule ? 'スケジュールを編集' : 'スケジュールを追加'}
          </h3>
          <button
            onClick={onCancel}
            className="rounded-md bg-gray-200 p-2 md:p-2.5 text-gray-700 transition-colors hover:bg-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 md:h-7 md:w-7" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="space-y-4 md:space-y-6 max-w-md mx-auto">
            {/* 時間選択 */}
            {!isAfterPurge && (
              <div>
                <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-gray-700 text-center">
                  時間 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-center gap-2 md:gap-3">
                  <input
                    type="number"
                    value={hour}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                        setHour(value);
                      }
                    }}
                    min="0"
                    max="23"
                    required={!isAfterPurge}
                    className="w-20 md:w-24 rounded-md border border-gray-300 px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="時"
                  />
                  <span className="text-gray-600 text-lg md:text-xl">:</span>
                  <input
                    type="number"
                    value={minute}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                        setMinute(value);
                      }
                    }}
                    min="0"
                    max="59"
                    required={!isAfterPurge}
                    className="w-20 md:w-24 rounded-md border border-gray-300 px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="分"
                  />
                </div>
              </div>
            )}

            {/* スケジュールタイプ選択（排他的） */}
            <div>
              <label className="mb-3 md:mb-4 block text-base md:text-lg font-medium text-gray-700 text-center">
                スケジュールタイプ <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <label className={`flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-5 rounded-lg border-2 cursor-pointer transition-all ${
                  isRoasterOn 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={isRoasterOn}
                    onChange={(e) => handleMemoTypeChange('roasterOn')}
                    className="sr-only"
                  />
                  <HiFire className={`text-3xl md:text-4xl ${isRoasterOn ? 'text-orange-500' : 'text-gray-400'}`} />
                  <span className={`text-base md:text-lg font-medium ${isRoasterOn ? 'text-orange-700' : 'text-gray-700'}`}>
                    焙煎機予熱
                  </span>
                </label>
                <label className={`flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-5 rounded-lg border-2 cursor-pointer transition-all ${
                  isRoast 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={isRoast}
                    onChange={(e) => handleMemoTypeChange('roast')}
                    className="sr-only"
                  />
                  <PiCoffeeBeanFill className={`text-3xl md:text-4xl ${isRoast ? 'text-amber-700' : 'text-gray-400'}`} />
                  <span className={`text-base md:text-lg font-medium ${isRoast ? 'text-amber-700' : 'text-gray-700'}`}>
                    ロースト
                  </span>
                </label>
                <label className={`flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-5 rounded-lg border-2 cursor-pointer transition-all ${
                  isAfterPurge 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={isAfterPurge}
                    onChange={(e) => handleMemoTypeChange('afterPurge')}
                    className="sr-only"
                  />
                  <FaSnowflake className={`text-3xl md:text-4xl ${isAfterPurge ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={`text-base md:text-lg font-medium ${isAfterPurge ? 'text-blue-700' : 'text-gray-700'}`}>
                    アフターパージ
                  </span>
                </label>
                <label className={`flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-5 rounded-lg border-2 cursor-pointer transition-all ${
                  isChaffCleaning 
                    ? 'border-gray-500 bg-gray-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={isChaffCleaning}
                    onChange={(e) => handleMemoTypeChange('chaffCleaning')}
                    className="sr-only"
                  />
                  <FaBroom className={`text-3xl md:text-4xl ${isChaffCleaning ? 'text-gray-700' : 'text-gray-400'}`} />
                  <span className={`text-base md:text-lg font-medium ${isChaffCleaning ? 'text-gray-700' : 'text-gray-700'}`}>
                    チャフのお掃除
                  </span>
                </label>
              </div>
            </div>

            {/* 焙煎機予熱用フィールド */}
            {isRoasterOn && (
              <div className="space-y-3 md:space-y-4 border-t border-gray-200 pt-3 md:pt-4">
                <div>
                  <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-gray-700">
                    豆の名前
                  </label>
                  <select
                    value={beanName}
                    onChange={(e) => {
                      const value = e.target.value as BeanName;
                      setBeanName(value);
                      // 1種類目が変更されたとき、2種類目が同じ豆の場合はクリア
                      if (beanName2 === value) {
                        setBeanName2('');
                        setBlendRatio1('');
                        setBlendRatio2('');
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
                      setBeanName2(value);
                      // 2種類目を「なし」にした場合は割合もクリア
                      if (!value) {
                        setBlendRatio1('');
                        setBlendRatio2('');
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
                              setBlendRatio1(value);
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
                              setBlendRatio2(value);
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
                  <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-gray-700">
                    重さ
                  </label>
                  <select
                    value={weight}
                    onChange={(e) => setWeight(e.target.value ? (parseInt(e.target.value, 10) as 200 | 300 | 500) : '')}
                    className="w-full rounded-md border border-gray-300 px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg text-gray-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">選択してください</option>
                    <option value="200">200g</option>
                    <option value="300">300g</option>
                    <option value="500">500g</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-gray-700">
                    焙煎度合い
                  </label>
                  <select
                    value={roastLevel}
                    onChange={(e) =>
                      setRoastLevel(
                        e.target.value as '浅煎り' | '中煎り' | '中深煎り' | '深煎り' | ''
                      )
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
            )}

            {/* ロースト用フィールド */}
            {isRoast && (
              <div className="space-y-3 md:space-y-4 border-t border-gray-200 pt-3 md:pt-4">
                <div>
                  <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-gray-700">
                    何回目 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={roastCount}
                    onChange={(e) => setRoastCount(e.target.value)}
                    required={isRoast}
                    min="1"
                    className="w-full rounded-md border border-gray-300 px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="回数を入力"
                  />
                </div>

                <div>
                  <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-gray-700">
                    袋数
                  </label>
                  <select
                    value={bagCount}
                    onChange={(e) => setBagCount(e.target.value ? (parseInt(e.target.value, 10) as 1 | 2) : '')}
                    className="w-full rounded-md border border-gray-300 px-3 md:px-4 py-2 md:py-2.5 text-base md:text-lg text-gray-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">選択してください</option>
                    <option value="1">1袋</option>
                    <option value="2">2袋</option>
                  </select>
                </div>
              </div>
            )}

            {/* プレビュー */}
            {(isRoasterOn || isRoast || isAfterPurge || isChaffCleaning) && (
              <div className={`rounded-md border-2 p-3 md:p-4 ${getPreviewColor()} flex justify-center`}>
                <div className="flex items-center gap-2 md:gap-3">
                  {isRoasterOn && <HiFire className="text-xl md:text-2xl text-orange-500" />}
                  {isRoast && <PiCoffeeBeanFill className="text-xl md:text-2xl text-amber-700" />}
                  {isAfterPurge && <FaSnowflake className="text-xl md:text-2xl text-blue-500" />}
                  {isChaffCleaning && <FaBroom className="text-xl md:text-2xl text-gray-700" />}
                  <div className="text-base md:text-lg font-medium whitespace-pre-line">
                    {getPreviewText()}
                  </div>
                </div>
              </div>
            )}

            {/* フッター */}
            <div className="flex gap-3 md:gap-4 pt-4 md:pt-5 border-t border-gray-200 justify-center">
              {schedule && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 md:px-6 py-2 md:py-2.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors min-h-[44px] text-base md:text-lg"
                >
                  削除
                </button>
              )}
              <button
                type="submit"
                className="px-6 md:px-8 py-2 md:py-2.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium min-h-[44px] text-base md:text-lg"
              >
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

