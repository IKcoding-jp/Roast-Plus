'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemePreset, ThemeAnimationType } from '@/lib/theme';
import { HiCheck } from 'react-icons/hi';
import { Button } from '@/components/ui';
import {
  TbCoffee,
  TbFlame,
  TbSun,
  TbLeaf,
  TbDroplet,
  TbSnowflake,
  TbMoon,
} from 'react-icons/tb';

// ── アイコンマップ ────────────────────────────────────────────────────

const THEME_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  default: TbCoffee,
  'dark-roast': TbFlame,
  'light-roast': TbSun,
  matcha: TbLeaf,
  caramel: TbDroplet,
  christmas: TbSnowflake,
  dark: TbMoon,
};

// ── アンビエントアニメーションコンポーネント ──────────────────────────

function SteamAnimation({ color }: { color: string }) {
  const wisps = [
    { left: '20%', w: 2, h: 24, delay: 0, xSign: 1 },
    { left: '32%', w: 3, h: 18, delay: 0.7, xSign: -1 },
    { left: '44%', w: 2, h: 28, delay: 1.4, xSign: 1 },
    { left: '55%', w: 2, h: 20, delay: 0.35, xSign: -1 },
    { left: '66%', w: 3, h: 16, delay: 1.1, xSign: 1 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {wisps.map((w, i) => (
        <motion.div
          key={i}
          className="absolute bottom-4 rounded-full"
          style={{
            left: w.left,
            width: w.w,
            height: w.h,
            backgroundColor: color,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [0, -42],
            x: [0, w.xSign * 8, w.xSign * -5, 0],
            opacity: [0, 0.6, 0.45, 0],
          }}
          transition={{
            duration: 3.2,
            delay: w.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

function FlameAnimation({ accentColor }: { color: string; accentColor: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 炎タング（縦長・揺れる）*/}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`tongue-${i}`}
          className="absolute"
          style={{
            left: `${28 + i * 16}%`,
            bottom: '22%',
            width: 5 + i * 2,
            height: 18 + i * 8,
            backgroundColor: accentColor,
            borderRadius: '50% 50% 20% 20%',
            opacity: 0.6,
            willChange: 'transform, opacity',
          }}
          animate={{
            scaleY: [0.6, 1.4, 0.8, 1.2, 0.6],
            scaleX: [1, 0.8, 1.1, 0.85, 1],
            opacity: [0.35, 0.7, 0.45, 0.8, 0.35],
          }}
          transition={{
            duration: 1.4 + i * 0.3,
            delay: i * 0.25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* 四方に飛散するスパーク */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${32 + i * 10}%`,
            bottom: '32%',
            width: 2,
            height: 2,
            backgroundColor: accentColor,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [0, -(24 + i * 6)],
            x: [0, (i % 2 === 0 ? 14 : -14) + (i - 1) * 3],
            opacity: [0.9, 0],
          }}
          transition={{
            duration: 0.9 + i * 0.18,
            delay: i * 0.28,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

function ParticlesAnimation({ color }: { color: string }) {
  const bubbles = [
    { left: '14%', bottom: '22%', size: 6 },
    { left: '29%', bottom: '32%', size: 4 },
    { left: '46%', bottom: '20%', size: 7 },
    { left: '62%', bottom: '36%', size: 5 },
    { left: '76%', bottom: '26%', size: 4 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: b.left,
            bottom: b.bottom,
            width: b.size,
            height: b.size,
            border: `1px solid ${color}`,
            backgroundColor: `${color}18`,
            willChange: 'transform, opacity',
          }}
          animate={{
            scale: [0.4, 1.2, 0],
            opacity: [0, 0.65, 0],
            y: [0, -16],
          }}
          transition={{
            duration: 1.8 + i * 0.35,
            delay: i * 0.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

function LeafAnimation({ color }: { color: string }) {
  const leaves = [
    { left: '14%', bottom: '25%', w: 5, h: 9, delay: 0, xSign: 1 },
    { left: '30%', bottom: '35%', w: 4, h: 7, delay: 0.8, xSign: -1 },
    { left: '50%', bottom: '20%', w: 6, h: 10, delay: 1.5, xSign: 1 },
    { left: '68%', bottom: '30%', w: 4, h: 8, delay: 0.4, xSign: -1 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {leaves.map((l, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: l.left,
            bottom: l.bottom,
            width: l.w,
            height: l.h,
            backgroundColor: color,
            borderRadius: '40% 60% 60% 40% / 40% 40% 60% 60%',
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [0, -38],
            x: [0, l.xSign * 14, l.xSign * 8],
            rotate: [-25, 25, -15],
            opacity: [0.2, 0.45, 0.15],
          }}
          transition={{
            duration: 3.2 + i * 0.4,
            delay: l.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function GlowAnimation({ accentColor }: { color: string; accentColor: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* キャラメルウォームグロー */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 55% 45%, ${accentColor}55 0%, transparent 62%)`,
          willChange: 'opacity, transform',
        }}
        animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.12, 0.9] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* キャラメルドリップ（縦ライン）*/}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: `${25 + i * 22}%`,
            top: 0,
            width: 2,
            height: 14 + i * 6,
            backgroundColor: accentColor,
            borderRadius: '0 0 3px 3px',
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [0, 44],
            opacity: [0, 0.75, 0],
            scaleY: [0.2, 1, 0.8],
          }}
          transition={{
            duration: 1.6 + i * 0.5,
            delay: i * 0.75,
            repeat: Infinity,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

function SnowAnimation({ color, accentColor }: { color: string; accentColor: string }) {
  const flakes = [
    { left: '8%', size: 4, dur: 3.5, delay: 0, xEnd: 7 },
    { left: '22%', size: 6, dur: 4.8, delay: 0.6, xEnd: -9 },
    { left: '36%', size: 3, dur: 3.2, delay: 1.2, xEnd: 6 },
    { left: '50%', size: 5, dur: 4.2, delay: 0.3, xEnd: -7 },
    { left: '64%', size: 3, dur: 3.8, delay: 1.0, xEnd: 8 },
    { left: '78%', size: 6, dur: 5.0, delay: 0.8, xEnd: -6 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {flakes.map((f, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: f.left,
            top: -8,
            width: f.size,
            height: f.size,
            backgroundColor: color,
            opacity: 0.88,
            willChange: 'transform',
          }}
          animate={{
            y: [0, 115],
            x: [0, f.xEnd],
            rotate: [0, i % 2 === 0 ? 180 : -180],
          }}
          transition={{
            duration: f.dur,
            delay: f.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
      {/* 金のきらめき */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`glitter-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${20 + i * 25}%`,
            top: `${25 + i * 20}%`,
            width: 3,
            height: 3,
            backgroundColor: accentColor,
            willChange: 'opacity, transform',
          }}
          animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.8, 0.5] }}
          transition={{
            duration: 1.8,
            delay: i * 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function StarsAnimation({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 瞬く星（サイズバリエーション）*/}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${8 + i * 15}%`,
            top: `${14 + (i % 4) * 18}%`,
            width: i % 3 === 0 ? 4 : i % 2 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 4 : i % 2 === 0 ? 3 : 2,
            backgroundColor: color,
            willChange: 'opacity, transform',
          }}
          animate={{ opacity: [1, 0.05, 1], scale: [1, 0.5, 1] }}
          transition={{
            duration: 1.2 + i * 0.3,
            delay: i * 0.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* 流れ星 */}
      <motion.div
        className="absolute"
        style={{
          top: '22%',
          left: '-2%',
          width: 20,
          height: 2,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${color})`,
          willChange: 'transform, opacity',
        }}
        animate={{
          x: [0, 240],
          opacity: [0, 0.85, 0],
        }}
        transition={{
          duration: 1.0,
          repeat: Infinity,
          repeatDelay: 4.0,
          ease: 'linear',
        }}
      />
    </div>
  );
}

function ThemeAnimation({
  type,
  textColor,
  accentColor,
}: {
  type: ThemeAnimationType;
  textColor: string;
  accentColor: string;
}) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return null;

  switch (type) {
    case 'steam':
      return <SteamAnimation color={textColor} />;
    case 'flame':
      return <FlameAnimation color={textColor} accentColor={accentColor} />;
    case 'particles':
      return <ParticlesAnimation color={textColor} />;
    case 'leaf':
      return <LeafAnimation color={textColor} />;
    case 'glow':
      return <GlowAnimation color={textColor} accentColor={accentColor} />;
    case 'snow':
      return <SnowAnimation color={textColor} accentColor={accentColor} />;
    case 'stars':
      return <StarsAnimation color={textColor} />;
    default:
      return null;
  }
}

// ── ThemePreviewCard ─────────────────────────────────────────────────

function ThemePreviewCard({
  preset,
  isSelected,
  onSelect,
}: {
  preset: ThemePreset;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { bg, surface, accent, text } = preset.previewColors;
  const Icon = THEME_ICONS[preset.id] ?? TbCoffee;

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`
        relative w-full text-left !rounded-xl overflow-hidden
        !p-0 !min-h-0
        transition-all duration-200 ease-out
        border-2
        ${
          isSelected
            ? 'border-white/40 ring-2 ring-white/20 shadow-xl'
            : 'border-transparent hover:border-white/20'
        }
      `}
      style={{ background: preset.bgGradient }}
    >
      {/* 背景層: 大型装飾アイコン（右下） */}
      <div className="absolute bottom-0 right-1 pointer-events-none">
        <Icon size={90} style={{ color: accent, opacity: 0.10 }} aria-hidden />
      </div>

      {/* アンビエントアニメーション層 */}
      <ThemeAnimation type={preset.animationType} textColor={text} accentColor={accent} />

      {/* カードコンテンツ */}
      <div className="relative z-10 p-4 flex flex-col gap-2 min-h-[152px]">
        {/* 上部: アイコン単独（バッジなし） */}
        <div>
          <Icon size={22} style={{ color: text }} aria-hidden />
        </div>

        {/* 中部: テーマ名 + 説明文 */}
        <div className="flex-1">
          <span
            className={`text-2xl leading-tight block ${preset.fontStyle}`}
            style={{ color: text }}
          >
            {preset.name}
          </span>
          <p
            className="text-xs mt-1 leading-snug"
            style={{ color: text, opacity: 0.72 }}
          >
            {preset.description}
          </p>
        </div>

        {/* 下部: バッジ + 色スウォッチ + 選択チェック */}
        <div className="flex items-center gap-2">
          <span
            data-testid={`badge-${preset.id}`}
            className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border leading-none shrink-0"
            style={{
              color: text,
              borderColor: `${text}40`,
            }}
          >
            {preset.type === 'light' ? 'LIGHT' : 'DARK'}
          </span>
          <div className="flex gap-1.5">
            {[bg, surface, accent].map((color, i) => (
              <span
                key={i}
                data-testid="color-swatch"
                className="w-3.5 h-3.5 rounded-full border"
                style={{
                  backgroundColor: color,
                  borderColor: `${text}30`,
                }}
              />
            ))}
          </div>
          <div className="ml-auto">
            {isSelected && (
              <span
                data-testid="selected-check"
                className="flex items-center justify-center w-5 h-5 rounded-full"
                style={{
                  backgroundColor: `${text}20`,
                  color: text,
                }}
              >
                <HiCheck className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>
    </Button>
  );
}

// ── ThemeSelector ────────────────────────────────────────────────────

export function ThemeSelector() {
  const { currentTheme, setTheme, presets } = useAppTheme();

  return (
    <div className="grid grid-cols-2 gap-3">
      {presets.map((preset) => (
        <ThemePreviewCard
          key={preset.id}
          preset={preset}
          isSelected={currentTheme === preset.id}
          onSelect={() => setTheme(preset.id)}
        />
      ))}
    </div>
  );
}
