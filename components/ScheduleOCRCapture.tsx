'use client';

import { useState, useRef, useEffect } from 'react';
import { HiCamera, HiX, HiCheck, HiRefresh } from 'react-icons/hi';
import { processScheduleOCR } from '@/lib/scheduleOCR';
import type { TimeLabel } from '@/types';
import { Loading } from './Loading';

interface ScheduleOCRCaptureProps {
  onComplete: (timeLabels: TimeLabel[]) => void;
  onCancel: () => void;
}

export function ScheduleOCRCapture({ onComplete, onCancel }: ScheduleOCRCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<TimeLabel[] | null>(null);
  const [error, setError] = useState<string | null>(null);
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
          left: guideRef.current.offsetLeft,
          containerHeight: containerRect.height,
          containerWidth: containerRect.width,
        });
      }
    };

    const timer = setTimeout(updateGuideSize, 100);
    window.addEventListener('resize', updateGuideSize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateGuideSize);
    };
  }, [capturedImage]);

  // カメラを起動
  useEffect(() => {
    const startCamera = async () => {
      try {
        // カメラが利用可能かチェック
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('お使いのブラウザはカメラ機能をサポートしていません。');
          return;
        }

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
      } catch (error: any) {
        console.error('Failed to access camera:', error);
        
        let errorMessage = 'カメラへのアクセスに失敗しました。';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = 'カメラの使用が許可されていません。ブラウザの設定でカメラの許可を有効にしてください。';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage = 'カメラが見つかりませんでした。カメラが接続されているか確認してください。';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          errorMessage = 'カメラが他のアプリケーションで使用中の可能性があります。';
        } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
          errorMessage = 'カメラの設定がサポートされていません。';
        } else if (error.message) {
          errorMessage = `カメラエラー: ${error.message}`;
        }
        
        setError(errorMessage);
        // エラー時は自動的に閉じず、ユーザーが手動で閉じられるようにする
      }
    };

    startCamera();

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
    const tempCanvas = canvasRef.current;
    const tempContext = tempCanvas.getContext('2d');

    if (!tempContext) {
      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    tempCanvas.width = videoWidth;
    tempCanvas.height = videoHeight;

    tempContext.drawImage(video, 0, 0, videoWidth, videoHeight);

    // ホワイトボード用に、全体を使用（正方形に切り取らない）
    const targetWidth = Math.min(videoWidth, 1920);
    const targetHeight = Math.min(videoHeight, 1920);

    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = targetWidth;
    resizedCanvas.height = targetHeight;
    const resizedContext = resizedCanvas.getContext('2d');

    if (!resizedContext) {
      return;
    }

    resizedContext.imageSmoothingEnabled = true;
    resizedContext.imageSmoothingQuality = 'high';

    resizedContext.drawImage(
      tempCanvas,
      0, 0, videoWidth, videoHeight,
      0, 0, targetWidth, targetHeight
    );

    resizedCanvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
        const finalContext = tempCanvas.getContext('2d');
        if (finalContext) {
          finalContext.drawImage(resizedCanvas, 0, 0);
        }
        
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      }
    }, 'image/jpeg', 0.9);
  };

  // OCR処理を実行
  const processOCR = async () => {
    if (!canvasRef.current || !capturedImage) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) {
          setError('画像の処理に失敗しました。');
          setIsProcessing(false);
          return;
        }

        const file = new File([blob], `schedule-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });

        try {
          const timeLabels = await processScheduleOCR(file);
          if (timeLabels.length === 0) {
            setError('スケジュールが見つかりませんでした。画像を確認してください。');
            setIsProcessing(false);
            return;
          }
          setOcrResult(timeLabels);
          setIsProcessing(false);
        } catch (err: any) {
          setError(err.message || 'OCR処理中にエラーが発生しました。');
          setIsProcessing(false);
        }
      }, 'image/jpeg', 0.9);
    } catch (err: any) {
      setError(err.message || 'OCR処理中にエラーが発生しました。');
      setIsProcessing(false);
    }
  };

  // 撮影をやり直す
  const retakePhoto = async () => {
    setCapturedImage(null);
    setOcrResult(null);
    setError(null);
    
    try {
      // 既存のストリームを停止
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }

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
    } catch (error: any) {
      console.error('Failed to restart camera:', error);
      
      let errorMessage = 'カメラの再起動に失敗しました。';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'カメラの使用が許可されていません。ブラウザの設定でカメラの許可を有効にしてください。';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'カメラが見つかりませんでした。カメラが接続されているか確認してください。';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'カメラが他のアプリケーションで使用中の可能性があります。';
      }
      
      setError(errorMessage);
    }
  };

  // OCR結果を確定
  const confirmResult = () => {
    if (ocrResult) {
      onComplete(ocrResult);
    }
  };

  // OCR結果を編集
  const editResult = (index: number, updates: Partial<TimeLabel>) => {
    if (!ocrResult) return;
    const updated = [...ocrResult];
    updated[index] = { ...updated[index], ...updates };
    setOcrResult(updated);
  };

  // OCR結果の項目を削除
  const deleteResult = (index: number) => {
    if (!ocrResult) return;
    const updated = ocrResult.filter((_, i) => i !== index);
    setOcrResult(updated);
  };

  // OCR結果確認モーダル
  if (ocrResult) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">スケジュール確認</h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <HiX className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {ocrResult.length === 0 ? (
              <p className="text-center text-gray-500">スケジュールが見つかりませんでした。</p>
            ) : (
              <div className="space-y-3">
                {ocrResult.map((label, index) => (
                  <div key={label.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <input
                      type="text"
                      value={label.time}
                      onChange={(e) => editResult(index, { time: e.target.value })}
                      className="w-20 px-2 py-1 border rounded text-sm"
                      placeholder="HH:mm"
                    />
                    <input
                      type="text"
                      value={label.content}
                      onChange={(e) => editResult(index, { content: e.target.value })}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                      placeholder="内容"
                    />
                    <button
                      onClick={() => deleteResult(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <HiX className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 p-4 border-t">
            <button
              onClick={retakePhoto}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors min-h-[44px]"
            >
              撮り直す
            </button>
            <button
              onClick={confirmResult}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors min-h-[44px] flex items-center gap-2"
            >
              <HiCheck className="h-5 w-5" />
              確定
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <HiX className="h-6 w-6" />
        </button>
        <h2 className="text-lg font-semibold">スケジュールを撮影</h2>
        <div className="w-10" />
      </div>

      <div ref={containerRef} className="flex-1 relative flex items-center justify-center overflow-hidden">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center gap-4 text-white">
            <HiRefresh className="h-12 w-12 animate-spin" />
            <p className="text-lg">スケジュールを読み取り中...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 text-white p-4 max-w-md mx-auto text-center">
            <p className="text-lg text-red-300 mb-2">{error}</p>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={retakePhoto}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors min-h-[44px]"
              >
                再試行
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors min-h-[44px]"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : capturedImage ? (
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
            <div className="absolute inset-0 pointer-events-none">
              {guideSize.width > 0 && guideSize.containerHeight > 0 && (
                <>
                  <div 
                    className="absolute top-0 left-0 right-0 bg-black bg-opacity-50"
                    style={{ height: `${guideSize.top}px` }}
                  />
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50"
                    style={{ height: `${guideSize.containerHeight - (guideSize.top + guideSize.height)}px` }}
                  />
                  <div 
                    className="absolute top-0 bottom-0 left-0 bg-black bg-opacity-50"
                    style={{ 
                      width: `${guideSize.left}px`,
                      top: `${guideSize.top}px`,
                      bottom: `${guideSize.containerHeight - (guideSize.top + guideSize.height)}px`
                    }}
                  />
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
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div ref={guideRef} className="relative w-[90%] max-w-2xl aspect-[4/3]">
                  <div className="absolute inset-0 border-2 border-white rounded-lg shadow-lg z-10">
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

      <div className="p-6 bg-black bg-opacity-50 flex items-center justify-center gap-4">
        {capturedImage && !isProcessing && !error ? (
          <>
            <button
              onClick={retakePhoto}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors min-h-[44px] flex items-center justify-center gap-2"
            >
              <HiX className="h-5 w-5" />
              やり直す
            </button>
            <button
              onClick={processOCR}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors min-h-[44px] flex items-center justify-center gap-2"
            >
              <HiCheck className="h-5 w-5" />
              OCR実行
            </button>
          </>
        ) : !capturedImage && !isProcessing && !error ? (
          <button
            onClick={capturePhoto}
            className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center min-h-[80px] min-w-[80px]"
          >
            <HiCamera className="h-10 w-10 text-gray-800" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

