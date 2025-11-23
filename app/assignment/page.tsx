'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Team, Member, TaskLabel, Assignment, AssignmentDay, ShuffleEvent
} from './types';
import {
    fetchTeams, fetchMembers, fetchTaskLabels,
    subscribeAssignmentDay, subscribeShuffleEvent,
    updateAssignmentDay, createShuffleEvent, updateShuffleEventState,
    updateMemberExclusions, fetchRecentAssignments
} from './lib/firebase';
import { calculateAssignment } from './lib/shuffle';
import { AssignmentTable } from './components/AssignmentTable';
import { MemberSettingsDialog } from './components/MemberSettingsDialog';
import { RouletteOverlay } from './components/RouletteOverlay';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { IoArrowBack } from "react-icons/io5";
import { PiShuffleBold } from "react-icons/pi";

export default function AssignmentPage() {
    const router = useRouter();

    // マスタデータ
    const [teams, setTeams] = useState<Team[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [taskLabels, setTaskLabels] = useState<TaskLabel[]>([]);

    // 状態
    const [todayDate, setTodayDate] = useState<string>("");
    const [assignmentDay, setAssignmentDay] = useState<AssignmentDay | null>(null);
    const [shuffleEvent, setShuffleEvent] = useState<ShuffleEvent | null>(null);
    const [isRouletteVisible, setIsRouletteVisible] = useState(false);

    // ダイアログ
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

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

        return () => {
            unsubAssignment();
            unsubShuffle();
        };
    }, [todayDate]);

    // 表示用Assignments (データがない場合は空枠を表示)
    const displayAssignments = useMemo(() => {
        if (assignmentDay) return assignmentDay.assignments;

        // データがない場合の初期表示
        const initial: Assignment[] = [];
        teams.forEach(team => {
            taskLabels.forEach(task => {
                initial.push({ teamId: team.id, taskLabelId: task.id, memberId: null });
            });
        });
        return initial;
    }, [assignmentDay, teams, taskLabels]);

    // 土日チェック
    const isWeekend = useMemo(() => {
        if (!todayDate) return false;
        const day = new Date(todayDate).getDay();
        return day === 0 || day === 6;
    }, [todayDate]);

    // シャッフル実行 (リーダー機能)
    const handleShuffle = async () => {
        if (!todayDate) return;

        if (isWeekend) {
            alert("土日はシャッフルできません（手動で調整してください）");
            return;
        }

        if (!confirm("担当をシャッフルしますか？\n現在の配置は上書きされます。")) return;

        try {
            // 1. 履歴取得 (過去7日分)
            const history = await fetchRecentAssignments(todayDate, 7);

            // 2. 計算
            const result = calculateAssignment(teams, taskLabels, members, history, todayDate);

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

    // 手動編集: スワップ
    const handleSwap = async (asg1: Assignment, asg2: Assignment) => {
        if (!todayDate) return;

        const newAssignments = [...displayAssignments];

        // 配列内のインデックスを探す
        const idx1 = newAssignments.findIndex(a => a.teamId === asg1.teamId && a.taskLabelId === asg1.taskLabelId);
        const idx2 = newAssignments.findIndex(a => a.teamId === asg2.teamId && a.taskLabelId === asg2.taskLabelId);

        if (idx1 === -1 || idx2 === -1) return; // ありえないはずだが

        // memberIdを入れ替え
        const temp = newAssignments[idx1].memberId;
        newAssignments[idx1] = { ...newAssignments[idx1], memberId: newAssignments[idx2].memberId };
        newAssignments[idx2] = { ...newAssignments[idx2], memberId: temp };

        await updateAssignmentDay(todayDate, newAssignments);
    };

    // 手動編集: メンバー変更
    const handleUpdateMember = async (targetAsg: Assignment, memberId: string | null) => {
        if (!todayDate) return;

        const newAssignments = [...displayAssignments];
        const idx = newAssignments.findIndex(a => a.teamId === targetAsg.teamId && a.taskLabelId === targetAsg.taskLabelId);

        if (idx === -1) {
            // まだ存在しない場合（初期状態など）は追加
            newAssignments.push({ ...targetAsg, memberId });
        } else {
            newAssignments[idx] = { ...newAssignments[idx], memberId };
        }

        await updateAssignmentDay(todayDate, newAssignments);
    };

    // 除外設定更新
    const handleUpdateExclusions = async (memberId: string, excludedIds: string[]) => {
        await updateMemberExclusions(memberId, excludedIds);
        // ローカルのmembersステートも更新しておくと即時反映される
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, excludedTaskLabelIds: excludedIds } : m));
    };

    return (
        <div className="min-h-screen bg-[#F7F7F5] pb-10">
            {/* ヘッダー */}
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
                            <IoArrowBack size={24} />
                        </button>
                        <h1 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span>{todayDate}</span>
                            <span className="text-sm font-normal text-gray-500">の担当表</span>
                        </h1>
                    </div>

                    <button
                        onClick={handleShuffle}
                        disabled={isWeekend}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-md transition-colors ${isWeekend
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-primary-dark active:scale-95'
                            }`}
                    >
                        <PiShuffleBold />
                        <span className="hidden md:inline">シャッフル</span>
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-2 md:px-4 py-6">
                <div className="bg-white rounded-xl shadow-sm p-2 md:p-6 overflow-hidden">
                    <AssignmentTable
                        teams={teams}
                        taskLabels={taskLabels}
                        assignments={displayAssignments}
                        members={members}
                        onSwap={handleSwap}
                        onUpdateMember={handleUpdateMember}
                        onMemberClick={setSelectedMember}
                    />
                </div>
            </main>

            {/* モーダル類 */}
            {selectedMember && (
                <MemberSettingsDialog
                    member={selectedMember}
                    taskLabels={taskLabels}
                    isOpen={!!selectedMember}
                    onClose={() => setSelectedMember(null)}
                    onUpdateExclusions={handleUpdateExclusions}
                />
            )}

            <RouletteOverlay
                isVisible={isRouletteVisible}
                members={members}
            />
        </div>
    );
}
