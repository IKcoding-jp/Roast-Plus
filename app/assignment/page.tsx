'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AssignmentTable } from './components/assignment-table';
import { RouletteOverlay } from './components/RouletteOverlay';
import { ManagerDialog } from './components/ManagerDialog';
import { PairExclusionSettingsModal } from './components/PairExclusionSettingsModal';
import { Loading } from '@/components/Loading';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { useAuth } from '@/lib/auth';
import { setManager, deleteManager, addPairExclusion, deletePairExclusion } from './lib/firebase';
import { useAssignmentData, useShuffleExecution, useAssignmentHandlers } from './hooks';
import { IoArrowBack } from "react-icons/io5";
import { FaUsers, FaUserTie } from "react-icons/fa";
import { HiPlus, HiCog } from "react-icons/hi";
import { Button } from '@/components/ui';
import { useChristmasMode } from '@/hooks/useChristmasMode';

export default function AssignmentPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const userId = user?.uid ?? null;
    const { isEnabled: isDeveloperMode } = useDeveloperMode();
    const { isChristmasMode } = useChristmasMode();

    // 管理者ダイアログ
    const [isManagerDialogOpen, setIsManagerDialogOpen] = useState(false);
    // ペア除外設定
    const [isPairExclusionModalOpen, setIsPairExclusionModalOpen] = useState(false);

    const data = useAssignmentData(userId, authLoading);

    const { handleShuffle } = useShuffleExecution({
        userId,
        teams: data.teams,
        taskLabels: data.taskLabels,
        members: data.members,
        pairExclusions: data.pairExclusions,
        activeDate: data.activeDate,
        displayAssignments: data.displayAssignments,
        setTodayDate: data.setTodayDate,
        setActiveDate: data.setActiveDate,
        setIsLocalShuffling: data.setIsLocalShuffling,
        setMembers: data.setMembers,
    });

    const handlers = useAssignmentHandlers({
        userId,
        activeDate: data.activeDate,
        todayDate: data.todayDate,
        members: data.members,
        setMembers: data.setMembers,
        setTeams: data.setTeams,
        setTaskLabels: data.setTaskLabels,
    });

    if (data.isLoading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
            {/* ヘッダー */}
            <header className="bg-white shadow-sm sticky top-0 z-30 flex-shrink-0">
                <div className="w-full px-4 h-16 relative flex items-center justify-center">
                    {/* 左側: 戻るボタン */}
                    <div className="absolute left-4 flex items-center z-10">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="!text-gray-600 hover:!text-gray-900 !p-2 -ml-2"
                        >
                            <IoArrowBack size={24} />
                        </Button>
                    </div>

                    {/* 中央: 見出し */}
                    <div className="flex items-center justify-center z-0">
                        <div className="flex items-center gap-2">
                            <FaUsers className="text-primary w-6 h-6 md:w-7 md:h-7" />
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                                担当表
                            </h1>
                        </div>
                    </div>

                    {/* 右側: 設定ボタン */}
                    <div className="absolute right-4 flex items-center gap-2 z-10">
                        {isDeveloperMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsPairExclusionModalOpen(true)}
                                className="!rounded-full !px-3 !py-2 shadow-md !bg-white !text-gray-700 hover:!bg-gray-100 !border !border-gray-300"
                                title="ペア除外設定"
                            >
                                <HiCog className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full px-2 md:px-4 py-4 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
                <AssignmentTable
                    teams={data.teams}
                    taskLabels={data.taskLabels}
                    assignments={data.displayAssignments}
                    members={data.members}
                    tableSettings={data.tableSettings}
                    onUpdateTableSettings={handlers.handleUpdateTableSettings}
                    onUpdateMember={handlers.handleUpdateMember}
                    onUpdateMemberName={handlers.handleUpdateMemberName}
                    onUpdateMemberExclusion={handlers.handleUpdateMemberExclusion}
                    onSwapAssignments={handlers.handleSwapAssignments}
                    onShuffle={handleShuffle}
                    isShuffleDisabled={data.isShuffleDisabled}
                    onAddMember={handlers.handleAddMember}
                    onDeleteMember={handlers.handleDeleteMember}
                    onUpdateTaskLabel={handlers.handleUpdateTaskLabel}
                    onAddTaskLabel={handlers.handleAddTaskLabel}
                    onDeleteTaskLabel={handlers.handleDeleteTaskLabel}
                    onAddTeam={handlers.handleAddTeam}
                    onDeleteTeam={handlers.handleDeleteTeam}
                    onUpdateTeam={handlers.handleUpdateTeam}
                    isChristmasMode={isChristmasMode}
                />
            </main>

            <RouletteOverlay
                isVisible={data.isRouletteVisible}
                members={data.members}
            />

            {/* 管理者バッジ（右下固定） */}
            <div className="fixed bottom-6 right-6 z-20">
                <Button
                    variant={data.manager ? 'outline' : 'primary'}
                    size="md"
                    onClick={() => setIsManagerDialogOpen(true)}
                    isChristmasMode={isChristmasMode}
                    className={`!flex !items-center !gap-2 !px-4 !py-3 !rounded-lg shadow-lg ${
                        data.manager && !isChristmasMode ? '!bg-white hover:!bg-gray-50 !border-gray-200' : ''
                    }`}
                >
                    {data.manager ? (
                        <>
                            <FaUserTie className={`w-5 h-5 ${isChristmasMode ? 'text-[#d4af37]' : 'text-primary'}`} />
                            <div className="text-left">
                                <div className={`text-sm font-semibold ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>{data.manager.name}</div>
                                <div className={`text-xs ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-500'}`}>管理者</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <HiPlus className="w-5 h-5" />
                            <span className="font-medium">管理者</span>
                        </>
                    )}
                </Button>
            </div>

            {/* 管理者編集ダイアログ */}
            <ManagerDialog
                isOpen={isManagerDialogOpen}
                manager={data.manager}
                onClose={() => setIsManagerDialogOpen(false)}
                onSave={async (name: string) => {
                    if (!userId) return;
                    await setManager(userId, name);
                    data.setManagerState({ id: 'default', name });
                }}
                onDelete={async () => {
                    if (!userId) return;
                    await deleteManager(userId);
                    data.setManagerState(null);
                }}
                isChristmasMode={isChristmasMode}
            />

            {/* ペア除外設定モーダル */}
            <PairExclusionSettingsModal
                isOpen={isPairExclusionModalOpen}
                members={data.members}
                pairExclusions={data.pairExclusions}
                onClose={() => setIsPairExclusionModalOpen(false)}
                onAdd={async (memberId1: string, memberId2: string) => {
                    if (!userId) return;
                    await addPairExclusion(userId, memberId1, memberId2);
                }}
                onDelete={async (exclusionId: string) => {
                    if (!userId) return;
                    await deletePairExclusion(userId, exclusionId);
                }}
                isChristmasMode={isChristmasMode}
            />
        </div>
    );
}
