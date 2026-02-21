# 要件定義

**Issue番号**: #215
**タイトル**: refactor: Firestoreデータモデルのサブコレクション分割
**作成日**: 2026-02-11

---

## 背景と目的

### 現状の課題

現在、`AppData`型の全データ（焙煎スケジュール、テイスティング記録、通知、タイマー記録等）を`users/{userId}`ドキュメント1つに集約している。この設計には以下の問題がある：

1. **書き込み競合リスク**: Firestoreは1ドキュメントあたり1秒間に1回の書き込み制限があり、複数機能の同時更新で競合が発生する
2. **転送効率の低下**: 一部フィールドのみ更新したい場合も全ドキュメントを転送する必要がある（現在は`merge: true`で緩和）
3. **スケーラビリティの限界**: ドキュメントサイズ上限（1MB）に近づく可能性
4. **`normalizeAppData`の肥大化**: マイグレーションロジックが混在し、210行超の複雑な関数になっている

### リファクタリングの目的

1. **主要データのサブコレクション化**: アクセスパターンが独立している配列データをサブコレクションに分割
2. **`updateData` APIの部分更新対応**: フルドキュメント更新ではなく、変更されたフィールドのみ更新
3. **マイグレーションロジックの分離**: `normalizeAppData`からマイグレーション処理を切り出し、保守性向上
4. **段階的移行**: 既存ユーザーのデータを壊さず、段階的に新構造に移行

---

## ユーザーストーリー

### US-1: サブコレクション分割（開発者向け）

**As a** 開発者
**I want** 頻繁に更新される配列データをサブコレクション化する
**So that** 書き込み競合を回避し、転送効率を向上できる

**受け入れ基準**:
- 以下のフィールドがサブコレクション化されている
  - `roastSchedules` → `users/{userId}/roastSchedules/{scheduleId}`
  - `tastingSessions` → `users/{userId}/tastingSessions/{sessionId}`
  - `tastingRecords` → `users/{userId}/tastingRecords/{recordId}`
  - `notifications` → `users/{userId}/notifications/{notificationId}`
  - `roastTimerRecords` → `users/{userId}/roastTimerRecords/{recordId}`
  - `workProgresses` → `users/{userId}/workProgresses/{progressId}`
- ドキュメントIDは既存の`id`フィールドを使用
- リアルタイム同期が複数コレクションに対応している

### US-2: 部分更新API（開発者向け）

**As a** 開発者
**I want** `updateData`で変更されたフィールドのみFirestoreに送信する
**So that** 不要な書き込みを削減し、ネットワーク効率を向上できる

**受け入れ基準**:
- `updateData`が差分検出を行い、変更されたフィールドのみ更新
- サブコレクション化されたデータは個別ドキュメントとして更新
- 書き込みキューがサブコレクション更新に対応

### US-3: マイグレーション（既存ユーザー向け）

**As a** 既存ユーザー
**I want** アプリ更新後も過去データが正常に表示される
**So that** データ移行を意識せず使い続けられる

**受け入れ基準**:
- 初回ログイン時、旧構造データを新構造に自動移行
- 移行済みフラグ（`_migrationVersion`等）で二重移行を防止
- 移行中もアプリ操作が可能（非ブロッキング）

---

## 必須要件

### R-1: サブコレクション分割の設計

**判断基準**（以下の条件を満たすフィールドをサブコレクション化）:
- ✅ **配列型である**
- ✅ **アクセスパターンが独立** - 他フィールドと同時に読み書きしない
- ✅ **更新頻度が高い** - 他フィールドより頻繁に変更される
- ✅ **データサイズが大きい** - 将来的にドキュメントサイズ制限に抵触する可能性

**サブコレクション化対象**:
| フィールド | 理由 |
|----------|------|
| `roastSchedules` | 焙煎ページで独立してアクセス、日次更新、OCR画像データで大容量化 |
| `tastingSessions` | テイスティングページで独立、AI分析で頻繁更新 |
| `tastingRecords` | セッションと同時アクセスだが、大量データで肥大化懸念 |
| `notifications` | 通知バーで独立アクセス、頻繁な追加・削除 |
| `roastTimerRecords` | タイマーページで独立、記録が蓄積 |
| `workProgresses` | 進捗ページで独立、日次更新 |

