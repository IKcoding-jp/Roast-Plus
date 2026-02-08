'use client';

import { HiArchive } from 'react-icons/hi';
import { Button } from '@/components/ui';
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
        <div className="text-center py-12 bg-surface rounded-xl shadow-card border border-edge">
          <div className="text-ink-muted mb-4">
            <HiArchive className="h-16 w-16 mx-auto" />
          </div>
          <p className="text-ink-sub font-medium">アーカイブされた作業はありません</p>
        </div>
      ) : (
        archivedWorkProgressesByDate.map((group) => (
          <div key={group.date} className="bg-surface rounded-xl shadow-card border border-edge overflow-hidden">
            <div className="bg-ground px-4 py-3 border-b border-edge">
              <h2 className="font-bold text-ink flex items-center gap-2">
                <span className="text-spot">{new Date(group.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="text-xs font-normal text-ink-sub bg-surface px-2 py-0.5 rounded-full border border-edge">
                  {group.workProgresses.length}件
                </span>
              </h2>
            </div>
            <div className="divide-y divide-edge">
              {group.workProgresses.map((wp) => {
                const unit = extractUnit(wp.weight);
                return (
                  <div key={wp.id} className="p-4 hover:bg-ground transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-ink">{wp.taskName || '名称未設定'}</h3>
                          {wp.groupName && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-ground text-ink-sub rounded border border-edge">
                              {wp.groupName}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-ink-sub mb-2">
                          {wp.targetAmount !== undefined ? (
                            <span>
                              {formatAmount(wp.currentAmount || 0, unit)} / {formatAmount(wp.targetAmount, unit)}{unit}
                              <span className="text-ink-muted mx-2">|</span>
                              達成率: {calculateProgressPercentage(wp).toFixed(0)}%
                            </span>
                          ) : (
                            <span>完成数: {wp.completedCount || 0}個</span>
                          )}
                        </div>
                        {wp.memo && (
                          <p className="text-xs text-ink-sub bg-ground p-2 rounded border border-edge inline-block max-w-full">
                            {wp.memo}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUnarchive(wp.id)}
                      >
                        戻す
                      </Button>
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
