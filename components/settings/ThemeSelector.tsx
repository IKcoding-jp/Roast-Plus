'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemePreset, ThemeAnimationType } from '@/lib/theme';
import { HiCheck } from 'react-icons/hi';
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
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute bottom-5 rounded-full"
          style={{
            left: `${22 + i * 14}%`,
            width: 2,
            height: 18,
            backgroundColor: color,
            willChange: 'transform, opacity',
          }}
          animate={{ y: [0, -30], opacity: [0, 0.65, 0] }}
          transition={{
            duration: 2.5,
            delay: i * 0.85,
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
      {/* 金色の横長艶光エフェクト */}
      <motion.div
        className="absolute"
        style={{
          background: `radial-gradient(ellipse at center, ${accentColor}65 0%, transparent 70%)`,
          width: '75%',
          height: 44,
          top: '30%',
          left: '12%',
          willChange: 'opacity, transform',
        }}
        animate={{ opacity: [0.3, 0.7, 0.3], scaleX: [0.85, 1.2, 0.85] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* 金の火花パーティクル */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${25 + i * 20}%`,
            bottom: '28%',
            width: 3,
            height: 3,
            backgroundColor: accentColor,
            willChange: 'transform, opacity',
          }}
          animate={{ y: [0, -22], opacity: [0.7, 0] }}
          transition={{
            duration: 1.2,
            delay: i * 0.4,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

function ParticlesAnimation({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${18 + i * 18}%`,
            bottom: '18%',
            width: i % 2 === 0 ? 4 : 3,
            height: i % 2 === 0 ? 4 : 3,
            backgroundColor: color,
            willChange: 'transform, opacity',
          }}
          animate={{ y: [0, -38], opacity: [0, 0.55, 0] }}
          transition={{
            duration: 2 + i * 0.45,
            delay: i * 0.6,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

function LeafAnimation({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${15 + i * 18}%`,
            bottom: `${20 + (i % 2) * 15}%`,
            width: i % 2 === 0 ? 4 : 3,
            height: i % 2 === 0 ? 4 : 3,
            backgroundColor: color,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [0, -32],
            x: [0, i % 2 === 0 ? 10 : -10],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 2.8 + i * 0.3,
            delay: i * 0.7,
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
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse at 60% 40%, ${accentColor}60 0%, transparent 65%)`,
        willChange: 'opacity, transform',
      }}
      animate={{ opacity: [0, 1, 0], scale: [0.85, 1.1, 0.85] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function SnowAnimation({ color, accentColor }: { color: string; accentColor: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 白い雪 */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${8 + i * 14}%`,
            top: -5,
            width: i % 2 === 0 ? 4 : 3,
            height: i % 2 === 0 ? 4 : 3,
            backgroundColor: color,
            opacity: 0.9,
            willChange: 'transform',
          }}
          animate={{
            y: [0, 110],
            x: [0, i % 2 === 0 ? 7 : -7],
          }}
          transition={{
            duration: 3.5 + (i % 3) * 0.8,
            delay: i * 0.6,
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
          animate={{ opacity: [0, 0.85, 0], scale: [0.5, 1.5, 0.5] }}
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
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${6 + i * 13}%`,
            top: `${12 + (i % 4) * 18}%`,
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            backgroundColor: color,
            willChange: 'opacity',
          }}
          animate={{ opacity: [1, 0.05, 1] }}
          transition={{
            duration: 1.2 + i * 0.25,
            delay: i * 0.18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
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
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`
        relative w-full text-left rounded-xl overflow-hidden
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
    </button>
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
