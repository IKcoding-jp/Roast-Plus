'use client';

import { HiCamera, HiX, HiCheck } from 'react-icons/hi';
import { useToastContext } from '@/components/Toast';
import { useCameraCapture } from '@/hooks/useCameraCapture';
import { Button, IconButton } from '@/components/ui';
import { CameraPreview } from './CameraPreview';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const { showToast } = useToastContext();
  const {
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
  } = useCameraCapture({ onCapture, onCancel, showToast });

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <IconButton
          onClick={onCancel}
          variant="ghost"
          rounded
          className="text-white hover:bg-white/20"
          aria-label="キャンセル"
        >
          <HiX className="h-6 w-6" />
        </IconButton>
        <h2 className="text-lg font-semibold">写真を撮影</h2>
        <div className="w-10" /> {/* スペーサー */}
      </div>

      {/* カメラプレビューまたは撮影した画像 */}
      <CameraPreview
        capturedImage={capturedImage}
        videoRef={videoRef}
        canvasRef={canvasRef}
        guideRef={guideRef}
        containerRef={containerRef}
        guideSize={guideSize}
        handleVideoReady={handleVideoReady}
        isVideoReady={isVideoReady}
      />

      {/* コントロール */}
      <div className="p-6 bg-black bg-opacity-50 flex items-center justify-center gap-4">
        {capturedImage ? (
          <>
            <Button
              onClick={retakePhoto}
              variant="secondary"
              className="gap-2"
            >
              <HiX className="h-5 w-5" />
              やり直す
            </Button>
            <Button
              onClick={confirmCapture}
              variant="coffee"
              className="gap-2 bg-amber-600 hover:bg-amber-700"
            >
              <HiCheck className="h-5 w-5" />
              確定
            </Button>
          </>
        ) : (
          <IconButton
            onClick={capturePhoto}
            disabled={!canCapture}
            rounded
            className={`w-20 h-20 bg-white border-4 border-gray-300 min-h-[80px] min-w-[80px] ${
              canCapture ? 'hover:bg-gray-100' : ''
            }`}
            aria-label="撮影"
          >
            <HiCamera className="h-10 w-10 text-gray-800" />
          </IconButton>
        )}
      </div>
    </div>
  );
}
