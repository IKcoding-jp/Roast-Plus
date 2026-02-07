'use client';

import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { componentRegistry, categoryLabels, getComponentsByCategory } from '@/components/ui/registry';
import { useChristmasMode } from '@/hooks/useChristmasMode';
import { HiArrowLeft } from 'react-icons/hi';

/**
 * UIコンポーネントテストページ
 *
 * 全共通コンポーネントを一覧表示し、クリスマスモードの切り替えテストが可能。
 * 新しいコンポーネントを追加する場合は、components/ui/registry.tsx に追加するだけで
 * 自動的にこのページに表示されます。
 */
export default function UITestPage() {
  const { isChristmasMode, toggleChristmasMode } = useChristmasMode();
  const componentsByCategory = getComponentsByCategory();

  // 表示するカテゴリの順序
  const categoryOrder: Array<keyof typeof categoryLabels> = [
    'button',
    'form',
    'container',
    'display',
    'feedback',
  ];

  return (
    <div
      className="min-h-screen p-6 bg-page"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ヘッダー */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg transition-colors text-ink-sub hover:text-ink hover:bg-ground"
              title="設定に戻る"
              aria-label="設定に戻る"
            >
              <HiArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold text-spot">
              UIコンポーネントテスト
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleChristmasMode}
          >
            {isChristmasMode ? '通常モード' : 'クリスマスモード'}
          </Button>
        </header>

        {/* 統計情報 */}
        <div className="p-4 rounded-lg bg-spot-surface">
          <p className="text-sm text-spot">
            <span className="font-bold">{componentRegistry.length}</span> 個の共通コンポーネントが登録されています
          </p>
        </div>

        {/* カテゴリ別コンポーネント表示 */}
        {categoryOrder.map((category) => {
          const components = componentsByCategory[category];
          if (components.length === 0) return null;

          return (
            <div key={category} className="space-y-4">
              {/* カテゴリヘッダー */}
              <h2 className="text-lg font-bold text-spot">
                {categoryLabels[category]}
                <span className="ml-2 text-sm font-normal text-ink-muted">
                  ({components.length})
                </span>
              </h2>

              {/* コンポーネントカード */}
              {components.map((item) => (
                <Card key={item.name}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-ink">
                        {item.name}
                        {item.isNew && (
                          <span className="text-xs font-normal text-amber-500 ml-2">NEW</span>
                        )}
                      </h3>
                      <p className="text-sm mt-1 text-ink-sub">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <item.Demo />
                </Card>
              ))}
            </div>
          );
        })}

        {/* フッター */}
        <div className="text-center py-8 text-ink-muted">
          <p className="text-sm">
            新しいコンポーネントを追加するには<br />
            <code className="px-2 py-1 rounded bg-ground">
              components/ui/registry.tsx
            </code>
            <br />
            にエントリを追加してください
          </p>
        </div>
      </div>
    </div>
  );
}
