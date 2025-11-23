import { Team, Member, TaskLabel, Assignment, AssignmentDay } from '../types';

type Score = {
    memberId: string;
    score: number;
};

export const calculateAssignment = (
    teams: Team[],
    taskLabels: TaskLabel[],
    members: Member[],
    history: AssignmentDay[], // 直近の履歴 (昨日、一昨日...)
    targetDate: string
): Assignment[] => {
    // 1. 対象メンバーの抽出 (管理者以外)
    const eligibleMembers = members.filter(m => !m.isManager);

    // 2. 割り当て枠の作成
    const slots: { teamId: string; taskLabelId: string }[] = [];
    teams.forEach(team => {
        taskLabels.forEach(task => {
            slots.push({ teamId: team.id, taskLabelId: task.id });
        });
    });

    // 3. 履歴データの整理 (日付ごとのマップ化)
    // history[0] = 昨日, history[1] = 一昨日 ... と仮定 (呼び出し側でソート済みであることを期待するが、念のため日付で確認も可)
    // ここでは history は "直近n日分" のリスト。

    // メンバーごとの直近担当回数
    const recentCounts: Record<string, number> = {};
    eligibleMembers.forEach(m => recentCounts[m.id] = 0);

    history.forEach(day => {
        day.assignments.forEach(asg => {
            if (asg.memberId && recentCounts[asg.memberId] !== undefined) {
                recentCounts[asg.memberId]++;
            }
        });
    });

    // 昨日・一昨日の担当チェック用
    const getHistoryAssignment = (daysAgo: number, taskLabelId: string): string | null => {
        // daysAgo=1 -> 昨日
        // history配列の中から該当する日付を探す必要があるが、
        // 簡易的に history は降順(新しい順)で渡されると想定してインデックスアクセスするか、
        // 日付計算してfindするか。
        // ここでは history 配列は "新しい順" (index 0 が一番新しい) と仮定して実装します。
        // 呼び出し元で sort((a, b) => b.date.localeCompare(a.date)) しておくこと。

        const dayRecord = history[daysAgo - 1];
        if (!dayRecord) return null;

        // チーム関係なく、そのタスクを担当していたか？
        // 要件: "同じ TaskLabel を..." とあるので、チームは問わないと解釈。
        const asg = dayRecord.assignments.find(a => a.taskLabelId === taskLabelId);
        return asg?.memberId || null;
    };

    // 4. 割り当て実行
    const assignments: Assignment[] = [];
    const assignedMemberIds = new Set<string>();

    // スロットをシャッフルして、埋める順番をランダムにする (偏りを防ぐため)
    const shuffledSlots = [...slots].sort(() => Math.random() - 0.5);

    for (const slot of shuffledSlots) {
        // このスロット(タスク)に対する各メンバーのスコアを計算
        const candidates: Score[] = [];

        for (const member of eligibleMembers) {
            // 既に割り当て済みならスキップ
            if (assignedMemberIds.has(member.id)) continue;

            // 除外ラベルチェック
            if (member.excludedTaskLabelIds.includes(slot.taskLabelId)) continue;

            let score = recentCounts[member.id] || 0; // 基本スコア: 担当回数

            // 昨日の担当者
            const yesterdayMemberId = getHistoryAssignment(1, slot.taskLabelId);
            if (yesterdayMemberId === member.id) {
                score += 5; // ペナルティ大
            }

            // 一昨日の担当者
            const twoDaysAgoMemberId = getHistoryAssignment(2, slot.taskLabelId);
            if (twoDaysAgoMemberId === member.id) {
                score += 3; // ペナルティ中
            }

            // 3日連続禁止チェック
            // 昨日も一昨日もこのメンバーだった場合
            if (yesterdayMemberId === member.id && twoDaysAgoMemberId === member.id) {
                score += 1000; // 実質禁止
            }

            // ランダム要素を少し加えて、同点時の偏りを防ぐ
            score += Math.random();

            candidates.push({ memberId: member.id, score });
        }

        // スコアが最も低い(優先度が高い)メンバーを選ぶ
        candidates.sort((a, b) => a.score - b.score);

        const bestCandidate = candidates[0];

        if (bestCandidate && bestCandidate.score < 500) { // 500以上は禁止レベルとみなして割り当てない
            assignments.push({
                teamId: slot.teamId,
                taskLabelId: slot.taskLabelId,
                memberId: bestCandidate.memberId
            });
            assignedMemberIds.add(bestCandidate.memberId);
        } else {
            // 候補なしか、禁止ルールに抵触するメンバーしかいない場合
            assignments.push({
                teamId: slot.teamId,
                taskLabelId: slot.taskLabelId,
                memberId: null
            });
        }
    }

    // 結果を元のスロット順(あるいはTeam/Task順)に戻す必要はないが、
    // Assignment型としては順序を持たないので、このままでOK。
    // 表示時にTeam/TaskLabelのorder順に並べる。

    return assignments;
};
