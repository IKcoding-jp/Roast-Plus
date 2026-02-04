import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRoastTimer } from './useRoastTimer';
import type { AppData, User } from '@/types';

// モック関数
const mockUseAuth = vi.fn();
const mockGetDeviceId = vi.fn();
const mockEnsureServerTimeSync = vi.fn();
const mockSetTimeSyncUser = vi.fn();

// 子フックのモック
const mockUseTimerState = vi.fn();
const mockUseTimerNotifications = vi.fn();
const mockUseTimerPersistence = vi.fn();
const mockUseTimerControls = vi.fn();

// モックデータ
const mockUser: User = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
};

const mockAppData: AppData = {
  roastRecords: [],
  extractionRecords: [],
  beanInventory: [],
  roastSchedules: [],
  roastSettings: {
    notifications: {
      enabled: false,
      timings: [],
    },
  },
  extractionSettings: {
    notifications: {
      enabled: false,
    },
  },
  clockSettings: {
    theme: 'dark',
    font: 'digital',
  },
  consent: {
    hasAgreed: true,
    agreedAt: '2024-01-01T00:00:00.000Z',
    agreedTermsVersion: '1.0.0',
    agreedPrivacyVersion: '1.0.0',
  },
};

const mockStateManager = {
  localState: {
    status: 'idle' as const,
    elapsedMs: 0,
    targetMs: 0,
  },
};

const mockNotifications = {
  stopSound: vi.fn(),
};

const mockControls = {
  startTimer: vi.fn(),
  pauseTimer: vi.fn(),
  resumeTimer: vi.fn(),
  resetTimer: vi.fn(),
  skipTimer: vi.fn(),
};

// モック設定
vi.mock('@/lib/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/lib/localStorage', () => ({
  getDeviceId: () => mockGetDeviceId(),
}));

vi.mock('@/lib/timeSync', () => ({
  ensureServerTimeSync: () => mockEnsureServerTimeSync(),
  setTimeSyncUser: (userId: string | null) => mockSetTimeSyncUser(userId),
}));

vi.mock('./roast-timer/useTimerState', () => ({
  useTimerState: () => mockUseTimerState(),
}));

vi.mock('./roast-timer/useTimerNotifications', () => ({
  useTimerNotifications: () => mockUseTimerNotifications(),
}));

vi.mock('./roast-timer/useTimerPersistence', () => ({
  useTimerPersistence: (args: any) => mockUseTimerPersistence(args),
}));

vi.mock('./roast-timer/useTimerControls', () => ({
  useTimerControls: (args: any) => mockUseTimerControls(args),
}));

