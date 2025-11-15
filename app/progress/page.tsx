'use client';

import { useState, useMemo } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { addWorkProgress, updateWorkProgress, deleteWorkProgress, addProgressToWorkProgress, addCompletedCountToWorkProgress } from '@/lib/firestore';
import { HiArrowLeft, HiPlus, HiX, HiPencil, HiTrash, HiFilter } from 'react-icons/hi';
import { MdTimeline, MdSort } from 'react-icons/md';
import LoginPage from '@/app/login/page';
import type { WorkProgress, WorkProgressStatus } from '@/types';

type SortOption = 'createdAt' | 'beanName' | 'status';

interface GroupedWorkProgress {
  groupName: string;
  taskName: string;
  weight: string;
  workProgresses: WorkProgress[];
}

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWorkProgressId, setEditingWorkProgressId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');
  const [filterTaskName, setFilterTaskName] = useState('');
  const [filterStatus, setFilterStatus] = useState<WorkProgressStatus | 'all'>('all');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [addingProgressWorkProgressId, setAddingProgressWorkProgressId] = useState<string | null>(null);
  const [addingToGroupName, setAddingToGroupName] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState<string | null>(null);
  const [showModeSelectDialog, setShowModeSelectDialog] = useState(false);
  const [addMode, setAddMode] = useState<'group' | 'work' | null>(null);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);

  // 作業をグループ化（groupNameが設定されている場合のみグループ化、未入力の場合は個別カードとして表示）
  // 注意: すべてのフックは早期リターンの前に呼び出す必要がある
  const groupedWorkProgresses = useMemo(() => {
    const workProgresses = data?.workProgresses || [];
    
    // フィルタリング
    let filtered = workProgresses.filter((wp) => {
      if (filterTaskName && wp.taskName && !wp.taskName.toLowerCase().includes(filterTaskName.toLowerCase())) {
        return false;
      }
      if (filterStatus !== 'all' && wp.status !== filterStatus) {
        return false;
      }
      return true;
    });

    // グループ化（groupNameが設定されている場合のみ）
    const groups = new Map<string, GroupedWorkProgress>();
    const ungroupedWorkProgresses: WorkProgress[] = [];
    
    filtered.forEach((wp) => {
      if (wp.groupName) {
        // groupNameが設定されている場合はグループ化（weightはグループ化のキーに含めない）
        const key = wp.groupName;
        
        if (!groups.has(key)) {
          groups.set(key, {
            groupName: wp.groupName,
            taskName: wp.taskName || '',
            weight: wp.weight || '', // 表示用（最初の作業のweightを表示）
            workProgresses: [],
          });
        }
        groups.get(key)!.workProgresses.push(wp);
      } else {
        // groupNameが未入力の場合は個別カードとして扱う
        ungroupedWorkProgresses.push(wp);
      }
    });

    // ソート
    const sortedGroups = Array.from(groups.values());
    
    sortedGroups.forEach((group) => {
      group.workProgresses.sort((a, b) => {
        if (sortOption === 'createdAt') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortOption === 'beanName') {
          // 優先順位: groupName > taskName
          const aName = a.groupName || a.taskName || '';
          const bName = b.groupName || b.taskName || '';
          return aName.localeCompare(bName, 'ja');
        } else if (sortOption === 'status') {
          const statusOrder: Record<WorkProgressStatus, number> = {
            pending: 0,
            in_progress: 1,
            completed: 2,
          };
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return 0;
      });
    });

    // グループ全体のソート
    sortedGroups.sort((a, b) => {
      if (sortOption === 'createdAt') {
        const aLatest = a.workProgresses[0]?.createdAt || '';
        const bLatest = b.workProgresses[0]?.createdAt || '';
        return new Date(bLatest).getTime() - new Date(aLatest).getTime();
      } else if (sortOption === 'beanName') {
        // 優先順位: groupName > taskName
        const aName = a.groupName || a.taskName || '';
        const bName = b.groupName || b.taskName || '';
        return aName.localeCompare(bName, 'ja');
      } else if (sortOption === 'status') {
        const statusOrder: Record<WorkProgressStatus, number> = {
          pending: 0,
          in_progress: 1,
          completed: 2,
        };
        const aStatus = a.workProgresses[0]?.status || 'pending';
        const bStatus = b.workProgresses[0]?.status || 'pending';
        return statusOrder[aStatus] - statusOrder[bStatus];
      }
      return 0;
    });

    // グループ化されていない作業のソート
    ungroupedWorkProgresses.sort((a, b) => {
      if (sortOption === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOption === 'beanName') {
        const aName = a.taskName || '';
        const bName = b.taskName || '';
        return aName.localeCompare(bName, 'ja');
      } else if (sortOption === 'status') {
        const statusOrder: Record<WorkProgressStatus, number> = {
          pending: 0,
          in_progress: 1,
          completed: 2,
        };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return 0;
    });

    return { groups: sortedGroups, ungrouped: ungroupedWorkProgresses };
  }, [data?.workProgresses, sortOption, filterTaskName, filterStatus]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // 作業進捗を追加
  const handleAddWorkProgress = async (workProgress: Omit<WorkProgress, 'id' | 'createdAt' | 'updatedAt'> | Partial<Omit<WorkProgress, 'id' | 'createdAt'>>) => {
    if (!user) return;
    
    try {
      // Partial型の場合は、必要なフィールドを補完
      const fullWorkProgress: Omit<WorkProgress, 'id' | 'createdAt' | 'updatedAt'> = {
        ...workProgress,
        status: workProgress.status || 'pending',
      } as Omit<WorkProgress, 'id' | 'createdAt' | 'updatedAt'>;
      
      // 同じグループ名のダミー作業（作業名が空の作業）が存在する場合は削除
      // weightに関係なく、同じgroupNameのダミー作業をすべて削除
      if (fullWorkProgress.groupName) {
        let currentData = data;
        const workProgresses = currentData?.workProgresses || [];
        const dummyWorks = workProgresses.filter(
          (wp) => wp.groupName === fullWorkProgress.groupName && (!wp.taskName || wp.taskName.trim() === '')
        );
        
        // ダミー作業を削除（削除後にデータを更新）
        for (const dummyWork of dummyWorks) {
          await deleteWorkProgress(user.uid, dummyWork.id, currentData);
          // 削除後のデータを更新（削除したIDを除外）
          if (currentData) {
            currentData = {
              ...currentData,
              workProgresses: currentData.workProgresses.filter((wp) => wp.id !== dummyWork.id),
            };
          }
        }
        
        // 削除後のデータを使用して作業を追加
        await addWorkProgress(user.uid, fullWorkProgress, currentData);
      } else {
        await addWorkProgress(user.uid, fullWorkProgress, data);
      }
      setShowAddForm(false);
      setAddingToGroupName(null);
      setAddMode(null);
    } catch (error) {
      console.error('Failed to add work progress:', error);
      alert('作業の追加に失敗しました');
    }
  };

  // 作業進捗を更新
  const handleUpdateWorkProgress = async (workProgressId: string, updates: Partial<WorkProgress>) => {
    if (!user) return;
    
    try {
      await updateWorkProgress(user.uid, workProgressId, updates, data);
      setEditingWorkProgressId(null);
    } catch (error) {
      console.error('Failed to update work progress:', error);
      alert('作業の更新に失敗しました');
    }
  };

  // 作業進捗を削除
  const handleDeleteWorkProgress = async (workProgressId: string) => {
    if (!user) return;
    if (!confirm('この作業を削除しますか？')) return;
    
    try {
      await deleteWorkProgress(user.uid, workProgressId, data);
    } catch (error) {
      console.error('Failed to delete work progress:', error);
      alert('作業の削除に失敗しました');
    }
  };

  // グループを削除
  const handleDeleteGroup = async (groupName: string) => {
    if (!user) return;
    if (!confirm(`「${groupName}」グループ内のすべての作業を削除しますか？`)) return;
    
    try {
      const groupWorkProgresses = data?.workProgresses?.filter((wp) => wp.groupName === groupName) || [];
      for (const wp of groupWorkProgresses) {
        await deleteWorkProgress(user.uid, wp.id, data);
      }
      setEditingGroupName(null);
    } catch (error) {
      console.error('Failed to delete group:', error);
      alert('グループの削除に失敗しました');
    }
  };

  // グループを更新
  const handleUpdateGroup = async (groupName: string, updates: { groupName?: string }) => {
    if (!user) return;
    
    try {
      const groupWorkProgresses = data?.workProgresses?.filter((wp) => wp.groupName === groupName) || [];
      for (const wp of groupWorkProgresses) {
        const updateData: Partial<WorkProgress> = {};
        if (updates.groupName !== undefined) {
          updateData.groupName = updates.groupName || undefined;
        }
        await updateWorkProgress(user.uid, wp.id, updateData, data);
      }
      setEditingGroupName(null);
    } catch (error) {
      console.error('Failed to update group:', error);
      alert('作業グループの更新に失敗しました');
    }
  };

  // 進捗状態を変更
  const handleStatusChange = async (workProgressId: string, newStatus: WorkProgressStatus) => {
    await handleUpdateWorkProgress(workProgressId, { status: newStatus });
  };

  // 進捗量を追加
  const handleAddProgress = async (workProgressId: string, amount: number, memo?: string) => {
    if (!user) return;
    
    try {
      const workProgress = data?.workProgresses?.find((wp) => wp.id === workProgressId);
      if (!workProgress) return;
      
      // 目標量がある場合は進捗量を追加、ない場合は完成数を追加
      if (workProgress.targetAmount !== undefined) {
        await addProgressToWorkProgress(user.uid, workProgressId, amount, data, memo);
      } else {
        await addCompletedCountToWorkProgress(user.uid, workProgressId, amount, data, memo);
      }
      setAddingProgressWorkProgressId(null);
    } catch (error) {
      console.error('Failed to add progress:', error);
      alert('進捗の追加に失敗しました');
    }
  };

  // 進捗率を計算
  const calculateProgressPercentage = (wp: WorkProgress): number => {
    if (wp.targetAmount === undefined || wp.targetAmount === 0) return 0;
    const percentage = ((wp.currentAmount || 0) / wp.targetAmount) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  // 数値を単位に応じてフォーマット（kgの場合は小数点第1位、それ以外は整数）
  const formatAmount = (amount: number, unit: string): string => {
    if (unit.toLowerCase() === 'kg') {
      return amount.toFixed(1);
    }
    return Math.round(amount).toString();
  };

  // 残量を計算
  const calculateRemaining = (wp: WorkProgress): number | null => {
    if (wp.targetAmount === undefined) return null;
    const remaining = wp.targetAmount - (wp.currentAmount || 0);
    return remaining;
  };

  // プログレスバーの色を取得
  const getProgressBarColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-gray-400';
  };

  // 単位を抽出（weightフィールドから）
  const extractUnit = (weight?: string): string => {
    if (!weight) return '';
    const match = weight.match(/^\d+(?:\.\d+)?\s*(kg|個|枚|本|箱|袋|パック|セット|回|時間|分|日|週|月|年)?$/i);
    return match && match[1] ? match[1] : '';
  };

  const getStatusLabel = (status: WorkProgressStatus): string => {
    switch (status) {
      case 'pending':
        return '前';
      case 'in_progress':
        return '途中';
      case 'completed':
        return '済';
    }
  };

  const getStatusColor = (status: WorkProgressStatus): string => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  };

  // 作業カードをレンダリングする関数
  const renderWorkProgressCard = (wp: WorkProgress, isInGroup: boolean = false, groupName?: string) => {
    const isDummyWork = !wp.taskName || wp.taskName.trim() === '';
    
    return (
      <div
        key={wp.id}
        className={`${isInGroup ? 'border border-gray-200 rounded-lg p-2 space-y-2' : 'bg-white rounded-lg shadow-md p-3 sm:p-4'} ${!isDummyWork ? 'hover:shadow-md transition-shadow' : ''}`}
      >
        {/* 作業名と進捗状態 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isDummyWork ? (
              <div className="text-center py-2">
                <p className="text-xs text-gray-600 mb-1">新しく作業を追加してください</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddingToGroupName(groupName || null);
                    setAddMode('work');
                    setShowAddForm(true);
                  }}
                  className="px-3 py-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-300 rounded hover:bg-amber-100 transition-colors min-h-[32px]"
                >
                  作業を追加
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {wp.taskName && (
                    <p className="text-sm font-semibold text-gray-800">{wp.taskName}</p>
                  )}
                  <select
                    value={wp.status}
                    onChange={(e) => handleStatusChange(wp.id, e.target.value as WorkProgressStatus)}
                    className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(wp.status)} focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[28px]`}
                  >
                    <option value="pending">前</option>
                    <option value="in_progress">途中</option>
                    <option value="completed">済</option>
                  </select>
                </div>
                {!isInGroup && wp.weight && (
                  <p className="text-xs text-gray-600 mb-1">数量: {wp.weight}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {wp.startedAt && (
                    <span className="text-xs text-gray-500">開始: {formatDateTime(wp.startedAt)}</span>
                  )}
                  {wp.completedAt && (
                    <span className="text-xs text-gray-500">完了: {formatDateTime(wp.completedAt)}</span>
                  )}
                </div>
              </>
            )}
          </div>
          {!isDummyWork && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setEditingWorkProgressId(wp.id)}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                aria-label="編集"
              >
                <HiPencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDeleteWorkProgress(wp.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                aria-label="削除"
              >
                <HiTrash className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        
        {/* プログレスバーと進捗情報 */}
        {!isDummyWork && wp.targetAmount !== undefined && (() => {
          const unit = extractUnit(wp.weight);
          return (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700">
                  {formatAmount(wp.currentAmount || 0, unit)}{unit} / {formatAmount(wp.targetAmount, unit)}{unit}
                </span>
                <span className="font-semibold text-gray-800">
                  {calculateProgressPercentage(wp).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-[width,background-color] duration-700 ease-out ${getProgressBarColor(calculateProgressPercentage(wp))}`}
                  style={{ width: `${calculateProgressPercentage(wp)}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  {(() => {
                    const remaining = calculateRemaining(wp);
                    if (remaining === null) return null;
                    if (remaining <= 0) {
                      const over = Math.abs(remaining);
                      return over > 0 ? `目標達成（+${formatAmount(over, unit)}${unit}）` : '完了';
                    }
                    return `残り${formatAmount(remaining, unit)}${unit}`;
                  })()}
                </div>
                <button
                  onClick={() => setAddingProgressWorkProgressId(wp.id)}
                  className="px-2 py-0.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-300 rounded hover:bg-amber-100 transition-colors min-h-[24px]"
                >
                  進捗追加
                </button>
              </div>
              {wp.completedCount !== undefined && wp.completedCount > 0 && (
                <div className="text-xs text-gray-600 pt-0.5">
                  完成数: {wp.completedCount}個
                </div>
              )}
            </div>
          );
        })()}

        {/* 完成数の表示（目標量がない場合） */}
        {!isDummyWork && wp.targetAmount === undefined && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-700 font-semibold">
                完成数: {wp.completedCount || 0}個
              </span>
              <button
                onClick={() => setAddingProgressWorkProgressId(wp.id)}
                className="px-2 py-0.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-300 rounded hover:bg-amber-100 transition-colors min-h-[24px]"
              >
                完成数を追加
              </button>
            </div>
          </div>
        )}

        {/* メモ */}
        {!isDummyWork && wp.memo && (
          <p className={`text-xs text-gray-600 whitespace-pre-wrap line-clamp-2 ${!isInGroup ? 'mb-2' : ''}`}>{wp.memo}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
        {/* ヘッダー */}
        <header className="mb-6 sm:mb-8">
          <div className="relative flex items-center justify-between mb-4">
            <Link
              href="/"
              className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center gap-2 flex-shrink-0 min-h-[44px]"
            >
              <HiArrowLeft className="text-lg flex-shrink-0" />
              ホームに戻る
            </Link>
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-4">
              <MdTimeline className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">作業進捗</h1>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-auto">
              <button
                onClick={() => setShowFilterDialog(true)}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-colors flex items-center gap-1.5 min-h-[36px]"
                aria-label="フィルタと並び替え"
              >
                <HiFilter className="h-4 w-4" />
                <span className="hidden sm:inline">フィルタ・並び替え</span>
              </button>
              <button
                onClick={() => setShowModeSelectDialog(true)}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-1.5 min-h-[36px] flex-shrink-0"
              >
                <HiPlus className="h-4 w-4" />
                <span className="hidden sm:inline">作業を追加</span>
              </button>
            </div>
          </div>
        </header>

        {/* シンプルなカンバン形式のレイアウト */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* グループ化されたカード */}
          {groupedWorkProgresses.groups.map((group, groupIndex) => {
            const groupKey = group.groupName || group.taskName || '';
            const groupDisplayName = group.groupName || group.taskName || '(作業名なし)';
            
            return (
              <div
                key={`group_${groupKey}_${groupIndex}`}
                className="bg-white rounded-lg shadow-md p-3 sm:p-4"
              >
                {/* グループヘッダー */}
                <div className="border-b border-gray-200 pb-2 mb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div 
                      className="cursor-pointer hover:bg-gray-50 rounded transition-colors flex-1"
                      onClick={() => group.groupName && setEditingGroupName(group.groupName)}
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                        {groupDisplayName}
                      </h3>
                    </div>
                    {!group.workProgresses.some((wp) => !wp.taskName || wp.taskName.trim() === '') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddingToGroupName(group.groupName || null);
                          setAddMode('work');
                          setShowAddForm(true);
                        }}
                        className="px-2 py-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-300 rounded hover:bg-amber-100 transition-colors flex items-center gap-1 min-h-[28px] flex-shrink-0"
                      >
                        <HiPlus className="h-3 w-3" />
                        作業を追加
                      </button>
                    )}
                  </div>
                </div>
                {/* グループ内の全作業を状態に関係なく表示 */}
                <div className="space-y-2">
                  {group.workProgresses.map((wp) => renderWorkProgressCard(wp, true, group.groupName))}
                </div>
              </div>
            );
          })}
          
          {/* 個別カード */}
          {groupedWorkProgresses.ungrouped.map((wp) => renderWorkProgressCard(wp, false))}
        </div>

        {/* モード選択ダイアログ */}
        {showModeSelectDialog && (
          <ModeSelectDialog
            onSelectGroup={() => {
              setShowModeSelectDialog(false);
              setAddMode('group');
              setShowAddGroupForm(true);
            }}
            onSelectWork={() => {
              setShowModeSelectDialog(false);
              setAddMode('work');
              setShowAddForm(true);
            }}
            onCancel={() => {
              setShowModeSelectDialog(false);
            }}
          />
        )}

        {/* グループ作成フォーム */}
        {showAddGroupForm && (
          <GroupCreateForm
            onSave={async (groupName) => {
              if (!user) return;
              try {
                await addWorkProgress(user.uid, {
                  groupName: groupName.trim() || undefined,
                  status: 'pending',
                }, data);
                setShowAddGroupForm(false);
                setAddMode(null);
              } catch (error) {
                console.error('Failed to create group:', error);
                alert('作業グループの作成に失敗しました');
              }
            }}
            onCancel={() => {
              setShowAddGroupForm(false);
              setAddMode(null);
            }}
          />
        )}

        {/* 追加フォーム */}
        {showAddForm && addMode === 'work' && (
          <WorkProgressForm
            initialGroupName={addingToGroupName || undefined}
            hideGroupName={!!addingToGroupName}
            existingGroups={(() => {
              const groups = new Set<string>();
              data?.workProgresses?.forEach((wp) => {
                if (wp.groupName) {
                  groups.add(wp.groupName);
                }
              });
              return Array.from(groups).sort();
            })()}
            onSave={handleAddWorkProgress}
            onCancel={() => {
              setShowAddForm(false);
              setAddingToGroupName(null);
              setAddMode(null);
            }}
          />
        )}

        {/* グループ編集フォーム */}
        {editingGroupName && (() => {
          const groupWorkProgresses = data?.workProgresses?.filter((wp) => wp.groupName === editingGroupName) || [];
          if (groupWorkProgresses.length === 0) {
            setEditingGroupName(null);
            return null;
          }
          
          return (
            <GroupEditForm
              groupName={editingGroupName}
              workProgresses={groupWorkProgresses}
              onSave={(updates) => handleUpdateGroup(editingGroupName, updates)}
              onCancel={() => setEditingGroupName(null)}
              onDelete={() => handleDeleteGroup(editingGroupName)}
            />
          );
        })()}

        {/* 作業編集フォーム */}
        {editingWorkProgressId && (() => {
          const editingWorkProgress = data.workProgresses?.find((wp) => wp.id === editingWorkProgressId);
          if (!editingWorkProgress) return null;
          
          return (
            <WorkProgressForm
              workProgress={editingWorkProgress}
              onSave={(updates) => handleUpdateWorkProgress(editingWorkProgressId, updates)}
              onCancel={() => setEditingWorkProgressId(null)}
            />
          );
        })()}

        {/* フィルタ・並び替えダイアログ */}
        {showFilterDialog && (
          <FilterSortDialog
            sortOption={sortOption}
            filterTaskName={filterTaskName}
            filterStatus={filterStatus}
            onSortChange={setSortOption}
            onFilterTaskNameChange={setFilterTaskName}
            onFilterStatusChange={setFilterStatus}
            onClose={() => setShowFilterDialog(false)}
          />
        )}

        {/* 進捗量入力ダイアログ */}
        {addingProgressWorkProgressId && (() => {
          const workProgress = data.workProgresses?.find((wp) => wp.id === addingProgressWorkProgressId);
          if (!workProgress) return null;
          
          return (
            <ProgressInputDialog
              workProgress={workProgress}
              onSave={(amount, memo) => handleAddProgress(addingProgressWorkProgressId, amount, memo)}
              onCancel={() => setAddingProgressWorkProgressId(null)}
            />
          );
        })()}
      </div>
    </div>
  );
}

