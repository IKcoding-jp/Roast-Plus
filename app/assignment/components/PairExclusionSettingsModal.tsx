'use client';

import { useState, useMemo, useEffect } from 'react';
import { HiX, HiTrash } from 'react-icons/hi';
import type { Member, PairExclusion } from '@/types';

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

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">
                        ペア除外設定
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                        aria-label="閉じる"
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                {/* 説明文 */}
                <p className="text-sm text-gray-600 mb-4">
                    シャッフル時に同じ行（タスク）に配置しないメンバーの組み合わせを設定します。
                </p>

                {/* 追加フォーム */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                メンバー1
                            </label>
                            <select
                                value={memberId1}
                                onChange={(e) => setMemberId1(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 text-sm"
                                disabled={isLoading}
                            >
                                <option value="">選択...</option>
                                {activeMembers.map(member => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                メンバー2
                            </label>
                            <select
                                value={memberId2}
                                onChange={(e) => setMemberId2(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 text-sm"
                                disabled={isLoading}
                            >
                                <option value="">選択...</option>
                                {activeMembers.map(member => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-600 text-sm mb-3">{error}</p>
                    )}

                    <button
                        onClick={handleAdd}
                        disabled={isLoading || !memberId1 || !memberId2}
                        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {isLoading ? '追加中...' : '追加'}
                    </button>
                </div>

                {/* 既存の設定リスト */}
                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                        設定済みのペア ({pairExclusions.length}件)
                    </h3>

                    {pairExclusions.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            設定がありません
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {pairExclusions.map(exclusion => (
                                <li
                                    key={exclusion.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-gray-800">
                                            {memberNameMap.get(exclusion.memberId1) || '(削除済み)'}
                                        </span>
                                        <span className="text-gray-400">×</span>
                                        <span className="font-medium text-gray-800">
                                            {memberNameMap.get(exclusion.memberId2) || '(削除済み)'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(exclusion.id)}
                                        disabled={isLoading}
                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                        aria-label="削除"
                                    >
                                        <HiTrash className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
