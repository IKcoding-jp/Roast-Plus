import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDefectBeans } from './useDefectBeans';
import type { AppData, User } from '@/types';

// モック関数（vi.mockファクトリ内で参照可能なようにmockプレフィックスを使用）
const mockUseAuth = vi.fn();
const mockGetDefectBeanMasterData = vi.fn();
const mockUseAppData = vi.fn();

vi.mock('@/lib/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/lib/firestore', () => ({
  getDefectBeanMasterData: () => mockGetDefectBeanMasterData(),
  updateDefectBeanMaster: vi.fn().mockResolvedValue(undefined),
  deleteDefectBeanMaster: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/storage', () => ({
  uploadDefectBeanImage: vi.fn().mockResolvedValue('https://example.com/image.jpg'),
  deleteDefectBeanImage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./useAppData', () => ({
  useAppData: () => mockUseAppData(),
}));

const INITIAL_APP_DATA: AppData = {
  todaySchedules: [],
  roastSchedules: [],
  tastingSessions: [],
  tastingRecords: [],
  notifications: [],
  encouragementCount: 0,
  roastTimerRecords: [],
  workProgresses: [],
};

const mockUser: User = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
};

describe('useDefectBeans - isLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false });
    mockGetDefectBeanMasterData.mockResolvedValue([]);
    mockUseAppData.mockReturnValue({
      data: INITIAL_APP_DATA,
      updateData: vi.fn(),
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('useAppData.isLoading が true の間は isLoading = true を返す', async () => {
    // appDataLoadingがtrueの状態をモック
    mockUseAppData.mockReturnValue({
      data: INITIAL_APP_DATA,
      updateData: vi.fn(),
      isLoading: true,
    });

    const { result } = renderHook(() => useDefectBeans());

    // マスターデータのロード完了を待つ
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // appDataLoading が true なので isLoading は true のままであるべき
    expect(result.current.isLoading).toBe(true);
  });

  it('両方のロードが完了したら isLoading = false を返す', async () => {
    // appDataLoadingがfalseの状態をモック
    mockUseAppData.mockReturnValue({
      data: INITIAL_APP_DATA,
      updateData: vi.fn(),
      isLoading: false,
    });

    const { result } = renderHook(() => useDefectBeans());

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // 両方のロードが完了しているので isLoading = false
    expect(result.current.isLoading).toBe(false);
  });

  it('マスターデータのロード中は isLoading = true を返す（認証完了後）', async () => {
    // マスターデータのロードが遅延するモック
    mockGetDefectBeanMasterData.mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useDefectBeans());

    // まだロード中
    expect(result.current.isLoading).toBe(true);
  });
});
