import { useState, useRef, useEffect, useCallback, RefObject } from 'react';

interface UseCameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
  showToast: (message: string, type: 'error' | 'warning' | 'success' | 'info') => void;
}

interface GuideSize {
  width: number;
  height: number;
  top: number;
  left: number;
  containerHeight: number;
  containerWidth: number;
}

interface UseCameraCaptureReturn {
  capturedImage: string | null;
  isVideoReady: boolean;
  canCapture: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  guideRef: RefObject<HTMLDivElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  guideSize: GuideSize;
  capturePhoto: () => void;
  confirmCapture: () => void;
  retakePhoto: () => Promise<void>;
  handleVideoReady: () => void;
}

export function useCameraCapture({
  onCapture,
  onCancel,
  showToast,
}: UseCameraCaptureProps): UseCameraCaptureReturn {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [guideSize, setGuideSize] = useState<GuideSize>({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    containerHeight: 0,
    containerWidth: 0,
  });
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  // videoエレメントが再マウントされた際に既存ストリームを再度紐付けする
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((error) => {
        console.warn('Video play failed:', error);
      });
    }
  }, [capturedImage]);

  const setStreamSafely = (mediaStream: MediaStream | null) => {
    streamRef.current = mediaStream;
  };

  const stopCurrentStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // ガイド枠のサイズを計算
  useEffect(() => {
    const updateGuideSize = () => {
      if (guideRef.current && containerRef.current) {
        const guideRect = guideRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        setGuideSize({
          width: guideRect.width,
          height: guideRect.height,
          top: guideRect.top - containerRect.top,
          left: guideRect.left - containerRect.left,
          containerHeight: containerRect.height,
          containerWidth: containerRect.width,
        });
      }
    };

    // 初回計算
    const timer = setTimeout(updateGuideSize, 100);

    // リサイズ時に再計算
    window.addEventListener('resize', updateGuideSize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateGuideSize);
    };
  }, [capturedImage]); // capturedImageが変わった時も再計算

  // カメラを起動
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setIsVideoReady(false);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // 背面カメラを優先
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        activeStream = mediaStream;
        setStreamSafely(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Failed to access camera:', error);
        showToast('カメラへのアクセスに失敗しました。カメラの権限を確認してください。', 'error');
        onCancelRef.current?.();
      }
    };

    startCamera();

    // クリーンアップ
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      stopCurrentStream();
    };
  }, [showToast]);

  const handleVideoReady = useCallback(() => {
    const video = videoRef.current;
    if (video && video.videoWidth > 0 && video.videoHeight > 0) {
      setIsVideoReady(true);
    }
  }, []);

  const canCapture =
    isVideoReady &&
    guideSize.width > 0 &&
    guideSize.height > 0 &&
    guideSize.containerWidth > 0 &&
    guideSize.containerHeight > 0;

  // 写真を撮影
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    if (!canCapture) {
      console.error('Camera is not ready', {
        videoWidth: videoRef.current?.videoWidth,
        videoHeight: videoRef.current?.videoHeight,
        guideSize,
      });
      showToast('カメラの準備中です。少し待ってから撮影してください。', 'warning');
      return;
    }

    const video = videoRef.current;
    const tempCanvas = canvasRef.current;
    const tempContext = tempCanvas.getContext('2d');

    if (!tempContext) {
      return;
    }

    // 一時キャンバスのサイズをビデオのサイズに合わせる
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    if (videoWidth === 0 || videoHeight === 0) {
      console.error('Video metadata is not ready', { videoWidth, videoHeight });
      showToast('カメラの準備中です。少し待ってから撮影してください。', 'warning');
      return;
    }
    tempCanvas.width = videoWidth;
    tempCanvas.height = videoHeight;

    // ビデオのフレームを一時キャンバスに描画
    tempContext.drawImage(video, 0, 0, videoWidth, videoHeight);

    // ガイド枠の表示座標をビデオの元座標に変換
    // object-coverのスケール率とオフセットを計算
    const containerWidth = guideSize.containerWidth;
    const containerHeight = guideSize.containerHeight;
    const containerAspect = containerWidth / containerHeight;
    const videoAspect = videoWidth / videoHeight;

    let scale: number, offsetX: number, offsetY: number;

    if (videoAspect > containerAspect) {
      // ビデオが横長: 縦にフィット、左右がクリップ
      scale = containerHeight / videoHeight;
      offsetX = (videoWidth * scale - containerWidth) / 2;
      offsetY = 0;
    } else {
      // ビデオが縦長: 横にフィット、上下がクリップ
      scale = containerWidth / videoWidth;
      offsetX = 0;
      offsetY = (videoHeight * scale - containerHeight) / 2;
    }

    // ガイド枠の表示座標をビデオ座標に変換
    const rawCropX = (guideSize.left + offsetX) / scale;
    const rawCropY = (guideSize.top + offsetY) / scale;
    const rawCropWidth = guideSize.width / scale;
    const rawCropHeight = guideSize.height / scale;

    // 境界チェック（クランプ処理）
    const cropWidth = Math.min(rawCropWidth, videoWidth);
    const cropHeight = Math.min(rawCropHeight, videoHeight);
    const cropX = Math.max(0, Math.min(rawCropX, videoWidth - cropWidth));
    const cropY = Math.max(0, Math.min(rawCropY, videoHeight - cropHeight));

    // ガイドのアスペクト比に合わせて出力サイズを決定（縦長）
    const guideAspect =
      guideSize.width > 0 && guideSize.height > 0 ? guideSize.width / guideSize.height : 3 / 4;
    const targetHeight = 1280;
    const targetWidth = Math.max(720, Math.round(targetHeight * guideAspect));

    // リサイズ用の新しいキャンバスを作成
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = targetWidth;
    resizedCanvas.height = targetHeight;
    const resizedContext = resizedCanvas.getContext('2d');

    if (!resizedContext) {
      return;
    }

    // 画像の品質を保持するための設定
    resizedContext.imageSmoothingEnabled = true;
    resizedContext.imageSmoothingQuality = 'high';

    // 切り取りとリサイズを一度に行う
    resizedContext.drawImage(
      tempCanvas,
      cropX,
      cropY,
      cropWidth,
      cropHeight, // ソース（切り取り範囲）
      0,
      0,
      targetWidth,
      targetHeight // デスティネーション（リサイズ後のサイズ）
    );

    // リサイズした画像をBlobとして取得
    resizedCanvas.toBlob(
      (blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImage(imageUrl);

          // リサイズ用キャンバスの参照を保持（confirmCaptureで使用）
          // 一時キャンバスにリサイズ後の画像を保存
          tempCanvas.width = targetWidth;
          tempCanvas.height = targetHeight;
          const finalContext = tempCanvas.getContext('2d');
          if (finalContext) {
            finalContext.drawImage(resizedCanvas, 0, 0);
          }
        }
      },
      'image/jpeg',
      0.9
    );
  }, [canCapture, guideSize, showToast]);

  // 撮影した写真を確定
  const confirmCapture = useCallback(() => {
    if (!canvasRef.current || !capturedImage) {
      return;
    }

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `defect-bean-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          onCapture(file);
          stopCurrentStream();
        }
      },
      'image/jpeg',
      0.9
    );
  }, [capturedImage, onCapture]);

  // 撮影をやり直す
  const retakePhoto = useCallback(async () => {
    setCapturedImage(null);
    setIsVideoReady(false);

    // 既存ストリームがあれば継続利用。無ければ再取得する。
    if (!streamRef.current) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        setStreamSafely(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Failed to restart camera:', error);
        showToast('カメラの再起動に失敗しました。', 'error');
      }
    } else if (
      videoRef.current &&
      videoRef.current.videoWidth > 0 &&
      videoRef.current.videoHeight > 0
    ) {
      // 既存ストリームですでにメタデータが揃っている場合は即座に撮影可能にする
      setIsVideoReady(true);
    } else if (videoRef.current && streamRef.current) {
      // ストリームはあるがvideoに未反映の場合、再紐付けして再生を試みる
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((error) => {
        console.warn('Video play failed:', error);
      });
    }
  }, [showToast]);

  return {
    capturedImage,
    isVideoReady,
    canCapture,
    videoRef,
    canvasRef,
    guideRef,
    containerRef,
    guideSize,
    capturePhoto,
    confirmCapture,
    retakePhoto,
    handleVideoReady,
  };
}
