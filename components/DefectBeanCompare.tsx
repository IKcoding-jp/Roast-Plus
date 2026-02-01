'use client';

import { HiX } from 'react-icons/hi';
import dynamic from 'next/dynamic';

const DefectBeanDetail = dynamic(
  () => import('./DefectBeanDetail').then(mod => ({ default: mod.DefectBeanDetail })),
);
import type { DefectBean } from '@/types';

interface DefectBeanCompareProps {
  defectBeans: DefectBean[];
  settings: { [id: string]: { shouldRemove: boolean } };
  onClose: () => void;
}

export function DefectBeanCompare({
  defectBeans,
  settings,
  onClose,
}: DefectBeanCompareProps) {
  if (defectBeans.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            比較 ({defectBeans.length}件)
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <HiX className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* 比較表示 */}
        <div className="p-6">
          <div
            className={`grid gap-6 ${
              defectBeans.length === 1
                ? 'grid-cols-1'
                : defectBeans.length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {defectBeans.map((defectBean) => (
              <div
                key={defectBean.id}
                className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200 max-h-[85vh] overflow-y-auto overflow-x-hidden flex flex-col"
              >
                <DefectBeanDetail
                  defectBean={defectBean}
                  shouldRemove={settings[defectBean.id]?.shouldRemove}
                  isCompareMode={true}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

