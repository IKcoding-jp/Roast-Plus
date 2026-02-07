'use client';

import { HiCollection } from 'react-icons/hi';
import { EmptyState } from '@/components/ui';

export default function ComponentVariations() {
  return (
    <div className="border rounded-lg border-edge">
      <EmptyState
        icon={<HiCollection className="h-12 w-12" />}
        title="バリエーション比較はまだありません"
        description="コンポーネントのバリエーション比較を追加するにはレジストリに登録してください。"
      />
    </div>
  );
}
