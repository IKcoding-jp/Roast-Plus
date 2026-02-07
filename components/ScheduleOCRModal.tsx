'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { CameraCapture } from './CameraCapture';
import { OCRConfirmModal } from './OCRConfirmModal';
import type { TimeLabel, RoastSchedule } from '@/types';
import { HiX, HiPhotograph, HiCamera } from 'react-icons/hi';
import { useToastContext } from './Toast';
import { useAppData } from '@/hooks/useAppData';
import { useScheduleImageProcessing } from '@/hooks/useScheduleImageProcessing';
import { Button, IconButton } from '@/components/ui';

interface ScheduleOCRModalProps {
  selectedDate: string;
  onSuccess: (mode: 'replace' | 'add', timeLabels: TimeLabel[], roastSchedules: RoastSchedule[]) => void;
  onCancel: () => void;
}

export function ScheduleOCRModal({ selectedDate, onSuccess, onCancel }: ScheduleOCRModalProps) {
  const { showToast } = useToastContext();
  const { data } = useAppData();
  const [showCamera, setShowCamera] = useState(false);
  const [ocrResult, setOcrResult] = useState<{ timeLabels: TimeLabel[]; roastSchedules: RoastSchedule[] } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isProcessing, error, imagePreview, handleImageFile, resetState } = useScheduleImageProcessing({
    selectedDate,
    onSuccess: (timeLabels, roastSchedules) => {
      setOcrResult({ timeLabels, roastSchedules });
      setShowConfirm(true);
    },
  });

  const handleCapture = (file: File) => {
    setShowCamera(false);
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

  const handleReset = () => {
    resetState();
    setShowCamera(false);
    setOcrResult(null);
    setShowConfirm(false);
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
          handleReset();
          onSuccess(mode, timeLabels, roastSchedules);
        }}
        onCancel={() => {
          handleReset();
          onCancel();
        }}
        onRetry={handleReset}
      />
    );
  }

  // 選択画面を表示
  if (!showCamera && !isProcessing && !error && !showConfirm) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="rounded-lg p-6 max-w-sm w-full mx-4 bg-surface border border-edge">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">画像を選択</h2>
            <IconButton
              variant="ghost"
              size="md"
              onClick={() => {
                handleReset();
                onCancel();
              }}
              rounded
            >
              <HiX className="h-5 w-5" />
            </IconButton>
          </div>
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowCamera(true)}
              className="w-full"
            >
              <HiCamera className="h-5 w-5 mr-2" />
              <span>カメラで撮影</span>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <HiPhotograph className="h-5 w-5 mr-2" />
              <span>ファイルから選択</span>
            </Button>
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
        <div className="rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl bg-surface border border-edge">
          <div className="text-center">
            {/* 画像プレビュー */}
            {imagePreview && (
              <div className="mb-6 rounded-lg overflow-hidden border-2 border-edge bg-ground">
                <Image
                  src={imagePreview}
                  alt="解析中の画像"
                  width={400}
                  height={256}
                  className="w-full max-h-64 object-contain"
                  unoptimized
                />
              </div>
            )}

            {/* スピナー */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 rounded-full animate-spin border-spot/20 border-t-spot"></div>
              </div>
            </div>

            {/* メッセージ */}
            <p className="text-lg font-medium mb-1 text-ink">
              画像を解析中...
            </p>
            <p className="text-sm text-ink-muted">
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
        <div className="rounded-lg p-6 max-w-sm w-full mx-4 bg-surface border border-edge">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">エラー</h2>
            <IconButton
              variant="ghost"
              size="md"
              onClick={() => {
                handleReset();
                onCancel();
              }}
              rounded
            >
              <HiX className="h-5 w-5" />
            </IconButton>
          </div>
          <div className="mb-4 whitespace-pre-wrap break-words text-ink">{error}</div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                resetState();
                setShowCamera(false);
              }}
              className="flex-1"
            >
              再試行
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                resetState();
                onCancel();
              }}
              className="flex-1"
            >
              キャンセル
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

