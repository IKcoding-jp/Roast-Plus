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
                // ペアキーはソートして正規化
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
 * 新しいシャッフルアルゴリズム
 * - 行（タスク）単位で処理し、各行に複数のメンバーを同時に割り当てる
 * - 行の連続回避とペアの連続回避を確実にチェック
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
    const teamsCount = teams.length;

    // 2. 固定枠（memberId === null）の特定
    const lockedSlots = new Map<string, boolean>(); // "teamId-taskLabelId" -> true
    currentAssignments?.forEach(asg => {
        if (asg.memberId === null) {
            lockedSlots.set(`${asg.teamId}-${asg.taskLabelId}`, true);
        }
    });

    // 3. 履歴データの構築
    // 現在の状態を「0回前」として扱う
    const currentRowHistory = buildRowHistory(currentAssignments);
    const currentPairHistory = buildPairHistory(currentAssignments);
    const oneAgoRowHistory = buildRowHistory(history[0]);
    const oneAgoPairHistory = buildPairHistory(history[0]);
    const twoAgoRowHistory = buildRowHistory(history[1]);
    const twoAgoPairHistory = buildPairHistory(history[1]);

    // 4. 行（タスク）ごとにスロット数を計算
    type RowInfo = {
        taskLabelId: string;
        slots: { teamId: string }[];
        lockedSlotCount: number;
    };

    const rows: RowInfo[] = taskLabels.map(task => {
        const slots: { teamId: string }[] = [];
        let lockedSlotCount = 0;
        teams.forEach(team => {
            if (lockedSlots.has(`${team.id}-${task.id}`)) {
                lockedSlotCount++;
            } else {
                slots.push({ teamId: team.id });
            }
        });
        return { taskLabelId: task.id, slots, lockedSlotCount };
    });

    // 5. 最適な割り当てを探索（複数回試行）
    let bestAssignments: Assignment[] = [];
    let bestScore = Infinity;
    const MAX_RETRIES = 500;

    for (let retry = 0; retry < MAX_RETRIES; retry++) {
        const assignedMemberIds = new Set<string>();
        const loopAssignments: Assignment[] = [];
        let loopScore = 0;

        // 固定枠（null）を先に追加
        currentAssignments?.forEach(asg => {
            if (asg.memberId === null) {
                loopAssignments.push({
                    teamId: asg.teamId,
                    taskLabelId: asg.taskLabelId,
                    memberId: null,
                    assignedDate: targetDate
                });
            }
        });

        // 行をシャッフル（候補者が少ない行を優先）
        const shuffledRows = [...rows].sort((a, b) => {
            const aCandidates = eligibleMembers.filter(m =>
                !m.excludedTaskLabelIds.includes(a.taskLabelId)
            ).length;
            const bCandidates = eligibleMembers.filter(m =>
                !m.excludedTaskLabelIds.includes(b.taskLabelId)
            ).length;
            if (aCandidates !== bCandidates) {
                return aCandidates - bCandidates;
            }
            return Math.random() - 0.5;
        });

        // 各行を処理
        for (const row of shuffledRows) {
            const neededCount = row.slots.length;
            if (neededCount === 0) continue;

            // この行に割り当て可能な候補者を取得
            const candidates = eligibleMembers.filter(m => {
                if (assignedMemberIds.has(m.id)) return false;
                if (m.excludedTaskLabelIds.includes(row.taskLabelId)) return false;
                return true;
            });

            // 各候補者のスコアを計算
            type CandidateScore = { memberId: string; score: number };
            const scoredCandidates: CandidateScore[] = candidates.map(member => {
                let score = 0;

                // 行の連続ペナルティ
                if (currentRowHistory.get(row.taskLabelId)?.has(member.id)) {
                    score += 100000; // 現在と同じ行 → 最大ペナルティ
                }
                if (oneAgoRowHistory.get(row.taskLabelId)?.has(member.id)) {
                    score += 50000; // 1回前と同じ行
                }
                if (twoAgoRowHistory.get(row.taskLabelId)?.has(member.id)) {
                    score += 20000; // 2回前と同じ行
                }

                // ランダム要素
                score += Math.random();

                return { memberId: member.id, score };
            });

            // スコア順にソート
            scoredCandidates.sort((a, b) => a.score - b.score);

            // neededCount人を選択（ペア回避も考慮）
            const selectedMembers: string[] = [];

            for (const candidate of scoredCandidates) {
                if (selectedMembers.length >= neededCount) break;

                // ペア回避チェック（既に選択されたメンバーとの組み合わせ）
                let pairPenalty = 0;
                let hasExcludedPair = false;

                for (const selectedId of selectedMembers) {
                    // ペア除外設定チェック
                    if (isPairExcluded(candidate.memberId, selectedId, pairExclusions)) {
                        hasExcludedPair = true;
                        break;
                    }

                    const pairKey = makePairKey(candidate.memberId, selectedId);

                    // ペアの連続ペナルティ
                    if (currentPairHistory.has(pairKey)) {
                        pairPenalty += 80000; // 現在と同じペア
                    }
                    if (oneAgoPairHistory.has(pairKey)) {
                        pairPenalty += 40000; // 1回前と同じペア
                    }
                    if (twoAgoPairHistory.has(pairKey)) {
                        pairPenalty += 15000; // 2回前と同じペア
                    }
                }

                // ペア除外設定に該当する場合はスキップ（他のメンバーを探す）
                if (hasExcludedPair) continue;

                // ペナルティが高すぎる場合もスキップ（他のメンバーを探す）
                // ただし候補が足りない場合は許容
                const totalScore = candidate.score + pairPenalty;
                if (totalScore >= 50000 && selectedMembers.length < neededCount - 1) {
                    // 後続の候補が残っている可能性があるのでスキップ
                    // ただし最後の1人は選ぶ必要があるので条件に注意
                    continue;
                }

                selectedMembers.push(candidate.memberId);
                loopScore += totalScore;
            }

            // 選択されたメンバーをスロットに割り当て
            for (let i = 0; i < row.slots.length; i++) {
                const memberId = selectedMembers[i] ?? null;
                loopAssignments.push({
                    teamId: row.slots[i].teamId,
                    taskLabelId: row.taskLabelId,
                    memberId,
                    assignedDate: targetDate
                });
                if (memberId) {
                    assignedMemberIds.add(memberId);
                }
                if (memberId === null) {
                    loopScore += 500000; // 割り当て失敗ペナルティ
                }
            }
        }

        // 最良結果を更新
        if (loopScore < bestScore) {
            bestScore = loopScore;
            bestAssignments = loopAssignments;
        }

        // 完璧な結果（低ペナルティ）なら即終了
        if (loopScore < eligibleMembers.length * 10) {
            break;
        }
    }

    // 6. 重複チェック（安全装置）
    const uniqueCheck = new Set<string>();
    const validatedAssignments: Assignment[] = [];

    for (const asg of bestAssignments) {
        if (asg.memberId) {
            if (uniqueCheck.has(asg.memberId)) {
                validatedAssignments.push({ ...asg, memberId: null });
            } else {
                uniqueCheck.add(asg.memberId);
                validatedAssignments.push(asg);
            }
        } else {
            validatedAssignments.push(asg);
        }
    }

    return validatedAssignments;
};
