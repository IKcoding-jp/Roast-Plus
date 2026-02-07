'use client';

import { useState, useEffect } from 'react';
import type { TimeLabel, RoastSchedule } from '@/types';
import { HiX, HiClock, HiFire } from 'react-icons/hi';
import { OCRTimeLabelEditor } from '../OCRTimeLabelEditor';
import { OCRRoastScheduleEditor } from '../OCRRoastScheduleEditor';
import { useToastContext } from '../Toast';
import { sortTimeLabels, sortRoastSchedules } from './OCRConfirmHelpers';
import type { TabType } from './OCRConfirmHelpers';
import { Button, IconButton } from '@/components/ui';

interface OCRConfirmModalProps {
  timeLabels: TimeLabel[];
  roastSchedules: RoastSchedule[];
  selectedDate: string;
  existingTimeLabels?: TimeLabel[];
  existingRoastSchedules?: RoastSchedule[];
  onSave: (mode: 'replace' | 'add', timeLabels: TimeLabel[], roastSchedules: RoastSchedule[]) => void;
  onCancel: () => void;
  onRetry: () => void;
}

export function OCRConfirmModal({
  timeLabels: initialTimeLabels,
  roastSchedules: initialRoastSchedules,
  selectedDate,
  existingTimeLabels = [],
  existingRoastSchedules = [],
  onSave,
  onCancel,
  onRetry,
}: OCRConfirmModalProps) {
  const { showToast } = useToastContext();
  const [activeTab, setActiveTab] = useState<TabType>('timeLabels');
  const [mode, setMode] = useState<'replace' | 'add'>('replace');
  const [timeLabels, setTimeLabels] = useState<TimeLabel[]>(() =>
    sortTimeLabels(initialTimeLabels)
  );
  const [roastSchedules, setRoastSchedules] = useState<RoastSchedule[]>(() =>
    sortRoastSchedules(initialRoastSchedules)
  );

  // ESCキーで閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  const handleSave = () => {
    // バリデーション: TimeLabelの時間が必須
    const invalidTimeLabels = timeLabels.filter((label) => !label.time || label.time.trim() === '');
    if (invalidTimeLabels.length > 0) {
      showToast('時間が入力されていないスケジュールがあります。', 'error');
      return;
    }

    // バリデーション: RoastScheduleの時間が必須（アフターパージを除く）
    const invalidRoastSchedules = roastSchedules.filter(
      (schedule) => !schedule.isAfterPurge && (!schedule.time || schedule.time.trim() === '')
    );
    if (invalidRoastSchedules.length > 0) {
      showToast('時間が入力されていないローストスケジュールがあります。', 'error');
      return;
    }

    // 時間順にソート
    const sortedTimeLabels = [...timeLabels].sort((a, b) => {
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      return 0;
    });
    sortedTimeLabels.forEach((label, index) => {
      label.order = index;
    });

    // ローストスケジュールのソート：アフターパージは前のローストの後に配置
    const sortedRoastSchedules = [...roastSchedules];

    // アフターパージで時間が空の場合、前のローストの時間を参照
    const finalSorted: RoastSchedule[] = [];
    let lastRoastTime = '00:00';

    for (const schedule of sortedRoastSchedules) {
      if (schedule.isAfterPurge && !schedule.time) {
        // アフターパージで時間が空の場合、前のローストの時間を使用（ソート用）
        const tempTime = lastRoastTime;
        finalSorted.push({ ...schedule, time: tempTime });
      } else {
        if (schedule.time) {
          lastRoastTime = schedule.time;
        }
        finalSorted.push(schedule);
      }
    }

    // 時間順にソート
    finalSorted.sort((a, b) => {
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });

    // アフターパージの時間を元に戻す（空文字列に）
    const restoredSchedules = finalSorted.map((schedule) => {
      if (schedule.isAfterPurge && schedule.time === lastRoastTime && !roastSchedules.find(s => s.id === schedule.id)?.time) {
        return { ...schedule, time: '' };
      }
      return schedule;
    });

    restoredSchedules.forEach((schedule, index) => {
      schedule.order = index;
    });

    onSave(mode, sortedTimeLabels, restoredSchedules);
  };

  const hasExistingData = existingTimeLabels.length > 0 || existingRoastSchedules.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="rounded-lg shadow-xl max-w-4xl w-full mx-4 flex flex-col max-h-[90vh] bg-overlay border border-edge">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0 border-edge">
          <h2 className="text-lg sm:text-xl font-bold text-ink">
            読み取り結果の確認
          </h2>
          <IconButton
            variant="ghost"
            size="md"
            onClick={onCancel}
            rounded
            aria-label="閉じる"
          >
            <HiX className="h-5 w-5 sm:h-6 sm:w-6" />
          </IconButton>
        </div>

        {/* モード選択 */}
        {hasExistingData && (
          <div className="px-4 sm:px-6 py-3 border-b flex-shrink-0 border-edge">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-ink">適用方法:</span>
              <div className="flex gap-2">
                <Button
                  variant={mode === 'replace' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('replace')}
                >
                  置き換え
                </Button>
                <Button
                  variant={mode === 'add' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('add')}
                >
                  追加
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* タブ */}
        <div className="flex border-b flex-shrink-0 border-edge">
          <button
            onClick={() => setActiveTab('timeLabels')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center gap-2 ${
              activeTab === 'timeLabels'
                ? 'bg-spot-subtle text-spot border-b-2 border-spot'
                : 'bg-surface text-ink-sub hover:bg-ground'
            }`}
          >
            <HiClock className="h-5 w-5" />
            <span>本日のスケジュール</span>
            <span className="rounded-full px-2 py-0.5 text-xs bg-ground text-ink">
              {timeLabels.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('roastSchedules')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center gap-2 ${
              activeTab === 'roastSchedules'
                ? 'bg-spot-subtle text-spot border-b-2 border-spot'
                : 'bg-surface text-ink-sub hover:bg-ground'
            }`}
          >
            <HiFire className="h-5 w-5" />
            <span>ローストスケジュール</span>
            <span className="rounded-full px-2 py-0.5 text-xs bg-ground text-ink">
              {roastSchedules.length}
            </span>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'timeLabels' ? (
            <OCRTimeLabelEditor
              timeLabels={timeLabels}
              onUpdate={setTimeLabels}
              onDelete={(id) => {
                setTimeLabels(timeLabels.filter((label) => label.id !== id));
              }}
            />
          ) : (
            <OCRRoastScheduleEditor
              roastSchedules={roastSchedules}
              selectedDate={selectedDate}
              onUpdate={setRoastSchedules}
              onDelete={(id) => {
                setRoastSchedules(roastSchedules.filter((schedule) => schedule.id !== id));
              }}
            />
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t gap-3 flex-shrink-0 border-edge">
          <Button
            variant="ghost"
            size="md"
            onClick={onRetry}
            aria-label="再解析"
          >
            再解析
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={onCancel}
            >
              キャンセル
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
            >
              保存
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
