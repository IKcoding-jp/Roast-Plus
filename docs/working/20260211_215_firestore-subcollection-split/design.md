# 設計書

**Issue番号**: #215
**最終更新**: 2026-02-11

---

## 設計方針

### 段階的リファクタリング戦略

**Phase 1: 基盤整備**（このIssue）
1. サブコレクションヘルパー関数作成
2. マイグレーションロジック実装
3. `getUserData`を新構造対応に変更

**Phase 2: `updateData`部分更新対応**
1. サブコレクション更新API作成
2. `useAppData.updateData`を差分検出型に変更
3. 書き込みキュー対応

**Phase 3: `subscribeUserData`複数コレクション対応**
1. サブコレクションsubscribe関数作成
2. データマージロジック実装
3. ロック機構のサブコレクション対応

**Phase 4: クリーンアップ**
1. 旧構造サポート削除
2. `normalizeAppData`のマイグレーション処理削除
3. テスト最適化

**本Issueのスコープ**: Phase 1のみ（基盤整備）

---

## アーキテクチャ設計

### データモデル変更

#### 変更前（現在）
```
users/{userId}
  ├─ roastSchedules: RoastSchedule[]
  ├─ tastingSessions: TastingSession[]
  ├─ tastingRecords: TastingRecord[]
  ├─ notifications: Notification[]
  ├─ roastTimerRecords: RoastTimerRecord[]
  ├─ workProgresses: WorkProgress[]
  ├─ todaySchedules: TodaySchedule[]
  ├─ userSettings: UserSettings
  ├─ shuffleEvent: ShuffleEvent
  ├─ encouragementCount: number
  ├─ roastTimerState: RoastTimerState
  ├─ defectBeans: DefectBean[]
  ├─ defectBeanSettings: DefectBeanSettings
  ├─ dripRecipes: DripRecipe[]
  ├─ changelogEntries: ChangelogEntry[]
  └─ userConsent: UserConsent
```

#### 変更後（Phase 1完了時）
```
users/{userId}
  ├─ _migrationVersion: number (新規追加)
  ├─ todaySchedules: TodaySchedule[] (保留)
  ├─ userSettings: UserSettings
  ├─ shuffleEvent: ShuffleEvent
  ├─ encouragementCount: number
  ├─ roastTimerState: RoastTimerState
  ├─ defectBeans: DefectBean[]
  ├─ defectBeanSettings: DefectBeanSettings
  ├─ dripRecipes: DripRecipe[]
  ├─ changelogEntries: ChangelogEntry[]
  ├─ userConsent: UserConsent
  └─ (サブコレクション)
      ├─ roastSchedules/{scheduleId}
      ├─ tastingSessions/{sessionId}
      ├─ tastingRecords/{recordId}
      ├─ notifications/{notificationId}
      ├─ roastTimerRecords/{recordId}
      └─ workProgresses/{progressId}
```

### ドキュメントID設計

**原則**: 既存の`id`フィールドをFirestoreドキュメントIDとして使用

**ID生成パターン**:
```typescript
// 例: RoastSchedule
interface RoastSchedule {
  id: string; // UUIDv4（既存フィールド）
  date: string;
  beans: string;
  // ...
}

// Firestoreパス
users/{userId}/roastSchedules/{RoastSchedule.id}
```

**ID生成方法**:
- クライアント側で`crypto.randomUUID()`（既存実装を維持）
- サーバー側ID生成は不要（Firestoreの`doc().id`は使用しない）

---

## モジュール設計

### 新規作成ファイル

#### 1. `lib/firestore/subcollections/helpers.ts`

**役割**: サブコレクション参照取得、共通型定義

```typescript
import { collection, CollectionReference } from 'firebase/firestore';
import { getUserDocRef } from '../common';
import type { RoastSchedule, TastingSession, /* ... */ } from '@/types';

export function getRoastSchedulesCollection(userId: string): CollectionReference<RoastSchedule> {
  return collection(getUserDocRef(userId), 'roastSchedules') as CollectionReference<RoastSchedule>;
}

export function getTastingSessionsCollection(userId: string): CollectionReference<TastingSession> {
  return collection(getUserDocRef(userId), 'tastingSessions') as CollectionReference<TastingSession>;
}

// 以下同様に他のサブコレクション用関数を定義
```

