'use client';

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect } from 'react';
import { HiCamera, HiX, HiCheck } from 'react-icons/hi';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [guideSize, setGuideSize] = useState({ width: 0, height: 0, top: 0, left: 0, containerHeight: 0, containerWidth: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // 背面カメラを優先
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Failed to access camera:', error);
        alert('カメラへのアクセスに失敗しました。カメラの権限を確認してください。');
        onCancel();
      }
    };

    startCamera();

    // クリーンアップ
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onCancel]);

  // 写真を撮影
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
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
    const guideAspect = guideSize.width > 0 && guideSize.height > 0
      ? guideSize.width / guideSize.height
      : 3 / 4;
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
      cropX, cropY, cropWidth, cropHeight, // ソース（切り取り範囲）
      0, 0, targetWidth, targetHeight // デスティネーション（リサイズ後のサイズ）
    );

    // リサイズした画像をBlobとして取得
    resizedCanvas.toBlob((blob) => {
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
        
        // ストリームを停止
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      }
    }, 'image/jpeg', 0.9);
  };

  // 撮影した写真を確定
  const confirmCapture = () => {
    if (!canvasRef.current || !capturedImage) {
      return;
    }

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `defect-bean-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        onCapture(file);
      }
    }, 'image/jpeg', 0.9);
  };

  // 撮影をやり直す
  const retakePhoto = async () => {
    setCapturedImage(null);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Failed to restart camera:', error);
      alert('カメラの再起動に失敗しました。');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <HiX className="h-6 w-6" />
        </button>
        <h2 className="text-lg font-semibold">写真を撮影</h2>
        <div className="w-10" /> {/* スペーサー */}
      </div>

      {/* カメラプレビューまたは撮影した画像 */}
      <div ref={containerRef} className="flex-1 relative flex items-center justify-center overflow-hidden">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* 縦長のガイド枠（ホワイトボード向け） */}
            <div className="absolute inset-0 pointer-events-none">
              {/* 半透明のオーバーレイ（4方向） */}
              {guideSize.width > 0 && guideSize.containerHeight > 0 && (
                <>
                  {/* 上部のオーバーレイ */}
                  <div 
                    className="absolute top-0 left-0 right-0 bg-black bg-opacity-50"
                    style={{ height: `${guideSize.top}px` }}
                  />
                  {/* 下部のオーバーレイ */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50"
                    style={{ height: `${guideSize.containerHeight - (guideSize.top + guideSize.height)}px` }}
                  />
                  {/* 左側のオーバーレイ */}
                  <div 
                    className="absolute top-0 bottom-0 left-0 bg-black bg-opacity-50"
                    style={{ 
                      width: `${guideSize.left}px`,
                      top: `${guideSize.top}px`,
                      bottom: `${guideSize.containerHeight - (guideSize.top + guideSize.height)}px`
                    }}
                  />
                  {/* 右側のオーバーレイ */}
                  <div 
                    className="absolute top-0 bottom-0 right-0 bg-black bg-opacity-50"
                    style={{ 
                      width: `${guideSize.containerWidth - (guideSize.left + guideSize.width)}px`,
                      top: `${guideSize.top}px`,
                      bottom: `${guideSize.containerHeight - (guideSize.top + guideSize.height)}px`
                    }}
                  />
                </>
              )}
              
              {/* 中央の縦長エリア */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div ref={guideRef} className="relative w-[70%] max-w-md aspect-[3/4]">
                  {/* 縦長の枠線 */}
                  <div className="absolute inset-0 border-2 border-white rounded-lg shadow-lg z-10">
                    {/* 角のマーカー */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* コントロール */}
      <div className="p-6 bg-black bg-opacity-50 flex items-center justify-center gap-4">
        {capturedImage ? (
          <>
            <button
              onClick={retakePhoto}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors min-h-[44px] flex items-center justify-center gap-2"
            >
              <HiX className="h-5 w-5" />
              やり直す
            </button>
            <button
              onClick={confirmCapture}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors min-h-[44px] flex items-center justify-center gap-2"
            >
              <HiCheck className="h-5 w-5" />
              確定
            </button>
          </>
        ) : (
          <button
            onClick={capturePhoto}
            className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center min-h-[80px] min-w-[80px]"
          >
            <HiCamera className="h-10 w-10 text-gray-800" />
          </button>
        )}
      </div>
    </div>
  );
}

