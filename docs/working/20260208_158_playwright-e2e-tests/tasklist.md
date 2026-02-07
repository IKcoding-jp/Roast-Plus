# タスクリスト: 統合テストとE2Eテストの実装 (Playwright)

**ステータス**: 🔄 進行中
**Issue**: #158

## Phase 1: セットアップ

- [ ] 1.1 Playwrightインストール (`npm init playwright@latest`)
- [ ] 1.2 `playwright.config.ts` 作成・設定
- [ ] 1.3 `e2e/` ディレクトリ構成作成
- [ ] 1.4 共通フィクスチャ作成 (`e2e/fixtures/test-base.ts`)
- [ ] 1.5 テストデータ定義 (`e2e/fixtures/test-data.ts`)
- [ ] 1.6 `package.json` にスクリプト追加
- [ ] 1.7 `.gitignore` 更新

## Phase 2: クリティカルフローE2E

- [ ] 2.1 ローストタイマーフロー (`e2e/flows/roast-timer-flow.spec.ts`)
  - タイマー起動→一時停止→再開→完了
  - 通知設定変更
- [ ] 2.2 クイズシステムフロー (`e2e/flows/quiz-flow.spec.ts`)
  - デイリークイズ実施
  - 復習モード
  - XP獲得・レベルアップ
- [ ] 2.3 データ管理フロー (`e2e/flows/data-management-flow.spec.ts`)
  - スケジュールCRUD
  - テイスティング記録作成

## Phase 3: ページ統合テスト

- [ ] 3.1 ホームページ (`e2e/pages/home.spec.ts`)
- [ ] 3.2 クイズページ (`e2e/pages/quiz.spec.ts`)
- [ ] 3.3 タイマーページ (`e2e/pages/roast-timer.spec.ts`)
- [ ] 3.4 スケジュールページ (`e2e/pages/schedule.spec.ts`)
- [ ] 3.5 テイスティングページ (`e2e/pages/tasting.spec.ts`)

## Phase 4: レスポンシブテスト

- [ ] 4.1 レスポンシブテスト (`e2e/responsive/responsive.spec.ts`)
  - モバイル (375px)
  - タブレット (768px)
  - デスクトップ (1920px)

## Phase 5: アクセシビリティテスト

- [ ] 5.1 アクセシビリティテスト (`e2e/accessibility/a11y.spec.ts`)
  - キーボードナビゲーション
  - カラーコントラスト（@axe-core/playwright使用）

## Phase 6: パフォーマンステスト

- [ ] 6.1 パフォーマンステスト (`e2e/performance/performance.spec.ts`)
  - ページロード時間
  - インタラクション遅延

## Phase 7: CI/CD統合

- [ ] 7.1 `.github/workflows/ci.yml` にE2Eテストジョブ追加
- [ ] 7.2 Playwrightブラウザキャッシュ設定

## Phase 8: 検証

- [ ] 8.1 全E2Eテスト実行・合格確認
- [ ] 8.2 lint / build / test 通過確認
