'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { AppData, Assignment, ShuffleEvent } from '@/types';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';

interface AssignmentTableProps {
  data: AppData | null;
  onUpdate: (data: AppData) => void;
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

function shuffleAssignments(
  data: AppData,
  assignedDate: string = new Date().toISOString().split('T')[0]
): Assignment[] {
  const { teams, members, taskLabels, assignments, assignmentHistory } = data;
  const result: Assignment[] = [];

  for (const team of teams) {
    const teamMembers = members.filter((m) => m.teamId === team.id);

    if (teamMembers.length === 0) {
      for (const label of taskLabels) {
        result.push({
          teamId: team.id,
          taskLabelId: label.id,
          memberId: null,
          assignedDate,
        });
      }
      continue;
    }

    const shuffledMembers = [...teamMembers].sort(() => Math.random() - 0.5);
    const usedMembers = new Set<string>();
    const labels = [...taskLabels];
    const maxCount = Math.max(taskLabels.length, teamMembers.length);

    for (let i = taskLabels.length; i < maxCount; i++) {
      labels.push({
        id: `empty-label-${team.id}-${i}`,
        leftLabel: '',
        rightLabel: null,
      });
    }

    for (const label of labels) {
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

      result.push({
        teamId: team.id,
        taskLabelId: label.id,
        memberId: selectedMember?.id || null,
        assignedDate,
      });

      if (selectedMember) {
        usedMembers.add(selectedMember.id);
      }
    }
  }

  return result;
}

export function AssignmentTable({ data, onUpdate }: AssignmentTableProps) {
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

  if (!data) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <p className="text-center text-gray-500">データがありません</p>
      </div>
    );
  }

  const teams = data.teams;
  const taskLabels = getTaskLabels(data);
  const assignments = data.assignments;

  const isAlreadyShuffled = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return assignments.some((a) => a.assignedDate === today);
  }, [assignments]);

  const isWeekend = useMemo(() => {
    const dayOfWeek = getJSTDayOfWeek();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0=日曜日, 6=土曜日
  }, []);

  const getAssignment = (teamId: string, taskLabelId: string) => {
    return assignments.find((a) => a.teamId === teamId && a.taskLabelId === taskLabelId);
  };

  // 表示用のラベルリスト（割り当てに含まれるラベルも含める）
  const displayLabels = useMemo(() => {
    const labelSet = new Set<string>();
    assignments.forEach((a) => labelSet.add(a.taskLabelId));
    taskLabels.forEach((l) => labelSet.add(l.id));

    return Array.from(labelSet).map((id) => {
      const label = taskLabels.find((l) => l.id === id);
      return (
        label || {
          id,
          leftLabel: '',
          rightLabel: null,
        }
      );
    });
  }, [assignments, taskLabels]);

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
      const newAssignments = event.shuffledAssignments
        .filter((a) => a.memberId !== null)
        .map((a) => ({
          teamId: a.teamId,
          taskLabelId: a.taskLabelId,
          memberId: a.memberId,
          assignedDate: a.assignedDate,
        }));

      const updatedData: AppData = {
        ...data,
        assignments: event.shuffledAssignments,
        assignmentHistory: [...data.assignmentHistory, ...newAssignments],
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
  }, [data?.shuffleEvent, data, isShuffling, onUpdate]);

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
        const newAssignments = shuffledAssignments.filter((a) => a.memberId !== null).map((a) => ({
          teamId: a.teamId,
          taskLabelId: a.taskLabelId,
          memberId: a.memberId,
          assignedDate: a.assignedDate,
        }));

        const updatedData: AppData = {
          ...data,
          assignments: shuffledAssignments,
          assignmentHistory: [...data.assignmentHistory, ...newAssignments],
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
  }, [isShuffling, shuffledAssignments, teams, displayLabels, data, onUpdate]);

  if (teams.length === 0 || taskLabels.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">班と作業ラベルを設定してください</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="mb-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-auto">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 sm:p-3 bg-gray-50 text-center text-gray-800 text-sm sm:text-base w-32 sm:w-40 whitespace-nowrap">
                  <div className="flex items-center justify-center">作業ラベル</div>
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
                  <div className="flex items-center justify-center">作業ラベル</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayLabels.map((label) => (
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

                                const today = new Date().toISOString().split('T')[0];

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
                                    assignedDate: today,
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
                                    assignedDate: today,
                                  });
                                }

                                const updatedData: AppData = {
                                  ...data,
                                  assignments: updatedAssignments,
                                };
                                onUpdate(updatedData);
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
                            } ${canInteract ? 'hover:opacity-80 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <button
          onClick={() => {
            const shuffled = shuffleAssignments(data);
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
          disabled={isShuffling || isAnimating || isAlreadyShuffled || isWeekend}
          className="px-6 py-3 sm:px-8 sm:py-4 bg-orange-500 text-white text-base sm:text-lg rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isShuffling || isAnimating
            ? 'シャッフル中...'
            : isWeekend
            ? '土日は休みです'
            : isAlreadyShuffled
            ? '既にシャッフル済みです'
            : 'シャッフルして担当を決める'}
        </button>
        {isDeveloperModeEnabled && (
          <button
            onClick={() => {
              const shuffled = shuffleAssignments(data);
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
    </div>
  );
}
