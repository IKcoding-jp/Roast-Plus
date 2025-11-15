'use client';

import { useState, useMemo } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { addWorkProgress, updateWorkProgress, deleteWorkProgress, addProgressToWorkProgress } from '@/lib/firestore';
import { HiArrowLeft, HiPlus, HiX, HiPencil, HiTrash, HiFilter } from 'react-icons/hi';
import { MdTimeline, MdSort } from 'react-icons/md';
import LoginPage from '@/app/login/page';
import type { WorkProgress, WorkProgressStatus } from '@/types';

type SortOption = 'createdAt' | 'beanName' | 'status';

interface GroupedWorkProgress {
  beanName: string;
  weight: string;
  workProgresses: WorkProgress[];
}

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWorkProgressId, setEditingWorkProgressId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');
  const [filterBeanName, setFilterBeanName] = useState('');
  const [filterTaskName, setFilterTaskName] = useState('');
  const [filterStatus, setFilterStatus] = useState<WorkProgressStatus | 'all'>('all');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [addingProgressWorkProgressId, setAddingProgressWorkProgressId] = useState<string | null>(null);

  // 同じ豆（beanName + weight）の作業をグループ化
  // 注意: すべてのフックは早期リターンの前に呼び出す必要がある
  const groupedWorkProgresses = useMemo(() => {
    const workProgresses = data?.workProgresses || [];
    
    // フィルタリング
    let filtered = workProgresses.filter((wp) => {
      if (filterBeanName && wp.beanName && !wp.beanName.toLowerCase().includes(filterBeanName.toLowerCase())) {
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

    // グループ化
    const groups = new Map<string, GroupedWorkProgress>();
    
    filtered.forEach((wp) => {
      const key = `${wp.beanName || ''}_${wp.weight || ''}`;
      if (!groups.has(key)) {
        groups.set(key, {
          beanName: wp.beanName || '',
          weight: wp.weight || '',
          workProgresses: [],
        });
      }
      groups.get(key)!.workProgresses.push(wp);
    });

    // ソート
    const sortedGroups = Array.from(groups.values());
    
    sortedGroups.forEach((group) => {
      group.workProgresses.sort((a, b) => {
        if (sortOption === 'createdAt') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortOption === 'beanName') {
          const aName = a.beanName || '';
          const bName = b.beanName || '';
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
        return a.beanName.localeCompare(b.beanName, 'ja');
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

    return sortedGroups;
  }, [data?.workProgresses, sortOption, filterBeanName, filterTaskName, filterStatus]);

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
  const handleAddWorkProgress = async (workProgress: Omit<WorkProgress, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    try {
      await addWorkProgress(user.uid, workProgress, data);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add work progress:', error);
      alert('作業の追加に失敗しました');
    }
  };

  // 作業進捗を更新
  const handleUpdateWorkProgress = async (
    workProgressId: string,
    updates: Partial<Omit<WorkProgress, 'id' | 'createdAt'>>
  ) => {
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

  // 進捗状態を変更
  const handleStatusChange = async (workProgressId: string, newStatus: WorkProgressStatus) => {
    await handleUpdateWorkProgress(workProgressId, { status: newStatus });
  };

  // 進捗量を追加
  const handleAddProgress = async (workProgressId: string, amount: number, memo?: string) => {
    if (!user) return;
    
    try {
      await addProgressToWorkProgress(user.uid, workProgressId, amount, memo, data);
      setAddingProgressWorkProgressId(null);
    } catch (error) {
      console.error('Failed to add progress:', error);
      alert('進捗量の追加に失敗しました');
    }
  };

  // 進捗率を計算
  const calculateProgressPercentage = (wp: WorkProgress): number => {
    if (wp.targetAmount === undefined || wp.targetAmount === 0) return 0;
    const percentage = ((wp.currentAmount || 0) / wp.targetAmount) * 100;
    return Math.min(100, Math.max(0, percentage));
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
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-amber-50 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => setShowFilterDialog(true)}
                className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2 min-h-[44px]"
                aria-label="フィルタと並び替え"
              >
                <HiFilter className="h-5 w-5" />
                <span className="hidden sm:inline">フィルタ・並び替え</span>
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 min-h-[44px] flex-shrink-0"
              >
                <HiPlus className="text-lg" />
                作業を追加
              </button>
            </div>
          </div>
        </header>

        {/* カードグリッド */}
        {groupedWorkProgresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">
              {filterBeanName || filterTaskName || filterStatus !== 'all'
                ? '検索条件に一致する作業がありません。'
                : '作業が登録されていません。'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {groupedWorkProgresses.map((group, groupIndex) => (
              <div
                key={`${group.beanName}_${group.weight}_${groupIndex}`}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6"
              >
                {/* カードヘッダー */}
                <div className="border-b border-gray-200 pb-3 mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                    {group.beanName || '(豆の名前なし)'}
                  </h3>
                  {group.weight && (
                    <p className="text-sm text-gray-600">重量: {group.weight}</p>
                  )}
                </div>

                {/* 作業リスト */}
                <div className="space-y-3">
                  {group.workProgresses.map((wp) => (
                    <div
                      key={wp.id}
                      className="border border-gray-200 rounded-lg p-3 space-y-2"
                    >
                      {/* 作業名と進捗状態 */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {wp.taskName && (
                            <p className="text-base font-semibold text-gray-800 mb-1">
                              {wp.taskName}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              value={wp.status}
                              onChange={(e) => handleStatusChange(wp.id, e.target.value as WorkProgressStatus)}
                              className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(wp.status)} focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[32px]`}
                            >
                              <option value="pending">前</option>
                              <option value="in_progress">途中</option>
                              <option value="completed">済</option>
                            </select>
                            {wp.startedAt && (
                              <span className="text-xs text-gray-500">
                                開始: {formatDateTime(wp.startedAt)}
                              </span>
                            )}
                            {wp.completedAt && (
                              <span className="text-xs text-gray-500">
                                完了: {formatDateTime(wp.completedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {wp.targetAmount !== undefined && (
                            <button
                              onClick={() => setAddingProgressWorkProgressId(wp.id)}
                              className="px-2 py-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-300 rounded hover:bg-amber-100 transition-colors min-h-[32px]"
                            >
                              進捗追加
                            </button>
                          )}
                          <button
                            onClick={() => setEditingWorkProgressId(wp.id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                            aria-label="編集"
                          >
                            <HiPencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWorkProgress(wp.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                            aria-label="削除"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* プログレスバーと進捗情報 */}
                      {wp.targetAmount !== undefined && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">
                              {wp.currentAmount?.toFixed(1) || '0'}kg / {wp.targetAmount.toFixed(1)}kg
                            </span>
                            <span className="font-semibold text-gray-800">
                              {calculateProgressPercentage(wp).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full transition-all ${getProgressBarColor(calculateProgressPercentage(wp))}`}
                              style={{ width: `${calculateProgressPercentage(wp)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-600">
                            {(() => {
                              const remaining = calculateRemaining(wp);
                              if (remaining === null) return null;
                              if (remaining <= 0) {
                                const over = Math.abs(remaining);
                                return over > 0 ? `目標達成（+${over.toFixed(1)}kg）` : '完了';
                              }
                              return `残り${remaining.toFixed(1)}kg`;
                            })()}
                          </div>
                        </div>
                      )}

                      {/* メモ */}
                      {wp.memo && (
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{wp.memo}</p>
                      )}

                      {/* 進捗履歴 */}
                      {wp.progressHistory && wp.progressHistory.length > 0 && (
                        <ProgressHistorySection workProgress={wp} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 追加フォーム */}
        {showAddForm && (
          <WorkProgressForm
            onSave={handleAddWorkProgress}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* 編集フォーム */}
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
            filterBeanName={filterBeanName}
            filterTaskName={filterTaskName}
            filterStatus={filterStatus}
            onSortChange={setSortOption}
            onFilterBeanNameChange={setFilterBeanName}
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

// 作業進捗フォームコンポーネント
interface WorkProgressFormProps {
  workProgress?: WorkProgress;
  onSave: (workProgress: Omit<WorkProgress, 'id' | 'createdAt' | 'updatedAt'> | Partial<Omit<WorkProgress, 'id' | 'createdAt'>>) => void;
  onCancel: () => void;
}

function WorkProgressForm({ workProgress, onSave, onCancel }: WorkProgressFormProps) {
  const [beanName, setBeanName] = useState(workProgress?.beanName || '');
  const [weight, setWeight] = useState(workProgress?.weight || '');
  const [taskName, setTaskName] = useState(workProgress?.taskName || '');
  const [status, setStatus] = useState<WorkProgressStatus>(workProgress?.status || 'pending');
  const [memo, setMemo] = useState(workProgress?.memo || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (workProgress) {
      // 編集モード
      onSave({
        beanName: beanName.trim() || undefined,
        weight: weight.trim() || undefined,
        taskName: taskName.trim() || undefined,
        status,
        memo: memo.trim() || undefined,
      });
    } else {
      // 追加モード
      onSave({
        beanName: beanName.trim() || undefined,
        weight: weight.trim() || undefined,
        taskName: taskName.trim() || undefined,
        status,
        memo: memo.trim() || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
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

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* 豆の名前 */}
          <div>
            <label htmlFor="beanName" className="block text-sm font-medium text-gray-700 mb-2">
              豆の名前
            </label>
            <input
              type="text"
              id="beanName"
              value={beanName}
              onChange={(e) => setBeanName(e.target.value)}
              placeholder="例: コロンビア"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
            />
          </div>

          {/* 重量 */}
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
              重量（目標量として使用）
            </label>
            <input
              type="text"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="例: 10kg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
            />
            <p className="mt-1 text-xs text-gray-500">
              「10kg」のように入力すると、目標量として自動設定されます
            </p>
            {workProgress && workProgress.targetAmount !== undefined && (
              <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-gray-700">
                <p>現在の目標量: {workProgress.targetAmount.toFixed(1)}kg</p>
                <p>現在の進捗: {workProgress.currentAmount?.toFixed(1) || '0'}kg</p>
              </div>
            )}
          </div>

          {/* 作業名 */}
          <div>
            <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-2">
              作業名
            </label>
            <input
              type="text"
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="例: ハンドピック"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
            />
          </div>

          {/* 進捗状態 */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              進捗状態
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as WorkProgressStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
            >
              <option value="pending">前（未着手）</option>
              <option value="in_progress">途中</option>
              <option value="completed">済（完了）</option>
            </select>
          </div>

          {/* メモ */}
          <div>
            <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-2">
              メモ・備考
            </label>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="作業に関するメモや備考を入力"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
            />
          </div>

          {/* ボタン */}
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
              保存
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
  filterBeanName: string;
  filterTaskName: string;
  filterStatus: WorkProgressStatus | 'all';
  onSortChange: (option: SortOption) => void;
  onFilterBeanNameChange: (value: string) => void;
  onFilterTaskNameChange: (value: string) => void;
  onFilterStatusChange: (value: WorkProgressStatus | 'all') => void;
  onClose: () => void;
}

function FilterSortDialog({
  sortOption,
  filterBeanName,
  filterTaskName,
  filterStatus,
  onSortChange,
  onFilterBeanNameChange,
  onFilterTaskNameChange,
  onFilterStatusChange,
  onClose,
}: FilterSortDialogProps) {
  const handleReset = () => {
    onSortChange('createdAt');
    onFilterBeanNameChange('');
    onFilterTaskNameChange('');
    onFilterStatusChange('all');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiFilter className="h-6 w-6 text-amber-600" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              フィルタ・並び替え
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* フォーム */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* 並び替え */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MdSort className="h-5 w-5 text-gray-600" />
              <label htmlFor="sort" className="text-base font-medium text-gray-700">
                並び替え
              </label>
            </div>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
            >
              <option value="createdAt">追加日時順</option>
              <option value="beanName">豆の名前順</option>
              <option value="status">進捗状態順</option>
            </select>
          </div>

          {/* フィルタ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <HiFilter className="h-5 w-5 text-gray-600" />
              <h3 className="text-base font-medium text-gray-700">フィルタ</h3>
            </div>

            {/* 豆の名前でフィルタ */}
            <div>
              <label htmlFor="filterBeanName" className="block text-sm font-medium text-gray-700 mb-2">
                豆の名前でフィルタ
              </label>
              <input
                type="text"
                id="filterBeanName"
                value={filterBeanName}
                onChange={(e) => onFilterBeanNameChange(e.target.value)}
                placeholder="例: コロンビア"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
              />
            </div>

            {/* 作業名でフィルタ */}
            <div>
              <label htmlFor="filterTaskName" className="block text-sm font-medium text-gray-700 mb-2">
                作業名でフィルタ
              </label>
              <input
                type="text"
                id="filterTaskName"
                value={filterTaskName}
                onChange={(e) => onFilterTaskNameChange(e.target.value)}
                placeholder="例: ハンドピック"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
              />
            </div>

            {/* 進捗状態でフィルタ */}
            <div>
              <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-2">
                進捗状態でフィルタ
              </label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => onFilterStatusChange(e.target.value as WorkProgressStatus | 'all')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
              >
                <option value="all">すべて</option>
                <option value="pending">前（未着手）</option>
                <option value="in_progress">途中</option>
                <option value="completed">済（完了）</option>
              </select>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px]"
            >
              リセット
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors min-h-[44px]"
            >
              適用
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('有効な進捗量を入力してください');
      return;
    }
    
    onSave(amountNum, memo.trim() || undefined);
  };

  const remaining = workProgress.targetAmount !== undefined 
    ? workProgress.targetAmount - (workProgress.currentAmount || 0)
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            進捗を追加
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="閉じる"
          >
            <HiX className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* 作業情報 */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            {workProgress.taskName && (
              <p className="text-sm font-semibold text-gray-800">{workProgress.taskName}</p>
            )}
            {workProgress.targetAmount !== undefined && (
              <p className="text-xs text-gray-600">
                目標: {workProgress.targetAmount.toFixed(1)}kg
                {remaining !== null && remaining > 0 && ` / 残り: ${remaining.toFixed(1)}kg`}
              </p>
            )}
          </div>

          {/* 進捗量 */}
          <div>
            <label htmlFor="progressAmount" className="block text-sm font-medium text-gray-700 mb-2">
              進捗量（kg） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="progressAmount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="例: 2.5"
              step="0.1"
              min="0.1"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
            />
          </div>

          {/* メモ */}
          <div>
            <label htmlFor="progressMemo" className="block text-sm font-medium text-gray-700 mb-2">
              メモ
            </label>
            <textarea
              id="progressMemo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="進捗に関するメモを入力（任意）"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
            />
          </div>

          {/* ボタン */}
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

// 進捗履歴セクションコンポーネント
interface ProgressHistorySectionProps {
  workProgress: WorkProgress;
}

function ProgressHistorySection({ workProgress }: ProgressHistorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!workProgress.progressHistory || workProgress.progressHistory.length === 0) {
    return null;
  }

  // 新しい順にソート
  const sortedHistory = [...workProgress.progressHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-t border-gray-200 pt-2 mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm text-gray-700 hover:text-gray-900 transition-colors min-h-[32px]"
      >
        <span className="font-medium">進捗履歴 ({sortedHistory.length}件)</span>
        {isExpanded ? (
          <HiChevronUp className="h-5 w-5" />
        ) : (
          <HiChevronDown className="h-5 w-5" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-2 space-y-2">
          {sortedHistory.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-50 rounded p-2 text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800">
                  +{entry.amount.toFixed(1)}kg
                </span>
                <span className="text-gray-500">
                  {formatDateTime(entry.date)}
                </span>
              </div>
              {entry.memo && (
                <p className="text-gray-600 whitespace-pre-wrap mt-1">{entry.memo}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
