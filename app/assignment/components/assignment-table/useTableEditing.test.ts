import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTableEditing } from './useTableEditing';
import { MAX_TEAMS, MAX_TASK_LABELS, MAX_MEMBERS } from '../../lib/constants';
import { Team, TaskLabel, Member } from '@/types';

// Toast モック
const mockShowToast = vi.fn();
vi.mock('@/components/Toast', () => ({
  useToastContext: () => ({ showToast: mockShowToast, toasts: [], removeToast: vi.fn() }),
}));

// uuid モック
vi.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

function createTeams(count: number): Team[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `team-${i}`,
    name: `Team ${i}`,
    order: i,
  }));
}

function createTaskLabels(count: number): TaskLabel[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `label-${i}`,
    leftLabel: `Label ${i}`,
    rightLabel: null,
    order: i,
  }));
}

function createMembers(count: number): Member[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `member-${i}`,
    name: `Member ${i}`,
    teamId: 'team-0',
    excludedTaskLabelIds: [],
  }));
}

function createDefaultParams(overrides: Partial<Parameters<typeof useTableEditing>[0]> = {}) {
  return {
    teams: [] as Team[],
    taskLabels: [] as TaskLabel[],
    members: [] as Member[],
    tableSettings: null,
    onUpdateTableSettings: vi.fn(),
    onUpdateTaskLabel: vi.fn(),
    onAddTaskLabel: vi.fn(),
    onDeleteTaskLabel: vi.fn(),
    onAddTeam: vi.fn(),
    onDeleteTeam: vi.fn(),
    onUpdateTeam: vi.fn(),
    onAddMember: vi.fn(),
    onUpdateMember: vi.fn(),
    ...overrides,
  };
}

describe('useTableEditing - 上限チェック', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleAddTeam', () => {
    it('上限未満のとき班を追加できる', async () => {
      const onAddTeam = vi.fn();
      const params = createDefaultParams({
        teams: createTeams(MAX_TEAMS - 1),
        onAddTeam,
      });

      const { result } = renderHook(() => useTableEditing(params));

      // チーム名をセット
      act(() => {
        result.current.setNewTeamName('New Team');
      });

      await act(async () => {
        await result.current.handleAddTeam();
      });

      expect(onAddTeam).toHaveBeenCalledTimes(1);
    });

    it('上限到達時に班を追加できない', async () => {
      const onAddTeam = vi.fn();
      const params = createDefaultParams({
        teams: createTeams(MAX_TEAMS),
        onAddTeam,
      });

      const { result } = renderHook(() => useTableEditing(params));

      await act(async () => {
        await result.current.handleAddTeam();
      });

      expect(onAddTeam).not.toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining(`${MAX_TEAMS}`),
        'warning'
      );
    });

    it('最後の班を追加するとinfo通知が表示される', async () => {
      const onAddTeam = vi.fn();
      const params = createDefaultParams({
        teams: createTeams(MAX_TEAMS - 1),
        onAddTeam,
      });

      const { result } = renderHook(() => useTableEditing(params));

      act(() => {
        result.current.setNewTeamName('Last Team');
      });

      await act(async () => {
        await result.current.handleAddTeam();
      });

      expect(onAddTeam).toHaveBeenCalledTimes(1);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining(`${MAX_TEAMS}`),
        'info'
      );
    });
  });

  describe('handleAddTaskLabel', () => {
    it('上限未満のとき作業ラベルを追加できる', async () => {
      const onAddTaskLabel = vi.fn();
      const params = createDefaultParams({
        taskLabels: createTaskLabels(MAX_TASK_LABELS - 1),
        onAddTaskLabel,
      });

      const { result } = renderHook(() => useTableEditing(params));

      act(() => {
        result.current.setNewLeftLabel('New Label');
      });

      await act(async () => {
        await result.current.handleAddTaskLabel();
      });

      expect(onAddTaskLabel).toHaveBeenCalledTimes(1);
    });

    it('上限到達時に作業ラベルを追加できない', async () => {
      const onAddTaskLabel = vi.fn();
      const params = createDefaultParams({
        taskLabels: createTaskLabels(MAX_TASK_LABELS),
        onAddTaskLabel,
      });

      const { result } = renderHook(() => useTableEditing(params));

      act(() => {
        result.current.setNewLeftLabel('New Label');
      });

      await act(async () => {
        await result.current.handleAddTaskLabel();
      });

      expect(onAddTaskLabel).not.toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining(`${MAX_TASK_LABELS}`),
        'warning'
      );
    });

    it('最後の作業ラベルを追加するとinfo通知が表示される', async () => {
      const onAddTaskLabel = vi.fn();
      const params = createDefaultParams({
        taskLabels: createTaskLabels(MAX_TASK_LABELS - 1),
        onAddTaskLabel,
      });

      const { result } = renderHook(() => useTableEditing(params));

      act(() => {
        result.current.setNewLeftLabel('Last Label');
      });

      await act(async () => {
        await result.current.handleAddTaskLabel();
      });

      expect(onAddTaskLabel).toHaveBeenCalledTimes(1);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining(`${MAX_TASK_LABELS}`),
        'info'
      );
    });
  });

  describe('handleAddMember', () => {
    it('上限未満のときメンバーを追加できる', async () => {
      const onAddMember = vi.fn();
      const onUpdateMember = vi.fn();
      const params = createDefaultParams({
        members: createMembers(MAX_MEMBERS - 1),
        onAddMember,
        onUpdateMember,
      });

      const { result } = renderHook(() => useTableEditing(params));

      act(() => {
        result.current.setNewMemberName('New Member');
      });

      await act(async () => {
        await result.current.handleAddMember('label-0', 'team-0');
      });

      expect(onAddMember).toHaveBeenCalledTimes(1);
    });

    it('上限到達時にメンバーを追加できない', async () => {
      const onAddMember = vi.fn();
      const params = createDefaultParams({
        members: createMembers(MAX_MEMBERS),
        onAddMember,
      });

      const { result } = renderHook(() => useTableEditing(params));

      act(() => {
        result.current.setNewMemberName('New Member');
      });

      await act(async () => {
        await result.current.handleAddMember('label-0', 'team-0');
      });

      expect(onAddMember).not.toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining(`${MAX_MEMBERS}`),
        'warning'
      );
    });

    it('最後のメンバーを追加するとinfo通知が表示される', async () => {
      const onAddMember = vi.fn();
      const onUpdateMember = vi.fn();
      const params = createDefaultParams({
        members: createMembers(MAX_MEMBERS - 1),
        onAddMember,
        onUpdateMember,
      });

      const { result } = renderHook(() => useTableEditing(params));

      act(() => {
        result.current.setNewMemberName('Last Member');
      });

      await act(async () => {
        await result.current.handleAddMember('label-0', 'team-0');
      });

      expect(onAddMember).toHaveBeenCalledTimes(1);
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining(`${MAX_MEMBERS}`),
        'info'
      );
    });
  });
});
