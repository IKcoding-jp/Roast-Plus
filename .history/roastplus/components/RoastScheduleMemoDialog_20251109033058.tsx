'use client';

import { useState, useEffect } from 'react';
import type { RoastSchedule } from '@/types';
import { ALL_BEANS, getRoastMachineMode, getRoastMachineModeForBlend, type BeanName } from '@/lib/beanConfig';
import { HiX, HiFire } from 'react-icons/hi';
import { FaSnowflake, FaBroom } from 'react-icons/fa';
import { PiCoffeeBeanFill } from 'react-icons/pi';

interface RoastScheduleMemoDialogProps {
  schedule: RoastSchedule | null;
  onSave: (schedule: RoastSchedule) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
}

export function RoastScheduleMemoDialog({
  schedule,
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
  const [beanName, setBeanName] = useState<BeanName | ''>((schedule?.beanName as BeanName | undefined) || '');
  const [beanName2, setBeanName2] = useState<BeanName | ''>((schedule?.beanName2 as BeanName | undefined) || '');
  const [blendRatio, setBlendRatio] = useState<string>(schedule?.blendRatio || '');
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
    setWeight(schedule?.weight || '');
    setRoastLevel(schedule?.roastLevel || '');
    setRoastCount(schedule?.roastCount?.toString() || '');
    setBagCount(schedule?.bagCount || '');
  }, [schedule]);

  // 豆の名前が変更されたら、Gモードを自動設定
  useEffect(() => {
    if (beanName && isRoasterOn) {
      const mode = getRoastMachineMode(beanName);
      // モードは自動設定されるが、UIには表示しない（内部で使用）
    }
  }, [beanName, isRoasterOn]);

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
      if (!beanName || !weight || !roastLevel) {
        alert('豆の名前、重さ、焙煎度合いを入力してください');
        return;
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

    const roastMachineMode = beanName ? getRoastMachineMode(beanName) : undefined;

    // 時・分をHH:mm形式に変換
    const formattedTime = hour && minute ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}` : '';

    const newSchedule: RoastSchedule = {
      id: schedule?.id || `roast-${Date.now()}`,
      time: isAfterPurge ? '' : formattedTime, // アフターパージの場合は時間なし
      isRoasterOn: isRoasterOn || undefined,
      isRoast: isRoast || undefined,
      isAfterPurge: isAfterPurge || undefined,
      isChaffCleaning: isChaffCleaning || undefined,
      beanName: isRoasterOn ? (beanName as BeanName) : undefined,
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
      const mode = beanName ? getRoastMachineMode(beanName) : '';
      const beanText = beanName ? `${beanName} (${mode})` : '';
      const weightText = weight ? `${weight}g` : '';
      const levelText = roastLevel || '';
      return `焙煎機予熱\n${beanText} ${weightText} ${levelText}`.trim();
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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">
            {schedule ? 'スケジュールを編集' : 'スケジュールを追加'}
          </h3>
          <button
            onClick={onCancel}
            className="rounded-md bg-gray-200 p-2 text-gray-700 transition-colors hover:bg-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4 max-w-md mx-auto">
            {/* 時間選択 */}
            {!isAfterPurge && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 text-center">
                  時間 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-center gap-2">
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
                    className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm sm:text-base text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="時"
                  />
                  <span className="text-gray-600 text-lg">:</span>
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
                    className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm sm:text-base text-gray-900 text-center focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="分"
                  />
                </div>
              </div>
            )}

            {/* スケジュールタイプ選択（排他的） */}
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700 text-center">
                スケジュールタイプ <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
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
                  <HiFire className={`text-2xl ${isRoasterOn ? 'text-orange-500' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${isRoasterOn ? 'text-orange-700' : 'text-gray-700'}`}>
                    焙煎機予熱
                  </span>
                </label>
                <label className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
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
                  <PiCoffeeBeanFill className={`text-2xl ${isRoast ? 'text-amber-700' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${isRoast ? 'text-amber-700' : 'text-gray-700'}`}>
                    ロースト
                  </span>
                </label>
                <label className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
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
                  <FaSnowflake className={`text-2xl ${isAfterPurge ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${isAfterPurge ? 'text-blue-700' : 'text-gray-700'}`}>
                    アフターパージ
                  </span>
                </label>
                <label className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
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
                  <FaBroom className={`text-2xl ${isChaffCleaning ? 'text-gray-700' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${isChaffCleaning ? 'text-gray-700' : 'text-gray-700'}`}>
                    チャフのお掃除
                  </span>
                </label>
              </div>
            </div>

            {/* 焙煎機予熱用フィールド */}
            {isRoasterOn && (
              <div className="space-y-3 border-t border-gray-200 pt-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    豆の名前 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={beanName}
                    onChange={(e) => setBeanName(e.target.value as BeanName)}
                    required={isRoasterOn}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:text-base text-gray-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    重さ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={weight}
                    onChange={(e) => setWeight(e.target.value ? (parseInt(e.target.value, 10) as 200 | 300 | 500) : '')}
                    required={isRoasterOn}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:text-base text-gray-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">選択してください</option>
                    <option value="200">200g</option>
                    <option value="300">300g</option>
                    <option value="500">500g</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    焙煎度合い <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={roastLevel}
                    onChange={(e) =>
                      setRoastLevel(
                        e.target.value as '浅煎り' | '中煎り' | '中深煎り' | '深煎り' | ''
                      )
                    }
                    required={isRoasterOn}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:text-base text-gray-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              <div className="space-y-3 border-t border-gray-200 pt-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    何回目 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={roastCount}
                    onChange={(e) => setRoastCount(e.target.value)}
                    required={isRoast}
                    min="1"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:text-base text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="回数を入力"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    袋数
                  </label>
                  <select
                    value={bagCount}
                    onChange={(e) => setBagCount(e.target.value ? (parseInt(e.target.value, 10) as 1 | 2) : '')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:text-base text-gray-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              <div className={`rounded-md border-2 p-3 ${getPreviewColor()} flex justify-center`}>
                <div className="flex items-center gap-2">
                  {isRoasterOn && <HiFire className="text-lg text-orange-500" />}
                  {isRoast && <PiCoffeeBeanFill className="text-lg text-amber-700" />}
                  {isAfterPurge && <FaSnowflake className="text-lg text-blue-500" />}
                  {isChaffCleaning && <FaBroom className="text-lg text-gray-700" />}
                  <div className="text-sm font-medium whitespace-pre-line">
                    {getPreviewText()}
                  </div>
                </div>
              </div>
            )}

            {/* フッター */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 justify-center">
              {schedule && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors min-h-[44px]"
                >
                  削除
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium min-h-[44px]"
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

