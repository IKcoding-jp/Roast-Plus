// スケジュール関連の型定義

import type { RoastLevel, RoastWeight } from './common';

export interface SubTask {
  id: string;
  content: string;
  assignee?: string; // 担当者名（自由入力）
  order: number;
}

export interface TimeLabel {
  id: string;
  time: string; // HH:mm
  content: string;
  memo?: string;
  order?: number;
  // === スケジュール機能改善で追加 ===
  assignee?: string; // メインタスクの担当者
  subTasks?: SubTask[]; // 連続タスク（小さい↓）
  continuesUntil?: string; // 時間経過終了時間（HH:mm）
}

export interface TodaySchedule {
  id: string;
  date: string; // YYYY-MM-DD
  timeLabels: TimeLabel[];
}

export interface RoastSchedule {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (may be empty for after-purge)
  isRoasterOn?: boolean;
  isRoast?: boolean;
  isAfterPurge?: boolean;
  isChaffCleaning?: boolean;
  beanName?: string;
  beanName2?: string; // remix用の二種類目
  blendRatio?: string; // "3:5" のような表記
  roastMachineMode?: 'G1' | 'G2' | 'G3';
  weight?: RoastWeight;
  roastLevel?: RoastLevel;
  roastCount?: number;
  bagCount?: 1 | 2;
  order?: number;
}
