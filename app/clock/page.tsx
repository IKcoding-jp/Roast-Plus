'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { HiArrowLeft, HiCog6Tooth } from 'react-icons/hi2';
import { useClockSettings } from '@/hooks/useClockSettings';
import { ClockSettingsModal } from '@/components/clock/ClockSettingsModal';
import { getThemeColors, getFontFamily, getFontWidthFactor, getScaledClamp } from '@/lib/clockSettings';

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

function formatTime(date: Date, use24Hour: boolean): { h: string; m: string; s: string; ampm?: string } {
  let hours = date.getHours();
  let ampm: string | undefined;

  if (!use24Hour) {
    ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  }

  return {
    h: String(hours).padStart(2, '0'),
    m: String(date.getMinutes()).padStart(2, '0'),
    s: String(date.getSeconds()).padStart(2, '0'),
    ampm,
  };
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = DAY_NAMES[date.getDay()];
  return `${y}/${m}/${d} (${day})`;
}

function useCurrentTime() {
  const subscribe = useCallback((callback: () => void) => {
    const timer = setInterval(callback, 1000);
    return () => clearInterval(timer);
  }, []);

  const getSnapshot = useCallback(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
  }, []);

  const getServerSnapshot = useCallback(() => '', []);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!snapshot) return null;
  return new Date();
}

export default function ClockPage() {
  const now = useCurrentTime();
  const { settings, isLoaded, updateSettings, resetSettings } = useClockSettings();
  const [showSettings, setShowSettings] = useState(false);

  const colors = getThemeColors(settings.theme);
  const fontFamily = getFontFamily(settings.fontKey);
  const scale = settings.fontScale;
  const wf = getFontWidthFactor(settings.fontKey);

  if (!now || !isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: colors.bg }}>
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: colors.accent, borderTopColor: 'transparent' }} />
          <span className="text-lg" style={{ color: colors.uiText }}>読み込み中...</span>
        </div>
      </div>
    );
  }

  const time = formatTime(now, settings.use24Hour);

  return (
    <div
      className="flex flex-col items-center justify-center h-screen select-none relative"
      style={{ backgroundColor: colors.bg }}
    >
      {/* ヘッダー：戻るボタン＋設定ボタン */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <Link
          href="/"
          className="flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg transition-colors"
          style={{ color: colors.uiText }}
          aria-label="ホームに戻る"
        >
          <HiArrowLeft className="h-6 w-6" />
        </Link>
      </div>

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg transition-colors"
          style={{ color: colors.uiText }}
          aria-label="時計の設定"
        >
          <HiCog6Tooth className="h-6 w-6" />
        </button>
      </div>

      {/* 時計表示エリア */}
      <div className="text-center">
        {/* AM/PM 表示（12時間モード時） */}
        {!settings.use24Hour && time.ampm && (
          <p
            className="font-bold tracking-widest mb-2"
            style={{
              fontSize: getScaledClamp(1.5, 5, scale, wf),
              fontFamily,
              color: colors.accent,
            }}
          >
            {time.ampm}
          </p>
        )}

        {/* デジタル時計 */}
        <time
          className="flex items-baseline justify-center gap-1 leading-none"
          style={{ fontFamily, fontFeatureSettings: '"tnum"' }}
          dateTime={now.toISOString()}
        >
          <span
            className="font-black"
            style={{ fontSize: getScaledClamp(6, 28, scale, wf), color: colors.text }}
          >
            {time.h}
          </span>
          <span
            className="font-black"
            style={{ fontSize: getScaledClamp(4, 18, scale, wf), color: colors.accent }}
          >
            :
          </span>
          <span
            className="font-black"
            style={{ fontSize: getScaledClamp(6, 28, scale, wf), color: colors.text }}
          >
            {time.m}
          </span>
          {settings.showSeconds && (
            <span
              className="font-black ml-1"
              style={{ fontSize: getScaledClamp(2.5, 10, scale, wf), color: colors.accentSub }}
            >
              {time.s}
            </span>
          )}
        </time>

        {/* 日付表示 */}
        {settings.showDate && (
          <p
            className="mt-4 sm:mt-6 font-bold tracking-widest"
            style={{
              fontSize: getScaledClamp(1.5, 5, scale, wf),
              fontFamily,
              color: colors.dateText,
            }}
          >
            {formatDate(now)}
          </p>
        )}

        {/* アクセントライン */}
        <div
          className="mt-6 sm:mt-8 mx-auto w-24 sm:w-32 h-1 rounded-full opacity-60"
          style={{
            background: `linear-gradient(to right, ${colors.accentSub}, ${colors.accent}, ${colors.accentSub})`,
          }}
        />
      </div>

      {/* 設定モーダル */}
      {showSettings && (
        <ClockSettingsModal
          settings={settings}
          onUpdate={updateSettings}
          onReset={resetSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
