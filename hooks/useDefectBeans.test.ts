import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDefectBeans } from './useDefectBeans';
import type { AppData, User, DefectBean } from '@/types';

// モック関数（vi.mockファクトリ内で参照可能なようにmockプレフィックスを使用）
const mockUseAuth = vi.fn();
const mockGetDefectBeanMasterData = vi.fn();
const mockUpdateDefectBeanMaster = vi.fn();
const mockDeleteDefectBeanMaster = vi.fn();
const mockUploadDefectBeanImage = vi.fn();
const mockDeleteDefectBeanImage = vi.fn();
const mockUseAppData = vi.fn();
const mockUpdateData = vi.fn();
const mockCompressImage = vi.fn();

vi.mock('@/lib/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/lib/firestore', () => ({
  getDefectBeanMasterData: (...args: unknown[]) => mockGetDefectBeanMasterData(...args),
  updateDefectBeanMaster: (...args: unknown[]) => mockUpdateDefectBeanMaster(...args),
  deleteDefectBeanMaster: (...args: unknown[]) => mockDeleteDefectBeanMaster(...args),
}));

vi.mock('@/lib/storage', () => ({
  uploadDefectBeanImage: (...args: unknown[]) => mockUploadDefectBeanImage(...args),
  deleteDefectBeanImage: (...args: unknown[]) => mockDeleteDefectBeanImage(...args),
}));

vi.mock('./useAppData', () => ({
  useAppData: () => mockUseAppData(),
}));

vi.mock('@/lib/imageCompression', () => ({
  compressImage: (...args: unknown[]) => mockCompressImage(...args),
}));

// テストフィクスチャ
const MASTER_BEAN: DefectBean = {
  id: 'master-1',
  name: 'カビ豆',
  imageUrl: 'https://example.com/master-1.jpg',
  characteristics: 'カビが生えた豆',
  tasteImpact: '不快な味',
  removalReason: 'カビは品質を著しく低下させる',
  isMaster: true,
  order: 1,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const MASTER_BEAN_2: DefectBean = {
  id: 'master-2',
  name: '虫食い豆',
  imageUrl: 'https://example.com/master-2.jpg',
  characteristics: '虫に食われた痕がある',
  tasteImpact: '異臭',
  removalReason: '虫食いは品質を低下させる',
  isMaster: true,
  order: 2,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const USER_BEAN: DefectBean = {
  id: 'user_1700000000000_abc123def',
  name: 'ユーザー追加豆',
  imageUrl: 'https://example.com/user-bean.jpg',
  characteristics: 'テスト特徴',
  tasteImpact: 'テスト影響',
  removalReason: 'テスト理由',
  isMaster: false,
  userId: 'test-user-id',
  createdAt: '2024-06-01T00:00:00.000Z',
  updatedAt: '2024-06-01T00:00:00.000Z',
};

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

// ヘルパー: フックのマスターデータロード完了を待つ
async function waitForMasterDataLoad() {
  await act(async () => {
    await vi.runAllTimersAsync();
  });
}

describe('useDefectBeans - isLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false });
    mockGetDefectBeanMasterData.mockResolvedValue([]);
    mockUseAppData.mockReturnValue({
      data: INITIAL_APP_DATA,
      updateData: mockUpdateData,
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
      updateData: mockUpdateData,
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
      updateData: mockUpdateData,
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

describe('useDefectBeans - マスターデータのロード', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false });
    mockGetDefectBeanMasterData.mockResolvedValue([]);
    mockUpdateData.mockResolvedValue(undefined);
    mockUseAppData.mockReturnValue({
      data: INITIAL_APP_DATA,
      updateData: mockUpdateData,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('authLoading中はマスターデータを取得しない', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    expect(mockGetDefectBeanMasterData).not.toHaveBeenCalled();
  });

  it('ユーザー未認証時はmasterLoadingをfalseにしてデータ取得しない', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    expect(mockGetDefectBeanMasterData).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.masterDefectBeans).toEqual([]);
  });

  it('認証済みユーザーで正常にマスターデータを取得する', async () => {
    mockGetDefectBeanMasterData.mockResolvedValue([MASTER_BEAN, MASTER_BEAN_2]);

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    expect(mockGetDefectBeanMasterData).toHaveBeenCalledTimes(1);
    expect(result.current.masterDefectBeans).toEqual([MASTER_BEAN, MASTER_BEAN_2]);
    expect(result.current.isLoading).toBe(false);
  });

  it('マスターデータ取得エラー時は空配列を設定する', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetDefectBeanMasterData.mockRejectedValue(new Error('Firestore error'));

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    expect(result.current.masterDefectBeans).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load master defect beans:',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  it('ユーザー変更時にマスターデータを再取得する', async () => {
    mockGetDefectBeanMasterData.mockResolvedValue([MASTER_BEAN]);

    const { result, rerender } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    expect(result.current.masterDefectBeans).toEqual([MASTER_BEAN]);

    // ユーザー変更をシミュレート
    const newUser = { uid: 'new-user-id', email: 'new@example.com', displayName: 'New User' };
    mockUseAuth.mockReturnValue({ user: newUser, loading: false });
    mockGetDefectBeanMasterData.mockResolvedValue([MASTER_BEAN, MASTER_BEAN_2]);

    rerender();

    await waitForMasterDataLoad();

    expect(mockGetDefectBeanMasterData).toHaveBeenCalledTimes(2);
    expect(result.current.masterDefectBeans).toEqual([MASTER_BEAN, MASTER_BEAN_2]);
  });
});

