'use client';

import { useRouter } from 'next/navigation';
import type { IconType } from 'react-icons';
import { FaHollyBerry } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: IconType;
  badge?: string;
  index: number;
  cardHeight: number | null;
  isChristmasMode: boolean;
}

export function ActionCard({
  title,
  description,
  href,
  icon: Icon,
  badge,
  index,
  cardHeight,
  isChristmasMode,
}: ActionCardProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className={`group relative flex h-full flex-col items-center justify-center gap-3 rounded-2xl p-5 shadow-2xl transition-all hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 animate-home-card ${
        isChristmasMode
          ? 'bg-white/5 backdrop-blur-xl border border-[#d4af37]/40 hover:bg-white/10 hover:border-[#d4af37]/70 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] focus-visible:ring-[#d4af37] focus-visible:ring-offset-[#051a0e]'
          : 'bg-white text-[#1F2A44] border border-gray-300 hover:border-gray-400 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] focus-visible:ring-primary focus-visible:ring-offset-[#F5F2EB]'
      }`}
      style={{
        ...(cardHeight ? { height: `${cardHeight}px` } : {}),
        animationDelay: `${index * 60}ms`,
      }}
      aria-label={title}
    >
      {/* バッジ表示 */}
      {badge && (
        <div className="absolute -top-1 -right-1 z-20 animate-pulse-scale sm:-top-2 sm:-right-2">
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] whitespace-nowrap font-bold text-white shadow-lg ${
              badge === 'NEW' ? 'new-label-gradient' : 'completed-label-gradient'
            } ring-2 ring-white/20 sm:px-3 sm:py-1`}
          >
            <BsStars className="text-[10px]" />
            {badge}
          </span>
        </div>
      )}
      {/* クリスマス飾りの装飾 */}
      {isChristmasMode && (
        <div className="absolute top-2 right-2 opacity-40 group-hover:opacity-100 transition-opacity">
          <FaHollyBerry className="text-[#d4af37] text-[10px]" />
        </div>
      )}

      <span
        className={`relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${
          isChristmasMode
            ? 'bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 text-[#d4af37] border border-[#d4af37]/30 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] shadow-[0_0_15px_rgba(212,175,55,0.1)]'
            : 'bg-primary/10 text-primary group-hover:bg-primary/15'
        }`}
      >
        <Icon className="h-8 w-8 relative z-10" />
        {isChristmasMode && (
          <div className="absolute inset-0 bg-[#d4af37]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
        )}
      </span>
      <div className="space-y-1 text-center relative z-10">
        <p
          className={`font-bold transition-colors ${
            isChristmasMode ? 'text-[#f8f1e7] group-hover:text-[#d4af37]' : 'text-slate-900'
          } ${title === 'ハンドピックタイマー' ? 'text-xs md:text-sm' : 'text-base md:text-lg'}`}
        >
          {title}
        </p>
        <p
          className={`text-xs transition-colors ${
            isChristmasMode ? 'text-[#f8f1e7]/60 group-hover:text-[#f8f1e7]/90' : 'text-slate-500'
          } md:text-sm`}
        >
          {description}
        </p>
      </div>

      {/* カード下部のゴールドライン */}
      {isChristmasMode && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      )}
    </button>
  );
}
