# 設計書: 更新履歴ページの共通UI化とテーマシステム対応

## 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `app/changelog/page.tsx` | 戻るリンク→BackLink、フィルターカード→Card、テーマCSS変数化 |
| `components/changelog/ChangeTypeFilter.tsx` | フィルターボタンのテーマ対応、クリア→Button ghost |
| `components/changelog/ChangelogTimeline.tsx` | 変更なし（既にCSS変数対応済み） |
| `components/changelog/VersionCard.tsx` | 変更なし（既にCard使用・CSS変数対応済み） |

## 詳細設計

### page.tsx の変更

```
Before:
- Link + HiArrowLeft（独自戻るリンク）
- text-gray-800, text-gray-500, text-amber-500（ハードコード色）
- bg-white + border-gray-100（フィルターカード）
- border-gray-200（フッター）

After:
- BackLink variant="icon-only"
- text-ink, text-ink-muted, text-spot（CSS変数）
- Card variant="default"（フィルターカード）
- border-edge（フッター）
```

### ChangeTypeFilter.tsx の変更

```
Before:
- 生の<button>要素
- text-gray-500（フィルターラベル）
- bg-gray-100 text-gray-500（非選択状態）
- text-gray-400 hover:text-gray-600（クリアボタン）

After:
- text-ink-muted（フィルターラベル）
- bg-ground text-ink-muted（非選択状態）
- Button variant="ghost" size="sm"（クリアボタン）
```

## 禁止事項チェック
- ❌ isChristmasMode prop → 使用しない
- ❌ 独自ボタン/カード/入力作成 → 共通コンポーネント使用
- ❌ bg-surface をモーダル背景に → モーダルなし（該当なし）
