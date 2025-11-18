'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { AppData, Assignment, ShuffleEvent, TaskLabel } from '@/types';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { getTaskLabelsForDate, upsertTaskLabelSnapshot } from '@/lib/taskLabels';

interface AssignmentTableProps {
  data: AppData | null;
  onUpdate: (data: AppData) => void;
  selectedDate: string; // YYYY-MM-DD形式
  isToday: boolean; // 選択日が今日かどうか
}

function getMembersByTeam(data: AppData, teamId?: string) {
  return teamId ? data.members.filter((m) => m.teamId === teamId) : data.members;
}

function getTaskLabels(data: AppData) {
  return data.taskLabels;
}

function getJSTDayOfWeek(): number {
  const now = new Date();
  const jstTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  return jstTime.getDay();
}

// チームAとチームBを特定するヘルパー関数
function findTeamsAAndB(teams: Array<{ id: string; name: string }>): {
  teamA: { id: string; name: string } | null;
  teamB: { id: string; name: string } | null;
} {
  const teamA = teams.find((t) => t.name === 'A') || null;
  const teamB = teams.find((t) => t.name === 'B') || null;
  return { teamA, teamB };
}

// ペアを正規化する関数（メンバーIDを辞書順でソート）
function normalizePair(memberId1: string, memberId2: string): string {
  return [memberId1, memberId2].sort().join('-');
}

// 過去7日間の履歴から、タスクラベルに関係なくA-Bペアを抽出する関数
function getRecentPairs(
  assignmentHistory: Assignment[],
  teamAId: string,
  teamBId: string
): Set<string> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);

  // 過去7日間の履歴をフィルタリング（タスクラベルに関係なく）
  const recentHistory = assignmentHistory.filter(
    (h) =>
      (h.teamId === teamAId || h.teamId === teamBId) &&
      new Date(h.assignedDate) >= cutoffDate &&
      h.memberId !== null
  );

  // 日付とタスクラベルごとにグループ化
  const historyByDateAndLabel = new Map<string, Map<string, { teamA?: string; teamB?: string }>>();
  for (const h of recentHistory) {
    const date = h.assignedDate;
    if (!historyByDateAndLabel.has(date)) {
      historyByDateAndLabel.set(date, new Map());
    }
    const dayHistoryByLabel = historyByDateAndLabel.get(date)!;
    if (!dayHistoryByLabel.has(h.taskLabelId)) {
      dayHistoryByLabel.set(h.taskLabelId, {});
    }
    const dayHistory = dayHistoryByLabel.get(h.taskLabelId)!;
    if (h.teamId === teamAId && h.memberId) {
      dayHistory.teamA = h.memberId;
    } else if (h.teamId === teamBId && h.memberId) {
      dayHistory.teamB = h.memberId;
    }
  }

  // AチームとBチームの両方にメンバーが割り当てられている日のペアを抽出（全タスクラベル）
  const pairs = new Set<string>();
  for (const dayHistoryByLabel of historyByDateAndLabel.values()) {
    for (const dayHistory of dayHistoryByLabel.values()) {
      if (dayHistory.teamA && dayHistory.teamB) {
        pairs.add(normalizePair(dayHistory.teamA, dayHistory.teamB));
      }
    }
  }

  return pairs;
}

