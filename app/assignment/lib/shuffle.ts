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
    // 1. 対象メンバーの抽出 (管理者以外)
    const eligibleMembers = members.filter(m => !m.isManager);

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
                    memberId: null
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

    // 4. 割り当て実行
    const assignedMemberIds = new Set<string>();

    // 固定されたスロットに既に割り当てられているメンバーを除外リストに追加
    // currentAssignments で memberId が null でないスロットも固定する場合はここに追加ロジックが必要だが、
    // 今回の要件は「未割り当て(null)は固定」なので、null以外のスロットは再シャッフル対象となる。
    // ただし、currentAssignments で null になっているスロットは上で assignments に追加済み。
    // ここでは、シャッフル対象のスロットに対してメンバーを割り当てていく。

    // スロットをシャッフル
    const shuffledSlots = [...slots].sort(() => Math.random() - 0.5);

    for (const slot of shuffledSlots) {
        const candidates: Score[] = [];

        for (const member of eligibleMembers) {
            // 割り当て済みメンバーはスキップ
            if (assignedMemberIds.has(member.id)) continue;
            // チームが異なるメンバーはスキップ
            if (member.teamId !== slot.teamId) continue;
            // 除外ラベルに含まれる場合はスキップ
            if (member.excludedTaskLabelIds.includes(slot.taskLabelId)) continue;

            let score = recentCounts[member.id] || 0;

            // ペナルティ計算
            const yesterdayMemberId = getHistoryAssignment(1, slot.taskLabelId);
            if (yesterdayMemberId === member.id) score += 5;

            const twoDaysAgoMemberId = getHistoryAssignment(2, slot.taskLabelId);
            if (twoDaysAgoMemberId === member.id) score += 3;

            if (yesterdayMemberId === member.id && twoDaysAgoMemberId === member.id) {
                score += 1000;
            }

            score += Math.random();
            candidates.push({ memberId: member.id, score });
        }

        candidates.sort((a, b) => a.score - b.score);
        const bestCandidate = candidates[0];

        if (bestCandidate && bestCandidate.score < 500) {
            assignments.push({
                teamId: slot.teamId,
                taskLabelId: slot.taskLabelId,
                memberId: bestCandidate.memberId
            });
            assignedMemberIds.add(bestCandidate.memberId);
        } else {
            assignments.push({
                teamId: slot.teamId,
                taskLabelId: slot.taskLabelId,
                memberId: null
            });
        }
    }

    return assignments;
};
