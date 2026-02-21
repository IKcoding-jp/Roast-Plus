# タスクリスト

**Issue番号**: #215
**最終更新**: 2026-02-11

---

## フェーズ別タスク

### Phase 1: 基盤整備（本Issue）

**目標**: サブコレクションヘルパー作成、マイグレーション実装、`getUserData`変更

**見積もり**: 約3時間（AIエージェント実行時間）

---

#### Task 1.1: サブコレクションヘルパー作成

**担当**: AIエージェント
**見積もり**: 30分
**優先度**: 高

**サブタスク**:
- [ ] `lib/firestore/subcollections/`ディレクトリ作成
- [ ] `helpers.ts`作成
  - [ ] `getRoastSchedulesCollection`関数
  - [ ] `getTastingSessionsCollection`関数
  - [ ] `getTastingRecordsCollection`関数
  - [ ] `getNotificationsCollection`関数
  - [ ] `getRoastTimerRecordsCollection`関数
  - [ ] `getWorkProgressesCollection`関数
- [ ] TypeScript型アサーション追加（`as CollectionReference<T>`）
- [ ] 担当表機能のヘルパー（`app/assignment/lib/firebase/helpers.ts`）を参考

**依存関係**: なし

**完了条件**:
- [ ] 6つのヘルパー関数が正しい型でコンパイル成功
- [ ] ESLintエラーなし

---

#### Task 1.2: サブコレクション読み取りAPI作成

**担当**: AIエージェント
**見積もり**: 30分
**優先度**: 高

**サブタスク**:
- [ ] `lib/firestore/subcollections/read.ts`作成
  - [ ] `getRoastSchedules`関数（orderBy 'date' desc）
  - [ ] `getTastingSessions`関数（orderBy 'createdAt' desc）
  - [ ] `getTastingRecords`関数（orderBy 'recordedAt' desc）
  - [ ] `getNotifications`関数（orderBy 'createdAt' desc）
  - [ ] `getRoastTimerRecords`関数（orderBy 'roastDate' desc）
  - [ ] `getWorkProgresses`関数（orderBy 'date' desc）
- [ ] エラーハンドリング追加（`try-catch`, コンソールログ）
- [ ] ドキュメントID復元（`{ id: doc.id, ...doc.data() }`）

**依存関係**: Task 1.1

**完了条件**:
- [ ] 6つの読み取り関数が型安全にコンパイル成功
- [ ] 空配列を返す正常動作確認（サブコレクションが存在しない場合）

---

#### Task 1.3: サブコレクション書き込みAPIスケルトン作成

**担当**: AIエージェント
**見積もり**: 20分
**優先度**: 中

**サブタスク**:
- [ ] `lib/firestore/subcollections/write.ts`作成
  - [ ] `saveRoastSchedule`, `deleteRoastSchedule`
  - [ ] `saveTastingSession`, `deleteTastingSession`
  - [ ] `saveTastingRecord`, `deleteTastingRecord`
  - [ ] `saveNotification`, `deleteNotification`
  - [ ] `saveRoastTimerRecord`, `deleteRoastTimerRecord`
  - [ ] `saveWorkProgress`, `deleteWorkProgress`
- [ ] **Phase 1では未使用** - スケルトンのみ作成
- [ ] JSDocコメント追加（Phase 2で使用予定を明記）

**依存関係**: Task 1.1

**完了条件**:
- [ ] 関数シグネチャが正しく定義され、コンパイル成功
- [ ] Phase 2での実装を容易にするコメント追加

---

#### Task 1.4: サブコレクションAPIエクスポート

**担当**: AIエージェント
**見積もり**: 5分
**優先度**: 低

**サブタスク**:
- [ ] `lib/firestore/subcollections/index.ts`作成
  - [ ] `export * from './helpers';`
  - [ ] `export * from './read';`
  - [ ] `export * from './write';`

**依存関係**: Task 1.1, 1.2, 1.3

**完了条件**:
- [ ] 他ファイルから`import { getRoastSchedules } from '@/lib/firestore/subcollections';`でインポート可能

---

#### Task 1.5: マイグレーション関数作成

**担当**: AIエージェント
**見積もり**: 45分
**優先度**: 高

