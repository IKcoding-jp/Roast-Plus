'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loading } from '@/components/Loading';
import { useQuizData } from '@/hooks/useQuizData';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { LevelDisplay } from '@/components/coffee-quiz/LevelDisplay';
import { StreakCounter } from '@/components/coffee-quiz/StreakCounter';
import { StatsOverview } from '@/components/coffee-quiz/StatsOverview';
import { CategoryStatsSection } from '@/components/coffee-quiz/CategoryStatsSection';
import { DifficultyStatsSection } from '@/components/coffee-quiz/DifficultyStatsSection';
import { DataManagementSection } from '@/components/coffee-quiz/DataManagementSection';
import { Dialog } from '@/components/ui';
import { DebugPanel } from '@/components/coffee-quiz/DebugPanel';

// アイコン
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const ChartBarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

export default function StatsPage() {
  const { progress, loading: quizLoading, questionsStats, categoryMasteryStats, difficultyMasteryStats, resetProgress } = useQuizData();
  const { isEnabled: isDeveloperMode } = useDeveloperMode();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = () => {
    setIsResetting(true);
    try {
      resetProgress();
      setShowResetDialog(false);
    } catch (error) {
      console.error('Failed to reset progress:', error);
    } finally {
      setIsResetting(false);
    }
  };

  if (quizLoading) {
    return <Loading />;
  }

  const stats = progress?.stats;

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <header className="flex-none px-4 py-3 flex items-center bg-surface border-b border-edge">
        <Link
          href="/coffee-trivia"
          className="p-2 -ml-2 text-ink-sub hover:text-spot hover:bg-ground rounded-full transition-colors"
        >
          <ArrowLeftIcon />
        </Link>
        <h1 className="ml-3 text-lg font-bold text-ink flex items-center gap-2">
          <ChartBarIcon />
          統計
        </h1>
      </header>

      <main className="flex-1 container mx-auto p-4 lg:p-6 max-w-lg space-y-5">
        {progress && stats && (
          <>
            {/* レベル & ストリーク */}
            <div className="grid grid-cols-1 gap-4">
              <LevelDisplay level={progress.level} />
              <StreakCounter streak={progress.streak} />
            </div>

            {/* 全体統計 */}
            <StatsOverview stats={stats} />

            {/* カテゴリ別統計 */}
            <CategoryStatsSection
              stats={stats}
              questionsStats={questionsStats}
              categoryMasteryStats={categoryMasteryStats}
            />

            {/* 難易度別統計 */}
            <DifficultyStatsSection
              stats={stats}
              questionsStats={questionsStats}
              difficultyMasteryStats={difficultyMasteryStats}
            />

            {/* データリセット */}
            <DataManagementSection onResetClick={() => setShowResetDialog(true)} />

            {/* デバッグパネル（開発者モード時のみ表示） */}
            {isDeveloperMode && <DebugPanel />}
          </>
        )}
      </main>

      {/* リセット確認ダイアログ */}
      <Dialog
        isOpen={showResetDialog}
        title="データのリセット"
        description="本当にクイズデータをリセットしますか？学習履歴、レベル、バッジ、統計情報がすべて削除されます。この操作は取り消せません。"
        confirmText="リセット"
        cancelText="キャンセル"
        onConfirm={handleReset}
        onClose={() => setShowResetDialog(false)}
        variant="danger"
        isLoading={isResetting}
      />
    </div>
  );
}
