import { useState, useRef, useCallback } from 'react';
import { Member } from '@/types';

export function useCellInteraction(members: Member[]) {
    const [selectedCell, setSelectedCell] = useState<{ teamId: string, taskLabelId: string } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ teamId: string, taskLabelId: string, memberId: string | null } | null>(null);
    const [editingMemberName, setEditingMemberName] = useState('');
    const [isExclusionSettingsOpen, setIsExclusionSettingsOpen] = useState(false);

    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const isLongPress = useRef(false);
    const touchStartPos = useRef<{ x: number, y: number } | null>(null);

    const openContextMenu = useCallback((teamId: string, taskLabelId: string, memberId: string | null) => {
        const member = memberId ? members.find((m) => m.id === memberId) : undefined;
        setIsExclusionSettingsOpen(false);
        setEditingMemberName(member?.name ?? '');
        setContextMenu({ teamId, taskLabelId, memberId });
    }, [members]);

    const handleCellTouchStart = useCallback((teamId: string, taskLabelId: string, memberId: string | null, e: React.TouchEvent | React.MouseEvent) => {
        isLongPress.current = false;
        if ('touches' in e) {
            touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else {
            touchStartPos.current = { x: e.clientX, y: e.clientY };
        }

        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            openContextMenu(teamId, taskLabelId, memberId);
            setSelectedCell(null);
            if (navigator.vibrate) navigator.vibrate(50);
        }, 500);
    }, [openContextMenu]);

    const handleCellTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        if (!touchStartPos.current || !longPressTimer.current) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const diffX = Math.abs(clientX - touchStartPos.current.x);
        const diffY = Math.abs(clientY - touchStartPos.current.y);

        if (diffX > 10 || diffY > 10) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    const handleCellTouchEnd = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    const handleCellClick = useCallback((teamId: string, taskLabelId: string, onSwapAssignments: (asg1: { teamId: string, taskLabelId: string }, asg2: { teamId: string, taskLabelId: string }) => Promise<void>) => {
        if (isLongPress.current) {
            isLongPress.current = false;
            return;
        }

        if (contextMenu) return;

        if (selectedCell) {
            if (selectedCell.teamId === teamId && selectedCell.taskLabelId === taskLabelId) {
                setSelectedCell(null);
            } else {
                onSwapAssignments(selectedCell, { teamId, taskLabelId });
                setSelectedCell(null);
            }
        } else {
            setSelectedCell({ teamId, taskLabelId });
        }
    }, [contextMenu, selectedCell]);

    return {
        selectedCell,
        contextMenu,
        setContextMenu,
        editingMemberName,
        setEditingMemberName,
        isExclusionSettingsOpen,
        setIsExclusionSettingsOpen,
        handleCellTouchStart,
        handleCellTouchMove,
        handleCellTouchEnd,
        handleCellClick,
    };
}
