# 要件定義

**Issue**: #213
**作成日**: 2026-02-11
**ラベル**: enhancement

---

## ユーザーストーリー

**As a** 開発者（プロダクトオーナー）

**I want to** 本番環境で発生したエラーをリアルタイムで監視・追跡できる仕組みを導入したい

**So that** ユーザーが遭遇したエラーを即座に検知し、迅速に修正できる

---

## 背景

RoastPlusは現在、エラーハンドリングを `console.error` のみで行っており、以下の課題がある:

1. **本番環境のエラーが見えない**: クライアント側のエラーは開発者に届かない
2. **エラーの再現が困難**: どのユーザーがどの操作でエラーに遭遇したか不明
3. **Cloud Functions のエラー追跡が不十分**: Firebase Functions Logsは確認できるが、体系的な監視がない
4. **エラー通知がない**: 重大なエラーが発生しても気づけない

**プロジェクト特性**:
- **静的エクスポート**: `output: 'export'`（本番ビルドのみ）
- **全ページ `'use client'`**: Server Components は未使用
- **Cloud Functions**: `ocrScheduleFromImage`, `analyzeTastingSession`（OpenAI API連携）

---

## 要件一覧

### 必須要件

#### FR-1: Sentry SDK導入（クライアント）

- Sentryアカウント作成・プロジェクト設定
- `@sentry/nextjs` インストール
- `sentry.client.config.ts` 作成（静的エクスポート対応）
- 環境変数設定（DSN、環境識別）

#### FR-2: Sentry SDK導入（Cloud Functions）

- `@sentry/node` インストール（`functions/package.json`）
- `functions/src/sentry.ts` 作成（初期化ヘルパー）
- 既存の2関数にSentry統合
  - `ocrScheduleFromImage`
  - `analyzeTastingSession`

#### FR-3: ErrorBoundary実装

- **グローバルエラーハンドラ**: `app/global-error.tsx` 作成（ルートレベル）
- **ページレベルエラーハンドラ**: `app/error.tsx` 作成（汎用フォールバック）
- エラー表示UI（ユーザーフレンドリーなメッセージ）
- 自動Sentryレポート

#### FR-4: 既存 `console.error` の段階的置き換え

- **重要度高**: 認証、Firestore、Storage、OCR、AI分析
- **重要度中**: ローカルストレージ、通知、音声
- **重要度低**: その他ユーティリティ

**置き換え方針**:
```typescript
// Before
console.error('エラー:', error);

// After
import * as Sentry from '@sentry/nextjs';
Sentry.captureException(error, { tags: { context: 'auth' } });
console.error('エラー:', error); // 開発時のログは残す
```

#### FR-5: エラーレベル分類

| レベル | 用途 | 例 |
|--------|------|-----|
| `error` | キャッチ可能なエラー | API失敗、バリデーションエラー |
| `fatal` | アプリ継続不可能 | Firebase初期化失敗 |
| `warning` | 警告（エラーではない） | 非推奨機能使用、パフォーマンス劣化 |
| `info` | 情報ログ（開発用） | デバッグ情報 |

---

### オプション要件

#### FR-6: Performance Monitoring（将来的に検討）

- Sentryのパフォーマンス監視機能（ページロード時間、API応答時間）

#### FR-7: Session Replay（将来的に検討）

- ユーザーの操作を録画してエラー再現を容易に

#### FR-8: カスタムコンテキスト

- ユーザーID、ページURL、アクション履歴をエラーに付与

---

## 受け入れ基準

### AC-1: Sentry統合が動作する

- [ ] Sentryダッシュボードでクライアントエラーが確認できる
- [ ] Sentryダッシュボードで Cloud Functions エラーが確認できる

### AC-2: ErrorBoundary が動作する

- [ ] 意図的にエラーをスローした場合、エラー画面が表示される
- [ ] エラーが自動的にSentryに送信される
- [ ] ユーザーは「再試行」ボタンでリロードできる

### AC-3: 既存エラーハンドリングが改善される

- [ ] 重要度高のファイル（認証、Firestore、Storage、OCR、AI分析）で `Sentry.captureException` が使われている
- [ ] `console.error` は開発用ログとして残る

### AC-4: ビルドが成功する

- [ ] `npm run build` が成功する（静的エクスポート対応）
- [ ] `npm run lint` が成功する
- [ ] Sentryの設定が本番・開発環境で正しく動作する

### AC-5: ドキュメント更新

- [ ] `docs/steering/TECH_SPEC.md` にSentry追加
- [ ] `docs/steering/GUIDELINES.md` にエラーハンドリングパターン追加

---

## 非機能要件

### NFR-1: パフォーマンス

- Sentryの初期化がページロード時間に影響しない（非同期初期化）
- サンプリングレート: 本番環境で100%、開発環境で無効化

### NFR-2: プライバシー

- 個人情報（メールアドレス、名前）はSentryに送信しない（スクラブ設定）
- Firebase認証の UID のみ送信（ユーザー識別用）

### NFR-3: コスト

- Sentry無料プラン（5,000イベント/月）で運用開始
- 超過時はサンプリングレート調整

---

## 参照

- **Sentry公式ドキュメント**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Sentry Node.js SDK**: https://docs.sentry.io/platforms/node/
- **Next.js静的エクスポートとSentry**: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
- **Cloud Functions でのSentry**: https://docs.sentry.io/platforms/node/guides/gcp-functions/

---

## 制約・前提

- 静的エクスポート環境（`output: 'export'`）のため、`@sentry/nextjs` の自動設定は使えない可能性がある（手動設定必要）
- Cloud Functions は `functions/` ディレクトリ配下で別途ビルド・デプロイ
- 既存の `console.error` は開発用ログとして残す（Sentry送信後も削除しない）