describe('useDefectBeans - getAllDefectBeans / 返却値', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false });
    mockGetDefectBeanMasterData.mockResolvedValue([MASTER_BEAN]);
    mockUpdateData.mockResolvedValue(undefined);
    mockUseAppData.mockReturnValue({
      data: { ...INITIAL_APP_DATA, defectBeans: [USER_BEAN] },
      updateData: mockUpdateData,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('マスターとユーザーデータを結合して返す', async () => {
    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    expect(result.current.allDefectBeans).toEqual([MASTER_BEAN, USER_BEAN]);
  });

  it('ユーザーデータがない場合はマスターのみ返す', async () => {
    mockUseAppData.mockReturnValue({
      data: INITIAL_APP_DATA,
      updateData: mockUpdateData,
      isLoading: false,
    });

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    expect(result.current.allDefectBeans).toEqual([MASTER_BEAN]);
    expect(result.current.userDefectBeans).toEqual([]);
  });

  it('マスターデータがない場合はユーザーのみ返す', async () => {
    mockGetDefectBeanMasterData.mockResolvedValue([]);

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    expect(result.current.allDefectBeans).toEqual([USER_BEAN]);
    expect(result.current.masterDefectBeans).toEqual([]);
  });

  it('masterDefectBeansが正しく返される', async () => {
    mockGetDefectBeanMasterData.mockResolvedValue([MASTER_BEAN, MASTER_BEAN_2]);

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    expect(result.current.masterDefectBeans).toEqual([MASTER_BEAN, MASTER_BEAN_2]);
  });

  it('userDefectBeansが正しく返される', async () => {
    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    expect(result.current.userDefectBeans).toEqual([USER_BEAN]);
  });

  it('defectBeansがundefinedの場合はuserDefectBeansが空配列を返す', async () => {
    mockUseAppData.mockReturnValue({
      data: { ...INITIAL_APP_DATA, defectBeans: undefined },
      updateData: mockUpdateData,
      isLoading: false,
    });

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    expect(result.current.userDefectBeans).toEqual([]);
  });
});

