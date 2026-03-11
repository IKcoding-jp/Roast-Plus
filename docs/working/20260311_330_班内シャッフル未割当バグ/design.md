# 設計書

## 実装方針

### 変更対象ファイル
- `app/assignment/lib/shuffle.ts` — バックトラッキングの候補フィルタに班分布バリデーション追加

### テスト追加ファイル
- `app/assignment/lib/shuffle.test.ts` — バグ再現テスト + リグレッションテスト

## 根本原因の詳細

### 現在のコード（バグあり）

**バックトラッキング（L292-296）:**
```typescript
const available = eligibleMembers
    .filter(m => !assigned.has(m.id))
    .filter(m => !m.excludedTaskLabelIds.includes(row.taskLabelId))
    .filter(m => crossTeamShuffle || rowTeamIds.has(m.teamId))  // ← 粗い
    .map(m => m.id);

const fillCount = Math.min(neededCount, available.length);
```

**最終配置（L353-368）:**
```typescript
const remaining = [...memberIds];
for (let i = 0; i < row.slots.length; i++) {
    const slotTeamId = row.slots[i].teamId;
    const matchIdx = remaining.findIndex(id => {
        const member = eligibleMembers.find(m => m.id === id);
        return member?.teamId === slotTeamId;  // ← 厳密
    });
    finalAssignments.push({
        memberId: matchIdx >= 0 ? remaining.splice(matchIdx, 1)[0] : null,
        // ↑ マッチしないと null → メンバーが消失
    });
}
```

### 修正方針

バックトラッキング内で、組み合わせが正しい班分布を持つかを検証するフィルタを追加する。

**修正箇所（L276-329の backtrack 関数内）:**

1. **班別スロット数の事前計算**（行ごと）:
```typescript
const teamSlotCounts = new Map<string, number>();
row.slots.forEach(s => {
    teamSlotCounts.set(s.teamId, (teamSlotCounts.get(s.teamId) ?? 0) + 1);
});
```

2. **班分布バリデーション関数**:
```typescript
const isTeamDistributionValid = (combo: string[]): boolean => {
    if (crossTeamShuffle) return true; // 班またぎモードでは不要
    const dist = new Map<string, number>();
    for (const id of combo) {
        const member = eligibleMembers.find(m => m.id === id);
        if (member) {
            dist.set(member.teamId, (dist.get(member.teamId) ?? 0) + 1);
        }
    }
    for (const [teamId, needed] of teamSlotCounts) {
        if ((dist.get(teamId) ?? 0) < needed) return false;
    }
    return true;
};
```

3. **組み合わせフィルタに追加**（L311-316）:
```typescript
const validCombos = combos
    .filter(c => !hasAnyPairExclusion(c))
    .filter(c => isTeamDistributionValid(c))          // ← 追加
    .filter(c => c.every(id => !hasRowConflict(id, row.taskLabelId, level)))
    .filter(c => !hasPairConflict(c, level))
    .map(c => ({ combo: c, score: calcSoftScore(c, row.taskLabelId) }))
    .sort((a, b) => a.score - b.score);
```

4. **fillCount の改善**: 班別に利用可能なメンバー数を計算し、各班のスロット数を満たせる最大値を使用:
```typescript
// 班ごとの利用可能メンバー数
const availablePerTeam = new Map<string, number>();
for (const m of eligibleMembers) {
    if (!assigned.has(m.id) && !m.excludedTaskLabelIds.includes(row.taskLabelId)) {
        if (crossTeamShuffle || rowTeamIds.has(m.teamId)) {
            availablePerTeam.set(m.teamId, (availablePerTeam.get(m.teamId) ?? 0) + 1);
        }
    }
}

// 各班が満たせるスロット数の合計
let maxFillable = 0;
for (const [teamId, needed] of teamSlotCounts) {
    maxFillable += Math.min(needed, availablePerTeam.get(teamId) ?? 0);
}
const fillCount = Math.min(neededCount, maxFillable);
```

## 影響範囲

- `calculateAssignment()` 関数のバックトラッキング内部のみ変更
- 最終配置ロジック（L346-397）は変更不要（バックトラッキングが正しい班分布を保証するため）
- `crossTeamShuffle=true` の場合はバリデーションスキップ（影響なし）

## ADR

### Decision-001: バックトラッキング側で班分布を保証する
- **理由**: 最終配置側でのフォールバック（班不一致メンバーを空スロットに強制配置）は班配置ルールを崩すため、根本原因であるバックトラッキング側で修正するのが正しい
- **影響**: 組み合わせフィルタが1つ増えるが、8人規模では探索空間が極小のためパフォーマンス影響なし

### Decision-002: fillCount計算を班別に改善する
- **理由**: 現在の `Math.min(neededCount, available.length)` は全班合計でカウントしているため、特定班のメンバー不足を検知できない
- **影響**: より正確なスロット充足数を計算でき、無駄な組み合わせ探索を削減
