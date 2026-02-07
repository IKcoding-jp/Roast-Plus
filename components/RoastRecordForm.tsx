'use client';

import { useState } from 'react';
import type { RoastTimerRecord, AppData } from '@/types';
import { ALL_BEANS, type BeanName } from '@/lib/beanConfig';
import { formatTime } from '@/lib/roastTimerUtils';
import { useToastContext } from '@/components/Toast';
import { Input, Select, Button } from '@/components/ui';
import { ROAST_LEVELS } from '@/lib/constants';
import { convertToHalfWidth, removeNonNumeric } from '@/lib/utils';
import { formatDateString } from '@/lib/dateUtils';

const WEIGHTS: Array<200 | 300 | 500> = [200, 300, 500];

interface RoastRecordFormProps {
  data: AppData;
  onSave: (record: RoastTimerRecord) => void;
  record?: RoastTimerRecord; // 編集時は既存記録を渡す
  initialValues?: {
    beanName?: string;
    weight?: 200 | 300 | 500;
    roastLevel?: '浅煎り' | '中煎り' | '中深煎り' | '深煎り';
    duration?: number; // 秒
  };
  onDelete?: (id: string) => void; // 削除機能（編集時のみ）
  onCancel?: () => void; // キャンセル機能
}

export function RoastRecordForm(props: RoastRecordFormProps) {
  const keyParts = [
    props.record?.id ?? 'new',
    props.initialValues?.beanName ?? '',
    props.initialValues?.weight ?? '',
    props.initialValues?.roastLevel ?? '',
    props.initialValues?.duration ?? '',
  ];
  const remountKey = keyParts.join('-');
  return <RoastRecordFormInner key={remountKey} {...props} />;
}

