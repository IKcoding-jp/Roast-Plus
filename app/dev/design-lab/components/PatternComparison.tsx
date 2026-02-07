'use client';

import { useState, useEffect, useCallback } from 'react';
import { splashPatterns } from '@/components/splash/patterns';
import { Button, Select, Card } from '@/components/ui';

export default function PatternComparison() {
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2]);
  const [phases, setPhases] = useState<Record<number, number>>({});
  const [isPlaying, setIsPlaying] = useState(false);

  const replay = useCallback(() => {
    const reset: Record<number, number> = {};
    selectedIds.forEach((id) => {
      reset[id] = 0;
    });
    setPhases(reset);
    setIsPlaying(true);
  }, [selectedIds]);

  useEffect(() => {
    if (!isPlaying) return;

    const timers = [
      setTimeout(() => {
        setPhases((prev) => {
          const next = { ...prev };
          selectedIds.forEach((id) => { next[id] = 1; });
          return next;
        });
      }, 200),
      setTimeout(() => {
        setPhases((prev) => {
          const next = { ...prev };
          selectedIds.forEach((id) => { next[id] = 2; });
          return next;
        });
      }, 800),
      setTimeout(() => {
        setPhases((prev) => {
          const next = { ...prev };
          selectedIds.forEach((id) => { next[id] = 3; });
          return next;
        });
        setIsPlaying(false);
      }, 1400),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isPlaying, selectedIds]);

  const handleSelect = (index: number, value: string) => {
    setSelectedIds((prev) => {
      const next = [...prev];
      next[index] = Number(value);
      return next;
    });
  };

  const addSlot = () => {
    if (selectedIds.length >= 3) return;
    const unused = splashPatterns.find((p) => !selectedIds.includes(p.id));
    if (unused) {
      setSelectedIds((prev) => [...prev, unused.id]);
    }
  };

  const removeSlot = (index: number) => {
    if (selectedIds.length <= 2) return;
    setSelectedIds((prev) => prev.filter((_, i) => i !== index));
  };

  const options = splashPatterns.map((p) => ({
    value: String(p.id),
    label: p.name,
  }));

  return (
    <Card variant="default">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-semibold text-ink">
            Pattern Comparison
          </h4>
          <div className="flex gap-2">
            {selectedIds.length < 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addSlot}
              >
                + Add
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={replay}
            >
              Play All
            </Button>
          </div>
        </div>

        <div className={`grid gap-4 ${selectedIds.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {selectedIds.map((id, index) => {
            const pattern = splashPatterns.find((p) => p.id === id);
            if (!pattern) return null;
            const PatternComponent = pattern.Component;

            return (
              <div key={`${index}-${id}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Select
                    options={options}
                    value={String(id)}
                    onChange={(e) => handleSelect(index, e.target.value)}
                  />
                  {selectedIds.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSlot(index)}
                    >
                      x
                    </Button>
                  )}
                </div>
                <div className="rounded-lg bg-[#1a1210] flex items-center justify-center min-h-[140px] p-4">
                  <PatternComponent phase={phases[id] ?? 0} compact />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
