'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { HiHome, HiArrowLeft } from 'react-icons/hi';
import { RiCupLine } from 'react-icons/ri';
import { Loading } from '@/components/Loading';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import LoginPage from '@/app/login/page';
import { formatTime } from '@/lib/roastTimerUtils';

export default function BrewingPage() {
  const { user, loading: authLoading } = useAuth();
  useAppLifecycle();

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // ストップウォッチの更新処理
  useEffect(() => {
    if (isRunning) {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now() - pausedTimeRef.current;
      }
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          const now = Date.now();
          setElapsedTime((now - startTimeRef.current) / 1000);
        }
      }, 10); // 10msごとに更新（より滑らかな表示）
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (startTimeRef.current !== null) {
        pausedTimeRef.current = elapsedTime * 1000;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, elapsedTime]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setLaps([]);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  };

  const handleLap = () => {
    if (isRunning) {
      setLaps([...laps, elapsedTime]);
    }
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl">
        {/* ヘッダー */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
              title="ホームに戻る"
              aria-label="ホームに戻る"
            >
              <HiHome className="h-6 w-6 flex-shrink-0" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <RiCupLine className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-800 whitespace-nowrap">ドリップガイド</h1>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="space-y-6">
            {/* ストップウォッチセクション */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                ストップウォッチ
              </h2>
              
              {/* タイマー表示 */}
              <div className="flex flex-col items-center justify-center mb-8">
                <div className="text-6xl sm:text-7xl md:text-8xl font-bold text-amber-600 font-mono mb-4">
                  {formatTime(Math.floor(elapsedTime))}
                </div>
                <div className="text-2xl sm:text-3xl font-mono text-gray-500">
                  {(Math.floor((elapsedTime % 1) * 100)).toString().padStart(2, '0')}
                </div>
              </div>

              {/* 操作ボタン */}
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-6">
                {!isRunning ? (
                  <button
                    onClick={handleStart}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-green-700 transition-colors min-h-[44px] min-w-[120px]"
                  >
                    開始
                  </button>
                ) : (
                  <button
                    onClick={handleStop}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-red-700 transition-colors min-h-[44px] min-w-[120px]"
                  >
                    停止
                  </button>
                )}
                <button
                  onClick={handleLap}
                  disabled={!isRunning}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-700 transition-colors min-h-[44px] min-w-[120px] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  ラップ
                </button>
                <button
                  onClick={handleReset}
                  disabled={isRunning}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-700 transition-colors min-h-[44px] min-w-[120px] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  リセット
                </button>
              </div>

              {/* ラップタイム一覧 */}
              {laps.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">ラップタイム</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {laps.map((lap, index) => {
                        const previousLap = index > 0 ? laps[index - 1] : 0;
                        const lapTime = lap - previousLap;
                        return (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 px-3 bg-white rounded border border-gray-200"
                          >
                            <span className="text-gray-700 font-medium">ラップ {index + 1}</span>
                            <div className="flex gap-4">
                              <span className="text-gray-600 font-mono">{formatTime(Math.floor(lapTime))}</span>
                              <span className="text-gray-800 font-mono font-semibold">{formatTime(Math.floor(lap))}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