function shuffleAssignments(
  data: AppData,
  assignedDate: string = new Date().toISOString().split('T')[0]
): Assignment[] {
  const { teams, members, taskLabels, assignments, assignmentHistory } = data;
  const result: Assignment[] = [];

  // チームAとチームBを特定
  const { teamA, teamB } = findTeamsAAndB(teams);
  const isPairCheckEnabled = teamA !== null && teamB !== null;

  // 過去7日間のペア履歴を取得（タスクラベルに関係なく、一度だけ取得）
  const recentPairs = isPairCheckEnabled && teamA && teamB
    ? getRecentPairs(assignmentHistory, teamA.id, teamB.id)
    : new Set<string>();

  // 各チームのメンバーを事前に取得
  const teamMembersMap = new Map<string, typeof members>();
  const shuffledMembersMap = new Map<string, typeof members>();
  const usedMembersMap = new Map<string, Set<string>>();

  for (const team of teams) {
    const teamMembers = members.filter((m) => m.teamId === team.id);
    teamMembersMap.set(team.id, teamMembers);
    shuffledMembersMap.set(team.id, [...teamMembers].sort(() => Math.random() - 0.5));
    usedMembersMap.set(team.id, new Set<string>());
  }

  // 各タスクラベルに対して、全チームの割り当てを決定
  const labels = [...taskLabels];
  const maxLabelCount = Math.max(
    ...teams.map((team) => {
      const teamMembers = teamMembersMap.get(team.id) || [];
      return Math.max(taskLabels.length, teamMembers.length);
    })
  );

  for (let i = taskLabels.length; i < maxLabelCount; i++) {
    // 空ラベルは最初のチームのIDを使用（既存ロジックとの互換性のため）
    labels.push({
      id: `empty-label-${teams[0]?.id || 'default'}-${i}`,
      leftLabel: '',
      rightLabel: null,
    });
  }

  for (const label of labels) {
    // 各チームの割り当てを決定
    const labelAssignments: { teamId: string; memberId: string | null }[] = [];

    // AチームとBチームの割り当てを先に決定（ペアチェックのため）
    if (isPairCheckEnabled && teamA && teamB) {
      const teamAMembers = teamMembersMap.get(teamA.id) || [];
      const teamBMembers = teamMembersMap.get(teamB.id) || [];

      if (teamAMembers.length > 0 || teamBMembers.length > 0) {
        // Aチームの割り当てを決定
        let teamAMemberId: string | null = null;
        if (teamAMembers.length > 0) {
          const shuffledTeamA = shuffledMembersMap.get(teamA.id) || [];
          const usedTeamA = usedMembersMap.get(teamA.id) || new Set();

          // 過去7日間の履歴を取得
          const recentHistoryA = (() => {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            return assignmentHistory.filter(
              (h) =>
                h.teamId === teamA.id &&
                h.taskLabelId === label.id &&
                new Date(h.assignedDate) >= cutoffDate
            );
          })();
          const recentMemberIdsA = recentHistoryA
            .map((h) => h.memberId)
            .filter((id) => id !== null) as string[];

          const currentAssignmentA = assignments.find(
            (a) => a.teamId === teamA.id && a.taskLabelId === label.id
          );
          const currentMemberIdA = currentAssignmentA?.memberId || null;

          let availableMembersA = shuffledTeamA.filter(
            (m) => !usedTeamA.has(m.id) && !(m.excludedTaskLabelIds || []).includes(label.id)
          );

          let filteredMembersA = availableMembersA.filter(
            (m) => !recentMemberIdsA.includes(m.id) && m.id !== currentMemberIdA
          );

          if (filteredMembersA.length === 0) {
            filteredMembersA = availableMembersA.filter((m) => m.id !== currentMemberIdA);
          }

          if (filteredMembersA.length === 0) {
            filteredMembersA = availableMembersA;
          }

          teamAMemberId =
            filteredMembersA.length > 0
              ? filteredMembersA[Math.floor(Math.random() * filteredMembersA.length)].id
              : null;

          if (teamAMemberId) {
            usedTeamA.add(teamAMemberId);
          }
        }

        // Bチームの割り当てを決定（Aチームのメンバーとペアの連続チェック）
        let teamBMemberId: string | null = null;
        if (teamBMembers.length > 0) {
          const shuffledTeamB = shuffledMembersMap.get(teamB.id) || [];
          const usedTeamB = usedMembersMap.get(teamB.id) || new Set();

          // 過去7日間の履歴を取得
          const recentHistoryB = (() => {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            return assignmentHistory.filter(
              (h) =>
                h.teamId === teamB.id &&
                h.taskLabelId === label.id &&
                new Date(h.assignedDate) >= cutoffDate
            );
          })();
          const recentMemberIdsB = recentHistoryB
            .map((h) => h.memberId)
            .filter((id) => id !== null) as string[];

          const currentAssignmentB = assignments.find(
            (a) => a.teamId === teamB.id && a.taskLabelId === label.id
          );
          const currentMemberIdB = currentAssignmentB?.memberId || null;

          let availableMembersB = shuffledTeamB.filter(
            (m) => !usedTeamB.has(m.id) && !(m.excludedTaskLabelIds || []).includes(label.id)
          );

          // 既存のフィルタリング（最近担当したメンバーと現在のメンバーを除外）
          let filteredMembersB = availableMembersB.filter(
            (m) => !recentMemberIdsB.includes(m.id) && m.id !== currentMemberIdB
          );

          // ペアの連続チェックを追加（Aチームのメンバーが決定済みの場合）
          if (teamAMemberId) {
            filteredMembersB = filteredMembersB.filter((m) => {
              const pair = normalizePair(teamAMemberId!, m.id);
              return !recentPairs.has(pair);
            });
          }

          // フォールバック処理（段階的に緩和）
          if (filteredMembersB.length === 0) {
            // ペアチェックを緩和
            if (teamAMemberId) {
              filteredMembersB = availableMembersB.filter(
                (m) => !recentMemberIdsB.includes(m.id) && m.id !== currentMemberIdB
              );
            } else {
              filteredMembersB = availableMembersB.filter((m) => m.id !== currentMemberIdB);
            }
          }

          if (filteredMembersB.length === 0) {
            filteredMembersB = availableMembersB.filter((m) => m.id !== currentMemberIdB);
          }

          if (filteredMembersB.length === 0) {
            filteredMembersB = availableMembersB;
          }

          teamBMemberId =
            filteredMembersB.length > 0
              ? filteredMembersB[Math.floor(Math.random() * filteredMembersB.length)].id
              : null;

          if (teamBMemberId) {
            usedTeamB.add(teamBMemberId);
          }
        }

        labelAssignments.push({ teamId: teamA.id, memberId: teamAMemberId });
        labelAssignments.push({ teamId: teamB.id, memberId: teamBMemberId });
      } else {
        // メンバーがいない場合はnullを割り当て
        labelAssignments.push({ teamId: teamA.id, memberId: null });
        labelAssignments.push({ teamId: teamB.id, memberId: null });
      }
    }

    // 他のチームの割り当てを決定（既存のロジックを使用）
    for (const team of teams) {
      // AチームとBチームは既に処理済み
      if (isPairCheckEnabled && teamA && teamB && (team.id === teamA.id || team.id === teamB.id)) {
        continue;
      }

      const teamMembers = teamMembersMap.get(team.id) || [];

      if (teamMembers.length === 0) {
        labelAssignments.push({ teamId: team.id, memberId: null });
        continue;
      }

      const shuffledMembers = shuffledMembersMap.get(team.id) || [];
      const usedMembers = usedMembersMap.get(team.id) || new Set();

      // 過去7日間の履歴を取得
      const recentHistory = (() => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        return assignmentHistory.filter(
          (h) =>
            h.teamId === team.id &&
            h.taskLabelId === label.id &&
            new Date(h.assignedDate) >= cutoffDate
        );
      })();

      const recentMemberIds = recentHistory.map((h) => h.memberId).filter((id) => id !== null);

      // 現在の割り当てを取得
      const currentAssignment = assignments.find(
        (a) => a.teamId === team.id && a.taskLabelId === label.id
      );
      const currentMemberId = currentAssignment?.memberId || null;

      // 利用可能なメンバーをフィルタリング
      let availableMembers = shuffledMembers.filter(
        (m) => !usedMembers.has(m.id) && !(m.excludedTaskLabelIds || []).includes(label.id)
      );

      // 最近担当したメンバーと現在のメンバーを除外
      let filteredMembers = availableMembers.filter(
        (m) => !recentMemberIds.includes(m.id) && m.id !== currentMemberId
      );

      if (filteredMembers.length === 0) {
        filteredMembers = availableMembers.filter((m) => m.id !== currentMemberId);
      }

      if (filteredMembers.length === 0) {
        filteredMembers = availableMembers;
      }

      const selectedMember =
        filteredMembers.length > 0
          ? filteredMembers[Math.floor(Math.random() * filteredMembers.length)]
          : null;

      labelAssignments.push({
        teamId: team.id,
        memberId: selectedMember?.id || null,
      });

      if (selectedMember) {
        usedMembers.add(selectedMember.id);
      }
    }

    // 結果に追加
    for (const assignment of labelAssignments) {
      result.push({
        teamId: assignment.teamId,
        taskLabelId: label.id,
        memberId: assignment.memberId,
        assignedDate,
      });
    }
  }

  return result;
}

