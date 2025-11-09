'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import type { TastingSession, TastingRecord, AppData } from '@/types';
import { TastingRecordForm } from './TastingRecordForm';
import { getRecordsBySessionId } from '@/lib/tastingUtils';

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
      alert('記録の保存に失敗しました。もう一度お試しください。');
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
      alert('記録の削除に失敗しました。もう一度お試しください。');
    }
  };

  const handleCancel = () => {
    setEditingRecordId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {session.beanName}
          </h2>
          <span 
            className="px-3 py-1 text-white text-sm rounded-full"
            style={
              session.roastLevel === '深煎り' 
                ? { backgroundColor: '#120C0A' }
                : session.roastLevel === '中深煎り'
                ? { backgroundColor: '#4E3526' }
                : session.roastLevel === '中煎り'
                ? { backgroundColor: '#745138' }
                : session.roastLevel === '浅煎り'
                ? { backgroundColor: '#C78F5D' }
                : { backgroundColor: '#6B7280' }
            }
          >
            {session.roastLevel}
          </span>
        </div>
      </div>

      {/* 記録編集フォーム（自分の記録がある場合、または編集モードの場合） */}
      {editingRecord ? (
        <div className="mb-6">
          <TastingRecordForm
            record={editingRecord}
            data={data}
            sessionId={session.id}
            session={session}
            onSave={handleRecordSave}
            onDelete={editingRecordId ? handleRecordDelete : undefined}
            onCancel={handleCancel}
          />
        </div>
      ) : null}

      {/* 記録追加フォームを表示 */}
      {!editingRecord && (
        <div className="mb-6">
          <TastingRecordForm
            record={null}
            data={data}
            sessionId={session.id}
            session={session}
            onSave={handleRecordSave}
            onDelete={handleRecordDelete}
            onCancel={() => router.push('/tasting')}
          />
        </div>
      )}
    </div>
  );
}

