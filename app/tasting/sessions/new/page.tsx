'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { TastingSessionForm } from '@/components/TastingSessionForm';
import { Loading } from '@/components/Loading';
import type { TastingSession } from '@/types';
import { PlusCircle } from 'phosphor-react';
import { useToastContext } from '@/components/Toast';
import { motion } from 'framer-motion';
import { useChristmasMode } from '@/hooks/useChristmasMode';
import { BackLink } from '@/components/ui';

export default function NewTastingSessionPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const router = useRouter();
  const { showToast } = useToastContext();
  const hasRedirected = useRef(false);
  const { isChristmasMode } = useChristmasMode();

  // 未認証時にログインページにリダイレクト
  useEffect(() => {
    if (!authLoading && !user && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push('/login?returnUrl=/tasting/sessions/new');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <Loading />;
  }

  // 未認証の場合はリダイレクト中なので何も表示しない
  if (!user) {
    return null;
  }

  if (isLoading) {
    return <Loading message="データを読み込み中..." />;
  }

  const tastingSessions = Array.isArray(data.tastingSessions) ? data.tastingSessions : [];

  const handleSave = async (session: TastingSession) => {
    try {
      const newSession: TastingSession = {
        ...session,
        userId: user.uid,
      };

      const updatedSessions = [...tastingSessions, newSession];
      await updateData({
        ...data,
        tastingSessions: updatedSessions,
      });

      // 保存が完了してから試飲記録一覧ページに遷移
      // 静的エクスポート時には動的ルートが存在しないため、一覧ページに遷移する
      router.push('/tasting');
    } catch (error) {
      console.error('Failed to save tasting session:', error);
      showToast('セッションの保存に失敗しました。もう一度お試しください。', 'error');
    }
  };

  const handleCancel = () => {
    router.push('/tasting');
  };

  return (
    <div
      className="min-h-screen py-6 sm:py-8 px-4 sm:px-6"
      style={{ backgroundColor: isChristmasMode ? '#051a0e' : '#F7F7F5' }}
    >
      <div className="max-w-lg mx-auto space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col items-center text-center pt-6"
        >
          <BackLink
            href="/tasting"
            variant="icon-only"
            isChristmasMode={isChristmasMode}
            className="absolute left-0 top-0"
          />

          <div className="flex flex-col items-center space-y-2">
            <div className={`p-3 rounded-2xl shadow-sm mb-2 relative ${
              isChristmasMode
                ? 'bg-[#0a2f1a] border border-[#d4af37]/30'
                : 'bg-white border border-stone-100'
            }`}>
              <div className={`absolute inset-0 rounded-2xl scale-110 blur-xl opacity-30 -z-10 ${
                isChristmasMode ? 'bg-[#d4af37]/20' : 'bg-amber-50'
              }`} />
              <PlusCircle size={32} weight="duotone" className={isChristmasMode ? 'text-[#d4af37]' : 'text-amber-600'} />
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isChristmasMode ? 'text-[#f8f1e7]' : 'text-stone-800'
            }`}>
              新規セッション作成
            </h1>
            <p className={`text-sm font-medium ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-stone-400'}`}>
              新しい試飲の記録を開始しましょう
            </p>
          </div>
        </motion.header>

        <main>
          <TastingSessionForm
            session={null}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </main>
      </div>
    </div>
  );
}

