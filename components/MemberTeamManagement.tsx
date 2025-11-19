'use client';















import { useState, useEffect, useRef, useCallback } from 'react';







import type { AppData, Team, Member, Manager } from '@/types';






















interface MemberTeamManagementProps {







  data: AppData | null;







  onUpdate: (data: AppData) => void;







}















export function MemberTeamManagement({ data, onUpdate }: MemberTeamManagementProps) {







  if (!data) {







    return (







      <div className="rounded-lg bg-white p-6 shadow-md">







        <p className="text-center text-gray-500">データがありません</p>







      </div>







    );







  }















  const teams = data.teams;







  const [localTeams, setLocalTeams] = useState<Array<{ id: string; name: string }>>([]);







  const [membersByTeam, setMembersByTeam] = useState<{ [teamId: string]: Array<Member & { excludedTaskLabelIds?: string[] }> }>({});







  const [expandedMembers, setExpandedMembers] = useState<{ [memberId: string]: boolean }>({});







  const [localManager, setLocalManager] = useState<{ id: string; name: string }>(







    data.manager ? { id: data.manager.id, name: data.manager.name } : { id: crypto.randomUUID(), name: '' }







  );







  const [isEditingManager, setIsEditingManager] = useState(false);







  const localManagerRef = useRef<{ id: string; name: string } | null>(null);







  const dataRef = useRef<AppData>(data);







  const onUpdateRef = useRef(onUpdate);







  const lastSavedManagerRef = useRef<{ id: string; name: string } | null>(







    data.manager ? { id: data.manager.id, name: data.manager.name } : null







  );







  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);















  useEffect(() => {







    if (localTeams.length === 0 && teams.length > 0) {







      setLocalTeams(teams.map((t) => ({ id: t.id, name: t.name })));







      







      const membersMap: { [teamId: string]: Array<Member & { excludedTaskLabelIds?: string[] }> } = {};







      teams.forEach((team) => {







        const teamMembers = data.members.filter((m) => m.teamId === team.id);







        membersMap[team.id] = teamMembers.map((m) => ({







          ...m,







          excludedTaskLabelIds: (m as any).excludedTaskLabelIds || [],







        }));







      });







      setMembersByTeam(membersMap);







      return;







    }















    if (teams.length > localTeams.length) {







      const existingIds = new Set(localTeams.map((t) => t.id));







      const newTeams = teams







        .filter((t) => !existingIds.has(t.id))







        .map((t) => ({ id: t.id, name: t.name }));







      







      if (newTeams.length > 0) {







        setLocalTeams((prev) => [...prev, ...newTeams]);







        newTeams.forEach((team) => {







          const teamMembers = data.members.filter((m) => m.teamId === team.id);







          setMembersByTeam((prev) => ({







            ...prev,







            [team.id]: teamMembers.map((m) => ({







              ...m,







              excludedTaskLabelIds: (m as any).excludedTaskLabelIds || [],







            })),







          }));







        });







      }







      return;







    }















    // メンバーの同期







    setMembersByTeam((prev) => {







      const updated = { ...prev };







      let changed = false;















      teams.forEach((team) => {







        const currentMembers = data.members.filter((m) => m.teamId === team.id);







        const prevMembers = prev[team.id] || [];







        const memberIds = new Set(currentMembers.map((m) => m.id));







        const filtered = prevMembers.filter((m) => memberIds.has(m.id));















        if (filtered.length !== prevMembers.length) {







          const unique = new Set<string>();







          updated[team.id] = filtered.filter((m) => {







            if (unique.has(m.id)) return false;







            unique.add(m.id);







            return true;







          });







          changed = true;







        } else {







          const unique = new Set<string>();







          const deduplicated = prevMembers.filter((m) => {







            if (unique.has(m.id)) return false;







            unique.add(m.id);







            return true;







          });







          if (deduplicated.length !== prevMembers.length) {







            updated[team.id] = deduplicated;







            changed = true;







          }







        }







      });















      return changed ? updated : prev;







    });







  }, [teams.length, data.members, localTeams.length]);















  // dataRefとonUpdateRefを常に最新の値で更新







  useEffect(() => {







    dataRef.current = data;







    onUpdateRef.current = onUpdate;







    // data.managerが更新されたら、lastSavedManagerRefも更新







    if (data.manager) {







      lastSavedManagerRef.current = { id: data.manager.id, name: data.manager.name };







    } else {







      lastSavedManagerRef.current = null;







    }







  }, [data, onUpdate]);















  // localManagerRefを常に最新の値で更新







  useEffect(() => {







    localManagerRef.current = localManager;







  }, [localManager]);















  // デバウンス付き保存関数







  const debouncedSaveManager = useCallback((managerName: string) => {







    // 既存のタイマーをクリア







    if (debounceTimerRef.current) {







      clearTimeout(debounceTimerRef.current);







      debounceTimerRef.current = null;







    }















    // 新しいタイマーを設定（500ms後に保存）







    debounceTimerRef.current = setTimeout(() => {







      const currentManager = localManagerRef.current;







      if (!currentManager) return;















      const trimmedName = managerName.trim();







      







      // 空の名前の場合はmanagerをundefinedにする







      if (trimmedName === '') {







        if (lastSavedManagerRef.current) {







          const updatedData: AppData = {







            ...dataRef.current,







            manager: undefined,







          };







          onUpdateRef.current(updatedData);







          lastSavedManagerRef.current = null;







        }







        return;







      }















      // 前回保存した値と比較して、変更がある場合のみ保存







      if (!lastSavedManagerRef.current || 







          lastSavedManagerRef.current.id !== currentManager.id ||







          lastSavedManagerRef.current.name !== trimmedName) {







        const updatedManager: Manager = {







          id: currentManager.id,







          name: trimmedName,







        };







        const updatedData: AppData = {







          ...dataRef.current,







          manager: updatedManager,







        };







        onUpdateRef.current(updatedData);







        lastSavedManagerRef.current = { id: updatedManager.id, name: updatedManager.name };







      }







    }, 500);







  }, []);















  // コンポーネントのアンマウント時に保存







  useEffect(() => {







    return () => {







      // デバウンスタイマーをクリア







      if (debounceTimerRef.current) {







        clearTimeout(debounceTimerRef.current);







        debounceTimerRef.current = null;







      }















      // アンマウント時に即座に保存（最新の値を参照、変更がある場合のみ）







      if (localManagerRef.current) {







        const trimmedName = localManagerRef.current.name.trim();







        // 空の名前の場合はmanagerをundefinedにする







        if (trimmedName === '') {







          if (lastSavedManagerRef.current) {







            const updatedData: AppData = {







              ...dataRef.current,







              manager: undefined,







            };







            onUpdateRef.current(updatedData);







            lastSavedManagerRef.current = null;







          }







          return;







        }







        if (!lastSavedManagerRef.current || 







            lastSavedManagerRef.current.id !== localManagerRef.current.id ||







            lastSavedManagerRef.current.name !== trimmedName) {







          const updatedManager: Manager = {







            id: localManagerRef.current.id,







            name: trimmedName,







          };







          const updatedData: AppData = {







            ...dataRef.current,







            manager: updatedManager,







          };







          onUpdateRef.current(updatedData);







          lastSavedManagerRef.current = { id: updatedManager.id, name: updatedManager.name };







        }







      }







    };







  }, []);















  // 管理者の同期（外部からの変更を反映）







  useEffect(() => {







    // 編集中の場合は外部からの変更を無視







    if (isEditingManager) {







      return;







    }















    if (data.manager) {







      // localManagerが存在しないか、IDが異なる場合のみ更新







      if (!localManager || localManager.id !== data.manager.id) {







        setLocalManager({ id: data.manager.id, name: data.manager.name });







      }







      // IDが一致する場合は、localManagerの値を優先（編集中の可能性があるため）







    } else {







      // data.managerがundefinedの場合でも、localManagerは空の状態を保持







      // localManagerが存在しない場合のみ初期化







      if (!localManager) {







        setLocalManager({ id: crypto.randomUUID(), name: '' });







      }







    }







  }, [data.manager?.id, isEditingManager]);















  const updateMember = (memberId: string, updates: Partial<Member>) => {







    const member = data.members.find((m) => m.id === memberId);







    if (!member) return;















    const updatedMembers = data.members.map((m) => (m.id === memberId ? { ...m, ...updates } : m));







    







    // メンバー名が入力された場合、その班のすべてのラベルに対して割り当てを作成







    const updatedMember = { ...member, ...updates };







    if (updatedMember.name && updatedMember.name.trim()) {







      const today = new Date().toISOString().split('T')[0];







      const existingAssignmentKeys = new Set(







        data.assignments.map((a) => `${a.teamId}-${a.taskLabelId}`)







      );















      const newAssignments = data.taskLabels







        .filter((label) => {







          // 除外ラベルでない場合のみ追加







          return !(updatedMember.excludedTaskLabelIds || []).includes(label.id);







        })







        .filter((label) => {







          // 既存の割り当てがない場合のみ追加







          return !existingAssignmentKeys.has(`${updatedMember.teamId}-${label.id}`);







        })







        .map((label) => ({







          teamId: updatedMember.teamId,







          taskLabelId: label.id,







          memberId: null,







          assignedDate: today,







        }));















      const updatedData: AppData = {







        ...data,







        members: updatedMembers,







        assignments: [...data.assignments, ...newAssignments],







      };







      onUpdate(updatedData);







    } else {







      const updatedData: AppData = {







        ...data,







        members: updatedMembers,







      };







      onUpdate(updatedData);







    }







  };















  return (







    <div className="space-y-4 sm:space-y-6">







      {/* 班管理 */}







      <div className="bg-white rounded-lg shadow p-4 sm:p-6">







        <div className="mb-4">







          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">班</h2>







        </div>







        <div className="space-y-3 mb-4">







          {localTeams.length === 0 ? (







            <p className="text-gray-500 text-sm sm:text-base">







              班がありません。「入力欄を追加」ボタンで追加してください。







            </p>







          ) : (







            localTeams.map((team) => (







              <div







                key={team.id}







                className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200"







              >







                <input







                  type="text"







                  value={team.name}







                  onChange={(e) => {







                    setLocalTeams((prev) =>







                      prev.map((t) => (t.id === team.id ? { ...t, name: e.target.value } : t))







                    );







                  }}







                  onBlur={() => {







                    const teamData = localTeams.find((t) => t.id === team.id);







                    if (teamData && teamData.name.trim()) {







                      const updatedData: AppData = {







                        ...data,







                        teams: data.teams.map((t) =>







                          t.id === team.id ? { ...t, name: teamData.name.trim() } : t







                        ),







                      };







                      onUpdate(updatedData);







                    }







                  }}







                  placeholder="班名を入力"







                  className="flex-1 px-3 py-2 sm:py-3 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"







                />







                <button







                  onClick={() => {







                    if (confirm('この班を削除しますか？所属するメンバーも削除されます。')) {







                      const currentHistoryByDate =







                        data.assignmentHistoryByDate || groupAssignmentsByDate(data.assignmentHistory);







                      const filteredHistoryByDate = filterAssignmentHistoryByPredicate(







                        currentHistoryByDate,







                        (a) => a.teamId !== team.id







                      );







                      const updatedData: AppData = {







                        ...data,







                        teams: data.teams.filter((t) => t.id !== team.id),







                        members: data.members.filter((m) => m.teamId !== team.id),







                        assignments: data.assignments.filter((a) => a.teamId !== team.id),







                        assignmentHistory: data.assignmentHistory.filter((a) => a.teamId !== team.id),














                      };







                      onUpdate(updatedData);







                      setLocalTeams((prev) => prev.filter((t) => t.id !== team.id));







                      setMembersByTeam((prev) => {







                        const updated = { ...prev };







                        delete updated[team.id];







                        return updated;







                      });







                    }







                  }}







                  className="w-full md:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex-shrink-0"







                >







                  削除







                </button>







              </div>







            ))







          )}







        </div>







        <div className="mt-4 flex items-center justify-center">







          <button







            onClick={() => {







              const newTeam: Team = {







                id: crypto.randomUUID(),







                name: '',







                order: data.teams.length,







              };







              const updatedData: AppData = {







                ...data,







                teams: [...data.teams, newTeam],







              };







              onUpdate(updatedData);







              setLocalTeams((prev) => [...prev, { id: newTeam.id, name: '' }]);







              setMembersByTeam((prev) => ({ ...prev, [newTeam.id]: [] }));







            }}







            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-amber-600 text-white text-sm sm:text-base rounded hover:bg-amber-700 transition-colors flex items-center justify-center"







          >







            入力欄を追加







          </button>







        </div>







      </div>















      {/* 管理者管理 */}







      <div className="bg-white rounded-lg shadow p-4 sm:p-6">







        <div className="mb-4">







          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">管理者</h2>







          <p className="text-sm text-gray-600 mt-1">







            管理者は担当表には表示されません。全体で1人のみ登録できます。







          </p>







        </div>







        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200">







          <input







            type="text"







            value={localManager?.name || ''}







            onChange={(e) => {







              const newManager = (() => {







                if (!localManager) {







                  return { id: crypto.randomUUID(), name: e.target.value };







                }







                return { ...localManager, name: e.target.value };







              })();







              setLocalManager(newManager);







              // localManagerRefも即座に更新







              localManagerRef.current = newManager;







              // デバウンス付きで保存







              debouncedSaveManager(e.target.value);







            }}







            onFocus={() => {







              setIsEditingManager(true);







            }}







            onBlur={(e) => {







              setIsEditingManager(false);







              







              // デバウンスタイマーをクリアして即座に保存







              if (debounceTimerRef.current) {







                clearTimeout(debounceTimerRef.current);







                debounceTimerRef.current = null;







              }















              // localManagerRef.currentを使用して最新の値を取得







              const currentManager = localManagerRef.current;







              if (currentManager) {







                const trimmedName = e.target.value.trim();







                // 空の名前の場合はmanagerをundefinedにする







                if (trimmedName === '') {







                  if (lastSavedManagerRef.current) {







                    const updatedData: AppData = {







                      ...dataRef.current,







                      manager: undefined,







                    };







                    onUpdateRef.current(updatedData);







                    lastSavedManagerRef.current = null;







                  }







                  return;







                }







                // 前回保存した値と比較して、変更がある場合のみ保存







                if (!lastSavedManagerRef.current || 







                    lastSavedManagerRef.current.id !== currentManager.id ||







                    lastSavedManagerRef.current.name !== trimmedName) {







                  const updatedManager: Manager = {







                    id: currentManager.id,







                    name: trimmedName,







                  };







                  const updatedData: AppData = {







                    ...dataRef.current,







                    manager: updatedManager,







                  };







                  onUpdateRef.current(updatedData);







                  lastSavedManagerRef.current = { id: updatedManager.id, name: updatedManager.name };







                }







              }







            }}







            placeholder="管理者名を入力"







            className="flex-1 px-3 py-2 sm:py-3 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"







          />







          {localManager && localManager.name.trim() && (







            <button







              onClick={() => {







                if (confirm('管理者を削除しますか？')) {







                  const updatedData: AppData = {







                    ...data,







                    manager: undefined,







                  };







                  onUpdate(updatedData);







                  setLocalManager({ id: crypto.randomUUID(), name: '' });







                }







              }}







              className="w-full md:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex-shrink-0"







            >







              削除







            </button>







          )}







        </div>







      </div>















      {/* メンバー管理 */}







      <div className="bg-white rounded-lg shadow p-4 sm:p-6">







        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">メンバー</h2>







        {teams.length === 0 ? (







          <p className="text-gray-500">まず班を作成してください</p>







        ) : (







          <div className="space-y-4">







            {teams.map((team) => {







              const members = membersByTeam[team.id] || [];







              return (







                <div key={team.id} className="border-t pt-4">







                  <div className="mb-3">







                    <h3 className="font-medium text-gray-800 text-sm sm:text-base">{team.name}</h3>







                  </div>







                  {members.length === 0 ? (







                    <p className="text-sm sm:text-base text-gray-500 mb-2">







                      メンバーがいません。「入力欄を追加」ボタンで追加してください。







                    </p>







                  ) : (







                    <div className="space-y-2 mb-4">







                      {members.map((member) => {







                        const taskLabels = data.taskLabels;







                        const excludedIds = member.excludedTaskLabelIds || [];







                        return (







                          <div







                            key={member.id}







                            className="flex flex-col gap-3 p-3 bg-gray-50 rounded border border-gray-200"







                          >







                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">







                              <input







                                type="text"







                                value={member.name}







                                onChange={(e) => {







                                  setMembersByTeam((prev) => ({







                                    ...prev,







                                    [team.id]: (prev[team.id] || []).map((m) =>







                                      m.id === member.id ? { ...m, name: e.target.value } : m







                                    ),







                                  }));







                                }}







                                onBlur={() => {







                                  const memberData = membersByTeam[team.id]?.find((m) => m.id === member.id);







                                  if (memberData && memberData.name.trim()) {







                                    updateMember(member.id, {







                                      name: memberData.name.trim(),







                                      teamId: memberData.teamId,







                                      excludedTaskLabelIds: memberData.excludedTaskLabelIds || [],







                                    });







                                  }







                                }}







                                placeholder="メンバー名を入力"







                                className="flex-1 px-3 py-2 sm:py-3 border border-gray-300 rounded text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"







                              />







                              <button







                                onClick={() => {







                                  if (confirm('このメンバーを削除しますか？')) {










                                    const updatedData: AppData = {







                                      ...data,







                                      members: data.members.filter((m) => m.id !== member.id),







                                      assignments: data.assignments.map((a) =>







                                        a.memberId === member.id ? { ...a, memberId: null } : a







                                      ),







                                      assignmentHistory: data.assignmentHistory.filter(

                                        (a) => a.memberId !== member.id

                                      ),








                                    };







                                    onUpdate(updatedData);







                                    setMembersByTeam((prev) => {







                                      const updated = { ...prev };







                                      Object.keys(updated).forEach((teamId) => {







                                        updated[teamId] = updated[teamId].filter((m) => m.id !== member.id);







                                      });







                                      return updated;







                                    });







                                  }







                                }}







                                className="w-full md:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex-shrink-0"







                              >







                                削除







                              </button>







                            </div>







                            {taskLabels.length > 0 && (







                              <div className="border-t pt-2 mt-2">







                                <button







                                  type="button"







                                  onClick={() => {







                                    setExpandedMembers((prev) => ({







                                      ...prev,







                                      [member.id]: !prev[member.id],







                                    }));







                                  }}







                                  className="flex items-center justify-between w-full text-left text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"







                                >







                                  <div className="flex items-center gap-2">







                                    <span>除外する担当ラベル</span>







                                    {excludedIds.length > 0 && (







                                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full">







                                        {excludedIds.length}







                                      </span>







                                    )}







                                  </div>







                                  <svg







                                    className={`w-4 h-4 text-gray-500 transition-transform ${







                                      expandedMembers[member.id] ? 'transform rotate-180' : ''







                                    }`}







                                    fill="none"







                                    stroke="currentColor"







                                    viewBox="0 0 24 24"







                                  >







                                    <path







                                      strokeLinecap="round"







                                      strokeLinejoin="round"







                                      strokeWidth={2}







                                      d="M19 9l-7 7-7-7"







                                    />







                                  </svg>







                                </button>







                                {expandedMembers[member.id] && (







                                  <div className="mt-3">







                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">







                                      {taskLabels.map((label) => {







                                        const isExcluded = excludedIds.includes(label.id);







                                        const labelText = label.rightLabel







                                          ? `${label.leftLabel} / ${label.rightLabel}`







                                          : label.leftLabel;







                                        return (







                                          <label







                                            key={label.id}







                                            className="flex items-center gap-2 sm:gap-3 px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 hover:border-amber-400 transition-colors"







                                          >







                                            <input







                                              type="checkbox"







                                              checked={isExcluded}







                                              onChange={(e) => {







                                                const memberData = membersByTeam[team.id]?.find(







                                                  (m) => m.id === member.id







                                                );







                                                if (!memberData) return;















                                                const currentExcluded = memberData.excludedTaskLabelIds || [];







                                                const newExcluded = e.target.checked







                                                  ? [...currentExcluded, label.id]







                                                  : currentExcluded.filter((id) => id !== label.id);















                                                setMembersByTeam((prev) => ({







                                                  ...prev,







                                                  [team.id]: (prev[team.id] || []).map((m) =>







                                                    m.id === member.id







                                                      ? { ...m, excludedTaskLabelIds: newExcluded }







                                                      : m







                                                  ),







                                                }));















                                                updateMember(member.id, {







                                                  name: memberData.name.trim(),







                                                  teamId: memberData.teamId,







                                                  excludedTaskLabelIds: newExcluded,







                                                });







                                              }}







                                              className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 flex-shrink-0"







                                            />







                                            <span







                                              className={`text-gray-700 flex-1 ${







                                                isExcluded ? 'font-medium text-amber-700' : ''







                                              }`}







                                            >







                                              {labelText}







                                            </span>







                                          </label>







                                        );







                                      })}







                                    </div>







                                  </div>







                                )}







                              </div>







                            )}







                          </div>







                        );







                      })}







                    </div>







                  )}







                  <div className="mt-4 flex items-center justify-center">







                    <button







                      onClick={() => {







                        const newMember: Member = {







                          id: crypto.randomUUID(),







                          name: '',







                          teamId: team.id,







                          excludedTaskLabelIds: [],







                        };







                        







                        // 新しいメンバーに対して、その班のすべてのラベルに対して割り当てを確実に作成







                        const today = new Date().toISOString().split('T')[0];







                        const existingAssignmentKeys = new Set(







                          data.assignments.map((a) => `${a.teamId}-${a.taskLabelId}`)







                        );







                        







                        // その班のすべてのラベルに対して割り当てを作成（既存のものは更新しない）







                        const newAssignments = data.taskLabels







                          .filter((label) => {







                            // 除外ラベルでない場合のみ追加







                            return !(newMember.excludedTaskLabelIds || []).includes(label.id);







                          })







                          .filter((label) => {







                            // 既存の割り当てがない場合のみ追加







                            return !existingAssignmentKeys.has(`${team.id}-${label.id}`);







                          })







                          .map((label) => ({







                            teamId: team.id,







                            taskLabelId: label.id,







                            memberId: null,







                            assignedDate: today,







                          }));







                        







                        const updatedData: AppData = {







                          ...data,







                          members: [...data.members, newMember],







                          assignments: [...data.assignments, ...newAssignments],







                        };







                        onUpdate(updatedData);







                        setMembersByTeam((prev) => {







                          const teamMembers = prev[team.id] || [];







                          if (teamMembers.some((m) => m.id === newMember.id)) {







                            return prev;







                          }







                          return {







                            ...prev,







                            [team.id]: [







                              ...teamMembers,







                              {







                                ...newMember,







                                excludedTaskLabelIds: [],







                              },







                            ],







                          };







                        });







                      }}







                      className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-amber-600 text-white text-sm sm:text-base rounded hover:bg-amber-700 transition-colors flex items-center justify-center"







                    >







                      入力欄を追加







                    </button>







                  </div>







                </div>







              );







            })}







          </div>







        )}







      </div>







    </div>







  );







}

