# コンポーネントカタログ

`@/components/ui` の全共通コンポーネントのAPI仕様。すべてCSS変数ベースでテーマ自動対応。

---

## 目次

1. ボタン系（Button, IconButton, BackLink）
2. フォーム系（Input, NumberInput, InlineInput, Select, Textarea, Checkbox, Switch）
3. コンテナ系（Card, Modal, Dialog, Tabs, Accordion）
4. 表示系（Badge, RoastLevelBadge, ProgressBar, EmptyState）
5. 新規コンポーネント追加手順

---

## 1. ボタン系

### Button

統一ボタン。10種variants、3サイズ。

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" onClick={handle}>送信</Button>
<Button variant="danger" loading={isSubmitting}>削除中...</Button>
<Button variant="surface" badge={3}>フィルター</Button>
<Button variant="outline" fullWidth>全幅ボタン</Button>
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'success' \| 'warning' \| 'info' \| 'outline' \| 'ghost' \| 'coffee' \| 'surface'` | `'primary'` | スタイル |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | サイズ |
| `loading` | `boolean` | `false` | ローディングスピナー表示 |
| `fullWidth` | `boolean` | `false` | 全幅表示 |
| `badge` | `number` | - | バッジ数値（0以下で非表示） |

**variant別の外観:**
- `primary` - オレンジ背景（クリスマス: 暗赤背景）
- `secondary` - グレー背景
- `danger` - 赤背景
- `success` - 緑背景
- `warning` - 黄背景
- `info` - シアン背景
- `outline` - 透明＋アクセントボーダー
- `ghost` - 透明、テキストリンク風
- `coffee` - ダークブラウン背景
- `surface` - 白背景＋シャドウ（フィルター等に）

### IconButton

アイコン専用ボタン。閉じる、削除、追加等のアクションに。

```tsx
import { IconButton } from '@/components/ui';
import { HiX, HiPlus, HiTrash } from 'react-icons/hi';

<IconButton onClick={handleClose} aria-label="閉じる">
  <HiX size={20} />
</IconButton>
<IconButton variant="danger" aria-label="削除">
  <HiTrash size={20} />
</IconButton>
<IconButton variant="primary" rounded>
  <HiPlus size={20} />
</IconButton>
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `variant` | `'default' \| 'primary' \| 'danger' \| 'success' \| 'ghost' \| 'surface'` | `'default'` | スタイル |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | パディングサイズ |
| `rounded` | `boolean` | `false` | 完全な円形 |

### BackLink

ページ上部の「戻る」ナビゲーション。

```tsx
import { BackLink } from '@/components/ui';

// テキスト付き
<BackLink href="/tasting">一覧に戻る</BackLink>

// アイコンのみ
<BackLink href="/" variant="icon-only" />
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `href` | `string` | (必須) | リンク先URL |
| `variant` | `'default' \| 'icon-only'` | `'default'` | 表示スタイル |
| `children` | `ReactNode` | - | リンクテキスト |

---

## 2. フォーム系

### Input

テキスト入力。パスワードトグル、エラー表示対応。

```tsx
import { Input } from '@/components/ui';

<Input label="名前" placeholder="山田太郎" value={name} onChange={e => setName(e.target.value)} />
<Input label="パスワード" type="password" showPasswordToggle />
<Input label="メール" error="有効なメールアドレスを入力してください" />
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `label` | `string` | - | ラベルテキスト |
| `error` | `string` | - | エラーメッセージ |
| `showPasswordToggle` | `boolean` | `false` | パスワード表示トグル（type="password"時のみ） |

HTML `<input>` の全属性を継承。

### NumberInput

数値専用入力。suffix（単位）表示対応。

```tsx
import { NumberInput } from '@/components/ui';

<NumberInput label="幅" suffix="px" value={width} onChange={e => setWidth(parseInt(e.target.value))} />
<NumberInput label="温度" suffix="℃" error="0以上の値を入力" />
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `label` | `string` | - | ラベルテキスト |
| `suffix` | `string` | - | 単位表示（px, ℃等） |
| `error` | `string` | - | エラーメッセージ |

### InlineInput

インライン編集用の軽量入力。テーブルセルやヘッダー内で使用。

```tsx
import { InlineInput } from '@/components/ui';

<InlineInput value={val} onChange={e => setVal(e.target.value)} variant="light" />
<InlineInput value={val} onChange={e => setVal(e.target.value)} variant="dark" />
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `variant` | `'light' \| 'dark'` | `'light'` | 背景色に合わせた配色 |

### Select

セレクトボックス。

