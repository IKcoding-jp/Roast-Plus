'use client';

import { useState, useEffect } from 'react';
import type { TimeLabel, RoastSchedule } from '@/types';
import { HiX, HiClock, HiFire } from 'react-icons/hi';
import { OCRTimeLabelEditor } from './OCRTimeLabelEditor';
import { OCRRoastScheduleEditor } from './OCRRoastScheduleEditor';
import { useToastContext } from './Toast';

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

type TabType = 'timeLabels' | 'roastSchedules';

const sortTimeLabels = (labels: TimeLabel[]) => {
  const sorted = [...labels].sort((a, b) => {
    if (a.time && b.time) {
      return a.time.localeCompare(b.time);
    }
    return 0;
  });
  return sorted.map((label, index) => ({ ...label, order: index }));
};

const sortRoastSchedules = (schedules: RoastSchedule[]) => {
  const sortedRoastSchedules = [...schedules];

  sortedRoastSchedules.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return 0;
  });

  const schedulesWithSortTime: Array<{ schedule: RoastSchedule; sortTime: string }> = [];
  let lastRoastTime = '00:00';

  for (const schedule of sortedRoastSchedules) {
    let sortTime = schedule.time || '';

    if (schedule.isAfterPurge && !sortTime) {
      sortTime = lastRoastTime;
    } else if (sortTime) {
      lastRoastTime = sortTime;
    } else {
      sortTime = '99:99';
    }

    schedulesWithSortTime.push({ schedule, sortTime });
  }

  schedulesWithSortTime.sort((a, b) => a.sortTime.localeCompare(b.sortTime));
  return schedulesWithSortTime.map(({ schedule }, index) => ({ ...schedule, order: index }));
};

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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            読み取り結果の確認
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
          </button>
        </div>

        {/* モード選択 */}
        {hasExistingData && (
          <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">適用方法:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('replace')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                    mode === 'replace'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  置き換え
                </button>
                <button
                  onClick={() => setMode('add')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                    mode === 'add'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        )}

        {/* タブ */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setActiveTab('timeLabels')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center gap-2 ${
              activeTab === 'timeLabels'
                ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-600'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <HiClock className="h-5 w-5" />
            <span>本日のスケジュール</span>
            <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
              {timeLabels.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('roastSchedules')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center gap-2 ${
              activeTab === 'roastSchedules'
                ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-600'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <HiFire className="h-5 w-5" />
            <span>ローストスケジュール</span>
            <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
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
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 gap-3 flex-shrink-0">
          <button
            onClick={onRetry}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors min-h-[44px]"
            aria-label="再解析"
          >
            再解析
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium min-h-[44px]"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 sm:px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium min-h-[44px]"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

