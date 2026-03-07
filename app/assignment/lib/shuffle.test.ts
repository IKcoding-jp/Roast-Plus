import { describe, it, expect } from 'vitest';
import { calculateAssignment } from './shuffle';
import type { Team, Member, TaskLabel } from '@/types';

// テスト用ヘルパー: 2班×2タスクの基本構成
const createTestData = () => {
  const teams: Team[] = [
    { id: 'teamA', name: '班A' },
    { id: 'teamB', name: '班B' },
  ];

  const taskLabels: TaskLabel[] = [
    { id: 'task1', leftLabel: 'タスク1' },
    { id: 'task2', leftLabel: 'タスク2' },
  ];

  const members: Member[] = [
    { id: 'm1', name: 'メンバー1', teamId: 'teamA', excludedTaskLabelIds: [], active: true },
    { id: 'm2', name: 'メンバー2', teamId: 'teamA', excludedTaskLabelIds: [], active: true },
    { id: 'm3', name: 'メンバー3', teamId: 'teamB', excludedTaskLabelIds: [], active: true },
    { id: 'm4', name: 'メンバー4', teamId: 'teamB', excludedTaskLabelIds: [], active: true },
  ];

  return { teams, taskLabels, members };
};

// テスト用ヘルパー: 3班×2タスクの構成
const createThreeTeamData = () => {
  const teams: Team[] = [
    { id: 'teamA', name: '班A' },
    { id: 'teamB', name: '班B' },
    { id: 'teamC', name: '班C' },
  ];

  const taskLabels: TaskLabel[] = [
    { id: 'task1', leftLabel: 'タスク1' },
    { id: 'task2', leftLabel: 'タスク2' },
  ];

  const members: Member[] = [
    { id: 'm1', name: 'メンバー1', teamId: 'teamA', excludedTaskLabelIds: [], active: true },
    { id: 'm2', name: 'メンバー2', teamId: 'teamA', excludedTaskLabelIds: [], active: true },
    { id: 'm3', name: 'メンバー3', teamId: 'teamB', excludedTaskLabelIds: [], active: true },
    { id: 'm4', name: 'メンバー4', teamId: 'teamB', excludedTaskLabelIds: [], active: true },
    { id: 'm5', name: 'メンバー5', teamId: 'teamC', excludedTaskLabelIds: [], active: true },
    { id: 'm6', name: 'メンバー6', teamId: 'teamC', excludedTaskLabelIds: [], active: true },
  ];

  return { teams, taskLabels, members };
};

