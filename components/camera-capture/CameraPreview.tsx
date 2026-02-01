'use client';

import { RefObject } from 'react';
import Image from 'next/image';

interface GuideSize {
  width: number;
  height: number;
  top: number;
  left: number;
  containerHeight: number;
  containerWidth: number;
}

interface CameraPreviewProps {
  capturedImage: string | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  guideRef: RefObject<HTMLDivElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  guideSize: GuideSize;
  handleVideoReady: () => void;
  isVideoReady: boolean;
}

export function CameraPreview({
  capturedImage,
  videoRef,
  canvasRef,
  guideRef,
  containerRef,
  guideSize,
  handleVideoReady,
}: CameraPreviewProps) {
  return (
    <div ref={containerRef} className="flex-1 relative flex items-center justify-center overflow-hidden">
      {capturedImage ? (
        <Image
          src={capturedImage}
          alt="Captured"
          fill
          className="object-contain"
          unoptimized
        />
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            onLoadedMetadata={handleVideoReady}
            onCanPlay={handleVideoReady}
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
  );
}