**`users/{userId}`に残すフィールド**:
| フィールド | 理由 |
|----------|------|
| `userSettings` | 小容量、全ページで参照、単一オブジェクト |
| `shuffleEvent` | 担当表ページで他データと同時アクセス、一時的データ |
| `encouragementCount` | 単一数値、頻繁更新ではない |
| `roastTimerState` | 単一オブジェクト、タイマー状態の同期が必要 |
| `defectBeans` | 配列だが小容量（マスターデータ的性質） |
| `defectBeanSettings` | 単一オブジェクト |
| `dripRecipes` | 配列だが小容量、更新頻度低い |
| `changelogEntries` | 配列だが読み取り専用、更新頻度極めて低い |
| `userConsent` | 単一オブジェクト、初回のみ更新 |
| `todaySchedules` | **保留** - 焙煎ページで`roastSchedules`と同時アクセス（Phase 2で検討） |

### R-2: `updateData` APIの部分更新対応

**現在の問題**:
```typescript
// useAppData.ts（220-310行目）
const normalizedData: AppData = {
  todaySchedules: Array.isArray(newData.todaySchedules) ? newData.todaySchedules : currentData.todaySchedules,
  roastSchedules: Array.isArray(newData.roastSchedules) ? newData.roastSchedules : currentData.roastSchedules,
  // ... 全フィールドを明示的にマージ
};
```

**新設計**:
1. **差分検出**: 変更されたフィールドのみFirestoreに送信
2. **サブコレクション更新**: 配列の追加・削除・更新を個別ドキュメント操作に変換
3. **トランザクション**: 複数コレクション更新時の整合性保証（必要に応じて）

**具体例**:
```typescript
// 例: tastingSessionを1件追加
updateData((current) => ({
  ...current,
  tastingSessions: [...current.tastingSessions, newSession]
}));

// 内部処理（想定）
// → users/{userId}/tastingSessions/{newSession.id} のみsetDoc
// → メインドキュメントは更新しない
```

### R-3: リアルタイム同期の複数コレクション対応

**現在の実装**:
```typescript
// useAppData.ts（203-206行目）
const unsubscribe = subscribeUserData(user.uid, (incomingData) => {
  if (!isMounted) return;
  applyIncomingSnapshot(incomingData);
});
```

**新設計**:
```typescript
// 複数コレクションをsubscribe
const unsubscribes = [
  subscribeUserData(user.uid, handleMainDocSnapshot),
  subscribeRoastSchedules(user.uid, handleRoastSchedulesSnapshot),
  subscribeTastingSessions(user.uid, handleTastingSessionsSnapshot),
  // ...
];
```

**データマージ戦略**:
- メインドキュメント + 各サブコレクション → `AppData`型に統合
- ロック機構（`lockedKeysRef`）はサブコレクション単位で管理

### R-4: マイグレーション戦略

**Phase 1: 読み取り両対応期（v1.0）**
1. `getUserData`で旧構造・新構造を両方チェック
2. 旧構造データがある場合 → 新構造にコピー、旧フィールドを削除
3. 移行済みフラグ`_migrationVersion: 1`を`users/{userId}`に追加

**Phase 2: 新構造完全移行（v1.1）**
1. 旧構造サポート削除
2. マイグレーションコード削除

**移行対象データ**:
- `roastSchedules`, `tastingSessions`, `tastingRecords`, `notifications`, `roastTimerRecords`, `workProgresses`

**非破壊移行**:
- 移行失敗時は旧構造データを保持（削除しない）
- エラーログを収集し、次回ログイン時に再試行

### R-5: 書き込みキューの対応

**現在の実装**:
- `write-queue.ts`: ユーザーごとに書き込みキューを管理、デバウンス300ms、リトライ処理

**新設計**:
- サブコレクション更新もキュー経由で実行
- メインドキュメント更新とサブコレクション更新を並列化（可能な場合）
- 書き込みスロット管理（`MAX_CONCURRENT_WRITES`）をサブコレクション更新でも適用

---

## オプション要件

### O-1: `todaySchedules`のサブコレクション化

**背景**: `todaySchedules`は焙煎ページで`roastSchedules`と同時にアクセスされるため、Phase 1では保留。

**Phase 2での検討事項**:
- `roastSchedules`とのアクセスパターン分析
- 同時読み込みのパフォーマンス影響
- サブコレクション化するメリット（転送量削減）vs デメリット（複数クエリのオーバーヘッド）

