'use client';

import { HiFire } from 'react-icons/hi';
import { FaSnowflake, FaBroom } from 'react-icons/fa';
import { PiCoffeeBeanFill } from 'react-icons/pi';
import { getRoastMachineModeForBlend, type BeanName } from '@/lib/beanConfig';

interface SchedulePreviewProps {
  isRoasterOn: boolean;
  isRoast: boolean;
  isAfterPurge: boolean;
  isChaffCleaning: boolean;
  beanName: BeanName | '';
  beanName2: BeanName | '';
  blendRatio1: string;
  blendRatio2: string;
  weight: 200 | 300 | 500 | '';
  roastLevel: '浅煎り' | '中煎り' | '中深煎り' | '深煎り' | '';
  roastCount: string;
  bagCount: 1 | 2 | '';
  isChristmasMode?: boolean;
}

export function SchedulePreview({
  isRoasterOn,
  isRoast,
  isAfterPurge,
  isChaffCleaning,
  beanName,
  beanName2,
  blendRatio1,
  blendRatio2,
  weight,
  roastLevel,
  roastCount,
  bagCount,
  isChristmasMode = false,
}: SchedulePreviewProps) {
  // ブレンド割合を結合する関数
  const combineBlendRatio = (ratio1: string, ratio2: string): string | undefined => {
    if (!ratio1 || !ratio2) return undefined;
    return `${ratio1}:${ratio2}`;
  };

  // プレビューテキストの生成
  const getPreviewText = () => {
    if (isRoasterOn) {
      const mode = getRoastMachineModeForBlend(
        beanName as BeanName | undefined,
        beanName2 as BeanName | undefined,
        combineBlendRatio(blendRatio1, blendRatio2)
      );

      let beanText = '';
      const blendRatio = combineBlendRatio(blendRatio1, blendRatio2);
      if (beanName2 && blendRatio) {
        // ブレンドの場合
        const [ratio1, ratio2] = blendRatio.split(':');
        beanText = `${beanName}${ratio1}:${beanName2}${ratio2}`;
      } else if (beanName) {
        // 単体の場合
        beanText = beanName;
      }

      const weightText = weight ? `${weight}g` : '';
      const levelText = roastLevel || '';
      const modeText = mode ? `(${mode})` : '';

      // スマホでのレイアウト: 3行に分ける
      const parts = [];
      parts.push('焙煎機予熱');
      if (beanText) {
        parts.push(beanText);
      }
      const detailParts = [modeText, weightText, levelText].filter(Boolean);
      if (detailParts.length > 0) {
        parts.push(detailParts.join(' '));
      }

      return parts.join('\n');
    }
    if (isRoast) {
      const countText = roastCount ? `${roastCount}回目` : '?回目';
      const bagText = bagCount ? `${bagCount}袋` : '';
      if (bagText) {
        return `ロースト${countText}・${bagText}`;
      } else {
        return `ロースト${countText}`;
      }
    }
    if (isAfterPurge) {
      return 'アフターパージ';
    }
    if (isChaffCleaning) {
      return 'チャフのお掃除';
    }
    return '';
  };

  // プレビューの色
  const getPreviewColor = () => {
    if (isChristmasMode) {
      return 'bg-[#d4af37]/20 border-[#d4af37]/50 text-[#f8f1e7]';
    }
    if (isRoasterOn) return 'bg-orange-100 border-orange-300 text-orange-800';
    if (isRoast) return 'bg-amber-100 border-amber-300 text-amber-800';
    if (isAfterPurge) return 'bg-blue-100 border-blue-300 text-blue-800';
    if (isChaffCleaning) return 'bg-gray-100 border-gray-300 text-gray-800';
    return 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const getIconColor = () => {
    if (isChristmasMode) return 'text-[#d4af37]';
    if (isRoasterOn) return 'text-orange-500';
    if (isRoast) return 'text-amber-700';
    if (isAfterPurge) return 'text-blue-500';
    if (isChaffCleaning) return 'text-gray-700';
    return 'text-gray-500';
  };

  if (!isRoasterOn && !isRoast && !isAfterPurge && !isChaffCleaning) {
    return null;
  }

  return (
    <div className={`rounded-md border-2 p-3 md:p-4 ${getPreviewColor()} flex justify-center`}>
      <div className="flex items-center gap-2 md:gap-3">
        {isRoasterOn && <HiFire className={`text-xl md:text-2xl ${getIconColor()}`} />}
        {isRoast && <PiCoffeeBeanFill className={`text-xl md:text-2xl ${getIconColor()}`} />}
        {isAfterPurge && <FaSnowflake className={`text-xl md:text-2xl ${getIconColor()}`} />}
        {isChaffCleaning && <FaBroom className={`text-xl md:text-2xl ${getIconColor()}`} />}
        <div className="text-base md:text-lg font-medium whitespace-pre-line">{getPreviewText()}</div>
      </div>
    </div>
  );
}
