'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { HiPlay } from 'react-icons/hi';
import { MdTimer, MdLightbulb } from 'react-icons/md';
import { ALL_BEANS, type BeanName } from '@/lib/beanConfig';
import { loadRoastTimerSettings } from '@/lib/roastTimerSettings';
import { getAllRoastTimerRecords } from '@/lib/roastTimerRecords';
import { formatTimeAsMinutesAndSeconds, calculateRecommendedTime } from '@/lib/roastTimerUtils';
import { ROAST_LEVELS, WEIGHTS, DEFAULT_DURATION_BY_WEIGHT, type RoastLevel, type Weight } from './constants';
import { convertToHalfWidth, removeNonNumeric } from './utils';

interface SetupPanelProps {
  onStart: (
    duration: number,
    beanName?: BeanName,
    weight?: Weight,
    roastLevel?: RoastLevel
  ) => Promise<void>;
  isLoading: boolean;
}

/**
 * タイマー設定パネル（idle状態で表示）
 * - モード選択画面
 * - 手動入力モード
 * - おすすめモード
 */
export function SetupPanel({ onStart, isLoading }: SetupPanelProps) {
  const { user } = useAuth();
  const { data } = useAppData();

  // 入力状態
  const [inputMode, setInputMode] = useState<'manual' | 'recommended' | null>(null);
  const [recommendedMode, setRecommendedMode] = useState<'weight' | 'history'>('weight');
  const [beanName, setBeanName] = useState<BeanName | ''>('');
  const [weight, setWeight] = useState<Weight | ''>('');
  const [roastLevel, setRoastLevel] = useState<RoastLevel | ''>('');
  const [durationMinutes, setDurationMinutes] = useState<string>('');
  const [durationSeconds, setDurationSeconds] = useState<string>('');
  const [recommendedTimeInfo, setRecommendedTimeInfo] = useState<{
    averageDuration: number;
    recommendedDuration: number;
  } | null>(null);
  const [availableBeans, setAvailableBeans] = useState<BeanName[]>([]);
  const [availableWeights, setAvailableWeights] = useState<Weight[]>([]);
  const [availableRoastLevels, setAvailableRoastLevels] = useState<RoastLevel[]>([]);

  const prevWeightRef = useRef<Weight | ''>('');

  // 記録がある豆のリストを生成（過去の記録モードの場合のみ）
  useEffect(() => {
    if (inputMode === 'recommended' && recommendedMode === 'history' && user) {
      const loadAvailableBeans = async () => {
        try {
          const allRecords = await getAllRoastTimerRecords(user.uid, data);
          const beanSet = new Set<BeanName>();

          for (const bean of ALL_BEANS) {
            for (const w of WEIGHTS) {
              for (const level of ROAST_LEVELS) {
                const matchingRecords = allRecords.filter(
                  (record) =>
                    record.beanName === bean && record.weight === w && record.roastLevel === level
                );
                if (matchingRecords.length >= 2) {
                  beanSet.add(bean);
                  break;
                }
              }
              if (beanSet.has(bean)) break;
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

  // 選択された豆の記録がある重さと焙煎度合いのリストを生成
  useEffect(() => {
    if (inputMode === 'recommended' && recommendedMode === 'history' && beanName && user) {
      const loadAvailableOptions = async () => {
        try {
          const allRecords = await getAllRoastTimerRecords(user.uid, data);
          const beanRecords = allRecords.filter((record) => record.beanName === beanName);

          const weightSet = new Set<Weight>();
          for (const w of WEIGHTS) {
            for (const level of ROAST_LEVELS) {
              const matchingRecords = beanRecords.filter(
                (record) => record.weight === w && record.roastLevel === level
              );
              if (matchingRecords.length >= 2) {
                weightSet.add(w);
                break;
              }
            }
          }

          const roastLevelSet = new Set<RoastLevel>();
          for (const level of ROAST_LEVELS) {
            for (const w of WEIGHTS) {
              const matchingRecords = beanRecords.filter(
                (record) => record.weight === w && record.roastLevel === level
              );
              if (matchingRecords.length >= 2) {
                roastLevelSet.add(level);
                break;
              }
            }
          }

          setAvailableWeights(Array.from(weightSet).sort((a, b) => a - b));
          setAvailableRoastLevels(Array.from(roastLevelSet));
          setWeight('');
          setRoastLevel('');
        } catch (error) {
          console.error('Failed to load available options:', error);
          setAvailableWeights([]);
          setAvailableRoastLevels([]);
        }
      };

      loadAvailableOptions();
    } else {
      setAvailableWeights([]);
      setAvailableRoastLevels([]);
    }
  }, [inputMode, recommendedMode, beanName, user, data]);

  // 重さに応じてデフォルト時間を設定（重さモードの場合のみ）
  useEffect(() => {
    if (inputMode === 'recommended' && recommendedMode === 'weight' && weight !== '') {
      const defaultMin = DEFAULT_DURATION_BY_WEIGHT[weight];

      if (prevWeightRef.current !== weight || !durationMinutes || durationMinutes === '0') {
        setDurationMinutes(defaultMin.toString());
        setDurationSeconds('0');
      }
      prevWeightRef.current = weight;
    } else {
      prevWeightRef.current = '';
    }
  }, [inputMode, recommendedMode, weight, durationMinutes]);

  // おすすめ時間を計算（過去の記録モード）
  useEffect(() => {
    if (
      inputMode === 'recommended' &&
      recommendedMode === 'history' &&
      beanName &&
      weight !== '' &&
      roastLevel &&
      user
    ) {
      const calculateRecommended = async () => {
        try {
          const settings = await loadRoastTimerSettings();
          const allRecords = await getAllRoastTimerRecords(user.uid, data);
          const result = calculateRecommendedTime(allRecords, beanName, weight, roastLevel, settings);
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

  // 入力値の正規化
  const handleDurationMinutesChange = (value: string) => {
    const halfWidth = convertToHalfWidth(value);
    const numericOnly = removeNonNumeric(halfWidth);
    setDurationMinutes(numericOnly);
  };

  const handleDurationSecondsChange = (value: string) => {
    const halfWidth = convertToHalfWidth(value);
    const numericOnly = removeNonNumeric(halfWidth);
    if (numericOnly === '' || (parseInt(numericOnly, 10) >= 0 && parseInt(numericOnly, 10) <= 59)) {
      setDurationSeconds(numericOnly);
    }
  };

  // スタートハンドラー
  const handleStart = async () => {
    try {
      if (!user) {
        alert('ログインが必要です');
        return;
      }
      if (isLoading) {
        alert('データを読み込み中です。しばらくお待ちください。');
        return;
      }

      let finalDuration: number;

      if (inputMode === 'manual') {
        const hasMinutes = durationMinutes && durationMinutes.trim() !== '';
        const hasSeconds = durationSeconds && durationSeconds.trim() !== '';

        if (!hasMinutes && !hasSeconds) {
          alert('分または秒を入力してください');
          return;
        }

        const minutes = parseInt(durationMinutes, 10) || 0;
        const seconds = parseInt(durationSeconds, 10) || 0;
        finalDuration = minutes * 60 + seconds;
      } else {
        if (weight === '') {
          alert('重さを選択してください');
          return;
        }

        if (recommendedMode === 'history') {
          if (!beanName) {
            alert('豆の名前を選択してください');
            return;
          }
          if (!roastLevel) {
            alert('焙煎度合いを選択してください');
            return;
          }

          if (recommendedTimeInfo && beanName && roastLevel) {
            const confirmed = confirm(
              `過去の記録から、平均焙煎時間は${formatTimeAsMinutesAndSeconds(recommendedTimeInfo.averageDuration)}、おすすめタイマー時間は${formatTimeAsMinutesAndSeconds(recommendedTimeInfo.recommendedDuration)}です。\nこの時間でタイマーを開始しますか？`
            );
            if (!confirmed) return;
            finalDuration = recommendedTimeInfo.recommendedDuration;
          } else {
            const defaultMin = DEFAULT_DURATION_BY_WEIGHT[weight];
            finalDuration = defaultMin * 60;
          }
        } else {
          const defaultMin = DEFAULT_DURATION_BY_WEIGHT[weight];
          finalDuration = defaultMin * 60;
        }
      }

      if (finalDuration <= 0) {
        alert('有効な時間を入力してください');
        return;
      }

      await onStart(
        finalDuration,
        inputMode === 'recommended' && beanName !== '' ? beanName : undefined,
        inputMode === 'recommended' && weight !== '' ? weight : undefined,
        inputMode === 'recommended' && roastLevel !== '' ? roastLevel : undefined
      );
    } catch (error) {
      console.error('Failed to start timer:', error);
      alert('タイマーの開始に失敗しました。もう一度お試しください。');
    }
  };

  // 手動スタートハンドラー（モード選択画面から直接スタート）
  const handleManualStart = async () => {
    try {
      if (!user) {
        alert('ログインが必要です');
        return;
      }
      if (isLoading) {
        alert('データを読み込み中です。しばらくお待ちください。');
        return;
      }
      const hasMinutes = durationMinutes && durationMinutes.trim() !== '';
      const hasSeconds = durationSeconds && durationSeconds.trim() !== '';

      if (!hasMinutes && !hasSeconds) {
        alert('分または秒を入力してください');
        return;
      }

      const minutes = parseInt(durationMinutes, 10) || 0;
      const seconds = parseInt(durationSeconds, 10) || 0;
      const duration = minutes * 60 + seconds;

      if (duration <= 0) {
        alert('有効な時間を入力してください');
        return;
      }
      await onStart(duration);
    } catch (error) {
      console.error('Failed to start timer:', error);
      alert('タイマーの開始に失敗しました。もう一度お試しください。');
    }
  };

  // 戻るハンドラー
  const handleBack = () => {
    setInputMode(null);
    setRecommendedMode('weight');
    setBeanName('');
    setWeight('');
    setRoastLevel('');
  };

  // モード選択画面
  if (inputMode === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
        {/* タイトルセクション */}
        <div className="text-center space-y-4 mb-10 sm:mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg mb-3">
            <MdTimer className="text-white text-4xl sm:text-5xl" />
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            ローストタイマー
          </h3>
          <p className="text-base sm:text-lg text-gray-500">焙煎時間を設定してスタート</p>
        </div>

        {/* 手動入力フィールド */}
        <div className="space-y-4 max-w-md mx-auto w-full mb-8 sm:mb-10">
          <label className="block text-sm sm:text-base font-semibold text-gray-700 uppercase tracking-wide">
            時間設定
          </label>
          <div className="flex gap-3 sm:gap-4">
            <div className="flex-1">
              <input
                type="text"
                inputMode="numeric"
                value={durationMinutes}
                onChange={(e) => handleDurationMinutesChange(e.target.value)}
                placeholder="分"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3.5 sm:py-4 text-lg sm:text-xl text-gray-900 bg-white focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all duration-200 font-semibold text-center min-h-[56px] shadow-sm hover:border-gray-300"
              />
            </div>
            <div className="flex items-end pb-2">
              <span className="text-3xl font-bold text-gray-400">:</span>
            </div>
            <div className="flex-1">
              <input
                type="text"
                inputMode="numeric"
                value={durationSeconds}
                onChange={(e) => handleDurationSecondsChange(e.target.value)}
                placeholder="秒"
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
            onClick={handleManualStart}
            disabled={
              ((!durationMinutes || durationMinutes.trim() === '') &&
                (!durationSeconds || durationSeconds.trim() === '')) ||
              !user ||
              isLoading
            }
            className="w-full flex items-center justify-center gap-2 px-6 py-4 sm:py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all duration-200 min-h-[60px] sm:min-h-[64px] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100 disabled:hover:from-gray-300 disabled:hover:to-gray-400"
          >
            <HiPlay className="text-xl sm:text-2xl" />
            <span>手動でタイマースタート</span>
          </button>

          {/* おすすめ焙煎ボタン */}
          <button
            onClick={() => {
              setDurationMinutes('');
              setDurationSeconds('');
              setRecommendedMode('weight');
              setInputMode('recommended');
            }}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 sm:py-5 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-2 border-amber-200 rounded-xl font-bold text-base sm:text-lg shadow-sm hover:shadow-md hover:from-amber-100 hover:to-amber-200 hover:border-amber-300 active:scale-[0.98] transition-all duration-200 min-h-[60px] sm:min-h-[64px]"
          >
            <MdLightbulb className="text-xl sm:text-2xl text-amber-600" />
            <span>おすすめタイマー</span>
          </button>
        </div>
      </div>
    );
  }

  // 手動入力モード
  if (inputMode === 'manual') {
    return (
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
                <input
                  type="text"
                  inputMode="numeric"
                  value={durationMinutes}
                  onChange={(e) => handleDurationMinutesChange(e.target.value)}
                  placeholder="分"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-lg sm:text-xl text-gray-900 bg-gray-50 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all duration-200 font-semibold text-center min-h-[52px] shadow-sm hover:border-gray-300"
                />
              </div>
              <div className="flex items-end pb-2">
                <span className="text-2xl font-bold text-gray-400">:</span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={durationSeconds}
                  onChange={(e) => handleDurationSecondsChange(e.target.value)}
                  placeholder="秒"
                  maxLength={2}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-lg sm:text-xl text-gray-900 bg-gray-50 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all duration-200 font-semibold text-center min-h-[52px] shadow-sm hover:border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex-shrink-0">
            <button
              onClick={handleStart}
              disabled={
                ((!durationMinutes || durationMinutes.trim() === '') &&
                  (!durationSeconds || durationSeconds.trim() === '')) ||
                !user ||
                isLoading
              }
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all duration-200 text-base sm:text-lg min-h-[56px] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100 disabled:hover:from-gray-300 disabled:hover:to-gray-400"
            >
              <HiPlay className="text-2xl" />
              <span>スタート</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // おすすめモード
  return (
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
                    setWeight(e.target.value ? (parseInt(e.target.value, 10) as Weight) : '')
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
                  onChange={(e) => {
                    setBeanName(e.target.value as BeanName);
                    setWeight('');
                    setRoastLevel('');
                  }}
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
                  onChange={(e) => setRoastLevel(e.target.value as RoastLevel | '')}
                  disabled={!beanName}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-base sm:text-lg text-gray-900 bg-gray-50 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all duration-200 shadow-sm hover:border-gray-300 min-h-[52px] disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  <option value="">選択してください</option>
                  {availableRoastLevels.length > 0 ? (
                    availableRoastLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))
                  ) : beanName ? (
                    <option value="" disabled>
                      記録がありません（2件以上の記録が必要です）
                    </option>
                  ) : (
                    <option value="" disabled>
                      豆を選択してください
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  重さ <span className="text-red-500">*</span>
                </label>
                <select
                  value={weight}
                  onChange={(e) =>
                    setWeight(e.target.value ? (parseInt(e.target.value, 10) as Weight) : '')
                  }
                  disabled={!beanName}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-base sm:text-lg text-gray-900 bg-gray-50 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all duration-200 shadow-sm hover:border-gray-300 min-h-[52px] disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  <option value="">選択してください</option>
                  {availableWeights.length > 0 ? (
                    availableWeights.map((w) => (
                      <option key={w} value={w}>
                        {w}g
                      </option>
                    ))
                  ) : beanName ? (
                    <option value="" disabled>
                      記録がありません（2件以上の記録が必要です）
                    </option>
                  ) : (
                    <option value="" disabled>
                      豆を選択してください
                    </option>
                  )}
                </select>
              </div>

              {!recommendedTimeInfo && beanName && weight !== '' && roastLevel && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 shadow-sm">
                  <p className="text-sm sm:text-base text-yellow-800">
                    この組み合わせの記録が2件未満のため、平均焙煎時間を計算できません。重さに応じたデフォルト時間（
                    {weight === 200 ? '8分' : weight === 300 ? '9分' : '10分'}）でタイマーを開始します。
                  </p>
                </div>
              )}

              {recommendedTimeInfo && (
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                  <p className="text-sm sm:text-base text-gray-700">
                    過去の記録から、平均焙煎時間は{' '}
                    <span className="font-bold text-amber-800">
                      {formatTimeAsMinutesAndSeconds(recommendedTimeInfo.averageDuration)}
                    </span>
                    、おすすめタイマー時間は{' '}
                    <span className="font-bold text-amber-800">
                      {formatTimeAsMinutesAndSeconds(recommendedTimeInfo.recommendedDuration)}
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
              disabled={!weight || (recommendedMode === 'history' && (!beanName || !roastLevel))}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all duration-200 text-base sm:text-lg min-h-[56px] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100 disabled:hover:from-gray-300 disabled:hover:to-gray-400"
            >
              <HiPlay className="text-2xl" />
              <span>スタート</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 親コンポーネントから呼び出すための戻るハンドラーをexport
export { type SetupPanelProps };