```tsx
import { Select } from '@/components/ui';

<Select
  label="焙煎度"
  placeholder="選択してください"
  options={[
    { value: 'light', label: 'ライトロースト' },
    { value: 'medium', label: 'ミディアムロースト' },
    { value: 'dark', label: 'ダークロースト' },
  ]}
  value={level}
  onChange={e => setLevel(e.target.value)}
/>
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `label` | `string` | - | ラベルテキスト |
| `options` | `{ value: string; label: string }[]` | (必須) | 選択肢 |
| `placeholder` | `string` | - | 空の初期選択肢テキスト |
| `error` | `string` | - | エラーメッセージ |

### Textarea

複数行テキスト入力。

```tsx
import { Textarea } from '@/components/ui';

<Textarea label="メモ" placeholder="焙煎メモ" rows={4} />
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `label` | `string` | - | ラベルテキスト |
| `error` | `string` | - | エラーメッセージ |

HTML `<textarea>` の全属性を継承。

### Checkbox

チェックボックス。説明文付き対応。

```tsx
import { Checkbox } from '@/components/ui';

<Checkbox label="通知を受け取る" checked={checked} onChange={e => setChecked(e.target.checked)} />
<Checkbox label="利用規約" description="利用規約に同意します" />
<Checkbox label="無効" disabled />
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `label` | `string` | (必須) | ラベルテキスト |
| `description` | `string` | - | 補足説明文 |

### Switch

ON/OFFトグルスイッチ。3サイズ対応。

```tsx
import { Switch } from '@/components/ui';

<Switch label="通知" checked={on} onChange={e => setOn(e.target.checked)} />
<Switch size="sm" checked={true} label="Small" />
<Switch size="lg" checked={true} label="Large" />
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `label` | `string` | - | ラベルテキスト |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | サイズ |

---

## 3. コンテナ系

### Card

カードコンポーネント。6種variants。

```tsx
import { Card } from '@/components/ui';

<Card variant="default">基本カード</Card>
<Card variant="hoverable" onClick={handle}>ホバーカード</Card>
<Card variant="action">ホームページ用アクションカード</Card>
<Card variant="coffee">ダークブラウンカード</Card>
<Card variant="table">テーブル用（overflow-hidden）</Card>
<Card variant="guide">ガイド用（中央配置）</Card>
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `variant` | `'default' \| 'hoverable' \| 'action' \| 'coffee' \| 'table' \| 'guide'` | `'default'` | スタイル |

**variant詳細:**
- `default` - `bg-surface rounded-2xl shadow-card border-edge p-4`
- `hoverable` - default + ホバー時シャドウ変化・ボーダー強調
- `action` - ホームカード用。ホバーで浮き上がり（-translate-y-2）
- `coffee` - ダークブラウン固定背景
- `table` - テーブル用。`bg-overlay rounded-xl overflow-hidden`
- `guide` - ガイド用。`bg-overlay rounded-xl text-center p-6`

**重要**: `table` と `guide` は `bg-overlay`（不透明）を使用。モーダル内やテーブルなど半透明では困る場面用。

### Modal

Framer Motion アニメーション付きモーダル。

```tsx
import { Modal } from '@/components/ui';

<Modal
  show={isOpen}
  onClose={() => setIsOpen(false)}
  contentClassName="bg-overlay rounded-2xl shadow-xl overflow-hidden max-w-sm w-full border border-edge"
>
  <div className="p-6">
    <h3 className="text-lg font-bold text-ink">タイトル</h3>
    <p className="text-ink-sub">内容</p>
  </div>
</Modal>
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `show` | `boolean` | (必須) | 表示/非表示 |
| `onClose` | `() => void` | (必須) | 閉じるコールバック |
| `contentClassName` | `string` | `'bg-overlay rounded-2xl...'` | コンテンツのクラス |
| `closeOnBackdropClick` | `boolean` | `true` | 背景クリックで閉じる |

**モーダル背景は必ず `bg-overlay`**（`bg-surface` はクリスマスモードで半透明になるため不可）。

### Dialog

確認ダイアログ。Modal の上に構築。

```tsx
import { Dialog } from '@/components/ui';

// 通常確認
<Dialog
  isOpen={show}
  onClose={() => setShow(false)}
  title="確認"
  description="この操作を実行しますか？"
  confirmText="実行する"
  onConfirm={handleConfirm}
/>

// 危険アクション
<Dialog
  isOpen={show}
  onClose={() => setShow(false)}
  title="削除の確認"
  description="取り消せません。"
  confirmText="削除する"
  onConfirm={handleDelete}
  variant="danger"
/>
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `isOpen` | `boolean` | (必須) | 表示/非表示 |
| `onClose` | `() => void` | (必須) | 閉じるコールバック |
| `title` | `string` | (必須) | タイトル |
| `description` | `string` | - | 説明文 |
| `confirmText` | `string` | `'OK'` | 確認ボタンテキスト |
| `cancelText` | `string` | `'キャンセル'` | キャンセルボタンテキスト |
| `onConfirm` | `() => void` | (必須) | 確認コールバック |
| `variant` | `'default' \| 'danger'` | `'default'` | 通常/危険スタイル |
| `isLoading` | `boolean` | `false` | ローディング中 |

### Tabs

タブ切替。Context APIベースで制御/非制御対応。

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';

<Tabs defaultValue="tab1">
  <TabsList className="mb-4">
    <TabsTrigger value="tab1">タブ1</TabsTrigger>
    <TabsTrigger value="tab2">タブ2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">内容1</TabsContent>
  <TabsContent value="tab2">内容2</TabsContent>
</Tabs>

// 制御モード
<Tabs defaultValue="tab1" value={activeTab} onValueChange={setActiveTab}>
```

