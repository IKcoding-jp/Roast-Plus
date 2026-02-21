# テスト計画

**Issue番号**: #215
**最終更新**: 2026-02-11

---

## テスト戦略

### テストレベル

1. **ユニットテスト** - 個別関数の動作確認（Vitest）
2. **統合テスト** - 複数モジュールの連携確認（Vitest + Firebase Emulator）
3. **E2Eテスト** - ユーザーシナリオの動作確認（Playwright）
4. **パフォーマンステスト** - 読み込み時間・転送量計測（Chrome DevTools）

### テスト方針

#### TDD（テスト駆動開発）適用

本リファクタリングは**ビジネスロジック変更**を含むため、TDDを適用する。

**Red → Green → Refactor**:
1. **🔴 Red**: 失敗テスト作成 → コミット
2. **🟢 Green**: テスト合格する最小実装 → コミット
3. **🔵 Refactor**: テスト維持したまま改善 → コミット（必要時のみ）

#### カバレッジ目標

| カテゴリ | 目標 | 現在 |
|---------|------|------|
| 全体 | 75%以上 | 76.19% |
| lib/ | 90%以上 | 89.44% |
| hooks/ | 85%以上 | 87.9% |

**Phase 1完了時の目標**: 現在のカバレッジを維持または向上

---

## テストケース設計

### ユニットテスト

#### Test Suite 1: サブコレクションヘルパー関数（`helpers.ts`）

**ファイル**: `lib/firestore/subcollections/helpers.test.ts`

**テストケース**:

| ID | テスト名 | 入力 | 期待出力 | 優先度 |
|----|---------|------|----------|--------|
| UT-1.1 | `getRoastSchedulesCollection`が正しいパスを返す | `userId: 'user123'` | `CollectionReference` pointing to `users/user123/roastSchedules` | 高 |
| UT-1.2 | `getTastingSessionsCollection`が正しいパスを返す | `userId: 'user123'` | `CollectionReference` pointing to `users/user123/tastingSessions` | 高 |
| UT-1.3 | `getTastingRecordsCollection`が正しいパスを返す | `userId: 'user123'` | `CollectionReference` pointing to `users/user123/tastingRecords` | 高 |
| UT-1.4 | `getNotificationsCollection`が正しいパスを返す | `userId: 'user123'` | `CollectionReference` pointing to `users/user123/notifications` | 高 |
| UT-1.5 | `getRoastTimerRecordsCollection`が正しいパスを返す | `userId: 'user123'` | `CollectionReference` pointing to `users/user123/roastTimerRecords` | 高 |
| UT-1.6 | `getWorkProgressesCollection`が正しいパスを返す | `userId: 'user123'` | `CollectionReference` pointing to `users/user123/workProgresses` | 高 |

**実装例**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { getRoastSchedulesCollection } from '@/lib/firestore/subcollections/helpers';

