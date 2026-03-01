import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadDefectBeanImage } from './storage';

// モック関数（vi.mockファクトリ内で参照可能なようにmockプレフィックスを使用）
const mockRef = vi.fn(() => ({}));
const mockUploadBytes = vi.fn();
const mockGetDownloadURL = vi.fn();

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: (...args: unknown[]) => mockRef(...args),
  uploadBytes: (...args: unknown[]) => mockUploadBytes(...args),
  getDownloadURL: (...args: unknown[]) => mockGetDownloadURL(...args),
  deleteObject: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./firebase', () => ({
  default: {},
}));

describe('uploadDefectBeanImage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockRef.mockReturnValue({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('30秒以内に完了しない場合はタイムアウトエラーをthrowする', async () => {
    // uploadBytesが永遠にハングするモック
    mockUploadBytes.mockReturnValue(new Promise(() => {}));

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const uploadPromise = uploadDefectBeanImage('uid123', 'beanId123', mockFile);

    // 30秒タイムアウトを進める
    vi.advanceTimersByTime(30_000);

    await expect(uploadPromise).rejects.toThrow('タイムアウト');
  });

  it('正常にアップロードが完了した場合はダウンロードURLを返す', async () => {
    mockUploadBytes.mockResolvedValue({});
    mockGetDownloadURL.mockResolvedValue('https://example.com/image.jpg');

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const url = await uploadDefectBeanImage('uid123', 'beanId123', mockFile);

    expect(url).toBe('https://example.com/image.jpg');
  });

  it('uploadBytes がエラーをthrowした場合はそのエラーを再throwする', async () => {
    const uploadError = new Error('Storage permission denied');
    mockUploadBytes.mockRejectedValue(uploadError);

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

    await expect(uploadDefectBeanImage('uid123', 'beanId123', mockFile)).rejects.toThrow(
      'Storage permission denied'
    );
  });
});
