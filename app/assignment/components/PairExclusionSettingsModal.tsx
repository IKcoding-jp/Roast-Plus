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
    isChristmasMode?: boolean;
}

export function PairExclusionSettingsModal({
    isOpen,
    members,
    pairExclusions,
    onClose,
    onAdd,
    onDelete,
    isChristmasMode = false,
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
                className={`rounded-lg p-6 max-w-md w-full mx-4 shadow-xl max-h-[80vh] flex flex-col ${
                    isChristmasMode ? 'bg-[#0a2f1a] border border-[#d4af37]/30' : 'bg-white'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-bold ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
                        ペア除外設定
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        isChristmasMode={isChristmasMode}
                        className="!p-1 !min-h-0"
                        aria-label="閉じる"
                    >
                        <HiX className="w-5 h-5" />
                    </Button>
                </div>

                {/* 説明文 */}
                <p className={`text-sm mb-4 ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
                    シャッフル時に同じ行（タスク）に配置しないメンバーの組み合わせを設定します。
                </p>

                {/* 追加フォーム */}
                <div className={`mb-6 p-4 rounded-lg ${isChristmasMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <Select
                            label="メンバー1"
                            value={memberId1}
                            onChange={(e) => setMemberId1(e.target.value)}
                            options={memberOptions}
                            placeholder="選択..."
                            disabled={isLoading}
                            isChristmasMode={isChristmasMode}
                            className="!text-sm !py-2"
                        />
                        <Select
                            label="メンバー2"
                            value={memberId2}
                            onChange={(e) => setMemberId2(e.target.value)}
                            options={memberOptions}
                            placeholder="選択..."
                            disabled={isLoading}
                            isChristmasMode={isChristmasMode}
                            className="!text-sm !py-2"
                        />
                    </div>

                    {error && (
                        <p className={`text-sm mb-3 ${isChristmasMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                    )}

                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAdd}
                        disabled={isLoading || !memberId1 || !memberId2}
                        loading={isLoading}
                        fullWidth
                        isChristmasMode={isChristmasMode}
                    >
                        追加
                    </Button>
                </div>

                {/* 既存の設定リスト */}
                <div className="flex-1 overflow-y-auto">
                    <h3 className={`text-sm font-medium mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
                        設定済みのペア ({pairExclusions.length}件)
                    </h3>

                    {pairExclusions.length === 0 ? (
                        <p className={`text-sm text-center py-4 ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'}`}>
                            設定がありません
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {pairExclusions.map(exclusion => (
                                <li
                                    key={exclusion.id}
                                    className={`flex items-center justify-between p-3 rounded-lg ${
                                        isChristmasMode ? 'bg-white/5' : 'bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={`font-medium ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
                                            {memberNameMap.get(exclusion.memberId1) || '(削除済み)'}
                                        </span>
                                        <span className={isChristmasMode ? 'text-[#d4af37]/60' : 'text-gray-400'}>×</span>
                                        <span className={`font-medium ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
                                            {memberNameMap.get(exclusion.memberId2) || '(削除済み)'}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(exclusion.id)}
                                        disabled={isLoading}
                                        isChristmasMode={isChristmasMode}
                                        className={`!p-1.5 !min-h-0 ${
                                            isChristmasMode
                                                ? '!text-red-400 hover:!text-red-300 hover:!bg-red-500/10'
                                                : '!text-red-500 hover:!text-red-700 hover:!bg-red-50'
                                        }`}
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
