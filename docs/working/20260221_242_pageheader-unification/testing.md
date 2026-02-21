# テスト計画（v2 — FloatingNav）

## テスト戦略

### ユニットテスト

#### `components/ui/__tests__/FloatingNav.test.tsx`

**戻るボタン**
- [ ] backHref 指定時に Link が表示される
- [ ] backHref 指定時に正しいhrefが設定される
- [ ] backHref 未指定時に戻るボタンが表示されない
- [ ] 戻るボタンに aria-label="戻る" が設定されている
- [ ] 戻るボタンが IoArrowBack アイコンを含む

**右側アクション**
- [ ] right プロップの内容が表示される
- [ ] right が未指定の場合、右側コンテナが表示されない
- [ ] 複数の要素をright に渡した場合、すべて表示される

**レイアウト**
- [ ] 戻るボタンに fixed クラスが適用される
- [ ] 右アクションに fixed クラスが適用される
- [ ] z-50 クラスが適用される

**className**
- [ ] 追加の className が右アクションコンテナに適用される

**組み合わせ**
- [ ] backHref + right の両方が指定された場合、両方表示される
- [ ] backHref なし + right ありの場合、右側のみ表示される

### 既存テストの確認

各ページの既存テストが FloatingNav 導入後も通過することを確認:
- `app/assignment/` 関連テスト
- `app/coffee-trivia/` 関連テスト
- `app/tasting/` 関連テスト
- その他既存テスト

## カバレッジ目標

| 対象 | 目標 |
|------|------|
| `components/ui/FloatingNav.tsx` | 90%以上 |
| 全体カバレッジ | 75%以上を維持 |

## ビジュアルテスト

フェーズ5でPlaywright MCPを使用し、全対象ページのスクリーンショットを撮影:
- デフォルトテーマでの表示確認
- フローティングボタンがviewport端に表示されていること
- コンテンツがボタンと重なっていないこと
- モバイルビューポート（375px）での表示確認

## 回帰テスト

```bash
npm run lint && npm run build && npm run test:run
```

全テストが通過することを確認。