**サブタスク**:
- [ ] `lib/firestore/migration.ts`作成
- [ ] `migrateToSubcollections`関数実装
  - [ ] `_migrationVersion`チェック（既にマイグレーション済みならスキップ）
  - [ ] `users/{userId}`ドキュメント読み込み
  - [ ] `writeBatch`でサブコレクションにデータコピー
    - [ ] `roastSchedules`配列 → `users/{userId}/roastSchedules/{id}`
    - [ ] `tastingSessions`配列 → `users/{userId}/tastingSessions/{id}`
    - [ ] `tastingRecords`配列 → `users/{userId}/tastingRecords/{id}`
    - [ ] `notifications`配列 → `users/{userId}/notifications/{id}`
    - [ ] `roastTimerRecords`配列 → `users/{userId}/roastTimerRecords/{id}`
    - [ ] `workProgresses`配列 → `users/{userId}/workProgresses/{id}`
  - [ ] 旧フィールド削除（`deleteField()`）
  - [ ] `_migrationVersion: 1`設定
- [ ] エラーハンドリング
  - [ ] バッチ書き込み失敗時のログ出力
  - [ ] 旧データ保持（削除しない）
- [ ] コンソールログ出力（マイグレーション実行・スキップ・完了）

**依存関係**: Task 1.1, 1.2

**注意点**:
- Firestoreバッチは最大500ドキュメント制限 → データ量が多い場合は複数バッチに分割
- `id`フィールドが存在しない古いデータへの対応（`crypto.randomUUID()`で生成）

**完了条件**:
- [ ] 旧構造データを持つテストユーザーでマイグレーション成功
- [ ] `_migrationVersion: 1`がFirestoreに保存される
- [ ] サブコレクションにデータがコピーされる
- [ ] 旧フィールドが削除される

---

#### Task 1.6: `getUserData`をサブコレクション対応に変更

**担当**: AIエージェント
**見積もり**: 30分
**優先度**: 高

**サブタスク**:
- [ ] `lib/firestore/userData/crud.ts`の`getUserData`関数変更
  - [ ] `migrateToSubcollections(userId)`呼び出し追加（最初に実行）
  - [ ] メインドキュメント読み込み
  - [ ] サブコレクション並列読み込み（`Promise.all`）
    - [ ] `getRoastSchedules(userId)`
    - [ ] `getTastingSessions(userId)`
    - [ ] `getTastingRecords(userId)`
    - [ ] `getNotifications(userId)`
    - [ ] `getRoastTimerRecords(userId)`
    - [ ] `getWorkProgresses(userId)`
  - [ ] データマージ（`normalizeAppData`でメイン、サブコレクションは直接結合）
  - [ ] 新規ユーザー処理（`_migrationVersion: 1`, `encouragementCount: 0`のみ保存）
- [ ] エラーハンドリング強化（並列読み込み失敗時の処理）

**依存関係**: Task 1.2, 1.5

**完了条件**:
- [ ] 既存ユーザーデータが正しく読み込まれる
- [ ] 新規ユーザーで空のサブコレクションが返される
- [ ] エラーログが適切に出力される

---

#### Task 1.7: `normalizeAppData`のリファクタリング

**担当**: AIエージェント
**見積もり**: 20分
**優先度**: 中

**サブタスク**:
- [ ] `lib/firestore/common.ts`の`normalizeAppData`関数変更
  - [ ] サブコレクション化されたフィールドの処理削除
    - [ ] `roastSchedules`（L74-80）削除
    - [ ] `tastingSessions`（L81-89）削除
    - [ ] `tastingRecords`（L90）削除
    - [ ] `notifications`（L91）削除
    - [ ] `roastTimerRecords`（L93-101）削除
    - [ ] `workProgresses`（L102-108）削除
  - [ ] `todaySchedules`処理は残す（Phase 2で検討）
  - [ ] 他のフィールド処理は変更なし
- [ ] 行数削減確認（210行 → 100行以下）

**依存関係**: Task 1.6

**完了条件**:
- [ ] `normalizeAppData`が100行以下になる
- [ ] 既存のテストが全てパス
- [ ] ESLintエラーなし

---

#### Task 1.8: `defaultData`定数の更新

**担当**: AIエージェント
**見積もり**: 5分
**優先度**: 低

