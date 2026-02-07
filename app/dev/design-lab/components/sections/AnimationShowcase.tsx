'use client';

import { useState, useEffect, useCallback } from 'react';
import { splashPatterns } from '@/components/splash/patterns';
import { Card, Button } from '@/components/ui';
import FullscreenPreview from '../FullscreenPreview';

function AnimationCard({
  pattern,
  onFullscreen,
}: {
  pattern: (typeof splashPatterns)[number];
  onFullscreen: () => void;
}) {
  const [phase, setPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const replay = useCallback(() => {
    setPhase(0);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1400),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isPlaying]);

  // Auto-play on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPlaying(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const PatternComponent = pattern.Component;

  return (
    <Card variant="default">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-base font-semibold text-ink">
              {pattern.name}
            </h4>
            <p className="text-sm text-ink-sub">{pattern.description}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={replay}
            >
              Replay
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFullscreen}
            >
              Fullscreen
            </Button>
          </div>
        </div>
        <div className="rounded-lg bg-[#1a1210] flex items-center justify-center min-h-[160px] p-6">
          <PatternComponent phase={phase} compact />
        </div>
      </div>
    </Card>
  );
}

export default function AnimationShowcase() {
  const [fullscreenPattern, setFullscreenPattern] = useState<
    (typeof splashPatterns)[number] | null
  >(null);
  const [fullscreenPhase, setFullscreenPhase] = useState(0);

  useEffect(() => {
    if (!fullscreenPattern) return;

    const timers = [
      setTimeout(() => setFullscreenPhase(0), 0),
      setTimeout(() => setFullscreenPhase(1), 300),
      setTimeout(() => setFullscreenPhase(2), 1000),
      setTimeout(() => setFullscreenPhase(3), 1700),
    ];

    return () => timers.forEach(clearTimeout);
  }, [fullscreenPattern]);

  const FullscreenComponent = fullscreenPattern?.Component;

  return (
    <div className="space-y-6">
      {splashPatterns.map((pattern) => (
        <AnimationCard
          key={pattern.id}
          pattern={pattern}
          onFullscreen={() => setFullscreenPattern(pattern)}
        />
      ))}

      {fullscreenPattern && FullscreenComponent && (
        <FullscreenPreview onClose={() => setFullscreenPattern(null)}>
          <div className="bg-[#1a1210] w-full h-full flex items-center justify-center">
            <FullscreenComponent phase={fullscreenPhase} />
          </div>
        </FullscreenPreview>
      )}
    </div>
  );
}
