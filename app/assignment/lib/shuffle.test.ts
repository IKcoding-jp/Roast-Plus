import { describe, it, expect } from 'vitest';
import { calculateAssignment } from './shuffle';
import type { Team, Member, TaskLabel, Assignment } from '@/types';

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

// テスト用ヘルパー: 優先順位テスト用の構成
// 2班×2タスク、4メンバー、crossTeamShuffle=true
// 鳩ノ巣原理により「全ペア新規」と「全行新規」を同時に満たせないケースを作る
const createPriorityTestData = () => {
  const teams: Team[] = [
    { id: 'tA', name: 'A' },
    { id: 'tB', name: 'B' },
  ];

  const taskLabels: TaskLabel[] = [
    { id: 'r1', leftLabel: 'R1' },
    { id: 'r2', leftLabel: 'R2' },
  ];

  const members: Member[] = [
    { id: 'm1', name: 'M1', teamId: 'tA', excludedTaskLabelIds: [], active: true },
    { id: 'm2', name: 'M2', teamId: 'tA', excludedTaskLabelIds: [], active: true },
    { id: 'm3', name: 'M3', teamId: 'tB', excludedTaskLabelIds: [], active: true },
    { id: 'm4', name: 'M4', teamId: 'tB', excludedTaskLabelIds: [], active: true },
  ];

  // 履歴: r1→[m1,m2], r2→[m3,m4]
  // ペア履歴: m1-m2, m3-m4
  // 行履歴: m1→r1, m2→r1, m3→r2, m4→r2
  const history: Assignment[][] = [
    [
      { teamId: 'tA', taskLabelId: 'r1', memberId: 'm1', assignedDate: '2026-03-06' },
      { teamId: 'tB', taskLabelId: 'r1', memberId: 'm2', assignedDate: '2026-03-06' },
      { teamId: 'tA', taskLabelId: 'r2', memberId: 'm3', assignedDate: '2026-03-06' },
      { teamId: 'tB', taskLabelId: 'r2', memberId: 'm4', assignedDate: '2026-03-06' },
    ],
  ];

  return { teams, taskLabels, members, history };
};

// ヘルパー: 結果から行ごとのメンバーグループを取得
const getRowGroups = (result: Assignment[]): Map<string, string[]> => {
  const groups = new Map<string, string[]>();
  for (const a of result) {
    if (a.memberId) {
      if (!groups.has(a.taskLabelId)) groups.set(a.taskLabelId, []);
      groups.get(a.taskLabelId)!.push(a.memberId);
    }
  }
  return groups;
};

