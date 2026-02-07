'use client';

import { useState, useEffect } from 'react';
import type { RoastSchedule } from '@/types';
import { getRoastMachineModeForBlend, type BeanName } from '@/lib/beanConfig';
import { HiX } from 'react-icons/hi';
import { ScheduleTypeSelector } from './roast-scheduler/ScheduleTypeSelector';
import { RoasterFields } from './roast-scheduler/RoasterFields';
import { RoastFields } from './roast-scheduler/RoastFields';
import { SchedulePreview } from './roast-scheduler/SchedulePreview';
import { Button, IconButton, NumberInput } from '@/components/ui';

interface RoastScheduleMemoDialogProps {
  schedule: RoastSchedule | null;
  selectedDate: string; // YYYY-MM-DD形式
  onSave: (schedule: RoastSchedule) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
}

export function RoastScheduleMemoDialog(props: RoastScheduleMemoDialogProps) {
  const key = [
    props.schedule?.id ?? 'new',
    props.schedule?.time ?? '',
    props.schedule?.beanName ?? '',
    props.schedule?.beanName2 ?? '',
    props.schedule?.roastLevel ?? '',
    props.selectedDate,
  ].join('-');

  return <RoastScheduleMemoDialogInner key={key} {...props} />;
}

function RoastScheduleMemoDialogInner({
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

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-[100] p-4"
      onClick={onCancel}
    >
      <div
        className="rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 bg-overlay border-edge-strong"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="sticky top-0 border-b px-6 md:px-8 py-4 md:py-5 flex items-center justify-between bg-overlay border-edge">
          <h3 className="text-2xl md:text-2xl font-semibold text-ink">
            {schedule ? 'スケジュールを編集' : 'スケジュールを追加'}
          </h3>
          <IconButton
            variant="ghost"
            size="md"
            onClick={onCancel}
            rounded
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 md:h-7 md:w-7" />
          </IconButton>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="space-y-4 md:space-y-6 max-w-md mx-auto">
            {/* 時間選択 */}
            {!isAfterPurge && (
              <div>
                <label className="mb-1 md:mb-2 block text-base md:text-lg font-medium text-center text-ink">
                  時間 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-center gap-2 md:gap-3">
                  <NumberInput
                    value={hour}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                        setHour(value);
                      }
                    }}
                    min={0}
                    max={23}
                    required={!isAfterPurge}
                    placeholder="時"
                            className="w-20 md:w-24 text-center"
                  />
                  <span className="text-lg md:text-xl text-ink-sub">:</span>
                  <NumberInput
                    value={minute}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                        setMinute(value);
                      }
                    }}
                    min={0}
                    max={59}
                    required={!isAfterPurge}
                    placeholder="分"
                            className="w-20 md:w-24 text-center"
                  />
                </div>
              </div>
            )}

            {/* スケジュールタイプ選択（排他的） */}
            <ScheduleTypeSelector
              isRoasterOn={isRoasterOn}
              isRoast={isRoast}
              isAfterPurge={isAfterPurge}
              isChaffCleaning={isChaffCleaning}
              onTypeChange={handleMemoTypeChange}
              />

            {/* 焙煎機予熱用フィールド */}
            {isRoasterOn && (
              <RoasterFields
                beanName={beanName}
                beanName2={beanName2}
                blendRatio1={blendRatio1}
                blendRatio2={blendRatio2}
                weight={weight}
                roastLevel={roastLevel}
                onBeanNameChange={setBeanName}
                onBeanName2Change={setBeanName2}
                onBlendRatio1Change={setBlendRatio1}
                onBlendRatio2Change={setBlendRatio2}
                onWeightChange={setWeight}
                onRoastLevelChange={setRoastLevel}
                  />
            )}

            {/* ロースト用フィールド */}
            {isRoast && (
              <RoastFields
                roastCount={roastCount}
                bagCount={bagCount}
                onRoastCountChange={setRoastCount}
                onBagCountChange={setBagCount}
                  />
            )}

            {/* プレビュー */}
            <SchedulePreview
              isRoasterOn={isRoasterOn}
              isRoast={isRoast}
              isAfterPurge={isAfterPurge}
              isChaffCleaning={isChaffCleaning}
              beanName={beanName}
              beanName2={beanName2}
              blendRatio1={blendRatio1}
              blendRatio2={blendRatio2}
              weight={weight}
              roastLevel={roastLevel}
              roastCount={roastCount}
              bagCount={bagCount}
              />

            {/* フッター */}
            <div className="flex gap-3 md:gap-4 pt-4 md:pt-5 border-t justify-center border-edge">
              {schedule && onDelete && (
                <Button
                  type="button"
                  variant="danger"
                  size="lg"
                  onClick={handleDelete}
                      >
                  削除
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                  >
                保存
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

