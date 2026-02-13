# タスクリスト

**ステータス**: 完了
**完了日**: 2026-02-13

## フェーズ1: ヘッダーコンポーネント抽出
- [x] `app/page.tsx` から現在のヘッダー（行297-376）を `components/home/HomeHeader.tsx` に抽出
- [x] 抽出後、`app/page.tsx` でインポート・使用して既存動作が変わらないことを確認
- [x] props設計: `onShowLoadingDebugModal` のみ。フックは内部で呼び出し

## フェーズ2: ヘッダーデザインバリアント作成
- [x] `/frontend-design` スキルでデザインの方向性を検討（10案作成）
- [x] バリアントA-I: 新規デザイン案を作成・比較
- [x] 各バリアントは同一のpropsインターフェース（`HomeHeaderProps`）を実装

## フェーズ3: デバッグ切替UI実装
- [x] `components/home/HeaderDebugSwitcher.tsx` — フローティング切替パネル
- [x] `useDeveloperMode` で表示/非表示を制御

## フェーズ4: 統合・動作確認
- [x] ユーザー手動確認で Variant C（Casual、アイコンなし）を採用

## フェーズ5: クリーンアップ
- [x] 採用デザイン（Variant C アイコンなし）を `HomeHeader` として本実装
- [x] `header-variants/` ディレクトリと `HeaderDebugSwitcher` を削除
- [x] デバッグ関連のimport・ロジックを `app/page.tsx` から除去
- [x] フォントサイズ調整（text-2xl md:text-3xl）
- [x] ヘッダーpaddingをメインコンテンツと揃え（px-4 sm:px-6）

## 依存関係
- フェーズ1 → フェーズ2, 3（並行可能）
- フェーズ2 + フェーズ3 → フェーズ4
- フェーズ4 → ユーザーによるデザイン選定 → フェーズ5

## 見積もり
- フェーズ1: 5分
- フェーズ2: 15分（デザイン検討含む）
- フェーズ3: 10分
- フェーズ4: 5分
- フェーズ5: 5分（採用決定後）
- **合計: 約40分**
