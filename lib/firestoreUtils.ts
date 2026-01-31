/**
 * Firestore型変換ユーティリティ
 */

// Firestore Timestampの型定義
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
}

/**
 * Firestore TimestampまたはISO文字列をJavaScript Dateに変換
 * @param value 変換対象の値
 * @returns JavaScript Dateオブジェクト、または変換できない場合はundefined
 */
export function toJSDate(value: Date | FirestoreTimestamp | string | null | undefined): Date | undefined {
  if (!value) return undefined;

  // 既にDateの場合
  if (value instanceof Date) return value;

  // Firestore Timestampの場合（toDateメソッドがある場合）
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }

  // Firestore Timestampの場合（seconds/nanosecondsがある場合）
  if (typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
    return new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
  }

  // ISO文字列の場合
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
}

/**
 * JavaScript DateをFirestore Timestampに変換
 * 注: この関数はFirestore SDKのTimestamp型を返すわけではなく、
 * Firestore互換のオブジェクトを返します。実際のFirestoreへの保存時は
 * Firebase SDKのTimestamp.fromDate()を使用してください。
 */
export function toFirestoreTimestamp(date: Date): FirestoreTimestamp {
  const milliseconds = date.getTime();
  const seconds = Math.floor(milliseconds / 1000);
  const nanoseconds = (milliseconds % 1000) * 1000000;

  return {
    seconds,
    nanoseconds,
    toDate: () => new Date(seconds * 1000 + nanoseconds / 1000000),
  };
}
