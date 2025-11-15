'use client';

import { useState, useRef, useEffect } from 'react';
import { HiCamera, HiX, HiCheck } from 'react-icons/hi';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // カメラを起動
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // 背面カメラを優先
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
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
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 写真を撮影
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    // キャンバスのサイズをビデオのサイズに合わせる
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // ビデオのフレームをキャンバスに描画
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // キャンバスから画像データを取得
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        
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
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
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

