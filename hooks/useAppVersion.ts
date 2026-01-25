'use client';

import { useState, useEffect, useCallback } from 'react';
import { APP_VERSION } from '@/lib/version';

/**
 * アプリのバージョン情報とService Worker更新状態を管理するカスタムフック
 *
 * バージョンはlib/version.tsのAPP_VERSIONから取得します。
 * このファイルはGitHub Actionsによって自動更新されます。
 */
export function useAppVersion() {
  const [version] = useState<string>(APP_VERSION);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Service Worker更新の検出
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // 本番環境でのみ動作
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    let registration: ServiceWorkerRegistration | null | undefined = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const checkForUpdate = async () => {
      try {
        registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          return;
        }

        // 待機中のService Workerがあるかチェック
        if (registration.waiting) {
          setIsUpdateAvailable(true);
          return;
        }

        // インストール中のService Workerがあるかチェック
        if (registration.installing) {
          const installingWorker = registration.installing;
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && registration?.waiting) {
              setIsUpdateAvailable(true);
            }
          });
        }
      } catch (error) {
        console.error('Service Worker更新チェックエラー:', error);
      }
    };

    const setupUpdateListener = async () => {
      try {
        registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          return;
        }

        // 更新検出イベントを監視
        registration.addEventListener('updatefound', () => {
          const newWorker = registration?.installing;
          if (!newWorker) {
            return;
          }

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              // アクティブなService Workerがない場合（初回インストール）は更新として扱わない
              if (registration?.active) {
                setIsUpdateAvailable(true);
              }
            }
          });
        });

        // 初回チェック
        await checkForUpdate();
      } catch (error) {
        console.error('Service Worker設定エラー:', error);
      }
    };

    // Service Workerが準備できたら設定
    navigator.serviceWorker.ready
      .then(() => {
        setupUpdateListener();
      })
      .catch((error) => {
        console.error('Service Worker readyエラー:', error);
      });

    // 定期的に更新をチェック（5分ごと）
    intervalId = setInterval(async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          // 更新後、待機中のService Workerがあるかチェック
          if (reg.waiting) {
            setIsUpdateAvailable(true);
          }
        }
      } catch (error) {
        console.error('Service Worker更新エラー:', error);
      }
    }, 5 * 60 * 1000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // 手動で更新をチェックする関数
  const checkForUpdates = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    setIsChecking(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        
        // 更新後、待機中のService Workerがあるかチェック
        if (registration.waiting) {
          setIsUpdateAvailable(true);
        }
      }
    } catch (error) {
      console.error('更新チェックエラー:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // 更新を適用する関数（ページをリロード）
  const applyUpdate = useCallback(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration?.waiting) {
        // 待機中のService Workerにメッセージを送信してスキップ待機を促す
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      // ページをリロード
      window.location.reload();
    });
  }, []);

  return {
    version,
    isUpdateAvailable,
    isChecking,
    checkForUpdates,
    applyUpdate,
  };
}

