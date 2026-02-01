'use client';

import { HiArchive } from 'react-icons/hi';
import type { WorkProgress } from '@/types';
import { calculateProgressPercentage, formatAmount, extractUnit } from '../utils';

interface ArchivedGroup {
  date: string;
  workProgresses: WorkProgress[];
}

interface ArchivedViewProps {
  archivedWorkProgressesByDate: ArchivedGroup[];
  onUnarchive: (id: string) => Promise<void>;
}

export function ArchivedView({ archivedWorkProgressesByDate, onUnarchive }: ArchivedViewProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {archivedWorkProgressesByDate.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-gray-300 mb-4">
            <HiArchive className="h-16 w-16 mx-auto" />
          </div>
          <p className="text-gray-500 font-medium">アーカイブされた作業はありません</p>
        </div>
      ) : (
        archivedWorkProgressesByDate.map((group) => (
          <div key={group.date} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <span className="text-amber-600">{new Date(group.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                  {group.workProgresses.length}件
                </span>
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {group.workProgresses.map((wp) => {
                const unit = extractUnit(wp.weight);
                return (
                  <div key={wp.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800">{wp.taskName || '名称未設定'}</h3>
                          {wp.groupName && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {wp.groupName}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {wp.targetAmount !== undefined ? (
                            <span>
                              {formatAmount(wp.currentAmount || 0, unit)} / {formatAmount(wp.targetAmount, unit)}{unit}
                              <span className="text-gray-400 mx-2">|</span>
                              達成率: {calculateProgressPercentage(wp).toFixed(0)}%
                            </span>
                          ) : (
                            <span>完成数: {wp.completedCount || 0}個</span>
                          )}
                        </div>
                        {wp.memo && (
                          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 inline-block max-w-full">
                            {wp.memo}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onUnarchive(wp.id)}
                        className="px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition-colors whitespace-nowrap"
                      >
                        戻す
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