// モード選択ダイアログコンポーネント
interface ModeSelectDialogProps {
  onSelectGroup: () => void;
  onSelectWork: () => void;
  onCancel: () => void;
}

function ModeSelectDialog({ onSelectGroup, onSelectWork, onCancel }: ModeSelectDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* ヘッダー */}
        <div className="border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            追加する項目を選択
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* ボタン */}
        <div className="p-4 sm:p-6 space-y-3">
          <button
            onClick={onSelectGroup}
            className="w-full px-4 py-3 text-left bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-lg transition-colors min-h-[60px] flex flex-col justify-center"
          >
            <div className="font-semibold text-gray-800 text-base">作業グループを作成</div>
            <div className="text-sm text-gray-600 mt-1">新しい作業グループを作成します</div>
          </button>
          <button
            onClick={onSelectWork}
            className="w-full px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 rounded-lg transition-colors min-h-[60px] flex flex-col justify-center"
          >
            <div className="font-semibold text-gray-800 text-base">作業を追加</div>
            <div className="text-sm text-gray-600 mt-1">新しい作業を追加します</div>
          </button>
        </div>
      </div>
    </div>
  );
}

// グループ作成フォームコンポーネント
interface GroupCreateFormProps {
  onSave: (groupName: string) => void;
  onCancel: () => void;
}

