import { useEffect, useState, useMemo } from 'react';
import {
    Team, Member, TaskLabel, Assignment, AssignmentDay, ShuffleEvent, TableSettings, Manager, PairExclusion,
} from '@/types';
import {
    fetchTeams, fetchMembers, fetchTaskLabels,
    subscribeLatestAssignmentDay, subscribeShuffleEvent, subscribeTableSettings,
    fetchRecentAssignments,
    mutateAssignmentDay, getServerTodayDate,
    subscribeManager,
    subscribePairExclusions,
} from '../lib/firebase';

export function useAssignmentData(userId: string | null, authLoading: boolean) {
    // マスタデータ
    const [teams, setTeams] = useState<Team[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [taskLabels, setTaskLabels] = useState<TaskLabel[]>([]);
    const [tableSettings, setTableSettings] = useState<TableSettings | null>(null);
    const [manager, setManagerState] = useState<Manager | null>(null);

    // ロード状態
    const [isMasterLoaded, setIsMasterLoaded] = useState(false);
    const [isAssignmentLoaded, setIsAssignmentLoaded] = useState(false);

    // ペア除外設定
    const [pairExclusions, setPairExclusions] = useState<PairExclusion[]>([]);

    // 状態
    const [todayDate, setTodayDate] = useState<string>("");
    const [activeDate, setActiveDate] = useState<string>("");
    const [assignmentDay, setAssignmentDay] = useState<AssignmentDay | null>(null);
    const [shuffleEvent, setShuffleEvent] = useState<ShuffleEvent | null>(null);
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

        const unsubPairExclusions = subscribePairExclusions(userId, (exclusions) => {
            setPairExclusions(exclusions);
        });

        return () => {
            unsubAssignment();
            unsubSettings();
            unsubManager();
            unsubPairExclusions();
        };
    }, [userId, authLoading]);

    // Firestore購読: シャッフルイベント（現在のアクティブ日付）
    useEffect(() => {
        if (!userId || authLoading || !activeDate) return;

        const unsubShuffle = subscribeShuffleEvent(userId, activeDate, (event) => {
            setShuffleEvent(event);

            // isRouletteVisible は派生状態として計算されるため、
            // ここでのsetIsRouletteVisible呼び出しは不要
        });

        return () => {
            unsubShuffle();
        };
    }, [userId, authLoading, activeDate, isLocalShuffling]);

    // アニメーション表示制御（派生状態）
    const isRouletteVisible = useMemo(() => {
        return isLocalShuffling || shuffleEvent?.state === 'running';
    }, [isLocalShuffling, shuffleEvent]);

    // 表示用Assignments (データがない場合は空枠を表示)
    const displayAssignments = useMemo(() => {
        if (assignmentDay) return assignmentDay.assignments;

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

    const isLoading = authLoading || !userId || !isMasterLoaded || !isAssignmentLoaded;

    return {
        teams, setTeams,
        members, setMembers,
        taskLabels, setTaskLabels,
        tableSettings,
        manager, setManagerState,
        pairExclusions,
        todayDate, setTodayDate,
        activeDate, setActiveDate,
        isRouletteVisible,
        isLocalShuffling, setIsLocalShuffling,
        isShuffleDisabled,
        displayAssignments,
        isLoading,
    };
}
