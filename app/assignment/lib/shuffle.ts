import { Team, Member, TaskLabel, Assignment, PairExclusion } from '@/types';

/**
 * ペア除外設定に該当するかチェック
 */
const isPairExcluded = (
    memberId1: string,
    memberId2: string,
    pairExclusions?: PairExclusion[]
): boolean => {
    if (!pairExclusions || pairExclusions.length === 0) return false;
    return pairExclusions.some(exclusion =>
        (exclusion.memberId1 === memberId1 && exclusion.memberId2 === memberId2) ||
        (exclusion.memberId1 === memberId2 && exclusion.memberId2 === memberId1)
    );
};

/**
 * 履歴から行（タスク）ごとのメンバーIDセットを取得
 */
const buildRowHistory = (
    assignments: Assignment[] | undefined
): Map<string, Set<string>> => {
    const rowHistory = new Map<string, Set<string>>();
    if (!assignments) return rowHistory;

    assignments.forEach(a => {
        if (a.memberId && a.taskLabelId) {
            if (!rowHistory.has(a.taskLabelId)) {
                rowHistory.set(a.taskLabelId, new Set());
            }
            rowHistory.get(a.taskLabelId)!.add(a.memberId);
        }
    });
    return rowHistory;
};

/**
 * 履歴からペア履歴を構築（同じ行にいたメンバーのペア）
 */
const buildPairHistory = (
    assignments: Assignment[] | undefined
): Set<string> => {
    const pairHistory = new Set<string>();
    if (!assignments) return pairHistory;

    // タスクラベルごとにメンバーをグループ化
    const taskGroups = new Map<string, string[]>();
    assignments.forEach(a => {
        if (a.memberId && a.taskLabelId) {
            if (!taskGroups.has(a.taskLabelId)) {
                taskGroups.set(a.taskLabelId, []);
            }
            taskGroups.get(a.taskLabelId)!.push(a.memberId);
        }
    });

    // 同じタスクにいたメンバー同士をペアとして登録
    taskGroups.forEach(members => {
        for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) {
                const pairKey = [members[i], members[j]].sort().join('__');
                pairHistory.add(pairKey);
            }
        }
    });

    return pairHistory;
};

/**
 * ペアキーを生成（ID順にソート）
 */
const makePairKey = (id1: string, id2: string): string => {
    return [id1, id2].sort().join('__');
};

/**
 * Fisher-Yatesシャッフル（配列をランダムに並べ替え）
 */
const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * 配列からk個を選ぶ全組み合わせを生成
 */
const getCombinations = (arr: string[], k: number): string[][] => {
    if (k === 0) return [[]];
    if (arr.length < k) return [];
    const result: string[][] = [];
    for (let i = 0; i <= arr.length - k; i++) {
        const rest = getCombinations(arr.slice(i + 1), k - 1);
        for (const combo of rest) {
            result.push([arr[i], ...combo]);
        }
    }
    return result;
};

/**
 * 制約の厳しさレベル（段階的に緩和）
 *
 * ペア回避を行回避より優先し、行を先に緩和する。
 * これにより「毎回違うペア」を最優先で保証する。
 *
 * - strict:        行(現在+1回前) + ペア(現在+1回前)
 * - pair_strict:   行(現在のみ)   + ペア(現在+1回前)
 * - pair_hard:     行(ソフト)     + ペア(現在+1回前)
 * - balanced:      行(現在のみ)   + ペア(現在のみ)
 * - pair_only:     行(ソフト)     + ペア(現在のみ)
 * - minimal:       ペア除外設定のみ（緊急フォールバック）
 */
type ConstraintLevel = 'strict' | 'pair_strict' | 'pair_hard' | 'balanced' | 'pair_only' | 'minimal';

type RowInfo = {
    taskLabelId: string;
    slots: { teamId: string }[];
};

/**
 * 制約充足型シャッフルアルゴリズム
 *
 * バックトラッキングで行・ペアの連続を確実に回避する解を生成する。
 * 制約レベルを段階的に緩和（strict → relaxed → minimal）することで
 * 解が必ず見つかることを保証する。
 *
 * 8人規模では探索空間が非常に小さく（最大数千パス）、
 * 枝刈りにより実際の探索は数十ステップで完了する。
 */