describe('useDefectBeans - addDefectBean', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T00:00:00.000Z'));
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false });
    mockGetDefectBeanMasterData.mockResolvedValue([]);
    mockUpdateData.mockResolvedValue(undefined);
    mockUploadDefectBeanImage.mockResolvedValue('https://example.com/uploaded.jpg');
    mockCompressImage.mockImplementation((file: File) => Promise.resolve(file));
    mockUseAppData.mockReturnValue({
      data: INITIAL_APP_DATA,
      updateData: mockUpdateData,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('未認証時にエラーをスローする', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const beanData = {
      name: 'テスト豆',
      characteristics: 'テスト特徴',
      tasteImpact: 'テスト影響',
      removalReason: 'テスト理由',
    };

    await expect(
      act(async () => {
        await result.current.addDefectBean(beanData, imageFile);
      })
    ).rejects.toThrow('User not authenticated');
  });

  it('正常に欠点豆を追加する（画像アップロード + updateData）', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const beanData = {
      name: '新しい欠点豆',
      characteristics: '新しい特徴',
      tasteImpact: '新しい影響',
      removalReason: '新しい理由',
    };

    await act(async () => {
      await result.current.addDefectBean(beanData, imageFile);
    });

    // 画像アップロードが呼ばれた
    expect(mockUploadDefectBeanImage).toHaveBeenCalledWith(
      'test-user-id',
      expect.stringMatching(/^user_\d+_/),
      imageFile
    );

    // updateDataが呼ばれた
    expect(mockUpdateData).toHaveBeenCalledTimes(1);

    // updateDataのコールバックを検証
    const updater = mockUpdateData.mock.calls[0][0];
    const updatedData = updater(INITIAL_APP_DATA);
    expect(updatedData.defectBeans).toHaveLength(1);
    expect(updatedData.defectBeans[0]).toMatchObject({
      name: '新しい欠点豆',
      characteristics: '新しい特徴',
      tasteImpact: '新しい影響',
      removalReason: '新しい理由',
      imageUrl: 'https://example.com/uploaded.jpg',
      isMaster: false,
      userId: 'test-user-id',
    });

    vi.spyOn(Math, 'random').mockRestore();
  });

  it('生成IDがuser_プレフィックスを持つ', async () => {
    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const beanData = {
      name: 'テスト豆',
      characteristics: 'テスト特徴',
      tasteImpact: 'テスト影響',
      removalReason: 'テスト理由',
    };

    await act(async () => {
      await result.current.addDefectBean(beanData, imageFile);
    });

    const updater = mockUpdateData.mock.calls[0][0];
    const updatedData = updater(INITIAL_APP_DATA);
    expect(updatedData.defectBeans[0].id).toMatch(/^user_\d+_[a-z0-9]+$/);
  });

  it('追加された豆のisMasterがfalse', async () => {
    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const beanData = {
      name: 'テスト豆',
      characteristics: 'テスト特徴',
      tasteImpact: 'テスト影響',
      removalReason: 'テスト理由',
    };

    await act(async () => {
      await result.current.addDefectBean(beanData, imageFile);
    });

    const updater = mockUpdateData.mock.calls[0][0];
    const updatedData = updater(INITIAL_APP_DATA);
    expect(updatedData.defectBeans[0].isMaster).toBe(false);
  });

  it('追加された豆にcreatedAtとupdatedAtが設定される', async () => {
    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const beanData = {
      name: 'テスト豆',
      characteristics: 'テスト特徴',
      tasteImpact: 'テスト影響',
      removalReason: 'テスト理由',
    };

    await act(async () => {
      await result.current.addDefectBean(beanData, imageFile);
    });

    const updater = mockUpdateData.mock.calls[0][0];
    const updatedData = updater(INITIAL_APP_DATA);
    expect(updatedData.defectBeans[0].createdAt).toBe('2024-06-15T00:00:00.000Z');
    expect(updatedData.defectBeans[0].updatedAt).toBe('2024-06-15T00:00:00.000Z');
  });

  it('既存のdefectBeansに追加される', async () => {
    const existingData = { ...INITIAL_APP_DATA, defectBeans: [USER_BEAN] };
    mockUseAppData.mockReturnValue({
      data: existingData,
      updateData: mockUpdateData,
      isLoading: false,
    });

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const beanData = {
      name: '新しい豆',
      characteristics: '新特徴',
      tasteImpact: '新影響',
      removalReason: '新理由',
    };

    await act(async () => {
      await result.current.addDefectBean(beanData, imageFile);
    });

    const updater = mockUpdateData.mock.calls[0][0];
    const updatedData = updater(existingData);
    expect(updatedData.defectBeans).toHaveLength(2);
    expect(updatedData.defectBeans[0]).toEqual(USER_BEAN);
    expect(updatedData.defectBeans[1].name).toBe('新しい豆');
  });

  it('画像アップロード失敗時にエラーをスローする', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockUploadDefectBeanImage.mockRejectedValue(new Error('Upload failed'));

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const beanData = {
      name: 'テスト豆',
      characteristics: 'テスト特徴',
      tasteImpact: 'テスト影響',
      removalReason: 'テスト理由',
    };

    await expect(
      act(async () => {
        await result.current.addDefectBean(beanData, imageFile);
      })
    ).rejects.toThrow('Upload failed');

    expect(mockUpdateData).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('useDefectBeans - updateDefectBean', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T00:00:00.000Z'));
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false });
    mockGetDefectBeanMasterData.mockResolvedValue([MASTER_BEAN]);
    mockUpdateData.mockResolvedValue(undefined);
    mockUpdateDefectBeanMaster.mockResolvedValue(undefined);
    mockUploadDefectBeanImage.mockResolvedValue('https://example.com/new-image.jpg');
    mockDeleteDefectBeanImage.mockResolvedValue(undefined);
    mockCompressImage.mockImplementation((file: File) => Promise.resolve(file));
    mockUseAppData.mockReturnValue({
      data: { ...INITIAL_APP_DATA, defectBeans: [USER_BEAN] },
      updateData: mockUpdateData,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('未認証時にエラーをスローする', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    await expect(
      act(async () => {
        await result.current.updateDefectBean(
          'master-1',
          { name: '更新', characteristics: '', tasteImpact: '', removalReason: '' },
          null
        );
      })
    ).rejects.toThrow('User not authenticated');
  });

  it('存在しない豆のIDでエラーをスローする', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    await expect(
      act(async () => {
        await result.current.updateDefectBean(
          'non-existent-id',
          { name: '更新', characteristics: '', tasteImpact: '', removalReason: '' },
          null
        );
      })
    ).rejects.toThrow('Defect bean not found');

    consoleSpy.mockRestore();
  });

  it('マスター豆を画像変更ありで更新する', async () => {
    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    const imageFile = new File(['new-image'], 'new.jpg', { type: 'image/jpeg' });
    const updatePayload = {
      name: '更新カビ豆',
      characteristics: '更新済み特徴',
      tasteImpact: '更新済み影響',
      removalReason: '更新済み理由',
    };

    await act(async () => {
      await result.current.updateDefectBean(
        'master-1',
        updatePayload,
        imageFile,
        MASTER_BEAN.imageUrl
      );
    });

    // マスター豆の画像アップロードはuserId=''
    expect(mockUploadDefectBeanImage).toHaveBeenCalledWith('', 'master-1', imageFile);

    // 旧画像を削除
    expect(mockDeleteDefectBeanImage).toHaveBeenCalledWith(MASTER_BEAN.imageUrl);

    // updateDefectBeanMasterが呼ばれた
    expect(mockUpdateDefectBeanMaster).toHaveBeenCalledWith(
      'master-1',
      expect.objectContaining({
        id: 'master-1',
        name: '更新カビ豆',
        imageUrl: 'https://example.com/new-image.jpg',
        isMaster: true,
        updatedAt: '2024-06-15T00:00:00.000Z',
      })
    );

    // updateDataは呼ばれない（マスター豆なので）
    expect(mockUpdateData).not.toHaveBeenCalled();
  });

  it('ユーザー豆を画像変更ありで更新する', async () => {
    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    const imageFile = new File(['new-image'], 'new.jpg', { type: 'image/jpeg' });
    const updatePayload = {
      name: '更新ユーザー豆',
      characteristics: '更新特徴',
      tasteImpact: '更新影響',
      removalReason: '更新理由',
    };

    await act(async () => {
      await result.current.updateDefectBean(
        USER_BEAN.id,
        updatePayload,
        imageFile,
        USER_BEAN.imageUrl
      );
    });

    // ユーザー豆の画像アップロードはuserId=user.uid
    expect(mockUploadDefectBeanImage).toHaveBeenCalledWith('test-user-id', USER_BEAN.id, imageFile);

    // 旧画像を削除
    expect(mockDeleteDefectBeanImage).toHaveBeenCalledWith(USER_BEAN.imageUrl);

    // updateDataが呼ばれた（ユーザー豆なので）
    expect(mockUpdateData).toHaveBeenCalledTimes(1);

    const updater = mockUpdateData.mock.calls[0][0];
    const currentData = { ...INITIAL_APP_DATA, defectBeans: [USER_BEAN] };
    const updatedData = updater(currentData);
    expect(updatedData.defectBeans).toHaveLength(1);
    expect(updatedData.defectBeans[0]).toMatchObject({
      id: USER_BEAN.id,
      name: '更新ユーザー豆',
      imageUrl: 'https://example.com/new-image.jpg',
      updatedAt: '2024-06-15T00:00:00.000Z',
    });

    // updateDefectBeanMasterは呼ばれない（ユーザー豆なので）
    expect(mockUpdateDefectBeanMaster).not.toHaveBeenCalled();
  });

  it('画像変更なしで更新する（imageFile=null）', async () => {
    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    const updatePayload = {
      name: '名前のみ更新',
      characteristics: USER_BEAN.characteristics,
      tasteImpact: USER_BEAN.tasteImpact,
      removalReason: USER_BEAN.removalReason,
    };

    await act(async () => {
      await result.current.updateDefectBean(USER_BEAN.id, updatePayload, null);
    });

    // 画像アップロードは呼ばれない
    expect(mockUploadDefectBeanImage).not.toHaveBeenCalled();
    // 画像削除も呼ばれない
    expect(mockDeleteDefectBeanImage).not.toHaveBeenCalled();

    // updateDataが呼ばれた
    expect(mockUpdateData).toHaveBeenCalledTimes(1);

    const updater = mockUpdateData.mock.calls[0][0];
    const currentData = { ...INITIAL_APP_DATA, defectBeans: [USER_BEAN] };
    const updatedData = updater(currentData);
    expect(updatedData.defectBeans[0].name).toBe('名前のみ更新');
    // 既存の画像URLが保持される
    expect(updatedData.defectBeans[0].imageUrl).toBe(USER_BEAN.imageUrl);
  });

  it('旧画像削除失敗時も更新は続行する', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockDeleteDefectBeanImage.mockRejectedValue(new Error('Delete image failed'));

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    const imageFile = new File(['new-image'], 'new.jpg', { type: 'image/jpeg' });
    const updatePayload = {
      name: '更新ユーザー豆',
      characteristics: '更新特徴',
      tasteImpact: '更新影響',
      removalReason: '更新理由',
    };

    // エラーがスローされないことを確認
    await act(async () => {
      await result.current.updateDefectBean(
        USER_BEAN.id,
        updatePayload,
        imageFile,
        USER_BEAN.imageUrl
      );
    });

    // 画像削除失敗がログに出力される
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to delete old image:',
      expect.any(Error)
    );

    // updateDataは正常に呼ばれる
    expect(mockUpdateData).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });

  it('同一画像URL時に旧画像を削除しない', async () => {
    // アップロード結果が既存のURLと同じ場合
    mockUploadDefectBeanImage.mockResolvedValue(USER_BEAN.imageUrl);

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    const imageFile = new File(['same-image'], 'same.jpg', { type: 'image/jpeg' });
    const updatePayload = {
      name: '更新ユーザー豆',
      characteristics: '更新特徴',
      tasteImpact: '更新影響',
      removalReason: '更新理由',
    };

    await act(async () => {
      await result.current.updateDefectBean(
        USER_BEAN.id,
        updatePayload,
        imageFile,
        USER_BEAN.imageUrl
      );
    });

    // アップロードは呼ばれる
    expect(mockUploadDefectBeanImage).toHaveBeenCalledTimes(1);
    // 同一URLなので旧画像削除は呼ばれない
    expect(mockDeleteDefectBeanImage).not.toHaveBeenCalled();
  });

  it('マスター豆更新時にローカルstateも更新される', async () => {
    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    // 更新前のマスター豆を確認
    expect(result.current.masterDefectBeans).toEqual([MASTER_BEAN]);

    const updatePayload = {
      name: '更新済みカビ豆',
      characteristics: '更新特徴',
      tasteImpact: '更新影響',
      removalReason: '更新理由',
    };

    await act(async () => {
      await result.current.updateDefectBean('master-1', updatePayload, null);
    });

    // ローカルstateが更新された
    expect(result.current.masterDefectBeans[0].name).toBe('更新済みカビ豆');
    expect(result.current.masterDefectBeans[0].updatedAt).toBe('2024-06-15T00:00:00.000Z');
  });

  it('oldImageUrlが未指定の場合は旧画像を削除しない', async () => {
    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    const imageFile = new File(['new-image'], 'new.jpg', { type: 'image/jpeg' });
    const updatePayload = {
      name: '更新ユーザー豆',
      characteristics: '更新特徴',
      tasteImpact: '更新影響',
      removalReason: '更新理由',
    };

    await act(async () => {
      await result.current.updateDefectBean(USER_BEAN.id, updatePayload, imageFile);
    });

    // oldImageUrlがundefinedなので旧画像削除は呼ばれない
    expect(mockDeleteDefectBeanImage).not.toHaveBeenCalled();
    // アップロードは実行される
    expect(mockUploadDefectBeanImage).toHaveBeenCalledTimes(1);
  });
});

