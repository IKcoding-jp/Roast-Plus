'use client';

import { HiX, HiSearch } from 'react-icons/hi';
import { Button } from '@/components/ui';
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">表示設定</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <HiX className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
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
                  onClick={() => setFilterStatus(option.value as WorkProgressStatus | 'all')}
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