**設計パターン**: 担当表機能の`app/assignment/lib/firebase/helpers.ts`を参考

#### 2. `lib/firestore/subcollections/read.ts`

**役割**: サブコレクションの読み取りAPI

```typescript
import { getDocs, query, orderBy } from 'firebase/firestore';
import { getRoastSchedulesCollection } from './helpers';
import type { RoastSchedule } from '@/types';

export async function getRoastSchedules(userId: string): Promise<RoastSchedule[]> {
  const col = getRoastSchedulesCollection(userId);
  const q = query(col, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 以下同様に他のサブコレクション読み取り関数を定義
```

#### 3. `lib/firestore/subcollections/write.ts`

**役割**: サブコレクション書き込みAPI（Phase 2で使用）

```typescript
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getRoastSchedulesCollection } from './helpers';
import type { RoastSchedule } from '@/types';

export async function saveRoastSchedule(userId: string, schedule: RoastSchedule): Promise<void> {
  const col = getRoastSchedulesCollection(userId);
  const docRef = doc(col, schedule.id);
  await setDoc(docRef, schedule);
}

export async function deleteRoastSchedule(userId: string, scheduleId: string): Promise<void> {
  const col = getRoastSchedulesCollection(userId);
  const docRef = doc(col, scheduleId);
  await deleteDoc(docRef);
}

// 以下同様に他のサブコレクション書き込み関数を定義
```

**Phase 1では未実装**: 旧構造への書き込み継続（既存の`saveUserData`を使用）

#### 4. `lib/firestore/subcollections/index.ts`

**役割**: サブコレクションAPIのエクスポート

```typescript
export * from './helpers';
export * from './read';
export * from './write';
```

#### 5. `lib/firestore/migration.ts`

**役割**: データマイグレーション処理

```typescript
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { getUserDocRef } from './common';
import {
  getRoastSchedulesCollection,
  getTastingSessionsCollection,
  // ... 他のコレクション
} from './subcollections/helpers';
import type { AppData } from '@/types';

const CURRENT_MIGRATION_VERSION = 1;

export async function migrateToSubcollections(userId: string): Promise<void> {
  const userDocRef = getUserDocRef(userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    // 新規ユーザー → マイグレーション不要
    await setDoc(userDocRef, { _migrationVersion: CURRENT_MIGRATION_VERSION }, { merge: true });
    return;
  }

  const data = userDoc.data();
  const migrationVersion = data._migrationVersion ?? 0;

  if (migrationVersion >= CURRENT_MIGRATION_VERSION) {
    // 既にマイグレーション済み
    return;
  }

  // マイグレーション実行
  const batch = writeBatch(db);

  // roastSchedules 移行
  if (Array.isArray(data.roastSchedules) && data.roastSchedules.length > 0) {
    const roastSchedulesCol = getRoastSchedulesCollection(userId);
    data.roastSchedules.forEach(schedule => {
      const docRef = doc(roastSchedulesCol, schedule.id);
      batch.set(docRef, schedule);
    });
    batch.update(userDocRef, { roastSchedules: deleteField() });
  }

  // 他のコレクションも同様に移行
  // ...

  // マイグレーションバージョン更新
  batch.update(userDocRef, { _migrationVersion: CURRENT_MIGRATION_VERSION });

  await batch.commit();
}
```

**エラーハンドリング**:
- バッチ書き込み失敗時 → 旧データを保持、次回再試行
- 部分的な移行状態を防ぐためトランザクション使用は避ける（500件制限）
- マイグレーションログをコンソールに出力

---

## 変更対象ファイル

### 1. `lib/firestore/userData/crud.ts`

**変更内容**:

