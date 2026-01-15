# 更新履歴・開発秘話機能の実装計画

アプリの更新履歴や開発体験・経験を記録・表示するための機能を実装します。

## 機能要件

### ユーザーストーリー
- 開発者として、アプリのアップデート内容を記録し、ユーザーに共有したい
- 開発者として、開発中の体験や経験を文章として残したい
- たびたび新しいエントリを追加できるようにしたい

### 機能概要
1. **更新履歴**: バージョンアップデートの内容（変更点、新機能、バグ修正など）
2. **開発秘話**: 開発中のエピソード、工夫点、苦労話など

---

## User Review Required

> [!IMPORTANT]
> 以下の設計方針について確認が必要です：

### 1. データストレージの方針
**選択肢A: Firestore（推奨）**
- リアルタイム更新が可能
- 管理画面から追加・編集可能

**選択肢B: ハードコード（JSONまたはTS定数）**
- シンプルな実装
- 追加時はコード変更＋デプロイが必要

**現在の推奨**: Firestoreを使用（既存の`notifications`と同様のパターン）

### 2. UIデザイン方針
- タイムライン形式で表示
- 各エントリにカテゴリ（更新/秘話）とタグを付与可能
- アコーディオン展開で詳細表示

---

## Proposed Changes

### Types (`types/index.ts`)

#### [MODIFY] [index.ts](file:///d:/Dev/roastplus/types/index.ts)

新しい型定義を追加：

```typescript
// 更新履歴・開発秘話エントリ
export type ChangelogEntryType = 'update' | 'story' | 'feature' | 'bugfix' | 'improvement';

export interface ChangelogEntry {
  id: string;
  type: ChangelogEntryType;
  title: string;
  content: string;         // 本文（Markdown対応も検討）
  version?: string;        // バージョン番号（例: "0.5.17"）
  date: string;            // YYYY-MM-DD
  tags?: string[];         // タグ（例: ["UI", "焙煎", "Firebase"]）
  order?: number;          // 表示順序
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}
```

AppDataに追加：
```typescript
export interface AppData {
  // ... 既存フィールド
  changelogEntries?: ChangelogEntry[];
}
```

---

### Data Layer (`lib/firestore.ts`)

#### [MODIFY] [firestore.ts](file:///d:/Dev/roastplus/lib/firestore.ts)

`normalizeAppData`関数にデフォルト値を追加：
```typescript
changelogEntries: data?.changelogEntries || [],
```

---

### Page Component (`app/changelog/page.tsx`)

#### [MODIFY] [page.tsx](file:///d:/Dev/roastplus/app/changelog/page.tsx)

プレースホルダーページを完全な実装に置き換え：

**主要機能:**
1. タイムライン形式のエントリ一覧表示
2. カテゴリフィルター（更新/秘話/全て）
3. 各エントリの展開/折りたたみ
4. バージョン番号の表示
5. タグ表示

**UIデザイン:**
- 左側にアイコン付きタイムライン
- 右側にコンテンツカード
- スムーズなトランジション

---

## Verification Plan

### Automated Tests
```bash
npm run lint
npm run build
```

### Manual Verification
1. ブラウザでchangelogページにアクセス
2. エントリがタイムライン形式で表示されることを確認
3. フィルター機能の動作確認
4. モバイルレスポンシブ表示の確認
