'use client';

import { useState } from 'react';
import type { TastingRecord, AppData, TastingSession } from '@/types';
import dynamic from 'next/dynamic';

const TastingRadarChart = dynamic(() =>
  import('./TastingRadarChart').then((mod) => ({ default: mod.TastingRadarChart }))
);
import { getRecordsBySessionId } from '@/lib/tastingUtils';
import { useToastContext } from '@/components/Toast';
import { useMembers, getActiveMembers } from '@/hooks/useMembers';
import { useAuth } from '@/lib/auth';
import { User, Calendar, Thermometer, Smiley, ChatCircleText, Coffee } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Select, Textarea, Button } from '@/components/ui';
import { ROAST_LEVELS } from '@/lib/constants';
import { formatDateString } from '@/lib/dateUtils';
import { TastingRecordFormScores } from './TastingRecordFormScores';

interface TastingRecordFormProps {
  record: TastingRecord | null;
  data: AppData;
  sessionId?: string;
  session?: TastingSession;
  onSave: (record: TastingRecord) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

export function TastingRecordForm({
  record,
  data,
  sessionId,
  session,
  onSave,
  onDelete,
  onCancel,
  readOnly = false,
}: TastingRecordFormProps) {
  const { showToast } = useToastContext();
  const { user } = useAuth();
  const userId = user?.uid ?? null;

  const { members: allMembers, manager } = useMembers(userId);

  const currentSessionId = record?.sessionId || sessionId || '';
  const sessionInfo =
    session || (currentSessionId ? data.tastingSessions.find((s) => s.id === currentSessionId) : undefined);

  const isSessionMode = !!sessionInfo;
  const isNew = !record;

  const sessionRecords = currentSessionId ? getRecordsBySessionId(data.tastingRecords, currentSessionId) : [];

  const selectableMembers = [
    ...getActiveMembers(allMembers),
    ...(manager ? [{ id: manager.id, name: manager.name, teamId: '', excludedTaskLabelIds: [] }] : []),
  ];

  // State management
  const [selectedMemberId, setSelectedMemberId] = useState<string>(record?.memberId || '');
  const [beanName, setBeanName] = useState(record?.beanName || sessionInfo?.beanName || '');
  const [tastingDate, setTastingDate] = useState(
    record?.tastingDate || (sessionInfo ? sessionInfo.createdAt.split('T')[0] : formatDateString())
  );
  const [roastLevel, setRoastLevel] = useState<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'>(
    record?.roastLevel || sessionInfo?.roastLevel || '中深煎り'
  );
  const [bitterness, setBitterness] = useState(record?.bitterness || 3.0);
  const [acidity, setAcidity] = useState(record?.acidity || 3.0);
  const [body, setBody] = useState(record?.body || 3.0);
  const [sweetness, setSweetness] = useState(record?.sweetness || 3.0);
  const [aroma, setAroma] = useState(record?.aroma || 3.0);
  const [overallRating, setOverallRating] = useState(record?.overallRating || 3.0);
  const [overallImpression, setOverallImpression] = useState(record?.overallImpression || '');
  const [existingRecordId, setExistingRecordId] = useState<string | null>(null);

  const resetScores = () => {
    setBitterness(3.0);
    setAcidity(3.0);
    setBody(3.0);
    setSweetness(3.0);
    setAroma(3.0);
    setOverallRating(3.0);
    setOverallImpression('');
  };

  const applyExistingRecord = (existing: TastingRecord) => {
    setExistingRecordId(existing.id);
    setBitterness(existing.bitterness);
    setAcidity(existing.acidity);
    setBody(existing.body);
    setSweetness(existing.sweetness);
    setAroma(existing.aroma);
    setOverallRating(existing.overallRating);
    setOverallImpression(existing.overallImpression || '');
  };

