# テスト導入実装計画

## 現状（2026-02-05時点）

✅ **セットアップ完了**
- Vitest + @testing-library/react + jsdom
- 5つのテストファイル、62個のテスト
- 全テスト合格

✅ **サンプルテスト作成済み**
- `lib/dateUtils.test.ts` - ユーティリティ関数（5テスト）
- `lib/roastScheduleColors.test.ts` - ビジネスロジック（16テスト）
- `lib/coffee-quiz/gamification.test.ts` - ゲーミフィケーション（14テスト）
- `hooks/useChristmasMode.test.ts` - カスタムフック（6テスト）
- `components/ui/Button.test.tsx` - UIコンポーネント（21テスト）

❌ **未完了**
- カバレッジツール（@vitest/coverage-v8）未インストール
- 残り235+ファイルが未テスト
- CI/CD統合未実施

---

## フェーズ1: クリティカルロジックの保護（優先度: 高）

**目標:** ビジネスロジックのバグを早期発見できる体制を構築

### 1.1 カバレッジツールのセットアップ（即実施）

```bash
npm install -D @vitest/coverage-v8
```

### 1.2 lib/ のテスト作成（優先度順）

| ファイル | 優先度 | 理由 |
|---------|--------|------|
| `lib/roastTimerSettings.ts` | 🔴 高 | タイマー設定の計算ロジック |
| `lib/clockSettings.ts` | 🔴 高 | 時計設定の管理 |
| `lib/beanConfig.ts` | 🔴 高 | 豆設定の検証 |
| `lib/firestoreUtils.ts` | 🔴 高 | Firestore操作のヘルパー |
| `lib/localStorage.ts` | 🟡 中 | ローカルストレージ管理 |
| `lib/notifications.ts` | 🟡 中 | 通知ロジック |
| `lib/consent.ts` | 🟡 中 | 同意管理 |
| `lib/emailjs.ts` | 🟢 低 | メール送信（外部依存） |

### 1.3 TDDの導入（即実施）

**新規開発ルール:**
- 新しい関数・コンポーネントは**必ずテストを先に書く**
- Red → Green → Refactor サイクルを徹底
- コミット前にテストが通ることを確認

**実施タイミング:** 次回の機能追加・バグ修正から

### 1.4 成果指標

- [ ] カバレッジツールの導入完了
- [ ] lib/ のカバレッジ 50%以上
- [ ] 新規開発のTDD適用率 100%

**想定期間:** 2週間

---

## フェーズ2: ユーザー体験の保護（優先度: 中）

**目標:** UIコンポーネントとカスタムフックの動作を保証

### 2.1 hooks/ のテスト作成（優先度順）

| ファイル | 優先度 | 理由 |
|---------|--------|------|
| `hooks/useQuizSession.ts` | 🔴 高 | クイズセッション管理 |
| `hooks/useQuizData.ts` | 🔴 高 | クイズデータ取得 |
| `hooks/useRoastTimer.ts` | 🔴 高 | タイマー管理 |
| `hooks/useAppData.ts` | 🔴 高 | アプリデータ管理 |
| `hooks/useCameraCapture.ts` | 🟡 中 | カメラ機能 |
| `hooks/useDefectBeans.ts` | 🟡 中 | 欠点豆管理 |
| `hooks/useNotifications.ts` | 🟡 中 | 通知管理 |

### 2.2 components/ui/ のテスト作成（優先度順）

| ファイル | 優先度 | 理由 |
|---------|--------|------|
| `components/ui/Input.tsx` | 🔴 高 | フォーム入力の基本 |
| `components/ui/Card.tsx` | 🔴 高 | レイアウトの基本 |
| `components/ui/Modal.tsx` | 🔴 高 | モーダルダイアログ |
| `components/ui/Select.tsx` | 🟡 中 | セレクトボックス |
| `components/ui/Checkbox.tsx` | 🟡 中 | チェックボックス |
| `components/ui/Switch.tsx` | 🟡 中 | スイッチ |

### 2.3 Firebaseのモック戦略確立

```typescript
// lib/__mocks__/firebase.ts
export const db = {
  collection: vi.fn(),
  doc: vi.fn(),
};

export const auth = {
  currentUser: { uid: 'test-user-id', email: 'test@example.com' },
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
};
```

### 2.4 成果指標

- [ ] hooks/ のカバレッジ 60%以上
- [ ] components/ui/ のカバレッジ 60%以上
- [ ] Firebaseモックの標準化完了

**想定期間:** 3週間

---

## フェーズ3: 統合テストとE2E（優先度: 低〜中）

**目標:** ページ全体の動作とユーザーフローを保証

### 3.1 主要ページのレンダリングテスト

