'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { Loading } from '@/components/Loading';
import LoginPage from '@/app/login/page';
import type { WorkProgress, WorkProgressStatus } from '@/types';
import { useWorkProgressActions } from '@/hooks/useWorkProgressActions';
import { extractUnit } from './utils';
import { ProgressHeader } from './components/ProgressHeader';
import { NormalView } from './components/NormalView';
import { ArchivedView } from './components/ArchivedView';
import { ModeSelectDialog } from './components/ModeSelectDialog';
import { WorkProgressFormDialog } from './components/WorkProgressFormDialog';
import { GroupFormDialog } from './components/GroupFormDialog';
import { FilterDialog } from './components/FilterDialog';
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
  const { data, isLoading } = useAppData();
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
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [viewMode, setViewMode] = useState<'normal' | 'archived'>('normal');

  const actions = useWorkProgressActions(user?.uid, data);

  // 作業をグループ化
  const groupedWorkProgresses = useMemo(() => {
    const workProgresses = data?.workProgresses || [];

    const filtered = workProgresses.filter((wp) => {
      if (wp.archivedAt) return false;
      if (filterTaskName && wp.taskName && !wp.taskName.toLowerCase().includes(filterTaskName.toLowerCase())) return false;
      if (filterStatus !== 'all' && wp.status !== filterStatus) return false;
      return true;
    });

    const groups = new Map<string, GroupedWorkProgress>();
    const ungroupedWorkProgresses: WorkProgress[] = [];

    filtered.forEach((wp) => {
      if (wp.groupName) {
        const key = wp.groupName;
        if (!groups.has(key)) {
          groups.set(key, { groupName: wp.groupName, taskName: wp.taskName || '', weight: wp.weight || '', workProgresses: [] });
        }
        groups.get(key)!.workProgresses.push(wp);
      } else {
        ungroupedWorkProgresses.push(wp);
      }
    });

    const sortFn = (a: WorkProgress, b: WorkProgress) => {
      if (sortOption === 'createdAt') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortOption === 'beanName') return (a.groupName || a.taskName || '').localeCompare(b.groupName || b.taskName || '', 'ja');
      if (sortOption === 'status') {
        const order: Record<WorkProgressStatus, number> = { pending: 0, in_progress: 1, completed: 2 };
        return order[a.status] - order[b.status];
      }
      return 0;
    };

    const sortedGroups = Array.from(groups.values());
    sortedGroups.forEach((g) => g.workProgresses.sort(sortFn));
    sortedGroups.sort((a, b) => sortFn(a.workProgresses[0], b.workProgresses[0]));
    ungroupedWorkProgresses.sort(sortFn);

    return { groups: sortedGroups, ungrouped: ungroupedWorkProgresses };
  }, [data, filterTaskName, filterStatus, sortOption]);

  // アーカイブ済み作業を日付でグループ化
  const archivedWorkProgressesByDate = useMemo(() => {
    const workProgresses = data?.workProgresses || [];
    const archived = workProgresses.filter((wp) => wp.archivedAt);
    const grouped = archived.reduce((acc, wp) => {
      const date = new Date(wp.archivedAt!).toLocaleDateString('ja-JP');
      if (!acc[date]) acc[date] = [];
      acc[date].push(wp);
      return acc;
    }, {} as Record<string, WorkProgress[]>);

    return Object.entries(grouped)
      .map(([date, wps]) => ({
        date,
        workProgresses: wps.sort((a, b) => new Date(b.archivedAt!).getTime() - new Date(a.archivedAt!).getTime()),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data]);

  const showEmptyState = groupedWorkProgresses.groups.length === 0 && groupedWorkProgresses.ungrouped.length === 0 && !filterTaskName && filterStatus === 'all';
  const isEmpty = groupedWorkProgresses.groups.length === 0 && groupedWorkProgresses.ungrouped.length === 0;
  const hasFilters = filterTaskName !== '' || filterStatus !== 'all';

  const activeWorkProgress = useMemo(() => {
    if (!addingProgressWorkProgressId || !data?.workProgresses) return null;
    return data.workProgresses.find((wp) => wp.id === addingProgressWorkProgressId) || null;
  }, [addingProgressWorkProgressId, data]);

  if (authLoading || isLoading) return <Loading />;
  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <ProgressHeader
        viewMode={viewMode}
        showEmptyState={showEmptyState}
        hasArchivedItems={archivedWorkProgressesByDate.length > 0}
        onShowFilter={() => setShowFilterDialog(true)}
        onShowArchived={() => setViewMode('archived')}
        onShowModeSelect={() => setShowModeSelectDialog(true)}
        onBackToNormal={() => setViewMode('normal')}
      />

      <main>
        {viewMode === 'normal' ? (
          <NormalView
            showEmptyState={showEmptyState}
            isEmpty={isEmpty}
            hasFilters={hasFilters}
            groupedWorkProgresses={groupedWorkProgresses}
            archivedCount={archivedWorkProgressesByDate.length}
            expandedHistoryIds={actions.expandedHistoryIds}
            onSetShowAddForm={() => setShowAddForm(true)}
            onSetShowAddGroupForm={() => setShowAddGroupForm(true)}
            onClearFilters={() => { setFilterTaskName(''); setFilterStatus('all'); }}
            onEditWorkProgress={setEditingWorkProgressId}
            onStatusChange={actions.handleStatusChange}
            onArchive={actions.handleArchiveWorkProgress}
            onAddProgress={setAddingProgressWorkProgressId}
            onToggleHistory={actions.toggleHistory}
            onEditHistory={actions.handleEditHistory}
            onEditGroupName={setEditingGroupName}
            onDeleteGroup={actions.handleDeleteGroup}
            onAddToGroup={(groupName) => { setAddingToGroupName(groupName); setShowAddForm(true); }}
            onShowArchived={() => setViewMode('archived')}
          />
        ) : (
          <ArchivedView
            archivedWorkProgressesByDate={archivedWorkProgressesByDate}
            onUnarchive={actions.handleUnarchiveWorkProgress}
          />
        )}
      </main>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={!!addingProgressWorkProgressId}
        onClose={() => setAddingProgressWorkProgressId(null)}
        workProgress={activeWorkProgress}
        onAdd={async (amount: number, memo?: string) => {
          if (activeWorkProgress) {
            await actions.handleAddProgress(activeWorkProgress.id, amount, memo);
          }
        }}
        unit={extractUnit(activeWorkProgress?.weight)}
      />

      {/* モード選択ダイアログ */}
      {showModeSelectDialog && (
        <ModeSelectDialog
          onClose={() => setShowModeSelectDialog(false)}
          onAddWork={() => { setShowModeSelectDialog(false); setShowAddForm(true); }}
          onAddGroup={() => { setShowModeSelectDialog(false); setShowAddGroupForm(true); }}
        />
      )}

      {/* 作業追加・編集フォーム */}
      {(showAddForm || editingWorkProgressId) && (
        <WorkProgressFormDialog
          isOpen={true}
          onClose={() => { setShowAddForm(false); setEditingWorkProgressId(null); setAddingToGroupName(null); }}
          onSubmit={editingWorkProgressId
            ? (formData) => actions.handleUpdateWorkProgress(editingWorkProgressId, formData)
            : actions.handleAddWorkProgress
          }
          onDelete={editingWorkProgressId ? () => actions.handleDeleteWorkProgress(editingWorkProgressId) : undefined}
          initialData={editingWorkProgressId
            ? data?.workProgresses?.find(wp => wp.id === editingWorkProgressId)
            : { groupName: addingToGroupName || undefined }
          }
          isEditing={!!editingWorkProgressId}
          defaultGroupName={addingToGroupName}
        />
      )}

      {/* グループ追加フォーム */}
      {showAddGroupForm && (
        <GroupFormDialog
          isOpen={true}
          onClose={() => setShowAddGroupForm(false)}
          onSubmit={(groupName) => {
            actions.handleAddWorkProgress({ groupName, taskName: '', status: 'pending' });
            setShowAddGroupForm(false);
          }}
        />
      )}

      {/* グループ名編集フォーム */}
      {editingGroupName && (
        <GroupFormDialog
          isOpen={true}
          onClose={() => setEditingGroupName(null)}
          onSubmit={(newGroupName) => actions.handleUpdateGroup(editingGroupName, { groupName: newGroupName })}
          initialGroupName={editingGroupName}
          isEditing={true}
        />
      )}

      {/* フィルタダイアログ */}
      {showFilterDialog && (
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
      )}

      {/* 履歴編集ダイアログ */}
      {actions.editingHistoryWorkProgressId && actions.editingHistoryEntryId && (() => {
        const workProgress = data?.workProgresses?.find((wp) => wp.id === actions.editingHistoryWorkProgressId);
        const entry = workProgress?.progressHistory?.find((e) => e.id === actions.editingHistoryEntryId);
        if (!workProgress || !entry) return null;

        return (
          <ProgressHistoryEditDialog
            isOpen={true}
            onClose={actions.clearEditingHistory}
            entry={entry}
            unit={extractUnit(workProgress.weight)}
            isCountMode={workProgress.targetAmount === undefined}
            onUpdate={async (amount: number, memo?: string) => {
              await actions.handleUpdateProgressHistory(actions.editingHistoryWorkProgressId!, actions.editingHistoryEntryId!, amount, memo);
            }}
            onDelete={async () => {
              await actions.handleDeleteProgressHistory(actions.editingHistoryWorkProgressId!, actions.editingHistoryEntryId!);
            }}
          />
        );
      })()}
    </div>
  );
}
