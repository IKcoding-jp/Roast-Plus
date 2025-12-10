'use client';

/* eslint-disable @next/next/no-img-element */

import { useState, useRef, useEffect } from 'react';
import { CameraCapture } from './CameraCapture';
import { OCRConfirmModal } from './OCRConfirmModal';
import { extractScheduleFromImage } from '@/lib/scheduleOCR';
import type { TimeLabel, RoastSchedule } from '@/types';
import { HiX, HiPhotograph, HiCamera } from 'react-icons/hi';
import { useToastContext } from './Toast';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { useAppData } from '@/hooks/useAppData';

interface ScheduleOCRModalProps {
  selectedDate: string;
  onSuccess: (mode: 'replace' | 'add', timeLabels: TimeLabel[], roastSchedules: RoastSchedule[]) => void;
  onCancel: () => void;
}

export function ScheduleOCRModal({ selectedDate, onSuccess, onCancel }: ScheduleOCRModalProps) {
  const { showToast } = useToastContext();
  const { isEnabled: isDeveloperMode } = useDeveloperMode();
  const { data } = useAppData();
  const [showCamera, setShowCamera] = useState(false); // 初期状態は選択画面
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<{ timeLabels: TimeLabel[]; roastSchedules: RoastSchedule[] } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 画像プレビューを生成
  useEffect(() => {
    if (currentFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(currentFile);
    } else {
      setImagePreview(null);
    }
  }, [currentFile]);

  const handleImageFile = async (file: File) => {
    setCurrentFile(file);
    setIsProcessing(true);
    setError(null);
    setShowCamera(false);

    try {
      const { timeLabels, roastSchedules } = await extractScheduleFromImage(file, selectedDate);
      setOcrResult({ timeLabels, roastSchedules });
      setShowConfirm(true);
    } catch (err: unknown) {
      const scheduleError = err as { code?: string; message?: string; details?: unknown };
      console.error('OCR処理エラー:', err);
      console.error('エラー詳細:', {
        code: scheduleError?.code,
        message: scheduleError?.message,
        details: scheduleError?.details,
      });
      
      let errorMessage = 'スケジュールの読み取りに失敗しました。画像を確認して再度お試しください。';
      let errorDetails = '';
      
      if (err instanceof Error) {
        // Firebase Functionsのエラーコードを確認
        const errorCode = typeof scheduleError?.code === 'string' ? scheduleError.code : '';
        errorDetails = err.message || '';
        
        if (errorCode === 'unauthenticated' || err.message.includes('unauthenticated')) {
          errorMessage = '認証が必要です。再度ログインしてください。';
        } else if (errorCode === 'functions/not-found' || err.message.includes('not-found') || err.message.includes('404')) {
          errorMessage = 'Firebase Functionsが見つかりません。デプロイを確認してください。';
          errorDetails = 'ocrScheduleFromImage関数がデプロイされているか確認してください。';
        } else if (errorCode === 'not-found' || err.message.includes('テキストを検出')) {
          errorMessage = '画像からテキストを検出できませんでした。画像を確認してください。';
        } else if (errorCode === 'internal' || err.message.includes('internal') || err.message.includes('サーバー')) {
          errorMessage = 'サーバーエラーが発生しました。';
          // 詳細なエラーメッセージがある場合は追加
          if (err.message && !err.message.includes('サーバーエラー')) {
            errorDetails = err.message;
          } else {
            errorDetails = 'Firebase Functionsのログを確認してください。環境変数（GOOGLE_VISION_API_KEY、OPENAI_API_KEY）が設定されているか確認してください。';
          }
        } else if (errorCode === 'failed-precondition' || err.message.includes('OPENAI_API_KEY')) {
          errorMessage = 'サーバー設定エラーが発生しました。';
          errorDetails = 'OPENAI_API_KEYまたはGOOGLE_VISION_API_KEYが設定されていません。';
        } else if (errorCode === 'invalid-argument') {
          errorMessage = '画像データが無効です。';
          errorDetails = err.message || '';
        } else if (err.message) {
          errorMessage = err.message;
        }
      }
      
      // 開発者モードの場合は詳細なエラー情報を表示
      const finalErrorMessage = isDeveloperMode && errorDetails 
        ? `${errorMessage}\n\n詳細: ${errorDetails}`
        : errorMessage;
      
      setError(finalErrorMessage);
      setShowCamera(false);
      showToast(errorMessage, 'error');
      // エラー時はプレビューをクリーンアップ
      setCurrentFile(null);
      setImagePreview(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapture = (file: File) => {
    handleImageFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 画像ファイルかチェック
      if (!file.type.startsWith('image/')) {
        showToast('画像ファイルを選択してください。', 'error');
        return;
      }
      handleImageFile(file);
    }
    // 同じファイルを再度選択できるようにリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 確認画面を表示
  if (showConfirm && ocrResult) {
    const existingTodaySchedule = data?.todaySchedules?.find((s) => s.date === selectedDate);
    const existingTimeLabels = existingTodaySchedule?.timeLabels || [];
    const existingRoastSchedules = data?.roastSchedules?.filter((s) => s.date === selectedDate) || [];

    return (
      <OCRConfirmModal
        timeLabels={ocrResult.timeLabels}
        roastSchedules={ocrResult.roastSchedules}
        selectedDate={selectedDate}
        existingTimeLabels={existingTimeLabels}
        existingRoastSchedules={existingRoastSchedules}
        onSave={(mode, timeLabels, roastSchedules) => {
          setShowConfirm(false);
          setOcrResult(null);
          setCurrentFile(null);
          setImagePreview(null);
          onSuccess(mode, timeLabels, roastSchedules);
        }}
        onCancel={() => {
          setShowConfirm(false);
          setOcrResult(null);
          setCurrentFile(null);
          setImagePreview(null);
          onCancel();
        }}
        onRetry={() => {
          setShowConfirm(false);
          setOcrResult(null);
          setCurrentFile(null);
          setImagePreview(null);
          setShowCamera(false);
        }}
      />
    );
  }

  // 選択画面を表示
  if (!showCamera && !isProcessing && !error && !showConfirm) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">画像を選択</h2>
            <button
              onClick={() => {
                setCurrentFile(null);
                setImagePreview(null);
                onCancel();
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <HiX className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setShowCamera(true)}
              className="w-full px-4 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors min-h-[44px] flex items-center justify-center gap-2"
            >
              <HiCamera className="h-5 w-5" />
              <span>カメラで撮影</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors min-h-[44px] flex items-center justify-center gap-2"
            >
              <HiPhotograph className="h-5 w-5" />
              <span>ファイルから選択</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCapture}
        onCancel={() => {
          setShowCamera(false);
        }}
      />
    );
  }

  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center">
            {/* 画像プレビュー */}
            {imagePreview && (
              <div className="mb-6 rounded-lg overflow-hidden border-2 border-amber-200 bg-gray-50">
                <img 
                  src={imagePreview} 
                  alt="解析中の画像" 
                  className="w-full max-h-64 object-contain"
                />
              </div>
            )}
            
            {/* スピナー */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
              </div>
            </div>
            
            {/* メッセージ */}
            <p className="text-lg font-medium text-gray-800 mb-1">
              画像を解析中...
            </p>
            <p className="text-sm text-gray-500">
              しばらくお待ちください
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">エラー</h2>
            <button
              onClick={() => {
                setCurrentFile(null);
                setImagePreview(null);
                onCancel();
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <HiX className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <div className="text-gray-700 mb-4 whitespace-pre-wrap break-words">{error}</div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setError(null);
                setCurrentFile(null);
                setImagePreview(null);
                setShowCamera(false);
              }}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors min-h-[44px]"
            >
              再試行
            </button>
            <button
              onClick={() => {
                setCurrentFile(null);
                setImagePreview(null);
                onCancel();
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors min-h-[44px]"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

