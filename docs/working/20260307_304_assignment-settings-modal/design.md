# 設計書

## 実装方針

### 変更対象ファイル
- `types/team.ts` - `ShuffleSettings` interface追加
- `app/assignment/lib/firebase/helpers.ts` - `DEFAULT_SHUFFLE_SETTINGS` 定数追加
- `app/assignment/lib/firebase/settings.ts` - subscribe/update関数追加
- `app/assignment/lib/firebase/index.ts` - エクスポート追加
- `app/assignment/hooks/useAssignmentData.ts` - `shuffleSettings` 状態・購読追加
- `app/assignment/hooks/useShuffleExecution.ts` - パラメータ追加
- `app/assignment/lib/shuffle.ts` - `crossTeamShuffle` 制約追加
- `app/assignment/page.tsx` - 設定ボタン表示条件変更、モーダル差し替え

### 新規作成ファイル
- `app/assignment/components/AssignmentSettingsModal.tsx` - 統合設定モーダル

### 削除ファイル
- `app/assignment/components/PairExclusionSettingsModal.tsx` - 統合モーダルに吸収

## データモデル

### Firestoreスキーマ

```
users/{userId}/assignmentSettings/shuffle
```

```typescript
// types/team.ts に追加
export interface ShuffleSettings {
  crossTeamShuffle: boolean; // 班をまたいでシャッフルするか（デフォルト: false）
}
```

### デフォルト値

```typescript
// helpers.ts に追加
export const DEFAULT_SHUFFLE_SETTINGS: ShuffleSettings = {
  crossTeamShuffle: false,
};
```

## API設計

### Firebase関数

```typescript
// settings.ts に追加
export const subscribeShuffleSettings = (
  userId: string,
  callback: (settings: ShuffleSettings) => void
) => Unsubscribe;

export const updateShuffleSettings = async (
  userId: string,
  settings: Partial<ShuffleSettings>
) => Promise<void>;
```

### シャッフルアルゴリズム変更

```typescript
// shuffle.ts - calculateAssignment のシグネチャ変更
export const calculateAssignment = (
  teams: Team[],
  taskLabels: TaskLabel[],
  members: Member[],
  history: Assignment[][],
  targetDate: string,
  currentAssignments?: Assignment[],
  pairExclusions?: PairExclusion[],
  crossTeamShuffle?: boolean  // ← 追加
): Assignment[]
```

`crossTeamShuffle` が `false` または `undefined` の場合:
- バックトラッキングの候補フィルタで、各メンバーの `member.teamId` とスロットの `slot.teamId` が一致するものだけを候補にする
- `RowInfo` のslotsにteamIdが含まれているため、制約の追加は容易

## UI設計

### コンポーネント構成
- `AssignmentSettingsModal` (新規) — 統合設定モーダル
  - シャッフル設定セクション（Switchコンポーネント使用）
  - ペア除外設定セクション（既存PairExclusionSettingsModalの内部UIを移植）

### Props設計

```typescript
interface AssignmentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // シャッフル設定
  shuffleSettings: ShuffleSettings;
  onUpdateShuffleSettings: (settings: Partial<ShuffleSettings>) => Promise<void>;
  // ペア除外設定
  isDeveloperMode: boolean;
  members: Member[];
  pairExclusions: PairExclusion[];
  onAddPairExclusion: (memberId1: string, memberId2: string) => Promise<void>;
  onDeletePairExclusion: (exclusionId: string) => Promise<void>;
}
```

### 使用する共通コンポーネント
- `Switch` — 「班をまたいでシャッフル」トグル
- `Button` — ペア除外の追加ボタン
- `IconButton` — 閉じるボタン、削除ボタン
- `Select` — メンバー選択ドロップダウン

## 影響範囲
- シャッフルアルゴリズム: 新パラメータ追加（後方互換: undefined = false）
- Firestore: `assignmentSettings/shuffle` ドキュメント新規追加（既存データに影響なし）
- UI: モーダルの構成変更、設定ボタン表示条件変更
- 既存ユーザー: デフォルト動作が「班をまたいでシャッフル」→「班内シャッフル」に変更

## UI実装ルール確認
- [x] 共通コンポーネント使用（`@/components/ui` — Switch, Button, IconButton, Select）
- [x] テーマ対応: セマンティックCSS変数使用（`bg-overlay`, `text-ink`, `border-edge` 等）
- [x] ハードコード色の禁止

## 禁止事項チェック
- [x] 独自CSSでボタン/カード/入力を作らない
- [x] 新しい状態管理ライブラリを導入しない
- [x] 設計方針を変更しない

## ADR

### Decision-001: Firestoreの保存先を `assignmentSettings/shuffle` に分離
- **理由**: 既存の `assignmentSettings/table`（テーブル設定）と関心事が異なるため、ドキュメントを分離する。リアルタイム購読も独立させることで、テーブル設定変更時にシャッフル設定のリスナーが発火しない
- **影響**: Firestoreの読み取り回数が微増（購読1つ追加）。8人規模では無視できるコスト

### Decision-002: デフォルト値を `crossTeamShuffle: false` に設定
- **理由**: 業務上、班内シャッフルがデフォルトのユースケース。既存ユーザーのデフォルト動作が変わるが、ユーザー確認済み
- **影響**: 既存ユーザーがシャッフルすると班内のみで配置される。班をまたぎたい場合は設定でONにする必要がある
