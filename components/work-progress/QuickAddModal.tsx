import React, { useState, useEffect } from 'react';
import { HiX, HiCheck } from 'react-icons/hi';
import { IconButton } from '@/components/ui';
import { WorkProgress } from '@/types';
import { useToastContext } from '@/components/Toast';

interface QuickAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    workProgress: WorkProgress | null;
    onAdd: (amount: number, memo?: string) => Promise<void>;
    unit: string;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
    isOpen,
    onClose,
    workProgress,
    onAdd,
    unit,
}) => {
    const { showToast } = useToastContext();
    const [amount, setAmount] = useState<string>('');
    const [memo, setMemo] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setMemo('');
        }
    }, [isOpen, workProgress]);

    if (!isOpen || !workProgress) return null;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // `-` が入力された場合、現在の値から減算
        if (value === '-') {
            const step = workProgress.targetAmount === undefined ? 1 : (unit === 'kg' ? 0.1 : 1);
            const currentVal = parseFloat(amount) || 0;
            setAmount((currentVal - step).toString());
            return;
        }

        setAmount(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount === 0 || !amount.trim()) return;

        setIsSubmitting(true);
        try {
            await onAdd(numAmount, memo);
            onClose();
        } catch (error) {
            console.error('Failed to add progress:', error);
            showToast('進捗の追加に失敗しました', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 transition-opacity duration-300">
            <div
                className="bg-overlay w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up sm:animate-fade-in border border-edge"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-edge flex items-center justify-between bg-ground">
                    <h3 className="font-bold text-ink truncate pr-4">
                        進捗を記録: {workProgress.taskName}
                    </h3>
                    <IconButton variant="ghost" size="md" rounded onClick={onClose} aria-label="閉じる">
                        <HiX className="h-5 w-5" />
                    </IconButton>
                </div>

                <form onSubmit={handleSubmit} className="p-4 overflow-y-auto">
                    {/* Amount Display & Input */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-ink-muted uppercase tracking-wide mb-2">
                            {workProgress.targetAmount === undefined
                                ? '追加する個数'
                                : `追加する量 (${unit || '個'})`}
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="0"
                                className="flex-1 text-3xl font-bold text-ink placeholder-ink-muted border-b-2 border-spot focus:border-spot-hover focus:outline-none py-1 bg-transparent text-center"
                                step={workProgress.targetAmount === undefined ? '1' : (unit === 'kg' ? '0.1' : '1')}
                                autoFocus
                            />
                            <span className="text-xl font-medium text-ink-sub">
                                {workProgress.targetAmount === undefined ? '個' : (unit || '個')}
                            </span>
                        </div>
                    </div>

                    {/* Memo */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-ink-muted uppercase tracking-wide mb-2">
                            メモ (任意)
                        </label>
                        <textarea
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="備考があれば入力..."
                            className="w-full px-3 py-2 text-sm text-ink bg-field border border-edge rounded-lg focus:ring-2 focus:ring-spot focus:border-transparent resize-none placeholder:text-ink-muted"
                            rows={2}
                        />
                    </div>

                    {/* Actions */}
                    <button
                        type="submit"
                        disabled={!amount || parseFloat(amount) === 0 || isNaN(parseFloat(amount)) || isSubmitting}
                        className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${!amount || parseFloat(amount) === 0 || isNaN(parseFloat(amount)) || isSubmitting
                                ? 'bg-ground text-ink-muted cursor-not-allowed'
                                : 'bg-btn-primary hover:bg-btn-primary-hover active:scale-[0.98]'
                            }`}
                    >
                        {isSubmitting ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <HiCheck className="h-5 w-5" />
                                記録する
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
