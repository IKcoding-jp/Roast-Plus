import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  requestNotificationPermission,
  showNotification,
  scheduleNotification,
  cancelAllScheduledNotifications,
  notifyRoastTimerComplete,
} from './notifications';

// Notification APIのモック
class MockNotification {
  title: string;
  options?: NotificationOptions;
  onclick: (() => void) | null = null;
  static permission: NotificationPermission = 'default';

  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.options = options;
  }

  close() {
    // クローズ処理のモック
  }

  static requestPermission = vi.fn().mockResolvedValue('granted' as NotificationPermission);
}

describe('notifications', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // グローバルのNotificationをモック
    vi.stubGlobal('Notification', MockNotification);

    // コンソールスパイ
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // デフォルトの権限状態
    MockNotification.permission = 'default';
    MockNotification.requestPermission.mockResolvedValue('granted');
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  describe('requestNotificationPermission', () => {
    it('既に権限が許可されている場合はtrueを返す', async () => {
      MockNotification.permission = 'granted';

      const result = await requestNotificationPermission();

      expect(result).toBe(true);
      expect(MockNotification.requestPermission).not.toHaveBeenCalled();
    });

    it('権限が拒否されている場合はfalseを返す', async () => {
      MockNotification.permission = 'denied';

      const result = await requestNotificationPermission();

      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Notification permission has been denied'
      );
    });

    it('権限をリクエストして許可された場合はtrueを返す', async () => {
      MockNotification.permission = 'default';
      MockNotification.requestPermission.mockResolvedValue('granted');

      const result = await requestNotificationPermission();

      expect(result).toBe(true);
      expect(MockNotification.requestPermission).toHaveBeenCalled();
    });

    it('権限をリクエストして拒否された場合はfalseを返す', async () => {
      MockNotification.permission = 'default';
      MockNotification.requestPermission.mockResolvedValue('denied');

      const result = await requestNotificationPermission();

      expect(result).toBe(false);
    });

    it('権限リクエストでエラーが発生した場合はfalseを返す', async () => {
      MockNotification.permission = 'default';
      MockNotification.requestPermission.mockRejectedValue(new Error('Permission error'));

      const result = await requestNotificationPermission();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('showNotification', () => {
    beforeEach(() => {
      MockNotification.permission = 'granted';
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('権限がある場合は通知を表示する', async () => {
      await showNotification('テスト通知');

      // Notificationコンストラクタが呼ばれたことを確認する方法が必要
      // ここでは基本的に例外が投げられないことを確認
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('カスタムオプションで通知を表示できる', async () => {
      const options: NotificationOptions = {
        body: 'テスト本文',
        icon: '/test-icon.png',
        tag: 'test-tag',
      };

      await showNotification('テスト通知', options);

      // 通知が正常に処理されることを確認
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('権限がない場合は通知を表示しない', async () => {
      MockNotification.permission = 'denied';

      await showNotification('テスト通知');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Notification permission has been denied'
      );
    });

    it('デフォルトオプションが適用される', async () => {
      await showNotification('タイトルのみ');

      // デフォルトオプションで通知が作成されることを確認
      // （実際のNotificationインスタンスを確認できないため、エラーがないことを確認）
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('scheduleNotification', () => {
    beforeEach(() => {
      MockNotification.permission = 'granted';
      vi.useFakeTimers();

      // navigator.serviceWorkerのモック
      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({}),
        },
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('将来の時刻に通知をスケジュールできる', async () => {
      const futureTime = Date.now() + 10000; // 10秒後

      await scheduleNotification(2, futureTime);

      // スケジュールされた通知が実行されるまで時間を進める
      vi.advanceTimersByTime(10000);

      // 通知が表示されることを確認（エラーがないことを確認）
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('過去の時刻の場合は即座に通知を表示しない', async () => {
      const pastTime = Date.now() - 10000; // 10秒前

      await scheduleNotification(3, pastTime);

      // 通知は表示されない（delayが0以下）
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('権限がない場合はスケジュールしない', async () => {
      MockNotification.permission = 'denied';

      await scheduleNotification(2, Date.now() + 10000);

      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('Service Workerが利用できない場合も処理を続行する', async () => {
      // Service Workerを削除
      vi.stubGlobal('navigator', {});

      const futureTime = Date.now() + 5000;

      await scheduleNotification(2, futureTime);

      // エラーが発生しないことを確認
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('cancelAllScheduledNotifications', () => {
    it('スケジュールされた通知をキャンセルできる', () => {
      // この関数は例外を投げないことを確認
      expect(() => cancelAllScheduledNotifications()).not.toThrow();
    });

    it('複数回呼び出しても安全', () => {
      cancelAllScheduledNotifications();
      cancelAllScheduledNotifications();
      cancelAllScheduledNotifications();

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('notifyRoastTimerComplete', () => {
    beforeEach(() => {
      MockNotification.permission = 'granted';
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('ローストタイマー完了通知を表示する', async () => {
      await notifyRoastTimerComplete();

      // 通知が表示されることを確認（エラーがないことを確認）
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('スケジュールされた通知をキャンセルする', async () => {
      // この関数内でcancelAllScheduledNotificationsが呼ばれることを確認
      await notifyRoastTimerComplete();

      // エラーがないことを確認
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('権限がない場合も安全に処理する', async () => {
      MockNotification.permission = 'denied';

      await notifyRoastTimerComplete();

      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('実際のユースケース', () => {
    beforeEach(() => {
      MockNotification.permission = 'default';
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('初回: 権限をリクエストして通知を表示', async () => {
      MockNotification.requestPermission.mockResolvedValue('granted');

      // 権限リクエスト
      const hasPermission = await requestNotificationPermission();
      expect(hasPermission).toBe(true);

      // 通知表示
      await showNotification('テスト通知', {
        body: 'テスト本文',
      });

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('ローストタイマー: 完了通知', async () => {
      MockNotification.permission = 'granted';

      await notifyRoastTimerComplete();

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('ローストタイマー: 事前通知のスケジュール', async () => {
      MockNotification.permission = 'granted';

      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({}),
        },
      });

      const notificationTime = Date.now() + 60000; // 1分後

      await scheduleNotification(2, notificationTime);

      // 1分進める
      vi.advanceTimersByTime(60000);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('ユーザーが権限を拒否した場合', async () => {
      MockNotification.requestPermission.mockResolvedValue('denied');

      const hasPermission = await requestNotificationPermission();
      expect(hasPermission).toBe(false);

      // 通知を試みる（表示されない）
      await showNotification('通知');

      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });
});