describe('getRoastSchedulesCollection', () => {
  it('should return CollectionReference pointing to users/{userId}/roastSchedules', () => {
    const userId = 'user123';
    const col = getRoastSchedulesCollection(userId);
    expect(col.path).toBe('users/user123/roastSchedules');
  });
});
```

**見積もり**: 30分（6ケース × 5分）

---

#### Test Suite 2: サブコレクション読み取りAPI（`read.ts`）

**ファイル**: `lib/firestore/subcollections/read.test.ts`

**テストケース**:

| ID | テスト名 | モックデータ | 期待出力 | 優先度 |
|----|---------|------------|----------|--------|
| UT-2.1 | `getRoastSchedules`が空配列を返す | サブコレクション空 | `[]` | 高 |
| UT-2.2 | `getRoastSchedules`が正しいデータを返す | `[{ id: '1', date: '2026-02-11', beans: 'Test' }]` | 同左（ソート済み） | 高 |
| UT-2.3 | `getRoastSchedules`が日付降順でソート | `[{ id: '1', date: '2026-02-10' }, { id: '2', date: '2026-02-11' }]` | `[{ id: '2', date: '2026-02-11' }, { id: '1', date: '2026-02-10' }]` | 高 |
| UT-2.4 | `getTastingSessions`が空配列を返す | サブコレクション空 | `[]` | 中 |
| UT-2.5 | `getTastingSessions`が正しいデータを返す | `[{ id: '1', name: 'Session1' }]` | 同左 | 中 |
| UT-2.6 | `getTastingRecords`が空配列を返す | サブコレクション空 | `[]` | 中 |
| UT-2.7 | `getNotifications`が空配列を返す | サブコレクション空 | `[]` | 中 |
| UT-2.8 | `getRoastTimerRecords`が空配列を返す | サブコレクション空 | `[]` | 中 |
| UT-2.9 | `getWorkProgresses`が空配列を返す | サブコレクション空 | `[]` | 中 |
| UT-2.10 | `getRoastSchedules`がエラー時に例外をスロー | Firestoreエラー | `throw Error` | 低 |

**モック戦略**:
- Firebase Emulatorを使用（実際のFirestoreクエリをテスト）
- または`vi.mock('firebase/firestore')`でモック

**実装例**:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getRoastSchedules } from '@/lib/firestore/subcollections/read';
import { doc, setDoc } from 'firebase/firestore';
import { getRoastSchedulesCollection } from '@/lib/firestore/subcollections/helpers';

describe('getRoastSchedules', () => {
  const userId = 'testUser123';

  beforeEach(async () => {
    // Emulatorでテストデータセットアップ
    const col = getRoastSchedulesCollection(userId);
    await setDoc(doc(col, '1'), { id: '1', date: '2026-02-11', beans: 'Test' });
  });

  it('should return roast schedules sorted by date desc', async () => {
    const schedules = await getRoastSchedules(userId);
    expect(schedules).toHaveLength(1);
    expect(schedules[0].id).toBe('1');
    expect(schedules[0].date).toBe('2026-02-11');
  });
});
```

**見積もり**: 1時間（10ケース × 6分）

---

#### Test Suite 3: マイグレーション処理（`migration.ts`）

**ファイル**: `lib/firestore/migration.test.ts`

**テストケース**:

| ID | テスト名 | 初期状態 | 期待結果 | 優先度 |
|----|---------|---------|---------|--------|
| UT-3.1 | 新規ユーザーはマイグレーションスキップ | `users/user123`存在せず | `_migrationVersion: 1`設定、サブコレクション作成なし | 高 |
| UT-3.2 | マイグレーション済みユーザーはスキップ | `_migrationVersion: 1` | サブコレクション作成なし | 高 |
| UT-3.3 | 旧構造データを新構造に移行 | `roastSchedules: [{ id: '1', date: '2026-02-11' }]` | サブコレクション`users/user123/roastSchedules/1`作成、旧フィールド削除 | 高 |
| UT-3.4 | 複数配列を一度に移行 | `roastSchedules`, `tastingSessions`両方に旧データ | 両方のサブコレクション作成、旧フィールド削除 | 高 |
| UT-3.5 | `id`フィールドがない旧データに対応 | `roastSchedules: [{ date: '2026-02-11' }]`（idなし） | `id: crypto.randomUUID()`生成してサブコレクション作成 | 中 |
| UT-3.6 | 500件以上のデータを複数バッチで移行 | `roastSchedules`に600件 | 2バッチで移行成功 | 低 |
| UT-3.7 | バッチ書き込み失敗時にエラーログ出力 | Firestoreエラー | `console.error`呼び出し、旧データ保持 | 中 |

**実装例**:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { migrateToSubcollections } from '@/lib/firestore/migration';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getUserDocRef } from '@/lib/firestore/common';

