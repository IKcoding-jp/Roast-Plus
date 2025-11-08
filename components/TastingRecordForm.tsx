'use client';

import { useState, useEffect } from 'react';
import type { TastingRecord, AppData } from '@/types';
import { TastingRadarChart } from './TastingRadarChart';
import { getSelectedMemberId } from '@/lib/localStorage';

interface TastingRecordFormProps {
  record: TastingRecord | null;
  data: AppData;
  onSave: (record: TastingRecord) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
  readOnly?: boolean; // 読み取り専用モード
}

const ROAST_LEVELS: Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'> = [
  '浅煎り',
  '中煎り',
  '中深煎り',
  '深煎り',
];

const MIN_VALUE = 1.0;
const MAX_VALUE = 5.0;
const STEP = 0.125;

export function TastingRecordForm({
  record,
  data,
  onSave,
  onDelete,
  onCancel,
  readOnly = false,
}: TastingRecordFormProps) {
  const isNew = !record;
  const selectedMemberId = getSelectedMemberId();

  const [beanName, setBeanName] = useState(record?.beanName || '');
  const [tastingDate, setTastingDate] = useState(
    record?.tastingDate || new Date().toISOString().split('T')[0]
  );
  const [roastLevel, setRoastLevel] = useState<
    '浅煎り' | '中煎り' | '中深煎り' | '深煎り'
  >(record?.roastLevel || '中深煎り');
  const [bitterness, setBitterness] = useState(record?.bitterness || 3.0);
  const [acidity, setAcidity] = useState(record?.acidity || 3.0);
  const [body, setBody] = useState(record?.body || 3.0);
  const [sweetness, setSweetness] = useState(record?.sweetness || 3.0);
  const [aroma, setAroma] = useState(record?.aroma || 3.0);
  const [overallRating, setOverallRating] = useState(record?.overallRating || 3.0);
  const [overallImpression, setOverallImpression] = useState(
    record?.overallImpression || ''
  );
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // 新規作成時はローカルストレージからmemberIdを取得
  const [memberId, setMemberId] = useState(
    record?.memberId || selectedMemberId || ''
  );

  // 編集時にrecordが変更されたらmemberIdを更新
  useEffect(() => {
    if (record?.memberId) {
      setMemberId(record.memberId);
    }
  }, [record]);

  // 重複チェック
  useEffect(() => {
    if (!isNew && record) return; // 編集時は重複チェックしない

    const tastingRecords = Array.isArray(data.tastingRecords) ? data.tastingRecords : [];

    if (beanName && roastLevel && memberId) {
      const duplicate = tastingRecords.find(
        (r) =>
          r.beanName === beanName &&
          r.roastLevel === roastLevel &&
          r.memberId === memberId &&
          r.id !== record?.id
      );

      if (duplicate) {
        setDuplicateWarning(
          `同じ豆名・焙煎度合いの記録が既に存在します（${duplicate.tastingDate}）。上書きしますか？`
        );
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [beanName, roastLevel, memberId, data.tastingRecords, isNew, record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!beanName.trim()) {
      alert('豆の名前を入力してください');
      return;
    }

    if (!memberId) {
      alert('メンバーを選択してください。設定画面で「このデバイスは誰のもの」を設定してください。');
      return;
    }

    const now = new Date().toISOString();
    const newRecord: TastingRecord = {
      id: record?.id || `tasting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      beanName: beanName.trim(),
      tastingDate,
      roastLevel,
      bitterness,
      acidity,
      body,
      sweetness,
      aroma,
      overallRating,
      overallImpression: overallImpression.trim() || undefined,
      createdAt: record?.createdAt || now,
      updatedAt: now,
      userId: record?.userId || '', // これは親コンポーネントで設定される
      memberId,
    };

    // 重複がある場合は確認
    if (duplicateWarning) {
      const confirmOverwrite = window.confirm(duplicateWarning);
      if (!confirmOverwrite) {
        return;
      }
    }

    onSave(newRecord);
  };

  const handleDelete = () => {
    if (!record || !onDelete) return;

    const confirmDelete = window.confirm('この記録を削除しますか？');
    if (confirmDelete) {
      onDelete(record.id);
    }
  };

  const formatValue = (value: number) => value.toFixed(3);

  const SliderInput = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-[#8B4513]">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={MIN_VALUE}
        max={MAX_VALUE}
        step={STEP}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8B4513]"
        disabled={readOnly}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>1.0</span>
        <span>5.0</span>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 豆の名前 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          豆の名前 <span className="text-red-500">*</span>
        </label>
          <input
          type="text"
          value={beanName}
          onChange={(e) => setBeanName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] text-gray-900"
          placeholder="例: エチオピア"
          required
          disabled={readOnly}
        />
      </div>

      {/* 試飲日 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          試飲日 <span className="text-red-500">*</span>
        </label>
          <input
          type="date"
          value={tastingDate}
          onChange={(e) => setTastingDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] text-gray-900"
          required
          disabled={readOnly}
        />
      </div>

      {/* 焙煎度合い */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          焙煎度合い <span className="text-red-500">*</span>
        </label>
          <select
          value={roastLevel}
          onChange={(e) =>
            setRoastLevel(e.target.value as '浅煎り' | '中煎り' | '中深煎り' | '深煎り')
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] text-gray-900"
          required
          disabled={readOnly}
        >
          {ROAST_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* メンバー選択（新規作成時のみ、編集時は表示しない） */}
      {isNew && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            このデバイスは誰のもの <span className="text-red-500">*</span>
          </label>
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] text-gray-900"
            required
            disabled={readOnly}
          >
            <option value="">選択してください</option>
            {data.members
              .filter((m) => m.active !== false)
              .map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
          </select>
          {!selectedMemberId && (
            <p className="mt-1 text-xs text-gray-500">
              設定画面で「このデバイスは誰のもの」を設定すると、次回から自動で選択されます。
            </p>
          )}
        </div>
      )}
      {!isNew && record && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メンバー
          </label>
          <input
            type="text"
            value={data.members.find((m) => m.id === record.memberId)?.name || '不明'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            disabled
          />
        </div>
      )}

      {/* 重複警告 */}
      {duplicateWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">{duplicateWarning}</p>
        </div>
      )}

      {/* 評価項目 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">評価項目</h3>
        <SliderInput label="苦味" value={bitterness} onChange={setBitterness} />
        <SliderInput label="酸味" value={acidity} onChange={setAcidity} />
        <SliderInput label="ボディ" value={body} onChange={setBody} />
        <SliderInput label="甘み" value={sweetness} onChange={setSweetness} />
        <SliderInput label="香り" value={aroma} onChange={setAroma} />
        <SliderInput label="総合" value={overallRating} onChange={setOverallRating} />
      </div>

      {/* レーダーチャートプレビュー */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">プレビュー</h3>
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

      {/* コメント */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          全体的な印象
        </label>
          <textarea
          value={overallImpression}
          onChange={(e) => setOverallImpression(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] text-gray-900"
          placeholder="コーヒーの全体的な印象を記録してください"
          disabled={readOnly}
        />
      </div>

      {/* ボタン */}
      {!readOnly && (
        <div className="flex gap-4">
          {onDelete && record && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              削除
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-[#8B4513] text-white rounded-lg hover:bg-[#6B3410] transition-colors font-medium"
          >
            {isNew ? '作成' : '更新'}
          </button>
        </div>
      )}
      {readOnly && (
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            戻る
          </button>
        </div>
      )}
    </form>
  );
}

