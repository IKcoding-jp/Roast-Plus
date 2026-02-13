# タスクリスト

## フェーズ1: ヘッダーコンポーネント抽出
- [ ] `app/page.tsx` から現在のヘッダー（行297-376）を `components/home/HomeHeader.tsx` に抽出
- [ ] 抽出後、`app/page.tsx` でインポート・使用して既存動作が変わらないことを確認
- [ ] props設計: `isChristmasMode`, `isDeveloperMode`, `router`, `handleShowLoadingDebugModal` 等を受け渡し

## フェーズ2: ヘッダーデザインバリアント作成
- [ ] `/frontend-design` スキルでデザインの方向性を検討（3-5案）
- [ ] バリアント1: 現行デザイン（`HeaderVariantCurrent`）— 抽出したものをそのまま使用
- [ ] バリアント2-5: 新規デザイン案を `components/home/header-variants/` に作成
- [ ] 各バリアントは同一のpropsインターフェース（`HomeHeaderProps`）を実装
- [ ] 全5テーマでの表示を確認

## フェーズ3: デバッグ切替UI実装
- [ ] `components/home/HeaderDebugSwitcher.tsx` — フローティング切替パネル
- [ ] 画面下部に固定表示（`fixed bottom-4`）
- [ ] バリアント名のボタンリスト + 現在選択中の表示
- [ ] `useDeveloperMode` で表示/非表示を制御
- [ ] 選択状態をReact state（またはlocalStorage）で管理

## フェーズ4: 統合・動作確認
- [ ] `app/page.tsx` でデバッグモードの切替ロジックを統合
- [ ] 開発者モードOFF時: 現行ヘッダー表示（デバッグUI非表示）
- [ ] 開発者モードON時: 選択バリアントのヘッダー + 切替UIを表示
- [ ] 全テーマ × 全バリアントの組み合わせで表示確認

## フェーズ5: クリーンアップ（採用決定後）
- [ ] ユーザーが選定したデザインを `HomeHeader` として本実装
- [ ] `header-variants/` ディレクトリと `HeaderDebugSwitcher` を削除
- [ ] デバッグ関連のimport・ロジックを `app/page.tsx` から除去

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
