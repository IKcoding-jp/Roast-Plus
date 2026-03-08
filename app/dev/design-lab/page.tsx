'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FloatingNav } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import SectionNav from './components/SectionNav';
import ComponentGallery from './components/sections/ComponentGallery';
import PageMockups from './components/sections/PageMockups';
import ColorPalette from './components/sections/ColorPalette';
import Typography from './components/sections/Typography';
import ComponentVariations from './components/sections/ComponentVariations';
import ModalAnimations from './components/sections/ModalAnimations';
import ResponsivePreview from './components/ResponsivePreview';

const sectionComponents: Record<string, React.ComponentType> = {
  components: ComponentGallery,
  'page-mockups': PageMockups,
  colors: ColorPalette,
  typography: Typography,
  'modal-animations': ModalAnimations,
  variations: ComponentVariations,
};

export default function DesignLabPage() {
  const router = useRouter();
  const { currentTheme, setTheme, presets } = useAppTheme();
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
      {/* FloatingNav（戻る + テーマセレクター） */}
      <FloatingNav
        backHref="/settings"
        right={
          <select
            value={currentTheme ?? 'default'}
            onChange={(e) => setTheme(e.target.value)}
            suppressHydrationWarning
            className="rounded-full bg-surface/80 backdrop-blur-sm shadow-md
              px-3 py-1.5 text-sm text-ink border border-edge
              hover:bg-surface transition-colors cursor-pointer"
          >
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        }
      />

      {/* メインコンテンツ */}
      <div className="flex">
        {/* サイドナビ（タブ切り替え） */}
        <aside className="w-52 shrink-0 sticky top-0 self-start h-screen border-r border-edge bg-surface px-3 flex flex-col justify-center overflow-y-auto">
          <SectionNav
            activeSection={activeSection}
            onSectionClick={setActiveSection}
          />
        </aside>

        {/* コンテンツエリア */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-6 pt-14">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
