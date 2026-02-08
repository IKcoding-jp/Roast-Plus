import React from 'react';
import { HiPlus, HiArchive, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { WorkProgress, WorkProgressStatus } from '@/types';

interface WorkProgressCardProps {
    workProgress: WorkProgress;
    isInGroup?: boolean;
    onEdit: (id: string) => void;
    onStatusChange: (id: string, status: WorkProgressStatus) => void;
    onArchive: (id: string) => void;
    onAddProgress: (id: string) => void;
    onToggleHistory: (id: string) => void;
    onEditHistory?: (workProgressId: string, entryId: string) => void;
    isHistoryExpanded: boolean;
    getProgressBarColor: (percentage: number) => string;
    calculateProgressPercentage: (wp: WorkProgress) => number;
    calculateRemaining: (wp: WorkProgress) => number | null;
    formatAmount: (amount: number, unit: string) => string;
    extractUnit: (weight?: string) => string;
    formatDateTime: (dateString?: string) => string;
}

export const WorkProgressCard: React.FC<WorkProgressCardProps> = ({
    workProgress: wp,
    isInGroup = false,
    onEdit,
    onStatusChange,
    onArchive,
    onAddProgress,
    onToggleHistory,
    onEditHistory,
    isHistoryExpanded,
    getProgressBarColor,
    calculateProgressPercentage,
    calculateRemaining,
    formatAmount,
    extractUnit,
    formatDateTime,
}) => {
    const isDummyWork = !wp.taskName || wp.taskName.trim() === '';
    const hasProgressHistory = wp.progressHistory && wp.progressHistory.length > 0;
    const unit = extractUnit(wp.weight);
    const percentage = calculateProgressPercentage(wp);

    if (isDummyWork) {
        return (
            <div className="text-center py-6 px-4 bg-ground/50 border-2 border-dashed border-edge-strong rounded-lg">
                <p className="text-sm text-ink-sub mb-3">新しく作業を追加してください</p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(wp.id);
                    }}
                    className="w-full px-3 py-1.5 text-xs font-medium text-spot bg-spot-subtle border border-spot rounded-lg hover:bg-spot-surface transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                    <HiPlus className="h-3.5 w-3.5" />
                    <span>作業を追加</span>
                </button>
            </div>
        );
    }

    return (
        <div
            className={`${isInGroup
                    ? 'border border-edge rounded-lg p-3 space-y-2.5 bg-surface shadow-sm'
                    : 'bg-surface rounded-lg shadow-card border border-edge p-4 sm:p-5 md:p-6 break-inside-avoid mb-4 sm:mb-6 w-full inline-block'
                } hover:shadow-card-hover hover:border-edge-strong transition-all cursor-pointer`}
            onClick={() => onEdit(wp.id)}
        >
            {/* Header: Task Name & Status */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        {wp.taskName && (
                            <h3 className="text-base font-bold text-ink leading-tight">{wp.taskName}</h3>
                        )}
                        <select
                            value={wp.status}
                            onChange={(e) => {
                                e.stopPropagation();
                                onStatusChange(wp.id, e.target.value as WorkProgressStatus);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`px-2 py-1 text-xs font-medium rounded border focus:outline-none focus:ring-2 focus:ring-spot min-h-[32px] cursor-pointer ${wp.status === 'completed'
                                    ? 'bg-success/10 text-success border-success/30'
                                    : wp.status === 'in_progress'
                                        ? 'bg-spot-subtle text-spot border-spot'
                                        : 'bg-ground text-ink-sub border-edge'
                                }`}
                        >
                            <option value="pending">前</option>
                            <option value="in_progress">途中</option>
                            <option value="completed">済</option>
                        </select>
                    </div>
                    {!isInGroup && wp.weight && <p className="text-xs text-ink-muted mt-1">目標: {wp.weight}</p>}
                </div>

                {/* Archive Button */}
                {wp.status === 'completed' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onArchive(wp.id);
                        }}
                        className="p-2 text-ink-muted hover:text-ink-sub hover:bg-ground rounded-full transition-colors"
                        title="アーカイブ"
                    >
                        <HiArchive className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Progress Section */}
            {wp.targetAmount !== undefined ? (
                <div className="space-y-3">
                    <div className="flex items-end justify-between gap-2">
                        <div>
                            <div className="text-xs text-ink-muted mb-0.5">
                                {(() => {
                                    const remaining = calculateRemaining(wp);
                                    if (remaining === null) return null;
                                    if (remaining <= 0) {
                                        const over = Math.abs(remaining);
                                        return over > 0 ? (
                                            <span className="text-success font-medium">目標達成 (+{formatAmount(over, unit)}{unit})</span>
                                        ) : null;
                                    }
                                    return <span>残り <span className="font-medium text-ink-sub">{formatAmount(remaining, unit)}{unit}</span></span>;
                                })()}
                            </div>
                            <div className="text-xl font-bold text-ink leading-none flex items-baseline gap-1">
                                <span className="text-xs font-normal text-ink-muted">完成数</span>
                                {formatAmount(wp.currentAmount || 0, unit)}
                                <span className="text-sm font-normal text-ink-muted ml-1">/ {formatAmount(wp.targetAmount, unit)}{unit}</span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddProgress(wp.id);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-btn-primary rounded-lg hover:bg-btn-primary-hover active:bg-btn-primary-hover transition-colors flex items-center gap-1 shadow-sm"
                        >
                            <HiPlus className="h-4 w-4" />
                            記録
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative w-full bg-ground rounded-full h-4 overflow-hidden shadow-inner">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressBarColor(percentage)}`}
                            style={{ width: `${percentage}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className={`text-[10px] font-bold ${percentage >= 55 ? 'text-white' : 'text-ink-sub'}`}>
                                {percentage.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                /* Completed Count Only Mode */
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs text-ink-muted block mb-0.5">完成数</span>
                            <span className="text-xl font-bold text-ink">
                                {wp.completedCount || 0}<span className="text-sm font-normal text-ink-muted ml-1">個</span>
                            </span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddProgress(wp.id);
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-btn-primary rounded-lg hover:bg-btn-primary-hover active:bg-btn-primary-hover transition-colors flex items-center gap-1 shadow-sm"
                        >
                            <HiPlus className="h-4 w-4" />
                            記録
                        </button>
                    </div>
                </div>
            )}

            {/* Dates */}
            {isInGroup && (wp.startedAt || wp.completedAt) && (
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-ink-muted">
                    {wp.startedAt && <span>開始: {formatDateTime(wp.startedAt)}</span>}
                    {wp.completedAt && <span>完了: {formatDateTime(wp.completedAt)}</span>}
                </div>
            )}

            {/* Memo */}
            {wp.memo && (
                <div className="mt-2 text-xs text-ink-sub bg-ground p-2 rounded border border-edge whitespace-pre-wrap line-clamp-2">
                    {wp.memo}
                </div>
            )}

            {/* History Toggle */}
            {hasProgressHistory && (
                <div className="mt-3 pt-2 border-t border-edge">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleHistory(wp.id);
                        }}
                        className="w-full flex items-center justify-between text-xs text-ink-muted hover:text-ink-sub py-1 transition-colors"
                    >
                        <span>履歴 ({wp.progressHistory!.length})</span>
                        {isHistoryExpanded ? <HiChevronUp className="h-3 w-3" /> : <HiChevronDown className="h-3 w-3" />}
                    </button>

                    {isHistoryExpanded && (
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                            {[...wp.progressHistory!]
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((entry) => (
                                    <div
                                        key={entry.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onEditHistory) {
                                                onEditHistory(wp.id, entry.id);
                                            }
                                        }}
                                        className="text-xs flex justify-between items-start bg-ground p-1.5 rounded cursor-pointer hover:bg-edge transition-colors"
                                    >
                                        <div>
                                            <span className="font-medium text-ink-sub">
                                                {entry.amount >= 0 ? '+' : '-'}{formatAmount(Math.abs(entry.amount), unit)}{unit}
                                            </span>
                                            {entry.memo && <p className="text-ink-muted mt-0.5">{entry.memo}</p>}
                                        </div>
                                        <span className="text-[10px] text-ink-muted">{formatDateTime(entry.date)}</span>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
