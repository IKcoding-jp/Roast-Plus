'use client';

import { useState, useMemo, useEffect } from 'react';
import { HiTrash } from 'react-icons/hi';
import { MdClose } from 'react-icons/md';
import type { Member, PairExclusion, ShuffleSettings } from '@/types';
import { Button, Select, IconButton, Switch } from '@/components/ui';

interface AssignmentSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    // シャッフル設定
    shuffleSettings: ShuffleSettings;
    onUpdateShuffleSettings: (settings: Partial<ShuffleSettings>) => Promise<void>;
    // ペア除外設定
    isDeveloperMode: boolean;
    members: Member[];
    pairExclusions: PairExclusion[];
    onAddPairExclusion: (memberId1: string, memberId2: string) => Promise<void>;
    onDeletePairExclusion: (exclusionId: string) => Promise<void>;
}

export function AssignmentSettingsModal({
    isOpen,
    onClose,
    shuffleSettings,
    onUpdateShuffleSettings,
    isDeveloperMode,
    members,
    pairExclusions,
    onAddPairExclusion,
    onDeletePairExclusion,
}: AssignmentSettingsModalProps) {
    const [memberId1, setMemberId1] = useState('');
    const [memberId2, setMemberId2] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(false);
            setError(null);
        }
    }, [isOpen]);

    const activeMembers = useMemo(() =>
        members.filter(m => m.active !== false).sort((a, b) => a.name.localeCompare(b.name)),
        [members]
    );

    const memberNameMap = useMemo(() => {
        const map = new Map<string, string>();
        members.forEach(m => map.set(m.id, m.name));
        return map;
    }, [members]);

    if (!isOpen) return null;

    const handleAdd = async () => {
        setError(null);

        if (!memberId1 || !memberId2) {
            setError('2人のメンバーを選択してください');
            return;
        }

        if (memberId1 === memberId2) {
            setError('異なるメンバーを選択してください');
            return;
        }

        setIsLoading(true);
        try {
            await onAddPairExclusion(memberId1, memberId2);
            setMemberId1('');
            setMemberId2('');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('追加に失敗しました');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (exclusionId: string) => {
        setIsLoading(true);
        try {
            await onDeletePairExclusion(exclusionId);
        } catch (err) {
            console.error('Failed to delete pair exclusion:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const memberOptions = activeMembers.map(member => ({
        value: member.id,
        label: member.name,
    }));

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="rounded-xl max-w-md w-full mx-4 shadow-xl max-h-[80vh] flex flex-col bg-overlay border border-edge overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ヘッダー */}
                <div className="px-4 py-3 flex items-center justify-between bg-ground border-b border-edge">
                    <h2 className="font-bold text-ink">
                        詳細設定
                    </h2>
                    <IconButton
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        aria-label="閉じる"
                    >
                        <MdClose size={20} />
                    </IconButton>
                </div>

                {/* ボディ */}
                <div className="flex-1 overflow-y-auto">
                    {/* セクション1: シャッフル設定 */}
                    <div className="p-6 border-b border-edge">
                        <h3 className="text-sm font-semibold mb-3 text-ink">シャッフル設定</h3>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-ground">
                            <div className="flex-1 mr-3">
                                <div className="text-sm font-medium text-ink">班をまたいでシャッフル</div>
                                <div className="text-xs mt-0.5 text-ink-sub">
                                    OFFの場合、各メンバーは自分の班内でのみタスクが入れ替わります
                                </div>
                            </div>
                            <Switch
                                checked={shuffleSettings.crossTeamShuffle}
                                onChange={(e) => {
                                    onUpdateShuffleSettings({ crossTeamShuffle: e.target.checked });
                                }}
                                aria-label="班をまたいでシャッフル"
                            />
                        </div>

                        {/* シャッフルの優先順位 */}
                        <div className="mt-3 p-3 rounded-lg bg-ground">
                            <div className="text-sm font-medium text-ink mb-2">シャッフルの優先順位</div>
                            <div className="space-y-2">
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="shufflePriority"
                                        value="pair"
                                        checked={(shuffleSettings.priority ?? 'pair') === 'pair'}
                                        onChange={() => onUpdateShuffleSettings({ priority: 'pair' })}
                                        className="mt-0.5 accent-spot"
                                        aria-label="同じ人との組み合わせを避ける"
                                    />
                                    <div>
                                        <div className="text-sm text-ink">同じ人との組み合わせを避ける</div>
                                        <div className="text-xs text-ink-sub mt-0.5">
                                            毎回なるべく違う人と組みます。ただし同じ作業が連続することがあります
                                        </div>
                                    </div>
                                </label>
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="shufflePriority"
                                        value="row"
                                        checked={shuffleSettings.priority === 'row'}
                                        onChange={() => onUpdateShuffleSettings({ priority: 'row' })}
                                        className="mt-0.5 accent-spot"
                                        aria-label="同じ作業の連続を避ける"
                                    />
                                    <div>
                                        <div className="text-sm text-ink">同じ作業の連続を避ける</div>
                                        <div className="text-xs text-ink-sub mt-0.5">
                                            毎回なるべく違う作業になります。ただし同じ人と組むことがあります
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* セクション2: ペア除外設定（isDeveloperModeのみ） */}
                    {isDeveloperMode && (
                        <div className="p-6">
                            <h3 className="text-sm font-semibold mb-3 text-ink">ペア除外設定</h3>
                            <p className="text-sm mb-4 text-ink-sub">
                                シャッフル時に同じ行（タスク）に配置しないメンバーの組み合わせを設定します。
                            </p>

                            {/* 追加フォーム */}
                            <div className="mb-6 p-4 rounded-lg bg-ground">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <Select
                                        label="メンバー1"
                                        value={memberId1}
                                        onChange={(e) => setMemberId1(e.target.value)}
                                        options={memberOptions}
                                        placeholder="選択..."
                                        disabled={isLoading}
                                        className="!text-sm !py-2"
                                    />
                                    <Select
                                        label="メンバー2"
                                        value={memberId2}
                                        onChange={(e) => setMemberId2(e.target.value)}
                                        options={memberOptions}
                                        placeholder="選択..."
                                        disabled={isLoading}
                                        className="!text-sm !py-2"
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm mb-3 text-red-600">{error}</p>
                                )}

                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleAdd}
                                    disabled={isLoading || !memberId1 || !memberId2}
                                    loading={isLoading}
                                    fullWidth
                                >
                                    追加
                                </Button>
                            </div>

                            {/* 既存の設定リスト */}
                            <div>
                                <h4 className="text-sm font-medium mb-2 text-ink">
                                    設定済みのペア ({pairExclusions.length}件)
                                </h4>

                                {pairExclusions.length === 0 ? (
                                    <p className="text-sm text-center py-4 text-ink-muted">
                                        設定がありません
                                    </p>
                                ) : (
                                    <ul className="space-y-2">
                                        {pairExclusions.map(exclusion => (
                                            <li
                                                key={exclusion.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-ground"
                                            >
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-medium text-ink">
                                                        {memberNameMap.get(exclusion.memberId1) || '(削除済み)'}
                                                    </span>
                                                    <span className="text-ink-muted">&times;</span>
                                                    <span className="font-medium text-ink">
                                                        {memberNameMap.get(exclusion.memberId2) || '(削除済み)'}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(exclusion.id)}
                                                    disabled={isLoading}
                                                    className="!p-1.5 !min-h-0 !text-red-500 hover:!text-red-700 hover:!bg-red-50"
                                                    aria-label="削除"
                                                >
                                                    <HiTrash className="w-4 h-4" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
