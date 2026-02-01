import { useCallback } from 'react';
import { Team, Member, TaskLabel, Assignment, PairExclusion } from '@/types';
import {
    getServerTodayDate,
    updateAssignmentDay, createShuffleEvent, updateShuffleEventState,
    createShuffleHistory, fetchRecentShuffleHistory,
    updateMemberTeam,
} from '../lib/firebase';
import { calculateAssignment } from '@/app/assignment/lib/shuffle';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

type UseShuffleExecutionParams = {
    userId: string | null;
    teams: Team[];
    taskLabels: TaskLabel[];
    members: Member[];
    pairExclusions: PairExclusion[];
    activeDate: string;
    displayAssignments: Assignment[];
    setTodayDate: (date: string) => void;
    setActiveDate: (date: string) => void;
    setIsLocalShuffling: (v: boolean) => void;
    setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
};

export function useShuffleExecution({
    userId,
    teams,
    taskLabels,
    members,
    pairExclusions,
    activeDate,
    displayAssignments,
    setTodayDate,
    setActiveDate,
    setIsLocalShuffling,
    setMembers,
}: UseShuffleExecutionParams) {
    const handleShuffle = useCallback(async () => {
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
            const result = calculateAssignment(teams, taskLabels, members, history, targetDate, displayAssignments, pairExclusions);

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

            // 6. Sync member teams with shuffle result (班を跨いだ移動を反映)
            const memberTeamUpdates = Array.from(
                result.reduce<Map<string, string>>((acc, asg) => {
                    if (asg.memberId) acc.set(asg.memberId, asg.teamId);
                    return acc;
                }, new Map())
            )
                .map(([memberId, teamId]) => {
                    const currentTeam = members.find(m => m.id === memberId)?.teamId;
                    return { memberId, teamId, currentTeam };
                })
                .filter(entry => entry.currentTeam !== entry.teamId);

            if (memberTeamUpdates.length > 0) {
                await Promise.all(
                    memberTeamUpdates.map(({ memberId, teamId }) =>
                        updateMemberTeam(userId, memberId, teamId)
                    )
                );
                setMembers(prev =>
                    prev.map(m => {
                        const update = memberTeamUpdates.find(u => u.memberId === m.id);
                        return update ? { ...m, teamId: update.teamId } : m;
                    })
                );
            }

            // 7. Persist shuffle history
            const historyId = uuidv4();
            await createShuffleHistory(userId, {
                id: historyId,
                assignments: result,
                targetDate: targetDate,
            });

            // 8. Mark event done
            await updateShuffleEventState(userId, targetDate, 'done');

        } catch (e) {
            console.error(e);
            alert('Shuffle failed');
        } finally {
            setIsLocalShuffling(false);
        }
    }, [userId, teams, taskLabels, members, pairExclusions, activeDate, displayAssignments, setTodayDate, setActiveDate, setIsLocalShuffling, setMembers]);

    return { handleShuffle };
}