describe('migrateToSubcollections', () => {
  const userId = 'testUser123';

  beforeEach(async () => {
    // Emulatorで旧構造データセットアップ
    const userDocRef = getUserDocRef(userId);
    await setDoc(userDocRef, {
      roastSchedules: [{ id: '1', date: '2026-02-11', beans: 'Test' }],
      tastingSessions: [],
    });
  });

  it('should migrate roastSchedules to subcollection', async () => {
    await migrateToSubcollections(userId);

    // サブコレクション確認
    const scheduleDoc = await getDoc(doc(getUserDocRef(userId), 'roastSchedules', '1'));
    expect(scheduleDoc.exists()).toBe(true);
    expect(scheduleDoc.data()?.date).toBe('2026-02-11');

    // 旧フィールド削除確認
    const userDoc = await getDoc(getUserDocRef(userId));
    expect(userDoc.data()?.roastSchedules).toBeUndefined();
    expect(userDoc.data()?._migrationVersion).toBe(1);
  });
});
```

**見積もり**: 1.5時間（7ケース × 13分）

---

#### Test Suite 4: `getUserData`変更（`crud.ts`）

**ファイル**: `lib/firestore/userData/crud.test.ts`（既存テストファイルに追加）

**テストケース**:

| ID | テスト名 | 初期状態 | 期待結果 | 優先度 |
|----|---------|---------|---------|--------|
| UT-4.1 | 新規ユーザーで空データ返却 | `users/user123`存在せず | `AppData`のデフォルト値 + サブコレクション空配列 | 高 |
| UT-4.2 | マイグレーション済みユーザーでサブコレクション読み込み | サブコレクション`roastSchedules/1`存在 | `AppData.roastSchedules: [{ id: '1', ... }]` | 高 |
| UT-4.3 | メインドキュメントとサブコレクションをマージ | メイン: `userSettings`, サブ: `roastSchedules` | マージされた`AppData` | 高 |
| UT-4.4 | マイグレーション実行後にサブコレクション読み込み | 旧構造データ → マイグレーション成功 | サブコレクションから正しいデータ読み込み | 高 |
| UT-4.5 | サブコレクション読み込み失敗時にエラーログ | Firestoreエラー | `console.error`呼び出し、例外スロー | 中 |

**実装例**:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getUserData } from '@/lib/firestore/userData/crud';
import { doc, setDoc } from 'firebase/firestore';
import { getUserDocRef } from '@/lib/firestore/common';
import { getRoastSchedulesCollection } from '@/lib/firestore/subcollections/helpers';

describe('getUserData (with subcollections)', () => {
  const userId = 'testUser123';

  beforeEach(async () => {
    // メインドキュメント作成
    await setDoc(getUserDocRef(userId), {
      _migrationVersion: 1,
      encouragementCount: 10,
    });

    // サブコレクション作成
    const col = getRoastSchedulesCollection(userId);
    await setDoc(doc(col, '1'), { id: '1', date: '2026-02-11', beans: 'Test' });
  });

  it('should load data from main document and subcollections', async () => {
    const data = await getUserData(userId);
    expect(data.encouragementCount).toBe(10);
    expect(data.roastSchedules).toHaveLength(1);
    expect(data.roastSchedules[0].id).toBe('1');
  });
});
```

**見積もり**: 1時間（5ケース × 12分）

---

#### Test Suite 5: `normalizeAppData`変更（`common.ts`）

**ファイル**: `lib/firestore/common.test.ts`（既存テストファイルに追加）

**テストケース**:

| ID | テスト名 | 入力 | 期待出力 | 優先度 |
|----|---------|------|----------|--------|
| UT-5.1 | サブコレクション化されたフィールドを無視 | `{ roastSchedules: [...] }`（旧データ） | `roastSchedules`フィールドなし | 高 |
| UT-5.2 | `todaySchedules`を正規化 | `{ todaySchedules: [...] }` | `todaySchedules`配列が正規化される | 高 |
| UT-5.3 | `userSettings`を正規化 | `{ userSettings: { selectedMemberId: 'user1' } }` | `userSettings`オブジェクトが正規化される | 中 |
| UT-5.4 | 空オブジェクトで正規化 | `{}` | デフォルト値の`AppData`（サブコレクションフィールドなし） | 中 |

