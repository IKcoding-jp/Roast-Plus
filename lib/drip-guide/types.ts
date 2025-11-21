export interface DripStep {
    id: string;
    startTimeSec: number;
    title: string;
    description: string;
    targetTotalWater?: number;
    note?: string;
}

export interface DripRecipe {
    id: string;
    name: string;
    beanName: string;
    beanAmountGram: number;
    totalWaterGram: number;
    totalDurationSec: number;
    purpose?: string;
    description?: string;
    steps: DripStep[];
    createdAt?: string;
    updatedAt?: string;
}
