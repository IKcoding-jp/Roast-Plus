# 要件定義: 担当表モーダルデザイン統一

## Issue
#291 - style(#assignment): 担当表モーダルのデザイン統一

## 概要
担当表の全8モーダルのデザインを、コンテキストメニューモーダル（担当セルクリック時）を基準に統一する。

## 修正対象

### 1. 文字色の修正
- コンテキストメニュー内「メンバーを変更・追加」「除外ラベル設定」ボタンの文字色を `text-ink`（黒）に変更

### 2. キャンセルボタンの統一
- 全モーダルのキャンセル/閉じるボタンを `variant="secondary"` に統一
- 現状: ghost（チーム編集、幅設定）、secondary（高さ設定）が混在

### 3. モーダル構造の統一
理想形の仕様:

| 項目 | 仕様 |
|------|------|
| 背景オーバーレイ | `bg-black/40` |
| モーダル外枠 | `rounded-xl bg-overlay border border-edge shadow-xl` |
| ヘッダー | `bg-ground border-b border-edge` + 右上 `IconButton variant="ghost"` |
| ボディ | `bg-overlay` |
| キャンセル | `variant="secondary"` |

## 対象ファイル（4ファイル・8モーダル）
1. `app/assignment/components/assignment-table/TableModals.tsx` - 5モーダル
2. `app/assignment/components/ManagerDialog.tsx`
3. `app/assignment/components/PairExclusionSettingsModal.tsx`
4. `app/assignment/components/MemberSettingsDialog.tsx`

## 受け入れ基準
- [ ] 全モーダルが統一デザイン仕様に準拠
- [ ] 機能への影響なし（見た目のみの変更）
- [ ] lint / build 通過
