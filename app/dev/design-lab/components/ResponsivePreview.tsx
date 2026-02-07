'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';

interface ResponsivePreviewProps {
  children: React.ReactNode;
}

const PRESETS = [
  { label: 'Mobile', width: 375, icon: 'M' },
  { label: 'Tablet', width: 768, icon: 'T' },
  { label: 'Desktop', width: 1280, icon: 'D' },
] as const;

export default function ResponsivePreview({ children }: ResponsivePreviewProps) {
  const [activePreset, setActivePreset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const targetWidth = PRESETS[activePreset].width;

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const available = containerRef.current.offsetWidth;
      const newScale = Math.min(1, available / targetWidth);
      setScale(newScale);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [targetWidth]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {PRESETS.map((preset, i) => (
          <Button
            key={preset.label}
            variant={activePreset === i ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActivePreset(i)}
          >
            {preset.label} ({preset.width}px)
          </Button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="border border-edge rounded-lg overflow-hidden bg-page"
      >
        <div
          style={{
            width: targetWidth,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            height: `${600 * scale}px`,
          }}
        >
          <div style={{ width: targetWidth, height: 600, overflow: 'auto' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
