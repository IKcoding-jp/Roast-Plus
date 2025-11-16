'use client';

import { useEffect, useState } from 'react';
import { MdTimer } from 'react-icons/md';
import { RiBookFill } from 'react-icons/ri';
import { MdTimeline } from 'react-icons/md';
import { HiChevronLeft, HiChevronRight, HiX } from 'react-icons/hi';

interface Slide {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface VersionUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: string;
}

const SLIDES: Slide[] = [
  {
    icon: <MdTimer className="h-16 w-16 sm:h-20 sm:w-20 text-amber-600" />,
    title: 'ローストタイマー β版',
    description: '焙煎時間を管理し、アラームでお知らせする機能です。豆の種類や焙煎度合いに応じた推奨時間を設定できます。',
  },
  {
    icon: <RiBookFill className="h-16 w-16 sm:h-20 sm:w-20 text-amber-600" />,
    title: 'コーヒー豆図鑑 β版',
    description: '欠点豆の種類を確認・学習できる図鑑機能です。各欠点豆の特徴や見分け方を詳しく学べます。',
  },
  {
    icon: <MdTimeline className="h-16 w-16 sm:h-20 sm:w-20 text-amber-600" />,
    title: '作業進捗 β版',
    description: '作業の進捗状況を管理・追跡する機能です。作業グループを作成し、各作業の完了状況を一目で確認できます。',
  },
];

export function VersionUpdateModal({ isOpen, onClose, currentVersion }: VersionUpdateModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // スワイプに必要な最小距離（ピクセル）
  const minSwipeDistance = 50;

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  // タッチ開始
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // タッチ移動
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // タッチ終了（スワイプ判定）
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // 左にスワイプ（次のスライド）
      handleNext();
    } else if (isRightSwipe) {
      // 右にスワイプ（前のスライド）
      handlePrevious();
    }
  };

  // ESCキーで閉じる、矢印キーでスライドを切り替え
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // 矢印キーでスライドを切り替え
    const handleArrowKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (currentSlide > 0) {
          setCurrentSlide(currentSlide - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentSlide < SLIDES.length - 1) {
          setCurrentSlide(currentSlide + 1);
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('keydown', handleArrowKeys);

    // モーダル表示中は背景スクロールを無効化
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('keydown', handleArrowKeys);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, currentSlide]);

  // モーダルが開かれた時に最初のスライドにリセット
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const slide = SLIDES[currentSlide];
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            ローストプラス v{currentVersion}
          </h2>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
          </button>
        </div>

        {/* スライドコンテンツ */}
        <div
          className="flex-1 overflow-y-auto p-6 sm:p-8"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex flex-col items-center text-center space-y-6">
            {/* アイコン */}
            <div className="flex items-center justify-center">
              {slide.icon}
            </div>

            {/* タイトル */}
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              {slide.title}
            </h3>

            {/* 説明 */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-md">
              {slide.description}
            </p>
          </div>
        </div>

        {/* ページインジケーター */}
        <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 w-2 rounded-full transition-colors min-h-[8px] min-w-[8px] ${
                index === currentSlide
                  ? 'bg-amber-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`スライド ${index + 1} に移動`}
            />
          ))}
        </div>

        {/* フッター（ナビゲーションボタン） */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 gap-3">
          {/* 前へボタン */}
          <button
            onClick={handlePrevious}
            disabled={isFirstSlide}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors min-h-[44px] ${
              isFirstSlide
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-label="前のスライド"
          >
            <HiChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline">前へ</span>
          </button>

          {/* スキップボタン */}
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors min-h-[44px]"
            aria-label="スキップ"
          >
            スキップ
          </button>

          {/* 次へ/完了ボタン */}
          <button
            onClick={isLastSlide ? handleSkip : handleNext}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors min-h-[44px]"
            aria-label={isLastSlide ? '完了' : '次のスライド'}
          >
            <span>{isLastSlide ? '完了' : '次へ'}</span>
            {!isLastSlide && <HiChevronRight className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

