import type { AppData, TaskLabel, TaskLabelSnapshot } from '@/types';

/**
 * 指定日付の作業ラベルを取得
 * 履歴に存在する場合はそれを返し、存在しない場合は直近の過去の履歴または現在のtaskLabelsを返す
 */
export function getTaskLabelsForDate(appData: AppData, date: string): TaskLabel[] {
  // taskLabelHistoryが存在しない場合は現在のtaskLabelsを返す
  if (!appData.taskLabelHistory || !Array.isArray(appData.taskLabelHistory)) {
    return appData.taskLabels || [];
  }

  // 履歴から該当日付のスナップショットを探す
  const snapshot = appData.taskLabelHistory.find((s) => s.date === date);
  if (snapshot) {
    return snapshot.labels;
  }

  // 履歴が存在しない場合、直近の過去の履歴を探す
  const sortedHistory = [...appData.taskLabelHistory]
    .filter((s) => s.date < date)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sortedHistory.length > 0) {
    // 直近の過去の履歴を返す
    return sortedHistory[0].labels;
  }

  // 履歴が全くない場合、現在のtaskLabelsを返す（フォールバック）
  return appData.taskLabels || [];
}

/**
 * 指定日付の作業ラベル履歴を追加または更新
 */
export function upsertTaskLabelSnapshot(
  appData: AppData,
  date: string,
  labels: TaskLabel[]
): AppData {
  // taskLabelHistoryが存在しない場合は空配列で初期化
  const currentHistory = appData.taskLabelHistory && Array.isArray(appData.taskLabelHistory)
    ? appData.taskLabelHistory
    : [];
  
  const updatedHistory = [...currentHistory];
  
  // 既存のスナップショットを探す
  const existingIndex = updatedHistory.findIndex((s) => s.date === date);
  
  if (existingIndex >= 0) {
    // 既存のスナップショットを更新
    updatedHistory[existingIndex] = {
      date,
      labels,
    };
  } else {
    // 新しいスナップショットを追加
    updatedHistory.push({
      date,
      labels,
    });
  }

  return {
    ...appData,
    taskLabelHistory: updatedHistory,
  };
}

