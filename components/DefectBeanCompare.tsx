'use client';

import dynamic from 'next/dynamic';
import { Modal, IconButton } from '@/components/ui';
import { HiX } from 'react-icons/hi';

const DefectBeanDetail = dynamic(
  () => import('./DefectBeanDetail').then(mod => ({ default: mod.DefectBeanDetail })),
);
import type { DefectBean } from '@/types';

interface DefectBeanCompareProps {
  defectBeans: DefectBean[];
  settings: { [id: string]: { shouldRemove: boolean } };
  onClose: () => void;
  isChristmasMode?: boolean;
}

export function DefectBeanCompare({
  defectBeans,
  settings,
  onClose,
  isChristmasMode = false,
}: DefectBeanCompareProps) {
  if (defectBeans.length === 0) {
    return null;
  }

  return (
    <Modal
      show={true}
      onClose={onClose}
      closeOnBackdropClick={true}
      contentClassName={`rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto ${
        isChristmasMode ? 'bg-[#0a2f1a]' : 'bg-white'
      }`}
    >
      {/* ヘッダー */}
      <div className={`sticky top-0 p-4 flex items-center justify-between z-10 border-b ${
        isChristmasMode
          ? 'bg-[#0a2f1a] border-[#d4af37]/20'
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
          比較 ({defectBeans.length}件)
        </h2>
        <IconButton
          onClick={onClose}
          isChristmasMode={isChristmasMode}
          rounded
          aria-label="閉じる"
        >
          <HiX className="h-6 w-6" />
        </IconButton>
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
              className={`rounded-lg p-4 sm:p-5 border max-h-[85vh] overflow-y-auto overflow-x-hidden flex flex-col ${
                isChristmasMode
                  ? 'bg-white/5 border-[#d4af37]/20'
                  : 'bg-gray-50 border-gray-200'
              }`}
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
    </Modal>
  );
}
