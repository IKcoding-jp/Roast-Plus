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
      className="space-y-8"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-10">
        {/* 豆の名前（必須） */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-base font-black text-stone-500 uppercase tracking-widest ml-1">
            <Coffee size={20} weight="bold" className="text-amber-600" />
            豆の名前 <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={beanName}
            onChange={(e) => setBeanName(e.target.value)}
            required
            placeholder="例: コロンビア・エチオピアなど"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* 焙煎度合い（必須） */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-base font-black text-stone-500 uppercase tracking-widest ml-1">
              <Thermometer size={20} weight="bold" className="text-amber-600" />
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
            />
          </div>

          {/* 試飲日 */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-base font-black text-stone-500 uppercase tracking-widest ml-1">
              <CalendarBlank size={20} weight="bold" className="text-amber-600" />
              試飲日 <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex flex-col sm:flex-row gap-4">
        {!isNew && onDelete && (
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            size="lg"
            className="flex-1 order-3 sm:order-1"
          >
            <Trash size={24} weight="bold" />
            削除
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          size="lg"
          className="flex-1 order-2"
        >
          <X size={24} weight="bold" />
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="flex-[1.5] order-1 sm:order-3"
        >
          {isNew ? (
            <>
              <Plus size={24} weight="bold" />
              セッションを作成
            </>
          ) : (
            <>
              <Check size={24} weight="bold" />
              更新する
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
}

