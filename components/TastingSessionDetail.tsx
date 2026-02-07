'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import type { TastingSession, TastingRecord, AppData } from '@/types';
import { TastingRecordForm } from './TastingRecordForm';
import { getRecordsBySessionId } from '@/lib/tastingUtils';
import { Coffee } from 'phosphor-react';
import { useToastContext } from '@/components/Toast';
import { Card, RoastLevelBadge } from '@/components/ui';

interface TastingSessionDetailProps {
  session: TastingSession;
  data: AppData;
  onUpdate: (data: AppData) => void;
}

export function TastingSessionDetail({
  session,
  data,
  onUpdate,
}: TastingSessionDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const tastingRecords = Array.isArray(data.tastingRecords)
    ? data.tastingRecords
    : [];
  const sessionRecords = getRecordsBySessionId(tastingRecords, session.id);
  
  // 編集対象の記録を取得（編集モードの場合）
  const editingRecord = editingRecordId
    ? sessionRecords.find((r) => r.id === editingRecordId) || null
    : null;


  const handleRecordSave = async (record: TastingRecord) => {
    try {
      const newRecord: TastingRecord = {
        ...record,
        userId: user?.uid || '',
        sessionId: session.id,
      };

      // 既存の記録を上書きする場合（record.idが存在する、または同じセッション内で同じメンバーの記録がある場合）
      const existingRecordById = tastingRecords.find((r) => r.id === record.id);
      const existingRecordByMember = sessionRecords.find((r) => r.memberId === record.memberId && r.id !== record.id);
      
      if (existingRecordById) {
        // IDで既存記録が見つかった場合（編集モード）
        const updatedRecords = tastingRecords.map((r) =>
          r.id === record.id ? newRecord : r
        );
        await onUpdate({
          ...data,
          tastingRecords: updatedRecords,
        });
        // 編集モードを解除
        setEditingRecordId(null);
      } else if (existingRecordByMember) {
        // 同じメンバーの記録が既にある場合（上書き）
        const updatedRecords = tastingRecords.map((r) =>
          r.id === existingRecordByMember.id ? newRecord : r
        );
        await onUpdate({
          ...data,
          tastingRecords: updatedRecords,
        });
        // 編集モードに切り替える
        setEditingRecordId(existingRecordByMember.id);
      } else {
        // 新規追加の場合
        const updatedRecords = [...tastingRecords, newRecord];
        await onUpdate({
          ...data,
          tastingRecords: updatedRecords,
        });
        // 編集モードに切り替える（新規作成した記録を編集モードにする）
        setEditingRecordId(newRecord.id);
      }
      
      // 保存が完了してから試飲記録一覧ページに遷移
      router.push('/tasting');
    } catch (error) {
      console.error('Failed to save tasting record:', error);
      showToast('記録の保存に失敗しました。もう一度お試しください。', 'error');
    }
  };

  const handleRecordDelete = async (recordId: string) => {
    const confirmDelete = window.confirm('この記録を削除しますか？');
    if (!confirmDelete) return;

    try {
      const updatedRecords = tastingRecords.filter((r) => r.id !== recordId);
      await onUpdate({
        ...data,
        tastingRecords: updatedRecords,
      });
      // 削除した記録が編集対象だった場合、編集モードを解除
      if (editingRecordId === recordId) {
        setEditingRecordId(null);
      }
      
      // 削除が完了してから試飲記録一覧ページに遷移
      router.push('/tasting');
    } catch (error) {
      console.error('Failed to delete tasting record:', error);
      showToast('記録の削除に失敗しました。もう一度お試しください。', 'error');
    }
  };

  const handleCancel = () => {
    setEditingRecordId(null);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* ヘッダーカード */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-spot-subtle">
              <Coffee size={32} weight="fill" className="text-spot" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-ink">
                {session.beanName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <RoastLevelBadge level={session.roastLevel} size="sm" />
                <span className="text-sm font-medium text-ink-muted">
                  {new Date(session.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 記録編集フォーム（自分の記録がある場合、または編集モードの場合） */}
      {editingRecord ? (
        <TastingRecordForm
          record={editingRecord}
          data={data}
          sessionId={session.id}
          session={session}
          onSave={handleRecordSave}
          onDelete={editingRecordId ? handleRecordDelete : undefined}
          onCancel={handleCancel}
        />
      ) : null}

      {/* 記録追加フォームを表示 */}
      {!editingRecord && (
        <TastingRecordForm
          record={null}
          data={data}
          sessionId={session.id}
          session={session}
          onSave={handleRecordSave}
          onDelete={handleRecordDelete}
          onCancel={() => router.push('/tasting')}
        />
      )}
    </div>
  );
}

