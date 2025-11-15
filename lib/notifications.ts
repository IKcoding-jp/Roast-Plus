/**
 * 通知・アラーム機能
 * Web Notifications APIを使用
 */

// スケジュールされた通知IDの管理
const scheduledNotificationIds = new Set<number>();

/**
 * 通知権限をリクエスト
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notification permission has been denied');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

/**
 * 通知を表示
 * 
 * @param title 通知のタイトル
 * @param options 通知のオプション
 */
export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    const notification = new Notification(title, {
      body: options?.body || 'ローストタイマーが完了しました',
      icon: options?.icon || '/icon-192x192.png',
      badge: options?.badge || '/icon-192x192.png',
      tag: options?.tag || 'roast-timer',
      requireInteraction: options?.requireInteraction !== false,
      ...options,
    });

    // 通知をクリックしたら閉じる
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // 5秒後に自動的に閉じる
    setTimeout(() => {
      notification.close();
    }, 5000);
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

/**
 * スケジュール通知を設定
 * 
 * @param notificationId 通知ID（2=手動、3=おすすめ）
 * @param scheduledTime 通知を表示する時刻（ミリ秒）
 */
export async function scheduleNotification(
  notificationId: number,
  scheduledTime: number
): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    // Service Workerを使用したスケジュール通知
    // 現在の実装では、Service Workerの登録が必要
    if ('serviceWorker' in navigator && 'Notification' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // 通知をスケジュール（実際の実装はService Worker側で行う）
        // ここでは通知IDを記録
        scheduledNotificationIds.add(notificationId);
        
        // タイマー完了時刻に通知を表示するための処理
        // 実際の実装では、Service WorkerのpostMessageを使用
        const delay = scheduledTime - Date.now();
        if (delay > 0) {
          setTimeout(async () => {
            await showNotification('🔥 焙煎完了！', {
              body: 'タッパーと木べらを持って焙煎室に行きましょう。',
              tag: `roast-timer-${notificationId}`,
              requireInteraction: true,
            });
            scheduledNotificationIds.delete(notificationId);
          }, delay);
        }
      } catch (error) {
        console.error('Failed to schedule notification:', error);
      }
    }
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
}

/**
 * すべてのスケジュール通知をキャンセル
 */
export function cancelAllScheduledNotifications(): void {
  scheduledNotificationIds.clear();
  // Service Workerを使用している場合は、Service Workerにも通知を送信
}

/**
 * ローストタイマー完了時の通知
 */
export async function notifyRoastTimerComplete(): Promise<void> {
  // すべてのスケジュール通知をキャンセル
  cancelAllScheduledNotifications();

  // 通知を表示
  await showNotification('🔥 焙煎完了！', {
    body: 'タッパーと木べらを持って焙煎室に行きましょう。',
    tag: 'roast-timer-complete',
    requireInteraction: true,
  });
}

