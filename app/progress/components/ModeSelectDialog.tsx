'use client';

import { HiPlus } from 'react-icons/hi';
import { HiOutlineCollection } from 'react-icons/hi';
import { Button } from '@/components/ui';

interface ModeSelectDialogProps {
  onClose: () => void;
  onAddWork: () => void;
  onAddGroup: () => void;
}

export function ModeSelectDialog({ onClose, onAddWork, onAddGroup }: ModeSelectDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">追加する項目を選択</h3>
          <p className="text-gray-500 text-sm mb-6">
            新しい作業を追加するか、作業をまとめるグループを作成するか選択してください。
          </p>
          <div className="space-y-3">
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={onAddWork}
              className="shadow-md !rounded-xl !py-3"
            >
              <div className="bg-white/20 p-2 rounded-full shadow-sm mr-3">
                <HiPlus className="h-5 w-5" />
              </div>
              <span>作業を追加</span>
            </Button>
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={onAddGroup}
              className="!bg-gray-50 hover:!bg-gray-100 !text-gray-700 !border !border-gray-200 !rounded-xl !py-3"
            >
              <div className="bg-white p-2 rounded-full shadow-sm mr-3">
                <HiOutlineCollection className="h-5 w-5" />
              </div>
              <span>グループを作成</span>
            </Button>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