| Prop (Tabs) | 型 | 説明 |
|------------|-----|------|
| `defaultValue` | `string` | デフォルトタブ値 |
| `value` | `string` | 制御モード用 |
| `onValueChange` | `(value: string) => void` | 値変更コールバック |

### Accordion

折りたたみセクション。

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui';

<Accordion>
  <AccordionItem defaultOpen>
    <AccordionTrigger>セクション1（デフォルトで開く）</AccordionTrigger>
    <AccordionContent>内容1</AccordionContent>
  </AccordionItem>
  <AccordionItem>
    <AccordionTrigger>セクション2</AccordionTrigger>
    <AccordionContent>内容2</AccordionContent>
  </AccordionItem>
</Accordion>
```

| Prop (AccordionItem) | 型 | デフォルト | 説明 |
|---------------------|-----|----------|------|
| `defaultOpen` | `boolean` | `false` | 初期状態で開くか |

---

## 4. 表示系

### Badge

ラベル/タグ表示。7 variants、3サイズ。

```tsx
import { Badge } from '@/components/ui';

<Badge variant="primary">新着</Badge>
<Badge variant="success" size="sm">完了</Badge>
<Badge variant="danger">エラー</Badge>
<Badge variant="coffee">焙煎</Badge>
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `variant` | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'coffee'` | `'default'` | スタイル |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | サイズ |

### RoastLevelBadge

焙煎度専用バッジ。4段階の焙煎度を豆の色で表現。

```tsx
import { RoastLevelBadge } from '@/components/ui';

<RoastLevelBadge level="浅煎り" />
<RoastLevelBadge level="中煎り" />
<RoastLevelBadge level="中深煎り" />
<RoastLevelBadge level="深煎り" size="lg" />
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `level` | `'深煎り' \| '中深煎り' \| '中煎り' \| '浅煎り' \| string` | (必須) | 焙煎度 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | サイズ |

**焙煎度別カラー:**
- 深煎り: `#120C0A`（ほぼ黒）
- 中深煎り: `#4E3526`（ダークブラウン）
- 中煎り: `#745138`（ミディアムブラウン）
- 浅煎り: `#C78F5D`（キャメル）

### ProgressBar

進捗バー。5 variants対応。

```tsx
import { ProgressBar } from '@/components/ui';

<ProgressBar value={65} variant="primary" label="進捗" showValue />
<ProgressBar value={80} variant="success" />
<ProgressBar value={30} variant="danger" />
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `value` | `number` | (必須) | 0-100の進捗値 |
| `variant` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'coffee'` | `'primary'` | カラー |
| `label` | `string` | - | ラベル |
| `showValue` | `boolean` | `false` | パーセント値を表示 |

### EmptyState

データなし状態の表示。

```tsx
import { EmptyState } from '@/components/ui';
import { HiInbox } from 'react-icons/hi';

<EmptyState
  icon={<HiInbox className="h-12 w-12" />}
  title="データがありません"
  description="新しいアイテムを追加しましょう。"
  action={<Button size="sm">追加する</Button>}
/>
```

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `icon` | `ReactNode` | - | アイコン要素 |
| `title` | `string` | (必須) | タイトル |
| `description` | `string` | - | 説明文 |
| `action` | `ReactNode` | - | アクションボタン等 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 全体サイズ |

---

## 5. 新規コンポーネント追加手順

1. **`components/ui/NewComponent.tsx`** を作成
2. **`components/ui/index.ts`** にエクスポート追加:
   ```tsx
   export { NewComponent } from './NewComponent';
   export type { NewComponentProps } from './NewComponent';
   ```
3. **`components/ui/registry.tsx`** に追加:
   ```tsx
   // デモコンポーネント
   function NewComponentDemo() {
     return <NewComponent />;
   }

   // componentRegistry 配列に追加
   {
     name: 'NewComponent',
     description: '説明',
     category: 'button' | 'form' | 'container' | 'display' | 'feedback',
     Demo: NewComponentDemo,
   }
   ```
4. `/ui-test` ページに自動表示される

### コンポーネント作成時のルール

- CSS変数ベースのスタイルを使用（`text-ink`, `bg-surface`, `border-edge` 等）
- テーマ関連のpropは使わない（CSS変数で自動切替）
- `forwardRef` でref転送対応
- `min-h-[44px]` のタッチターゲットを確保
- `aria-*` 属性を適切に設定
