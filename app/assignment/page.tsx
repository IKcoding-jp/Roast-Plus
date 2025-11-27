'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Team, Member, TaskLabel, Assignment, AssignmentDay, ShuffleEvent, TableSettings, Manager
} from '@/types';
import {
    fetchTeams, fetchMembers, fetchTaskLabels,
    subscribeLatestAssignmentDay, subscribeShuffleEvent, subscribeTableSettings,
    updateAssignmentDay, createShuffleEvent, updateShuffleEventState,
    updateMemberExclusions, fetchRecentAssignments,
    createShuffleHistory, fetchRecentShuffleHistory,
    addMember, deleteMember, updateMember, updateMemberTeam,
    addTaskLabel, deleteTaskLabel, updateTaskLabel,
    addTeam, deleteTeam, updateTeam, updateTableSettings,
    mutateAssignmentDay, getServerTodayDate,
    subscribeManager, setManager, deleteManager
} from './lib/firebase';
import { calculateAssignment } from '@/app/assignment/lib/shuffle';
import { AssignmentTable } from './components/AssignmentTable';
import { RouletteOverlay } from './components/RouletteOverlay';
import { ManagerDialog } from './components/ManagerDialog';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/lib/auth';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { IoArrowBack } from "react-icons/io5";
import { PiShuffleBold } from "react-icons/pi";
import { FaUsers, FaUserTie } from "react-icons/fa";
import { HiPlus } from "react-icons/hi";