#### `getUserData`関数（L12-31）
```typescript
// 変更前
export async function getUserData(userId: string): Promise<AppData> {
  try {
    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      const normalizedData = normalizeAppData(data);
      return normalizedData;
    }

    // ドキュメントが存在しない場合はデフォルトデータを作成
    const cleanedDefaultData = removeUndefinedFields(defaultData);
    await setDoc(userDocRef, cleanedDefaultData);
    return defaultData;
  } catch (error) {
    console.error('Failed to load data from Firestore:', error);
    throw error;
  }
}

// 変更後
export async function getUserData(userId: string): Promise<AppData> {
  try {
    // マイグレーション実行
    await migrateToSubcollections(userId);

    const userDocRef = getUserDocRef(userId);
    const userDoc = await getDoc(userDocRef);

    // メインドキュメント読み込み
    const mainData = userDoc.exists() ? userDoc.data() : {};

    // サブコレクション読み込み（並列実行）
    const [
      roastSchedules,
      tastingSessions,
      tastingRecords,
      notifications,
      roastTimerRecords,
      workProgresses,
    ] = await Promise.all([
      getRoastSchedules(userId),
      getTastingSessions(userId),
      getTastingRecords(userId),
      getNotifications(userId),
      getRoastTimerRecords(userId),
      getWorkProgresses(userId),
    ]);

    // データマージ
    const mergedData: AppData = {
      ...normalizeAppData(mainData),
      roastSchedules,
      tastingSessions,
      tastingRecords,
      notifications,
      roastTimerRecords,
      workProgresses,
    };

    // 新規ユーザーの場合はデフォルトデータ作成
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        _migrationVersion: 1,
        encouragementCount: 0,
      });
    }

    return mergedData;
  } catch (error) {
    console.error('Failed to load data from Firestore:', error);
    throw error;
  }
}
```

**ポイント**:
- マイグレーション → メインドキュメント読み込み → サブコレクション並列読み込み
- `normalizeAppData`はメインドキュメントのみに適用
- 新規ユーザーはマイグレーション不要

#### `saveUserData`関数（L33-80）
**Phase 1では変更なし**: 旧構造への書き込み継続（Phase 2で差分更新対応）

#### `subscribeUserData`関数（L82-104）
**Phase 1では変更なし**: メインドキュメントのみsubscribe（Phase 3で複数コレクション対応）

---

### 2. `lib/firestore/common.ts`

**変更内容**:

#### `normalizeAppData`関数（L69-210）

**マイグレーション処理を削除**:
```typescript
// 変更前（L73-109）
todaySchedules: Array.isArray(data?.todaySchedules) ? data.todaySchedules : [],
roastSchedules: Array.isArray(data?.roastSchedules)
  ? data.roastSchedules.map((schedule) => ({
    ...schedule,
    date: schedule.date || new Date().toISOString().split('T')[0],
  }))
  : [],
tastingSessions: Array.isArray(data?.tastingSessions)
  ? data.tastingSessions.map((session) => ({
    ...session,
    aiAnalysis: typeof session.aiAnalysis === 'string' ? session.aiAnalysis : undefined,
    aiAnalysisUpdatedAt: typeof session.aiAnalysisUpdatedAt === 'string' ? session.aiAnalysisUpdatedAt : undefined,
    aiAnalysisRecordCount: typeof session.aiAnalysisRecordCount === 'number' ? session.aiAnalysisRecordCount : undefined,
  }))
  : [],
tastingRecords: Array.isArray(data?.tastingRecords) ? data.tastingRecords : [],
notifications: Array.isArray(data?.notifications) ? data.notifications : [],
// ...

// 変更後
todaySchedules: Array.isArray(data?.todaySchedules) ? data.todaySchedules : [],
// roastSchedules, tastingSessions等はサブコレクションから取得するため削除
```

**削除対象フィールド**:
- `roastSchedules`
- `tastingSessions`
- `tastingRecords`
- `notifications`
- `roastTimerRecords`
- `workProgresses`

**残すフィールド**:
- `todaySchedules` - Phase 2で検討
- `userSettings` - 設定系のマイグレーション処理（L111-155）
- `shuffleEvent`, `roastTimerState`, `defectBeans`, `defectBeanSettings`, `dripRecipes`, `changelogEntries`, `userConsent`

**変更後の行数**: 210行 → 約100行（目標達成）

