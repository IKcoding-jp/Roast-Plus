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

      // 割り当て可能なメンバー（最近割り当てられていないメンバー）をフィルタリング
      let availableMembers = teamMembers.filter(
        (m) => !recentMemberIds.includes(m.id)
      );

      // すべてのメンバーが最近割り当てられている場合は、すべてを候補に戻す
      if (availableMembers.length === 0) {
        availableMembers = teamMembers;
      }

      // 現在の割り当てと同じメンバーを避ける（連続割り当てを避ける）
      const candidates = availableMembers.filter(
        (m) => m.id !== currentAssignment
      );

      // 候補がいない場合は、すべての候補から選択
      const finalCandidates = candidates.length > 0 ? candidates : availableMembers;

      // ランダムに選択
      const selectedMember =
        finalCandidates[Math.floor(Math.random() * finalCandidates.length)];

      newAssignments.push({
        teamId: team.id,
        taskLabelId: taskLabel.id,
        memberId: selectedMember?.id || null,
        assignedDate: targetDate,
      });
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

