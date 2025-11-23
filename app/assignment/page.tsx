'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Team, Member, TaskLabel, Assignment, AssignmentDay, ShuffleEvent, TableSettings
} from '@/types';
import {
    fetchTeams, fetchMembers, fetchTaskLabels,
    subscribeAssignmentDay, subscribeShuffleEvent, subscribeTableSettings,
    updateAssignmentDay, createShuffleEvent, updateShuffleEventState,
    updateMemberExclusions, fetchRecentAssignments,
    addMember, deleteMember, updateMember,
    addTaskLabel, deleteTaskLabel, updateTaskLabel,
    addTeam, deleteTeam, updateTeam, updateTableSettings
} from './lib/firebase';
import { calculateAssignment } from './lib/shuffle';
import { AssignmentTable } from './components/AssignmentTable';
import { RouletteOverlay } from './components/RouletteOverlay';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { IoArrowBack } from "react-icons/io5";
import { PiShuffleBold } from "react-icons/pi";
import { useDeveloperMode } from '@/hooks/useDeveloperMode';

export default function AssignmentPage() {
    const router = useRouter();
    const { isEnabled: isDeveloperMode } = useDeveloperMode();

    // マスタデータ
    const [teams, setTeams] = useState<Team[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [taskLabels, setTaskLabels] = useState<TaskLabel[]>([]);
    const [tableSettings, setTableSettings] = useState<TableSettings | null>(null);

    // 状態
    const [todayDate, setTodayDate] = useState<string>("");
    const [assignmentDay, setAssignmentDay] = useState<AssignmentDay | null>(null);
    const [shuffleEvent, setShuffleEvent] = useState<ShuffleEvent | null>(null);
    const [isRouletteVisible, setIsRouletteVisible] = useState(false);

    // シャッフルボタンの有効/無効判定
    const isShuffleDisabled = useMemo(() => {
        // 開発者モードなら常に有効
        if (isDeveloperMode) return false;

        // 日付が取得できていない場合は無効
        if (!todayDate) return true;

        // 土日判定 (0=日曜, 6=土曜)
        const date = new Date();
        const day = date.getDay();
        const isWeekend = day === 0 || day === 6;
        if (isWeekend) return true;

        // 既に割り当てがあるか判定
        // assignmentDay.assignments の中に memberId が null でないものがあるか
        if (assignmentDay?.assignments?.some(a => a.memberId !== null)) {
            return true;
        }

        return false;
    }, [isDeveloperMode, todayDate, assignmentDay]);

    // 初期化: 日付とマスタデータ
    useEffect(() => {
        // JSTで今日の日付を取得
        const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" });
        setTodayDate(date);

        const loadMasterData = async () => {
            const [t, m, l] = await Promise.all([
                fetchTeams(),
                fetchMembers(),
                fetchTaskLabels()
            ]);
            setTeams(t);
            setMembers(m);
            setTaskLabels(l);
        };
        loadMasterData();
    }, []);

    // リアルタイム監視
    useEffect(() => {
        if (!todayDate) return;

        const unsubAssignment = subscribeAssignmentDay(todayDate, (data) => {
            setAssignmentDay(data);
        });

        const unsubShuffle = subscribeShuffleEvent(todayDate, (event) => {
            setShuffleEvent(event);

            if (event && event.state === 'running') {
                // 演出開始判定
                // 現在時刻と開始時刻を比較して、まだ演出期間内なら表示
                const now = Date.now();
                
                // startedAtがnullの場合（書き込み直後のレイテンシなど）は演出しない、または少し待つ
                if (!event.startedAt) return;

                const startTime = event.startedAt.toMillis();
                const endTime = startTime + event.durationMs;

                if (now < endTime) {
                    setIsRouletteVisible(true);
                    // 終了時刻に非表示にするタイマー
                    const remaining = endTime - now;
                    setTimeout(() => {
                        setIsRouletteVisible(false);
                    }, remaining);
                }
            } else {
                setIsRouletteVisible(false);
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
    }, [todayDate]);

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
    const isWeekend = useMemo(() => {
        if (!todayDate) return false;
        const day = new Date(todayDate).getDay();
        return day === 0 || day === 6;
    }, [todayDate]);

    // シャッフル実行 (リーダー機能)
    const handleShuffle = async () => {
        if (!todayDate) return;

        if (!confirm("担当をシャッフルしますか？\n現在の配置は上書きされます。")) return;

        try {
            // 1. 履歴取得 (過去7日分)
            const history = await fetchRecentAssignments(todayDate, 7);

            // 2. 計算
            const result = calculateAssignment(teams, taskLabels, members, history, todayDate, displayAssignments);

            // 3. イベント発行
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

            // 4. 演出終了待ち (リーダー側で結果を確定させる役割)
            setTimeout(async () => {
                // 結果を保存
                await updateAssignmentDay(todayDate, result);
                // イベント完了
                await updateShuffleEventState(todayDate, 'done');
            }, durationMs + 500); // 少し余裕を持たせる

        } catch (e) {
            console.error(e);
            alert("シャッフルに失敗しました");
        }
    };

    // 手動編集: メンバー変更
    const handleUpdateMember = async (targetAsg: Assignment, memberId: string | null) => {
        if (!todayDate) return;

        const newAssignments = [...displayAssignments];
        const idx = newAssignments.findIndex(a => a.teamId === targetAsg.teamId && a.taskLabelId === targetAsg.taskLabelId);

        if (idx === -1) {
            // まだ存在しない場合（初期状態など）は追加
            newAssignments.push({ ...targetAsg, memberId, assignedDate: todayDate });
        } else {
            newAssignments[idx] = { ...newAssignments[idx], memberId };
        }

        await updateAssignmentDay(todayDate, newAssignments);
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

    // 割り当てスワップ
    const handleSwapAssignments = async (asg1: { teamId: string, taskLabelId: string }, asg2: { teamId: string, taskLabelId: string }) => {
        if (!todayDate) return;

        const updatedAssignments = [...displayAssignments];
        
        const findIndex = (tId: string, lId: string) => updatedAssignments.findIndex(a => a.teamId === tId && a.taskLabelId === lId);
        
        let index1 = findIndex(asg1.teamId, asg1.taskLabelId);
        let index2 = findIndex(asg2.teamId, asg2.taskLabelId);
        
        const mem1 = index1 !== -1 ? updatedAssignments[index1].memberId : null;
        const mem2 = index2 !== -1 ? updatedAssignments[index2].memberId : null;

        // swap logic
        
        // 1. Update asg1 position with mem2
        if (index1 !== -1) {
            updatedAssignments[index1] = { ...updatedAssignments[index1], memberId: mem2 };
        } else {
            updatedAssignments.push({ teamId: asg1.teamId, taskLabelId: asg1.taskLabelId, memberId: mem2, assignedDate: todayDate });
            // index2 might be invalidated if it was -1, but if it was -1, we use findIndex again or push logic handles it.
        }

        // 2. Update asg2 position with mem1
        // Re-find index2 in case it was -1 and we want to be safe, or if array changed significantly (though push is at end)
        index2 = findIndex(asg2.teamId, asg2.taskLabelId);
        
        if (index2 !== -1) {
            updatedAssignments[index2] = { ...updatedAssignments[index2], memberId: mem1 };
        } else {
            updatedAssignments.push({ teamId: asg2.teamId, taskLabelId: asg2.taskLabelId, memberId: mem1, assignedDate: todayDate });
        }
        
        await updateAssignmentDay(todayDate, updatedAssignments);
    };

    return (
        <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
            {/* ヘッダー */}
            <header className="bg-white shadow-sm sticky top-0 z-30 flex-shrink-0">
                <div className="w-full px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
                            <IoArrowBack size={24} />
                        </button>
                        <h1 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span>{todayDate}</span>
                            <span className="text-sm font-normal text-gray-500">の担当表</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShuffle}
                            disabled={isShuffleDisabled}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-md transition-colors z-50 relative ${
                                isShuffleDisabled
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
