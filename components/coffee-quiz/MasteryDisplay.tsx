'use client';

interface MasteryDisplayProps {
  mastery: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * 定着率の色を取得
 * 0-33%: 赤系（学習中）
 * 34-66%: 黄/オレンジ系（定着中）
 * 67-100%: 緑系（定着済み）
 */
function getMasteryColor(mastery: number): {
  bg: string;
  bar: string;
  text: string;
  label: string;
} {
  if (mastery >= 67) {
    return {
      bg: 'bg-green-100',
      bar: 'bg-green-500',
      text: 'text-green-600',
      label: '定着済み',
    };
  }
  if (mastery >= 34) {
    return {
      bg: 'bg-amber-100',
      bar: 'bg-amber-500',
      text: 'text-amber-600',
      label: '定着中',
    };
  }
  return {
    bg: 'bg-red-100',
    bar: 'bg-red-400',
    text: 'text-red-500',
    label: '学習中',
  };
}

/**
 * 定着率からボックス数を計算
 * 67%以上: 3つ
 * 34-66%: 2つ
 * 1-33%: 1つ
 * 0%: 0つ
 */
function getMasteryBoxCount(mastery: number): number {
  if (mastery >= 67) return 3;
  if (mastery >= 34) return 2;
  if (mastery > 0) return 1;
  return 0;
}

/**
 * 定着率表示コンポーネント（フル版）
 * 3つのボックスで定着度を表示
 */
export function MasteryDisplay({
  mastery,
  size = 'md',
  showLabel = false,
}: MasteryDisplayProps) {
  const sizeConfig = {
    sm: {
      box: 'w-3 h-3',
      gap: 'gap-0.5',
      text: 'text-[10px]',
    },
    md: {
      box: 'w-4 h-4',
      gap: 'gap-1',
      text: 'text-xs',
    },
    lg: {
      box: 'w-5 h-5',
      gap: 'gap-1',
      text: 'text-sm',
    },
  };

  const config = sizeConfig[size];
  const boxCount = getMasteryBoxCount(mastery);
  const color = getMasteryColor(mastery);

  return (
    <div className="flex flex-col gap-1">
      <div className={`flex items-center ${config.gap}`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${config.box} rounded-sm ${
              i < boxCount
                ? `${color.bar}`
                : 'bg-[#211714]/10'
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className={`${config.text} ${color.text}`}>
          {color.label}
        </span>
      )}
    </div>
  );
}

/**
 * コンパクト版定着率表示
 * 問題一覧などで使用
 */
export function MasteryCompact({ mastery }: { mastery: number }) {
  const boxCount = getMasteryBoxCount(mastery);
  const color = getMasteryColor(mastery);

  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-sm ${
            i < boxCount
              ? `${color.bar}`
              : 'bg-[#211714]/10'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * カテゴリ全体の平均定着率表示
 */
export function CategoryMasteryDisplay({
  averageMastery,
  totalQuestions,
}: {
  averageMastery: number;
  totalQuestions: number;
}) {
  const boxCount = getMasteryBoxCount(averageMastery);
  const color = getMasteryColor(averageMastery);

  return (
    <div className="mt-1.5">
      <div className="flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-sm ${
              i < boxCount ? color.bar : 'bg-[#211714]/10'
            }`}
          />
        ))}
        <span className="text-[10px] text-[#3A2F2B]/60 ml-1">
          {totalQuestions}問
        </span>
      </div>
    </div>
  );
}
