/**
 * 画像圧縮オプション
 */
export interface CompressImageOptions {
  /** リサイズの最大辺長（px）。デフォルト: 800 */
  maxSize?: number;
  /** JPEG圧縮品質（0-1）。デフォルト: 0.8 */
  quality?: number;
}

/**
 * 画像をリサイズ・圧縮する
 * Canvas APIを使用してクライアントサイドで処理
 *
 * @param file 元の画像ファイル
 * @param options 圧縮オプション
 * @returns 圧縮後のFileオブジェクト
 */
export async function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  const { maxSize = 800, quality = 0.8 } = options;

  // 画像を読み込む
  const img = await loadImage(file);

  // リサイズ後のサイズを計算
  const { width, height } = calculateDimensions(
    img.naturalWidth,
    img.naturalHeight,
    maxSize
  );

  // Canvasに描画して圧縮
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context を取得できませんでした');
  }

  ctx.drawImage(img, 0, 0, width, height);

  // BlobからFileを生成
  const blob = await canvasToBlob(canvas, quality);
  return new File([blob], file.name, { type: 'image/jpeg' });
}

/**
 * Fileから画像を読み込む
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('画像の読み込みに失敗しました'));
    };

    img.src = url;
  });
}

/**
 * リサイズ後のサイズを計算（アスペクト比維持）
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxSize: number
): { width: number; height: number } {
  const maxDimension = Math.max(originalWidth, originalHeight);

  if (maxDimension <= maxSize) {
    return { width: originalWidth, height: originalHeight };
  }

  const ratio = maxSize / maxDimension;
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
}

/**
 * CanvasをBlobに変換
 */
function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('画像の圧縮に失敗しました'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });
}