**サブタスク**:
- [ ] `lib/firestore/common.ts`の`defaultData`定数変更
  - [ ] サブコレクション化されたフィールド削除
    - [ ] `roastSchedules: []`削除
    - [ ] `tastingSessions: []`削除
    - [ ] `tastingRecords: []`削除
    - [ ] `notifications: []`削除
    - [ ] `roastTimerRecords: []`削除
    - [ ] `workProgresses: []`削除
  - [ ] 残すフィールド
    - [ ] `todaySchedules: []`
    - [ ] `encouragementCount: 0`
    - [ ] `dripRecipes: []`

**依存関係**: Task 1.7

**注意**: `AppData`型は変更しない（互換性維持）

**完了条件**:
- [ ] `defaultData`が新構造に対応
- [ ] コンパイルエラーなし

---

#### Task 1.9: `AppData`型に`_migrationVersion`追加

**担当**: AIエージェント
**見積もり**: 5分
**優先度**: 低

**サブタスク**:
- [ ] `types/settings.ts`の`AppData`インターフェース変更
  - [ ] `_migrationVersion?: number;`フィールド追加
- [ ] JSDocコメント追加（内部フィールド、ユーザーデータではないことを明記）

**依存関係**: なし

**完了条件**:
- [ ] TypeScriptコンパイル成功
- [ ] 既存コードでエラーが発生しない

---

#### Task 1.10: Firestore Security Rules更新

**担当**: AIエージェント
**見積もり**: 10分
**優先度**: 高

**サブタスク**:
- [ ] `firestore.rules`にサブコレクション用ルール追加
  - [ ] `users/{userId}/roastSchedules/{scheduleId}`
  - [ ] `users/{userId}/tastingSessions/{sessionId}`
  - [ ] `users/{userId}/tastingRecords/{recordId}`
  - [ ] `users/{userId}/notifications/{notificationId}`
  - [ ] `users/{userId}/roastTimerRecords/{recordId}`
  - [ ] `users/{userId}/workProgresses/{progressId}`
- [ ] 全て`allow read, write: if request.auth != null && request.auth.uid == userId;`

**依存関係**: なし

**完了条件**:
- [ ] Firestore Security Rulesエミュレータでテスト成功
- [ ] 認証済みユーザーが自分のサブコレクションにアクセス可能
- [ ] 他ユーザーのサブコレクションにアクセス不可

---

#### Task 1.11: Lint・ビルド・テスト実行

**担当**: AIエージェント
**見積もり**: 10分
**優先度**: 高

**サブタスク**:
- [ ] `npm run lint`実行 → エラーゼロ
- [ ] `npm run build`実行 → ビルド成功
- [ ] `npm run test`実行 → 既存テスト全パス（791テスト）

**依存関係**: 全タスク

**完了条件**:
- [ ] Lintエラーゼロ
- [ ] ビルドエラーゼロ
- [ ] 既存テスト100%パス

---

#### Task 1.12: マイグレーション動作確認（E2E）

**担当**: AIエージェント（手動確認サポート）
**見積もり**: 20分
**優先度**: 高

**サブタスク**:
- [ ] テストユーザー作成（旧構造データを手動でFirestoreに設定）
  - [ ] `users/testUser123`に旧構造データ配置
    - [ ] `roastSchedules: [{ id: '1', date: '2026-02-11', beans: 'Test' }]`
    - [ ] `tastingSessions: [{ id: '1', name: 'Test Session' }]`
- [ ] アプリでログイン → `getUserData`実行
- [ ] Firestoreコンソールで確認
  - [ ] `users/testUser123/roastSchedules/1`が存在
  - [ ] `users/testUser123/tastingSessions/1`が存在
  - [ ] `users/testUser123`の`roastSchedules`フィールドが削除
  - [ ] `users/testUser123._migrationVersion`が`1`
- [ ] アプリで焙煎スケジュール表示 → データ正常表示

**依存関係**: Task 1.11

**完了条件**:
- [ ] マイグレーション成功
- [ ] 既存ユーザーデータが正常に表示される
- [ ] エラーログなし

---

### Phase 2: `updateData`部分更新対応（別Issue）

**目標**: サブコレクション書き込みAPI実装、差分検出型`updateData`