export const calculateAssignment = (
    teams: Team[],
    taskLabels: TaskLabel[],
    members: Member[],
    history: Assignment[][], // history[0] = 1回前、history[1] = 2回前
    targetDate: string,
    currentAssignments?: Assignment[],
    pairExclusions?: PairExclusion[]
): Assignment[] => {
    // 1. 対象メンバーの抽出（アクティブなメンバーのみ）
    const eligibleMembers = members.filter(m => m.active !== false);

    // 2. 固定枠（memberId === null）の特定
    const lockedSlots = new Map<string, boolean>();
    currentAssignments?.forEach(asg => {
        if (asg.memberId === null) {
            lockedSlots.set(`${asg.teamId}-${asg.taskLabelId}`, true);
        }
    });

    // 3. 履歴データの構築
    const currentRowHistory = buildRowHistory(currentAssignments);
    const currentPairHistory = buildPairHistory(currentAssignments);
    const oneAgoRowHistory = buildRowHistory(history[0]);
    const oneAgoPairHistory = buildPairHistory(history[0]);
    const twoAgoRowHistory = buildRowHistory(history[1]);
    const twoAgoPairHistory = buildPairHistory(history[1]);

    // 4. 行情報の構築
    const rows: RowInfo[] = taskLabels.map(task => {
        const slots: { teamId: string }[] = [];
        teams.forEach(team => {
            if (!lockedSlots.has(`${team.id}-${task.id}`)) {
                slots.push({ teamId: team.id });
            }
        });
        return { taskLabelId: task.id, slots };
    });

    // 固定枠のAssignment
    const lockedAssignments: Assignment[] = [];
    currentAssignments?.forEach(asg => {
        if (asg.memberId === null) {
            lockedAssignments.push({
                teamId: asg.teamId,
                taskLabelId: asg.taskLabelId,
                memberId: null,
                assignedDate: targetDate
            });
        }
    });

    // 制約の厳しい行を先に処理（MRVヒューリスティック）
    const sortedRows = rows
        .filter(row => row.slots.length > 0)
        .sort((a, b) => {
            const aCount = eligibleMembers.filter(m =>
                !m.excludedTaskLabelIds.includes(a.taskLabelId)
            ).length;
            const bCount = eligibleMembers.filter(m =>
                !m.excludedTaskLabelIds.includes(b.taskLabelId)
            ).length;
            return aCount - bCount;
        });

    // エッジケース: 行やメンバーがない場合
    if (sortedRows.length === 0 || eligibleMembers.length === 0) {
        return lockedAssignments;
    }

    // 5. 制約チェック関数群

    /** 行の連続チェック（ハード制約） */
    const hasRowConflict = (
        memberId: string, taskLabelId: string, level: ConstraintLevel
    ): boolean => {
        // pair_hard, pair_only, minimal では行をソフト制約に降格
        if (level === 'pair_hard' || level === 'pair_only' || level === 'minimal') return false;
        // 現在の行回避: strict, pair_strict, balanced でハード制約
        if (currentRowHistory.get(taskLabelId)?.has(memberId)) return true;
        // 1回前の行回避: strict のみハード制約
        if (level === 'strict') {
            if (oneAgoRowHistory.get(taskLabelId)?.has(memberId)) return true;
        }
        return false;
    };

    /** ペアの連続チェック（ハード制約） */
    const hasPairConflict = (group: string[], level: ConstraintLevel): boolean => {
        // minimal のみペアをソフト制約に降格
        if (level === 'minimal') return false;
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                const pairKey = makePairKey(group[i], group[j]);
                // 現在のペア回避: minimal以外で常にハード制約
                if (currentPairHistory.has(pairKey)) return true;
                // 1回前のペア回避: strict, pair_strict, pair_hard でハード制約
                if (level === 'strict' || level === 'pair_strict' || level === 'pair_hard') {
                    if (oneAgoPairHistory.has(pairKey)) return true;
                }
            }
        }
        return false;
    };

    /** ペア除外設定チェック（全レベルで強制） */
    const hasAnyPairExclusion = (group: string[]): boolean => {
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                if (isPairExcluded(group[i], group[j], pairExclusions)) return true;
            }
        }
        return false;
    };

    /** ソフトスコア（低いほど良い。ハード制約では対象外の履歴も考慮） */
    const calcSoftScore = (group: string[], taskLabelId: string): number => {
        let score = 0;
        for (const memberId of group) {
            if (currentRowHistory.get(taskLabelId)?.has(memberId)) score += 200;
            if (oneAgoRowHistory.get(taskLabelId)?.has(memberId)) score += 100;
            if (twoAgoRowHistory.get(taskLabelId)?.has(memberId)) score += 50;
        }
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                const pairKey = makePairKey(group[i], group[j]);
                if (currentPairHistory.has(pairKey)) score += 200;
                if (oneAgoPairHistory.has(pairKey)) score += 100;
                if (twoAgoPairHistory.has(pairKey)) score += 50;
            }
        }
        // ランダムな微小値でタイブレイク（同スコア時のランダム性確保）
        score += Math.random() * 0.01;
        return score;
    };

    // 6. バックトラッキング探索
    const backtrack = (
        rowIdx: number,
        assigned: Set<string>,
        result: Map<string, string[]>,
        level: ConstraintLevel
    ): boolean => {
        if (rowIdx >= sortedRows.length) return true;

        const row = sortedRows[rowIdx];
        const neededCount = row.slots.length;

        // この行に割り当て可能な候補メンバー
        const available = eligibleMembers
            .filter(m => !assigned.has(m.id))
            .filter(m => !m.excludedTaskLabelIds.includes(row.taskLabelId))
            .map(m => m.id);

        const fillCount = Math.min(neededCount, available.length);
        if (fillCount === 0) {
            // 候補なし → 空スロットのまま次の行へ
            result.set(row.taskLabelId, []);
            if (backtrack(rowIdx + 1, assigned, result, level)) return true;
            result.delete(row.taskLabelId);
            return false;
        }

        // 全組み合わせ生成（入力をシャッフルしてランダム性を確保）
        const combos = getCombinations(shuffleArray(available), fillCount);

        // ハード制約フィルタ → ソフトスコアでソート
        const validCombos = combos
            .filter(c => !hasAnyPairExclusion(c))
            .filter(c => c.every(id => !hasRowConflict(id, row.taskLabelId, level)))
            .filter(c => !hasPairConflict(c, level))
            .map(c => ({ combo: c, score: calcSoftScore(c, row.taskLabelId) }))
            .sort((a, b) => a.score - b.score);

        for (const { combo } of validCombos) {
            combo.forEach(id => assigned.add(id));
            result.set(row.taskLabelId, combo);

            if (backtrack(rowIdx + 1, assigned, result, level)) return true;

            combo.forEach(id => assigned.delete(id));
            result.delete(row.taskLabelId);
        }

        return false;
    };

    // 7. 制約レベルを段階的に緩和して解を探す
    const levels: ConstraintLevel[] = ['strict', 'pair_strict', 'pair_hard', 'balanced', 'pair_only', 'minimal'];
    let solution: Map<string, string[]> | null = null;

    for (const level of levels) {
        const result = new Map<string, string[]>();
        if (backtrack(0, new Set(), result, level)) {
            solution = result;
            break;
        }
    }

    // 8. 解をAssignment[]に変換
    const finalAssignments: Assignment[] = [...lockedAssignments];

    if (solution) {
        for (const row of rows) {
            if (row.slots.length === 0) continue;
            const memberIds = solution.get(row.taskLabelId) ?? [];
            // チーム配置をランダム化（どのメンバーがどの班に入るかをシャッフル）
            const shuffledIds = shuffleArray(memberIds);
            for (let i = 0; i < row.slots.length; i++) {
                finalAssignments.push({
                    teamId: row.slots[i].teamId,
                    taskLabelId: row.taskLabelId,
                    memberId: shuffledIds[i] ?? null,
                    assignedDate: targetDate
                });
            }
        }
    } else {
        // フォールバック: 制約なしでランダム割り当て（極端なエッジケース用）
        const shuffledIds = shuffleArray(eligibleMembers.map(m => m.id));
        let idx = 0;
        for (const row of rows) {
            for (const slot of row.slots) {
                finalAssignments.push({
                    teamId: slot.teamId,
                    taskLabelId: row.taskLabelId,
                    memberId: shuffledIds[idx] ?? null,
                    assignedDate: targetDate
                });
                idx++;
            }
        }
    }

    return finalAssignments;
};