describe('useDefectBeans - removeDefectBean', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseAuth.mockReturnValue({ user: mockUser, loading: false });
    mockGetDefectBeanMasterData.mockResolvedValue([MASTER_BEAN]);
    mockUpdateData.mockResolvedValue(undefined);
    mockDeleteDefectBeanMaster.mockResolvedValue(undefined);
    mockDeleteDefectBeanImage.mockResolvedValue(undefined);
    mockUseAppData.mockReturnValue({
      data: { ...INITIAL_APP_DATA, defectBeans: [USER_BEAN] },
      updateData: mockUpdateData,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('未認証時にエラーをスローする', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    await expect(
      act(async () => {
        await result.current.removeDefectBean('master-1', MASTER_BEAN.imageUrl);
      })
    ).rejects.toThrow('User not authenticated');
  });

  it('存在しない豆のIDでエラーをスローする', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    await expect(
      act(async () => {
        await result.current.removeDefectBean('non-existent-id', 'https://example.com/img.jpg');
      })
    ).rejects.toThrow('Defect bean not found');

    consoleSpy.mockRestore();
  });

  it('マスター豆を削除する', async () => {
    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    // 削除前にマスター豆が存在する
    expect(result.current.masterDefectBeans).toEqual([MASTER_BEAN]);

    await act(async () => {
      await result.current.removeDefectBean('master-1', MASTER_BEAN.imageUrl);
    });

    // 画像削除が呼ばれた
    expect(mockDeleteDefectBeanImage).toHaveBeenCalledWith(MASTER_BEAN.imageUrl);

    // Firestoreからの削除が呼ばれた
    expect(mockDeleteDefectBeanMaster).toHaveBeenCalledWith('master-1');

    // ローカルstateからも削除された
    expect(result.current.masterDefectBeans).toEqual([]);

    // updateDataは呼ばれない（マスター豆なので）
    expect(mockUpdateData).not.toHaveBeenCalled();
  });

  it('ユーザー豆を削除する', async () => {
    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    await act(async () => {
      await result.current.removeDefectBean(USER_BEAN.id, USER_BEAN.imageUrl);
    });

    // 画像削除が呼ばれた
    expect(mockDeleteDefectBeanImage).toHaveBeenCalledWith(USER_BEAN.imageUrl);

    // updateDataが呼ばれた（ユーザー豆なので）
    expect(mockUpdateData).toHaveBeenCalledTimes(1);

    const updater = mockUpdateData.mock.calls[0][0];
    const currentData = { ...INITIAL_APP_DATA, defectBeans: [USER_BEAN] };
    const updatedData = updater(currentData);
    expect(updatedData.defectBeans).toEqual([]);

    // deleteDefectBeanMasterは呼ばれない（ユーザー豆なので）
    expect(mockDeleteDefectBeanMaster).not.toHaveBeenCalled();
  });

  it('画像削除失敗時にエラーをスローする', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockDeleteDefectBeanImage.mockRejectedValue(new Error('Image delete failed'));

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    await expect(
      act(async () => {
        await result.current.removeDefectBean('master-1', MASTER_BEAN.imageUrl);
      })
    ).rejects.toThrow('Image delete failed');

    // Firestore削除は呼ばれない（画像削除で失敗したため）
    expect(mockDeleteDefectBeanMaster).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('Firestore削除失敗時にエラーをスローする', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockDeleteDefectBeanMaster.mockRejectedValue(new Error('Firestore delete failed'));

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    await expect(
      act(async () => {
        await result.current.removeDefectBean('master-1', MASTER_BEAN.imageUrl);
      })
    ).rejects.toThrow('Firestore delete failed');

    // 画像削除は呼ばれた
    expect(mockDeleteDefectBeanImage).toHaveBeenCalledWith(MASTER_BEAN.imageUrl);

    consoleSpy.mockRestore();
  });

  it('ユーザー豆削除時にdefectBeansがundefinedでも正常動作する', async () => {
    mockUseAppData.mockReturnValue({
      data: { ...INITIAL_APP_DATA, defectBeans: [USER_BEAN] },
      updateData: mockUpdateData,
      isLoading: false,
    });

    const { result } = renderHook(() => useDefectBeans());

    await waitForMasterDataLoad();

    await act(async () => {
      await result.current.removeDefectBean(USER_BEAN.id, USER_BEAN.imageUrl);
    });

    // updaterコールバックがdefectBeans=undefinedでも動作する
    const updater = mockUpdateData.mock.calls[0][0];
    const dataWithUndefinedBeans = { ...INITIAL_APP_DATA, defectBeans: undefined };
    const updatedData = updater(dataWithUndefinedBeans);
    expect(updatedData.defectBeans).toEqual([]);
  });
});
