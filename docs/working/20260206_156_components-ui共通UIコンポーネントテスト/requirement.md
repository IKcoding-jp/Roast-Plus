# 要件定義

**Issue**: #156
**作成日**: 2026-02-06
**ラベル**: test

## 概要

components/ui/ の共通UIコンポーネントに包括的なテストを実装する。

## 現状

- components/ui/: Button.test.tsx のみ
- 他の共通コンポーネント（16個）が未テスト

## 対象コンポーネント

### フォーム系（7個）
- Input, NumberInput, InlineInput, Textarea, Select, Checkbox, Switch

### コンテナ系（3個）
- Card, Modal, Dialog

### 表示系（6個）
- Badge, Tabs, Accordion, ProgressBar, EmptyState, IconButton

## テスト内容（各コンポーネント共通）

1. 基本的なレンダリング
2. Props の適用
3. クリスマスモード対応
4. バリアントの切り替え
5. インタラクション（クリック、入力等）
6. アクセシビリティ（aria-*, role等）

## 受け入れ基準

- [ ] 全16コンポーネントのテストが実装されている
- [ ] 全テストが成功する
- [ ] components/ui/ カバレッジ: 80%以上
