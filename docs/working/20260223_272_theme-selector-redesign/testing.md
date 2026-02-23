# テスト計画: テーマセレクターのビジュアルリデザイン

**Issue**: #272

---

## テスト方針

- `lib/theme.ts` の新フィールドは単体テストで検証
- `ThemeSelector.tsx` はレンダリング + インタラクションテスト
- アニメーション自体のテストは不要（Framer Motionの動作はライブラリ側責任）
- ビジュアル確認は Playwright MCP でスクリーンショット

---

## lib/theme.test.ts の追加テスト

```typescript
describe('ThemePreset フィールド拡張', () => {
  it('全テーマに fontStyle が定義されている', () => {
    THEME_PRESETS.forEach((preset) => {
      expect(preset.fontStyle).toBeDefined();
      expect(typeof preset.fontStyle).toBe('string');
    });
  });

  it('全テーマに animationType が定義されている', () => {
    const validTypes = ['steam', 'flame', 'particles', 'leaf', 'glow', 'snow', 'stars'];
    THEME_PRESETS.forEach((preset) => {
      expect(validTypes).toContain(preset.animationType);
    });
  });

  it('fontStyle が有効な Tailwind クラスを含む', () => {
    THEME_PRESETS.forEach((preset) => {
      expect(preset.fontStyle).toMatch(/font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/);
      expect(preset.fontStyle).toMatch(/tracking-(tighter|tight|normal|wide|wider|widest)/);
    });
  });
});
```

---

## ThemeSelector.test.tsx の更新テスト

### レンダリングテスト

```typescript
describe('ThemePreviewCard', () => {
  it('テーマ名が表示される', () => {
    // 各テーマカードにtheme.nameが表示されていること
  });

  it('LIGHT/DARK バッジが正しく表示される', () => {
    // light テーマは 'LIGHT'、dark テーマは 'DARK' が表示
  });

  it('説明文が表示される', () => {
    // theme.description が表示されていること
  });

  it('3色スウォッチが表示される', () => {
    // 3つの色ドットが存在すること
  });
});
```

### 選択状態テスト

```typescript
describe('テーマ選択', () => {
  it('選択されたテーマにチェックアイコンが表示される', () => {
    // isSelected=true の時、チェックアイコンが表示される
  });

  it('カードクリックで onSelect が呼ばれる', () => {
    // ボタンクリックで setTheme が呼ばれる
  });

  it('aria-pressed 属性が正しく設定される', () => {
    // 選択時: aria-pressed="true"、非選択時: aria-pressed="false"
  });
});
```

---

## カバレッジ目標

| ファイル | 目標 |
|---------|------|
| `lib/theme.ts` | 95%以上 |
| `components/settings/ThemeSelector.tsx` | 80%以上 |

---

## ビジュアル確認手順（Playwright MCP）

1. `npm run dev` でローカル開発サーバーを起動
2. Playwright MCP でテーマ設定画面（`/settings/theme`）を開く
3. スクリーンショットで以下を確認:
   - [ ] 7テーマすべてのカードが表示されている
   - [ ] 各カードがテーマ色で塗られている
   - [ ] テーマ名が大きく表示されている
   - [ ] アイコンが表示されている
   - [ ] アニメーションが動いている（数秒待って再スクリーンショット）
   - [ ] 選択状態のボーダーが表示されている
4. 必要に応じてデザイン調整後、再確認

---

## 検証コマンド

```bash
npm run lint && npm run build && npm run test:run
```