describe('calculateAssignment - priority（制約優先順位）', () => {
  describe('priority: "row"（担当優先）', () => {
    it('行の連続回避がペアより優先される', () => {
      const { teams, taskLabels, members, history } = createPriorityTestData();

      // 複数回実行して全て行回避を確認（ランダム性があるため）
      for (let i = 0; i < 20; i++) {
        const result = calculateAssignment(
          teams, taskLabels, members, history, '2026-03-07',
          undefined, undefined, true, 'row'
        );

        const rowGroups = getRowGroups(result);

        // 行回避: 履歴でr1にいたm1,m2は今回r1にいない
        const r1Members = rowGroups.get('r1') ?? [];
        expect(r1Members).not.toContain('m1'); // m1は履歴でr1→今回r1以外
        expect(r1Members).not.toContain('m2'); // m2は履歴でr1→今回r1以外

        // 行回避: 履歴でr2にいたm3,m4は今回r2にいない
        const r2Members = rowGroups.get('r2') ?? [];
        expect(r2Members).not.toContain('m3'); // m3は履歴でr2→今回r2以外
        expect(r2Members).not.toContain('m4'); // m4は履歴でr2→今回r2以外
      }
    });

    it('ペア除外設定はrow優先モードでも全レベルで強制される', () => {
      const { teams, taskLabels, members, history } = createPriorityTestData();

      // m3とm4のペア除外設定
      const pairExclusions = [
        { id: 'ex1', memberId1: 'm3', memberId2: 'm4', createdAt: { seconds: 0, nanoseconds: 0 } },
      ];

      for (let i = 0; i < 20; i++) {
        const result = calculateAssignment(
          teams, taskLabels, members, history, '2026-03-07',
          undefined, pairExclusions, true, 'row'
        );

        const rowGroups = getRowGroups(result);

        // m3とm4が同じ行にいないこと
        for (const [, memberIds] of rowGroups) {
          const hasM3 = memberIds.includes('m3');
          const hasM4 = memberIds.includes('m4');
          expect(hasM3 && hasM4).toBe(false);
        }
      }
    });
  });

  describe('priority: "pair"（ペア優先）', () => {
    it('ペアの連続回避が行より優先される（従来動作）', () => {
      const { teams, taskLabels, members, history } = createPriorityTestData();

      for (let i = 0; i < 20; i++) {
        const result = calculateAssignment(
          teams, taskLabels, members, history, '2026-03-07',
          undefined, undefined, true, 'pair'
        );

        const rowGroups = getRowGroups(result);

        // ペア回避: 履歴のペア(m1-m2, m3-m4)が同じ行にいない
        for (const [, memberIds] of rowGroups) {
          const hasM1M2 = memberIds.includes('m1') && memberIds.includes('m2');
          const hasM3M4 = memberIds.includes('m3') && memberIds.includes('m4');
          expect(hasM1M2).toBe(false); // m1-m2ペアは回避
          expect(hasM3M4).toBe(false); // m3-m4ペアは回避
        }
      }
    });
  });

  describe('priority: undefined（デフォルト）', () => {
    it('ペア優先と同じ動作になる（後方互換）', () => {
      const { teams, taskLabels, members, history } = createPriorityTestData();

      for (let i = 0; i < 20; i++) {
        // priority引数なし（9番目のパラメータを省略）
        const result = calculateAssignment(
          teams, taskLabels, members, history, '2026-03-07',
          undefined, undefined, true
        );

        const rowGroups = getRowGroups(result);

        // デフォルト = ペア優先: 履歴のペアが同じ行にいない
        for (const [, memberIds] of rowGroups) {
          const hasM1M2 = memberIds.includes('m1') && memberIds.includes('m2');
          const hasM3M4 = memberIds.includes('m3') && memberIds.includes('m4');
          expect(hasM1M2).toBe(false);
          expect(hasM3M4).toBe(false);
        }
      }
    });
  });
});

// ヘルパー: 全アクティブメンバーが結果に含まれることを検証
const expectAllMembersAssigned = (result: Assignment[], members: Member[]) => {
  const assignedMemberIds = new Set(
    result.filter(a => a.memberId !== null).map(a => a.memberId)
  );
  const activeMemberIds = new Set(
    members.filter(m => m.active !== false).map(m => m.id)
  );
  expect(assignedMemberIds).toEqual(activeMemberIds);
};

