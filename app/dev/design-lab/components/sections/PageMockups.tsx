'use client';

import { HiTemplate } from 'react-icons/hi';
import { EmptyState } from '@/components/ui';

export default function PageMockups() {
  return (
    <div className="border rounded-lg border-edge">
      <EmptyState
        icon={<HiTemplate className="h-12 w-12" />}
        title="ページモックはまだありません"
        description="モックを追加するにはレジストリに登録してください。"
      />
    </div>
  );
}
