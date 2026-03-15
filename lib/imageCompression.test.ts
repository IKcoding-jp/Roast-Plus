import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compressImage } from './imageCompression';

// Canvas APIのモック
function createMockCanvas(width: number, height: number) {
  const context = {
    drawImage: vi.fn(),
  };
  return {
    width,
    height,
    getContext: vi.fn(() => context),
    toBlob: vi.fn((callback: BlobCallback, type?: string, quality?: number) => {
      // Blobを生成してコールバック
      const blob = new Blob(['compressed'], { type: type || 'image/jpeg' });
      callback(blob);
    }),
    context,
  };
}

function createMockImage(naturalWidth: number, naturalHeight: number) {
  const img = {
    src: '',
    onload: null as (() => void) | null,
    onerror: null as ((e: unknown) => void) | null,
    naturalWidth,
    naturalHeight,
    width: naturalWidth,
    height: naturalHeight,
  };
  return img;
}

// テスト用Fileを作成
function createTestFile(sizeInBytes: number, name = 'test.jpg', type = 'image/jpeg'): File {
  const buffer = new ArrayBuffer(sizeInBytes);
  return new File([buffer], name, { type });
}

describe('compressImage', () => {
  let mockCanvas: ReturnType<typeof createMockCanvas>;

  beforeEach(() => {
    mockCanvas = createMockCanvas(0, 0);

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      return document.createElement(tag);
    });

    // URL.createObjectURL / revokeObjectURL のモック
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  it('800px以下の画像はリサイズせずに圧縮のみ行う', async () => {
    const file = createTestFile(500_000, 'small.jpg');

    // Imageのモック: 600x400（800px以下）
    const mockImage = createMockImage(600, 400);
    vi.stubGlobal('Image', class {
      constructor() {
        Object.assign(this, mockImage);
        queueMicrotask(() => mockImage.onload?.());
        return mockImage as unknown as HTMLImageElement;
      }
    });

    const result = await compressImage(file);

    // キャンバスサイズがオリジナルと同じ
    expect(mockCanvas.width).toBe(600);
    expect(mockCanvas.height).toBe(400);
    // 結果がFileであること
    expect(result).toBeInstanceOf(File);
    expect(result.type).toBe('image/jpeg');
  });

  it('800pxを超える横長画像は長辺を800pxにリサイズする', async () => {
    const file = createTestFile(2_000_000, 'large-landscape.jpg');

    // Imageのモック: 1600x1200（長辺1600px）
    const mockImage = createMockImage(1600, 1200);
    vi.stubGlobal('Image', class {
      constructor() {
        Object.assign(this, mockImage);
        queueMicrotask(() => mockImage.onload?.());
        return mockImage as unknown as HTMLImageElement;
      }
    });

    const result = await compressImage(file);

    // 長辺800pxにリサイズ、アスペクト比維持
    expect(mockCanvas.width).toBe(800);
    expect(mockCanvas.height).toBe(600);
    expect(result).toBeInstanceOf(File);
  });

  it('800pxを超える縦長画像は長辺を800pxにリサイズする', async () => {
    const file = createTestFile(2_000_000, 'large-portrait.jpg');

    // Imageのモック: 900x1200（長辺1200px）
    const mockImage = createMockImage(900, 1200);
    vi.stubGlobal('Image', class {
      constructor() {
        Object.assign(this, mockImage);
        queueMicrotask(() => mockImage.onload?.());
        return mockImage as unknown as HTMLImageElement;
      }
    });

    const result = await compressImage(file);

    // 長辺800pxにリサイズ、アスペクト比維持
    expect(mockCanvas.width).toBe(600);
    expect(mockCanvas.height).toBe(800);
    expect(result).toBeInstanceOf(File);
  });

  it('圧縮後のファイル名を維持する', async () => {
    const file = createTestFile(1_000_000, 'my-photo.png', 'image/png');

    const mockImage = createMockImage(400, 300);
    vi.stubGlobal('Image', class {
      constructor() {
        Object.assign(this, mockImage);
        queueMicrotask(() => mockImage.onload?.());
        return mockImage as unknown as HTMLImageElement;
      }
    });

    const result = await compressImage(file);

    expect(result.name).toBe('my-photo.png');
  });

  it('画像読み込みエラー時にエラーをスローする', async () => {
    const file = createTestFile(1000, 'broken.jpg');

    const mockImage = createMockImage(0, 0);
    vi.stubGlobal('Image', class {
      constructor() {
        Object.assign(this, mockImage);
        queueMicrotask(() => mockImage.onerror?.(new Error('Load failed')));
        return mockImage as unknown as HTMLImageElement;
      }
    });

    await expect(compressImage(file)).rejects.toThrow('画像の読み込みに失敗しました');
  });

  it('canvas.toBlob が null を返した場合にエラーをスローする', async () => {
    const file = createTestFile(1000, 'test.jpg');

    const mockImage = createMockImage(400, 300);
    vi.stubGlobal('Image', class {
      constructor() {
        Object.assign(this, mockImage);
        queueMicrotask(() => mockImage.onload?.());
        return mockImage as unknown as HTMLImageElement;
      }
    });

    // toBlobがnullを返すようにモック
    mockCanvas.toBlob = vi.fn((callback: BlobCallback) => {
      callback(null);
    });

    await expect(compressImage(file)).rejects.toThrow('画像の圧縮に失敗しました');
  });

  it('maxSize オプションでリサイズ上限を変更できる', async () => {
    const file = createTestFile(2_000_000, 'large.jpg');

    const mockImage = createMockImage(2000, 1000);
    vi.stubGlobal('Image', class {
      constructor() {
        Object.assign(this, mockImage);
        queueMicrotask(() => mockImage.onload?.());
        return mockImage as unknown as HTMLImageElement;
      }
    });

    const result = await compressImage(file, { maxSize: 500 });

    expect(mockCanvas.width).toBe(500);
    expect(mockCanvas.height).toBe(250);
    expect(result).toBeInstanceOf(File);
  });

  it('quality オプションで圧縮品質を変更できる', async () => {
    const file = createTestFile(1_000_000, 'test.jpg');

    const mockImage = createMockImage(400, 300);
    vi.stubGlobal('Image', class {
      constructor() {
        Object.assign(this, mockImage);
        queueMicrotask(() => mockImage.onload?.());
        return mockImage as unknown as HTMLImageElement;
      }
    });

    await compressImage(file, { quality: 0.5 });

    expect(mockCanvas.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.5
    );
  });
});
