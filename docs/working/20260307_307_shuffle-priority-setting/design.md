# 設計書

## 実装方針

### 変更対象ファイル
- `types/team.ts` - `ShuffleSettings` interface に `priority` フィールド追加
- `app/assignment/lib/shuffle.ts` - `ConstraintLevel` 型拡張、`row_*` レベル追加、`levels` 切り替え
- `app/assignment/lib/firebase/helpers.ts` - `DEFAULT_SHUFFLE_SETTINGS` に `priority: 'pair'` 追加
- `app/assignment/hooks/useShuffleExecution.ts` - `calculateAssignment` 呼び出しに `priority` 引数追加
- `app/assignment/components/AssignmentSettingsModal.tsx` - ラジオボタンUI追加

### 新規作成ファイル
- なし

## データモデル

### ShuffleSettings（Firestore: `assignmentSettings/shuffle`）

```typescript
// Before
export interface ShuffleSettings {
  crossTeamShuffle: boolean;
}

// After
export interface ShuffleSettings {
  crossTeamShuffle: boolean;
  priority?: 'pair' | 'row'; // デフォルト: 'pair'（後方互換）
}
```

`priority` を optional にすることで、既存ドキュメント（フィールド未設定）は `DEFAULT_SHUFFLE_SETTINGS` の `'pair'` が適用され、後方互換を維持。

## アルゴリズム設計

### 制約レベル体系

現在の `pair_*` 系に対称な `row_*` 系を追加:

| レベル | 行制約 | ペア制約 | 用途 |
|---|---|---|---|
| `strict` | 現在+1回前 | 現在+1回前 | 両方最厳格（共通） |
| `pair_strict` | 現在のみ | 現在+1回前 | ペア優先系 |
| `pair_hard` | ソフト | 現在+1回前 | ペア優先系 |
| `row_strict` | 現在+1回前 | 現在のみ | **担当優先系（新規）** |
| `row_hard` | 現在+1回前 | ソフト | **担当優先系（新規）** |
| `balanced` | 現在のみ | 現在のみ | バランス（共通） |
| `pair_only` | ソフト | 現在のみ | ペア優先系 |
| `row_only` | 現在のみ | ソフト | **担当優先系（新規）** |
| `minimal` | - | - | 緊急フォールバック（共通） |

### 制約レベル順序の切り替え

```typescript
// ペア優先（デフォルト、現行動作）
const pairFirstLevels: ConstraintLevel[] = [
  'strict', 'pair_strict', 'pair_hard', 'balanced', 'pair_only', 'minimal'
];

// 担当優先
const rowFirstLevels: ConstraintLevel[] = [
  'strict', 'row_strict', 'row_hard', 'balanced', 'row_only', 'minimal'
];
```

### calculateAssignment シグネチャ変更

```typescript
// Before
export const calculateAssignment = (
    teams, taskLabels, members, history, targetDate,
    currentAssignments?, pairExclusions?, crossTeamShuffle?
): Assignment[]

// After
export const calculateAssignment = (
    teams, taskLabels, members, history, targetDate,
    currentAssignments?, pairExclusions?, crossTeamShuffle?,
    priority?: 'pair' | 'row'  // 新規追加（末尾、optional）
): Assignment[]
```

### hasRowConflict / hasPairConflict の拡張

`row_*` レベルでの動作:

```typescript
// hasRowConflict
// row_strict: 現在+1回前をハード制約（strictと同じ行動作）
// row_hard:   現在+1回前をハード制約（strictと同じ行動作）
// row_only:   現在のみハード制約

// hasPairConflict
// row_strict: 現在のみハード制約（balancedと同じペア動作）
// row_hard:   ソフト制約のみ（minimalと同じペア動作）
// row_only:   ソフト制約のみ（minimalと同じペア動作）
```

## UI設計

### AssignmentSettingsModal 追加セクション

「班をまたいでシャッフル」スイッチの下に配置:

```
セクション1: シャッフル設定
├── 班をまたいでシャッフル [Switch]
├── ─── シャッフルの優先順位 ─── (区切り線+ラベル)
├── ◉ 同じ人との組み合わせを避ける
│     毎回なるべく違う人と組みます。
│     ただし同じ作業が連続することがあります
└── ○ 同じ作業の連続を避ける
      毎回なるべく違う作業になります。
      ただし同じ人と組むことがあります
```

### 使用する共通コンポーネント
- 既存: `Switch`（班をまたいでシャッフル）
- 新規使用なし（ラジオボタンはネイティブ `<input type="radio">` + Tailwind CSS。共通UIに `RadioGroup` コンポーネントが無いため）

## 影響範囲
- `calculateAssignment` の引数追加（末尾optional、後方互換）
- `useShuffleExecution` からの呼び出し更新
- 既存テストは変更不要（`priority` 未指定 = 現行動作）

## UI実装ルール確認
- [x] 共通コンポーネント使用（`@/components/ui` の `Switch` は既存利用）
- [x] テーマ対応: セマンティックCSS変数使用（`bg-ground`, `text-ink` 等）
- [x] ハードコード色の禁止

## 禁止事項チェック
- [x] 独自CSSでボタン/カード/入力を作らない
- [x] 新しい状態管理ライブラリを導入しない
- [x] 設計方針を変更しない

## ADR（この設計の決定事項）

### Decision-001: ペア優先をデフォルトとする
- **理由**: 既存ユーザーの動作を変えないため（後方互換）
- **影響**: `priority` フィールドは optional、未設定時は `'pair'`

### Decision-002: ラジオボタンにネイティブinputを使用
- **理由**: 共通UIに `RadioGroup` コンポーネントが存在しない。2択のためシンプルなネイティブ実装で十分
- **影響**: 将来 `RadioGroup` 共通コンポーネントが作成されたら移行可能
