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
      <div className="bg-overlay rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in border border-edge">
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-ink mb-2">追加する項目を選択</h3>
          <p className="text-ink-sub text-sm mb-6">
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
              variant="surface"
              size="md"
              fullWidth
              onClick={onAddGroup}
              className="!rounded-xl !py-3"
            >
              <div className="bg-ground p-2 rounded-full shadow-sm mr-3">
                <HiOutlineCollection className="h-5 w-5" />
              </div>
              <span>グループを作成</span>
            </Button>
          </div>
        </div>
        <div className="bg-ground px-6 py-4 border-t border-edge">
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={onClose}
          >
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  );
}
