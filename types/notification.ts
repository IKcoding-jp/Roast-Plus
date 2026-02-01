// 通知関連の型定義

export type NotificationType = 'update' | 'announcement' | 'improvement' | 'request' | 'bugfix';

export interface Notification {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  type: NotificationType;
  order?: number;
}
