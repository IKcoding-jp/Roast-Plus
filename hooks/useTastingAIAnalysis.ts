import { useState, useCallback, useEffect } from 'react';
import type { TastingSession } from '@/types';
import { analyzeTastingSession } from '@/lib/tastingAnalysis';
import type { AverageScores } from '@/lib/tastingUtils';

interface UseTastingAIAnalysisProps {
  sessions: TastingSession[];
  sessionData: Array<{
    session: TastingSession;
    recordCount: number;
    averageScores: AverageScores;
    comments: string[];
  }>;
  onUpdateSession?: (sessionId: string, aiAnalysis: string, recordCount: number) => void;
}

export function useTastingAIAnalysis({
  sessions,
  sessionData,
  onUpdateSession,
}: UseTastingAIAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState<{ [key: string]: boolean }>({});
  const [analyzedIds, setAnalyzedIds] = useState<Set<string>>(new Set());

  const triggerAutoAnalysis = useCallback(
    async (
      session: TastingSession,
      comments: string[],
      averageScores: AverageScores,
      recordCount: number
    ) => {
      if (isAnalyzing[session.id] || analyzedIds.has(session.id)) return;

      setIsAnalyzing((prev) => ({ ...prev, [session.id]: true }));
      setAnalyzedIds((prev) => new Set(prev).add(session.id));

      const result = await analyzeTastingSession({
        beanName: session.beanName,
        roastLevel: session.roastLevel,
        comments,
        averageScores,
      });

      if (result.status === 'success' && result.text && onUpdateSession) {
        onUpdateSession(session.id, result.text, recordCount);
      }

      setIsAnalyzing((prev) => ({ ...prev, [session.id]: false }));
    },
    [isAnalyzing, analyzedIds, onUpdateSession]
  );

  useEffect(() => {
    if (!onUpdateSession || sessions.length === 0) return;

    sessionData.forEach(({ session, recordCount, averageScores, comments }) => {
      const needsReanalysis =
        recordCount > 0 &&
        (!session.aiAnalysis || session.aiAnalysisRecordCount !== recordCount);

      if (needsReanalysis && !isAnalyzing[session.id] && !analyzedIds.has(session.id)) {
        triggerAutoAnalysis(session, comments, averageScores, recordCount);
      }
    });
  }, [sessionData, onUpdateSession, isAnalyzing, analyzedIds, triggerAutoAnalysis, sessions.length]);

  return { isAnalyzing, analyzedIds };
}
