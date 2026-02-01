// テイスティング関連の型定義

import type { RoastLevel } from './common';

export interface TastingSession {
  id: string;
  name?: string;
  beanName: string;
  roastLevel: RoastLevel;
  memo?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  userId: string;
  aiAnalysis?: string; // AIコーヒーマイスターのコメント
  aiAnalysisUpdatedAt?: string; // 分析日時 (ISO 8601)
  aiAnalysisRecordCount?: number; // AI分析時の記録数
}

export interface TastingRecord {
  id: string;
  sessionId: string;
  beanName: string;
  tastingDate: string; // YYYY-MM-DD
  roastLevel: RoastLevel;
  bitterness: number;
  acidity: number;
  body: number;
  sweetness: number;
  aroma: number;
  overallRating: number;
  overallImpression?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  userId: string;
  memberId: string;
}
