'use client';

import { Card } from '@/components/ui';


interface ColorGroup {
  label: string;
  colors: { name: string; variable: string; normalValue: string; christmasValue: string }[];
}

const colorGroups: ColorGroup[] = [
  {
    label: 'Background',
    colors: [
      { name: 'page', variable: '--page', normalValue: '#F7F7F5', christmasValue: '#051a0e' },
      { name: 'surface', variable: '--surface', normalValue: '#FFFFFF', christmasValue: 'rgba(255,255,255,0.05)' },
      { name: 'overlay', variable: '--overlay', normalValue: '#FFFFFF', christmasValue: '#0a2f1a' },
      { name: 'ground', variable: '--ground', normalValue: '#F5F5F5', christmasValue: 'rgba(255,255,255,0.03)' },
      { name: 'field', variable: '--field', normalValue: '#FFFFFF', christmasValue: 'rgba(255,255,255,0.08)' },
    ],
  },
  {
    label: 'Text',
    colors: [
      { name: 'ink', variable: '--ink', normalValue: '#1f2937', christmasValue: '#f8f1e7' },
      { name: 'ink-sub', variable: '--ink-sub', normalValue: '#4b5563', christmasValue: 'rgba(248,241,231,0.7)' },
      { name: 'ink-muted', variable: '--ink-muted', normalValue: '#9ca3af', christmasValue: 'rgba(248,241,231,0.5)' },
    ],
  },
  {
    label: 'Border',
    colors: [
      { name: 'edge', variable: '--edge', normalValue: '#e5e7eb', christmasValue: 'rgba(212,175,55,0.2)' },
      { name: 'edge-strong', variable: '--edge-strong', normalValue: '#d1d5db', christmasValue: 'rgba(212,175,55,0.4)' },
    ],
  },
  {
    label: 'Accent',
    colors: [
      { name: 'spot', variable: '--spot', normalValue: '#d97706', christmasValue: '#d4af37' },
      { name: 'spot-hover', variable: '--spot-hover', normalValue: '#b45309', christmasValue: '#e8c65f' },
      { name: 'spot-subtle', variable: '--spot-subtle', normalValue: '#fef3c7', christmasValue: 'rgba(212,175,55,0.15)' },
      { name: 'spot-surface', variable: '--spot-surface', normalValue: '#fffbeb', christmasValue: 'rgba(212,175,55,0.05)' },
    ],
  },
  {
    label: 'Button',
    colors: [
      { name: 'btn-primary', variable: '--btn-primary', normalValue: '#d97706', christmasValue: '#6d1a1a' },
      { name: 'btn-primary-hover', variable: '--btn-primary-hover', normalValue: '#b45309', christmasValue: '#8b2323' },
    ],
  },
  {
    label: 'Status',
    colors: [
      { name: 'danger', variable: '--danger', normalValue: '#dc2626', christmasValue: '#991b1b' },
      { name: 'danger-subtle', variable: '--danger-subtle', normalValue: '#fee2e2', christmasValue: 'rgba(127,29,29,0.5)' },
      { name: 'success', variable: '--success', normalValue: '#16a34a', christmasValue: '#166534' },
      { name: 'success-subtle', variable: '--success-subtle', normalValue: '#dcfce7', christmasValue: 'rgba(20,83,45,0.5)' },
      { name: 'warning', variable: '--warning', normalValue: '#eab308', christmasValue: '#d4af37' },
      { name: 'warning-subtle', variable: '--warning-subtle', normalValue: '#fef9c3', christmasValue: 'rgba(113,63,18,0.5)' },
      { name: 'info', variable: '--info', normalValue: '#00b8d4', christmasValue: '#0097a7' },
      { name: 'info-hover', variable: '--info-hover', normalValue: '#00a0b8', christmasValue: '#00838f' },
    ],
  },
  {
    label: 'Error',
    colors: [
      { name: 'error', variable: '--error', normalValue: '#ef4444', christmasValue: '#f87171' },
      { name: 'error-ring', variable: '--error-ring', normalValue: '#fee2e2', christmasValue: 'rgba(248,113,113,0.2)' },
    ],
  },
];

function ColorSwatch({ color, value }: { color: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-ground">
      <div
        className="w-10 h-10 rounded-lg border border-edge shrink-0"
        style={{ backgroundColor: value }}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{color}</p>
        <p className="text-xs text-ink-muted truncate">{value}</p>
      </div>
    </div>
  );
}

export default function ColorPalette() {
  return (
    <div className="space-y-8">
      {colorGroups.map((group) => (
        <Card key={group.label} variant="default">
          <div className="p-5">
            <h4 className="text-base font-semibold text-ink mb-4">
              {group.label}
            </h4>

            <div className="space-y-4">
              {/* Normal Theme */}
              <div>
                <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">
                  Normal
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {group.colors.map((c) => (
                    <ColorSwatch
                      key={`normal-${c.name}`}
                      color={c.variable}
                      value={c.normalValue}
                    />
                  ))}
                </div>
              </div>

              {/* Christmas Theme */}
              <div>
                <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">
                  Christmas
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {group.colors.map((c) => (
                    <ColorSwatch
                      key={`xmas-${c.name}`}
                      color={c.variable}
                      value={c.christmasValue}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
