# 設計書: 統合テストとE2Eテストの実装 (Playwright)

## アーキテクチャ

### ディレクトリ構成

```
e2e/
├── fixtures/           # テスト共通フィクスチャ
│   ├── test-base.ts    # カスタムtest fixture（Firebase モック等）
│   └── test-data.ts    # テストデータ定義
├── pages/              # ページ統合テスト
│   ├── home.spec.ts
│   ├── quiz.spec.ts
│   ├── roast-timer.spec.ts
│   ├── schedule.spec.ts
│   └── tasting.spec.ts
├── flows/              # クリティカルフローE2E
│   ├── roast-timer-flow.spec.ts
│   ├── quiz-flow.spec.ts
│   └── data-management-flow.spec.ts
├── responsive/         # レスポンシブテスト
│   └── responsive.spec.ts
├── accessibility/      # アクセシビリティテスト
│   └── a11y.spec.ts
└── performance/        # パフォーマンステスト
    └── performance.spec.ts
```

### 設定ファイル
- `playwright.config.ts` - プロジェクトルート

## Firebase モック戦略

### アプローチ: ブラウザレベルのルートインターセプト

Playwrightの `page.route()` を使用してFirebase APIコールをインターセプト:

```typescript
// Firestore REST API コールをインターセプト
await page.route('**/firestore.googleapis.com/**', async route => {
  await route.fulfill({ json: mockData });
});

// Auth APIコールをインターセプト
await page.route('**/identitytoolkit.googleapis.com/**', async route => {
  await route.fulfill({ json: mockAuthResponse });
});
```

### 代替案: Service Worker によるモック
- MSW (Mock Service Worker) をテスト環境で使用
- Firebaseの全APIコールをモック

### 選定理由
- ルートインターセプトはPlaywright標準機能で追加依存なし
- テストごとに異なるレスポンスを設定可能
- Firebase SDKの内部実装に依存しない

## 変更対象ファイル

### 新規作成
| ファイル | 目的 |
|---------|------|
| `playwright.config.ts` | Playwright設定 |
| `e2e/fixtures/test-base.ts` | 共通フィクスチャ |
| `e2e/fixtures/test-data.ts` | テストデータ |
| `e2e/pages/*.spec.ts` | ページ統合テスト (5ファイル) |
| `e2e/flows/*.spec.ts` | フローE2Eテスト (3ファイル) |
| `e2e/responsive/*.spec.ts` | レスポンシブテスト (1ファイル) |
| `e2e/accessibility/*.spec.ts` | a11yテスト (1ファイル) |
| `e2e/performance/*.spec.ts` | パフォーマンステスト (1ファイル) |

### 修正
| ファイル | 変更内容 |
|---------|---------|
| `package.json` | Playwright scripts追加 |
| `.github/workflows/ci.yml` | E2Eテストジョブ追加 |
| `.gitignore` | Playwrightアーティファクト除外 |

## 禁止事項チェック
- [x] 既存のユニットテスト（Vitest）に影響しない
- [x] 本番コードに変更を加えない
- [x] Firebase本番環境にアクセスしない
