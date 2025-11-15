'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAppData } from './useAppData';

/**
 * アプリライフサイクル管理フック
 * バックグラウンド移行とフォアグラウンド復帰時の処理を管理
 */
export function useAppLifecycle() {
  const pathname = usePathname();
  const { data } = useAppData();
  const isRoastTimerPageRef = useRef(false);
  const hasCheckedCompletionRef = useRef(false);

  useEffect(() => {
    isRoastTimerPageRef.current = pathname === '/roast-timer';
  }, [pathname]);

  useEffect(() => {
    // ページが最前面にあるかどうかをチェック
    const checkVisibility = () => {
      if (document.visibilityState === 'visible' && isRoastTimerPageRef.current) {
        // フォアグラウンド復帰時に完了状態をチェック
        if (data.roastTimerState?.status === 'completed' && !hasCheckedCompletionRef.current) {
          hasCheckedCompletionRef.current = true;
          // 完了ダイアログはRoastTimerコンポーネント側で表示される
          // ここでは完了状態の検出のみを行う
        }
      } else {
        hasCheckedCompletionRef.current = false;
      }
    };

    // ページの可視性が変更された時にチェック
    document.addEventListener('visibilitychange', checkVisibility);

    // 初回チェック
    checkVisibility();

    return () => {
      document.removeEventListener('visibilitychange', checkVisibility);
    };
  }, [data.roastTimerState]);
}

