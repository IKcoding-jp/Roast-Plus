'use client';

import { HiPlay } from 'react-icons/hi';
import { MdLightbulb } from 'react-icons/md';
import { formatTimeAsMinutesAndSeconds } from '@/lib/roastTimerUtils';
import { WEIGHTS, type RoastLevel, type Weight } from '@/lib/constants';
import type { BeanName } from '@/lib/beanConfig';
import { Select, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import type { SelectOption } from '@/components/ui';

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
  isChristmasMode: boolean;
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
  isChristmasMode,
}: RecommendedModeViewProps) {
  return (
    <div className="flex-1 flex flex-col px-4 sm:px-6">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center py-8">
        <div className="flex items-center justify-center mb-6 flex-shrink-0">
          <h3 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-900'}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <MdLightbulb className="text-white text-lg" />
            </div>
            おすすめタイマー
          </h3>
        </div>

        <div className="space-y-5 flex-1">
          {/* モード切り替えタブ */}
          <Tabs
            defaultValue={recommendedMode}
            value={recommendedMode}
            onValueChange={(v) => onRecommendedModeChange(v as 'weight' | 'history')}
            isChristmasMode={isChristmasMode}
            className="mb-6 flex-shrink-0"
          >
            <TabsList>
              <TabsTrigger value="weight">重さで設定</TabsTrigger>
              <TabsTrigger value="history">過去の記録から設定</TabsTrigger>
            </TabsList>

            <TabsContent value="weight">
              <WeightModeSection weight={weight} onWeightChange={onWeightChange} isChristmasMode={isChristmasMode} />
            </TabsContent>

            <TabsContent value="history">
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
                isChristmasMode={isChristmasMode}
              />
            </TabsContent>
          </Tabs>

          <div className="pt-2 flex-shrink-0">
            <Button
              variant="primary"
              size="lg"
              onClick={onStart}
              disabled={isStartDisabled}
              className="w-full flex items-center justify-center gap-3"
              isChristmasMode={isChristmasMode}
            >
              <HiPlay className="text-2xl" />
              <span>スタート</span>
            </Button>
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
  isChristmasMode,
}: {
  weight: Weight | '';
  onWeightChange: (value: Weight | '') => void;
  isChristmasMode: boolean;
}) {
  const weightOptions: SelectOption[] = WEIGHTS.map((w) => ({ value: String(w), label: `${w}g` }));
  return (
    <div className="space-y-5">
      <Select
        label="重さ"
        value={String(weight)}
        onChange={(e) =>
          onWeightChange(e.target.value ? (parseInt(e.target.value, 10) as Weight) : '')
        }
        options={[{ value: '', label: '選択してください' }, ...weightOptions]}
        required
        isChristmasMode={isChristmasMode}
      />

      {weight !== '' && (
        <div className={`rounded-xl p-4 shadow-sm border-2 ${isChristmasMode ? 'bg-[#0f3a1f]/50 border-[#d4af37]/30' : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'}`}>
          <p className={`text-sm sm:text-base ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
            重さに応じたおすすめ時間は{' '}
            <span className={`font-bold ${isChristmasMode ? 'text-[#d4af37]' : 'text-amber-800'}`}>
              {weight === 200 ? '8分' : weight === 300 ? '9分' : '10分'}
            </span>{' '}
            です
          </p>
        </div>
      )}
    </div>
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
  isChristmasMode,
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
  isChristmasMode: boolean;
}) {
  // オプションの生成
  const beanOptions: SelectOption[] = availableBeans.map((bean) => ({ value: bean, label: bean }));
  const roastLevelOptions: SelectOption[] = availableRoastLevels.map((level) => ({ value: level, label: level }));
  const weightOptions: SelectOption[] = availableWeights.map((w) => ({ value: String(w), label: `${w}g` }));
  return (
    <div className="space-y-5">
      <Select
        label="豆の名前"
        value={beanName}
        onChange={(e) => onBeanNameChange(e.target.value as BeanName)}
        options={[
          { value: '', label: availableBeans.length > 0 ? '選択してください' : '記録がありません（2件以上の記録が必要です）' },
          ...beanOptions
        ]}
        required
        isChristmasMode={isChristmasMode}
      />

      <Select
        label="焙煎度合い"
        value={roastLevel}
        onChange={(e) => onRoastLevelChange(e.target.value as RoastLevel | '')}
        disabled={!beanName}
        options={[
          {
            value: '',
            label: !beanName ? '豆を選択してください' : availableRoastLevels.length > 0 ? '選択してください' : '記録がありません（2件以上の記録が必要です）'
          },
          ...roastLevelOptions
        ]}
        required
        isChristmasMode={isChristmasMode}
      />

      <Select
        label="重さ"
        value={String(weight)}
        onChange={(e) =>
          onWeightChange(e.target.value ? (parseInt(e.target.value, 10) as Weight) : '')
        }
        disabled={!beanName}
        options={[
          {
            value: '',
            label: !beanName ? '豆を選択してください' : availableWeights.length > 0 ? '選択してください' : '記録がありません（2件以上の記録が必要です）'
          },
          ...weightOptions
        ]}
        required
        isChristmasMode={isChristmasMode}
      />

      {!recommendedTimeInfo && beanName && weight !== '' && roastLevel && (
        <div className={`rounded-xl p-4 shadow-sm border-2 ${isChristmasMode ? 'bg-[#3d2a11]/50 border-[#d4af37]/30' : 'bg-yellow-50 border-yellow-200'}`}>
          <p className={`text-sm sm:text-base ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-yellow-800'}`}>
            この組み合わせの記録が2件未満のため、平均焙煎時間を計算できません。重さに応じたデフォルト時間（
            {weight === 200 ? '8分' : weight === 300 ? '9分' : '10分'}）でタイマーを開始します。
          </p>
        </div>
      )}

      {recommendedTimeInfo && (
        <div className={`rounded-xl p-4 shadow-sm border-2 ${isChristmasMode ? 'bg-[#0f3a1f]/50 border-[#d4af37]/30' : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'}`}>
          <p className={`text-sm sm:text-base ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
            過去の記録から、平均焙煎時間は{' '}
            <span className={`font-bold ${isChristmasMode ? 'text-[#d4af37]' : 'text-amber-800'}`}>
              {formatTimeAsMinutesAndSeconds(recommendedTimeInfo.averageDuration)}
            </span>
            、おすすめタイマー時間は{' '}
            <span className={`font-bold ${isChristmasMode ? 'text-[#d4af37]' : 'text-amber-800'}`}>
              {formatTimeAsMinutesAndSeconds(recommendedTimeInfo.recommendedDuration)}
            </span>{' '}
            です
          </p>
        </div>
      )}
    </div>
  );
}