#### `defaultData`定数（L54-66）

**変更内容**:
```typescript
// 変更前
export const defaultData: AppData = {
  todaySchedules: [],
  roastSchedules: [],
  tastingSessions: [],
  tastingRecords: [],
  notifications: [],
  encouragementCount: 0,
  roastTimerRecords: [],
  workProgresses: [],
  dripRecipes: [],
};

// 変更後
export const defaultData: AppData = {
  todaySchedules: [],
  encouragementCount: 0,
  dripRecipes: [],
  // サブコレクション化されたフィールドはデフォルト値不要
  // （getUserDataでサブコレクションから読み込む）
};
```

**注意**: `AppData`型は変更しない（互換性維持）

---

### 3. `hooks/useAppData.ts`

**Phase 1では変更なし**: 既存の`getUserData`, `saveUserData`, `subscribeUserData`を呼び出し続ける

**Phase 2での変更予定**:
- `updateData`で差分検出 → サブコレクション更新API呼び出し
- ロック機構をサブコレクション対応

---

### 4. `firestore.rules`

**追加内容**:

```javascript
// users/{userId} 配下のサブコレクション追加
match /users/{userId}/roastSchedules/{scheduleId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
match /users/{userId}/tastingSessions/{sessionId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
match /users/{userId}/tastingRecords/{recordId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
match /users/{userId}/notifications/{notificationId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
match /users/{userId}/roastTimerRecords/{recordId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
match /users/{userId}/workProgresses/{progressId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

**配置場所**: L74（`pairExclusions`の後）

---

### 5. `types/settings.ts`

**変更内容**:

```typescript
// AppData型に移行バージョンフィールド追加
export interface AppData {
  _migrationVersion?: number; // 新規追加
  todaySchedules: TodaySchedule[];
  roastSchedules: RoastSchedule[];
  // ... 既存フィールド（型は変更なし）
}
```

**注意**: 既存フィールドの型は変更しない（`roastSchedules: RoastSchedule[]`のまま）

---

## 影響範囲分析

### 直接影響を受けるファイル

| ファイル | 変更内容 | 影響度 |
|---------|---------|-------|
| `lib/firestore/userData/crud.ts` | `getUserData`の読み込みロジック変更 | 高 |
| `lib/firestore/common.ts` | `normalizeAppData`のフィールド削除 | 中 |
| `firestore.rules` | サブコレクション用ルール追加 | 低 |
| `types/settings.ts` | `_migrationVersion`フィールド追加 | 低 |

### 間接影響を受けるファイル（Phase 1では変更なし）

| ファイル | 理由 |
|---------|------|
| `hooks/useAppData.ts` | `getUserData`を呼び出すが、返り値の型は変わらないため影響なし |
| `app/roast/page.tsx` | `useAppData`を使用、データ構造は変わらないため影響なし |
| `app/tasting/page.tsx` | 同上 |
| `app/timer/page.tsx` | 同上 |
| `components/NotificationBar.tsx` | 同上 |
| `components/WorkProgressPanel.tsx` | 同上 |

**Phase 1の安全性**: `AppData`型の変更なし、API署名の変更なし → 既存コンポーネントは無修正で動作

---

## 禁止事項チェック

### UI実装ルール

✅ **該当なし**: 本リファクタリングはUIコンポーネント変更を含まない

### データ構造変更

✅ **破壊的変更なし**:
- `AppData`型の既存フィールドは維持
- 既存ユーザーデータは非破壊移行（マイグレーション処理）

### テスト要件

✅ **既存テスト維持**:
- 791テストが全てパス（Phase 1完了時）
- 新規テスト追加（マイグレーション処理のテスト）

### コーディング規約

✅ **準拠**:
- interface優先（`AppData`は既存のinterface）
- camelCase命名（`migrateToSubcollections`, `getRoastSchedules`）
- TypeScript strict mode準拠

---

## パフォーマンス設計

### 初回ロード時間

**現在**:
1. `getUserData` → `users/{userId}`ドキュメント1件読み込み（1クエリ）

**Phase 1後**:
1. `migrateToSubcollections` → `users/{userId}`ドキュメント1件読み込み（既にマイグレーション済みなら追加コストなし）
2. `getUserData` → `users/{userId}` + 6サブコレクション並列読み込み（7クエリ）

**影響**:
- クエリ数増加: 1 → 7（7倍）
- ただし並列実行により実時間は2倍程度（推定）
- Firestore Persistenceによりオフライン復帰時のキャッシュヒット率向上

### 更新時の転送量

**現在**:
- `saveUserData` → `users/{userId}`全体をsetDoc（merge: true）、平均30KB

**Phase 2後（目標）**:
- サブコレクション更新 → 変更されたドキュメントのみsetDoc、平均5KB（6分の1）

### マイグレーション実行時間

**想定データ量**:
- `roastSchedules`: 100件 × 2KB = 200KB
- `tastingSessions`: 50件 × 1KB = 50KB
- `tastingRecords`: 200件 × 0.5KB = 100KB
- 合計: 約350KB

**Firestore書き込み速度**: 約50件/秒（バッチ処理）

**マイグレーション時間**: 約10秒（初回ログイン時のみ）

**ユーザー体験**:
- ローディングインジケーター表示
- マイグレーション中もアプリ操作可能（バックグラウンド実行）

---

## テスト戦略（概要）

詳細は `testing.md` を参照。

### ユニットテスト

1. **サブコレクションヘルパー関数**: `helpers.ts`
2. **マイグレーション処理**: `migration.ts`
3. **`getUserData`の新ロジック**: `crud.ts`
4. **`normalizeAppData`の変更**: `common.ts`

### 統合テスト

1. **旧構造データのマイグレーション**: E2Eシナリオ
2. **新規ユーザーの初回ログイン**: マイグレーションスキップ確認
3. **既存コンポーネントの動作**: `useAppData`を使用する全ページ

### パフォーマンステスト

1. **初回ロード時間**: Chrome DevTools Performance
2. **マイグレーション時間**: テストデータで計測

---

## ロールバック戦略

### Phase 1でのロールバック

**手順**:
1. `lib/firestore/userData/crud.ts`の`getUserData`を旧実装に戻す
2. `lib/firestore/common.ts`の`normalizeAppData`を旧実装に戻す
3. `lib/firestore/subcollections/`ディレクトリを削除
4. `lib/firestore/migration.ts`を削除

**データ保全**:
- 旧構造データは削除していないため、ロールバック後も正常動作
- サブコレクションに書き込んだデータは孤立するが、次回マイグレーション時に再利用可能

### Phase 2以降のロールバック

**困難**: サブコレクションへの書き込みが始まるとロールバック困難（データ逆移行が必要）

**対策**: Phase 1で十分にテストし、Phase 2移行前にユーザー承認

---

## 次のステップ（Phase 2以降）

### Phase 2: `updateData`部分更新対応

**実装内容**:
1. `lib/firestore/subcollections/write.ts`のAPI実装
2. `hooks/useAppData.ts`の`updateData`を差分検出型に変更
3. `lib/firestore/userData/write-queue.ts`のサブコレクション対応

**期待効果**:
- 書き込み回数30%削減
- 転送量50%削減

### Phase 3: `subscribeUserData`複数コレクション対応

**実装内容**:
1. サブコレクションsubscribe関数作成
2. `useAppData`のデータマージロジック実装
3. ロック機構のサブコレクション対応

**期待効果**:
- リアルタイム同期の精度向上
- 複数タブでの同時編集時の競合削減

### Phase 4: クリーンアップ

**実装内容**:
1. `normalizeAppData`からマイグレーション処理削除
2. `migrateToSubcollections`のバージョン1サポート削除
3. テスト最適化（モック簡素化）

**期待効果**:
- コード行数10%削減
- 保守コスト削減

---

## 関連ドキュメント

- `requirement.md` - 要件定義
- `tasklist.md` - タスク分割
- `testing.md` - テスト計画
- `docs/steering/TECH_SPEC.md` - Firestoreアーキテクチャ
- `docs/steering/GUIDELINES.md` - 実装パターン
