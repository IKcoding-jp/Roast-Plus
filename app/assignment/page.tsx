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
    createShuffleHistory, fetchRecentShuffleHistory,
    addMember, deleteMember, updateMember,
    addTaskLabel, deleteTaskLabel, updateTaskLabel,
    addTeam, deleteTeam, updateTeam, updateTableSettings
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

    // シャッフルボタンの有効/無効判定
    // 開発者モードに関わらず、1日何回でもシャッフル可能
    const isShuffleDisabled = useMemo(() => {
        // 日付が取得できていない場合は無効
        if (!todayDate) return true;

        // 常に有効
        return false;
    }, [todayDate]);

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
            setIsMasterLoaded(true);
        };
        loadMasterData();
    }, []);

    // 日付変更時の割り当て継承
    useEffect(() => {
        const initializeTodayAssignment = async () => {
            // 読み込み完了後、今日のデータが存在しない場合のみ実行
            if (isAssignmentLoaded && !assignmentDay && todayDate) {
                try {
                    // 直近7日間の履歴を取得
                    const recent = await fetchRecentAssignments(todayDate, 7);

                    // 最も新しいものを選択
                    const latest = recent.length > 0 ? recent[0] : null;

                    if (latest && latest.assignments) {
                        // 過去の割り当てをコピーして今日の日付で保存
                        const newAssignments = latest.assignments.map(a => ({
                            ...a,
                            assignedDate: todayDate
                        }));
                        await updateAssignmentDay(todayDate, newAssignments);
                    } else {
                        // No previous assignment found within 7 days.
                    }
                } catch (error) {
                    console.error("Failed to inherit previous assignment:", error);
                }
            }
        };
        initializeTodayAssignment();
    }, [isAssignmentLoaded, assignmentDay, todayDate]);

    // リアルタイム監視
    useEffect(() => {
        if (!todayDate) return;

        const unsubAssignment = subscribeAssignmentDay(todayDate, (data) => {
            setAssignmentDay(data);
            setIsAssignmentLoaded(true);
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
                        // ローカル実行中でなければ非表示にする
                        // (ローカル実行中は isLocalShuffling が false になるまで表示し続けるため、ここでは消さない)
                        if (!isLocalShuffling) {
                            // setIsRouletteVisible(false); // ここで消すとローカルと競合する可能性があるので、useEffectの依存配列で制御する方が安全だが、
                            // 今回は isLocalShuffling があるので、そちらを優先するロジックにする
                        }
                    }, remaining);
                }
            } else {
                // setIsRouletteVisible(false); // ここも同様
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
    }, [todayDate]); // isLocalShuffling を依存配列に入れるとループする可能性があるので入れない

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
    const isWeekend = useMemo(() => {
        if (!todayDate) return false;
        const day = new Date(todayDate).getDay();
        return day === 0 || day === 6;
    }, [todayDate]);

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
