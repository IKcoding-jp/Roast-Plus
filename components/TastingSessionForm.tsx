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
  Check,
  Warning,
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { y: 14, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, damping: 22, stiffness: 350 },
  },
};

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
      userId: session?.userId || '',
    };

    onSave(sessionData);
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* メインカード */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl bg-surface border border-edge shadow-sm overflow-hidden"
      >
        {/* セクションヘッダー */}
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-edge flex items-center gap-2">
          <Coffee size={16} weight="fill" className="text-spot" />
          <span className="text-sm font-semibold text-ink">セッション詳細</span>
        </div>

        {/* フィールド群 */}
        <div className="px-5 sm:px-6 pt-4 pb-5 sm:pb-6 space-y-5">
          {/* 豆の名前 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold ml-1 text-ink-sub">
              <Coffee size={18} weight="bold" className="text-spot" />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* 焙煎度合い */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold ml-1 text-ink-sub">
                <Thermometer size={18} weight="bold" className="text-spot" />
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
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold ml-1 text-ink-sub">
                <CalendarBlank size={18} weight="bold" className="text-spot" />
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
      </motion.div>

      {/* ボタン行 */}
      <motion.div variants={itemVariants} className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          <X size={20} weight="bold" />
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-[1.5]"
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
      </motion.div>

      {/* Danger Zone（編集時のみ） */}
      {!isNew && onDelete && (
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-edge bg-danger-subtle p-4"
        >
          <div className="flex items-center gap-1.5 mb-3">
            <Warning size={13} weight="fill" className="text-danger" />
            <span className="text-xs font-bold text-danger tracking-wider">
              危険な操作
            </span>
          </div>
          <motion.div
            whileHover={{ x: [0, -3, 3, -2, 2, 0] }}
            transition={{ duration: 0.4 }}
          >
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              className="w-full"
            >
              <Trash size={16} weight="bold" />
              この試飲セッションを削除する
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.form>
  );
}
