'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { useRoastTimer } from '@/hooks/useRoastTimer';
import { formatTime, formatTimeAsMinutes, calculateRecommendedTime } from '@/lib/roastTimerUtils';
import { ALL_BEANS, type BeanName } from '@/lib/beanConfig';
import { loadRoastTimerSettings } from '@/lib/roastTimerSettings';
import { getAllRoastTimerRecords } from '@/lib/roastTimerRecords';
import { CompletionDialog, ContinuousRoastDialog, AfterPurgeDialog } from './RoastTimerDialogs';
import { RoastTimerSettings } from './RoastTimerSettings';
import { HiPlay, HiPause, HiRefresh, HiFastForward, HiCheckCircle, HiClock, HiArrowLeft } from 'react-icons/hi';
import { MdTimer, MdLightbulb, MdLocalFireDepartment } from 'react-icons/md';
import { IoSettings } from 'react-icons/io5';
import Link from 'next/link';

const ROAST_LEVELS: Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'> = [
  '浅煎り',
  '中煎り',
  '中深煎り',
  '深煎り',
];

const WEIGHTS: Array<200 | 300 | 500> = [200, 300, 500];

// 全角数字を半角数字に変換
function convertToHalfWidth(str: string): string {
  return str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
}

// 数字以外の文字を除去
function removeNonNumeric(str: string): string {
  return str.replace(/[^0-9]/g, '');
}

