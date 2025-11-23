import { Team, Member, TaskLabel, Assignment, AssignmentDay } from '@/types';

type Score = {
    memberId: string;
    score: number;
};

export const calculateAssignment = (
    teams: Team[],
    taskLabels: TaskLabel[],
    members: Member[],
    history: AssignmentDay[], // 直近の履歴 (昨日、一昨日...)
    targetDate: string,
    currentAssignments?: Assignment[] // 現在の割り当て（固定チェック用）
): Assignment[] => {
    // 1. 対象メンバーの抽出 (アクティブなメンバー)
    const eligibleMembers = members.filter(m => m.active !== false);

    // 2. 割り当て枠の作成
    // 現在の割り当てで memberId が null の枠はシャッフル対象外（固定）とする
    // または、既に memberId が設定されている枠も固定する？
    // 要件：「未割り当てはシャッフルの考慮にいれず、位置を固定するべきです」
    // 解釈：memberId === null のスロットは、新しい結果でも memberId: null のままにする。
    
    const slots: { teamId: string; taskLabelId: string }[] = [];
    const lockedSlots = new Set<string>(); // "teamId-taskLabelId"
    const assignments: Assignment[] = [];

    teams.forEach(team => {
        taskLabels.forEach(task => {
            const current = currentAssignments?.find(a => a.teamId === team.id && a.taskLabelId === task.id);
            
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
                // 割り当て対象のスロット
                slots.push({ teamId: team.id, taskLabelId: task.id });
            }
        });
    });

    // 3. 履歴データの整理
    const recentCounts: Record<string, number> = {};
    eligibleMembers.forEach(m => recentCounts[m.id] = 0);

    history.forEach(day => {
        day.assignments.forEach(asg => {
            if (asg.memberId && recentCounts[asg.memberId] !== undefined) {
                recentCounts[asg.memberId]++;
            }
        });
    });

    const getHistoryAssignment = (daysAgo: number, taskLabelId: string): string | null => {
        const dayRecord = history[daysAgo - 1];
        if (!dayRecord) return null;
        const asg = dayRecord.assignments.find(a => a.taskLabelId === taskLabelId);
        return asg?.memberId || null;
    };

    // ペア重複チェック用の履歴マップ構築
    // memberId -> { daysAgo1: Set<partnerId>, daysAgo2: Set<partnerId> }
    const pairHistory: Record<string, { daysAgo1: Set<string>, daysAgo2: Set<string> }> = {};
    eligibleMembers.forEach(m => {
        pairHistory[m.id] = { daysAgo1: new Set(), daysAgo2: new Set() };
    });

    [1, 2].forEach(daysAgo => {
        const dayRecord = history[daysAgo - 1];
        if (!dayRecord) return;

        // タスクラベルごとにメンバーをグループ化
        const tasks: Record<string, string[]> = {};
        dayRecord.assignments.forEach(a => {
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
                        if (daysAgo === 1) pairHistory[m1].daysAgo1.add(m2);
                        else pairHistory[m1].daysAgo2.add(m2);
                    }
                    if (pairHistory[m2]) {
                        if (daysAgo === 1) pairHistory[m2].daysAgo1.add(m1);
                        else pairHistory[m2].daysAgo2.add(m1);
                    }
                }
            }
        });
    });

    // 4. 割り当て実行
    const assignedMemberIds = new Set<string>();

    // 固定されたスロットに既に割り当てられているメンバーを除外リストに追加
    // currentAssignments で memberId が null でないスロットも固定する場合はここに追加ロジックが必要だが、
    // 今回の要件は「未割り当て(null)は固定」なので、null以外のスロットは再シャッフル対象となる。
    // ただし、currentAssignments で null になっているスロットは上で assignments に追加済み。
    // ここでは、シャッフル対象のスロットに対してメンバーを割り当てていく。

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
        // (assignments配列には、固定枠(null)と、このループですでに決定した割り当てが含まれている)
        const currentRowPartners = assignments
            .filter(a => a.taskLabelId === slot.taskLabelId && a.memberId)
            .map(a => a.memberId!);

        for (const member of eligibleMembers) {
            // 割り当て済みメンバーはスキップ
            if (assignedMemberIds.has(member.id)) continue;
            // チームが異なるメンバーはスキップ
            if (member.teamId !== slot.teamId) continue;
            // 除外ラベルに含まれる場合はスキップ
            if (member.excludedTaskLabelIds.includes(slot.taskLabelId)) continue;

            let score = recentCounts[member.id] || 0;

            // 場所の重複ペナルティ計算
            const yesterdayMemberId = getHistoryAssignment(1, slot.taskLabelId);
            if (yesterdayMemberId === member.id) score += 10000; // 昨日と同じなら超高ペナルティ（絶対避ける）

            const twoDaysAgoMemberId = getHistoryAssignment(2, slot.taskLabelId);
            if (twoDaysAgoMemberId === member.id) score += 5000; // 一昨日と同じなら高ペナルティ（できるだけ避ける）

            if (yesterdayMemberId === member.id && twoDaysAgoMemberId === member.id) {
                score += 50000; // 2日連続同じなら最大ペナルティ（何が何でも避ける）
            }

            // ペアの重複ペナルティ計算
            // 同じ行になる予定のメンバーとの過去のペア関係をチェック
            for (const partnerId of currentRowPartners) {
                // 昨日ペアだった
                if (pairHistory[member.id]?.daysAgo1.has(partnerId)) {
                    score += 50;
                }
                // 一昨日ペアだった
                if (pairHistory[member.id]?.daysAgo2.has(partnerId)) {
                    score += 20;
                }
            }

            score += Math.random();
            candidates.push({ memberId: member.id, score });
        }

        candidates.sort((a, b) => a.score - b.score);
        const bestCandidate = candidates[0];

        // 閾値を上げて、ペナルティが高くても他に候補がいなければ割り当てるようにする
        // (最大ペナルティは約65000点なので、それより大きく設定)
        if (bestCandidate && bestCandidate.score < 100000) {
            assignments.push({
                teamId: slot.teamId,
                taskLabelId: slot.taskLabelId,
                memberId: bestCandidate.memberId,
                assignedDate: targetDate
            });
            assignedMemberIds.add(bestCandidate.memberId);
        } else {
            assignments.push({
                teamId: slot.teamId,
                taskLabelId: slot.taskLabelId,
                memberId: null,
                assignedDate: targetDate
            });
        }
    }

    // 安全装置：万が一の重複割り当てを防ぐための最終チェック
    // (IDレベルでの重複があれば、ここで確実に未割り当てに戻します)
    const validatedAssignments: Assignment[] = [];
    const uniqueCheck = new Set<string>();

    for (const asg of assignments) {
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
