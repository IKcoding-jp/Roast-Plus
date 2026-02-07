'use client';

import { Card } from '@/components/ui';

const fontFamilies = [
  { name: 'Geist Sans', className: 'font-sans', sample: 'The quick brown fox jumps over the lazy dog - 素早い茶色の狐が怠惰な犬を飛び越える' },
  { name: 'Geist Mono', className: 'font-mono', sample: 'const roast = { level: "medium", temp: 205 };' },
  { name: 'Nunito', className: 'font-nunito', sample: 'RoastPlus - Coffee Roasting Management' },
  { name: 'Playfair Display', className: 'font-[var(--font-playfair)]', sample: 'RoastPlus Elegant Typography' },
];

const fontSizes = [
  { label: 'text-xs', className: 'text-xs' },
  { label: 'text-sm', className: 'text-sm' },
  { label: 'text-base', className: 'text-base' },
  { label: 'text-lg', className: 'text-lg' },
  { label: 'text-xl', className: 'text-xl' },
  { label: 'text-2xl', className: 'text-2xl' },
  { label: 'text-3xl', className: 'text-3xl' },
  { label: 'text-4xl', className: 'text-4xl' },
  { label: 'text-5xl', className: 'text-5xl' },
];

const fontWeights = [
  { label: 'font-light', className: 'font-light', weight: 300 },
  { label: 'font-normal', className: 'font-normal', weight: 400 },
  { label: 'font-medium', className: 'font-medium', weight: 500 },
  { label: 'font-semibold', className: 'font-semibold', weight: 600 },
  { label: 'font-bold', className: 'font-bold', weight: 700 },
];

export default function Typography() {
  return (
    <div className="space-y-8">
      {/* Font Families */}
      <Card variant="default">
        <div className="p-5">
          <h4 className="text-base font-semibold text-ink mb-4">
            Font Families
          </h4>
          <div className="space-y-4">
            {fontFamilies.map((font) => (
              <div key={font.name} className="p-4 rounded-lg bg-ground">
                <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">
                  {font.name}
                </p>
                <p className={`text-lg text-ink ${font.className}`}>
                  {font.sample}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Font Sizes */}
      <Card variant="default">
        <div className="p-5">
          <h4 className="text-base font-semibold text-ink mb-4">
            Font Sizes
          </h4>
          <div className="space-y-3">
            {fontSizes.map((size) => (
              <div key={size.label} className="flex items-baseline gap-4">
                <span className="text-xs text-ink-muted w-20 shrink-0 font-mono">
                  {size.label}
                </span>
                <span className={`text-ink ${size.className} truncate`}>
                  RoastPlus
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Font Weights */}
      <Card variant="default">
        <div className="p-5">
          <h4 className="text-base font-semibold text-ink mb-4">
            Font Weights
          </h4>
          <div className="space-y-3">
            {fontWeights.map((weight) => (
              <div key={weight.label} className="flex items-baseline gap-4">
                <span className="text-xs text-ink-muted w-28 shrink-0 font-mono">
                  {weight.label} ({weight.weight})
                </span>
                <span className={`text-xl text-ink ${weight.className}`}>
                  Coffee Roasting
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
