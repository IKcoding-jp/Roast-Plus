import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssignmentSettingsModal } from './AssignmentSettingsModal';
import type { Member, PairExclusion, ShuffleSettings } from '@/types';

const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    shuffleSettings: { crossTeamShuffle: false } as ShuffleSettings,
    onUpdateShuffleSettings: vi.fn().mockResolvedValue(undefined),
    isDeveloperMode: false,
    members: [
        { id: 'm1', name: 'メンバー1', teamId: 'teamA', excludedTaskLabelIds: [], active: true },
        { id: 'm2', name: 'メンバー2', teamId: 'teamB', excludedTaskLabelIds: [], active: true },
    ] as Member[],
    pairExclusions: [] as PairExclusion[],
    onAddPairExclusion: vi.fn().mockResolvedValue(undefined),
    onDeletePairExclusion: vi.fn().mockResolvedValue(undefined),
};

describe('AssignmentSettingsModal', () => {
    it('isOpen=false の場合、何もレンダリングされない', () => {
        const { container } = render(
            <AssignmentSettingsModal {...defaultProps} isOpen={false} />
        );
        expect(container.innerHTML).toBe('');
    });

    it('isOpen=true の場合、モーダルが表示される', () => {
        render(<AssignmentSettingsModal {...defaultProps} />);
        expect(screen.getByText('詳細設定')).toBeInTheDocument();
    });

    it('シャッフル設定セクションが全ユーザーに表示される', () => {
        render(<AssignmentSettingsModal {...defaultProps} isDeveloperMode={false} />);
        expect(screen.getByText('シャッフル設定')).toBeInTheDocument();
        expect(screen.getByText('班をまたいでシャッフル')).toBeInTheDocument();
    });

    it('Switchトグル操作で onUpdateShuffleSettings が呼ばれる', () => {
        const onUpdateShuffleSettings = vi.fn().mockResolvedValue(undefined);
        render(
            <AssignmentSettingsModal
                {...defaultProps}
                shuffleSettings={{ crossTeamShuffle: false }}
                onUpdateShuffleSettings={onUpdateShuffleSettings}
            />
        );

        const switchButton = screen.getByRole('switch');
        fireEvent.click(switchButton);

        expect(onUpdateShuffleSettings).toHaveBeenCalledWith({ crossTeamShuffle: true });
    });

    it('isDeveloperMode=false でペア除外セクションが非表示', () => {
        render(<AssignmentSettingsModal {...defaultProps} isDeveloperMode={false} />);
        expect(screen.queryByText('ペア除外設定')).not.toBeInTheDocument();
    });

    it('isDeveloperMode=true でペア除外セクションが表示される', () => {
        render(<AssignmentSettingsModal {...defaultProps} isDeveloperMode={true} />);
        expect(screen.getByText('ペア除外設定')).toBeInTheDocument();
    });
});
