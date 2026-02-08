# タスクリスト

## フェーズ1: 軽量実装への置き換え
- [ ] SVG雪の結晶コンポーネント（SimpleSnowflake, MediumSnowflake, ComplexSnowflake）をCSS-onlyの円形要素に置き換え
- [ ] 雪片数を60個から20〜30個に削減
- [ ] `filter: blur() + drop-shadow() × 2` を削除または `opacity` のみに簡素化
- [ ] CSSアニメーションを簡素化（transform + opacity のみ）

## フェーズ2: CSS最適化
- [ ] `will-change: transform` の維持
- [ ] `contain: strict` の追加を検討
- [ ] 不要なSVGコンポーネント（SimpleSnowflake等）の削除

## フェーズ3: 動作確認
- [ ] クリスマスモードでの描画パフォーマンス確認
- [ ] 雪の演出が視覚的に十分であることを確認
- [ ] 各種デバイス（モバイル含む）での動作確認

## 依存関係
- フェーズ1 → フェーズ2 → フェーズ3（順次実行）