function RoastRecordFormInner({
  data: _data,
  onSave,
  record,
  initialValues,
  onDelete,
  onCancel,
}: RoastRecordFormProps) {
  const { showToast } = useToastContext();
  void _data;

  // 編集モードの場合、recordから初期値を設定
  const isEditMode = !!record;

  const [beanName, setBeanName] = useState<BeanName | ''>(
    (record?.beanName || initialValues?.beanName || '') as BeanName | ''
  );
  const [weight, setWeight] = useState<200 | 300 | 500 | ''>(
    record?.weight || initialValues?.weight || ''
  );
  const [roastLevel, setRoastLevel] = useState<
    '浅煎り' | '中煎り' | '中深煎り' | '深煎り' | ''
  >(record?.roastLevel || initialValues?.roastLevel || '');
  const [durationMinutes, setDurationMinutes] = useState<string>(() => {
    const duration = record?.duration || initialValues?.duration || 0;
    return duration > 0 ? Math.floor(duration / 60).toString() : '';
  });
  const [durationSeconds, setDurationSeconds] = useState<string>(() => {
    const duration = record?.duration || initialValues?.duration || 0;
    return duration > 0 ? (duration % 60).toString().padStart(2, '0') : '';
  });
  const [roastDate, setRoastDate] = useState<string>(
    record?.roastDate || formatDateString()
  );

  const handleDurationMinutesChange = (value: string) => {
    const halfWidth = convertToHalfWidth(value);
    const numericOnly = removeNonNumeric(halfWidth);
    setDurationMinutes(numericOnly);
  };

  const handleDurationSecondsChange = (value: string) => {
    const halfWidth = convertToHalfWidth(value);
    const numericOnly = removeNonNumeric(halfWidth);
    // 秒は0-59の範囲に制限
    if (numericOnly === '' || (parseInt(numericOnly, 10) >= 0 && parseInt(numericOnly, 10) <= 59)) {
      setDurationSeconds(numericOnly);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!beanName) {
      showToast('豆の名前を選択してください', 'warning');
      return;
    }
    if (weight === '') {
      showToast('重さを選択してください', 'warning');
      return;
    }
    if (!roastLevel) {
      showToast('焙煎度合いを選択してください', 'warning');
      return;
    }
    if (!durationMinutes) {
      showToast('ロースト時間（分）を入力してください', 'warning');
      return;
    }
    if (!roastDate) {
      showToast('焙煎日を入力してください', 'warning');
      return;
    }

    const minutes = parseInt(durationMinutes, 10) || 0;
    const seconds = parseInt(durationSeconds, 10) || 0;
    const duration = minutes * 60 + seconds;

    if (duration <= 0) {
      showToast('有効なロースト時間を入力してください', 'warning');
      return;
    }

    // 記録を作成または更新
    const updatedRecord: RoastTimerRecord = {
      id: record?.id || `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      beanName: beanName as BeanName,
      weight: weight as 200 | 300 | 500,
      roastLevel: roastLevel as '浅煎り' | '中煎り' | '中深煎り' | '深煎り',
      duration,
      roastDate,
      createdAt: record?.createdAt || new Date().toISOString(),
      userId: record?.userId || '', // 親コンポーネントで設定される
      groupId: record?.groupId,
    };

    onSave(updatedRecord);

    // 新規作成の場合のみ、保存後に入力欄をクリア（日付は今日の日付にリセット）
    if (!isEditMode) {
      setBeanName('');
      setWeight('');
      setRoastLevel('');
      setDurationMinutes('');
      setDurationSeconds('');
      setRoastDate(formatDateString());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* 豆の名前 */}
      <div>
        <label className="block text-sm sm:text-base font-medium mb-1 sm:mb-2 text-ink">
          豆の名前 <span className="text-red-500">*</span>
        </label>
        <Select
          value={beanName}
          onChange={(e) => setBeanName(e.target.value as BeanName)}
          options={ALL_BEANS.map((bean) => ({ value: bean, label: bean }))}
          placeholder="選択してください"
          required
        />
      </div>

      {/* 重さ */}
      <div>
        <label className="block text-sm sm:text-base font-medium mb-1 sm:mb-2 text-ink">
          重さ <span className="text-red-500">*</span>
        </label>
        <Select
          value={weight.toString()}
          onChange={(e) =>
            setWeight(e.target.value ? (parseInt(e.target.value, 10) as 200 | 300 | 500) : '')
          }
          options={WEIGHTS.map((w) => ({ value: w.toString(), label: `${w}g` }))}
          placeholder="選択してください"
          required
        />
      </div>

      {/* 焙煎度合い */}
      <div>
        <label className="block text-sm sm:text-base font-medium mb-1 sm:mb-2 text-ink">
          焙煎度合い <span className="text-red-500">*</span>
        </label>
        <Select
          value={roastLevel}
          onChange={(e) =>
            setRoastLevel(
              e.target.value as '浅煎り' | '中煎り' | '中深煎り' | '深煎り' | ''
            )
          }
          options={ROAST_LEVELS.map((level) => ({ value: level, label: level }))}
          placeholder="選択してください"
          required
        />
      </div>

      {/* 実際のロースト時間 */}
      <div>
        <label className="block text-sm sm:text-base font-medium mb-1 sm:mb-2 text-ink">
          実際のロースト時間 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3 sm:gap-4">
          <div className="flex-1">
            <Input
              type="text"
              inputMode="numeric"
              value={durationMinutes}
              onChange={(e) => handleDurationMinutesChange(e.target.value)}
              placeholder="分"
              required
                />
          </div>
          <div className="flex-1">
            <Input
              type="text"
              inputMode="numeric"
              value={durationSeconds}
              onChange={(e) => handleDurationSecondsChange(e.target.value)}
              placeholder="秒"
              maxLength={2}
                />
          </div>
        </div>
        {durationMinutes && (
          <p className="mt-1 text-xs sm:text-sm text-ink-muted">
            合計: {formatTime((parseInt(durationMinutes, 10) || 0) * 60 + (parseInt(durationSeconds, 10) || 0))}
          </p>
        )}
      </div>

      {/* 焙煎日 */}
      <div>
        <label className="block text-sm sm:text-base font-medium mb-1 sm:mb-2 text-ink">
          焙煎日 <span className="text-red-500">*</span>
        </label>
        <Input
          type="date"
          value={roastDate}
          onChange={(e) => setRoastDate(e.target.value)}
          required
        />
      </div>

      {/* ボタン */}
      <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3">
        {isEditMode && onDelete && (
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (record && window.confirm('この記録を削除しますか？')) {
                onDelete(record.id);
              }
            }}
            className="w-full sm:w-auto"
            >
            削除
          </Button>
        )}
        <div className="flex-1 flex gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
                >
              キャンセル
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            >
            {isEditMode ? '更新' : '保存'}
          </Button>
        </div>
      </div>
    </form>
  );
}
