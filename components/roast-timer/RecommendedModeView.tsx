'use client';

import { HiPlay } from 'react-icons/hi';
import { MdLightbulb } from 'react-icons/md';
import { formatTimeAsMinutesAndSeconds } from '@/lib/roastTimerUtils';
import { WEIGHTS, type RoastLevel, type Weight } from '@/lib/constants';
import type { BeanName } from '@/lib/beanConfig';

interface RecommendedModeViewProps {
  recommendedMode: 'weight' | 'history';
  beanName: BeanName | '';
  weight: Weight | '';
  roastLevel: RoastLevel | '';
  availableBeans: BeanName[];
  availableWeights: Weight[];
  availableRoastLevels: RoastLevel[];
  recommendedTimeInfo: {
    averageDuration: number;
    recommendedDuration: number;
  } | null;
  onRecommendedModeChange: (mode: 'weight' | 'history') => void;
  onBeanNameChange: (value: BeanName | '') => void;
  onWeightChange: (value: Weight | '') => void;
  onRoastLevelChange: (value: RoastLevel | '') => void;
  onStart: () => Promise<void>;
  isStartDisabled: boolean;
}

/**
 * おすすめモード画面
 * - 重さで設定モード
 * - 過去の記録から設定モード
 */
export function RecommendedModeView({
  recommendedMode,
  beanName,
  weight,
  roastLevel,
  availableBeans,
  availableWeights,
  availableRoastLevels,
  recommendedTimeInfo,
  onRecommendedModeChange,
  onBeanNameChange,
  onWeightChange,
  onRoastLevelChange,
  onStart,
  isStartDisabled,
}: RecommendedModeViewProps) {
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
              onClick={() => onRecommendedModeChange('weight')}
              className={`flex-1 px-4 py-2.5 rounded-md text-sm sm:text-base font-semibold transition-all duration-200 ${
                recommendedMode === 'weight'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              重さで設定
            </button>
            <button
              onClick={() => onRecommendedModeChange('history')}
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
            <WeightModeSection weight={weight} onWeightChange={onWeightChange} />
          )}

          {recommendedMode === 'history' && (
            <HistoryModeSection
              beanName={beanName}
              weight={weight}
              roastLevel={roastLevel}
              availableBeans={availableBeans}
              availableWeights={availableWeights}
              availableRoastLevels={availableRoastLevels}
              recommendedTimeInfo={recommendedTimeInfo}
              onBeanNameChange={onBeanNameChange}
              onWeightChange={onWeightChange}
              onRoastLevelChange={onRoastLevelChange}
            />
          )}

          <div className="pt-2 flex-shrink-0">
            <button
              onClick={onStart}
              disabled={isStartDisabled}
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

// --- サブセクション ---

function WeightModeSection({
  weight,
  onWeightChange,
}: {
  weight: Weight | '';
  onWeightChange: (value: Weight | '') => void;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          重さ <span className="text-red-500">*</span>
        </label>
        <select
          value={weight}
          onChange={(e) =>
            onWeightChange(e.target.value ? (parseInt(e.target.value, 10) as Weight) : '')
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
  );
}

function HistoryModeSection({
  beanName,
  weight,
  roastLevel,
  availableBeans,
  availableWeights,
  availableRoastLevels,
  recommendedTimeInfo,
  onBeanNameChange,
  onWeightChange,
  onRoastLevelChange,
}: {
  beanName: BeanName | '';
  weight: Weight | '';
  roastLevel: RoastLevel | '';
  availableBeans: BeanName[];
  availableWeights: Weight[];
  availableRoastLevels: RoastLevel[];
  recommendedTimeInfo: { averageDuration: number; recommendedDuration: number } | null;
  onBeanNameChange: (value: BeanName | '') => void;
  onWeightChange: (value: Weight | '') => void;
  onRoastLevelChange: (value: RoastLevel | '') => void;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          豆の名前 <span className="text-red-500">*</span>
        </label>
        <select
          value={beanName}
          onChange={(e) => {
            onBeanNameChange(e.target.value as BeanName);
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
          onChange={(e) => onRoastLevelChange(e.target.value as RoastLevel | '')}
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
            onWeightChange(e.target.value ? (parseInt(e.target.value, 10) as Weight) : '')
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
  );
}