**実装例**:
```typescript
import { describe, it, expect } from 'vitest';
import { normalizeAppData } from '@/lib/firestore/common';

describe('normalizeAppData (after subcollection refactor)', () => {
  it('should ignore subcollection fields', () => {
    const data = normalizeAppData({
      roastSchedules: [{ id: '1', date: '2026-02-11' }], // 旧構造
      todaySchedules: [],
    });
    expect(data.roastSchedules).toBeUndefined(); // サブコレクション化されたため無視
    expect(data.todaySchedules).toEqual([]);
  });
});
```

**見積もり**: 30分（4ケース × 7.5分）

---

### 統合テスト

#### Integration Test Suite 1: マイグレーション → 読み込みフロー

**ファイル**: `lib/firestore/integration.test.ts`

**テストケース**:

| ID | テスト名 | シナリオ | 期待結果 | 優先度 |
|----|---------|---------|---------|--------|
| IT-1.1 | 旧構造ユーザーがログインしてマイグレーション実行 | 1. 旧構造データセットアップ<br>2. `getUserData`呼び出し<br>3. Firestore確認 | サブコレクション作成、旧フィールド削除、データ正常読み込み | 高 |
| IT-1.2 | マイグレーション後の2回目ログイン | 1. マイグレーション済みユーザー<br>2. `getUserData`呼び出し | マイグレーションスキップ、サブコレクションから正常読み込み | 高 |
| IT-1.3 | 複数ユーザーの並行マイグレーション | 1. ユーザーA, Bで同時に`getUserData`<br>2. 両方ともマイグレーション実行 | 両ユーザーのデータが正常に移行、競合なし | 中 |

**実装例**:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getUserData } from '@/lib/firestore/userData/crud';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getUserDocRef } from '@/lib/firestore/common';

describe('Migration → getUserData integration', () => {
  const userId = 'testUser123';

  beforeEach(async () => {
    // 旧構造データセットアップ
    await setDoc(getUserDocRef(userId), {
      roastSchedules: [{ id: '1', date: '2026-02-11', beans: 'Test' }],
      tastingSessions: [{ id: '2', name: 'Session1' }],
    });
  });

  it('should migrate old structure data and load from subcollections', async () => {
    const data = await getUserData(userId);

    // データ正常読み込み
    expect(data.roastSchedules).toHaveLength(1);
    expect(data.roastSchedules[0].id).toBe('1');
    expect(data.tastingSessions).toHaveLength(1);
    expect(data.tastingSessions[0].id).toBe('2');

    // マイグレーション確認
    const userDoc = await getDoc(getUserDocRef(userId));
    expect(userDoc.data()?.roastSchedules).toBeUndefined();
    expect(userDoc.data()?.tastingSessions).toBeUndefined();
    expect(userDoc.data()?._migrationVersion).toBe(1);
  });
});
```

**見積もり**: 1時間（3ケース × 20分）

---

#### Integration Test Suite 2: `useAppData`フック動作確認

**ファイル**: `hooks/useAppData.test.tsx`（既存テストファイルに追加）

**テストケース**:

| ID | テスト名 | シナリオ | 期待結果 | 優先度 |
|----|---------|---------|---------|--------|
| IT-2.1 | `useAppData`がサブコレクションデータを返す | 1. サブコレクションにデータ配置<br>2. `useAppData`呼び出し<br>3. `data`確認 | `data.roastSchedules`に正しいデータ | 高 |
| IT-2.2 | `updateData`が旧構造で動作（Phase 1）| 1. `updateData`でroastSchedules更新<br>2. Firestore確認 | メインドキュメントに書き込み（Phase 2で変更予定） | 中 |
| IT-2.3 | リアルタイム同期がメインドキュメントで動作 | 1. `useAppData`でsubscribe<br>2. 別プロセスでメイン更新<br>3. `data`確認 | メインドキュメント変更が反映（サブコレクションはPhase 3） | 中 |

**実装例**:
```typescript
import { describe, it, expect, renderHook, waitFor } from '@testing-library/react';
import { useAppData } from '@/hooks/useAppData';
import { doc, setDoc } from 'firebase/firestore';
import { getUserDocRef } from '@/lib/firestore/common';
import { getRoastSchedulesCollection } from '@/lib/firestore/subcollections/helpers';

