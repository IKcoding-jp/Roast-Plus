# 設計書

## 実装方針

### 変更対象ファイル

| ファイル | 変更内容 | ルール |
|---------|---------|--------|
| `components/Loading.tsx` | Lottie遅延読み込み | `bundle-dynamic-imports` |
| `components/drip-guide/DripGuideRunner.tsx` | functional setState × 3 | `rerender-functional-setstate` |
| `components/ocr-time-label-editor/TimeLabelRow.tsx` | functional setState × 4 | `rerender-functional-setstate` |
| `components/notifications/NotificationModal.tsx` | functional setState × 3 | `rerender-functional-setstate` |
| `components/RoastScheduleMemoDialog.tsx` | 空useEffect削除 | dead code |
| `lib/localStorage.ts` | バージョニング追加 | `client-localstorage-schema` |

### 新規作成ファイル
- なし

## 詳細設計

### 1. Loading.tsx - Lottie遅延読み込み

```tsx
// Before
import Lottie from 'lottie-react';

// After
import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
```

注意: `lottie-react`はdefault exportを持つため、`{ default: mod.default }`の変換は不要。

### 2. functional setState パターン

```tsx
// Before: ステール値リスク
setEditingTime({ ...editingTime, hour: value });

// After: 常に最新の値を参照
setEditingTime(prev => ({ ...prev, hour: value }));
```

### 3. localStorage バージョニング

```typescript
const TIMER_STATE_VERSION = 1;
const TIMER_SETTINGS_VERSION = 1;

interface StoredRoastTimerState {
  version: number;
  state: RoastTimerState;
}

interface StoredRoastTimerSettings {
  version: number;
  settings: RoastTimerSettings;
}
```

マイグレーション戦略:
- 読み取り時にversion未設定 → v1データとして扱い、自動マイグレーション
- クイズ進捗の既存パターン（`StoredQuizProgress`）に統一

## 影響範囲
- Loading: 全ページ（遅延読み込みのため初回表示がわずかに変わる可能性、ただしフォールバックUI既存）
- setState修正: 各コンポーネントの動作は不変（内部最適化のみ）
- localStorage: 既存データとの後方互換性を維持

## 禁止事項チェック
- ❌ 独自CSS生成しない → UIコンポーネント変更なし
- ❌ 設計方針を変更しない → リファクタリングのみ
- ❌ 機能追加しない → パフォーマンス改善のみ
