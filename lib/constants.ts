export const ROAST_LEVELS = [
    '浅煎り',
    '中煎り',
    '中深煎り',
    '深煎り',
] as const;

export type RoastLevel = typeof ROAST_LEVELS[number];

export const WEIGHTS = [200, 300, 500] as const;

export type Weight = typeof WEIGHTS[number];

export const DEFAULT_DURATIONS: Record<Weight, number> = {
    200: 8,
    300: 9,
    500: 10,
};
