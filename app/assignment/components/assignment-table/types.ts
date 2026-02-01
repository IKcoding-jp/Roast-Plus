import { Team, TaskLabel, Assignment, Member, TableSettings } from '@/types';

export type Props = {
    teams: Team[];
    taskLabels: TaskLabel[];
    assignments: Assignment[];
    members: Member[];
    tableSettings: TableSettings | null;
    onUpdateTableSettings: (settings: TableSettings) => Promise<void>;
    onUpdateMember: (assignment: Assignment, memberId: string | null) => Promise<void>;
    onAddMember: (member: Member) => Promise<void>;
    onDeleteMember: (memberId: string) => Promise<void>;
    onUpdateTaskLabel: (taskLabel: TaskLabel) => Promise<void>;
    onAddTaskLabel: (taskLabel: TaskLabel) => Promise<void>;
    onDeleteTaskLabel: (taskLabelId: string) => Promise<void>;
    onAddTeam: (team: Team) => Promise<void>;
    onDeleteTeam: (teamId: string) => Promise<void>;
    onUpdateTeam: (team: Team) => Promise<void>;
    onUpdateMemberName: (memberId: string, name: string) => Promise<void>;
    onUpdateMemberExclusion: (memberId: string, taskLabelId: string, isExcluded: boolean) => Promise<void>;
    onSwapAssignments: (asg1: { teamId: string, taskLabelId: string }, asg2: { teamId: string, taskLabelId: string }) => Promise<void>;
    onShuffle: () => Promise<void>;
    isShuffleDisabled: boolean;
};

export const DEFAULT_TABLE_SETTINGS: TableSettings = {
    colWidths: { taskLabel: 160, note: 160, teams: {} },
    rowHeights: {},
    headerLabels: {
        left: '左ラベル',
        right: '右ラベル'
    }
};

export type WidthConfig = {
    type: 'taskLabel' | 'note' | 'team';
    id?: string;
    currentWidth: number;
    label: string;
    currentTitle?: string;
};

export type HeightConfig = {
    taskLabelId: string;
    currentHeight: number;
    label: string;
    currentName: string;
    editMode: 'left' | 'right';
    currentRightLabel?: string;
};
