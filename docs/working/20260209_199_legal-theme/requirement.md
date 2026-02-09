# 要件定義

**Issue**: #199
**作成日**: 2026-02-09
**ラベル**: ui

## ユーザーストーリー

ユーザー「クリスマスモードで利用規約を見ようとしたけど、文字が見えない…」
アプリ「テーマに合わせて自動的に色が切り替わり、どのモードでも快適に読める」

## 要件一覧

### 必須要件
- [ ] 4ページ（terms, privacy-policy, contact, consent）のハードコード色をCSS変数に置換
- [ ] `style={{ backgroundColor: '#F7F7F5' }}` を `className="bg-page"` に変更
- [ ] `bg-white` → `bg-surface` に統一
- [ ] `text-gray-*` → `text-ink` / `text-ink-sub` / `text-ink-muted` に統一
- [ ] `border-gray-*` → `border-edge` に統一
- [ ] `*-orange-*` → `*-spot` 系に統一
- [ ] `*-red-*` → `danger` / `danger-subtle` 系に統一
- [ ] `hover:bg-gray-100` → `hover:bg-ground` に統一
- [ ] クリスマスモードで全ページが正常に表示されること

### オプション要件
- [ ] コンテンツカードを `<Card>` コンポーネントに置き換え
- [ ] ボタンを `<Button>` コンポーネントに置き換え
- [ ] フォーム入力を共通UI（`<Input>`, `<Textarea>`, `<Select>`）に置き換え

## 受け入れ基準

- [ ] 通常モードで全4ページの見た目が現状と同等であること
- [ ] クリスマスモードで全4ページが正常に表示されること（テキスト視認可能、背景適切）
- [ ] ハードコードされた色（`#F7F7F5`, `bg-white`, `text-gray-*` 等）が残っていないこと
- [ ] Lint エラー・warning がゼロであること