### O-2: 書き込みバッチ処理

**目的**: 複数サブコレクション更新を1トランザクションにまとめ、整合性向上

**実装方針**:
- Firestore `writeBatch`を使用
- 最大500ドキュメント制限に注意

### O-3: オフライン対応の強化

**背景**: サブコレクション化でFirestoreクエリ数が増加 → オフライン復帰時の同期負荷増大

**対策**:
- Firestore Persistence有効化
- IndexedDBキャッシュサイズ調整

---

## 受け入れ基準

### AC-1: サブコレクション化の完了

- [ ] `roastSchedules`, `tastingSessions`, `tastingRecords`, `notifications`, `roastTimerRecords`, `workProgresses`が`users/{userId}`配下のサブコレクションに移動
- [ ] 既存のテストが全てパス（791テスト）
- [ ] Lint・ビルドエラーなし

### AC-2: `updateData` APIの動作確認

- [ ] 1フィールドのみ更新時、他フィールドのFirestore書き込みが発生しない（ネットワークログで確認）
- [ ] サブコレクションデータ追加時、個別ドキュメントとして保存される
- [ ] 既存の`useAppData`を使用するコンポーネントが正常動作

### AC-3: マイグレーションの動作確認

- [ ] 旧構造データを持つテストユーザーでログイン → 新構造にデータ移行
- [ ] 移行後、旧フィールドが`users/{userId}`から削除されている
- [ ] 移行済みフラグ`_migrationVersion: 1`が存在する

### AC-4: リアルタイム同期の動作確認

- [ ] 複数タブで同時編集 → 両タブにリアルタイム反映
- [ ] サブコレクションデータ更新 → 他タブのデータが正しくマージされる
- [ ] データ消失防止ロジック（L100-123）が引き続き動作

### AC-5: パフォーマンス改善の確認

- [ ] Chrome DevTools Networkタブで転送量を計測 → サブコレクション化前後で削減を確認
- [ ] Firestore書き込み回数の削減（コンソールログで確認）

---

## 非機能要件

### NFR-1: パフォーマンス

- メインドキュメントサイズ: 平均50%削減（配列データ除外により）
- 部分更新による書き込み回数: 30%削減（推定）
- リアルタイム同期の初回ロード時間: 現状維持または改善

### NFR-2: 保守性

- `normalizeAppData`の行数: 210行 → 100行以下
- マイグレーションロジック: 独立した関数に分離（`migrateToSubcollections`等）
- テストカバレッジ: 75%以上を維持

### NFR-3: 互換性

- 既存ユーザーのデータ破壊なし
- マイグレーション失敗時のフォールバック処理
- 旧構造データの読み取り互換性（Phase 1のみ）

---

## 除外事項

### 本リファクタリングで**やらないこと**

1. ❌ **UIの変更**: データ構造変更のみ、画面は既存のまま
2. ❌ **担当表データの変更**: 担当表機能は既にサブコレクション化済み（`users/{userId}/teams`等）のため対象外
3. ❌ **クイズ進捗データ**: 別コレクション`quiz_progress/{userId}`で管理済みのため対象外
4. ❌ **新機能追加**: リファクタリングに専念、機能追加は別Issue
5. ❌ **Firestore Security Rulesの大幅変更**: サブコレクションへのアクセス権限追加のみ

---

## 関連Issue・PR

- **関連Issue**: なし（初回リファクタリング）
- **参考実装**: 担当表機能のサブコレクション化（`app/assignment/lib/firebase/helpers.ts`）
- **影響を受ける機能**:
  - 焙煎スケジュール（`app/roast/page.tsx`）
  - テイスティング（`app/tasting/page.tsx`）
  - タイマー（`app/timer/page.tsx`）
  - 通知（`components/NotificationBar.tsx`）
  - 進捗管理（`components/WorkProgressPanel.tsx`）

---

## 参照ドキュメント

- `docs/steering/TECH_SPEC.md` - Firestoreデータモデル
- `docs/steering/GUIDELINES.md` - 実装パターン
- `firestore.rules` - セキュリティルール
- 担当表機能のサブコレクション実装（参考）:
  - `app/assignment/lib/firebase/helpers.ts`
  - `app/assignment/lib/firebase/assignment.ts`
