'use client';

import { useState } from 'react';
import type { TastingSession } from '@/types';
import { useToastContext } from '@/components/Toast';
import { motion } from 'framer-motion';
import { 
  Coffee,
  CaretLeft, 
  CalendarBlank, 
  Thermometer, 
  Trash, 
  X, 
  Plus, 
  Check,
  CaretDown
} from 'phosphor-react';

interface TastingSessionFormProps {
  session: TastingSession | null;
  onSave: (session: TastingSession) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

const ROAST_LEVELS: Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'> = [
  '浅煎り',
  '中煎り',
  '中深煎り',
  '深煎り',
];

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
    session?.createdAt ? session.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
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
          <input
            type="text"
            value={beanName}
            onChange={(e) => setBeanName(e.target.value)}
            className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all text-stone-800 font-bold placeholder:text-stone-300 shadow-inner text-lg"
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
            <div className="relative">
              <select
                value={roastLevel}
                onChange={(e) =>
                  setRoastLevel(
                    e.target.value as '浅煎り' | '中煎り' | '中深煎り' | '深煎り'
                  )
                }
                className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all text-stone-800 font-bold appearance-none shadow-inner text-lg"
                required
              >
                {ROAST_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <CaretDown size={20} weight="bold" />
              </div>
            </div>
          </div>

          {/* 試飲日 */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-base font-black text-stone-500 uppercase tracking-widest ml-1">
              <CalendarBlank size={20} weight="bold" className="text-amber-600" />
              試飲日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all text-stone-800 font-bold shadow-inner text-lg"
              required
            />
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex flex-col sm:flex-row gap-4">
        {!isNew && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 px-6 py-5 bg-white border-2 border-red-100 text-red-500 rounded-2xl font-black text-lg shadow-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2 order-3 sm:order-1 whitespace-nowrap"
          >
            <Trash size={24} weight="bold" />
            削除
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-5 bg-white border-2 border-stone-100 text-stone-400 rounded-2xl font-black text-lg shadow-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-2 order-2 whitespace-nowrap"
        >
          <X size={24} weight="bold" />
          キャンセル
        </button>
        <button
          type="submit"
          className="flex-[1.5] px-8 py-5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-200/50 hover:from-amber-700 hover:to-amber-600 transition-all active:scale-95 flex items-center justify-center gap-2 order-1 sm:order-3 whitespace-nowrap"
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
        </button>
      </div>
    </motion.form>
  );
}

