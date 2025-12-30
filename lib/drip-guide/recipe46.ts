import { DripRecipe, DripStep } from './types';

/**
 * 4:6メソッド（粕谷）の味わいタイプ
 */
export type Taste46 = 'basic' | 'sweet' | 'bright';

/**
 * 4:6メソッド（粕谷）の濃度タイプ
 */
export type Strength46 = 'light' | 'strong2' | 'strong3';

/**
 * 味わいタイプのラベル
 */
export const TASTE_LABELS: Record<Taste46, string> = {
    basic: 'ベーシック',
    sweet: 'より甘く',
    bright: 'より明るく',
};

/**
 * 濃度タイプのラベル
 */
export const STRENGTH_LABELS: Record<Strength46, string> = {
    light: '薄く',
    strong2: 'より濃く',
    strong3: 'さらに濃く',
};

/**
 * 4:6メソッド（粕谷）のレシピを生成する
 * 
 * @param servings 人前数（1-8）
 * @param taste 味わいタイプ
 * @param strength 濃度タイプ
 * @returns 生成されたDripRecipe
 */
export function generateRecipe46(servings: number, taste: Taste46, strength: Strength46): DripRecipe {
    // 1人前 = 豆10g / 湯150g
    const beanAmountGram = 10 * servings;
    const totalWaterGram = 150 * servings;

    // 40/60の分割
    const front = Math.round(totalWaterGram * 0.4); // 味調整パート（40%）
    const back = totalWaterGram - front; // 濃度調整パート（60%、誤差吸収のため差分で決める）

    // 味（frontを2投に配分）
    let frontStep1: number;
    let frontStep2: number;
    switch (taste) {
        case 'basic':
            frontStep1 = Math.floor(front / 2);
            frontStep2 = front - frontStep1; // 端数を最後の投に寄せる
            break;
        case 'sweet':
            frontStep1 = Math.floor(front * (5 / 12));
            frontStep2 = front - frontStep1;
            break;
        case 'bright':
            frontStep1 = Math.floor(front * (7 / 12));
            frontStep2 = front - frontStep1;
            break;
    }

    // 濃度（backを1/2/3投に配分）
    const strengthCount = strength === 'light' ? 1 : strength === 'strong2' ? 2 : 3;
    const backSteps: number[] = [];
    if (strengthCount === 1) {
        backSteps.push(back);
    } else if (strengthCount === 2) {
        const step1 = Math.floor(back / 2);
        backSteps.push(step1);
        backSteps.push(back - step1); // 端数を最後の投に寄せる
    } else {
        // 3投の場合
        const step1 = Math.floor(back / 3);
        const step2 = Math.floor(back / 3);
        backSteps.push(step1);
        backSteps.push(step2);
        backSteps.push(back - step1 - step2); // 端数を最後の投に寄せる
    }

    // 総投数 = 2（味） + strengthCount（濃度）
    const totalSteps = 2 + strengthCount;

    // 開始時刻の固定配列
    const timeArrays: Record<number, number[]> = {
        3: [0, 45, 90],
        4: [0, 45, 90, 135],
        5: [0, 45, 90, 135, 165],
    };
    const startTimes = timeArrays[totalSteps] || [];

    // ステップを生成
    const steps: DripStep[] = [];
    let cumulativeWater = 0;

    // 1投目（味調整）
    cumulativeWater += frontStep1;
    steps.push({
        id: 'step-1',
        startTimeSec: startTimes[0],
        title: '蒸らし（味：40%）',
        description: '粉全体にまんべんなくお湯を注いで均一に湿らせます。',
        targetTotalWater: cumulativeWater,
        note: '粉全体が均一に膨らむのを確認',
    });

    // 2投目（味調整）
    cumulativeWater += frontStep2;
    steps.push({
        id: 'step-2',
        startTimeSec: startTimes[1],
        title: '2投目（味：40%）',
        description: '味わいを調整する2投目です。',
        targetTotalWater: cumulativeWater,
    });

    // 3投目以降（濃度調整）
    for (let i = 0; i < strengthCount; i++) {
        const stepIndex = 2 + i;
        cumulativeWater += backSteps[i];
        steps.push({
            id: `step-${stepIndex + 1}`,
            startTimeSec: startTimes[stepIndex],
            title: `濃度調整（60%）${strengthCount > 1 ? `${i + 1}/${strengthCount}` : ''}`,
            description: '濃度を調整する注湯です。',
            targetTotalWater: cumulativeWater,
        });
    }

    // 総時間 = 最後の開始時刻 + 45秒
    const totalDurationSec = startTimes[startTimes.length - 1] + 45;

    return {
        id: 'recipe-046',
        name: '4:6メソッド（粕谷）',
        beanName: 'お好みの豆',
        beanAmountGram,
        totalWaterGram,
        totalDurationSec,
        purpose: '4:6メソッド（粕谷）',
        description: '粕谷哲氏が考案した4:6メソッド。味わいと濃度を分けて調整する手法です。',
        steps,
        isDefault: true,
        isManualMode: false, // 自動モード
    };
}
