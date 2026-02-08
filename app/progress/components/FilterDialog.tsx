'use client';

import { HiX } from 'react-icons/hi';
import { Button, IconButton, Input, Select } from '@/components/ui';
import type { WorkProgressStatus } from '@/types';

type SortOption = 'createdAt' | 'beanName' | 'status';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filterTaskName: string;
  setFilterTaskName: (val: string) => void;
  filterStatus: WorkProgressStatus | 'all';
  setFilterStatus: (val: WorkProgressStatus | 'all') => void;
  sortOption: SortOption;
  setSortOption: (val: SortOption) => void;
}

export function FilterDialog({
  isOpen, onClose, filterTaskName, setFilterTaskName, filterStatus, setFilterStatus, sortOption, setSortOption
}: FilterDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-overlay rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in border border-edge">
        <div className="px-6 py-4 border-b border-edge flex justify-between items-center bg-ground">
          <h3 className="font-bold text-ink text-lg">表示設定</h3>
          <IconButton variant="ghost" size="md" rounded onClick={onClose} aria-label="閉じる">
            <HiX className="h-5 w-5" />
          </IconButton>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <Input
              label="キーワード検索"
              value={filterTaskName}
              onChange={(e) => setFilterTaskName(e.target.value)}
              placeholder="作業名で検索..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">ステータス</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'すべて' },
                { value: 'pending', label: '作業前' },
                { value: 'in_progress', label: '作業中' },
                { value: 'completed', label: '完了' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterStatus(option.value as WorkProgressStatus | 'all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${filterStatus === option.value
                    ? 'bg-spot-subtle text-spot border-spot ring-1 ring-spot'
                    : 'bg-surface text-ink-sub border-edge hover:bg-ground'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Select
              label="並び替え"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              options={[
                { value: 'createdAt', label: '作成日順' },
                { value: 'beanName', label: '名前順' },
                { value: 'status', label: 'ステータス順' },
              ]}
            />
          </div>
        </div>

        <div className="bg-ground px-6 py-4 border-t border-edge">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={onClose}
            className="shadow-md !rounded-xl"
          >
            完了
          </Button>
        </div>
      </div>
    </div>
  );
}