describe('useAppData (with subcollections)', () => {
  const userId = 'testUser123';

  it('should load subcollection data', async () => {
    // サブコレクションセットアップ
    const col = getRoastSchedulesCollection(userId);
    await setDoc(doc(col, '1'), { id: '1', date: '2026-02-11', beans: 'Test' });

    const { result } = renderHook(() => useAppData());

    await waitFor(() => {
      expect(result.current.data.roastSchedules).toHaveLength(1);
      expect(result.current.data.roastSchedules[0].id).toBe('1');
    });
  });
});
```

**見積もり**: 1時間（3ケース × 20分）

---

### E2Eテスト

#### E2E Test Suite 1: 焙煎スケジュールページ

**ファイル**: `e2e/roast-schedule.spec.ts`（Playwright）

**テストケース**:

| ID | テスト名 | 操作 | 期待結果 | 優先度 |
|----|---------|------|----------|--------|
| E2E-1.1 | 焙煎スケジュール表示（マイグレーション後） | 1. 旧構造データでログイン<br>2. `/roast`に遷移<br>3. スケジュール確認 | スケジュールが正常表示 | 高 |
| E2E-1.2 | 焙煎スケジュール追加 | 1. `/roast`で新規スケジュール追加<br>2. Firestore確認 | メインドキュメントに保存（Phase 2でサブコレクションに変更） | 中 |

**実装例**:
```typescript
import { test, expect } from '@playwright/test';

test('should display roast schedules after migration', async ({ page }) => {
  // 旧構造データを事前にFirestoreに配置（テストセットアップ）
  // ...

  await page.goto('/roast');
  await expect(page.locator('[data-testid="roast-schedule-item"]')).toHaveCount(1);
  await expect(page.locator('[data-testid="roast-schedule-item"]').first()).toContainText('Test');
});
```

**見積もり**: 30分（2ケース × 15分）

---

#### E2E Test Suite 2: テイスティングページ

**ファイル**: `e2e/tasting.spec.ts`（Playwright）

**テストケース**:

| ID | テスト名 | 操作 | 期待結果 | 優先度 |
|----|---------|------|----------|--------|
| E2E-2.1 | テイスティングセッション表示 | 1. `/tasting`に遷移<br>2. セッション確認 | サブコレクションから正常表示 | 高 |

**見積もり**: 15分（1ケース × 15分）

---

### パフォーマンステスト

#### Performance Test Suite 1: 初回ロード時間

**ツール**: Chrome DevTools Performance

**テストケース**:

| ID | テスト名 | 計測項目 | 目標 | 優先度 |
|----|---------|---------|------|--------|
| PT-1.1 | `getUserData`実行時間（マイグレーション前） | 旧構造データ読み込み | ベースライン計測 | 高 |
| PT-1.2 | `getUserData`実行時間（マイグレーション後） | サブコレクション並列読み込み | ベースラインの2倍以内 | 高 |
| PT-1.3 | マイグレーション実行時間 | 旧構造→新構造移行（100件データ） | 10秒以内 | 中 |

**実装**:
```typescript
import { describe, it, expect } from 'vitest';
import { getUserData } from '@/lib/firestore/userData/crud';

