'use client';

import { useState } from 'react';
import type { TastingSession } from '@/types';
import { useToastContext } from '@/components/Toast';
import { motion } from 'framer-motion';
import {
  Coffee,
  CalendarBlank,
  Thermometer,
  Trash,
  X,
  Plus,
  Check
} from 'phosphor-react';
import { Input, Select, Button } from '@/components/ui';
import { ROAST_LEVELS } from '@/lib/constants';
import { formatDateString } from '@/lib/dateUtils';
import { useChristmasMode } from '@/hooks/useChristmasMode';

interface TastingSessionFormProps {
  session: TastingSession | null;
  onSave: (session: TastingSession) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export function TastingSessionForm({
  session,
  onSave,
  onCancel,
  onDelete,
}: TastingSessionFormProps) {
  const isNew = !session;
  const { showToast } = useToastContext();
  const { isChristmasMode } = useChristmasMode();

  const [beanName, setBeanName] = useState(session?.beanName || '');
  const [createdAt, setCreatedAt] = useState(
    session?.createdAt ? session.createdAt.split('T')[0] : formatDateString()
  );
  const [roastLevel, setRoastLevel] = useState<
    '浅煎り' | '中煎り' | '中深煎り' | '深煎り'
  >(session?.roastLevel || '中深煎り');

  const handleDelete = () => {
    if (!session || !onDelete) return;
    // 確認ダイアログは親コンポーネントで表示されるため、ここでは削除処理を委譲
      onDelete(session.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!beanName.trim()) {
      showToast('豆の名前を入力してください', 'warning');
      return;
    }

    const now = new Date().toISOString();
    const createdAtDate = createdAt ? new Date(createdAt).toISOString() : now;
    const sessionData: TastingSession = {
      id: session?.id || crypto.randomUUID(),
      beanName: beanName.trim(),
      roastLevel,
      createdAt: createdAtDate,
      updatedAt: now,
      userId: session?.userId || '', // 呼び出し側で設定される想定
    };

    onSave(sessionData);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className={`rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 ${
        isChristmasMode
          ? 'bg-[#0a2f1a] border border-[#d4af37]/30'
          : 'bg-white border border-gray-100'
      }`}>
        {/* 豆の名前（必須） */}
        <div className="space-y-2">
          <label className={`flex items-center gap-2 text-sm font-bold ml-1 ${
            isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'
          }`}>
            <Coffee size={18} weight="bold" className={isChristmasMode ? 'text-[#d4af37]' : 'text-amber-600'} />
            豆の名前 <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={beanName}
            onChange={(e) => setBeanName(e.target.value)}
            required
            placeholder="例: コロンビア・エチオピアなど"
            isChristmasMode={isChristmasMode}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* 焙煎度合い（必須） */}
          <div className="space-y-2">
            <label className={`flex items-center gap-2 text-sm font-bold ml-1 ${
              isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'
            }`}>
              <Thermometer size={18} weight="bold" className={isChristmasMode ? 'text-[#d4af37]' : 'text-amber-600'} />
              焙煎度合い <span className="text-red-500">*</span>
            </label>
            <Select
              value={roastLevel}
              onChange={(e) =>
                setRoastLevel(
                  e.target.value as '浅煎り' | '中煎り' | '中深煎り' | '深煎り'
                )
              }
              options={ROAST_LEVELS.map((level) => ({ value: level, label: level }))}
              required
              isChristmasMode={isChristmasMode}
            />
          </div>

          {/* 試飲日 */}
          <div className="space-y-2">
            <label className={`flex items-center gap-2 text-sm font-bold ml-1 ${
              isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'
            }`}>
              <CalendarBlank size={18} weight="bold" className={isChristmasMode ? 'text-[#d4af37]' : 'text-amber-600'} />
              試飲日 <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              required
              isChristmasMode={isChristmasMode}
            />
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!isNew && onDelete && (
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            className="flex-1 order-3 sm:order-1"
            isChristmasMode={isChristmasMode}
          >
            <Trash size={20} weight="bold" />
            削除
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1 order-2"
          isChristmasMode={isChristmasMode}
        >
          <X size={20} weight="bold" />
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-[1.5] order-1 sm:order-3"
          isChristmasMode={isChristmasMode}
        >
          {isNew ? (
            <>
              <Plus size={20} weight="bold" />
              セッションを作成
            </>
          ) : (
            <>
              <Check size={20} weight="bold" />
              更新する
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
}