**見積もり**: 約4時間

**タスク概要**:
- Task 2.1: `lib/firestore/subcollections/write.ts`の実装
- Task 2.2: `hooks/useAppData.ts`の`updateData`を差分検出型に変更
- Task 2.3: 書き込みキュー対応（`write-queue.ts`）
- Task 2.4: テスト追加（部分更新の動作確認）

**依存関係**: Phase 1完了

---

### Phase 3: `subscribeUserData`複数コレクション対応（別Issue）

**目標**: サブコレクションのリアルタイム同期、データマージロジック

**見積もり**: 約3時間

**タスク概要**:
- Task 3.1: サブコレクションsubscribe関数作成
- Task 3.2: `useAppData`のデータマージロジック実装
- Task 3.3: ロック機構のサブコレクション対応
- Task 3.4: テスト追加（複数タブ同時編集）

**依存関係**: Phase 2完了

---

### Phase 4: クリーンアップ（別Issue）

**目標**: 旧構造サポート削除、マイグレーション処理削除

**見積もり**: 約2時間

**タスク概要**:
- Task 4.1: `normalizeAppData`からマイグレーション処理削除
- Task 4.2: `migrateToSubcollections`のバージョン1サポート削除
- Task 4.3: テスト最適化（モック簡素化）

**依存関係**: Phase 3完了 + 全ユーザーマイグレーション完了

---

## 依存関係グラフ

```
Task 1.1 (helpers)
  ├─→ Task 1.2 (read API)
  │     └─→ Task 1.5 (migration)
  │           └─→ Task 1.6 (getUserData)
  │                 └─→ Task 1.7 (normalizeAppData)
  │                       └─→ Task 1.8 (defaultData)
  │                             └─→ Task 1.11 (Lint/Build/Test)
  │                                   └─→ Task 1.12 (E2E確認)
  ├─→ Task 1.3 (write API skeleton)
  │     └─→ Task 1.4 (export)
  └─→ Task 1.9 (AppData型)
        └─→ Task 1.10 (Firestore Rules)
```

---

## 見積もりサマリー

### Phase 1（本Issue）

| タスク | 見積もり |
|--------|----------|
| Task 1.1 | 30分 |
| Task 1.2 | 30分 |
| Task 1.3 | 20分 |
| Task 1.4 | 5分 |
| Task 1.5 | 45分 |
| Task 1.6 | 30分 |
| Task 1.7 | 20分 |
| Task 1.8 | 5分 |
| Task 1.9 | 5分 |
| Task 1.10 | 10分 |
| Task 1.11 | 10分 |
| Task 1.12 | 20分 |
| **合計** | **3時間50分** |

**注**: AIエージェント実行時間（人間の作業時間ではない）

---

## リスク管理

### リスク1: マイグレーション失敗

**確率**: 中
**影響**: 高（ユーザーデータ消失）

**対策**:
- 旧データを削除せず保持
- マイグレーション失敗時のフォールバック処理
- テストユーザーで十分に検証

### リスク2: サブコレクション読み込みパフォーマンス低下

**確率**: 低
**影響**: 中（初回ロード時間増加）

**対策**:
- 並列読み込み（`Promise.all`）
- Firestore Persistence有効化
- パフォーマンステストで計測

### リスク3: 既存テストの失敗

**確率**: 中
**影響**: 中（リリース遅延）

**対策**:
- Task 1.11でテスト実行
- モックデータ更新（必要に応じて）
- テストカバレッジ維持

---

## チェックリスト

### 実装完了前

- [ ] 全タスク完了
- [ ] Lint・ビルド・テストエラーゼロ
- [ ] マイグレーション動作確認（E2E）
- [ ] Firestore Security Rulesデプロイ

### PR作成前

- [ ] コードレビュー（AIエージェント自己レビュー）
- [ ] Working Documents更新（必要に応じて）
- [ ] Steering Documents更新検討（TECH_SPEC.md, GUIDELINES.md）

### マージ後

- [ ] Firebase Hostingにデプロイ
- [ ] ユーザーフィードバック収集
- [ ] Phase 2着手判断

---

## 関連ドキュメント

- `requirement.md` - 要件定義
- `design.md` - 設計書
- `testing.md` - テスト計画