describe('calculateAssignment - メンバー完全配置保証（#330）', () => {
  describe('班内シャッフルで全メンバーが配置される', () => {
    it('2班×2タスク×4人: 全メンバーが配置される', () => {
      const { teams, taskLabels, members } = createTestData();

      // ランダム性があるため50回試行して全回パスを確認
      for (let i = 0; i < 50; i++) {
        const result = calculateAssignment(
          teams, taskLabels, members, [], '2026-03-11',
          undefined, undefined, false
        );
        expectAllMembersAssigned(result, members);
      }
    });

    it('3班×2タスク×6人: 全メンバーが配置される', () => {
      const { teams, taskLabels, members } = createThreeTeamData();

      for (let i = 0; i < 50; i++) {
        const result = calculateAssignment(
          teams, taskLabels, members, [], '2026-03-11',
          undefined, undefined, false
        );
        expectAllMembersAssigned(result, members);
      }
    });

    it('タスク除外設定ありでもメンバーが消失しない', () => {
      const teams: Team[] = [
        { id: 'teamA', name: '班A' },
        { id: 'teamB', name: '班B' },
      ];
      const taskLabels: TaskLabel[] = [
        { id: 'task1', leftLabel: 'タスク1' },
        { id: 'task2', leftLabel: 'タスク2' },
      ];
      // m1はtask1を除外 → task2にのみ配置可能
      const members: Member[] = [
        { id: 'm1', name: 'メンバー1', teamId: 'teamA', excludedTaskLabelIds: ['task1'], active: true },
        { id: 'm2', name: 'メンバー2', teamId: 'teamA', excludedTaskLabelIds: [], active: true },
        { id: 'm3', name: 'メンバー3', teamId: 'teamB', excludedTaskLabelIds: [], active: true },
        { id: 'm4', name: 'メンバー4', teamId: 'teamB', excludedTaskLabelIds: [], active: true },
      ];

      for (let i = 0; i < 50; i++) {
        const result = calculateAssignment(
          teams, taskLabels, members, [], '2026-03-11',
          undefined, undefined, false
        );
        expectAllMembersAssigned(result, members);
      }
    });

    it('ペア除外設定ありでもメンバーが消失しない', () => {
      const { teams, taskLabels, members } = createTestData();
      // m1とm2のペア除外（同じ班A内）
      const pairExclusions = [
        { id: 'ex1', memberId1: 'm1', memberId2: 'm2', createdAt: { seconds: 0, nanoseconds: 0 } },
      ];

      for (let i = 0; i < 50; i++) {
        const result = calculateAssignment(
          teams, taskLabels, members, [], '2026-03-11',
          undefined, pairExclusions, false
        );
        expectAllMembersAssigned(result, members);
      }
    });

    it('班間人数差（3人 vs 1人）でも全メンバーが配置される', () => {
      const teams: Team[] = [
        { id: 'teamA', name: '班A' },
        { id: 'teamB', name: '班B' },
      ];
      const taskLabels: TaskLabel[] = [
        { id: 'task1', leftLabel: 'タスク1' },
        { id: 'task2', leftLabel: 'タスク2' },
        { id: 'task3', leftLabel: 'タスク3' },
      ];
      // 班A: 3人, 班B: 1人（班Bスロットは2つ空になる可能性がある）
      const members: Member[] = [
        { id: 'm1', name: 'メンバー1', teamId: 'teamA', excludedTaskLabelIds: [], active: true },
        { id: 'm2', name: 'メンバー2', teamId: 'teamA', excludedTaskLabelIds: [], active: true },
        { id: 'm3', name: 'メンバー3', teamId: 'teamA', excludedTaskLabelIds: [], active: true },
        { id: 'm4', name: 'メンバー4', teamId: 'teamB', excludedTaskLabelIds: [], active: true },
      ];

      for (let i = 0; i < 50; i++) {
        const result = calculateAssignment(
          teams, taskLabels, members, [], '2026-03-11',
          undefined, undefined, false
        );
        expectAllMembersAssigned(result, members);
      }
    });

    it('履歴制約が厳しい場合でも全メンバーが配置される', () => {
      const { teams, taskLabels, members } = createTestData();

      // 厳しい履歴: 全メンバーが全タスクに過去配置されている
      const history: Assignment[][] = [
        // 1回前: task1→[m1,m3], task2→[m2,m4]
        [
          { teamId: 'teamA', taskLabelId: 'task1', memberId: 'm1', assignedDate: '2026-03-10' },
          { teamId: 'teamB', taskLabelId: 'task1', memberId: 'm3', assignedDate: '2026-03-10' },
          { teamId: 'teamA', taskLabelId: 'task2', memberId: 'm2', assignedDate: '2026-03-10' },
          { teamId: 'teamB', taskLabelId: 'task2', memberId: 'm4', assignedDate: '2026-03-10' },
        ],
        // 2回前: task1→[m2,m4], task2→[m1,m3]
        [
          { teamId: 'teamA', taskLabelId: 'task1', memberId: 'm2', assignedDate: '2026-03-09' },
          { teamId: 'teamB', taskLabelId: 'task1', memberId: 'm4', assignedDate: '2026-03-09' },
          { teamId: 'teamA', taskLabelId: 'task2', memberId: 'm1', assignedDate: '2026-03-09' },
          { teamId: 'teamB', taskLabelId: 'task2', memberId: 'm3', assignedDate: '2026-03-09' },
        ],
      ];

      for (let i = 0; i < 50; i++) {
        const result = calculateAssignment(
          teams, taskLabels, members, history, '2026-03-11',
          undefined, undefined, false
        );
        expectAllMembersAssigned(result, members);
      }
    });
  });

  describe('班またぎシャッフルへの影響なし', () => {
    it('crossTeamShuffle=true時も全メンバーが配置される', () => {
      const { teams, taskLabels, members } = createTestData();

      for (let i = 0; i < 50; i++) {
        const result = calculateAssignment(
          teams, taskLabels, members, [], '2026-03-11',
          undefined, undefined, true
        );
        expectAllMembersAssigned(result, members);
      }
    });
  });
});