  const handleMemberChange = (memberId: string) => {
    setSelectedMemberId(memberId);

    if (!memberId || record !== null || !currentSessionId) {
      setExistingRecordId(null);
      if (!record) {
        resetScores();
      }
      return;
    }

    const existingRecord = sessionRecords.find((r) => r.memberId === memberId);

    if (existingRecord) {
      applyExistingRecord(existingRecord);
    } else {
      setExistingRecordId(null);
      resetScores();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSessionMode && !beanName.trim()) {
      showToast('豆の名前を入力してください', 'warning');
      return;
    }

    if (!selectedMemberId) {
      showToast('メンバーを選択してください', 'warning');
      return;
    }

    if (isNew && !currentSessionId) {
      showToast('セッションIDが設定されていません', 'error');
      return;
    }

    const finalBeanName = isSessionMode && sessionInfo ? sessionInfo.beanName : beanName.trim();
    const finalRoastLevel = isSessionMode && sessionInfo ? sessionInfo.roastLevel : roastLevel;
    const finalTastingDate =
      isSessionMode && sessionInfo ? sessionInfo.createdAt.split('T')[0] : tastingDate;

    const now = new Date().toISOString();
    const newRecord: TastingRecord = {
      id:
        record?.id ||
        existingRecordId ||
        `tasting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: currentSessionId,
      beanName: finalBeanName,
      tastingDate: finalTastingDate,
      roastLevel: finalRoastLevel,
      bitterness,
      acidity,
      body,
      sweetness,
      aroma,
      overallRating,
      overallImpression: overallImpression.trim() || undefined,
      createdAt:
        record?.createdAt ||
        (existingRecordId
          ? sessionRecords.find((r) => r.id === existingRecordId)?.createdAt || now
          : now),
      updatedAt: now,
      userId: record?.userId || '',
      memberId: selectedMemberId,
    };

    onSave(newRecord);
  };

  const handleDelete = () => {
    if (!record || !onDelete) return;

    const confirmDelete = window.confirm('この記録を削除しますか？');
    if (confirmDelete) {
      onDelete(record.id);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-8 pb-10"
    >
      {/* 基本情報カード */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-amber-500 rounded-full" />
          <h3 className="text-lg font-bold text-gray-800">基本情報</h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* メンバー選択 */}
          <div className="relative group">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2 ml-1">
              <User size={18} weight="bold" className="text-amber-500" />
              メンバー <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedMemberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              options={selectableMembers.map((member) => ({ value: member.id, label: member.name }))}
              placeholder="選択してください"
              required
              disabled={readOnly}
            />
          </div>

          {/* 豆の名前（セッションモードでは非表示） */}
          {!isSessionMode && (
            <div className="relative group">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2 ml-1">
                <Coffee size={18} weight="bold" className="text-amber-500" />
                豆の名前 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={beanName}
                onChange={(e) => setBeanName(e.target.value)}
                placeholder="例: エチオピア イルガチェフェ"
                required
                disabled={readOnly}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 試飲日（セッションモードでは非表示） */}
            {!isSessionMode && (
              <div className="relative group">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2 ml-1">
                  <Calendar size={18} weight="bold" className="text-amber-500" />
                  試飲日 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={tastingDate}
                  onChange={(e) => setTastingDate(e.target.value)}
                  required
                  disabled={readOnly}
                />
              </div>
            )}

            {/* 焙煎度合い（セッションモードでは非表示） */}
            {!isSessionMode && (
              <div className="relative group">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2 ml-1">
                  <Thermometer size={18} weight="bold" className="text-amber-500" />
                  焙煎度合い <span className="text-red-500">*</span>
                </label>
                <Select
                  value={roastLevel}
                  onChange={(e) =>
                    setRoastLevel(e.target.value as '浅煎り' | '中煎り' | '中深煎り' | '深煎り')
                  }
                  options={ROAST_LEVELS.map((level) => ({ value: level, label: level }))}
                  required
                  disabled={readOnly}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 評価項目セクション */}
      <TastingRecordFormScores
        bitterness={bitterness}
        acidity={acidity}
        body={body}
        sweetness={sweetness}
        aroma={aroma}
        onBitternessChange={setBitterness}
        onAcidityChange={setAcidity}
        onBodyChange={setBody}
        onSweetnessChange={setSweetness}
        onAromaChange={setAroma}
        readOnly={readOnly}
      />

      {/* プレビュー & コメント */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-full flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-amber-500 rounded-full" />
            <h3 className="text-lg font-bold text-gray-800">プレビュー</h3>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 w-full flex justify-center">
            <TastingRadarChart
              record={{
                bitterness,
                acidity,
                body,
                sweetness,
                aroma,
              }}
              size={240}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="w-full flex items-center gap-2 mb-2">
            <div className="w-1 h-6 bg-amber-500 rounded-full" />
            <h3 className="text-lg font-bold text-gray-800">全体的な印象</h3>
          </div>
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2 ml-1">
              <ChatCircleText size={18} weight="bold" className="text-amber-500" />
              コメント
            </label>
            <Textarea
              value={overallImpression}
              onChange={(e) => setOverallImpression(e.target.value)}
              rows={6}
              placeholder="コーヒーの全体的な印象、味の深み、後味などを自由に記録してください..."
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <AnimatePresence>
        {!readOnly && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-6 flex gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-white/20 z-20"
          >
            {onDelete && record && (
              <Button type="button" variant="outline" onClick={handleDelete} className="flex-1">
                削除
              </Button>
            )}
            <Button type="submit" variant="primary" size="lg" className="flex-[2]">
              <Smiley size={24} weight="bold" />
              {existingRecordId || record ? '記録を更新する' : '記録を保存する'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {readOnly && (
        <div className="flex gap-4">
          <Button type="button" variant="secondary" onClick={onCancel} fullWidth size="lg">
            戻る
          </Button>
        </div>
      )}
    </motion.form>
  );
}
