# タスクリスト

**Issue**: #223
**作成日**: 2026-02-11

## フェーズ1: app/page.tsx のヘッダー抽出

- [ ] `app/page.tsx:1-414` のヘッダー部分（約90行）を特定
- [ ] `components/home/` ディレクトリを作成
- [ ] `components/home/HomeHeader.tsx` を作成
- [ ] ヘッダー部分のコードを抽出（クリスマスモード分岐UI含む）
- [ ] `app/page.tsx` で `HomeHeader` コンポーネントをimport
- [ ] ヘッダーロジック（状態管理、イベントハンドラ）を整理
- [ ] TypeScriptコンパイルエラーがないことを確認

## フェーズ2: app/page.tsx のクリスマスモード分岐整理

- [ ] クリスマスモード分岐UIの各パターンを確認
- [ ] 共通化できるロジックがあれば抽出（`useChristmasMode` hook等）
- [ ] 条件分岐を簡潔に整理
- [ ] クリスマスモード専用コンポーネントを作成（必要に応じて）

## フェーズ3: app/tasting/page.tsx の旧コード削除

- [ ] `app/tasting/page.tsx:1-352` の4つの表示モードを特定
- [ ] サブルート（`app/tasting/sessions/[id]/page.tsx` 等）の存在を確認
- [ ] サブルートに移行済みの表示モードコードを削除
- [ ] URLクエリパラメータによる表示モード切替ロジックを確認
- [ ] 不要な状態管理コードを削除

## フェーズ4: app/tasting/page.tsx のモード分離

- [ ] 残存する表示モード切替ロジックを分析
- [ ] 各モード専用のコンポーネントを作成（必要に応じて）
- [ ] `components/tasting/` ディレクトリに配置
- [ ] `app/tasting/page.tsx` を各モードコンポーネントの呼び出しに簡素化

## フェーズ5: useTimerControls エラー伝播方針統一

- [ ] `hooks/roast-timer/useTimerControls.ts` の `pauseTimer`/`resumeTimer` を確認
- [ ] エラーハンドリング方針を統一（throw vs return error object）
- [ ] 呼び出し側（`app/page.tsx` 等）のエラーハンドリングを統一
- [ ] エラーメッセージの表示方法を統一（toast/alert等）

## フェーズ6: 検証

- [ ] `npm run build` でビルドが成功することを確認
- [ ] `npm run lint` でLintエラーがないことを確認
- [ ] `npm run test` で全テストが通ることを確認
- [ ] 開発サーバー起動後、ホームページ・テイスティングページが正常に表示されることを確認
- [ ] クリスマスモード切替が正常に動作することを確認
- [ ] タイマー操作（pause/resume）が正常に動作することを確認

## 依存関係

- フェーズ1〜2は順次実行（app/page.tsx のリファクタリング）
- フェーズ3〜4は順次実行（app/tasting/page.tsx のリファクタリング）
- フェーズ5は並行実行可能（useTimerControls は独立）
- フェーズ6は全フェーズ完了後に検証
