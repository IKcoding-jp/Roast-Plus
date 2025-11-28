'use client';

import { useEffect, useMemo, useState } from 'react';
import { HiFilter, HiPlus, HiOutlineCollection, HiArchive } from 'react-icons/hi';
import { MdTimeline } from 'react-icons/md';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { Loading } from '@/components/Loading';
import LoginPage from '@/app/login/page';
import type { WorkProgress, WorkProgressStatus } from '@/types';
import {
  addWorkProgressTx,
  updateWorkProgressTx,
  deleteWorkProgressTx,
  addProgressAmountTx,
  addCompletedCountTx,
  archiveWorkProgressTx,
  unarchiveWorkProgressTx,
  WorkProgressDraft,
} from '@/lib/workProgressRepository';
import WorkProgressForm from '@/components/work-progress/WorkProgressForm';
import ProgressInputDialog from '@/components/work-progress/ProgressInputDialog';
import FilterSortDialog from '@/components/work-progress/FilterSortDialog';
import WorkProgressCard from '@/components/work-progress/WorkProgressCard';
import ArchiveList from '@/components/work-progress/ArchiveList';

type SortOption = 'createdAt' | 'taskName' | 'status';

type Grouped = {
  groupName: string;
  items: WorkProgress[];
};

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingProgressId, setAddingProgressId] = useState<string | null>(null);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');
  const [filterTaskName, setFilterTaskName] = useState('');
  const [filterStatus, setFilterStatus] = useState<WorkProgressStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'normal' | 'archived'>('normal');
  const [openHistories, setOpenHistories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user && typeof window !== 'undefined') {
      // avoid flash
    }
  }, [authLoading, user]);

  const workProgresses = data?.workProgresses || [];

  const activeList = useMemo(() => workProgresses.filter((wp) => !wp.archivedAt), [workProgresses]);
  const archivedList = useMemo(() => workProgresses.filter((wp) => wp.archivedAt), [workProgresses]);

  const filteredActive = useMemo(() => {
    return activeList
      .filter((wp) => {
        if (filterTaskName && !(wp.taskName || '').toLowerCase().includes(filterTaskName.toLowerCase())) {
          return false;
        }
        if (filterStatus !== 'all' && wp.status !== filterStatus) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'createdAt') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOption === 'taskName') {
          return (a.taskName || '').localeCompare(b.taskName || '', 'ja');
        }
        const order: Record<WorkProgressStatus, number> = { pending: 0, in_progress: 1, completed: 2 };
        return order[a.status] - order[b.status];
      });
  }, [activeList, filterTaskName, filterStatus, sortOption]);

  const grouped = useMemo<Grouped[]>(() => {
    const map = new Map<string, WorkProgress[]>();
    filteredActive.forEach((wp) => {
      const key = wp.groupName || '未分類';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(wp);
    });
    return Array.from(map.entries())
      .map(([groupName, items]) => ({ groupName, items }))
      .sort((a, b) => a.groupName.localeCompare(b.groupName, 'ja'));
  }, [filteredActive]);

  const applyLocal = (list: WorkProgress[]) => {
    updateData((prev) => ({ ...prev, workProgresses: list }));
  };

  const handleAdd = async (draft: WorkProgressDraft) => {
    if (!user) return;
    try {
      const list = await addWorkProgressTx(user.uid, draft);
      applyLocal(list);
      setShowAddForm(false);
    } catch (e) {
      console.error(e);
      alert('作業の追加に失敗しました');
    }
  };

  const handleUpdate = async (id: string, updates: WorkProgressDraft) => {
    if (!user) return;
    try {
      const list = await updateWorkProgressTx(user.uid, id, updates);
      applyLocal(list);
      setEditingId(null);
    } catch (e) {
      console.error(e);
      alert('作業の更新に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm('この作業を削除しますか？')) return;
    try {
      const list = await deleteWorkProgressTx(user.uid, id);
      applyLocal(list);
    } catch (e) {
      console.error(e);
      alert('作業の削除に失敗しました');
    }
  };

  const handleAddProgress = async (id: string, amount: number, memo?: string) => {
    if (!user) return;
    const wp = workProgresses.find((w) => w.id === id);
    if (!wp) return;
    try {
      const list =
        wp.goal.mode === 'target'
          ? await addProgressAmountTx(user.uid, id, amount, memo)
          : await addCompletedCountTx(user.uid, id, amount, memo);
      applyLocal(list);
      setAddingProgressId(null);
    } catch (e) {
      console.error(e);
      alert('進捗の追加に失敗しました');
    }
  };

  const handleStatusChange = async (id: string, status: WorkProgressStatus) => {
    if (!user) return;
    try {
      const list = await updateWorkProgressTx(user.uid, id, { status });
      applyLocal(list);
    } catch (e) {
      console.error(e);
      alert('状態変更に失敗しました');
    }
  };

  const handleArchive = async (id: string) => {
    if (!user) return;
    try {
      const list = await archiveWorkProgressTx(user.uid, id);
      applyLocal(list);
    } catch (e) {
      console.error(e);
      alert('アーカイブに失敗しました');
    }
  };

  const handleUnarchive = async (id: string) => {
    if (!user) return;
    try {
      const list = await unarchiveWorkProgressTx(user.uid, id);
      applyLocal(list);
    } catch (e) {
      console.error(e);
      alert('アーカイブ解除に失敗しました');
    }
  };

  if (authLoading || isLoading) {
    return <Loading />;
  }
  if (!user) {
    return <LoginPage />;
  }

  const editingWork = editingId ? workProgresses.find((w) => w.id === editingId) : undefined;
  const addingWork = addingProgressId ? workProgresses.find((w) => w.id === addingProgressId) : undefined;
  const allGroups = Array.from(new Set(workProgresses.map((w) => w.groupName).filter(Boolean) as string[]));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MdTimeline className="h-7 w-7 text-amber-600" />
            <h1 className="text-2xl font-bold text-gray-900">作業進捗</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'normal' ? 'archived' : 'normal')}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-sm text-gray-700"
            >
              {viewMode === 'normal' ? 'アーカイブを見る' : '進行中に戻る'}
            </button>
            <button
              onClick={() => setShowFilterDialog(true)}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-1"
            >
              <HiFilter />
              絞り込み
            </button>
            {viewMode === 'normal' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-3 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 flex items-center gap-1 min-h-[44px]"
              >
                <HiPlus />
                追加
              </button>
            )}
          </div>
        </div>

        {viewMode === 'normal' ? (
          grouped.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-700 mb-4">まだ作業がありません。追加して開始しましょう。</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                作業を追加
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map((group) => (
                <div key={group.groupName} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">{group.groupName}</h2>
                    <span className="text-sm text-gray-500">{group.items.length} 件</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.items.map((wp) => (
                      <WorkProgressCard
                        key={wp.id}
                        workProgress={wp}
                        onEdit={() => setEditingId(wp.id)}
                        onAddProgress={() => setAddingProgressId(wp.id)}
                        onArchive={() => handleArchive(wp.id)}
                        onUnarchive={undefined}
                        onStatusChange={(status) => handleStatusChange(wp.id, status)}
                        isHistoryOpen={openHistories.has(wp.id)}
                        toggleHistory={() =>
                          setOpenHistories((prev) => {
                            const next = new Set(prev);
                            if (next.has(wp.id)) next.delete(wp.id);
                            else next.add(wp.id);
                            return next;
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700 text-sm">
              <HiArchive />
              <span>アーカイブ済み {archivedList.length} 件</span>
            </div>
            <ArchiveList
              archived={archivedList}
              onUnarchive={handleUnarchive}
              onAddProgress={(id) => setAddingProgressId(id)}
              onEdit={(id) => setEditingId(id)}
            />
          </div>
        )}
      </div>

      {showAddForm && (
        <WorkProgressForm
          existingGroups={allGroups}
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingWork && (
        <WorkProgressForm
          workProgress={editingWork}
          existingGroups={allGroups}
          onSave={(draft) => handleUpdate(editingWork.id, draft)}
          onCancel={() => setEditingId(null)}
          onDelete={() => handleDelete(editingWork.id)}
        />
      )}

      {addingWork && (
        <ProgressInputDialog
          workProgress={addingWork}
          onSave={(amount, memo) => handleAddProgress(addingWork.id, amount, memo)}
          onCancel={() => setAddingProgressId(null)}
        />
      )}

      {showFilterDialog && (
        <FilterSortDialog
          sortOption={sortOption}
          filterTaskName={filterTaskName}
          filterStatus={filterStatus}
          onSortChange={(opt) => setSortOption(opt)}
          onFilterTaskNameChange={(v) => setFilterTaskName(v)}
          onFilterStatusChange={(s) => setFilterStatus(s)}
          onClose={() => setShowFilterDialog(false)}
        />
      )}
    </div>
  );
}