export function AssignmentTable({ data, onUpdate, selectedDate, isToday }: AssignmentTableProps) {
  const { isEnabled: isDeveloperModeEnabled } = useDeveloperMode();
  const [isShuffling, setIsShuffling] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shuffleDisplay, setShuffleDisplay] = useState<{ [key: string]: string | null }>({});
  const [shuffledAssignments, setShuffledAssignments] = useState<Assignment[] | null>(null);
  const [selectedCell, setSelectedCell] = useState<{
    teamId: string;
    taskLabelId: string;
    memberId: string | null;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [highlightedCell, setHighlightedCell] = useState<{
    teamId: string;
    taskLabelId: string;
  } | null>(null);
  const shuffleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shuffleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastShuffleEventRef = useRef<ShuffleEvent | null>(null);

  // 今日の日付を取得する関数
  const getTodayString = useCallback((): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // 前の平日を取得する関数（土日をスキップ）
  const getPreviousWeekday = useCallback((dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    date.setDate(date.getDate() - 1);
    
    // 土日をスキップ
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() - 1);
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // 翌日の平日を取得する関数（土日をスキップ）
  const getNextWeekday = useCallback((dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    date.setDate(date.getDate() + 1);
    
    // 土日をスキップ
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // シャッフル対象の日付を取得（16:45以降の場合は翌日）
  // shuffleTimeが指定されている場合はその時刻を基準に判定（他端末からのイベント用）
  const getShuffleTargetDate = useCallback((shuffleTime?: string): string => {
    const now = shuffleTime ? new Date(shuffleTime) : new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // 16:45以降の場合は翌日の平日を使用
    if (hours > 16 || (hours === 16 && minutes >= 45)) {
      const today = now.toISOString().split('T')[0];
      return getNextWeekday(today);
    }
    
    // それ以外は今日の日付を使用
    return now.toISOString().split('T')[0];
  }, [getNextWeekday]);

  if (!data) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <p className="text-center text-gray-500">データがありません</p>
      </div>
    );
  }

  const teams = data.teams;
  
  // 今日と明日の判定
  const today = getTodayString();
  const tomorrow = getNextWeekday(today);
  const isTomorrow = selectedDate === tomorrow; // 明日かどうか
  
  // 選択日に応じて表示する割り当てを決定
  const displayAssignments = useMemo(() => {
    if (isToday) {
      // 今日の場合は前日の平日の担当を表示
      const previousWeekday = getPreviousWeekday(today);
      return data.assignmentHistory.filter((a) => a.assignedDate === previousWeekday);
    } else if (isTomorrow) {
      // 明日の場合は該当日の担当を取得（なければ空欄）
      return data.assignmentHistory.filter((a) => a.assignedDate === selectedDate);
    } else {
      // 過去の場合は履歴から該当日の割り当てを取得
      return data.assignmentHistory.filter((a) => a.assignedDate === selectedDate);
    }
  }, [data.assignmentHistory, selectedDate, isToday, isTomorrow, today, getPreviousWeekday, getNextWeekday]);
  
  const assignments = displayAssignments;

  // 選択日の作業ラベルを取得（履歴から、または直近の過去から、または現在のtaskLabelsから）
  const dateTaskLabels = useMemo(() => {
    return getTaskLabelsForDate(data, selectedDate);
  }, [data, selectedDate]);

  // 初回アクセス時に履歴が存在しない場合は自動的に作成
  useEffect(() => {
    if (!data.taskLabelHistory || !Array.isArray(data.taskLabelHistory)) {
      return;
    }
    const snapshot = data.taskLabelHistory.find((s) => s.date === selectedDate);
    if (!snapshot && !isToday) {
      // 履歴が存在しない場合、直近の過去の履歴または現在のtaskLabelsを複製
      const labelsToCopy = getTaskLabelsForDate(data, selectedDate);
      if (labelsToCopy.length > 0) {
        const updatedData = upsertTaskLabelSnapshot(data, selectedDate, labelsToCopy);
        onUpdate(updatedData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, data.taskLabelHistory, isToday]);

  const isAlreadyShuffled = useMemo(() => {
    const targetDate = getShuffleTargetDate();
    return assignments.some((a) => a.assignedDate === targetDate);
  }, [assignments, getShuffleTargetDate]);

  const isWeekend = useMemo(() => {
    const date = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0=日曜日, 6=土曜日
  }, [selectedDate]);

  const getAssignment = (teamId: string, taskLabelId: string) => {
    return assignments.find((a) => a.teamId === teamId && a.taskLabelId === taskLabelId);
  };

  // 履歴を更新するヘルパー関数
  const updateAssignmentHistory = (newAssignments: Assignment[], targetDate: string) => {
    const updatedHistory = [...data.assignmentHistory];
    
    // 該当日の既存の履歴を削除
    const filteredHistory = updatedHistory.filter((a) => a.assignedDate !== targetDate);
    
    // 新しい割り当てを履歴に追加
    const historyEntries = newAssignments.map((a) => ({
      ...a,
      assignedDate: targetDate,
    }));
    
    return [...filteredHistory, ...historyEntries];
  };

  // 表示用のラベルリスト（割り当てに含まれるラベルも含める）
  const displayLabels = useMemo(() => {
    const labelSet = new Set<string>();
    assignments.forEach((a) => labelSet.add(a.taskLabelId));
    dateTaskLabels.forEach((l) => labelSet.add(l.id));

    return Array.from(labelSet).map((id) => {
      const label = dateTaskLabels.find((l) => l.id === id);
      return (
        label || {
          id,
          leftLabel: '',
          rightLabel: null,
        }
      );
    });
  }, [assignments, dateTaskLabels]);

  // 他端末からのシャッフルイベントを検知
  useEffect(() => {
    if (!data?.shuffleEvent) {
      // イベントが削除された場合、アニメーションを停止
      if (lastShuffleEventRef.current && !isShuffling) {
        // 既にアニメーションが終了している場合は何もしない
        return;
      }
      lastShuffleEventRef.current = null;
      return;
    }

    const event = data.shuffleEvent;
    
    // 同じイベントの場合は無視（無限ループ防止）
    if (
      lastShuffleEventRef.current &&
      lastShuffleEventRef.current.startTime === event.startTime &&
      JSON.stringify(lastShuffleEventRef.current.shuffledAssignments) ===
        JSON.stringify(event.shuffledAssignments)
    ) {
      return;
    }

    lastShuffleEventRef.current = event;

    // 既にシャッフル中の場合は無視
    if (isShuffling) {
      return;
    }

    // 開始タイムスタンプから経過時間を計算
    const startTime = new Date(event.startTime).getTime();
    const now = Date.now();
    const elapsed = now - startTime;
    const animationDuration = 3000; // 3秒

    if (elapsed >= animationDuration) {
      // 既にアニメーションが終了している場合、即座に結果を表示
      const targetDate = getShuffleTargetDate(event.startTime);
      const updatedHistory = updateAssignmentHistory(event.shuffledAssignments, targetDate);

      const updatedData: AppData = {
        ...data,
        assignments: event.shuffledAssignments,
        assignmentHistory: updatedHistory,
        shuffleEvent: undefined,
      };
      onUpdate(updatedData);
      return;
    }

    // 残り時間でアニメーションを開始
    const remainingTime = animationDuration - elapsed;
    setIsShuffling(true);
    setIsAnimating(true);
    setIsCompleted(false);
    setSelectedCell(null);
    setHighlightedCell(null);
    setShuffledAssignments(event.shuffledAssignments);
  }, [data?.shuffleEvent, data, isShuffling, onUpdate, getShuffleTargetDate]);

  useEffect(() => {
    if (!isShuffling) {
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current);
        shuffleIntervalRef.current = null;
      }
      if (shuffleTimeoutRef.current) {
        clearTimeout(shuffleTimeoutRef.current);
        shuffleTimeoutRef.current = null;
      }
      return;
    }

    const updateShuffleDisplay = () => {
      if (!shuffledAssignments) return;

      const display: { [key: string]: string | null } = {};
      teams.forEach((team) => {
        displayLabels.forEach((label) => {
          const key = `${team.id}-${label.id}`;
          const assignment = shuffledAssignments.find(
            (a) => a.teamId === team.id && a.taskLabelId === label.id
          );
          if (!assignment || !assignment.memberId) {
            display[key] = null;
            return;
          }

          const teamMembers = getMembersByTeam(data, team.id);
          if (teamMembers.length === 0) {
            display[key] = null;
            return;
          }

          const randomIndex = Math.floor(Math.random() * teamMembers.length);
          display[key] = teamMembers[randomIndex].name;
        });
      });
      setShuffleDisplay(display);
    };

    updateShuffleDisplay();
    shuffleIntervalRef.current = setInterval(updateShuffleDisplay, 100);

    // 残り時間を計算（他端末からのイベントの場合）
    let timeoutDuration = 3000; // デフォルトは3秒
    if (data.shuffleEvent && shuffledAssignments) {
      const startTime = new Date(data.shuffleEvent.startTime).getTime();
      const now = Date.now();
      const elapsed = now - startTime;
      const animationDuration = 3000;
      timeoutDuration = Math.max(0, animationDuration - elapsed);
    }

    shuffleTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      setIsCompleted(true);

      if (shuffledAssignments) {
        // シャッフルイベントの開始時刻を基準に日付を決定
        const shuffleTime = data.shuffleEvent?.startTime;
        const targetDate = getShuffleTargetDate(shuffleTime);
        const updatedHistory = updateAssignmentHistory(shuffledAssignments, targetDate);
        
        const updatedData: AppData = {
          ...data,
          assignments: shuffledAssignments,
          assignmentHistory: updatedHistory,
          shuffleEvent: undefined, // アニメーション終了時にイベントを削除
        };
        onUpdate(updatedData);
        setShuffledAssignments(null);
      }

      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current);
        shuffleIntervalRef.current = null;
      }
      setShuffleDisplay({});
      setIsShuffling(false);
      setTimeout(() => {
        setIsCompleted(false);
      }, 500);
    }, timeoutDuration);

    return () => {
      if (shuffleIntervalRef.current) {
        clearInterval(shuffleIntervalRef.current);
        shuffleIntervalRef.current = null;
      }
      if (shuffleTimeoutRef.current) {
        clearTimeout(shuffleTimeoutRef.current);
        shuffleTimeoutRef.current = null;
      }
    };
  }, [isShuffling, shuffledAssignments, teams, displayLabels, data, onUpdate, getShuffleTargetDate]);

  if (teams.length === 0 || dateTaskLabels.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">班と作業ラベルを設定してください</p>
      </div>
    );
  }

  // ヘッダー表記を取得（設定がない場合はデフォルトの「作業ラベル」）
  const headerTextLeft = data.userSettings?.taskLabelHeaderTextLeft || '作業ラベル';
  const headerTextRight = data.userSettings?.taskLabelHeaderTextRight || '作業ラベル';

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="mb-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-auto">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 sm:p-3 bg-gray-50 text-center text-gray-800 text-sm sm:text-base w-32 sm:w-40 whitespace-nowrap">
                  <div className="flex items-center justify-center">{headerTextLeft}</div>
                </th>
                {teams.map((team) => (
                  <th
                    key={team.id}
                    className="border border-gray-300 p-2 sm:p-3 bg-gray-50 text-center text-gray-800 text-sm sm:text-base w-24 sm:w-28"
                  >
                    <div className="flex items-center justify-center">{team.name}</div>
                  </th>
                ))}
                <th className="border border-gray-300 p-2 sm:p-3 bg-gray-50 text-center text-gray-800 text-sm sm:text-base w-32 sm:w-40 whitespace-nowrap">
                  <div className="flex items-center justify-center">{headerTextRight}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayLabels.map((label) => {
                return (
                <tr key={label.id}>
                  <td className="border border-gray-300 p-2 sm:p-3 bg-gray-50 w-32 sm:w-40">
                    <div className="flex items-center justify-center">
                      <span className="font-medium text-gray-800 text-sm sm:text-base whitespace-nowrap">
                        {label.leftLabel}
                      </span>
                    </div>
                  </td>
                  {teams.map((team) => {
                    const key = `${team.id}-${label.id}`;
                    let displayName: string | null = null;
                    let isEmpty = true;
                    let memberId: string | null = null;

                    if (isShuffling) {
                      isEmpty = !(displayName = shuffleDisplay[key] || null);
                    } else {
                      const assignment = getAssignment(team.id, label.id);
                      memberId = assignment?.memberId || null;
                      if (memberId) {
                        const teamMembers = getMembersByTeam(data, team.id);
                        const member = teamMembers.find((m) => m.id === memberId);
                        displayName = member?.name || null;
                        isEmpty = !displayName;
                      }
                    }

                    const isHighlighted =
                      highlightedCell &&
                      highlightedCell.teamId === team.id &&
                      highlightedCell.taskLabelId === label.id;
                    const isSelected =
                      selectedCell &&
                      selectedCell.teamId === team.id &&
                      selectedCell.taskLabelId === label.id;
                    const canInteract = !isShuffling && !isAnimating;

                    return (
                      <td
                        key={key}
                        className="border border-gray-300 p-2 sm:p-3 text-center w-24 sm:w-28"
                      >
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => {
                              if (!canInteract) return;

                              if (!selectedCell) {
                                setSelectedCell({
                                  teamId: team.id,
                                  taskLabelId: label.id,
                                  memberId,
                                });
                                setHighlightedCell({ teamId: team.id, taskLabelId: label.id });
                                return;
                              }

                              if (
                                (selectedCell.teamId === team.id &&
                                  selectedCell.taskLabelId === label.id) ||
                                selectedCell.teamId !== team.id
                              ) {
                                setSelectedCell(null);
                                setHighlightedCell(null);
                                return;
                              }

                              if (selectedCell.teamId === team.id) {
                                const currentAssignment = getAssignment(team.id, label.id);
                                const otherMemberId = currentAssignment?.memberId || null;
                                const selectedAssignment = getAssignment(
                                  selectedCell.teamId,
                                  selectedCell.taskLabelId
                                );
                                const selectedMemberId = selectedAssignment?.memberId || null;

                                const updatedAssignments = assignments.map((a) =>
                                  a.teamId === selectedCell.teamId &&
                                  a.taskLabelId === selectedCell.taskLabelId
                                    ? { ...a, memberId: otherMemberId }
                                    : a.teamId === team.id && a.taskLabelId === label.id
                                    ? { ...a, memberId: selectedMemberId }
                                    : a
                                );

                                // 今日の場合は16:45以降なら翌日、それ以外は今日の日付を使用
                                const targetDate = isToday ? getShuffleTargetDate() : selectedDate;

                                // 新しい割り当てが存在しない場合は追加
                                if (
                                  !updatedAssignments.find(
                                    (a) => a.teamId === team.id && a.taskLabelId === label.id
                                  )
                                ) {
                                  updatedAssignments.push({
                                    teamId: team.id,
                                    taskLabelId: label.id,
                                    memberId: selectedMemberId,
                                    assignedDate: targetDate,
                                  });
                                }

                                if (
                                  otherMemberId &&
                                  !updatedAssignments.find(
                                    (a) =>
                                      a.teamId === selectedCell.teamId &&
                                      a.taskLabelId === selectedCell.taskLabelId
                                  )
                                ) {
                                  updatedAssignments.push({
                                    teamId: selectedCell.teamId,
                                    taskLabelId: selectedCell.taskLabelId,
                                    memberId: otherMemberId,
                                    assignedDate: targetDate,
                                  });
                                }

                                // 今日の場合はassignmentsと履歴の両方を更新
                                if (isToday) {
                                  const updatedHistory = updateAssignmentHistory(updatedAssignments, targetDate);
                                  const updatedData: AppData = {
                                    ...data,
                                    assignments: updatedAssignments,
                                    assignmentHistory: updatedHistory,
                                  };
                                  onUpdate(updatedData);
                                } else {
                                  // 過去の場合は履歴のみ更新（表示用）
                                  const updatedHistory = updateAssignmentHistory(updatedAssignments, selectedDate);
                                  const updatedData: AppData = {
                                    ...data,
                                    assignmentHistory: updatedHistory,
                                  };
                                  onUpdate(updatedData);
                                }
                                setSelectedCell(null);
                                setHighlightedCell(null);
                              }
                            }}
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded border text-sm sm:text-base transition-all duration-300 min-h-[44px] sm:min-h-[52px] flex items-center justify-center ${
                              isEmpty
                                ? 'border-gray-300 bg-gray-100 text-gray-500'
                                : isSelected
                                ? 'border-blue-500 bg-blue-100 text-gray-900 ring-2 ring-blue-300'
                                : isHighlighted
                                ? 'border-orange-500 bg-orange-100 text-gray-900 scale-105 shadow-lg'
                                : 'border-orange-400 bg-orange-50 text-gray-900'
                            } ${canInteract ? 'hover:opacity-80 cursor-pointer' : 'cursor-not-allowed'}`}
                            disabled={!canInteract}
                          >
                            {displayName || '\u00A0'}
                          </button>
                        </div>
                      </td>
                    );
                  })}
                  <td className="border border-gray-300 p-2 sm:p-3 bg-gray-50 w-32 sm:w-40">
                    {label.rightLabel && (
                      <div className="flex items-center justify-center">
                        <span className="font-medium text-gray-600 text-sm sm:text-base whitespace-nowrap">
                          {label.rightLabel}
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* シャッフルボタンは平日かつ明日の場合のみ表示 */}
      {isTomorrow && !isWeekend && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              const targetDate = getShuffleTargetDate();
              const shuffled = shuffleAssignments(data, targetDate);
              const shuffleEvent: ShuffleEvent = {
                startTime: new Date().toISOString(),
                shuffledAssignments: shuffled,
              };
              
              // shuffleEventをFirestoreに書き込む
              const updatedData: AppData = {
                ...data,
                shuffleEvent,
              };
              onUpdate(updatedData);
              
              // ローカルでもアニメーションを開始
              setIsShuffling(true);
              setIsAnimating(true);
              setIsCompleted(false);
              setSelectedCell(null);
              setHighlightedCell(null);
              setShuffledAssignments(shuffled);
            }}
            disabled={isShuffling || isAnimating || isAlreadyShuffled}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-orange-500 text-white text-base sm:text-lg rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isShuffling || isAnimating
              ? 'シャッフル中...'
              : isAlreadyShuffled
              ? '既にシャッフル済みです'
              : 'シャッフルして担当を決める'}
          </button>
          {isDeveloperModeEnabled && (
            <button
              onClick={() => {
                const targetDate = getShuffleTargetDate();
                const shuffled = shuffleAssignments(data, targetDate);
                const shuffleEvent: ShuffleEvent = {
                  startTime: new Date().toISOString(),
                  shuffledAssignments: shuffled,
                };
                
                // shuffleEventをFirestoreに書き込む
                const updatedData: AppData = {
                  ...data,
                  shuffleEvent,
                };
                onUpdate(updatedData);
                
                // ローカルでもアニメーションを開始
                setIsShuffling(true);
                setIsAnimating(true);
                setIsCompleted(false);
                setSelectedCell(null);
                setHighlightedCell(null);
                setShuffledAssignments(shuffled);
              }}
              disabled={isShuffling || isAnimating}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-600 text-white text-sm sm:text-base rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title="開発用: 制限なしでシャッフル"
            >
              {isShuffling || isAnimating ? 'シャッフル中...' : '開発用: 強制シャッフル'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
