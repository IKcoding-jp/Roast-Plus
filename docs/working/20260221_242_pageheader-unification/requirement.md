# 要件定義（v2 — FloatingNav）

**Issue**: #242
**作成日**: 2026-02-21
**更新日**: 2026-02-21
**ラベル**: refactor

## 背景

v1（PageHeaderコンポーネント）は実装・テスト完了したが、ユーザーレビューで却下された。
原因: 各ページのレイアウトコンテナ（max-w, padding）内に配置されるため、ヘッダー幅・位置がページごとに異なり統一感が出なかった。

ブレインストーミングにより根本方針を変更:
- 「ページタイトルは不要」（ユーザーはホームからの遷移で現在地を把握済み）
- 「フローティングナビゲーション」（fixed配置でレイアウト差異を回避）

## ユーザーストーリー

ユーザー「ページタイトルは不要。戻るボタンとアクションボタンだけあればいい。画面の端にフローティングで常時表示されていてほしい」
アプリ「全通常ページでフローティングナビゲーションを提供。ヘッダーバーを廃止し、コンテンツ領域を最大化する」

## 要件一覧

### 必須要件
- [ ] 共通 `FloatingNav` コンポーネントの作成（`components/ui/FloatingNav.tsx`）
- [ ] fixed配置（viewport top-left / top-right）
- [ ] 対象16ページのヘッダーを `FloatingNav` に置換
- [ ] Design Lab（`/dev/design-lab`）への登録
- [ ] 既存の戻るボタン・右側アクションが正常に動作すること
- [ ] コンテンツ側のpadding-top調整（ボタンとの重なり回避）

### オプション要件
- [ ] `ProgressHeader` の廃止（FloatingNav + right プロップで代替）

## FloatingNav API

```tsx
interface FloatingNavProps {
  backHref?: string;      // 戻り先URL（省略で戻るボタン非表示）
  right?: React.ReactNode; // 右側アクションボタン群
  className?: string;      // 追加クラス
}
```

## ビジュアル仕様

| 要素 | スタイル |
|------|---------|
| 戻るボタン | `fixed top-3 left-3 sm:top-4 sm:left-4 z-50` / 44x44px / `bg-surface/80 backdrop-blur-sm shadow-md rounded-full` |
| 右アクション | `fixed top-3 right-3 sm:top-4 sm:right-4 z-50` / 既存Button/IconButtonを使用 / `flex items-center gap-2 sm:gap-3` |
| コンテンツ | `pt-14`（56px）でフローティング領域を確保 |
| アイコン | `IoArrowBack`（Ionicons） |

**重要**: フルワイドバーではなく、左右に独立して浮いている個別ボタン。背景帯なし。

## 対象ページ（16ページ）

| ページ | backHref | right |
|--------|----------|-------|
| settings | `/` | なし |
| notifications | `/` | なし |
| contact | `/settings` | なし |
| changelog | `/settings` | なし |
| brewing | `/` | なし |
| terms | `/settings` | なし |
| privacy-policy | `/settings` | なし |
| assignment | `/` | 設定ボタン |
| drip-guide | `/` | 新規ボタン |
| dev-stories | `/` | キャラ画像群 |
| coffee-trivia | `/` | ヘルプボタン |
| schedule | `/` | 日付カード |
| defect-beans | `/` | ソート・比較・追加ボタン |
| roast-record | `/` | 新規作成ボタン |
| tasting | `/` | フィルター・セッション作成ボタン |
| progress | `/` | フィルター・アーカイブ・追加ボタン |

## 除外ページ

- `clock` - 全画面時計（特殊レイアウト）
- `roast-timer` - タイマーUI（特殊レイアウト）
- `login` - 認証画面（特殊レイアウト）
- ホーム（`app/page.tsx`） - HomeHeaderは別議論

## 受け入れ基準

- [ ] 全対象ページでフローティング戻るボタンが左上に表示される
- [ ] 右アクション付きページで右上にフローティングボタンが表示される
- [ ] ページタイトル（h1）がヘッダーから削除されている
- [ ] FloatingNavコンポーネントがDesign Labに登録・表示される
- [ ] `npm run lint && npm run build && npm run test:run` がすべて通る
- [ ] 各ページの既存機能（戻るボタン、右側アクション）が正常動作する
- [ ] テーマ切替（7テーマ）で正しく表示される
- [ ] コンテンツがフローティングボタンと重ならない
