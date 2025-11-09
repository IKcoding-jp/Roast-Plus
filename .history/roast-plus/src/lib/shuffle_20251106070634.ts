import type {
  AppData,
  Team,
  Member,
  TaskLabel,
  Assignment,
  AssignmentHistory,
} from '@/types';

/**
 * 過去の割り当て履歴を確認して、同じペア（班×ラベル×メンバー）の重複を避ける
 */
function getRecentAssignments(
  history: AssignmentHistory[],
  teamId: string,
  taskLabelId: string,
  lookBackDays: number = 7
): string[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - lookBackDays);

  return history
    .filter(
      (h) =>
        h.teamId === teamId &&
        h.taskLabelId === taskLabelId &&
        new Date(h.assignedDate) >= cutoffDate
    )
    .map((h) => h.memberId);
}

/**
 * 同じ担当位置（班×ラベル）の連続割り当てを避けるために、直近の割り当てを確認
 */
function getRecentAssignmentForPosition(
  assignments: Assignment[],
  teamId: string,
  taskLabelId: string
): string | null {
  const assignment = assignments.find(
    (a) => a.teamId === teamId && a.taskLabelId === taskLabelId
  );
  return assignment?.memberId || null;
}

/**
 * 公平性を考慮したシャッフルアルゴリズム
 */
export function shuffleAssignments(
  data: AppData,
  targetDate: string = new Date().toISOString().split('T')[0]
): Assignment[] {
  const { teams, members, taskLabels, assignments, assignmentHistory } = data;

  // 新しい割り当てを作成
  const newAssignments: Assignment[] = [];

  // 各班×作業ラベルの組み合わせに対して割り当て
  for (const team of teams) {
    const teamMembers = members.filter((m) => m.teamId === team.id);

    if (teamMembers.length === 0) {
      // メンバーがいない場合は、すべてのラベルに未設定を割り当て
      for (const taskLabel of taskLabels) {
        newAssignments.push({
          teamId: team.id,
          taskLabelId: taskLabel.id,
          memberId: null,
          assignedDate: targetDate,
        });
      }
      continue;
    }

    // すべてのメンバーを必ず割り当てる
    // まず、すべてのメンバーをランダムにシャッフル
    const shuffledMembers = [...teamMembers].sort(() => Math.random() - 0.5);
    const assignedMemberIds = new Set<string>();

    // ラベルごとに1人のメンバーを割り当て
    for (const taskLabel of taskLabels) {
      // 過去の割り当て履歴から最近の割り当てを取得
      const recentMemberIds = getRecentAssignments(
        assignmentHistory,
        team.id,
        taskLabel.id
      );

      // 現在の割り当てを確認
      const currentAssignment = getRecentAssignmentForPosition(
        assignments,
        team.id,
        taskLabel.id
      );

      // まだ割り当てられていないメンバーを優先
      const unassignedMembers = shuffledMembers.filter(
        (m) => !assignedMemberIds.has(m.id)
      );

      // 未割り当てのメンバーがいる場合
      if (unassignedMembers.length > 0) {
        // 公平性を考慮：最近割り当てられていない、かつ連続割り当てでないメンバーを優先
        let preferredMembers = unassignedMembers.filter(
          (m) => !recentMemberIds.includes(m.id) && m.id !== currentAssignment
        );

        // 優先候補がいない場合は、連続割り当てを避けるだけ
        if (preferredMembers.length === 0) {
          preferredMembers = unassignedMembers.filter(
            (m) => m.id !== currentAssignment
          );
        }

        // それでも候補がいない場合は、すべての未割り当てメンバーから選択
        const finalCandidates =
          preferredMembers.length > 0
            ? preferredMembers
            : unassignedMembers;

        // ランダムに選択
        const selectedMember =
          finalCandidates[Math.floor(Math.random() * finalCandidates.length)];

        newAssignments.push({
          teamId: team.id,
          taskLabelId: taskLabel.id,
          memberId: selectedMember.id,
          assignedDate: targetDate,
        });

        // 割り当てられたメンバーを記録
        assignedMemberIds.add(selectedMember.id);
      } else {
        // すべてのメンバーが割り当て済みの場合（ラベルの数がメンバーの数より多い場合）
        // 同じメンバーが複数のラベルに割り当てられないように、未設定にする
        newAssignments.push({
          teamId: team.id,
          taskLabelId: taskLabel.id,
          memberId: null,
          assignedDate: targetDate,
        });
      }
    }
  }

  return newAssignments;
}

/**
 * 新しい割り当てを履歴に追加
 */
export function createAssignmentHistory(
  assignments: Assignment[]
): AssignmentHistory[] {
  return assignments
    .filter((a) => a.memberId !== null)
    .map((a) => ({
      teamId: a.teamId,
      taskLabelId: a.taskLabelId,
      memberId: a.memberId!,
      assignedDate: a.assignedDate,
    }));
}