| ページ | 優先度 | テスト内容 |
|-------|--------|----------|
| `/roast-timer` | 🔴 高 | タイマー起動・停止・記録 |
| `/coffee-trivia` | 🔴 高 | クイズ開始・回答・結果表示 |
| `/roast-record` | 🟡 中 | 記録一覧・フィルター・詳細 |
| `/schedule` | 🟡 中 | スケジュール表示・編集 |
| `/login` | 🟡 中 | ログイン・ログアウト |

### 3.2 Chrome DevTools MCPでのE2Eテスト

**対象ユーザーフロー:**
1. ログイン → タイマー起動 → 記録保存
2. クイズ開始 → 回答 → XP獲得確認
3. スケジュール登録 → 編集 → 削除

**実施方法:**
- Chrome DevTools MCPでブラウザ操作
- スクリーンショット取得で視覚的確認
- 主要なユーザーフローのみ（全ページは対象外）

### 3.3 成果指標

- [ ] 主要5ページのレンダリングテスト完了
- [ ] 3つのユーザーフローのE2Eテスト完了

**想定期間:** 2週間

---

## フェーズ4: CI/CD統合とメンテナンス

**目標:** 継続的なテスト実行とカバレッジ維持

### 4.1 GitHub Actionsの設定

```yaml
# .github/workflows/test.yml
name: Test
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```

### 4.2 pre-commitフックへの統合

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run"  // 変更されたファイルのテストのみ実行
    ]
  }
}
```

### 4.3 カバレッジバッジの追加

README.mdにカバレッジバッジを追加して、可視化します。

### 4.4 成果指標

- [ ] CI/CDでの自動テスト実行
- [ ] pre-commitフックでのテスト実行
- [ ] カバレッジレポートの自動生成

**想定期間:** 1週間

---

## 全体スケジュール

| フェーズ | 期間 | 完了条件 |
|---------|------|----------|
| フェーズ1 | 2週間 | lib/ カバレッジ 50%以上、TDD導入 |
| フェーズ2 | 3週間 | hooks/ + components/ui/ カバレッジ 60%以上 |
| フェーズ3 | 2週間 | 主要5ページのテスト完了 |
| フェーズ4 | 1週間 | CI/CD統合完了 |
| **合計** | **8週間** | **全体カバレッジ 60%以上** |

---

## 今すぐできること（アクションプラン）

### 1. カバレッジツールのインストール

```bash
npm install -D @vitest/coverage-v8
npm run test:coverage
```

### 2. 最初のテスト対象を選ぶ

以下のいずれかから始めることをおすすめします:

**Option A: ビジネスクリティカルなロジック**
- `lib/roastTimerSettings.ts`
- `lib/clockSettings.ts`

**Option B: 使用頻度の高いフック**
- `hooks/useQuizSession.ts`
- `hooks/useRoastTimer.ts`

**Option C: 共通UIコンポーネント**
- `components/ui/Input.tsx`
- `components/ui/Card.tsx`

### 3. TDDで新機能を追加

次回の機能追加・バグ修正から、TDDワークフローを適用:

1. **Red**: テストを先に書く
2. **Green**: 最小限の実装でテストを通す
3. **Refactor**: コードを改善（テストは維持）
4. **Commit**: テストと実装を一緒にコミット

---

## よくある質問

### Q1: 既存コードのテストはいつ書くべき?

**A:** 優先度に従って段階的に進めます。以下の順序で:

1. バグ修正時に、そのファイルのテストを追加
2. 機能追加時に、関連するファイルのテストを追加
3. リファクタリング時に、対象ファイルのテストを追加
4. 余裕があれば、フェーズ1・2の優先度リストに従って追加

### Q2: 100%カバレッジを目指すべき?

**A:** いいえ。以下の理由から60-80%が現実的:

- 表示系コンポーネントは低優先度
- Firebase連携部分はモックが複雑
- 型定義ファイルはテスト不要
- ROI（投資対効果）を考慮

### Q3: E2Eテストは必須?

**A:** 主要フローのみ実施を推奨。以下の理由から:

- ユニット・統合テストで大半をカバー可能
- E2Eは実行時間が長く、メンテナンスコストが高い
- クリティカルなユーザーフロー（3-5個）に絞る

### Q4: テストが遅い場合は?

**A:** 以下の最適化を検討:

- `vitest --watch` でファイル変更時のみ実行
- `vitest related` で関連テストのみ実行
- `vitest --threads=false` で並列実行を無効化（デバッグ時）

---

## 次のステップ

1. **カバレッジツールのインストール**（5分）
2. **最初のテスト対象を選択**（10分）
3. **TDDで最初のテストを書く**（30分）
4. **テストガイドラインを読む**（15分）

**推奨:** 今日中にステップ1-2を完了し、明日からTDDを実践開始!
