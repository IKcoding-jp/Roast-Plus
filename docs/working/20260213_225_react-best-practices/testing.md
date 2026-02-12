# テスト計画

## テスト戦略

### 既存テストの通過確認
全変更はリファクタリングのため、既存テストがそのまま通過することが受け入れ基準。

### ユニットテスト

#### Loading.tsx
- 既存テストが`next/dynamic`変更後も通過すること
- Lottieコンポーネントの遅延読み込みが正しく動作すること

#### DripGuideRunner.tsx
- functional setState変更後、ステップ送り/戻りが正しく動作すること
- タイマーのトグル動作が正しいこと

#### TimeLabelRow.tsx
- 時間編集（時・分）が正しく更新されること
- 継続終了時間の編集が正しく動作すること

#### NotificationModal.tsx
- エラー状態のクリアが正しく動作すること
- バリデーションエラー後の入力修正でエラーが消えること

#### RoastScheduleMemoDialog.tsx
- 空useEffect削除後、コンポーネントが正常にレンダリングされること

#### localStorage.ts
- バージョニング追加後、新規データの保存/読み込みが正しいこと
- 既存データ（version未設定）の読み込みがマイグレーションされること
- バージョン不一致データの処理が正しいこと

## カバレッジ目標
- 既存カバレッジを維持（低下させない）
- localStorage.tsのバージョニング部分: 新規テスト追加で100%カバー

## 検証コマンド
```bash
npm run test           # 全テスト通過
npm run lint           # Lint エラーゼロ
npm run build          # ビルド成功
```
