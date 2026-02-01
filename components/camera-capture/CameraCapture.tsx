'use client';

import { HiCamera, HiX, HiCheck } from 'react-icons/hi';
import { useToastContext } from '@/components/Toast';
import { useCameraCapture } from '@/hooks/useCameraCapture';
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
            disabled={!canCapture}
            className={`w-20 h-20 bg-white rounded-full border-4 border-gray-300 transition-colors flex items-center justify-center min-h-[80px] min-w-[80px] ${
              canCapture ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <HiCamera className="h-10 w-10 text-gray-800" />
          </button>
        )}
      </div>
    </div>
  );
}