export function RoastTimer() {
  const { user } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const router = useRouter();
  const {
    state,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
    stopSound,
  } = useRoastTimer({ data, updateData, isLoading });

  const [inputMode, setInputMode] = useState<'manual' | 'recommended' | null>(null);
  const [recommendedMode, setRecommendedMode] = useState<'weight' | 'history'>('weight');
  const [beanName, setBeanName] = useState<BeanName | ''>('');
  const [weight, setWeight] = useState<200 | 300 | 500 | ''>('');
  const [roastLevel, setRoastLevel] = useState<
    '浅煎り' | '中煎り' | '中深煎り' | '深煎り' | ''
  >('');
  const [durationMinutes, setDurationMinutes] = useState<string>('');
  const [durationSeconds, setDurationSeconds] = useState<string>('');
  const [recommendedTimeInfo, setRecommendedTimeInfo] = useState<{
    averageDuration: number;
    recommendedDuration: number;
  } | null>(null);
  const [availableBeans, setAvailableBeans] = useState<BeanName[]>([]); // 記録がある豆のリスト

  // ダイアログの状態
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showContinuousRoastDialog, setShowContinuousRoastDialog] = useState(false);
  const [showAfterPurgeDialog, setShowAfterPurgeDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const prevStatusRef = useRef<string | undefined>(undefined);
  const hasInitializedRef = useRef(false);

  // ページを開いた時の初期化（完了状態の場合は自動リセット）
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      // 完了状態の場合は自動的にリセットして、手動スタート画面を表示
      if (state?.status === 'completed') {
        resetTimer();
        setInputMode(null);
        setRecommendedMode('weight');
        setDurationMinutes('');
        setDurationSeconds('');
        setBeanName('');
        setWeight('');
        setRoastLevel('');
        setShowCompletionDialog(false);
        setShowContinuousRoastDialog(false);
        setShowAfterPurgeDialog(false);
      }
    }
  }, [state?.status, resetTimer]);

  // コンポーネントがアンマウントされる時やページを離れる時に音を停止
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopSound();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // コンポーネントがアンマウントされる時にも音を停止
      stopSound();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stopSound]);

  // 記録がある豆のリストを生成（平均焙煎時間が計算できる豆のみ）
  // 過去の記録モードの場合のみ実行
  useEffect(() => {
    if (inputMode === 'recommended' && recommendedMode === 'history' && user) {
      const loadAvailableBeans = async () => {
        try {
          const allRecords = await getAllRoastTimerRecords(user.uid, data);
          
          // 各豆・重さ・焙煎度合いの組み合わせで2件以上の記録があるものを特定
          const beanSet = new Set<BeanName>();
          
          for (const bean of ALL_BEANS) {
            for (const weight of WEIGHTS) {
              for (const roastLevel of ROAST_LEVELS) {
                const matchingRecords = allRecords.filter(
                  (record) =>
                    record.beanName === bean &&
                    record.weight === weight &&
                    record.roastLevel === roastLevel
                );
                
                // 2件以上の記録がある場合、その豆をリストに追加
                if (matchingRecords.length >= 2) {
                  beanSet.add(bean);
                  break; // この豆については既に追加済みなので、次の豆へ
                }
              }
              if (beanSet.has(bean)) {
                break; // この豆については既に追加済みなので、次の豆へ
              }
            }
          }
          
          setAvailableBeans(Array.from(beanSet).sort());
        } catch (error) {
          console.error('Failed to load available beans:', error);
          setAvailableBeans([]);
        }
      };
      
      loadAvailableBeans();
    } else {
      setAvailableBeans([]);
    }
  }, [inputMode, recommendedMode, user, data]);

  // 完了状態を検出してダイアログを表示（runningからcompletedに変化した時のみ）
  useEffect(() => {
    const currentStatus = state?.status;
    const prevStatus = prevStatusRef.current;

    // runningからcompletedに変化した時のみダイアログを表示
    if (
      prevStatus === 'running' &&
      currentStatus === 'completed' &&
      !showCompletionDialog &&
      !showContinuousRoastDialog &&
      !showAfterPurgeDialog
    ) {
      setShowCompletionDialog(true);
    }

    // 状態を更新
    prevStatusRef.current = currentStatus;
  }, [state?.status, showCompletionDialog, showContinuousRoastDialog, showAfterPurgeDialog]);

  // 重さに応じてデフォルト時間を設定（200g→8分、300g→9分、500g→10分）
  // 重さモードの場合のみ適用
  const prevWeightRef = useRef<200 | 300 | 500 | ''>('');
  useEffect(() => {
    if (inputMode === 'recommended' && recommendedMode === 'weight' && weight !== '') {
      const defaultMinutes: Record<200 | 300 | 500, number> = {
        200: 8,
        300: 9,
        500: 10,
      };
      const defaultMin = defaultMinutes[weight];
      
      // 重さが変更された場合、または時間が未設定の場合、デフォルト時間を設定
      if (prevWeightRef.current !== weight || !durationMinutes || durationMinutes === '0') {
        setDurationMinutes(defaultMin.toString());
        setDurationSeconds('0');
      }
      prevWeightRef.current = weight;
    } else {
      prevWeightRef.current = '';
    }
  }, [inputMode, recommendedMode, weight, durationMinutes]);

  // おすすめ時間を計算（過去の記録モードで、豆と焙煎度合いが選択されている場合のみ）
  useEffect(() => {
    if (inputMode === 'recommended' && recommendedMode === 'history' && beanName && weight !== '' && roastLevel && user) {
      const calculateRecommended = async () => {
        try {
          const settings = await loadRoastTimerSettings(user.uid);
          const allRecords = await getAllRoastTimerRecords(user.uid, data);
          const result = calculateRecommendedTime(
            allRecords,
            beanName,
            weight,
            roastLevel,
            settings
          );
          setRecommendedTimeInfo(result);
          if (result && !durationMinutes) {
            setDurationMinutes(Math.round(result.recommendedDuration / 60).toString());
          }
        } catch (error) {
          console.error('Failed to calculate recommended time:', error);
          setRecommendedTimeInfo(null);
        }
      };
      calculateRecommended();
    } else {
      setRecommendedTimeInfo(null);
    }
  }, [beanName, weight, roastLevel, inputMode, recommendedMode, user, data, durationMinutes]);

  const handleStart = async () => {
    if (!user) return;

    let finalDuration: number;

    // 手動入力モードの場合は分のみ必須
    if (inputMode === 'manual') {
      if (!durationMinutes) {
        alert('分を入力してください');
        return;
      }
      const minutes = parseInt(durationMinutes, 10) || 0;
      const seconds = parseInt(durationSeconds, 10) || 0;
      finalDuration = minutes * 60 + seconds;
    } else {
      // おすすめモードの場合は重さのみ必須
      if (weight === '') {
        alert('重さを選択してください');
        return;
      }

      if (recommendedMode === 'history') {
        // 過去の記録モード：豆の名前と焙煎度合いも必須
        if (!beanName) {
          alert('豆の名前を選択してください');
          return;
        }
        if (!roastLevel) {
          alert('焙煎度合いを選択してください');
          return;
        }
        
        // 過去の記録モード：おすすめ時間の確認ダイアログ（豆と焙煎度合いが選択されている場合のみ）
        if (recommendedTimeInfo && beanName && roastLevel) {
          const confirmed = confirm(
            `過去の記録から、平均焙煎時間は${formatTimeAsMinutes(recommendedTimeInfo.averageDuration)}、おすすめタイマー時間は${formatTimeAsMinutes(recommendedTimeInfo.recommendedDuration)}です。\nこの時間でタイマーを開始しますか？`
          );
          if (!confirmed) {
            return;
          }
          // おすすめ時間を使用
          finalDuration = recommendedTimeInfo.recommendedDuration;
        } else {
          // おすすめ時間が計算されていない場合は、重さに応じたデフォルト時間を使用
          const defaultMinutes: Record<200 | 300 | 500, number> = {
            200: 8,
            300: 9,
            500: 10,
          };
          const defaultMin = defaultMinutes[weight];
          finalDuration = defaultMin * 60;
        }
      } else {
        // 重さモード：重さに応じたデフォルト時間を使用
        const defaultMinutes: Record<200 | 300 | 500, number> = {
          200: 8,
          300: 9,
          500: 10,
        };
        const defaultMin = defaultMinutes[weight];
        finalDuration = defaultMin * 60;
      }
    }
    
    if (finalDuration <= 0) {
      alert('有効な時間を入力してください');
      return;
    }

    // 通知ID: 2=手動、3=おすすめ
    const notificationId = inputMode === 'recommended' ? 3 : 2;

    await startTimer(
      finalDuration,
      notificationId,
      inputMode === 'recommended' && beanName !== '' ? beanName : undefined,
      inputMode === 'recommended' && weight !== '' ? weight : undefined,
      inputMode === 'recommended' && roastLevel !== '' ? roastLevel : undefined
    );
  };

  const handlePause = () => {
    pauseTimer();
  };

  const handleResume = async () => {
    await resumeTimer();
  };

  const handleReset = () => {
    if (confirm('タイマーをリセットしますか？')) {
      // 音を確実に停止
      stopSound();
      resetTimer();
      setInputMode(null);
      setRecommendedMode('weight');
      setDurationMinutes('');
      setDurationSeconds('');
      setBeanName('');
      setWeight('');
      setRoastLevel('');
      setShowCompletionDialog(false);
      setShowContinuousRoastDialog(false);
      setShowAfterPurgeDialog(false);
    }
  };

  const handleSkip = () => {
    if (confirm('タイマーをスキップして完了にしますか？')) {
      skipTimer();
    }
  };

  // 完了ダイアログのOKボタン
  const handleCompletionOk = () => {
    // 音を確実に停止
    stopSound();
    setShowCompletionDialog(false);
    setShowContinuousRoastDialog(true);
  };

  // 連続焙煎ダイアログの「はい」
  const handleContinuousRoastYes = () => {
    // 音を確実に停止
    stopSound();
    setShowContinuousRoastDialog(false);
    
    // タイマーをリセット
    resetTimer();
    setInputMode(null);
    setRecommendedMode('weight');
    setDurationMinutes('');
    setDurationSeconds('');
    setBeanName('');
    setWeight('');
    setRoastLevel('');
    
    // 連続焙煎の場合は、ローストタイマー画面に戻る
    router.push('/roast-timer');
  };

  // 連続焙煎ダイアログの「いいえ」
  const handleContinuousRoastNo = () => {
    setShowContinuousRoastDialog(false);
    setShowAfterPurgeDialog(true);
  };

  // アフターパージダイアログの「記録に進む」
  const handleAfterPurgeRecord = () => {
    // 音を確実に停止
    stopSound();
    setShowAfterPurgeDialog(false);
    
    // タイマー状態から情報を取得してクエリパラメータとして渡す
    if (state && state.beanName && state.weight && state.roastLevel && state.elapsed > 0) {
      const params = new URLSearchParams({
        beanName: state.beanName,
        weight: state.weight.toString(),
        roastLevel: state.roastLevel,
        duration: Math.round(state.elapsed).toString(),
      });
      router.push(`/roast-record?${params.toString()}`);
    } else {
      // タイマー情報がない場合は、空の状態で遷移
      router.push('/roast-record');
    }
  };

  // アフターパージダイアログの「閉じる」
  const handleAfterPurgeClose = () => {
    // 音を確実に停止
    stopSound();
    setShowAfterPurgeDialog(false);
    resetTimer();
    setInputMode(null);
    setRecommendedMode('weight');
    setDurationMinutes('');
    setBeanName('');
    setWeight('');
    setRoastLevel('');
  };

  // 入力値の正規化（全角数字を半角に変換、数字以外を除去）
  const handleDurationMinutesChange = (value: string) => {
    const halfWidth = convertToHalfWidth(value);
    const numericOnly = removeNonNumeric(halfWidth);
    setDurationMinutes(numericOnly);
  };

  const handleDurationSecondsChange = (value: string) => {
    const halfWidth = convertToHalfWidth(value);
    const numericOnly = removeNonNumeric(halfWidth);
    // 秒は0-59の範囲に制限
    if (numericOnly === '' || (parseInt(numericOnly, 10) >= 0 && parseInt(numericOnly, 10) <= 59)) {
      setDurationSeconds(numericOnly);
    }
  };

  const isRunning = state?.status === 'running';
  const isPaused = state?.status === 'paused';
  const isCompleted = state?.status === 'completed';
  const isIdle = !state || state.status === 'idle';

  // 円形プログレスバーの計算
  const getProgress = () => {
    if (!state || state.duration === 0) return 0;
    const progress = (state.elapsed / state.duration) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const progress = getProgress();
  const remaining = state ? Math.max(0, state.remaining) : 0;
  
  // SVG円形プログレスバーの設定（レスポンシブ対応、余白を活用して大きく表示）
  const [circleSize, setCircleSize] = useState(340);
  const strokeWidth = 16;
  
  // 画面サイズに応じて円のサイズを調整（スマホでは控えめに、デスクトップでは大きく表示）
  useEffect(() => {
    const updateSize = () => {
      // 画面の高さを考慮してサイズを決定
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // スマホ（640px未満）の場合は控えめなサイズ
      if (viewportWidth < 640) {
        if (viewportHeight >= 900) {
          setCircleSize(300);
        } else if (viewportHeight >= 700) {
          setCircleSize(280);
        } else {
          setCircleSize(260);
        }
      } else if (viewportHeight >= 900) {
        // 大きな画面
        if (viewportWidth >= 1024) {
          setCircleSize(480); // lg以上
        } else if (viewportWidth >= 768) {
          setCircleSize(440); // md以上
        } else {
          setCircleSize(400); // sm以上
        }
      } else if (viewportHeight >= 700) {
        // 中程度の画面
        if (viewportWidth >= 1024) {
          setCircleSize(440);
        } else if (viewportWidth >= 768) {
          setCircleSize(400);
        } else {
          setCircleSize(360);
        }
      } else {
        // 小さな画面
        if (viewportWidth >= 768) {
          setCircleSize(360);
        } else {
          setCircleSize(320);
        }
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // 色の決定
  const getProgressColor = () => {
    if (isCompleted) return '#10b981';
    if (isPaused) return '#f59e0b';
    if (isRunning) return '#d97706';
    return '#d1d5db';
  };

  const progressColor = getProgressColor();

  return (
    <div className="h-full flex flex-col">
      {/* ダイアログ */}
      <CompletionDialog
        isOpen={showCompletionDialog}
        onClose={() => {
          // ダイアログを閉じる時も音を停止
          stopSound();
          setShowCompletionDialog(false);
        }}
        onContinue={handleCompletionOk}
      />
      <ContinuousRoastDialog
        isOpen={showContinuousRoastDialog}
        onClose={() => setShowContinuousRoastDialog(false)}
        onYes={handleContinuousRoastYes}
        onNo={handleContinuousRoastNo}
      />
      <AfterPurgeDialog
        isOpen={showAfterPurgeDialog}
        onClose={handleAfterPurgeClose}
        onRecord={handleAfterPurgeRecord}
      />

      {/* タイマー表示（実行中・一時停止中・完了時のみ表示） */}
      {!isIdle && (
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative px-4 sm:px-6 py-8">
          {/* ヘッダーボタン（オーバーレイ） */}
          <Link
            href="/"
            className="absolute top-4 left-4 z-10 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
            title="戻る"
            aria-label="戻る"
          >
            <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
          </Link>
          {state?.status === 'completed' && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
                title="設定"
                aria-label="設定"
              >
                <IoSettings className="h-6 w-6 flex-shrink-0" />
              </button>
              <Link
                href="/roast-record"
                className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 flex-shrink-0"
                aria-label="ロースト履歴一覧"
              >
                <HiClock className="text-lg flex-shrink-0" />
                <span className="whitespace-nowrap">ロースト履歴</span>
              </Link>
            </div>
          )}
          
          <div className="flex flex-col items-center justify-center w-full">
            {/* タイトル */}
            {(isRunning || isPaused) && (
              <div className="text-center space-y-2 flex-shrink-0 mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-lg mb-2">
                  <MdLocalFireDepartment className="text-3xl sm:text-4xl md:text-5xl text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                  焙煎中
                </h2>
              </div>
            )}
            {isCompleted && (
              <div className="text-center space-y-2 flex-shrink-0 mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg mb-2">
                  <HiCheckCircle className="text-3xl sm:text-4xl md:text-5xl text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                  焙煎完了
                </h2>
              </div>
            )}

            {/* 円形プログレスバー */}
            <div className="relative flex-shrink-0 mb-4 sm:mb-6" style={{ width: circleSize, height: circleSize }}>
              <svg
                width={circleSize}
                height={circleSize}
                className="transform -rotate-90"
                style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
              >
                <circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  fill="none"
                  stroke={progressColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{
                    transition: isRunning
                      ? 'stroke-dashoffset 0.1s linear'
                      : 'stroke-dashoffset 0.3s ease-out, stroke 0.3s ease-out',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-amber-600 font-sans">
                  {formatTime(Math.floor(remaining))}
                </div>
                {state && (
                  <div className="text-base sm:text-lg md:text-xl text-gray-500 mt-2 sm:mt-3">
                    {formatTime(Math.floor(state.elapsed))} / {formatTime(state.duration)}
                  </div>
                )}
                {isCompleted && (
                  <div className="text-sm sm:text-base md:text-lg font-semibold text-green-600 mt-2 sm:mt-3">
                    ロースト完了！
                  </div>
                )}
                {isPaused && (
                  <div className="text-xs sm:text-sm md:text-base text-amber-600 mt-2 sm:mt-3 font-medium">
                    一時停止中
                  </div>
                )}
              </div>
            </div>

            {/* 実行中の情報表示 */}
            {state && (isRunning || isPaused || isCompleted) && (
              <div className="text-center space-y-0.5 text-sm sm:text-base text-gray-600 flex-shrink-0 mb-4 sm:mb-6">
                {state.beanName && <div>豆の名前: {state.beanName}</div>}
                {state.weight && <div>重さ: {state.weight}g</div>}
                {state.roastLevel && <div>焙煎度合い: {state.roastLevel}</div>}
              </div>
            )}

            {/* 操作ボタン */}
            {isRunning && (
              <div className="flex items-center justify-center gap-2 sm:gap-4 w-full max-w-md flex-shrink-0">
                <button
                  onClick={handlePause}
                  className="flex items-center justify-center gap-1 px-2.5 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-yellow-600 hover:to-yellow-700 active:scale-[0.98] transition-all duration-200 text-xs sm:text-base min-h-[44px] flex-1 max-w-[200px]"
                >
                  <HiPause className="text-xl sm:text-2xl flex-shrink-0" />
                  <span>一時停止</span>
                </button>
                <button
                  onClick={handleSkip}
                  className="flex items-center justify-center gap-1 px-2.5 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-gray-600 hover:to-gray-700 active:scale-[0.98] transition-all duration-200 text-xs sm:text-base min-h-[44px] flex-1 max-w-[200px]"
                >
                  <HiFastForward className="text-xl sm:text-2xl flex-shrink-0" />
                  <span>スキップ</span>
                </button>
              </div>
            )}
            {isPaused && (
              <div className="flex items-center justify-center gap-2 sm:gap-4 w-full max-w-md flex-shrink-0">
                <button
                  onClick={handleResume}
                  className="flex items-center justify-center gap-1 px-2.5 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all duration-200 text-xs sm:text-base min-h-[44px] flex-1 max-w-[200px]"
                >
                  <HiPlay className="text-xl sm:text-2xl flex-shrink-0" />
                  <span>再開</span>
                </button>
                <button
                  onClick={handleSkip}
                  className="flex items-center justify-center gap-1 px-2.5 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-gray-600 hover:to-gray-700 active:scale-[0.98] transition-all duration-200 text-xs sm:text-base min-h-[44px] flex-1 max-w-[200px]"
                >
                  <HiFastForward className="text-xl sm:text-2xl flex-shrink-0" />
                  <span>スキップ</span>
                </button>
              </div>
            )}
            {isCompleted && (
              <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-md flex-shrink-0">
                <div></div>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1 px-2.5 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-gray-600 hover:to-gray-700 active:scale-[0.98] transition-all duration-200 text-xs sm:text-base min-h-[44px] min-w-[44px]"
                >
                  <HiRefresh className="text-xl sm:text-2xl flex-shrink-0" />
                  <span>リセット</span>
                </button>
                <div></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 設定フォーム（idle状態のみ表示） */}
      {isIdle && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto relative">
          {/* ヘッダーボタン */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
            <button
              onClick={() => {
                if (inputMode === null) {
                  router.back();
                } else {
                  setInputMode(null);
                  setRecommendedMode('weight');
                  setBeanName('');
                  setWeight('');
                  setRoastLevel('');
                }
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] pointer-events-auto"
              title="戻る"
              aria-label="戻る"
            >
              <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
            </button>
          </div>
          {inputMode === null ? (
            // モード選択画面（手動入力も可能）
            <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
              {/* タイトルセクション */}
              <div className="text-center space-y-4 mb-10 sm:mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg mb-3">
                  <MdTimer className="text-white text-4xl sm:text-5xl" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                  ローストタイマー
                </h3>
                <p className="text-base sm:text-lg text-gray-500">
                  焙煎時間を設定してスタート
                </p>
              </div>

              {/* 手動入力フィールド */}
              <div className="space-y-4 max-w-md mx-auto w-full mb-8 sm:mb-10">
                <label className="block text-sm sm:text-base font-semibold text-gray-700 uppercase tracking-wide">
                  時間設定
                </label>
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                      分 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={durationMinutes}
                      onChange={(e) => handleDurationMinutesChange(e.target.value)}
                      placeholder="10"
                      className="w-full rounded-lg border-2 border-gray-200 px-4 py-3.5 sm:py-4 text-lg sm:text-xl text-gray-900 bg-white focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all duration-200 font-semibold text-center min-h-[56px] shadow-sm hover:border-gray-300"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <span className="text-3xl font-bold text-gray-400">:</span>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                      秒
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={durationSeconds}
                      onChange={(e) => handleDurationSecondsChange(e.target.value)}
                      placeholder="30"
                      maxLength={2}
                      className="w-full rounded-lg border-2 border-gray-200 px-4 py-3.5 sm:py-4 text-lg sm:text-xl text-gray-900 bg-white focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all duration-200 font-semibold text-center min-h-[56px] shadow-sm hover:border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* ボタンセクション */}
              <div className="space-y-3 sm:space-y-4 max-w-md mx-auto w-full">
                {/* 手動スタートボタン */}
                <button
                  onClick={async () => {
                    if (!durationMinutes) {
                      alert('分を入力してください');
                      return;
                    }
                    const minutes = parseInt(durationMinutes, 10) || 0;
                    const seconds = parseInt(durationSeconds, 10) || 0;
                    const duration = minutes * 60 + seconds;
                    if (duration <= 0) {
                      alert('有効な時間を入力してください');
                      return;
                    }
                    await startTimer(duration, 2); // 通知ID: 2=手動
                  }}
                  disabled={!durationMinutes || durationMinutes.trim() === ''}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 sm:py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all duration-200 min-h-[60px] sm:min-h-[64px] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100 disabled:hover:from-gray-300 disabled:hover:to-gray-400"
                >
                  <HiPlay className="text-xl sm:text-2xl" />
                  <span>手動で焙煎スタート</span>
                </button>

                {/* おすすめ焙煎ボタン */}
                <button
                  onClick={() => {
                    // おすすめモードに切り替わる時は、手動入力の値をクリア
                    setDurationMinutes('');
                    setDurationSeconds('');
                    setRecommendedMode('weight'); // デフォルトは重さモード
                    setInputMode('recommended');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 sm:py-5 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-2 border-amber-200 rounded-xl font-bold text-base sm:text-lg shadow-sm hover:shadow-md hover:from-amber-100 hover:to-amber-200 hover:border-amber-300 active:scale-[0.98] transition-all duration-200 min-h-[60px] sm:min-h-[64px]"
                >
                  <MdLightbulb className="text-xl sm:text-2xl text-amber-600" />
                  <span>おすすめタイマー</span>
                </button>
              </div>
            </div>
          ) : inputMode === 'manual' ? (
            // 手動入力モード
            <div className="flex-1 flex flex-col pt-16 px-4 sm:px-6">
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <MdTimer className="text-white text-lg" />
                  </div>
                  手動入力
                </h3>
              </div>

              <div className="space-y-6 flex-1">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    時間設定
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                        分 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={durationMinutes}
                        onChange={(e) => handleDurationMinutesChange(e.target.value)}
                        placeholder="10"
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-lg sm:text-xl text-gray-900 bg-gray-50 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all duration-200 font-semibold text-center min-h-[52px] shadow-sm hover:border-gray-300"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <span className="text-2xl font-bold text-gray-400">:</span>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                        秒
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={durationSeconds}
                        onChange={(e) => handleDurationSecondsChange(e.target.value)}
                        placeholder="30"
                        maxLength={2}
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-lg sm:text-xl text-gray-900 bg-gray-50 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all duration-200 font-semibold text-center min-h-[52px] shadow-sm hover:border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex-shrink-0">
                  <button
                    onClick={handleStart}
                    disabled={!durationMinutes}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all duration-200 text-base sm:text-lg min-h-[56px] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100 disabled:hover:from-gray-300 disabled:hover:to-gray-400"
                  >
                    <HiPlay className="text-2xl" />
                    <span>スタート</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // おすすめモード
            <div className="flex-1 flex flex-col px-4 sm:px-6">
              <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center py-8">
              <div className="flex items-center justify-center mb-6 flex-shrink-0">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <MdLightbulb className="text-white text-lg" />
                  </div>
                  おすすめタイマー
                </h3>
              </div>

              {/* モード切り替えタブ */}
              <div className="mb-6 flex-shrink-0">
                <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setRecommendedMode('weight');
                      setBeanName('');
                      setRoastLevel('');
                      setRecommendedTimeInfo(null);
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-md text-sm sm:text-base font-semibold transition-all duration-200 ${
                      recommendedMode === 'weight'
                        ? 'bg-white text-amber-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    重さで設定
                  </button>
                  <button
                    onClick={() => {
                      setRecommendedMode('history');
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-md text-sm sm:text-base font-semibold transition-all duration-200 ${
                      recommendedMode === 'history'
                        ? 'bg-white text-amber-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    過去の記録から設定
                  </button>
                </div>
              </div>

              <div className="space-y-5 flex-1">
                {recommendedMode === 'weight' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        重さ <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={weight}
                        onChange={(e) =>
                          setWeight(e.target.value ? (parseInt(e.target.value, 10) as 200 | 300 | 500) : '')
                        }
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-base sm:text-lg text-gray-900 bg-gray-50 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all duration-200 shadow-sm hover:border-gray-300 min-h-[52px]"
                      >
                        <option value="">選択してください</option>
                        {WEIGHTS.map((w) => (
                          <option key={w} value={w}>
                            {w}g
                          </option>
                        ))}
                      </select>
                    </div>

                    {weight !== '' && (
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                        <p className="text-sm sm:text-base text-gray-700">
                          重さに応じたおすすめ時間は{' '}
                          <span className="font-bold text-amber-800">
                            {weight === 200 ? '8分' : weight === 300 ? '9分' : '10分'}
                          </span>{' '}
                          です
                        </p>
                      </div>
                    )}
                  </>
                )}

                {recommendedMode === 'history' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        豆の名前 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={beanName}
                        onChange={(e) => setBeanName(e.target.value as BeanName)}
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-base sm:text-lg text-gray-900 bg-gray-50 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all duration-200 shadow-sm hover:border-gray-300 min-h-[52px]"
                      >
                        <option value="">選択してください</option>
                        {availableBeans.length > 0 ? (
                          availableBeans.map((bean) => (
                            <option key={bean} value={bean}>
                              {bean}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            記録がありません（2件以上の記録が必要です）
                          </option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        焙煎度合い <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={roastLevel}
                        onChange={(e) =>
                          setRoastLevel(
                            e.target.value as '浅煎り' | '中煎り' | '中深煎り' | '深煎り' | ''
                          )
                        }
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-base sm:text-lg text-gray-900 bg-gray-50 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all duration-200 shadow-sm hover:border-gray-300 min-h-[52px]"
                      >
                        <option value="">選択してください</option>
                        {ROAST_LEVELS.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        重さ <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={weight}
                        onChange={(e) =>
                          setWeight(e.target.value ? (parseInt(e.target.value, 10) as 200 | 300 | 500) : '')
                        }
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-base sm:text-lg text-gray-900 bg-gray-50 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all duration-200 shadow-sm hover:border-gray-300 min-h-[52px]"
                      >
                        <option value="">選択してください</option>
                        {WEIGHTS.map((w) => (
                          <option key={w} value={w}>
                            {w}g
                          </option>
                        ))}
                      </select>
                    </div>

                    {!recommendedTimeInfo && beanName && weight !== '' && roastLevel && (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 shadow-sm">
                        <p className="text-sm sm:text-base text-yellow-800">
                          この組み合わせの記録が2件未満のため、平均焙煎時間を計算できません。重さに応じたデフォルト時間（{weight === 200 ? '8分' : weight === 300 ? '9分' : '10分'}）でタイマーを開始します。
                        </p>
                      </div>
                    )}

                    {recommendedTimeInfo && (
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                        <p className="text-sm sm:text-base text-gray-700">
                          過去の記録から、平均焙煎時間は{' '}
                          <span className="font-bold text-amber-800">
                            {formatTimeAsMinutes(recommendedTimeInfo.averageDuration)}
                          </span>
                          、おすすめタイマー時間は{' '}
                          <span className="font-bold text-amber-800">
                            {formatTimeAsMinutes(recommendedTimeInfo.recommendedDuration)}
                          </span>{' '}
                          です
                        </p>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-2 flex-shrink-0">
                  <button
                    onClick={handleStart}
                    disabled={
                      !weight ||
                      (recommendedMode === 'history' && (!beanName || !roastLevel))
                    }
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all duration-200 text-base sm:text-lg min-h-[56px] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100 disabled:hover:from-gray-300 disabled:hover:to-gray-400"
                  >
                    <HiPlay className="text-2xl" />
                    <span>スタート</span>
                  </button>
                </div>
              </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 設定モーダル */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-4 sm:p-6 my-4">
            <RoastTimerSettings
              onClose={() => setShowSettings(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
