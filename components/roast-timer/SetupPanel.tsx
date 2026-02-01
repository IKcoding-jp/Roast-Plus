'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { HiPlay } from 'react-icons/hi';
import { MdTimer } from 'react-icons/md';
import { useToastContext } from '@/components/Toast';
import { ALL_BEANS, type BeanName } from '@/lib/beanConfig';
import { loadRoastTimerSettings } from '@/lib/roastTimerSettings';
import { getAllRoastTimerRecords } from '@/lib/roastTimerRecords';
import { formatTimeAsMinutesAndSeconds, calculateRecommendedTime } from '@/lib/roastTimerUtils';
import { ROAST_LEVELS, WEIGHTS, DEFAULT_DURATIONS as DEFAULT_DURATION_BY_WEIGHT, type RoastLevel, type Weight } from '@/lib/constants';
import { convertToHalfWidth, removeNonNumeric } from '@/lib/utils';
import { ModeSelectView } from './ModeSelectView';
import { RecommendedModeView } from './RecommendedModeView';

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
  const { showToast } = useToastContext();

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
        showToast('ログインが必要です', 'warning');
        return;
      }
      if (isLoading) {
        showToast('データを読み込み中です。しばらくお待ちください。', 'info');
        return;
      }

      let finalDuration: number;

      if (inputMode === 'manual') {
        const hasMinutes = durationMinutes && durationMinutes.trim() !== '';
        const hasSeconds = durationSeconds && durationSeconds.trim() !== '';

        if (!hasMinutes && !hasSeconds) {
          showToast('分または秒を入力してください', 'warning');
          return;
        }

        const minutes = parseInt(durationMinutes, 10) || 0;
        const seconds = parseInt(durationSeconds, 10) || 0;
        finalDuration = minutes * 60 + seconds;
      } else {
        if (weight === '') {
          showToast('重さを選択してください', 'warning');
          return;
        }

        if (recommendedMode === 'history') {
          if (!beanName) {
            showToast('豆の名前を選択してください', 'warning');
            return;
          }
          if (!roastLevel) {
            showToast('焙煎度合いを選択してください', 'warning');
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
        showToast('有効な時間を入力してください', 'warning');
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
      showToast('タイマーの開始に失敗しました。もう一度お試しください。', 'error');
    }
  };

  // 手動スタートハンドラー（モード選択画面から直接スタート）
  const handleManualStart = async () => {
    try {
      if (!user) {
        showToast('ログインが必要です', 'warning');
        return;
      }
      if (isLoading) {
        showToast('データを読み込み中です。しばらくお待ちください。', 'info');
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
        showToast('有効な時間を入力してください', 'warning');
        return;
      }
      await onStart(duration);
    } catch (error) {
      console.error('Failed to start timer:', error);
      showToast('タイマーの開始に失敗しました。もう一度お試しください。', 'error');
    }
  };

  // おすすめモード切り替え
  const handleRecommendedModeChange = (mode: 'weight' | 'history') => {
    if (mode === 'weight') {
      setBeanName('');
      setRoastLevel('');
      setRecommendedTimeInfo(null);
    }
    setRecommendedMode(mode);
  };

  // 豆名変更
  const handleBeanNameChange = (value: BeanName | '') => {
    setBeanName(value);
    setWeight('');
    setRoastLevel('');
  };

  // モード選択画面
  if (inputMode === null) {
    return (
      <ModeSelectView
        durationMinutes={durationMinutes}
        durationSeconds={durationSeconds}
        onDurationMinutesChange={handleDurationMinutesChange}
        onDurationSecondsChange={handleDurationSecondsChange}
        onManualStart={handleManualStart}
        onRecommendedMode={() => {
          setDurationMinutes('');
          setDurationSeconds('');
          setRecommendedMode('weight');
          setInputMode('recommended');
        }}
        isStartDisabled={
          ((!durationMinutes || durationMinutes.trim() === '') &&
            (!durationSeconds || durationSeconds.trim() === '')) ||
          !user ||
          isLoading
        }
      />
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
    <RecommendedModeView
      recommendedMode={recommendedMode}
      beanName={beanName}
      weight={weight}
      roastLevel={roastLevel}
      availableBeans={availableBeans}
      availableWeights={availableWeights}
      availableRoastLevels={availableRoastLevels}
      recommendedTimeInfo={recommendedTimeInfo}
      onRecommendedModeChange={handleRecommendedModeChange}
      onBeanNameChange={handleBeanNameChange}
      onWeightChange={setWeight}
      onRoastLevelChange={setRoastLevel}
      onStart={handleStart}
      isStartDisabled={!weight || (recommendedMode === 'history' && (!beanName || !roastLevel))}
    />
  );
}

// 親コンポーネントから呼び出すための戻るハンドラーをexport
export { type SetupPanelProps };