describe('calculateAssignment - crossTeamShuffle', () => {
  describe('crossTeamShuffle: false（班内シャッフル）', () => {
    it('全メンバーが元の班のスロットにのみ配置される', () => {
      const { teams, taskLabels, members } = createTestData();
      const targetDate = '2026-03-07';

      const result = calculateAssignment(
        teams, taskLabels, members, [], targetDate,
        undefined, undefined, false
      );

      // 各アサインメントで、メンバーが自分の班のスロットに配置されていることを検証
      for (const assignment of result) {
        if (assignment.memberId) {
          const member = members.find(m => m.id === assignment.memberId);
          expect(member).toBeDefined();
          expect(assignment.teamId).toBe(member!.teamId);
        }
      }
    });

    it('3班構成でも全メンバーが元の班に留まる', () => {
      const { teams, taskLabels, members } = createThreeTeamData();
      const targetDate = '2026-03-07';

      const result = calculateAssignment(
        teams, taskLabels, members, [], targetDate,
        undefined, undefined, false
      );

      for (const assignment of result) {
        if (assignment.memberId) {
          const member = members.find(m => m.id === assignment.memberId);
          expect(member).toBeDefined();
          expect(assignment.teamId).toBe(member!.teamId);
        }
      }
    });
  });

  describe('crossTeamShuffle: true（班またぎシャッフル）', () => {
    it('従来の動作と同等（班をまたいだ配置が可能）', () => {
      const { teams, taskLabels, members } = createTestData();
      const targetDate = '2026-03-07';

      // 複数回実行して、少なくとも1回は班をまたいだ配置があることを検証
      let hasCrossTeam = false;
      for (let i = 0; i < 50; i++) {
        const result = calculateAssignment(
          teams, taskLabels, members, [], targetDate,
          undefined, undefined, true
        );

        for (const assignment of result) {
          if (assignment.memberId) {
            const member = members.find(m => m.id === assignment.memberId);
            if (member && assignment.teamId !== member.teamId) {
              hasCrossTeam = true;
              break;
            }
          }
        }
        if (hasCrossTeam) break;
      }

      // ランダム性があるため、50回試行すれば班またぎが発生するはず
      expect(hasCrossTeam).toBe(true);
    });
  });

  describe('crossTeamShuffle: undefined（デフォルト）', () => {
    it('班内シャッフルとして動作する（false扱い）', () => {
      const { teams, taskLabels, members } = createTestData();
      const targetDate = '2026-03-07';

      // crossTeamShuffle を渡さない場合
      const result = calculateAssignment(
        teams, taskLabels, members, [], targetDate,
        undefined, undefined
      );

      for (const assignment of result) {
        if (assignment.memberId) {
          const member = members.find(m => m.id === assignment.memberId);
          expect(member).toBeDefined();
          expect(assignment.teamId).toBe(member!.teamId);
        }
      }
    });
  });

  describe('境界値テスト', () => {
    it('1班のみの場合、正常にシャッフルされる', () => {
      const teams: Team[] = [{ id: 'teamA', name: '班A' }];
      const taskLabels: TaskLabel[] = [
        { id: 'task1', leftLabel: 'タスク1' },
        { id: 'task2', leftLabel: 'タスク2' },
      ];
      const members: Member[] = [
        { id: 'm1', name: 'メンバー1', teamId: 'teamA', excludedTaskLabelIds: [], active: true },
        { id: 'm2', name: 'メンバー2', teamId: 'teamA', excludedTaskLabelIds: [], active: true },
      ];

      const result = calculateAssignment(
        teams, taskLabels, members, [], '2026-03-07',
        undefined, undefined, false
      );

      // 全メンバーが班Aのスロットに配置される（制約の意味がないが正常動作）
      const assignedMembers = result.filter(a => a.memberId !== null);
      expect(assignedMembers.length).toBe(2);
      for (const assignment of assignedMembers) {
        expect(assignment.teamId).toBe('teamA');
      }
    });

    it('ペア除外設定と班内制約の併用が正しく動作する', () => {
      const { teams, taskLabels, members } = createTestData();
      const targetDate = '2026-03-07';

      // m1とm2のペア除外（同じ班A）
      const pairExclusions = [
        { id: 'ex1', memberId1: 'm1', memberId2: 'm2', createdAt: { seconds: 0, nanoseconds: 0 } },
      ];

      const result = calculateAssignment(
        teams, taskLabels, members, [], targetDate,
        undefined, pairExclusions, false
      );

      // 班内制約: 全メンバーが元の班に留まる
      for (const assignment of result) {
        if (assignment.memberId) {
          const member = members.find(m => m.id === assignment.memberId);
          expect(member).toBeDefined();
          expect(assignment.teamId).toBe(member!.teamId);
        }
      }

      // ペア除外: m1とm2が同じ行にいない
      const taskGroups = new Map<string, string[]>();
      for (const assignment of result) {
        if (assignment.memberId) {
          if (!taskGroups.has(assignment.taskLabelId)) {
            taskGroups.set(assignment.taskLabelId, []);
          }
          taskGroups.get(assignment.taskLabelId)!.push(assignment.memberId);
        }
      }

      for (const [, memberIds] of taskGroups) {
        const hasM1 = memberIds.includes('m1');
        const hasM2 = memberIds.includes('m2');
        expect(hasM1 && hasM2).toBe(false);
      }
    });
  });
});
