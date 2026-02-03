import { useEffect, useCallback } from 'react';

interface UseDialogKeyboardProps {
    isOpen: boolean;
    onClose: () => void;
    onEscape?: () => void;
}

/**
 * ダイアログのキーボード操作を管理するカスタムフック
 */
export const useDialogKeyboard = ({ isOpen, onClose, onEscape }: UseDialogKeyboardProps) => {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!isOpen) return;
            if (event.key === 'Escape') {
                event.preventDefault();
                if (onEscape) {
                    onEscape();
                } else {
                    onClose();
                }
            }
        },
        [isOpen, onClose, onEscape]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};
