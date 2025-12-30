'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useAppData } from '@/hooks/useAppData';
import { TastingSessionForm } from '@/components/TastingSessionForm';
import { Loading } from '@/components/Loading';
import type { TastingSession } from '@/types';
import Link from 'next/link';
import { CaretLeft, PlusCircle } from 'phosphor-react';
import { useToastContext } from '@/components/Toast';
import { motion } from 'framer-motion';

export default function NewTastingSessionPage() {
  const { user, loading: authLoading } = useAuth();
  const { data, updateData, isLoading } = useAppData();
  const router = useRouter();
  const { showToast } = useToastContext();
  const hasRedirected = useRef(false);

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
    <div className="min-h-screen py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="max-w-2xl mx-auto space-y-10">
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center space-y-4"
        >
          <Link
            href="/tasting"
            className="group flex items-center gap-2 text-stone-400 hover:text-amber-600 transition-colors font-bold text-sm uppercase tracking-widest"
          >
            <CaretLeft size={20} weight="bold" className="group-hover:-translate-x-1 transition-transform" />
            一覧に戻る
          </Link>
          
          <div className="flex flex-col items-center space-y-3">
            <div className="p-5 bg-white rounded-[2.5rem] shadow-sm border border-stone-100 mb-4 relative">
              <div className="absolute inset-0 bg-amber-50 rounded-[2.5rem] scale-110 blur-2xl opacity-30 -z-10" />
              <PlusCircle size={48} weight="duotone" className="text-amber-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-800 tracking-tight">
              新規セッション作成
            </h1>
            <p className="text-stone-400 font-medium">新しい試飲の記録を開始しましょう</p>
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

