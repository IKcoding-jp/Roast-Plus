---
name: nextjs-firestore
description: RoastPlus固有のFirebase/Firestoreアーキテクチャパターン。単一ドキュメント設計、Write Queue（デバウンス+リトライ）、楽観的更新、データ消失防止、Cloud Functions（httpsCallable）、サブコレクションCRUD、セキュリティルールに使用。Firestore読み書き、Firebase Auth、Cloud Functions、リアルタイム同期、オフライン対応実装時に参照。
---

# Next.js + Firestore 開発スキル（RoastPlus固有）

RoastPlusのFirebase/Firestoreアーキテクチャと実装パターン。汎用的なFirebase知識ではなく、**プロジェクト固有の設計判断と実装パターン**に焦点。

## アーキテクチャ概要

```
クライアント（静的エクスポート: output: 'export'）
  ├── useAuth() → onAuthStateChanged
  ├── useAppData() → 単一ドキュメント /users/{userId}
  │     ├── 楽観的更新 + lockedKeysRef
  │     ├── Write Queue（デバウンス300ms + リトライ）
  │     └── データ消失防止
  ├── useMembers() → サブコレクション /users/{userId}/members/*
  └── httpsCallable → Cloud Functions v2
        ├── ocrScheduleFromImage（GPT-4o Vision）
        └── analyzeTastingSession（GPT-4o テキスト）
```

## 設計判断（ADR）

| 判断 | 採用 | 不採用 | 理由 |
|------|------|--------|------|
| データモデル | 単一ドキュメント + 配列 | サブコレクション | 8人チーム規模、1回のreadで全データ取得可能 |
| 型変換 | `normalizeAppData()` 手動正規化 | `FirestoreDataConverter` | AppData全体を一括正規化する方が効率的 |
| 日付型 | ISO 8601文字列 (`string`) | `Timestamp` | JSON直列化容易、localStorage互換 |
| 書き込み | Write Queue + デバウンス | 直接 `setDoc` | Write stream exhausted防止 |
| オフライン | localStorage + Service Worker | `enablePersistence` | 静的エクスポート環境での安定性 |
| AI処理 | Cloud Functions v2 | Next.js API Routes | `output: 'export'` でAPI Routes使用不可 |
| 状態管理 | React useState のみ | Zustand/Redux | チーム規模で十分 |

## 重要ファイルマップ

| パス | 役割 |
|------|------|
| `lib/firebase.ts` | Firebase初期化（シングルトン） |
| `lib/firestore/userData/crud.ts` | AppData CRUD（getUserData, saveUserData） |
| `lib/firestore/userData/write-queue.ts` | Write Queue（デバウンス + リトライ + 同時実行制限） |
| `lib/firestore/common.ts` | `removeUndefinedFields`, `normalizeAppData` |
| `hooks/useAppData.ts` | メインデータフック（楽観的更新 + ロック） |
| `hooks/useMembers.ts` | サブコレクション購読 |
| `lib/auth.ts` | 認証（`useAuth`） |
| `lib/scheduleOCR.ts` | Cloud Functions呼び出し（httpsCallable） |
| `lib/storage.ts` | Firebase Storage（画像アップロード/削除） |
| `lib/localStorage.ts` | ローカルストレージ（クイズ進捗、タイマー状態等） |
| `types/index.ts` | AppData型定義 |
| `firestore.rules` | セキュリティルール |
| `functions/src/` | Cloud Functions v2実装 |

## データモデル

### メインドキュメント: `/users/{userId}`

```typescript
// types/index.ts - AppData は全機能のデータを1ドキュメントに集約
export interface AppData {
  todaySchedules: TimeLabel[];        // スケジュール
  roastSchedules: RoastSchedule[];    // 焙煎スケジュール
  tastingSessions: TastingSession[];  // テイスティングセッション
  tastingRecords: TastingRecord[];    // テイスティング記録
  notifications: Notification[];      // 通知
  roastTimerRecords: RoastTimerRecord[];  // 焙煎タイマー履歴
  workProgresses: WorkProgress[];     // 作業進捗
  dripRecipes: DripRecipe[];          // ドリップレシピ
  userSettings?: UserSettings;        // ユーザー設定
  // ... その他オプショナルフィールド
}
```

### サブコレクション（担当表機能）

```
/users/{userId}/teams/{teamId}
/users/{userId}/members/{memberId}
/users/{userId}/managers/default
/users/{userId}/taskLabels/{taskLabelId}
/users/{userId}/assignmentDays/{date}
/users/{userId}/shuffleEvents/{date}
/users/{userId}/shuffleHistory/{historyId}
```

### グローバルコレクション

```
/defectBeans/{defectBeanId}    // 欠陥豆マスターデータ（全ユーザー共有）
```

## 認証パターン

```typescript
// lib/auth.ts - useAuth フック
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
}
```

認証方式: Google + Email/Password。`onAuthStateChanged` で状態監視。

## 詳細リファレンス

実装時は以下を参照:

- **[data-operations.md](references/data-operations.md)** — Write Queue、楽観的更新、データ消失防止、CRUD操作、サブコレクション操作
- **[cloud-functions.md](references/cloud-functions.md)** — httpsCallable呼び出し、onCall実装、Secrets管理、エラーハンドリング
- **[security-rules.md](references/security-rules.md)** — 実際のFirestoreルール、サブコレクションルール、バリデーション

## 実装時の注意点

1. **AppData書き込みは必ずWrite Queue経由** — `saveUserData()` を使用。直接 `setDoc` しない
2. **undefined値はFirestoreに保存不可** — `removeUndefinedFields()` で除去してから保存
3. **日付はISO 8601文字列** — `new Date().toISOString()` を使用、`serverTimestamp()` は不使用
4. **IDは `crypto.randomUUID()`** — Firestoreの自動IDではなくクライアント生成
5. **静的エクスポート制約** — Next.js API Routes不使用、サーバー処理はCloud Functions経由
6. **画像はFirebase Storage** — `lib/storage.ts` の `uploadDefectBeanImage` / `deleteDefectBeanImage`