function GroupCreateForm({ onSave, onCancel }: GroupCreateFormProps) {
  const [groupName, setGroupName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim()) {
      onSave(groupName);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">作業グループを作成</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
              グループ名
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
              placeholder="例: シール"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px]"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors min-h-[44px]"
            >
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// グループ編集フォームコンポーネント
interface GroupEditFormProps {
  groupName: string;
  workProgresses: WorkProgress[];
  onSave: (updates: { groupName?: string }) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function GroupEditForm({ groupName: initialGroupName, workProgresses, onSave, onCancel, onDelete }: GroupEditFormProps) {
  const [groupName, setGroupName] = useState(initialGroupName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ groupName: groupName.trim() || undefined });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">作業グループを編集</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label htmlFor="editGroupName" className="block text-sm font-medium text-gray-700 mb-2">
              グループ名
            </label>
            <input
              type="text"
              id="editGroupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
              placeholder="例: シール"
            />
          </div>

          {/* グループ内の作業一覧 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作業グループ内の作業 ({workProgresses.length}件)
            </label>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {workProgresses.map((wp) => (
                <div key={wp.id} className="p-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {wp.taskName || '(作業名なし)'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        状態: {wp.status === 'pending' ? '前' : wp.status === 'in_progress' ? '途中' : '済'}
                      </div>
                      {wp.memo && (
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {wp.memo}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        作成: {formatDateTime(wp.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 transition-colors min-h-[44px]"
            >
              グループを削除
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px]"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors min-h-[44px]"
              >
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

interface WorkProgressFormProps {
  workProgress?: WorkProgress;
  initialValues?: Partial<WorkProgress>;
  initialGroupName?: string;
  hideGroupName?: boolean;
  existingGroups?: string[];
  onSave: (workProgress: Omit<WorkProgress, 'id' | 'createdAt' | 'updatedAt'> | Partial<Omit<WorkProgress, 'id' | 'createdAt'>>) => void;
  onCancel: () => void;
}

function WorkProgressForm({ workProgress, initialValues, initialGroupName, hideGroupName, existingGroups = [], onSave, onCancel }: WorkProgressFormProps) {
  const [groupName, setGroupName] = useState(workProgress?.groupName || initialGroupName || initialValues?.groupName || '');
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [weight, setWeight] = useState(workProgress?.weight || initialValues?.weight || '');
  const [taskName, setTaskName] = useState(workProgress?.taskName || initialValues?.taskName || '');
  const [status, setStatus] = useState<WorkProgressStatus>(workProgress?.status || 'pending');
  const [memo, setMemo] = useState(workProgress?.memo || '');
  const [completedCount, setCompletedCount] = useState<string>(workProgress?.completedCount?.toString() || '');

  // 単位を抽出
  const extractUnit = (weight?: string): string => {
    if (!weight) return '';
    const match = weight.match(/^\d+(?:\.\d+)?\s*(kg|個|枚|本|箱|袋|パック|セット|回|時間|分|日|週|月|年)?$/i);
    return match && match[1] ? match[1] : '';
  };

  // 数値を単位に応じてフォーマット（kgの場合は小数点第1位、それ以外は整数）
  const formatAmount = (amount: number, unit: string): string => {
    if (unit.toLowerCase() === 'kg') {
      return amount.toFixed(1);
    }
    return Math.round(amount).toString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const workProgressData: Omit<WorkProgress, 'id' | 'createdAt' | 'updatedAt'> | Partial<Omit<WorkProgress, 'id' | 'createdAt'>> = {
      groupName: groupName.trim() || undefined,
      weight: weight.trim() || undefined,
      taskName: taskName.trim() || undefined,
      status,
      memo: memo.trim() || undefined,
    };

    // completedCountが入力されている場合は数値に変換
    if (completedCount.trim()) {
      const count = parseInt(completedCount.trim(), 10);
      if (!isNaN(count) && count >= 0) {
        workProgressData.completedCount = count;
      }
    }

    // weightから目標量を抽出
    if (weight.trim()) {
      const match = weight.trim().match(/^(\d+(?:\.\d+)?)\s*(kg|個|枚|本|箱|袋|パック|セット|回|時間|分|日|週|月|年)?$/i);
      if (match) {
        const amount = parseFloat(match[1]);
        if (!isNaN(amount) && amount > 0) {
          workProgressData.targetAmount = amount;
        }
      }
    }

    onSave(workProgressData);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {workProgress ? '作業を編集' : '作業を追加'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {!hideGroupName && (
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
                グループ名（任意）
              </label>
              <div className="space-y-2">
                <select
                  id="groupName"
                  value={isNewGroup ? '' : groupName}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      setIsNewGroup(true);
                      setGroupName('');
                    } else {
                      setIsNewGroup(false);
                      setGroupName(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
                >
                  <option value="">（グループなし）</option>
                  {existingGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                  <option value="__new__">+ 新しいグループを作成</option>
                </select>
                {isNewGroup && (
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="新しいグループ名を入力"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
                    autoFocus
                  />
                )}
              </div>
            </div>
          )}
          <div>
            <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-2">
              作業名
            </label>
            <input
              type="text"
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
              placeholder="例: シール貼り"
            />
          </div>
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
              数量（目標量）
            </label>
            <input
              type="text"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
              placeholder="例: 200枚、10kg、5個"
            />
            <p className="mt-1 text-xs text-gray-500">
              単位付きで入力してください（例: 200枚、10kg、5個）。目標量として使用されます。
            </p>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              状態
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as WorkProgressStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
            >
              <option value="pending">前（未着手）</option>
              <option value="in_progress">途中</option>
              <option value="completed">済（完了）</option>
            </select>
          </div>
          <div>
            <label htmlFor="completedCount" className="block text-sm font-medium text-gray-700 mb-2">
              完成数（任意、目標量がない場合も記録可能）
            </label>
            <input
              type="number"
              id="completedCount"
              value={completedCount}
              onChange={(e) => setCompletedCount(e.target.value)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
              placeholder="例: 5"
            />
          </div>
          <div>
            <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-2">
              メモ（任意）
            </label>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[100px] text-gray-900"
              placeholder="メモや備考を入力してください"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px]"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors min-h-[44px]"
            >
              {workProgress ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// フィルタ・並び替えダイアログコンポーネント
interface FilterSortDialogProps {
  sortOption: SortOption;
  filterTaskName: string;
  filterStatus: WorkProgressStatus | 'all';
  onSortChange: (option: SortOption) => void;
  onFilterTaskNameChange: (name: string) => void;
  onFilterStatusChange: (status: WorkProgressStatus | 'all') => void;
  onClose: () => void;
}

function FilterSortDialog({
  sortOption,
  filterTaskName,
  filterStatus,
  onSortChange,
  onFilterTaskNameChange,
  onFilterStatusChange,
  onClose,
}: FilterSortDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">フィルタ・並び替え</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">並び替え</label>
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
            >
              <option value="createdAt">作成日時（新しい順）</option>
              <option value="beanName">作業名（あいうえお順）</option>
              <option value="status">状態（前→途中→済）</option>
            </select>
          </div>
          <div>
            <label htmlFor="filterTaskName" className="block text-sm font-medium text-gray-700 mb-2">
              作業名でフィルタ
            </label>
            <input
              type="text"
              id="filterTaskName"
              value={filterTaskName}
              onChange={(e) => onFilterTaskNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
              placeholder="作業名を入力"
            />
          </div>
          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-2">
              状態でフィルタ
            </label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => onFilterStatusChange(e.target.value as WorkProgressStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
            >
              <option value="all">すべて</option>
              <option value="pending">前（未着手）</option>
              <option value="in_progress">途中</option>
              <option value="completed">済（完了）</option>
            </select>
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors min-h-[44px]"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 進捗量入力ダイアログコンポーネント
interface ProgressInputDialogProps {
  workProgress: WorkProgress;
  onSave: (amount: number, memo?: string) => void;
  onCancel: () => void;
}

function ProgressInputDialog({ workProgress, onSave, onCancel }: ProgressInputDialogProps) {
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  const extractUnit = (weight?: string): string => {
    if (!weight) return '';
    const match = weight.match(/^\d+(?:\.\d+)?\s*(kg|個|枚|本|箱|袋|パック|セット|回|時間|分|日|週|月|年)?$/i);
    return match && match[1] ? match[1] : '';
  };

  const unit = extractUnit(workProgress.weight);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      onSave(numAmount, memo.trim() || undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {workProgress.targetAmount !== undefined ? '進捗を追加' : '完成数を追加'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              {workProgress.targetAmount !== undefined ? `進捗量（${unit}）` : '完成数（個）'}
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step={unit === 'kg' ? '0.1' : '1'}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-gray-900"
              placeholder={workProgress.targetAmount !== undefined ? `例: 50${unit}` : '例: 5'}
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="progressMemo" className="block text-sm font-medium text-gray-700 mb-2">
              メモ（任意）
            </label>
            <textarea
              id="progressMemo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[100px] text-gray-900"
              placeholder="メモや備考を入力してください"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px]"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors min-h-[44px]"
            >
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
