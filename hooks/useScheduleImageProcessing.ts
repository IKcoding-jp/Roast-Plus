import { useState, useCallback, useEffect } from 'react';
import { extractScheduleFromImage } from '@/lib/scheduleOCR';
import type { TimeLabel, RoastSchedule } from '@/types';
import { useToastContext } from '@/components/Toast';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';

interface UseScheduleImageProcessingProps {
  selectedDate: string;
  onSuccess: (timeLabels: TimeLabel[], roastSchedules: RoastSchedule[]) => void;
}

export function useScheduleImageProcessing({ selectedDate, onSuccess }: UseScheduleImageProcessingProps) {
  const { showToast } = useToastContext();
  const { isEnabled: isDeveloperMode } = useDeveloperMode();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleImageFile = useCallback(
    async (file: File) => {
      setCurrentFile(file);
      setIsProcessing(true);
      setError(null);

      try {
        const { timeLabels, roastSchedules } = await extractScheduleFromImage(file, selectedDate);
        onSuccess(timeLabels, roastSchedules);
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
          } else if (
            errorCode === 'functions/not-found' ||
            err.message.includes('not-found') ||
            err.message.includes('404')
          ) {
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
              errorDetails =
                'Firebase Functionsのログを確認してください。環境変数（GOOGLE_VISION_API_KEY、OPENAI_API_KEY）が設定されているか確認してください。';
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
        const finalErrorMessage =
          isDeveloperMode && errorDetails ? `${errorMessage}\n\n詳細: ${errorDetails}` : errorMessage;

        setError(finalErrorMessage);
        showToast(errorMessage, 'error');
        // エラー時はプレビューをクリーンアップ
        setCurrentFile(null);
        setImagePreview(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedDate, onSuccess, isDeveloperMode, showToast]
  );

  const resetState = useCallback(() => {
    setError(null);
    setCurrentFile(null);
    setImagePreview(null);
  }, []);

  return {
    isProcessing,
    error,
    imagePreview,
    handleImageFile,
    resetState,
  };
}
