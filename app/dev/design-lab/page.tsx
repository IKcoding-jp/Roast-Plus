'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi';
import { Button, IconButton } from '@/components/ui';
import { useChristmasMode } from '@/hooks/useChristmasMode';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import SectionNav from './components/SectionNav';
import ComponentGallery from './components/sections/ComponentGallery';
import AnimationShowcase from './components/sections/AnimationShowcase';
import PageMockups from './components/sections/PageMockups';
import ColorPalette from './components/sections/ColorPalette';
import Typography from './components/sections/Typography';
import ComponentVariations from './components/sections/ComponentVariations';
import PatternComparison from './components/PatternComparison';
import ResponsivePreview from './components/ResponsivePreview';

const sectionComponents: Record<string, React.ComponentType> = {
  components: ComponentGallery,
  animations: AnimationShowcase,
  'page-mockups': PageMockups,
  colors: ColorPalette,
  typography: Typography,
  variations: ComponentVariations,
};

export default function DesignLabPage() {
  const router = useRouter();
  const { isChristmasMode, toggleChristmasMode } = useChristmasMode();
  const { isEnabled } = useDeveloperMode();

  const [activeSection, setActiveSection] = useState('components');

  // ハッシュフラグメントで初期セクションを設定
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      queueMicrotask(() => setActiveSection(hash));
    }
  }, []);

  // 開発者モードでない場合はリダイレクト
  useEffect(() => {
    if (typeof window !== 'undefined' && !isEnabled) {
      router.replace('/settings');
    }
  }, [isEnabled, router]);

  if (!isEnabled) {
    return null;
  }

  // アクティブセクションのコンテンツ
  const renderContent = () => {
    if (activeSection === 'pattern-comparison') {
      return <PatternComparison />;
    }
    if (activeSection === 'responsive-preview') {
      return (
        <ResponsivePreview>
          <ComponentGallery />
        </ResponsivePreview>
      );
    }
    const Component = sectionComponents[activeSection];
    if (Component) {
      return <Component />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-page">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 border-b border-edge bg-surface/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <IconButton
              variant="ghost"
              onClick={() => router.push('/settings')}
              aria-label="設定に戻る"
            >
              <HiArrowLeft className="h-5 w-5" />
            </IconButton>
            <h1 className="text-lg font-bold text-spot">Developer Design Lab</h1>
            <span className="text-xs font-mono text-ink-muted">DEV</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleChristmasMode}>
              {isChristmasMode ? '通常モード' : 'クリスマス'}
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex">
        {/* サイドナビ（タブ切り替え） */}
        <aside className="w-52 shrink-0 sticky top-[57px] self-start h-[calc(100vh-57px)] border-r border-edge bg-surface p-3 overflow-y-auto">
          <SectionNav
            activeSection={activeSection}
            onSectionClick={setActiveSection}
          />
        </aside>

        {/* コンテンツエリア */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