export default function AssignmentPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const userId = user?.uid ?? null;

    // マスタデータ
    const [teams, setTeams] = useState<Team[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [taskLabels, setTaskLabels] = useState<TaskLabel[]>([]);
    const [tableSettings, setTableSettings] = useState<TableSettings | null>(null);
    const [manager, setManagerState] = useState<Manager | null>(null);

    // ロード状態
    const [isMasterLoaded, setIsMasterLoaded] = useState(false);
    const [isAssignmentLoaded, setIsAssignmentLoaded] = useState(false);

    // 管理者ダイアログ
    const [isManagerDialogOpen, setIsManagerDialogOpen] = useState(false);

    // 状態
    const [todayDate, setTodayDate] = useState<string>("");
    const [activeDate, setActiveDate] = useState<string>("");
    const [assignmentDay, setAssignmentDay] = useState<AssignmentDay | null>(null);
    const [shuffleEvent, setShuffleEvent] = useState<ShuffleEvent | null>(null);
    const [isRouletteVisible, setIsRouletteVisible] = useState(false);
    // ローカルでのシャッフル実行中フラグ (自分自身のアニメーション用)
    const [isLocalShuffling, setIsLocalShuffling] = useState(false);

    // シャッフル許可判定
    const isShuffleDisabled = useMemo(() => {
        if (!isMasterLoaded || !isAssignmentLoaded) return true;
        if (!activeDate && !todayDate) return true;
        return false;
    }, [isMasterLoaded, isAssignmentLoaded, activeDate, todayDate]);

    // マスタデータの取得
    useEffect(() => {
        if (!userId || authLoading) return;

        let cancelled = false;

        const bootstrap = async () => {
            const date = await getServerTodayDate();
            if (!cancelled) {
                setTodayDate(date);
            }

            const [t, m, l] = await Promise.all([
                fetchTeams(userId),
                fetchMembers(userId),
                fetchTaskLabels(userId)
            ]);

            if (cancelled) return;

            setTeams(t);
            setMembers(m);
            setTaskLabels(l);
            setIsMasterLoaded(true);
        };

        bootstrap();

        return () => { cancelled = true; };
    }, [userId, authLoading]);

    // 今日の担当表の初期化
    useEffect(() => {
        if (!userId || authLoading) return;

        const initializeTodayAssignment = async () => {
            if (!isAssignmentLoaded || assignmentDay || !todayDate || !isMasterLoaded) return;

            try {
                const recent = await fetchRecentAssignments(userId, todayDate, 7);
                const latest = recent.sort((a, b) => b.date.localeCompare(a.date))[0];

                const defaultAssignments = teams.flatMap(team =>
                    taskLabels.map(task => ({
                        teamId: team.id,
                        taskLabelId: task.id,
                        memberId: null,
                        assignedDate: todayDate,
                    }))
                );

                const fallbackAssignments = latest?.assignments?.map(a => ({
                    ...a,
                    assignedDate: todayDate,
                })) ?? defaultAssignments;

                await mutateAssignmentDay(userId, todayDate, (current) => {
                    if (current && current.length > 0) return current;
                    return fallbackAssignments;
                });
            } catch (error) {
                console.error("Failed to inherit previous assignment:", error);
            }
        };
        initializeTodayAssignment();
    }, [userId, authLoading, isAssignmentLoaded, assignmentDay, todayDate, isMasterLoaded, teams, taskLabels]);

    // Firestore購読: 最新スナップショット + テーブル設定 + 管理者
    useEffect(() => {
        if (!userId || authLoading) return;

        const unsubAssignment = subscribeLatestAssignmentDay(userId, (data) => {
            setAssignmentDay(data);
            setActiveDate(data?.date ?? "");
            setIsAssignmentLoaded(true);
        });

        const unsubSettings = subscribeTableSettings(userId, (settings) => {
            setTableSettings(settings);
        });

        const unsubManager = subscribeManager(userId, (managerData) => {
            setManagerState(managerData);
        });

        return () => {
            unsubAssignment();
            unsubSettings();
            unsubManager();
        };
    }, [userId, authLoading]);

    // Firestore購読: シャッフルイベント（現在のアクティブ日付）
    useEffect(() => {
        if (!userId || authLoading || !activeDate) return;

        const unsubShuffle = subscribeShuffleEvent(userId, activeDate, (event) => {
            setShuffleEvent(event);

            if (event && event.state === 'running') {
                const now = Date.now();
                if (!event.startedAt) return;

                const startTime = event.startedAt.toMillis();
                const endTime = startTime + event.durationMs;

                if (now < endTime) {
                    setIsRouletteVisible(true);
                    const remaining = endTime - now;
                    setTimeout(() => {
                        if (!isLocalShuffling) {
                            // overlay is controlled by event + local flag
                        }
                    }, remaining);
                }
            } else {
                // setIsRouletteVisible(false);
            }
        });

        return () => {
            unsubShuffle();
        };
    }, [userId, authLoading, activeDate, isLocalShuffling]);


    // アニメーション表示制御
    useEffect(() => {
        if (isLocalShuffling) {
            setIsRouletteVisible(true);
        } else {
            // ローカル実行が終わったら、イベントの状態を見て非表示にするか決める
            // ただし、イベント購読側で制御しているので、ここでは「ローカルが終わったら即非表示」ではなく
            // イベント側にお任せする形でも良いが、確実に消すためにチェックする
            if (shuffleEvent?.state !== 'running') {
                setIsRouletteVisible(false);
            }
        }
    }, [isLocalShuffling, shuffleEvent]);

    // 表示用Assignments (データがない場合は空枠を表示)
    const displayAssignments = useMemo(() => {
        if (assignmentDay) return assignmentDay.assignments;

        // データがない場合の初期表示
        const initial: Assignment[] = [];
        teams.forEach(team => {
            taskLabels.forEach(task => {
                initial.push({
                    teamId: team.id,
                    taskLabelId: task.id,
                    memberId: null,
                    assignedDate: activeDate || todayDate || ''
                });
            });
        });
        return initial;
    }, [assignmentDay, teams, taskLabels, todayDate, activeDate]);

    // 土日チェック

    // シャッフル実行 (リーダー機能)
    const handleShuffle = async () => {
        if (!userId) return;

        setIsLocalShuffling(true);

        try {
            const serverToday = await getServerTodayDate();
            setTodayDate(serverToday);

            const targetDate = activeDate && activeDate === serverToday ? activeDate : serverToday;
            setActiveDate(targetDate);

            // 1. Load recent shuffle history (latest 2)
            const shuffleHistoryList = await fetchRecentShuffleHistory(userId, 2);
            const history: Assignment[][] = shuffleHistoryList.map(h => h.assignments);

            // 2. Run calculation
            const result = calculateAssignment(teams, taskLabels, members, history, targetDate, displayAssignments);

            // 3. Broadcast event to other clients
            const eventId = uuidv4();
            const durationMs = 3000;

            await createShuffleEvent(userId, {
                date: targetDate,
                eventId,
                startedAt: serverTimestamp() as Timestamp,
                durationMs,
                resultAssignments: result,
                state: 'running'
            });

            // 4. Wait for animation
            await new Promise(resolve => setTimeout(resolve, durationMs));

            // 5. Persist result
            await updateAssignmentDay(userId, targetDate, result);

            // 6. Persist shuffle history
            const historyId = uuidv4();
            await createShuffleHistory(userId, {
                id: historyId,
                assignments: result,
                targetDate: targetDate,
            });

            // 7. Mark event done
            await updateShuffleEventState(userId, targetDate, 'done');

        } catch (e) {
            console.error(e);
            alert('Shuffle failed');
        } finally {
            setIsLocalShuffling(false);
        }
    };

    // 割り当ての更新
    const handleUpdateMember = async (targetAsg: Assignment, memberId: string | null) => {
        if (!userId || !activeDate) return;

        await mutateAssignmentDay(userId, activeDate, (current) => {
            const map = new Map<string, Assignment>();
            current.forEach(a => {
                map.set(`${a.teamId}__${a.taskLabelId}`, { ...a, assignedDate: activeDate });
            });

            map.set(`${targetAsg.teamId}__${targetAsg.taskLabelId}`, {
                teamId: targetAsg.teamId,
                taskLabelId: targetAsg.taskLabelId,
                memberId,
                assignedDate: activeDate,
            });

            return Array.from(map.values());
        });
    };

    // メンバー名変更
    const handleUpdateMemberName = async (memberId: string, name: string) => {
        if (!userId) return;

        const member = members.find(m => m.id === memberId);
        if (member) {
            const updated = { ...member, name };
            await updateMember(userId, updated);
            setMembers(prev => prev.map(m => m.id === memberId ? updated : m));
        }
    };

    // 除外設定変更
    const handleUpdateMemberExclusion = async (memberId: string, taskLabelId: string, isExcluded: boolean) => {
        if (!userId) return;

        const member = members.find(m => m.id === memberId);
        if (member) {
            let newExclusions = [...member.excludedTaskLabelIds];
            if (isExcluded) {
                if (!newExclusions.includes(taskLabelId)) newExclusions.push(taskLabelId);
            } else {
                newExclusions = newExclusions.filter(id => id !== taskLabelId);
            }
            await updateMemberExclusions(userId, memberId, newExclusions);
            // ローカル更新
            setMembers(prev => prev.map(m => m.id === memberId ? { ...m, excludedTaskLabelIds: newExclusions } : m));
        }
    };

    // 割り当ての入れ替え
    const handleSwapAssignments = async (asg1: { teamId: string, taskLabelId: string }, asg2: { teamId: string, taskLabelId: string }) => {
        if (!userId || !activeDate) return;

        let mem1: string | null = null;
        let mem2: string | null = null;

        const { changed } = await mutateAssignmentDay(userId, activeDate, (current) => {
            const map = new Map<string, Assignment>();
            current.forEach(a => {
                map.set(`${a.teamId}__${a.taskLabelId}`, { ...a, assignedDate: activeDate });
            });

            mem1 = map.get(`${asg1.teamId}__${asg1.taskLabelId}`)?.memberId ?? null;
            mem2 = map.get(`${asg2.teamId}__${asg2.taskLabelId}`)?.memberId ?? null;

            map.set(`${asg1.teamId}__${asg1.taskLabelId}`, {
                teamId: asg1.teamId,
                taskLabelId: asg1.taskLabelId,
                memberId: mem2,
                assignedDate: activeDate,
            });

            map.set(`${asg2.teamId}__${asg2.taskLabelId}`, {
                teamId: asg2.teamId,
                taskLabelId: asg2.taskLabelId,
                memberId: mem1,
                assignedDate: activeDate,
            });

            return Array.from(map.values());
        });

        const isCrossTeamSwap = asg1.teamId !== asg2.teamId;
        if (!changed || !isCrossTeamSwap) return;

        const updates: Promise<void>[] = [];
        const memberUpdates: { id: string, teamId: string }[] = [];

        if (mem1) {
            const currentTeam = members.find(m => m.id === mem1)?.teamId;
            if (currentTeam !== asg2.teamId) {
                updates.push(updateMemberTeam(userId, mem1, asg2.teamId));
                memberUpdates.push({ id: mem1, teamId: asg2.teamId });
            }
        }

        if (mem2) {
            const currentTeam = members.find(m => m.id === mem2)?.teamId;
            if (currentTeam !== asg1.teamId) {
                updates.push(updateMemberTeam(userId, mem2, asg1.teamId));
                memberUpdates.push({ id: mem2, teamId: asg1.teamId });
            }
        }

        if (updates.length > 0) {
            await Promise.all(updates);
            if (memberUpdates.length > 0) {
                setMembers(prev => prev.map(m => {
                    const update = memberUpdates.find(u => u.id === m.id);
                    return update ? { ...m, teamId: update.teamId } : m;
                }));
            }
        }
    };

    const isLoading = authLoading || !userId || !isMasterLoaded || !isAssignmentLoaded;

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
            {/* ヘッダー */}
            <header className="bg-white shadow-sm sticky top-0 z-30 flex-shrink-0">
                <div className="w-full px-4 h-16 relative flex items-center justify-center">
                    {/* 左側: 戻るボタン */}
                    <div className="absolute left-4 flex items-center z-10">
                        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 p-2 -ml-2">
                            <IoArrowBack size={24} />
                        </button>
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

                    {/* 右側: シャッフルボタン */}
                    <div className="absolute right-4 flex items-center z-10">
                        <button
                            onClick={handleShuffle}
                            disabled={isShuffleDisabled}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-md transition-colors ${isShuffleDisabled
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-primary-dark active:scale-95'
                                }`}
                        >
                            <PiShuffleBold />
                            <span className="hidden md:inline">シャッフル</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full px-2 md:px-4 py-4 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
                <AssignmentTable
                    teams={teams}
                    taskLabels={taskLabels}
                    assignments={displayAssignments}
                    members={members}
                    tableSettings={tableSettings}
                    onUpdateTableSettings={async (settings) => {
                        if (!userId) return;
                        await updateTableSettings(userId, settings);
                    }}
                    onUpdateMember={handleUpdateMember}
                    onUpdateMemberName={handleUpdateMemberName}
                    onUpdateMemberExclusion={handleUpdateMemberExclusion}
                    onSwapAssignments={handleSwapAssignments}
                    onAddMember={async (member) => {
                        if (!userId) return;
                        await addMember(userId, member);
                        setMembers(prev => [...prev, member]);
                    }}
                    onDeleteMember={async (memberId) => {
                        if (!userId) return;
                        await deleteMember(userId, memberId, activeDate || todayDate);
                        setMembers(prev => prev.filter(m => m.id !== memberId));
                    }}
                    onUpdateTaskLabel={async (label) => {
                        if (!userId) return;
                        await updateTaskLabel(userId, label);
                        setTaskLabels(prev => prev.map(l => l.id === label.id ? label : l));
                    }}
                    onAddTaskLabel={async (label) => {
                        if (!userId) return;
                        await addTaskLabel(userId, label);
                        setTaskLabels(prev => [...prev, label]);
                    }}
                    onDeleteTaskLabel={async (labelId) => {
                        if (!userId) return;
                        await deleteTaskLabel(userId, labelId);
                        setTaskLabels(prev => prev.filter(l => l.id !== labelId));
                    }}
                    onAddTeam={async (team) => {
                        if (!userId) return;
                        await addTeam(userId, team);
                        setTeams(prev => [...prev, team]);
                    }}
                    onDeleteTeam={async (teamId) => {
                        if (!userId) return;
                        await deleteTeam(userId, teamId);
                        setTeams(prev => prev.filter(t => t.id !== teamId));
                    }}
                    onUpdateTeam={async (team) => {
                        if (!userId) return;
                        await updateTeam(userId, team);
                        setTeams(prev => prev.map(t => t.id === team.id ? team : t));
                    }}
                />
            </main>

            <RouletteOverlay
                isVisible={isRouletteVisible}
                members={members}
            />

            {/* 管理者バッジ（右下固定） */}
            <div className="fixed bottom-6 right-6 z-20">
                <button
                    onClick={() => setIsManagerDialogOpen(true)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all ${
                        manager
                            ? 'bg-white hover:bg-gray-50 border border-gray-200'
                            : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                >
                    {manager ? (
                        <>
                            <FaUserTie className="w-5 h-5 text-primary" />
                            <div className="text-left">
                                <div className="text-sm font-semibold text-gray-800">{manager.name}</div>
                                <div className="text-xs text-gray-500">管理者</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <HiPlus className="w-5 h-5" />
                            <span className="font-medium">管理者</span>
                        </>
                    )}
                </button>
            </div>

            {/* 管理者編集ダイアログ */}
            <ManagerDialog
                isOpen={isManagerDialogOpen}
                manager={manager}
                onClose={() => setIsManagerDialogOpen(false)}
                onSave={async (name: string) => {
                    if (!userId) return;
                    await setManager(userId, name);
                    setManagerState({ id: 'default', name });
                }}
                onDelete={async () => {
                    if (!userId) return;
                    await deleteManager(userId);
                    setManagerState(null);
                }}
            />
        </div>
    );
}
