'use client';

import Link from 'next/link';
import { IoArrowBack } from 'react-icons/io5';

export interface FloatingNavProps {
  backHref?: string;
  right?: React.ReactNode;
  className?: string;
}

export function FloatingNav({ backHref, right, className = '' }: FloatingNavProps) {
  return (
    <>
      {backHref && (
        <Link
          href={backHref}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50
            w-11 h-11 flex items-center justify-center
            bg-surface/80 backdrop-blur-sm shadow-md rounded-full
            text-ink-sub hover:text-ink hover:bg-surface
            transition-colors"
          aria-label="戻る"
        >
          <IoArrowBack size={22} />
        </Link>
      )}

      {right && (
        <div
          className={`fixed top-3 right-3 sm:top-4 sm:right-4 z-50
            flex items-center gap-2 sm:gap-3 ${className}`}
        >
          {right}
        </div>
      )}
    </>
  );
}
