// 基本型定義（焙煎レベル・重量、Firestore共通型）

// Import DripRecipe types from drip-guide
import type { DripRecipe, DripStep } from '../lib/drip-guide/types';

// Re-export DripRecipe types from drip-guide
export type { DripRecipe, DripStep };

export type RoastLevel = '浅煎り' | '中煎り' | '中深煎り' | '深煎り';
export type RoastWeight = 200 | 300 | 500;

export type FirestoreTimestamp = { seconds: number; nanoseconds: number } | string;
