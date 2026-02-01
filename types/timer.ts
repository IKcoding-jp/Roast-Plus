// 焙煎タイマー関連の型定義

import type { RoastLevel, RoastWeight } from './common';

export interface RoastTimerSettings {
  goToRoastRoomTimeSeconds: number;
  timerSoundEnabled: boolean;
  timerSoundFile: string;
  timerSoundVolume: number;
  notificationSoundEnabled: boolean;
  notificationSoundFile: string;
  notificationSoundVolume: number;
  settingsVersion?: number; // マイグレーション管理用
}

export interface RoastTimerRecord {
  id: string;
  beanName: string;
  weight: RoastWeight;
  roastLevel: RoastLevel;
  duration: number; // seconds
  roastDate: string; // YYYY-MM-DD
  createdAt: string; // ISO 8601
  userId: string;
  groupId?: string;
}

export type RoastTimerStatus = 'idle' | 'running' | 'paused' | 'completed';
export type RoastTimerDialogState = 'completion' | 'continuousRoast' | 'afterPurge' | null;

export interface RoastTimerState {
  status: RoastTimerStatus;
  duration: number; // seconds
  elapsed: number; // seconds
  remaining: number; // seconds
  pausedElapsed?: number; // cumulative paused seconds
  beanName?: string;
  weight?: RoastWeight;
  roastLevel?: RoastLevel;
  startedAt?: string; // ISO 8601
  pausedAt?: string; // ISO 8601
  lastUpdatedAt: string; // ISO 8601
  notificationId?: number;
  triggeredByDeviceId?: string;
  completedByDeviceId?: string;
  dialogState?: RoastTimerDialogState;
}
