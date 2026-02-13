'use client';

import { useRouter } from 'next/navigation';
import { FaTree, FaStar } from 'react-icons/fa';
import { HiClock } from 'react-icons/hi';
import { useChristmasMode } from '@/hooks/useChristmasMode';

export function HomeHeader() {
  const router = useRouter();
  const { isChristmasMode } = useChristmasMode();

  return (
    <header className="shrink-0 relative z-50 transition-all duration-1000 bg-header-bg shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* ロゴ */}
        <div className="flex items-center gap-2.5 cursor-default select-none group">
          {isChristmasMode ? (
            <div className="flex items-center gap-1">
              <div className="relative flex items-center justify-center p-1">
                <FaTree className="text-[#1a472a] text-2xl md:text-4xl drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-700 group-hover:scale-105" />
                <FaStar className="absolute -top-0.5 text-[#ffcc33] text-[10px] animate-pulse drop-shadow-[0_0_8px_#ffcc33]" />
                <div className="absolute top-[35%] left-[45%] w-1 h-1 bg-[#e23636] rounded-full shadow-[0_0_6px_#e23636] animate-pulse"></div>
                <div className="absolute top-[55%] right-[35%] w-1 h-1 bg-[#d4af37] rounded-full shadow-[0_0_6px_#d4af37] animate-pulse [animation-delay:0.3s]"></div>
                <div className="absolute top-[70%] left-[38%] w-0.5 h-0.5 bg-[#f8f1e7] rounded-full shadow-[0_0_4px_white] animate-pulse [animation-delay:0.6s]"></div>
              </div>

              <div className="relative flex flex-col items-center">
                <span className="text-2xl md:text-4xl tracking-[0.08em] flex items-center leading-none font-[var(--font-playfair)] italic">
                  <span className="text-[#e23636] relative drop-shadow-[0_0_10px_rgba(226,54,54,0.3)] font-bold">
                    R
                  </span>
                  <span className="text-[#f8f1e7] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">oast</span>
                  <span className="text-[#d4af37] ml-1 font-bold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">Plus</span>
                </span>
                <div className="w-full h-[1.5px] mt-0.5 bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent shadow-[0_1px_8px_rgba(212,175,55,0.4)]"></div>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline gap-[3px]">
              <span className="text-2xl md:text-3xl font-[var(--font-inter)] font-semibold tracking-tight text-header-text leading-none">
                Roast
              </span>
              <span className="text-2xl md:text-3xl font-[var(--font-inter)] font-bold tracking-tight text-header-accent leading-none">
                Plus
              </span>
            </div>
          )}
        </div>

        {/* ボタン群 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/clock')}
            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl p-2 transition-all text-header-text/70 hover:text-header-text hover:bg-header-btn-hover active:scale-95"
            aria-label="デジタル時計を表示"
            title="デジタル時計"
          >
            <HiClock className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* クリスマスモードのアクセントライン */}
      {isChristmasMode && (
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent shadow-[0_-1px_10px_rgba(212,175,55,0.3)]"></div>
      )}
    </header>
  );
}
