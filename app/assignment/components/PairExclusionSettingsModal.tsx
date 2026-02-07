'use client';

import { useState, useMemo, useEffect } from 'react';
import { HiX, HiTrash } from 'react-icons/hi';
import type { Member, PairExclusion } from '@/types';
import { Button, Select } from '@/components/ui';

interface PairExclusionSettingsModalProps {
    isOpen: boolean;
    members: Member[];
    pairExclusions: PairExclusion[];
    onClose: () => void;
    onAdd: (memberId1: string, memberId2: string) => Promise<void>;
    onDelete: (exclusionId: string) => Promise<void>;
}

export function PairExclusionSettingsModal({
    isOpen,
    members,
    pairExclusions,
    onClose,
    onAdd,
    onDelete,
}: PairExclusionSettingsModalProps) {
    const [memberId1, setMemberId1] = useState('');
    const [memberId2, setMemberId2] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // モーダルが開いた時に状態をリセット
    useEffect(() => {
        if (isOpen) {
            setIsLoading(false);
            setError(null);
        }
    }, [isOpen]);

    // アクティブなメンバーのみをフィルタ
    const activeMembers = useMemo(() =>
        members.filter(m => m.active !== false).sort((a, b) => a.name.localeCompare(b.name)),
        [members]
    );

    // メンバーIDから名前を取得するマップ
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
            await onAdd(memberId1, memberId2);
            // 成功したらリセット
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
            await onDelete(exclusionId);
        } catch (err) {
            console.error('Failed to delete pair exclusion:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // メンバーのSelectオプションを生成
    const memberOptions = activeMembers.map(member => ({
        value: member.id,
        label: member.name,
    }));

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="rounded-lg p-6 max-w-md w-full mx-4 shadow-xl max-h-[80vh] flex flex-col bg-overlay border border-edge"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-ink">
                        ペア除外設定
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="!p-1 !min-h-0"
                        aria-label="閉じる"
                    >
                        <HiX className="w-5 h-5" />
                    </Button>
                </div>

                {/* 説明文 */}
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
                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-sm font-medium mb-2 text-ink">
                        設定済みのペア ({pairExclusions.length}件)
                    </h3>

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
                                        <span className="text-ink-muted">×</span>
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
        </div>
    );
}
