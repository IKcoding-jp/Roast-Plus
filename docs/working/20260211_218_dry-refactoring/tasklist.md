# タスクリスト

**Issue**: #218
**作成日**: 2026-02-11

## フェーズ1: sounds.ts の重複統合

- [ ] `lib/sounds.ts` の `playTimerSound` と `playNotificationSound` を比較
- [ ] 共通関数 `playSound(channel: 'timer' | 'notification', ...)` を設計
- [ ] `playSound` を実装
- [ ] `playTimerSound`/`playNotificationSound` を `playSound` の呼び出しに置換
- [ ] `stopTimerSound` と `stopNotificationSound` を統合（`stopSound(channel)`）
- [ ] sounds.ts のimport先ファイルを確認し、必要に応じて呼び出し側を更新

## フェーズ2: normalizeAppData のリファクタリング

- [ ] `lib/firestore/common.ts:69-210` の `normalizeAppData` を分析
- [ ] 配列フィールド正規化ヘルパー関数を設計（`normalizeArray`）
- [ ] オブジェクトフィールド正規化ヘルパー関数を設計（`normalizeObject`）
- [ ] プリミティブフィールド正規化ヘルパー関数を設計（`normalizePrimitive`）
- [ ] `normalizeAppData` を各ヘルパー関数の組み合わせで書き換え
- [ ] TypeScript型定義が正しく保たれることを確認

## フェーズ3: RoastLevel の一元化

- [ ] `lib/constants.ts` の `ROAST_LEVELS` 配列を確認
- [ ] `types/common.ts` で `RoastLevel` 型を `typeof ROAST_LEVELS[number]` で導出
- [ ] 既存の `RoastLevel` 型定義（重複があれば）を削除
- [ ] `types/common.ts` から `RoastLevel` をre-exportし、全importパスを更新

## フェーズ4: tasting/page.tsx の「not found」パターン共通化

- [ ] `app/tasting/page.tsx` の「セッションが見つかりません」パターンを特定
- [ ] 共通コンポーネント `TastingNotFound.tsx` を作成
- [ ] 3箇所の重複パターンを共通コンポーネントに置換

## フェーズ5: 自明なJSDoc削除

- [ ] `lib/roastTimerUtils.ts` の自明な関数（`formatTime` 等）を特定
- [ ] 自明なJSDocを削除（関数名・引数名で十分に意図が伝わるもの）
- [ ] 複雑なビジネスロジック関数のJSDocは残す

## フェーズ6: 検証

- [ ] `npm run build` でビルドが成功することを確認
- [ ] `npm run lint` でLintエラーがないことを確認
- [ ] `npm run test` で全テストが通ることを確認
- [ ] 開発サーバー起動後、sounds機能・normalizeAppData・tasting表示が正常動作することを確認

## 依存関係

- フェーズ1〜5は並行実行可能（各ファイルが独立）
- フェーズ6は全フェーズ完了後に検証
