import { Team, Member, TaskLabel, Assignment, PairExclusion } from '@/types';

type Score = {
    memberId: string;
    score: number;
};

// ペア除外設定に該当するかチェックするヘルパー関数
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

export const calculateAssignment = (
    teams: Team[],
    taskLabels: TaskLabel[],
    members: Member[],
    history: Assignment[][], // シャッフル履歴の配列（history[0] = 1回前、history[1] = 2回前）
    targetDate: string,
    currentAssignments?: Assignment[], // 現在の割り当て（固定チェック用）
    pairExclusions?: PairExclusion[] // ペア除外設定
): Assignment[] => {
    // 1. 対象メンバーの抽出 (アクティブなメンバー)
    const eligibleMembers = members.filter(m => m.active !== false);

    // 2. 割り当て枠の作成
    // memberId === null（未割り当て）の枠は固定する
    // シャッフル対象は班を跨いで再配置する（teamIdは固定しない）

    const slots: { teamId: string; taskLabelId: string }[] = [];
    const lockedSlots = new Set<string>(); // "teamId-taskLabelId"
    const assignments: Assignment[] = [];
    const currentAssignmentMap = new Map<string, Assignment>();

    currentAssignments?.forEach(asg => {
        currentAssignmentMap.set(`${asg.teamId}-${asg.taskLabelId}`, asg);
    });

    teams.forEach(team => {
        taskLabels.forEach(task => {
            const current = currentAssignmentMap.get(`${team.id}-${task.id}`);

            if (current && current.memberId === null) {
                // 未割り当ての場合は固定（結果にそのまま含める）
                assignments.push({
                    teamId: team.id,
                    taskLabelId: task.id,
                    memberId: null,
                    assignedDate: targetDate
                });
                lockedSlots.add(`${team.id}-${task.id}`);
            } else {
                // 割り当て済み（またはデータなし）のスロットをシャッフル対象にする
                // ここにいたメンバーはプールに戻され、再配置される
                slots.push({ teamId: team.id, taskLabelId: task.id });
            }
        });
    });

    // 3. 履歴データの整備
    // recentCounts は「最近よく担当しているメンバーへの軽いハンデ」にのみ使用する。
    const recentCounts: Record<string, number> = {};
    eligibleMembers.forEach(m => recentCounts[m.id] = 0);

    // currentAssignments（今日の確定分・null除外）と history（過去分のみ）をソースに集約
    const forCountSources: Assignment[][] = [];

    if (currentAssignments && currentAssignments.length > 0) {
        const todayAssigned = currentAssignments.filter(a => a.memberId !== null);
        if (todayAssigned.length > 0) {
            forCountSources.push(todayAssigned);
        }
    }

    history.forEach(shuffleResult => {
        if (shuffleResult && shuffleResult.length > 0) {
            forCountSources.push(shuffleResult);
        }
    });

    // 上記ソースから担当回数をカウント
    forCountSources.forEach(shuffleResult => {
        shuffleResult.forEach(asg => {
            if (asg.memberId && recentCounts[asg.memberId] !== undefined) {
                recentCounts[asg.memberId]++;
            }
        });
    });

    // 同じ行（タスク）に過去に割り当てられたすべてのメンバーIDを取得
    // 連続で同じ行に割り当てられないようにするため、すべてのメンバーをチェックする必要がある
    const getHistoryAssignments = (shuffleAgo: number, taskLabelId: string): Set<string> => {
        // shuffleAgo: 1 = 1回前、2 = 2回前
        const shuffleResult = history[shuffleAgo - 1];
        if (!shuffleResult) return new Set();
        // 同じタスクラベルに割り当てられたすべてのメンバーIDを取得
        const memberIds = shuffleResult
            .filter(a => a.taskLabelId === taskLabelId && a.memberId !== null)
            .map(a => a.memberId!);
        return new Set(memberIds);
    };

    const pairHistory: Record<string, { shuffleAgo1: Set<string>, shuffleAgo2: Set<string> }> = {};
    eligibleMembers.forEach(m => {
        pairHistory[m.id] = { shuffleAgo1: new Set(), shuffleAgo2: new Set() };
    });

    [1, 2].forEach(shuffleAgo => {
        // shuffleAgo: 1 = 1回前、2 = 2回前
        const shuffleResult = history[shuffleAgo - 1];
        if (!shuffleResult) return;

        // タスクラベルごとにメンバーをグループ化
        const tasks: Record<string, string[]> = {};
        shuffleResult.forEach(a => {
            if (a.memberId && a.taskLabelId) {
                if (!tasks[a.taskLabelId]) tasks[a.taskLabelId] = [];
                tasks[a.taskLabelId].push(a.memberId);
            }
        });

        // 同じタスクラベルにいたメンバー同士をペアとして登録
        Object.values(tasks).forEach(membersInTask => {
            if (membersInTask.length < 2) return;
            for (let i = 0; i < membersInTask.length; i++) {
                for (let j = i + 1; j < membersInTask.length; j++) {
                    const m1 = membersInTask[i];
                    const m2 = membersInTask[j];

                    if (pairHistory[m1]) {
                        if (shuffleAgo === 1) pairHistory[m1].shuffleAgo1.add(m2);
                        else pairHistory[m1].shuffleAgo2.add(m2);
                    }
                    if (pairHistory[m2]) {
                        if (shuffleAgo === 1) pairHistory[m2].shuffleAgo1.add(m1);
                        else pairHistory[m2].shuffleAgo2.add(m1);
                    }
                }
            }
        });
    });

    // 4. 割り当て実行 (リトライロジック)
    // assignedMemberIds は上で初期化済み -> リトライごとにリセットする必要があるため、ループ内で定義する

    let bestAssignments: Assignment[] = [];
    let minTotalScore = Infinity;

    // 500回試行して、最もスコア（ペナルティ）が低い結果を採用する
    const MAX_RETRIES = 500;

    for (let i = 0; i < MAX_RETRIES; i++) {
        const currentLoopAssignments: Assignment[] = [];
        const currentLoopAssignedMemberIds = new Set<string>();
        let currentLoopTotalScore = 0;

        // 固定枠を最初に追加
        assignments.forEach(a => {
            currentLoopAssignments.push(a);
            // 固定枠は memberId: null なので assignedMemberIds への追加は不要
        });

        // スロットをシャッフル
        // 改善: 除外設定などにより「割り当て可能なメンバーが少ないスロット」を優先的に処理するため、
        // 候補者数を計算してソートする
        const slotsWithCount = slots.map(slot => {
            // このスロットに割り当て可能なメンバー数（除外設定なし）
            const count = eligibleMembers.filter(m =>
                !m.excludedTaskLabelIds.includes(slot.taskLabelId)
            ).length;
            return { ...slot, candidateCount: count };
        });

        // 候補者が少ない順（昇順）にソート。同じ場合はランダム。
        const shuffledSlots = slotsWithCount.sort((a, b) => {
            if (a.candidateCount !== b.candidateCount) {
                return a.candidateCount - b.candidateCount;
            }
            return Math.random() - 0.5;
        });

        for (const slot of shuffledSlots) {
            const candidates: Score[] = [];

            // 現在処理中のスロットと同じ行（タスクラベル）に既にアサインされているメンバーを取得
            // (currentLoopAssignments配列には、固定枠(null)と、このループですでに決定した割り当てが含まれている)
            const currentRowPartners = currentLoopAssignments
                .filter(a => a.taskLabelId === slot.taskLabelId && a.memberId)
                .map(a => a.memberId!);

            // 1回前・2回前に同じ行（タスク）に割り当てられたすべてのメンバーIDを取得
            const oneShuffleAgoMemberIds = getHistoryAssignments(1, slot.taskLabelId);
            const twoShufflesAgoMemberIds = getHistoryAssignments(2, slot.taskLabelId);
            const lastAssignedToday = currentAssignmentMap.get(`${slot.teamId}-${slot.taskLabelId}`)?.memberId ?? null;
            const baseCandidates = eligibleMembers.filter(member => {
                if (currentLoopAssignedMemberIds.has(member.id)) return false;
                if (member.excludedTaskLabelIds.includes(slot.taskLabelId)) return false;
                return true;
            });
            const hasAlternativeToLastAssigned =
                lastAssignedToday !== null &&
                baseCandidates.some(m => m.id !== lastAssignedToday);
            const shouldExcludeLastAssigned =
                lastAssignedToday !== null &&
                baseCandidates.length > 1 &&
                hasAlternativeToLastAssigned;
            for (const member of baseCandidates) {
                // 割り当て済みメンバーはスキップ
                if (currentLoopAssignedMemberIds.has(member.id)) continue;
                // 除外ラベルに含まれる場合はスキップ
                if (member.excludedTaskLabelIds.includes(slot.taskLabelId)) continue;
                // currentAssignmentsの直近担当者は候補が複数いる場合のみ除外
                if (shouldExcludeLastAssigned && member.id === lastAssignedToday) continue;

                let score = recentCounts[member.id] || 0;

                // ペア除外設定チェック（最優先）
                for (const partnerId of currentRowPartners) {
                    if (isPairExcluded(member.id, partnerId, pairExclusions)) {
                        score = Infinity; // 絶対に選択されない
                        break;
                    }
                }

                // スコアがInfinityでなければ他のペナルティも計算
                if (score !== Infinity) {
                    // 場所の重複ペナルティ計算
                    // 同じ行（タスク）に1回前に割り当てられていた場合は超高ペナルティ
                    if (oneShuffleAgoMemberIds.has(member.id)) {
                        score += 10000; // 1回前と同じ行なら超高ペナルティ（絶対避ける）
                    }

                    // 同じ行（タスク）に2回前に割り当てられていた場合は高ペナルティ
                    if (twoShufflesAgoMemberIds.has(member.id)) {
                        score += 20000; // 2回前と同じ行なら高ペナルティ（できるだけ避ける）
                    }

                    // 1回前と2回前の両方で同じ行に割り当てられていた場合は最大ペナルティ
                    if (oneShuffleAgoMemberIds.has(member.id) && twoShufflesAgoMemberIds.has(member.id)) {
                        score += 50000; // 2回連続同じ行なら最大ペナルティ（何が何でも避ける）
                    }

                    // ペアの重複ペナルティ計算
                    // 同じ行になる予定のメンバーとの過去のペア関係をチェック
                    for (const partnerId of currentRowPartners) {
                        // 1回前のシャッフルでペアだった
                        if (pairHistory[member.id]?.shuffleAgo1.has(partnerId)) {
                            score += 5000;
                        }
                        // 2回前のシャッフルでペアだった
                        if (pairHistory[member.id]?.shuffleAgo2.has(partnerId)) {
                            score += 2000;
                        }
                    }

                    // ランダム要素（同じスコア内でのばらつき）
                    score += Math.random();
                }
                candidates.push({ memberId: member.id, score });
            }

            candidates.sort((a, b) => a.score - b.score);
            const bestCandidate = candidates[0];

            // 連続で同じ行に割り当てられないようにするため、1回前に同じ行にいたメンバーは
            // 他の候補がいる場合だけでなく、候補が1人しかいない場合でも割り当てをスキップする
            // 1回前に同じ行にいたメンバーは絶対に避ける（連続を防ぐため）
            if (bestCandidate && oneShuffleAgoMemberIds.has(bestCandidate.memberId)) {
                // 割り当てをスキップ（nullにする）
                currentLoopAssignments.push({
                    teamId: slot.teamId,
                    taskLabelId: slot.taskLabelId,
                    memberId: null,
                    assignedDate: targetDate
                });
                // 割り当て失敗（連続回避のため）は大きなペナルティとみなす
                currentLoopTotalScore += 1000000;
            } else if (bestCandidate && bestCandidate.score < 100000) {
                currentLoopAssignments.push({
                    teamId: slot.teamId,
                    taskLabelId: slot.taskLabelId,
                    memberId: bestCandidate.memberId,
                    assignedDate: targetDate
                });
                currentLoopAssignedMemberIds.add(bestCandidate.memberId);

                // ループ全体のスコアに加算（ランダム要素は除くために整数化してもいいが、比較用なのでそのままでも可）
                // ただし、ランダム要素が結果の優劣に影響しすぎないよう、ペナルティ部分だけを重視したい
                // ここでは単純に加算する
                currentLoopTotalScore += bestCandidate.score;
            } else {
                currentLoopAssignments.push({
                    teamId: slot.teamId,
                    taskLabelId: slot.taskLabelId,
                    memberId: null,
                    assignedDate: targetDate
                });
                // 割り当て失敗（候補なし）は大きなペナルティとみなす
                currentLoopTotalScore += 1000000;
            }
        }

        // 最良の結果を更新
        if (currentLoopTotalScore < minTotalScore) {
            minTotalScore = currentLoopTotalScore;
            bestAssignments = currentLoopAssignments;
        }

        // 完璧な結果（ペナルティなし、ランダムノイズのみ）なら即終了
        // メンバー数 * 1 (ランダム最大値) 程度以下ならペナルティなしとみなせる
        if (currentLoopTotalScore < eligibleMembers.length * 2) {
            break;
        }
    }

    // 安全装置：万が一の重複割り当てを防ぐための最終チェック
    // (IDレベルでの重複があれば、ここで確実に未割り当てに戻します)
    const validatedAssignments: Assignment[] = [];
    const uniqueCheck = new Set<string>();

    for (const asg of bestAssignments) {
        if (asg.memberId) {
            if (uniqueCheck.has(asg.memberId)) {
                // 既に割り当て済みのメンバーIDが再度登場した場合、未割り当て(null)に戻す
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
