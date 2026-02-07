'use client';

import { useRouter } from 'next/navigation';
import type { IconType } from 'react-icons';
import { BsStars } from 'react-icons/bs';

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: IconType;
  badge?: string;
  index: number;
  cardHeight: number | null;
}

export function ActionCard({
  title,
  description,
  href,
  icon: Icon,
  badge,
  index,
  cardHeight,
}: ActionCardProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="group relative flex h-full flex-col items-center justify-center gap-3 rounded-2xl p-5 shadow-2xl transition-all hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 animate-home-card bg-surface text-ink border border-edge-strong hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] focus-visible:ring-primary"
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

      <span
        className="relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 bg-primary/10 text-primary group-hover:bg-primary/15"
      >
        <Icon className="h-8 w-8 relative z-10" />
      </span>
      <div className="space-y-1 text-center relative z-10">
        <p
          className={`font-bold transition-colors text-ink group-hover:text-spot ${title === 'ハンドピックタイマー' ? 'text-xs md:text-sm' : 'text-base md:text-lg'}`}
        >
          {title}
        </p>
        <p
          className="text-xs transition-colors text-ink-muted md:text-sm"
        >
          {description}
        </p>
      </div>
    </button>
  );
}
