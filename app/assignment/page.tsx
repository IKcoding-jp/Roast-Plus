'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Team, Member, TaskLabel, Assignment, AssignmentDay, ShuffleEvent, TableSettings
} from '@/types';
import {
    fetchTeams, fetchMembers, fetchTaskLabels,
    subscribeAssignmentDay, subscribeShuffleEvent, subscribeTableSettings,
    updateAssignmentDay, createShuffleEvent, updateShuffleEventState,
    updateMemberExclusions, fetchRecentAssignments,
    createShuffleHistory, fetchRecentShuffleHistory,
    addMember, deleteMember, updateMember,
    addTaskLabel, deleteTaskLabel, updateTaskLabel,
    addTeam, deleteTeam, updateTeam, updateTableSettings,
    mutateAssignmentDay, getServerTodayDate
} from './lib/firebase';
import { calculateAssignment } from '@/app/assignment/lib/shuffle';
import { AssignmentTable } from './components/AssignmentTable';
import { RouletteOverlay } from './components/RouletteOverlay';
import { Loading } from '@/components/Loading';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { IoArrowBack } from "react-icons/io5";
import { PiShuffleBold } from "react-icons/pi";
import { FaUsers } from "react-icons/fa";

export default function AssignmentPage() {
    const router = useRouter();

    // マスタデータ
    const [teams, setTeams] = useState<Team[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [taskLabels, setTaskLabels] = useState<TaskLabel[]>([]);
    const [tableSettings, setTableSettings] = useState<TableSettings | null>(null);

    // ロード状態
    const [isMasterLoaded, setIsMasterLoaded] = useState(false);
    const [isAssignmentLoaded, setIsAssignmentLoaded] = useState(false);

    // 状態
    const [todayDate, setTodayDate] = useState<string>("");
    const [assignmentDay, setAssignmentDay] = useState<AssignmentDay | null>(null);
    const [shuffleEvent, setShuffleEvent] = useState<ShuffleEvent | null>(null);
    const [isRouletteVisible, setIsRouletteVisible] = useState(false);
    // ローカルでのシャッフル実行中フラグ (自分自身のアニメーション用)
    const [isLocalShuffling, setIsLocalShuffling] = useState(false);

    // ???????????/????
    // ???????????1????????????
    const isShuffleDisabled = useMemo(() => {
        if (!todayDate) return true;
        return false;
    }, [todayDate]);

    // ??? ?????????
    useEffect(() => {
        let cancelled = false;

        const bootstrap = async () => {
            const date = await getServerTodayDate();
            if (!cancelled) {
                setTodayDate(date);
            }

            const [t, m, l] = await Promise.all([
                fetchTeams(),
                fetchMembers(),
                fetchTaskLabels()
            ]);

            if (cancelled) return;

            setTeams(t);
            setMembers(m);
            setTaskLabels(l);
            setIsMasterLoaded(true);
        };

        bootstrap();

        return () => { cancelled = true; };
    }, []);

    // ??????????????????????????????
    useEffect(() => {
        const initializeTodayAssignment = async () => {
            if (!isAssignmentLoaded || assignmentDay || !todayDate || !isMasterLoaded) return;

            try {
                const recent = await fetchRecentAssignments(todayDate, 7);
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

                await mutateAssignmentDay(todayDate, (current) => {
                    if (current && current.length > 0) return current;
                    return fallbackAssignments;
                });
            } catch (error) {
                console.error("Failed to inherit previous assignment:", error);
            }
        };
        initializeTodayAssignment();
    }, [isAssignmentLoaded, assignmentDay, todayDate, isMasterLoaded, teams, taskLabels]);

    // ?????????Firestore????????????
    useEffect(() => {
        if (!todayDate) return;

        const unsubAssignment = subscribeAssignmentDay(todayDate, (data) => {
            setAssignmentDay(data);
            setIsAssignmentLoaded(true);
        });

        const unsubShuffle = subscribeShuffleEvent(todayDate, (event) => {
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

        const unsubSettings = subscribeTableSettings((settings) => {
            setTableSettings(settings);
        });

        return () => {
            unsubAssignment();
            unsubShuffle();
            unsubSettings();
        };
        // isLocalShuffling ??????????????? todayDate ??
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [todayDate]);


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
                initial.push({ teamId: team.id, taskLabelId: task.id, memberId: null, assignedDate: todayDate || '' });
            });
        });
        return initial;
    }, [assignmentDay, teams, taskLabels, todayDate]);

    // 土日チェック

    // シャッフル実行 (リーダー機能)
    const handleShuffle = async () => {
        if (!todayDate) return;

        setIsLocalShuffling(true);

        try {
            // 1. シャッフル履歴取得 (最新2件)
            const shuffleHistoryList = await fetchRecentShuffleHistory(2);
            
            // 履歴をAssignment[][]形式に変換
            const history: Assignment[][] = shuffleHistoryList.map(h => h.assignments);

            // 2. 計算
            const result = calculateAssignment(teams, taskLabels, members, history, todayDate, displayAssignments);

            // 3. イベント発行 (他クライアント用)
            const eventId = uuidv4();
            const durationMs = 3000;

            await createShuffleEvent({
                date: todayDate,
                eventId,
                startedAt: serverTimestamp() as Timestamp,
                durationMs,
                resultAssignments: result,
                state: 'running'
            });

            // 4. 演出待機 (awaitで確実に待つ)
            await new Promise(resolve => setTimeout(resolve, durationMs));

            // 5. 結果を保存
            await updateAssignmentDay(todayDate, result);

            // 6. シャッフル履歴を保存
            const historyId = uuidv4();
            await createShuffleHistory({
                id: historyId,
                assignments: result,
                targetDate: todayDate,
            });

            // 7. イベント完了
            await updateShuffleEventState(todayDate, 'done');

        } catch (e) {
            console.error(e);
            alert("シャッフルに失敗しました");
        } finally {
            setIsLocalShuffling(false);
        }
    };

    // ????: ???????????????????????
    const handleUpdateMember = async (targetAsg: Assignment, memberId: string | null) => {
        if (!todayDate) return;

        await mutateAssignmentDay(todayDate, (current) => {
            const map = new Map<string, Assignment>();
            current.forEach(a => {
                map.set(`${a.teamId}__${a.taskLabelId}`, { ...a, assignedDate: todayDate });
            });

            map.set(`${targetAsg.teamId}__${targetAsg.taskLabelId}`, {
                teamId: targetAsg.teamId,
                taskLabelId: targetAsg.taskLabelId,
                memberId,
                assignedDate: todayDate,
            });

            return Array.from(map.values());
        });
    };

    // メンバー名変更
    const handleUpdateMemberName = async (memberId: string, name: string) => {
        const member = members.find(m => m.id === memberId);
        if (member) {
            const updated = { ...member, name };
            await updateMember(updated);
            setMembers(prev => prev.map(m => m.id === memberId ? updated : m));
        }
    };

    // 除外設定変更
    const handleUpdateMemberExclusion = async (memberId: string, taskLabelId: string, isExcluded: boolean) => {
        const member = members.find(m => m.id === memberId);
        if (member) {
            let newExclusions = [...member.excludedTaskLabelIds];
            if (isExcluded) {
                if (!newExclusions.includes(taskLabelId)) newExclusions.push(taskLabelId);
            } else {
                newExclusions = newExclusions.filter(id => id !== taskLabelId);
            }
            await updateMemberExclusions(memberId, newExclusions);
            // ローカル更新
            setMembers(prev => prev.map(m => m.id === memberId ? { ...m, excludedTaskLabelIds: newExclusions } : m));
        }
    };

    // ???????????????????????
    const handleSwapAssignments = async (asg1: { teamId: string, taskLabelId: string }, asg2: { teamId: string, taskLabelId: string }) => {
        if (!todayDate) return;

        await mutateAssignmentDay(todayDate, (current) => {
            const map = new Map<string, Assignment>();
            current.forEach(a => {
                map.set(`${a.teamId}__${a.taskLabelId}`, { ...a, assignedDate: todayDate });
            });

            const mem1 = map.get(`${asg1.teamId}__${asg1.taskLabelId}`)?.memberId ?? null;
            const mem2 = map.get(`${asg2.teamId}__${asg2.taskLabelId}`)?.memberId ?? null;

            map.set(`${asg1.teamId}__${asg1.taskLabelId}`, {
                teamId: asg1.teamId,
                taskLabelId: asg1.taskLabelId,
                memberId: mem2,
                assignedDate: todayDate,
            });

            map.set(`${asg2.teamId}__${asg2.taskLabelId}`, {
                teamId: asg2.teamId,
                taskLabelId: asg2.taskLabelId,
                memberId: mem1,
                assignedDate: todayDate,
            });

            return Array.from(map.values());
        });
    };

    const isLoading = !isMasterLoaded || !isAssignmentLoaded;

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
                    onUpdateTableSettings={updateTableSettings}
                    onUpdateMember={handleUpdateMember}
                    onUpdateMemberName={handleUpdateMemberName}
                    onUpdateMemberExclusion={handleUpdateMemberExclusion}
                    onSwapAssignments={handleSwapAssignments}
                    onAddMember={async (member) => {
                        await addMember(member);
                        setMembers(prev => [...prev, member]);
                    }}
                    onDeleteMember={async (memberId) => {
                        await deleteMember(memberId, todayDate);
                        setMembers(prev => prev.filter(m => m.id !== memberId));
                    }}
                    onUpdateTaskLabel={async (label) => {
                        await updateTaskLabel(label);
                        setTaskLabels(prev => prev.map(l => l.id === label.id ? label : l));
                    }}
                    onAddTaskLabel={async (label) => {
                        await addTaskLabel(label);
                        setTaskLabels(prev => [...prev, label]);
                    }}
                    onDeleteTaskLabel={async (labelId) => {
                        await deleteTaskLabel(labelId);
                        setTaskLabels(prev => prev.filter(l => l.id !== labelId));
                    }}
                    onAddTeam={async (team) => {
                        await addTeam(team);
                        setTeams(prev => [...prev, team]);
                    }}
                    onDeleteTeam={async (teamId) => {
                        await deleteTeam(teamId);
                        setTeams(prev => prev.filter(t => t.id !== teamId));
                    }}
                    onUpdateTeam={async (team) => {
                        await updateTeam(team);
                        setTeams(prev => prev.map(t => t.id === team.id ? team : t));
                    }}
                />
            </main>

            <RouletteOverlay
                isVisible={isRouletteVisible}
                members={members}
            />
        </div>
    );
}