describe('Performance: getUserData', () => {
  it('should load data in reasonable time', async () => {
    const start = performance.now();
    await getUserData('testUser123');
    const end = performance.now();
    const elapsed = end - start;

    console.log(`getUserData execution time: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(2000); // 2秒以内
  });
});
```

**見積もり**: 30分（3ケース × 10分）

---

#### Performance Test Suite 2: 転送量計測

**ツール**: Chrome DevTools Network

**テストケース**:

| ID | テスト名 | 計測項目 | 目標 | 優先度 |
|----|---------|---------|------|--------|
| PT-2.1 | `getUserData`転送量（Phase 1） | メインドキュメント + サブコレクション | ベースライン計測 | 中 |
| PT-2.2 | `updateData`転送量（Phase 2後の目標） | 部分更新 | Phase 1の50%以下 | 低（Phase 2で計測） |

**見積もり**: 15分（1ケース × 15分）

---

## テストカバレッジ計測

### カバレッジレポート生成

```bash
npm run test:coverage
```

**確認項目**:
- [ ] 全体カバレッジ: 75%以上
- [ ] `lib/firestore/subcollections/`: 90%以上
- [ ] `lib/firestore/migration.ts`: 90%以上
- [ ] `lib/firestore/userData/crud.ts`: 85%以上
- [ ] `lib/firestore/common.ts`: 90%以上

---

## テスト実行計画

### Phase 1テスト実行順序

1. **ユニットテスト**: `npm run test lib/firestore/subcollections/ lib/firestore/migration.test.ts`
2. **統合テスト**: `npm run test lib/firestore/integration.test.ts hooks/useAppData.test.tsx`
3. **E2Eテスト**: `npx playwright test e2e/roast-schedule.spec.ts e2e/tasting.spec.ts`
4. **パフォーマンステスト**: Chrome DevToolsで手動計測
5. **全体テスト**: `npm run test`（791テスト + 新規テスト）

---

## テスト環境

### Firebase Emulator

**セットアップ**:
```bash
firebase emulators:start --only firestore
```

**設定**:
- Firestore Emulator: `localhost:8080`
- テストデータ: `firebase.json`の`emulators.firestore.seed`で初期データ投入

### CI環境（GitHub Actions）

**Phase 1では手動テスト**: GitHub Actions設定は別Issueで対応

---

## テスト見積もりサマリー

| テストスイート | 見積もり |
|--------------|----------|
| UT-1 (helpers) | 30分 |
| UT-2 (read) | 1時間 |
| UT-3 (migration) | 1.5時間 |
| UT-4 (getUserData) | 1時間 |
| UT-5 (normalizeAppData) | 30分 |
| IT-1 (migration integration) | 1時間 |
| IT-2 (useAppData) | 1時間 |
| E2E-1 (roast) | 30分 |
| E2E-2 (tasting) | 15分 |
| PT-1 (performance) | 30分 |
| PT-2 (network) | 15分 |
| **合計** | **8時間** |

**注**: AIエージェント実行時間（テスト作成 + 実行）

---

## リグレッションテスト

### 既存テストの維持

**Phase 1で影響を受ける既存テスト**:
- `lib/firestore/common.test.ts`: `normalizeAppData`のテスト（一部更新）
- `lib/firestore/userData/crud.test.ts`: `getUserData`のテスト（一部更新）
- `hooks/useAppData.test.tsx`: `useAppData`のテスト（変更なし、ただし動作確認）

**対策**:
- 既存テストを実行し、失敗があれば修正
- モックデータを新構造に対応

---

## テスト完了基準

### Phase 1テスト完了条件

- [ ] 全ユニットテスト合格（UT-1〜UT-5）
- [ ] 全統合テスト合格（IT-1〜IT-2）
- [ ] 全E2Eテスト合格（E2E-1〜E2E-2）
- [ ] パフォーマンステストで目標達成（PT-1）
- [ ] 既存テスト全合格（791テスト）
- [ ] カバレッジ目標達成（全体75%以上、lib/ 90%以上）
- [ ] Lint・ビルドエラーゼロ

---

## 関連ドキュメント

- `requirement.md` - 要件定義（受け入れ基準）
- `design.md` - 設計書（テスト対象コード）
- `tasklist.md` - タスクリスト（実装順序）
- `docs/testing-strategy.md` - 全体テスト戦略
