'use client';

import { useState, useMemo, useEffect } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { Loading } from '@/components/Loading';
import { addWorkProgress, updateWorkProgress, updateWorkProgresses, deleteWorkProgress, addProgressToWorkProgress, addCompletedCountToWorkProgress, archiveWorkProgress, unarchiveWorkProgress, updateProgressHistoryEntry, deleteProgressHistoryEntry, extractTargetAmount, extractUnitFromWeight } from '@/lib/firestore';
import { HiArrowLeft, HiPlus, HiX, HiPencil, HiTrash, HiFilter, HiMinus, HiSearch, HiOutlineCollection, HiArchive } from 'react-icons/hi';
import { MdTimeline, MdSort } from 'react-icons/md';
import LoginPage from '@/app/login/page';
import type { WorkProgress, WorkProgressStatus } from '@/types';
import { WorkProgressCard } from '@/components/work-progress/WorkProgressCard';
import { QuickAddModal } from '@/components/work-progress/QuickAddModal';
import { ProgressHistoryEditDialog } from '@/components/work-progress/ProgressHistoryEditDialog';

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
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<Set<string>>(new Set());
  const [columnCount, setColumnCount] = useState(3);
  const [viewMode, setViewMode] = useState<'normal' | 'archived'>('normal');
  const [editingHistoryEntryId, setEditingHistoryEntryId] = useState<string | null>(null);
  const [editingHistoryWorkProgressId, setEditingHistoryWorkProgressId] = useState<string | null>(null);

  // レスポンシブなカラム数を取得
  useEffect(() => {
    const updateColumnCount = () => {
      if (window.innerWidth < 768) {
        setColumnCount(1);
      } else if (window.innerWidth < 1024) {
        setColumnCount(2);
      } else {
        setColumnCount(3);
      }
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);

  // 作業をグループ化（groupNameが設定されている場合のみグループ化、未入力の場合は個別カードとして表示）
  const groupedWorkProgresses = useMemo(() => {
    const workProgresses = data?.workProgresses || [];

    // フィルタリング（アーカイブ済み作業は除外）
    const filtered = workProgresses.filter((wp) => {
      // アーカイブ済み作業は除外
      if (wp.archivedAt) {
        return false;
      }
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
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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
        return new Date(aLatest).getTime() - new Date(bLatest).getTime();
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
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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
  }, [data, filterTaskName, filterStatus, sortOption]);

  // アーカイブ済み作業を日付でグループ化
  const archivedWorkProgressesByDate = useMemo(() => {
    const workProgresses = data?.workProgresses || [];
    const archived = workProgresses.filter((wp) => wp.archivedAt);

    const grouped = archived.reduce((acc, wp) => {
      const date = new Date(wp.archivedAt!).toLocaleDateString('ja-JP');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(wp);
      return acc;
    }, {} as Record<string, WorkProgress[]>);

    return Object.entries(grouped)
      .map(([date, workProgresses]) => ({
        date,
        workProgresses: workProgresses.sort((a, b) =>
          new Date(b.archivedAt!).getTime() - new Date(a.archivedAt!).getTime()
        ),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data]);

  // エンプティステートの判定
  const showEmptyState = useMemo(() => {
    return groupedWorkProgresses.groups.length === 0 && groupedWorkProgresses.ungrouped.length === 0 && !filterTaskName && filterStatus === 'all';
  }, [groupedWorkProgresses, filterTaskName, filterStatus]);

  const isEmpty = useMemo(() => {
    return groupedWorkProgresses.groups.length === 0 && groupedWorkProgresses.ungrouped.length === 0;
  }, [groupedWorkProgresses]);

  const hasFilters = useMemo(() => {
    return filterTaskName !== '' || filterStatus !== 'all';
  }, [filterTaskName, filterStatus]);

  // アクティブな作業進捗を取得
  const activeWorkProgress = useMemo(() => {
    if (!addingProgressWorkProgressId || !data?.workProgresses) return null;
    return data.workProgresses.find((wp) => wp.id === addingProgressWorkProgressId) || null;
  }, [addingProgressWorkProgressId, data]);

  // 各種ハンドラー関数（簡易実装、必要に応じて実装）
  const handleAddWorkProgress = async (workProgressData: Partial<WorkProgress>) => {
    if (!user || !data) return;
    await addWorkProgress(user.uid, workProgressData as any, data);
  };

  const handleUpdateWorkProgress = async (id: string, updates: Partial<WorkProgress>) => {
    if (!user || !data) return;
    await updateWorkProgress(user.uid, id, updates, data);
  };

  const handleDeleteWorkProgress = async (id: string) => {
    if (!user || !data) return;
    await deleteWorkProgress(user.uid, id, data);
  };

  const handleStatusChange = async (id: string, status: WorkProgressStatus) => {
    if (!user || !data) return;
    await updateWorkProgress(user.uid, id, { status }, data);
  };

  const handleArchiveWorkProgress = async (id: string) => {
    if (!user || !data) return;
    await archiveWorkProgress(user.uid, id, data);
  };

  const handleUnarchiveWorkProgress = async (id: string) => {
    if (!user || !data) return;
    await unarchiveWorkProgress(user.uid, id, data);
  };

  const handleAddProgress = async (id: string, amount: number, memo?: string) => {
    if (!user || !data) return;
    const workProgress = data.workProgresses?.find((wp) => wp.id === id);
    if (!workProgress) return;

    // targetAmountが設定されている場合は進捗量を追加、設定されていない場合は完成数を追加
    if (workProgress.targetAmount !== undefined) {
      await addProgressToWorkProgress(user.uid, id, amount, data, memo);
    } else {
      // 完成数モードの場合、amountを完成数として扱う（整数に変換）
      await addCompletedCountToWorkProgress(user.uid, id, Math.floor(amount), data, memo);
    }
  };

  const handleUpdateGroup = async (oldGroupName: string, newData: { groupName: string }) => {
    if (!user || !data?.workProgresses) return;
    const workProgresses = data.workProgresses.filter((wp) => wp.groupName === oldGroupName);
    const updates = new Map<string, Partial<Omit<WorkProgress, 'id' | 'createdAt'>>>();
    workProgresses.forEach((wp) => {
      updates.set(wp.id, { groupName: newData.groupName });
    });
    await updateWorkProgresses(user.uid, updates, data);
  };

  const handleDeleteGroup = async (groupName: string) => {
    if (!user || !data?.workProgresses) return;
    const workProgresses = data.workProgresses.filter((wp) => wp.groupName === groupName);
    for (const wp of workProgresses) {
      await deleteWorkProgress(user.uid, wp.id, data);
    }
  };

  const handleEditHistory = (workProgressId: string, entryId: string) => {
    setEditingHistoryWorkProgressId(workProgressId);
    setEditingHistoryEntryId(entryId);
  };

  const handleUpdateProgressHistory = async (workProgressId: string, entryId: string, amount: number, memo?: string) => {
    if (!user || !data) return;
    await updateProgressHistoryEntry(user.uid, workProgressId, entryId, { amount, memo }, data);
    setEditingHistoryWorkProgressId(null);
    setEditingHistoryEntryId(null);
  };

  const handleDeleteProgressHistory = async (workProgressId: string, entryId: string) => {
    if (!user || !data) return;
    await deleteProgressHistoryEntry(user.uid, workProgressId, entryId, data);
    setEditingHistoryWorkProgressId(null);
    setEditingHistoryEntryId(null);
  };

  const toggleHistory = (id: string) => {
    setExpandedHistoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ユーティリティ関数
  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-gray-400';
  };

  const calculateProgressPercentage = (wp: WorkProgress) => {
    if (wp.targetAmount !== undefined && wp.targetAmount > 0) {
      return ((wp.currentAmount || 0) / wp.targetAmount) * 100;
    }
    return 0;
  };

  const calculateRemaining = (wp: WorkProgress) => {
    if (wp.targetAmount !== undefined) {
      return Math.max(0, wp.targetAmount - (wp.currentAmount || 0));
    }
    return 0;
  };

  const formatAmount = (amount: number, unit: string) => {
    return amount.toLocaleString('ja-JP');
  };

  const extractUnit = (weight: string | undefined) => {
    if (!weight) return '';
    const match = weight.match(/[^\d.,\s]+/);
    return match ? match[0] : '';
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header>
        <div className="grid grid-cols-2 sm:grid-cols-3 items-center mb-4">
          {/* 左側: 戻る */}
          <div className="flex justify-start">
            <Link
              href="/"
              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
              title="戻る"
              aria-label="戻る"
            >
              <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
            </Link>
          </div>

          {/* 中央: タイトル */}
          <div className="hidden sm:flex justify-center items-center gap-2 sm:gap-4 min-w-0">
            {viewMode === 'archived' ? (
              <>
                <HiArchive className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600 flex-shrink-0" />
                <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-800 whitespace-nowrap">アーカイブ済み作業</h1>
              </>
            ) : (
              <>
                <MdTimeline className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600 flex-shrink-0" />
                <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-800 whitespace-nowrap">作業進捗</h1>
              </>
            )}
          </div>

          {/* 右側: アクションボタン */}
          <div className="flex justify-end items-center gap-2 sm:gap-3 flex-shrink-0">
            {viewMode === 'normal' && !showEmptyState && (
              <>
                <button
                  onClick={() => setShowFilterDialog(true)}
                  className="px-3 py-2 text-sm bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 min-h-[44px] min-w-[44px]"
                  aria-label="フィルタと並び替え"
                  title="フィルタと並び替え"
                >
                  <HiFilter className="h-4 w-4" />
                  <span className="hidden md:inline text-sm font-medium whitespace-nowrap">フィルター</span>
                </button>
                {archivedWorkProgressesByDate.length > 0 && (
                  <button
                    onClick={() => setViewMode('archived')}
                    className="px-3 py-2 text-sm bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
                    aria-label="アーカイブ一覧"
                    title="アーカイブ一覧"
                  >
                    <HiArchive className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowModeSelectDialog(true)}
                  className="px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg shadow-md hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <HiPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">追加</span>
                </button>
              </>
            )}
            {viewMode === 'archived' && (
              <button
                onClick={() => setViewMode('normal')}
                className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <MdTimeline className="h-4 w-4" />
                <span className="hidden sm:inline">一覧に戻る</span>
              </button>
            )}
          </div>
        </div>

        {/* モバイル用タイトル */}
        <div className="sm:hidden flex justify-center items-center gap-2 mb-4">
          {viewMode === 'archived' ? (
            <>
              <HiArchive className="h-6 w-6 text-amber-600 flex-shrink-0" />
              <h1 className="text-lg font-bold text-gray-800">アーカイブ済み作業</h1>
            </>
          ) : (
            <>
              <MdTimeline className="h-6 w-6 text-amber-600 flex-shrink-0" />
              <h1 className="text-lg font-bold text-gray-800">作業進捗</h1>
            </>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main>
        {
          viewMode === 'normal' ? (
            <>
              {/* エンプティステート */}
              {showEmptyState && (
                <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center">
                  <div className="bg-white p-6 rounded-full shadow-lg mb-6">
                    <MdTimeline className="h-16 w-16 text-amber-500" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">作業進捗を管理しましょう</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    日々の作業の進捗状況を記録・可視化できます。<br />
                    まずは新しい作業を追加してみましょう。
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => {
                        setAddMode('work');
                        setShowAddForm(true);
                      }}
                      className="px-6 py-3 bg-amber-600 text-white rounded-xl shadow-lg hover:bg-amber-700 hover:shadow-xl transition-all flex items-center justify-center gap-2 font-bold"
                    >
                      <HiPlus className="h-5 w-5" />
                      作業を追加
                    </button>
                    <button
                      onClick={() => {
                        setAddMode('group');
                        setShowAddGroupForm(true);
                      }}
                      className="px-6 py-3 bg-white text-amber-600 border border-amber-200 rounded-xl shadow-md hover:bg-amber-50 hover:shadow-lg transition-all flex items-center justify-center gap-2 font-bold"
                    >
                      <HiOutlineCollection className="h-5 w-5" />
                      グループを作成
                    </button>
                  </div>
                  {archivedWorkProgressesByDate.length > 0 && (
                    <button
                      onClick={() => setViewMode('archived')}
                      className="mt-8 text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
                    >
                      <HiArchive className="h-4 w-4" />
                      アーカイブ済みの作業を見る
                    </button>
                  )}
                </div>
              )}

              {/* フィルタ適用時のエンプティステート */}
              {isEmpty && hasFilters && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <HiSearch className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-600 font-medium">条件に一致する作業が見つかりませんでした</p>
                  <button
                    onClick={() => {
                      setFilterTaskName('');
                      setFilterStatus('all');
                    }}
                    className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
                  >
                    フィルタを解除
                  </button>
                </div>
              )}

              {/* グループ化された作業 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {groupedWorkProgresses.groups.map((group) => (
                  <div key={group.groupName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <HiOutlineCollection className="text-gray-400 h-5 w-5" />
                      <h2 className="font-bold text-gray-800 text-lg">{group.groupName}</h2>
                      <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                        {group.workProgresses.length}件
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingGroupName(group.groupName)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                        title="グループ名を編集"
                      >
                        <HiPencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.groupName)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="グループを削除"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-4">
                    {group.workProgresses.map((wp) => (
                      <WorkProgressCard
                        key={wp.id}
                        workProgress={wp}
                        isInGroup={true}
                        onEdit={setEditingWorkProgressId}
                        onStatusChange={handleStatusChange}
                        onArchive={handleArchiveWorkProgress}
                        onAddProgress={setAddingProgressWorkProgressId}
                        onToggleHistory={toggleHistory}
                        onEditHistory={handleEditHistory}
                        isHistoryExpanded={expandedHistoryIds.has(wp.id)}
                        getProgressBarColor={getProgressBarColor}
                        calculateProgressPercentage={calculateProgressPercentage}
                        calculateRemaining={calculateRemaining}
                        formatAmount={formatAmount}
                        extractUnit={extractUnit}
                        formatDateTime={formatDateTime}
                      />
                    ))}

                  </div>

                  {/* グループ内追加ボタン */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => {
                        setAddingToGroupName(group.groupName);
                        setAddMode('work');
                        setShowAddForm(true);
                      }}
                      className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <HiPlus className="h-4 w-4" />
                      作業を追加
                    </button>
                  </div>
                  </div>
                ))}
              </div>

              {/* グループ化されていない作業 */}
              {groupedWorkProgresses.ungrouped.length > 0 && (
                <div className="mb-8">
                  {groupedWorkProgresses.groups.length > 0 && (
                    <h2 className="text-lg font-bold text-gray-700 mb-4 px-2 border-l-4 border-gray-400">その他の作業</h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedWorkProgresses.ungrouped.map((wp) => (
                      <WorkProgressCard
                        key={wp.id}
                        workProgress={wp}
                        isInGroup={false}
                        onEdit={setEditingWorkProgressId}
                        onStatusChange={handleStatusChange}
                        onArchive={handleArchiveWorkProgress}
                        onAddProgress={setAddingProgressWorkProgressId}
                        onToggleHistory={toggleHistory}
                        onEditHistory={handleEditHistory}
                        isHistoryExpanded={expandedHistoryIds.has(wp.id)}
                        getProgressBarColor={getProgressBarColor}
                        calculateProgressPercentage={calculateProgressPercentage}
                        calculateRemaining={calculateRemaining}
                        formatAmount={formatAmount}
                        extractUnit={extractUnit}
                        formatDateTime={formatDateTime}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* アーカイブ一覧表示 */
            <div className="space-y-8 animate-fade-in">
              {archivedWorkProgressesByDate.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="text-gray-300 mb-4">
                    <HiArchive className="h-16 w-16 mx-auto" />
                  </div>
                  <p className="text-gray-500 font-medium">アーカイブされた作業はありません</p>
                </div>
              ) : (
                archivedWorkProgressesByDate.map((group) => (
                  <div key={group.date} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-amber-600">{new Date(group.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className="text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                          {group.workProgresses.length}件
                        </span>
                      </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {group.workProgresses.map((wp) => {
                        const unit = extractUnit(wp.weight);
                        return (
                          <div key={wp.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-gray-800">{wp.taskName || '名称未設定'}</h3>
                                  {wp.groupName && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                      {wp.groupName}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  {wp.targetAmount !== undefined ? (
                                    <span>
                                      {formatAmount(wp.currentAmount || 0, unit)} / {formatAmount(wp.targetAmount, unit)}{unit}
                                      <span className="text-gray-400 mx-2">|</span>
                                      達成率: {calculateProgressPercentage(wp).toFixed(0)}%
                                    </span>
                                  ) : (
                                    <span>完成数: {wp.completedCount || 0}個</span>
                                  )}
                                </div>
                                {wp.memo && (
                                  <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 inline-block max-w-full">
                                    {wp.memo}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleUnarchiveWorkProgress(wp.id)}
                                className="px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition-colors whitespace-nowrap"
                              >
                                戻す
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        }
      </main>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={!!addingProgressWorkProgressId}
        onClose={() => setAddingProgressWorkProgressId(null)}
        workProgress={activeWorkProgress}
        onAdd={async (amount: number, memo?: string) => {
          if (activeWorkProgress) {
            await handleAddProgress(activeWorkProgress.id, amount, memo);
          }
        }}
        unit={extractUnit(activeWorkProgress?.weight)}
      />

      {/* モード選択ダイアログ */}
      {
        showModeSelectDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">追加する項目を選択</h3>
                <p className="text-gray-500 text-sm mb-6">
                  新しい作業を追加するか、作業をまとめるグループを作成するか選択してください。
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowModeSelectDialog(false);
                      setAddMode('work');
                      setShowAddForm(true);
                    }}
                    className="w-full py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl border border-amber-200 transition-colors flex items-center justify-center gap-3"
                  >
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <HiPlus className="h-5 w-5" />
                    </div>
                    <span>作業を追加</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowModeSelectDialog(false);
                      setAddMode('group');
                      setShowAddGroupForm(true);
                    }}
                    className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-3"
                  >
                    <div className="bg-white p-2 rounded-full shadow-sm">
                      <HiOutlineCollection className="h-5 w-5" />
                    </div>
                    <span>グループを作成</span>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => setShowModeSelectDialog(false)}
                  className="w-full py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* 作業追加・編集フォーム */}
      {
        (showAddForm || editingWorkProgressId) && (
          <WorkProgressFormDialog
            isOpen={true}
            onClose={() => {
              setShowAddForm(false);
              setEditingWorkProgressId(null);
              setAddingToGroupName(null);
              setAddMode(null);
            }}
            onSubmit={editingWorkProgressId
              ? (data) => handleUpdateWorkProgress(editingWorkProgressId, data)
              : handleAddWorkProgress
            }
            onDelete={editingWorkProgressId ? () => handleDeleteWorkProgress(editingWorkProgressId) : undefined}
            initialData={editingWorkProgressId
              ? data?.workProgresses?.find(wp => wp.id === editingWorkProgressId)
              : { groupName: addingToGroupName || undefined }
            }
            isEditing={!!editingWorkProgressId}
            defaultGroupName={addingToGroupName}
          />
        )
      }

      {/* グループ追加フォーム */}
      {
        showAddGroupForm && (
          <GroupFormDialog
            isOpen={true}
            onClose={() => setShowAddGroupForm(false)}
            onSubmit={(groupName) => {
              // ダミー作業を作成してグループを作る
              handleAddWorkProgress({
                groupName,
                taskName: '',
                status: 'pending',
              });
              setShowAddGroupForm(false);
            }}
          />
        )
      }

      {/* グループ名編集フォーム */}
      {
        editingGroupName && (
          <GroupFormDialog
            isOpen={true}
            onClose={() => setEditingGroupName(null)}
            onSubmit={(newGroupName) => handleUpdateGroup(editingGroupName, { groupName: newGroupName })}
            initialGroupName={editingGroupName}
            isEditing={true}
          />
        )
      }

      {/* フィルタダイアログ */}
      {
        showFilterDialog && (
          <FilterDialog
            isOpen={true}
            onClose={() => setShowFilterDialog(false)}
            filterTaskName={filterTaskName}
            setFilterTaskName={setFilterTaskName}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            sortOption={sortOption}
            setSortOption={setSortOption}
          />
        )
      }

      {/* 履歴編集ダイアログ */}
      {editingHistoryWorkProgressId && editingHistoryEntryId && (() => {
        const workProgress = data?.workProgresses?.find((wp) => wp.id === editingHistoryWorkProgressId);
        const entry = workProgress?.progressHistory?.find((e) => e.id === editingHistoryEntryId);
        if (!workProgress || !entry) return null;
        
        return (
          <ProgressHistoryEditDialog
            isOpen={true}
            onClose={() => {
              setEditingHistoryWorkProgressId(null);
              setEditingHistoryEntryId(null);
            }}
            entry={entry}
            unit={extractUnit(workProgress.weight)}
            isCountMode={workProgress.targetAmount === undefined}
            onUpdate={async (amount: number, memo?: string) => {
              await handleUpdateProgressHistory(editingHistoryWorkProgressId, editingHistoryEntryId!, amount, memo);
            }}
            onDelete={async () => {
              await handleDeleteProgressHistory(editingHistoryWorkProgressId, editingHistoryEntryId!);
            }}
          />
        );
      })()}
    </div >
  );
}

// --- Sub Components (Dialogs) ---

// 作業追加・編集フォームコンポーネント
function WorkProgressFormDialog({
  isOpen, onClose, onSubmit, onDelete, initialData, isEditing, defaultGroupName
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  onDelete?: () => void;
  initialData?: any;
  isEditing: boolean;
  defaultGroupName?: string | null;
}) {
  // 既存データから数字と単位を分離
  const initialWeight = initialData?.weight || '';
  const initialAmount = initialWeight ? extractTargetAmount(initialWeight) : undefined;
  const initialUnit = initialWeight ? extractUnitFromWeight(initialWeight) : '';
  // 単位が6つ（kg, g, 個, 枚, 袋, 箱）に該当しない場合は空欄にする
  const validUnits = ['kg', 'g', '個', '枚', '袋', '箱'];
  const initialUnitValid = validUnits.includes(initialUnit) ? initialUnit : '';

  const [formData, setFormData] = useState({
    groupName: defaultGroupName || initialData?.groupName || '',
    taskName: initialData?.taskName || '',
    targetAmount: initialAmount !== undefined ? initialAmount.toString() : '',
    targetUnit: initialUnitValid,
    memo: initialData?.memo || '',
    status: initialData?.status || 'pending',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // targetAmountとtargetUnitを結合してweightフィールドを作成
      let weight = '';
      if (formData.targetAmount.trim()) {
        const amount = formData.targetAmount.trim();
        const unit = formData.targetUnit.trim();
        weight = unit ? `${amount}${unit}` : amount;
      }
      
      await onSubmit({
        ...formData,
        weight,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">
            {isEditing ? '作業を編集' : '新しい作業を追加'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <HiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">グループ名 (任意)</label>
              <input
                type="text"
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 bg-white"
                placeholder="例: ブラジル No.2"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">作業名</label>
              <input
                type="text"
                value={formData.taskName}
                onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 bg-white"
                placeholder="例: ハンドピック"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">目標量 (任意)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 bg-white"
                  placeholder="数値"
                  step="0.1"
                  min="0"
                />
                <select
                  value={formData.targetUnit}
                  onChange={(e) => setFormData({ ...formData, targetUnit: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 bg-white"
                >
                  <option value="">単位なし</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="個">個</option>
                  <option value="枚">枚</option>
                  <option value="袋">袋</option>
                  <option value="箱">箱</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                ※ 数値と単位を入力すると進捗バーが表示されます（例: 10kg）。<br />
                ※ 空欄の場合は完成数のみをカウントするモードになります。
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">メモ (任意)</label>
              <textarea
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none text-gray-900 bg-white"
                rows={3}
                placeholder="備考があれば入力してください"
              />
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">状態</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkProgressStatus })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 bg-white"
                >
                  <option value="pending">作業前</option>
                  <option value="in_progress">作業中</option>
                  <option value="completed">完了</option>
                </select>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-colors flex items-center justify-center"
                title="削除"
              >
                <HiTrash className="h-5 w-5" />
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-xl font-bold shadow-md hover:bg-amber-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '保存中...' : (isEditing ? '更新する' : '追加する')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// グループ追加・編集フォーム
function GroupFormDialog({
  isOpen, onClose, onSubmit, initialGroupName, isEditing
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialGroupName?: string;
  isEditing?: boolean;
}) {
  const [groupName, setGroupName] = useState(initialGroupName || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">
            {isEditing ? 'グループ名を編集' : '新しいグループを作成'}
          </h3>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (groupName.trim()) onSubmit(groupName);
          }}
          className="p-6"
        >
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">グループ名</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 bg-white"
              placeholder="例: ブラジル No.2"
              autoFocus
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!groupName.trim()}
              className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl font-bold shadow-md hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {isEditing ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// フィルタダイアログ
function FilterDialog({
  isOpen, onClose, filterTaskName, setFilterTaskName, filterStatus, setFilterStatus, sortOption, setSortOption
}: {
  isOpen: boolean;
  onClose: () => void;
  filterTaskName: string;
  setFilterTaskName: (val: string) => void;
  filterStatus: WorkProgressStatus | 'all';
  setFilterStatus: (val: WorkProgressStatus | 'all') => void;
  sortOption: SortOption;
  setSortOption: (val: SortOption) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">表示設定</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <HiX className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 検索 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">キーワード検索</label>
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={filterTaskName}
                onChange={(e) => setFilterTaskName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 bg-white"
                placeholder="作業名で検索..."
              />
            </div>
          </div>

          {/* ステータスフィルタ */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ステータス</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'すべて' },
                { value: 'pending', label: '作業前' },
                { value: 'in_progress', label: '作業中' },
                { value: 'completed', label: '完了' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterStatus(option.value as any)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${filterStatus === option.value
                    ? 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-300'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 並び替え */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">並び替え</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-gray-900 bg-white"
            >
              <option value="createdAt">作成日順</option>
              <option value="beanName">名前順</option>
              <option value="status">ステータス順</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl shadow-md hover:bg-amber-700 transition-colors"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
}
