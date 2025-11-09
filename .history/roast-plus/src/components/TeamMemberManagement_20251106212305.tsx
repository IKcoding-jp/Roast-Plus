'use client';

import { useState, useEffect } from 'react';
import type { Team, Member, AppData } from '@/types';
import {
  addTeam,
  updateTeam,
  deleteTeam,
  addMember,
  updateMember,
  deleteMember,
  getTeams,
  getMembers,
  getTaskLabels,
} from '@/lib/firestore';

type TeamMemberManagementProps = {
  data: AppData;
  onUpdate: (data: AppData) => void;
};

export default function TeamMemberManagement({
  data,
  onUpdate,
}: TeamMemberManagementProps) {
  const teams = getTeams(data);

  // 班管理用のstate
  const [teamInputs, setTeamInputs] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // メンバー管理用のstate（班ごと）
  const [memberInputs, setMemberInputs] = useState<
    Record<
      string,
      Array<{
        id: string;
        name: string;
        teamId: string;
        excludedTaskLabelIds: string[];
      }>
    >
  >({});

  // 既存のデータを初期化
  useEffect(() => {
    // 初回マウント時のみ既存のデータを入力欄に反映
    if (teamInputs.length === 0 && teams.length > 0) {
      // 班を入力欄に反映
      setTeamInputs(
        teams.map((team) => ({
          id: team.id,
          name: team.name,
        }))
      );

      // メンバーを入力欄に反映
      const memberInputsMap: Record<
        string,
        Array<{
          id: string;
          name: string;
          teamId: string;
          excludedTaskLabelIds: string[];
        }>
      > = {};
      teams.forEach((team) => {
        const members = getMembers(data, team.id);
        memberInputsMap[team.id] = members.map((member) => ({
          id: member.id,
          name: member.name,
          teamId: member.teamId,
          excludedTaskLabelIds: member.excludedTaskLabelIds || [],
        }));
      });
      setMemberInputs(memberInputsMap);
      return;
    }
    // 班が追加された場合のみ追加
    if (teams.length > teamInputs.length) {
      const currentTeamIds = new Set(teamInputs.map((input) => input.id));
      const newTeams = teams
        .filter((team) => !currentTeamIds.has(team.id))
        .map((team) => ({
          id: team.id,
          name: team.name,
        }));

      if (newTeams.length > 0) {
        setTeamInputs((prev) => [...prev, ...newTeams]);

        // 新しい班のメンバー入力欄を初期化（重複チェック）
        newTeams.forEach((team) => {
          const members = getMembers(data, team.id);
          setMemberInputs((prev) => {
            // 既に存在する場合はスキップ
            if (prev[team.id] && prev[team.id].length > 0) {
              return prev;
            }
            return {
              ...prev,
              [team.id]: members.map((member) => ({
                id: member.id,
                name: member.name,
                teamId: member.teamId,
                excludedTaskLabelIds: member.excludedTaskLabelIds || [],
              })),
            };
          });
        });
      }
      return;
    }
    // メンバーが削除された場合のみ更新（追加はhandleAddMemberInputRowで処理）
    setMemberInputs((prev) => {
      const updated = { ...prev };
      let hasChanges = false;

      teams.forEach((team) => {
        const members = getMembers(data, team.id);
        const currentMembers = prev[team.id] || [];
        const membersFromData = new Set(members.map((m) => m.id));
        
        // 削除されたメンバーを除外
        const existingMembers = currentMembers.filter((m) =>
          membersFromData.has(m.id)
        );

        // 削除されたメンバーがある場合のみ更新
        if (existingMembers.length !== currentMembers.length) {
          // 重複チェック：配列内に重複がないことを確認
          const uniqueIds = new Set(existingMembers.map((m) => m.id));
          if (uniqueIds.size === existingMembers.length) {
            updated[team.id] = existingMembers;
            hasChanges = true;
          } else {
            // 重複がある場合は、重複を除去
            const seen = new Set<string>();
            const deduplicated = existingMembers.filter((m) => {
              if (seen.has(m.id)) {
                return false;
              }
              seen.add(m.id);
              return true;
            });
            updated[team.id] = deduplicated;
            hasChanges = true;
          }
        } else {
          // 削除されていなくても、重複がある場合は修正
          const uniqueIds = new Set(currentMembers.map((m) => m.id));
          if (uniqueIds.size !== currentMembers.length) {
            const seen = new Set<string>();
            const deduplicated = currentMembers.filter((m) => {
              if (seen.has(m.id)) {
                return false;
              }
              seen.add(m.id);
              return true;
            });
            updated[team.id] = deduplicated;
            hasChanges = true;
          }
        }
      });

      return hasChanges ? updated : prev;
    });
  }, [teams.length]); // 班の数が変わった時のみ更新

  // 班管理の関数
  const handleAddTeamInputRow = () => {
    const newTeamId = crypto.randomUUID();
    const newTeam: Team = {
      id: newTeamId,
      name: '',
    };

    const updated = addTeam(data, newTeam);
    onUpdate(updated);

    setTeamInputs((prev) => [
      ...prev,
      { id: newTeamId, name: '' },
    ]);

    // 新しい班のメンバー入力欄を初期化
    setMemberInputs((prev) => ({
      ...prev,
      [newTeamId]: [],
    }));
  };

  const handleTeamInputChange = (teamId: string, value: string) => {
    setTeamInputs((prev) =>
      prev.map((input) =>
        input.id === teamId ? { ...input, name: value } : input
      )
    );
  };

  const handleTeamInputBlur = (teamId: string) => {
    const input = teamInputs.find((input) => input.id === teamId);
    if (!input) return;

    // 班名が空の場合は何もしない（削除は明示的な削除ボタンでのみ）
    if (!input.name.trim()) {
      return;
    }

    // 班を更新
    const updated = updateTeam(data, teamId, { name: input.name.trim() });
    onUpdate(updated);
  };

  const handleDeleteTeam = (teamId: string) => {
    if (!confirm('この班を削除しますか？所属するメンバーも削除されます。'))
      return;

    const updated = deleteTeam(data, teamId);
    onUpdate(updated);
    setTeamInputs((prev) => prev.filter((input) => input.id !== teamId));

    // メンバー入力欄も削除
    setMemberInputs((prev) => {
      const newInputs = { ...prev };
      delete newInputs[teamId];
      return newInputs;
    });
  };

  // メンバー管理の関数
  const handleAddMemberInputRow = (teamId: string) => {
    const newMemberId = crypto.randomUUID();
    const newMember: Member = {
      id: newMemberId,
      name: '',
      teamId,
      excludedTaskLabelIds: [],
    };

    const updated = addMember(data, newMember);
    onUpdate(updated);

    setMemberInputs((prev) => {
      const currentMembers = prev[teamId] || [];
      // 重複チェック：既に同じIDのメンバーが存在しないことを確認
      const existingIds = new Set(currentMembers.map((m) => m.id));
      if (existingIds.has(newMemberId)) {
        return prev; // 既に存在する場合は追加しない
      }
      return {
        ...prev,
        [teamId]: [
          ...currentMembers,
          { id: newMemberId, name: '', teamId, excludedTaskLabelIds: [] },
        ],
      };
    });
  };

  const handleMemberInputChange = (
    teamId: string,
    memberId: string,
    value: string
  ) => {
    setMemberInputs((prev) => ({
      ...prev,
      [teamId]: (prev[teamId] || []).map((input) =>
        input.id === memberId ? { ...input, name: value } : input
      ),
    }));
  };

  const handleMemberInputBlur = (teamId: string, memberId: string) => {
    const teamMembers = memberInputs[teamId] || [];
    const input = teamMembers.find((input) => input.id === memberId);
    if (!input) return;

    // メンバー名が空の場合は何もしない（削除は明示的な削除ボタンでのみ）
    if (!input.name.trim()) {
      return;
    }

    // メンバーを更新
    const updated = updateMember(data, memberId, {
      name: input.name.trim(),
      teamId: input.teamId,
      excludedTaskLabelIds: input.excludedTaskLabelIds,
    });
    onUpdate(updated);
  };

  const handleExcludedTaskLabelChange = (
    teamId: string,
    memberId: string,
    taskLabelId: string,
    checked: boolean
  ) => {
    // 現在の状態から新しい除外リストを計算
    const teamMembers = memberInputs[teamId] || [];
    const input = teamMembers.find((input) => input.id === memberId);
    if (!input) return;

    const currentExcluded = input.excludedTaskLabelIds || [];
    const newExcluded = checked
      ? [...currentExcluded, taskLabelId]
      : currentExcluded.filter((id) => id !== taskLabelId);

    // 状態を更新
    setMemberInputs((prev) => {
      const teamMembers = prev[teamId] || [];
      return {
        ...prev,
        [teamId]: teamMembers.map((input) =>
          input.id === memberId
            ? { ...input, excludedTaskLabelIds: newExcluded }
            : input
        ),
      };
    });

    // データを更新（状態更新の外で実行）
    const updated = updateMember(data, memberId, {
      name: input.name.trim(),
      teamId: input.teamId,
      excludedTaskLabelIds: newExcluded,
    });
    onUpdate(updated);
  };

  const handleDeleteMember = (memberId: string) => {
    if (!confirm('このメンバーを削除しますか？')) return;

    const updated = deleteMember(data, memberId);
    onUpdate(updated);

    // メンバー入力欄から削除
    setMemberInputs((prev) => {
      const newInputs = { ...prev };
      Object.keys(newInputs).forEach((teamId) => {
        newInputs[teamId] = newInputs[teamId].filter(
          (input) => input.id !== memberId
        );
      });
      return newInputs;
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 班管理 */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 gap-3 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">班管理</h2>
          <button
            onClick={handleAddTeamInputRow}
            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-amber-600 text-white text-sm sm:text-base rounded hover:bg-amber-700 transition-colors"
          >
            入力欄を追加
          </button>
        </div>

        <div className="space-y-3">
          {teamInputs.length === 0 ? (
            <p className="text-gray-500 text-sm sm:text-base">
              班がありません。「入力欄を追加」ボタンで追加してください。
            </p>
          ) : (
            teamInputs.map((input) => (
              <div
                key={input.id}
                className="flex flex-col md:flex-row items-stretch md:items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200"
              >
                <input
                  type="text"
                  value={input.name}
                  onChange={(e) =>
                    handleTeamInputChange(input.id, e.target.value)
                  }
                  onBlur={() => handleTeamInputBlur(input.id)}
                  placeholder="班名を入力"
                  className="flex-1 px-3 py-2 sm:py-3 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={() => handleDeleteTeam(input.id)}
                  className="w-full md:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  削除
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* メンバー管理 */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">メンバー管理</h2>

        {teams.length === 0 ? (
          <p className="text-gray-500">まず班を作成してください</p>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => {
              const teamMembers = memberInputs[team.id] || [];
              return (
                <div key={team.id} className="border-t pt-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-3 gap-2 sm:gap-0">
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base">{team.name}</h3>
                    <button
                      onClick={() => handleAddMemberInputRow(team.id)}
                      className="w-full sm:w-auto px-3 py-1 sm:py-2 text-sm sm:text-base bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                    >
                      入力欄を追加
                    </button>
                  </div>

                  {teamMembers.length === 0 ? (
                    <p className="text-sm sm:text-base text-gray-500 mb-2">
                      メンバーがいません。「入力欄を追加」ボタンで追加してください。
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {teamMembers.map((input) => {
                        const taskLabels = getTaskLabels(data);
                        const excludedIds = input.excludedTaskLabelIds || [];
                        return (
                          <div
                            key={input.id}
                            className="flex flex-col gap-3 p-3 bg-gray-50 rounded border border-gray-200"
                          >
                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                              <input
                                type="text"
                                value={input.name}
                                onChange={(e) =>
                                  handleMemberInputChange(
                                    team.id,
                                    input.id,
                                    e.target.value
                                  )
                                }
                                onBlur={() =>
                                  handleMemberInputBlur(team.id, input.id)
                                }
                                placeholder="メンバー名を入力"
                                className="flex-1 px-3 py-2 sm:py-3 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                              <button
                                onClick={() => handleDeleteMember(input.id)}
                                className="w-full md:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              >
                                削除
                              </button>
                            </div>
                            {taskLabels.length > 0 && (
                              <div className="border-t pt-2 mt-2">
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                  除外する担当ラベル
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {taskLabels.map((label) => {
                                    const isExcluded = excludedIds.includes(
                                      label.id
                                    );
                                    const labelText = label.rightLabel
                                      ? `${label.leftLabel} / ${label.rightLabel}`
                                      : label.leftLabel;
                                    return (
                                      <label
                                        key={label.id}
                                        className="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isExcluded}
                                          onChange={(e) =>
                                            handleExcludedTaskLabelChange(
                                              team.id,
                                              input.id,
                                              label.id,
                                              e.target.checked
                                            )
                                          }
                                          className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                        />
                                        <span className="text-gray-700">
                                          {labelText}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
