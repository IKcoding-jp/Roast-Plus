'use client';

import { HiPlus, HiSearch, HiPencil, HiTrash, HiArchive } from 'react-icons/hi';
import { HiOutlineCollection } from 'react-icons/hi';
import { MdTimeline } from 'react-icons/md';
import { Button, IconButton } from '@/components/ui';
import { WorkProgressCard } from '@/components/work-progress/WorkProgressCard';
import type { WorkProgress, WorkProgressStatus } from '@/types';
import {
  getProgressBarColor,
  calculateProgressPercentage,
  calculateRemaining,
  formatAmount,
  extractUnit,
  formatDateTime,
} from '../utils';

interface GroupedWorkProgress {
  groupName: string;
  taskName: string;
  weight: string;
  workProgresses: WorkProgress[];
}

interface NormalViewProps {
  showEmptyState: boolean;
  isEmpty: boolean;
  hasFilters: boolean;
  groupedWorkProgresses: { groups: GroupedWorkProgress[]; ungrouped: WorkProgress[] };
  archivedCount: number;
  expandedHistoryIds: Set<string>;
  onSetShowAddForm: () => void;
  onSetShowAddGroupForm: () => void;
  onClearFilters: () => void;
  onEditWorkProgress: (id: string) => void;
  onStatusChange: (id: string, status: WorkProgressStatus) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onAddProgress: (id: string | null) => void;
  onToggleHistory: (id: string) => void;
  onEditHistory: (workProgressId: string, entryId: string) => void;
  onEditGroupName: (groupName: string) => void;
  onDeleteGroup: (groupName: string) => void;
  onAddToGroup: (groupName: string) => void;
  onShowArchived: () => void;
}

export function NormalView({
  showEmptyState,
  isEmpty,
  hasFilters,
  groupedWorkProgresses,
  archivedCount,
  expandedHistoryIds,
  onSetShowAddForm,
  onSetShowAddGroupForm,
  onClearFilters,
  onEditWorkProgress,
  onStatusChange,
  onArchive,
  onAddProgress,
  onToggleHistory,
  onEditHistory,
  onEditGroupName,
  onDeleteGroup,
  onAddToGroup,
  onShowArchived,
}: NormalViewProps) {
  return (
    <>
      {/* エンプティステート */}
      {showEmptyState && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center">
          <div className="bg-surface p-6 rounded-full shadow-lg mb-6 border border-edge">
            <MdTimeline className="h-16 w-16 text-spot" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink mb-2">作業進捗を管理しましょう</h2>
          <p className="text-ink-sub mb-8 max-w-md mx-auto">
            日々の作業の進捗状況を記録・可視化できます。<br />
            まずは新しい作業を追加してみましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={onSetShowAddForm}
              className="shadow-lg hover:shadow-xl !rounded-xl"
            >
              <HiPlus className="h-5 w-5 mr-2" />
              作業を追加
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onSetShowAddGroupForm}
              className="shadow-md hover:shadow-lg !rounded-xl"
            >
              <HiOutlineCollection className="h-5 w-5 mr-2" />
              グループを作成
            </Button>
          </div>
          {archivedCount > 0 && (
            <button
              onClick={onShowArchived}
              className="mt-8 text-ink-muted hover:text-ink-sub text-sm flex items-center gap-1 transition-colors"
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
          <div className="text-ink-muted mb-4">
            <HiSearch className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-ink-sub font-medium">条件に一致する作業が見つかりませんでした</p>
          <button
            onClick={onClearFilters}
            className="mt-4 text-spot hover:text-spot-hover font-medium transition-colors"
          >
            フィルタを解除
          </button>
        </div>
      )}

      {/* グループ化された作業 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {groupedWorkProgresses.groups.map((group) => (
          <div key={group.groupName} className="bg-surface rounded-xl shadow-card border border-edge overflow-hidden">
            <div className="bg-ground px-4 py-3 border-b border-edge flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HiOutlineCollection className="text-ink-muted h-5 w-5" />
                <h2 className="font-bold text-ink text-lg">{group.groupName}</h2>
                <span className="text-xs font-medium bg-ground text-ink-sub px-2 py-0.5 rounded-full border border-edge">
                  {group.workProgresses.length}件
                </span>
              </div>
              <div className="flex items-center gap-1">
                <IconButton
                  variant="default"
                  size="md"
                  onClick={() => onEditGroupName(group.groupName)}
                  title="グループ名を編集"
                  rounded
                >
                  <HiPencil className="h-4 w-4" />
                </IconButton>
                <IconButton
                  variant="danger"
                  size="md"
                  onClick={() => onDeleteGroup(group.groupName)}
                  title="グループを削除"
                  rounded
                >
                  <HiTrash className="h-4 w-4" />
                </IconButton>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-4">
              {group.workProgresses.map((wp) => (
                <WorkProgressCard
                  key={wp.id}
                  workProgress={wp}
                  isInGroup={true}
                  onEdit={onEditWorkProgress}
                  onStatusChange={onStatusChange}
                  onArchive={onArchive}
                  onAddProgress={onAddProgress}
                  onToggleHistory={onToggleHistory}
                  onEditHistory={onEditHistory}
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
                onClick={() => onAddToGroup(group.groupName)}
                className="w-full py-2 border-2 border-dashed border-edge rounded-lg text-ink-muted hover:text-spot hover:border-spot-subtle hover:bg-spot-surface transition-all flex items-center justify-center gap-2 text-sm font-medium"
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
            <h2 className="text-lg font-bold text-ink-sub mb-4 px-2 border-l-4 border-ink-muted">その他の作業</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedWorkProgresses.ungrouped.map((wp) => (
              <WorkProgressCard
                key={wp.id}
                workProgress={wp}
                isInGroup={false}
                onEdit={onEditWorkProgress}
                onStatusChange={onStatusChange}
                onArchive={onArchive}
                onAddProgress={onAddProgress}
                onToggleHistory={onToggleHistory}
                onEditHistory={onEditHistory}
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
  );
}
