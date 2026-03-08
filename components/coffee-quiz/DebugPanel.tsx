'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  isDebugMode,
  setDebugMode,
  getDebugDateOffset,
  setDebugDateOffset,
  getDebugInfo,
  resetDebugState,
} from '@/lib/coffee-quiz/debug';
import { Button, Checkbox } from '@/components/ui';

// アイコン
const BugIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m8 2 1.88 1.88" />
    <path d="M14.12 3.88 16 2" />
    <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
    <path d="M12 20v-9" />
    <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
    <path d="M6 13H2" />
    <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
    <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
    <path d="M22 13h-4" />
    <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

interface DebugPanelProps {
  onDateChange?: () => void;
}

export function DebugPanel({ onDateChange }: DebugPanelProps) {
  const [debugEnabled, setDebugEnabled] = useState(() => isDebugMode());
  const [dateOffset, setDateOffsetState] = useState(() => getDebugDateOffset());
  const [debugInfo, setDebugInfo] = useState<ReturnType<typeof getDebugInfo> | null>(() => getDebugInfo());

  // デバッグモード切り替え
  const handleToggleDebug = () => {
    const newEnabled = !debugEnabled;
    setDebugMode(newEnabled);
    setDebugEnabled(newEnabled);
    if (!newEnabled) {
      resetDebugState();
      setDateOffsetState(0);
    }
    setDebugInfo(getDebugInfo());
    onDateChange?.();
  };

  // 日付オフセット変更
  const handleDateOffsetChange = (offset: number) => {
    setDebugDateOffset(offset);
    setDateOffsetState(offset);
    setDebugInfo(getDebugInfo());
    onDateChange?.();
  };

  // リセット
  const handleReset = () => {
    resetDebugState();
    setDebugEnabled(false);
    setDateOffsetState(0);
    setDebugInfo(getDebugInfo());
    onDateChange?.();
  };

  // ページリロード（変更を反映）
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-amber-50 rounded-2xl p-5 border-2 border-amber-200"
    >
      <h2 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
        <span className="text-amber-600">
          <BugIcon />
        </span>
        デバッグパネル
      </h2>

      <p className="text-amber-700/70 text-sm mb-4">
        日付を変更してストリークや復習機能をテストできます。
      </p>

      {/* デバッグモード切り替え */}
      <div className="mb-4">
        <Checkbox
          checked={debugEnabled}
          onChange={handleToggleDebug}
          label="デバッグモードを有効にする"
          className="cursor-pointer"
        />
      </div>

      {debugEnabled && (
        <>
          {/* 日付オフセット */}
          <div className="mb-4 p-3 bg-white rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 mb-2 text-amber-700">
              <CalendarIcon />
              <span className="font-medium">日付オフセット</span>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <Button
                onClick={() => handleDateOffsetChange(dateOffset - 1)}
                variant="ghost"
                size="sm"
                className="!px-3 !py-1.5 !min-h-0 bg-amber-100 hover:bg-amber-200 text-amber-700"
              >
                -1日
              </Button>
              <input
                type="number"
                value={dateOffset}
                onChange={(e) => handleDateOffsetChange(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-1.5 border border-amber-200 rounded-lg text-center font-mono"
              />
              <Button
                onClick={() => handleDateOffsetChange(dateOffset + 1)}
                variant="ghost"
                size="sm"
                className="!px-3 !py-1.5 !min-h-0 bg-amber-100 hover:bg-amber-200 text-amber-700"
              >
                +1日
              </Button>
            </div>

            <div className="text-sm space-y-1">
              <div className="flex justify-between text-amber-600">
                <span>実際の日付:</span>
                <span className="font-mono">{debugInfo?.realDate}</span>
              </div>
              <div className="flex justify-between text-amber-800 font-medium">
                <span>シミュレート日付:</span>
                <span className="font-mono">{debugInfo?.currentDate}</span>
              </div>
            </div>
          </div>

          {/* クイックプリセット */}
          <div className="mb-4">
            <div className="text-sm text-amber-700 mb-2">クイックプリセット:</div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleDateOffsetChange(-1)}
                variant="ghost"
                size="sm"
                className="!px-3 !py-1.5 !min-h-0 bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm"
              >
                昨日
              </Button>
              <Button
                onClick={() => handleDateOffsetChange(0)}
                variant="ghost"
                size="sm"
                className="!px-3 !py-1.5 !min-h-0 bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm"
              >
                今日
              </Button>
              <Button
                onClick={() => handleDateOffsetChange(1)}
                variant="ghost"
                size="sm"
                className="!px-3 !py-1.5 !min-h-0 bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm"
              >
                明日
              </Button>
              <Button
                onClick={() => handleDateOffsetChange(7)}
                variant="ghost"
                size="sm"
                className="!px-3 !py-1.5 !min-h-0 bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm"
              >
                1週間後
              </Button>
              <Button
                onClick={() => handleDateOffsetChange(30)}
                variant="ghost"
                size="sm"
                className="!px-3 !py-1.5 !min-h-0 bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm"
              >
                1ヶ月後
              </Button>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2">
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="flex-1 !rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-800"
            >
              リセット
            </Button>
            <Button
              onClick={handleReload}
              variant="warning"
              size="sm"
              className="flex-1 gap-2 !rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
            >
              <RefreshIcon />
              ページ更新
            </Button>
          </div>

          <p className="text-amber-600/70 text-xs mt-3">
            ※ 日付を変更した後は「ページ更新」を押して、変更を反映してください。
          </p>
        </>
      )}
    </motion.div>
  );
}
