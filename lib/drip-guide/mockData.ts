import { DripRecipe } from './types';

export const MOCK_RECIPES: DripRecipe[] = [
    // BYSN Standard Drip (modified)
    {
        id: 'recipe-001',
        name: 'BYSN Standard Drip',
        beanName: 'G2B8',
        beanAmountGram: 20,
        totalWaterGram: 300,
        totalDurationSec: 180,
        purpose: '試飲会用スタンダード',
        description: '基本のドリップレシピ。酸味と甘みのバランス重視。',
        createdAt: '2023-10-27T10:00:00Z',
        updatedAt: '2023-10-27T10:00:00Z',
        isDefault: true,
        steps: [
            {
                id: 'step-1',
                startTimeSec: 0,
                title: '蒸らし',
                description: '全体にお湯を行き渡らせ、30秒待ちます。',
                targetTotalWater: 20,
                note: '粉が膨らむのを確認',
            },
            {
                id: 'step-2',
                startTimeSec: 30,
                title: '1投目',
                description: '中心から円を描くように注ぎます。',
                targetTotalWater: 200,
            },
            {
                id: 'step-3',
                startTimeSec: 60,
                title: '2投目',
                description: '水位を保ちながら優しく注ぎ足します。',
                targetTotalWater: 280,
            },
            {
                id: 'step-4',
                startTimeSec: 90,
                title: '3投目',
                description: '残りの湯量を注ぎきります。',
                targetTotalWater: 320,
            },
            {
                id: 'step-5',
                startTimeSec: 150,
                title: '落ち切り待ち',
                description: 'ドリッパーからお湯が落ち切るのを待ちます。',
            },
        ],
    },

    // 井崎流ハンドドリップ術 (new)
    {
        id: 'recipe-003',
        name: '井崎流ハンドドリップ術',
        beanName: 'G2B8',
        beanAmountGram: 20,
        totalWaterGram: 300,
        totalDurationSec: 180,
        purpose: 'アジア人初の世界チャンピオンの淹れ方',
        description: '井崎流のハンドドリップレシピ。4回注ぎで合計300gの抽出。',
        createdAt: '2023-11-01T10:00:00Z',
        updatedAt: '2023-11-01T10:00:00Z',
        isDefault: true,
        steps: [
            {
                id: 'step-1',
                startTimeSec: 0,
                title: '蒸らし（1投目）',
                description: '細く注いで60g、その後撹拌',
                targetTotalWater: 60,
                note: '撹拌（ドリッパーを軽く回す）',
            },
            {
                id: 'step-2',
                startTimeSec: 60,
                title: '2投目',
                description: '太めの注湯で60g',
                targetTotalWater: 120,
            },
            {
                id: 'step-3',
                startTimeSec: 90,
                title: '3投目',
                description: '同様に60g',
                targetTotalWater: 180,
            },
            {
                id: 'step-4',
                startTimeSec: 120,
                title: '4投目／仕上げ',
                description: '残り120g注ぐ、その後撹拌 → 落ちきり',
                targetTotalWater: 300,
                note: '撹拌（ドリッパーを軽く回す）',
            },
        ],
    },
];