describe('useRoastTimer', () => {
  const mockUpdateData = vi.fn();

  beforeEach(() => {
    // デフォルトのモック実装
    mockUseAuth.mockReturnValue({ user: mockUser });
    mockGetDeviceId.mockReturnValue('device-123');
    mockEnsureServerTimeSync.mockResolvedValue(undefined);
    mockSetTimeSyncUser.mockImplementation(() => {});

    mockUseTimerState.mockReturnValue(mockStateManager);
    mockUseTimerNotifications.mockReturnValue(mockNotifications);
    mockUseTimerPersistence.mockImplementation(() => {});
    mockUseTimerControls.mockReturnValue(mockControls);

    mockUpdateData.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('初期化', () => {
    it('認証ユーザーがいる場合、時刻同期を初期化する', async () => {
      renderHook(() =>
        useRoastTimer({
          data: mockAppData,
          updateData: mockUpdateData,
          isLoading: false,
        })
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockSetTimeSyncUser).toHaveBeenCalledWith('test-user-id');
      expect(mockEnsureServerTimeSync).toHaveBeenCalled();
    });

    it('認証ユーザーがいない場合、時刻同期をスキップする', async () => {
      mockUseAuth.mockReturnValue({ user: null });

      renderHook(() =>
        useRoastTimer({
          data: mockAppData,
          updateData: mockUpdateData,
          isLoading: false,
        })
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockSetTimeSyncUser).toHaveBeenCalledWith(null);
      expect(mockEnsureServerTimeSync).not.toHaveBeenCalled();
    });

    it('時刻同期エラーをログに記録する', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Sync failed');
      mockEnsureServerTimeSync.mockRejectedValue(error);

      renderHook(() =>
        useRoastTimer({
          data: mockAppData,
          updateData: mockUpdateData,
          isLoading: false,
        })
      );

      await act(async () => {
        await Promise.resolve();
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to initialize roast timer time-sync:',
        error
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('子フックの統合', () => {
    it('useTimerStateを呼び出す', () => {
      renderHook(() =>
        useRoastTimer({
          data: mockAppData,
          updateData: mockUpdateData,
          isLoading: false,
        })
      );

      expect(mockUseTimerState).toHaveBeenCalled();
    });

    it('useTimerNotificationsを呼び出す', () => {
      renderHook(() =>
        useRoastTimer({
          data: mockAppData,
          updateData: mockUpdateData,
          isLoading: false,
        })
      );

      expect(mockUseTimerNotifications).toHaveBeenCalled();
    });

    it('useTimerPersistenceに正しい引数を渡す', () => {
      renderHook(() =>
        useRoastTimer({
          data: mockAppData,
          updateData: mockUpdateData,
          isLoading: false,
        })
      );

      expect(mockUseTimerPersistence).toHaveBeenCalledWith({
        user: mockUser,
        data: mockAppData,
        updateData: mockUpdateData,
        isLoading: false,
        stateManager: mockStateManager,
        currentDeviceId: 'device-123',
      });
    });

    it('useTimerControlsに正しい引数を渡す', () => {
      renderHook(() =>
        useRoastTimer({
          data: mockAppData,
          updateData: mockUpdateData,
          isLoading: false,
        })
      );

      expect(mockUseTimerControls).toHaveBeenCalledWith({
        user: mockUser,
        updateData: mockUpdateData,
        isLoading: false,
        stateManager: mockStateManager,
        notifications: mockNotifications,
        currentDeviceId: 'device-123',
      });
    });
  });

  describe('外部インターフェース', () => {
    it('state を返す', () => {
      const { result } = renderHook(() =>
        useRoastTimer({
          data: mockAppData,
          updateData: mockUpdateData,
          isLoading: false,
        })
      );

      expect(result.current.state).toEqual(mockStateManager.localState);
    });

    it('タイマー制御関数を返す', () => {
      const { result } = renderHook(() =>
        useRoastTimer({
          data: mockAppData,
          updateData: mockUpdateData,
          isLoading: false,
        })
      );

      expect(result.current.startTimer).toBe(mockControls.startTimer);
      expect(result.current.pauseTimer).toBe(mockControls.pauseTimer);
      expect(result.current.resumeTimer).toBe(mockControls.resumeTimer);
      expect(result.current.resetTimer).toBe(mockControls.resetTimer);
      expect(result.current.skipTimer).toBe(mockControls.skipTimer);
    });

    it('stopSound関数を返す', () => {
      const { result } = renderHook(() =>
        useRoastTimer({
          data: mockAppData,
          updateData: mockUpdateData,
          isLoading: false,
        })
      );

      expect(result.current.stopSound).toBe(mockNotifications.stopSound);
    });
  });

  describe('実際のユースケース', () => {
    it('タイマー起動フロー', () => {
      const { result } = renderHook(() =>
        useRoastTimer({
          data: mockAppData,
          updateData: mockUpdateData,
          isLoading: false,
        })
      );

      // タイマーを開始
      act(() => {
        result.current.startTimer(600000); // 10分
      });

      expect(mockControls.startTimer).toHaveBeenCalledWith(600000);
    });

    it('タイマー一時停止フロー', () => {
      const { result } = renderHook(() =>
        useRoastTimer({
          data: mockAppData,
          updateData: mockUpdateData,
          isLoading: false,
        })
      );

      // タイマーを一時停止
      act(() => {
        result.current.pauseTimer();
      });

      expect(mockControls.pauseTimer).toHaveBeenCalled();
    });

    it('サウンド停止フロー', () => {
      const { result } = renderHook(() =>
        useRoastTimer({
          data: mockAppData,
          updateData: mockUpdateData,
          isLoading: false,
        })
      );

      // サウンドを停止
      act(() => {
        result.current.stopSound();
      });

      expect(mockNotifications.stopSound).toHaveBeenCalled();
    });

    it('ユーザー変更時に時刻同期を再初期化する', async () => {
      const { rerender } = renderHook(
        ({ user }) =>
          useRoastTimer({
            data: mockAppData,
            updateData: mockUpdateData,
            isLoading: false,
          }),
        {
          initialProps: { user: mockUser },
        }
      );

      await act(async () => {
        await Promise.resolve();
      });

      // 初回の呼び出しを確認
      expect(mockSetTimeSyncUser).toHaveBeenCalledWith('test-user-id');
      const initialCallCount = mockEnsureServerTimeSync.mock.calls.length;

      // ユーザーを変更
      const newUser: User = {
        uid: 'new-user-id',
        email: 'new@example.com',
        displayName: 'New User',
      };
      mockUseAuth.mockReturnValue({ user: newUser });

      rerender({ user: newUser });

      await act(async () => {
        await Promise.resolve();
      });

      // 再度呼び出されることを確認
      expect(mockSetTimeSyncUser).toHaveBeenCalledWith('new-user-id');
      expect(mockEnsureServerTimeSync.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });
});
