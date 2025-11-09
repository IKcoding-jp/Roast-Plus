'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { AppData, Assignment } from '@/types';
import { getTeams, getMembers, getTaskLabels, getAssignments, setAssignments, addAssignmentHistory } from '@/lib/firestore';
import { shuffleAssignments, createAssignmentHistory } from '@/lib/shuffle';

type AssignmentTableProps = {
  data: AppData;
  onUpdate: (data: AppData) => void;
};

type ShufflingNames = Record<string, string | null>; // key: `${teamId}-${taskLabelId}`, value: memberName | null

type SelectedCell = {
  teamId: string;
  taskLabelId: string;
  memberId: string | null;
};

export default function AssignmentTable({
  data,
  onUpdate,
}: AssignmentTableProps) {
  const [isShuffling, setIsShuffling] = useState(false);
  const [isShufflingAnimation, setIsShufflingAnimation] = useState(false);
  const [shufflingNames, setShufflingNames] = useState<ShufflingNames>({});
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[] | null>(null);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const teams = getTeams(data);
  const taskLabels = getTaskLabels(data);
  const assignments = getAssignments(data);

  // 今日の割り当てがあるかチェック
  const hasTodayAssignment = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return assignments.some((a) => a.assignedDate === today);
  }, [assignments]);

  // 割り当てに含まれるすべてのラベルIDを取得（空のラベルも含む）
  const allLabelIds = new Set<string>();
  assignments.forEach((a) => allLabelIds.add(a.taskLabelId));
  taskLabels.forEach((tl) => allLabelIds.add(tl.id));

  // 表示用のラベルリストを作成（空のラベルも含む）
  const displayLabels = Array.from(allLabelIds).map((labelId) => {
    const existingLabel = taskLabels.find((tl) => tl.id === labelId);
    if (existingLabel) {
      return existingLabel;
    }
    // 空のラベル（割り当てにのみ存在するラベル）
    return {
      id: labelId,
      leftLabel: '',
      rightLabel: null,
    };
  });

  const handleShuffle = () => {
    setIsShuffling(true);
    setShowFinalResult(false);
    setSelectedCell(null); // アニメーション開始時に選択状態をリセット

    // シャッフル実行（すぐに計算）
    const newAssignments = shuffleAssignments(data);
    
    // アニメーション終了後に適用するために保存
    setPendingAssignments(newAssignments);
    
    // pendingAssignmentsが設定された後にアニメーションを開始
    // 次のレンダリングサイクルでuseEffectが実行されるようにする
    setTimeout(() => {
      setIsShufflingAnimation(true);
    }, 0);
  };

  const getAssignment = (teamId: string, taskLabelId: string) => {
    return assignments.find(
      (a) => a.teamId === teamId && a.taskLabelId === taskLabelId
    );
  };

  const getMemberName = (memberId: string | null) => {
    if (!memberId) return null;
    const allMembers = getMembers(data);
    return allMembers.find((m) => m.id === memberId)?.name || null;
  };

  // ランダムなメンバー名を取得（アニメーション用）
  const getRandomMemberName = (teamId: string): string | null => {
    const allMembers = getMembers(data, teamId);
    if (allMembers.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * allMembers.length);
    return allMembers[randomIndex].name;
  };

  // セルクリックハンドラー
  const handleCellClick = (teamId: string, taskLabelId: string, memberId: string | null) => {
    // アニメーション中は移動機能を無効化
    if (isShufflingAnimation || isShuffling) {
      return;
    }

    // 選択状態がない場合：選択
    if (!selectedCell) {
      setSelectedCell({ teamId, taskLabelId, memberId });
      return;
    }

    // 同じセルをクリックした場合：選択解除
    if (
      selectedCell.teamId === teamId &&
      selectedCell.taskLabelId === taskLabelId
    ) {
      setSelectedCell(null);
      return;
    }

    // 異なる班のセルをクリックした場合：移動しない（選択解除）
    if (selectedCell.teamId !== teamId) {
      setSelectedCell(null);
      return;
    }

    // 同じ班内の別のセルをクリックした場合：移動を実行
    if (selectedCell.teamId === teamId) {
      // 移動先のセルの現在の割り当てを取得
      const targetAssignment = getAssignment(teamId, taskLabelId);
      const targetMemberId = targetAssignment?.memberId || null;

      const newAssignments = assignments.map((assignment) => {
        // 移動元のセル：移動先のメンバーを設定（スワップ）または空にする
        if (
          assignment.teamId === selectedCell.teamId &&
          assignment.taskLabelId === selectedCell.taskLabelId
        ) {
          return {
            ...assignment,
            memberId: targetMemberId,
          };
        }
        // 移動先のセル：選択されたメンバーを設定
        if (
          assignment.teamId === teamId &&
          assignment.taskLabelId === taskLabelId
        ) {
          return {
            ...assignment,
            memberId: selectedCell.memberId,
          };
        }
        return assignment;
      });

      // 移動先のセルに割り当てが存在しない場合は新規作成
      const existingTargetAssignment = newAssignments.find(
        (a) => a.teamId === teamId && a.taskLabelId === taskLabelId
      );
      if (!existingTargetAssignment) {
        const today = new Date().toISOString().split('T')[0];
        newAssignments.push({
          teamId,
          taskLabelId,
          memberId: selectedCell.memberId,
          assignedDate: today,
        });
      }

      // 移動元のセルに割り当てが存在しない場合も新規作成（スワップ時）
      if (targetMemberId) {
        const existingSourceAssignment = newAssignments.find(
          (a) =>
            a.teamId === selectedCell.teamId &&
            a.taskLabelId === selectedCell.taskLabelId
        );
        if (!existingSourceAssignment) {
          const today = new Date().toISOString().split('T')[0];
          newAssignments.push({
            teamId: selectedCell.teamId,
            taskLabelId: selectedCell.taskLabelId,
            memberId: targetMemberId,
            assignedDate: today,
          });
        }
      }

      // データを更新
      const updated = setAssignments(data, newAssignments);
      onUpdate(updated);
      setSelectedCell(null);
    }
  };

  // アニメーション制御
  useEffect(() => {
    if (!isShufflingAnimation) {
      // アニメーション終了時のクリーンアップ
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      return;
    }

    // アニメーション中：ランダムなメンバー名を高速で切り替え
    const updateShufflingNames = () => {
      if (!pendingAssignments) {
        // pendingAssignmentsがまだ設定されていない場合は何もしない
        return;
      }

      const newShufflingNames: ShufflingNames = {};
      teams.forEach((team) => {
        displayLabels.forEach((taskLabel) => {
          const key = `${team.id}-${taskLabel.id}`;
          
          // 最終的な割り当て結果をチェック
          const finalAssignment = pendingAssignments.find(
            (a) => a.teamId === team.id && a.taskLabelId === taskLabel.id
          );
          
          // 最終的に未設定になるセル（memberIdがnull）の場合は未設定
          if (!finalAssignment || !finalAssignment.memberId) {
            newShufflingNames[key] = null;
            return;
          }
          
          // 最終的にメンバーが割り当てられるセルは、アニメーション中もランダムなメンバー名を表示
          newShufflingNames[key] = getRandomMemberName(team.id);
        });
      });
      setShufflingNames(newShufflingNames);
    };

    // 初期状態を設定
    updateShufflingNames();

    // 約100msごとにランダムなメンバー名を更新
    animationIntervalRef.current = setInterval(updateShufflingNames, 100);

    // 3秒後にアニメーション終了
    animationTimeoutRef.current = setTimeout(() => {
      // アニメーション終了
      setIsShufflingAnimation(false);
      setShowFinalResult(true);

      // 最終結果を適用
      if (pendingAssignments) {
        const updated = setAssignments(data, pendingAssignments);
        const history = createAssignmentHistory(pendingAssignments);
        const finalData = addAssignmentHistory(updated, history);
        onUpdate(finalData);
        setPendingAssignments(null);
      }

      // クリーンアップ
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      setShufflingNames({});
      setIsShuffling(false);

      // 「ドン！」効果を少し後に解除
      setTimeout(() => {
        setShowFinalResult(false);
      }, 500);
    }, 3000);

    // クリーンアップ関数
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShufflingAnimation, pendingAssignments]);

  if (teams.length === 0 || taskLabels.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">
          班と作業ラベルを設定してください
        </p>
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
                  作業ラベル
                </th>
                {teams.map((team) => (
                  <th
                    key={team.id}
                    className="border border-gray-300 p-2 sm:p-3 bg-gray-50 text-center text-gray-800 text-sm sm:text-base w-24 sm:w-28"
                  >
                    {team.name}
                  </th>
                ))}
                <th className="border border-gray-300 p-2 sm:p-3 bg-gray-50 text-center text-gray-800 text-sm sm:text-base w-32 sm:w-40 whitespace-nowrap">
                  作業ラベル
                </th>
              </tr>
            </thead>
            <tbody>
              {displayLabels.map((taskLabel) => (
                <tr key={taskLabel.id}>
                  <td className="border border-gray-300 p-2 sm:p-3 bg-gray-50 w-32 sm:w-40">
                    <div className="font-medium text-gray-800 text-sm sm:text-base whitespace-nowrap text-center">{taskLabel.leftLabel}</div>
                  </td>
                  {teams.map((team) => {
                    const key = `${team.id}-${taskLabel.id}`;
                    // アニメーション中はshufflingNamesから表示
                    let memberName: string | null = null;
                    let isEmpty = true;
                    let currentMemberId: string | null = null;

                    if (isShufflingAnimation) {
                      // アニメーション中：ランダムなメンバー名を表示
                      memberName = shufflingNames[key] || null;
                      isEmpty = !memberName;
                    } else {
                      // 通常時：実際の割り当てから表示
                      const assignment = getAssignment(team.id, taskLabel.id);
                      currentMemberId = assignment?.memberId || null;
                      memberName = getMemberName(currentMemberId);
                      isEmpty = !memberName;
                    }

                    // 「ドン！」効果：最終結果表示時に強調
                    const isHighlighted = showFinalResult && !isEmpty;

                    // 選択状態のチェック
                    const isSelected =
                      selectedCell &&
                      selectedCell.teamId === team.id &&
                      selectedCell.taskLabelId === taskLabel.id;

                    // クリック可能かどうか（アニメーション中は無効）
                    const isClickable = !isShufflingAnimation && !isShuffling;

                    return (
                      <td
                        key={key}
                        className="border border-gray-300 p-2 sm:p-3 text-center w-24 sm:w-28"
                      >
                        <button
                          onClick={() =>
                            handleCellClick(team.id, taskLabel.id, currentMemberId)
                          }
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded border text-sm sm:text-base transition-all duration-300 min-h-[44px] sm:min-h-[52px] ${
                            isEmpty
                              ? 'border-gray-300 bg-gray-100 text-gray-500'
                              : isSelected
                              ? 'border-blue-500 bg-blue-100 text-gray-900 ring-2 ring-blue-300'
                              : isHighlighted
                              ? 'border-orange-500 bg-orange-100 text-gray-900 scale-105 shadow-lg'
                              : 'border-orange-400 bg-orange-50 text-gray-900'
                          } ${
                            isClickable
                              ? 'hover:opacity-80 cursor-pointer'
                              : 'cursor-not-allowed opacity-60'
                          }`}
                          disabled={!isClickable}
                        >
                          {memberName || '\u00A0'}
                        </button>
                      </td>
                    );
                  })}
                  <td className="border border-gray-300 p-2 sm:p-3 bg-gray-50 w-32 sm:w-40">
                    {taskLabel.rightLabel && (
                      <div className="font-medium text-gray-600 text-sm sm:text-base whitespace-nowrap text-center">
                        {taskLabel.rightLabel}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          onClick={handleShuffle}
          disabled={isShuffling || isShufflingAnimation || hasTodayAssignment}
          className="px-6 py-3 sm:px-8 sm:py-4 bg-amber-700 text-white text-base sm:text-lg rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isShuffling || isShufflingAnimation ? 'シャッフル中...' : 'シャッフルして担当を決める'}
        </button>
        {hasTodayAssignment && !isShuffling && !isShufflingAnimation && (
          <p className="text-sm text-gray-600">
            既にシャッフル済みです
          </p>
        )}
      </div>
    </div>
  );
}

