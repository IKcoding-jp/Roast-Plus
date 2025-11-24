import { Team, Member, TaskLabel, Assignment } from '@/types';

type Score = {
    memberId: string;
    score: number;
};

export const calculateAssignment = (
    teams: Team[],
    taskLabels: TaskLabel[],
    members: Member[],
    history: Assignment[][], // シャッフル履歴の配列（history[0] = 1回前、history[1] = 2回前）
    targetDate: string,
    currentAssignments?: Assignment[] // 現在の割り当て（固定チェック用）
): Assignment[] => {
    // 1. 対象メンバーの抽出 (アクティブなメンバー)
    const eligibleMembers = members.filter(m => m.active !== false);

    // 2. 割り当て枠の作成
    // memberId === null（未割り当て）の枠は固定する
    // 割り当て済みの枠のみをシャッフル対象として再抽選する

    const slots: { teamId: string; taskLabelId: string }[] = [];
    const lockedSlots = new Set<string>(); // "teamId-taskLabelId"
    const assignments: Assignment[] = [];

    // 割り当て済みメンバーを追跡するセット (重複割り当て防止用)
    const assignedMemberIds = new Set<string>();

    teams.forEach(team => {
        taskLabels.forEach(task => {
            const current = currentAssignments?.find(a => a.teamId === team.id && a.taskLabelId === task.id);

            if (current && current.memberId === null) {
                // 未割り当ての場合は固定（結果にそのまま含める）
                // メンバーがいないので assignedMemberIds への追加は不要
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

    // 3. 履歴データの整理
    // シャッフル履歴ベースで参照（history[0] = 1回前、history[1] = 2回前）
    const historyWithToday: Assignment[][] = [];
    // 現在の割り当てを1回前として扱う（memberIdがnullでないもののみ）
    if (currentAssignments && currentAssignments.length > 0) {
        const hasAssignedMembers = currentAssignments.some(a => a.memberId !== null);
        if (hasAssignedMembers) {
            historyWithToday.push(currentAssignments.filter(a => a.memberId !== null));
        }
    }
    // 過去のシャッフル履歴を追加
    historyWithToday.push(...history);

    const recentCounts: Record<string, number> = {};
    eligibleMembers.forEach(m => recentCounts[m.id] = 0);

    // シャッフル履歴からカウントを計算
    historyWithToday.forEach(shuffleResult => {
        shuffleResult.forEach(asg => {
            if (asg.memberId && recentCounts[asg.memberId] !== undefined) {
                recentCounts[asg.memberId]++;
            }
        });
    });

    const getHistoryAssignment = (shuffleAgo: number, taskLabelId: string): string | null => {
        // shuffleAgo: 1 = 1回前、2 = 2回前
        const shuffleResult = historyWithToday[shuffleAgo - 1];
        if (!shuffleResult) return null;
        const asg = shuffleResult.find(a => a.taskLabelId === taskLabelId);
        return asg?.memberId || null;
    };

    // ペア重複チェック用の履歴マップ構築
    // memberId -> { shuffleAgo1: Set<partnerId>, shuffleAgo2: Set<partnerId> }
    const pairHistory: Record<string, { shuffleAgo1: Set<string>, shuffleAgo2: Set<string> }> = {};
    eligibleMembers.forEach(m => {
        pairHistory[m.id] = { shuffleAgo1: new Set(), shuffleAgo2: new Set() };
    });

    [1, 2].forEach(shuffleAgo => {
        // shuffleAgo: 1 = 1回前、2 = 2回前
        const shuffleResult = historyWithToday[shuffleAgo - 1];
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
            // このスロットに割り当て可能なメンバー数（チーム一致かつ除外設定なし）
            const count = eligibleMembers.filter(m =>
                m.teamId === slot.teamId &&
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

            for (const member of eligibleMembers) {
                // 割り当て済みメンバーはスキップ
                if (currentLoopAssignedMemberIds.has(member.id)) continue;
                // チームが異なるメンバーはスキップ
                if (member.teamId !== slot.teamId) continue;
                // 除外ラベルに含まれる場合はスキップ
                if (member.excludedTaskLabelIds.includes(slot.taskLabelId)) continue;

                let score = recentCounts[member.id] || 0;

                // 場所の重複ペナルティ計算
                const oneShuffleAgoMemberId = getHistoryAssignment(1, slot.taskLabelId);
                if (oneShuffleAgoMemberId === member.id) score += 10000; // 1回前と同じなら超高ペナルティ（絶対避ける）

                const twoShufflesAgoMemberId = getHistoryAssignment(2, slot.taskLabelId);
                if (twoShufflesAgoMemberId === member.id) score += 20000; // 2回前と同じなら高ペナルティ（できるだけ避ける）

                if (oneShuffleAgoMemberId === member.id && twoShufflesAgoMemberId === member.id) {
                    score += 50000; // 2回連続同じなら最大ペナルティ（何が何でも避ける）
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
                candidates.push({ memberId: member.id, score });
            }

            candidates.sort((a, b) => a.score - b.score);
            const bestCandidate = candidates[0];

            // 閾値を上げて、ペナルティが高くても他に候補がいなければ割り当てるようにする
            // (最大ペナルティは約65000点なので、それより大きく設定)
            if (bestCandidate && bestCandidate.score < 100000) {
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
