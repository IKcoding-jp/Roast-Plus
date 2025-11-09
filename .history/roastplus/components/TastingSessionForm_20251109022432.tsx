'use client';

import { useState } from 'react';
import type { TastingSession } from '@/types';

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

  const [beanName, setBeanName] = useState(session?.beanName || '');
  const [createdAt, setCreatedAt] = useState(
    session?.createdAt ? session.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [roastLevel, setRoastLevel] = useState<
    '浅煎り' | '中煎り' | '中深煎り' | '深煎り'
  >(session?.roastLevel || '中深煎り');

  const handleDelete = () => {
    if (!session || !onDelete) return;
    const confirmDelete = window.confirm('このセッションを削除しますか？この操作は取り消せません。');
    if (confirmDelete) {
      onDelete(session.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!beanName.trim()) {
      alert('豆の名前を入力してください');
      return;
    }

    const now = new Date().toISOString();
    const createdAtDate = createdAt ? new Date(createdAt).toISOString() : now;
    const sessionData: TastingSession = {
      id: session?.id || crypto.randomUUID(),
      name: name.trim() || undefined,
      beanName: beanName.trim(),
      roastLevel,
      memo: undefined,
      createdAt: createdAtDate,
      updatedAt: now,
      userId: session?.userId || '', // 呼び出し側で設定される想定
    };

    onSave(sessionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* セッション名（任意） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          セッション名
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
          placeholder="例: 2025年11月の試飲会"
        />
        <p className="mt-1 text-xs text-gray-500">
          任意項目です。空欄の場合は豆名と焙煎度合いで表示されます。
        </p>
      </div>

      {/* 豆の名前（必須） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          豆の名前 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={beanName}
          onChange={(e) => setBeanName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
          required
          placeholder="例: コロンビア　ブラジル"
        />
      </div>

      {/* 焙煎度合い（必須） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          焙煎度合い <span className="text-red-500">*</span>
        </label>
        <select
          value={roastLevel}
          onChange={(e) =>
            setRoastLevel(
              e.target.value as '浅煎り' | '中煎り' | '中深煎り' | '深煎り'
            )
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
          required
        >
          {ROAST_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* 作成日 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          作成日 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
          required
        />
      </div>

      {/* ボタン */}
      <div className="flex gap-4">
        {!isNew && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            削除
          </button>
        )}
        {isNew && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
        >
          {isNew ? 'セッションを作成' : '更新'}
        </button>
      </div>
    </form>
  );
}

