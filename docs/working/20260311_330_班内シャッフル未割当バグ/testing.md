# テスト計画

## テスト戦略

### ユニットテスト（Vitest）
- `app/assignment/lib/shuffle.test.ts`（既存ファイルに追加）

## テストケース一覧

### バグ再現テスト（Red → Green）

| テストケース | 入力 | 期待出力 |
|-------------|------|---------|
| 全メンバー配置（2班×2タスク） | 班A: m1,m2, 班B: m3,m4, タスク2つ | 全4メンバーが result に含まれる |
| 全メンバー配置（3班×2タスク） | 班A: m1,m2, 班B: m3,m4, 班C: m5,m6, タスク2つ | 全6メンバーが result に含まれる |
| タスク除外あり・メンバー消失なし | m1がtask1除外, 残り3人でtask1を埋める | m1はtask2に配置、空スロットなし |
| ペア除外あり・メンバー消失なし | m1-m2ペア除外, 班A同士 | 全4メンバーが配置される |
| 班間人数差（3人 vs 1人） | 班A: m1,m2,m3, 班B: m4, タスク3つ | 全4メンバーが配置、班Bスロットは1つのみ埋まる |
| 履歴制約厳格時のフォールバック | 全組み合わせが行・ペア連続, minimal制約で解決 | 全メンバーが配置される |

### リグレッションテスト

| テストケース | 入力 | 期待出力 |
|-------------|------|---------|
| 班またぎ時に影響なし | crossTeamShuffle=true, 2班構成 | 従来通り班をまたいだ配置が可能 |
| 既存: 班内制約で班一致 | crossTeamShuffle=false, 2班構成 | メンバーは自分の班のスロットに配置 |
| 既存: ペア除外+班内制約 | ペア除外設定あり, crossTeamShuffle=false | ペア除外が尊重され、かつ班一致 |

### テスト実装の方針

**全メンバー配置の検証パターン**（各テストで使用）:
```typescript
// 全アクティブメンバーが結果に含まれることを検証
const assignedMemberIds = new Set(result.filter(a => a.memberId).map(a => a.memberId));
const activeMemberIds = new Set(members.filter(m => m.active !== false).map(m => m.id));
expect(assignedMemberIds).toEqual(activeMemberIds);
```

**ランダム性対策**: 各テストを20-50回ループして全試行でパスすることを確認（既存テストと同様のパターン）

## カバレッジ目標
- lib/: 90%以上（維持）
- shuffle.ts: 既存カバレッジ以上
