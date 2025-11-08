'use client';

import { useState, useEffect, useMemo } from 'react';
import type { TastingRecord, AppData, TastingSession } from '@/types';
import { TastingRadarChart } from './TastingRadarChart';
import { getSelectedMemberId, setSelectedMemberId } from '@/lib/localStorage';
import {
  getActiveMemberCount,
  getRecordsBySessionId,
} from '@/lib/tastingUtils';

interface TastingRecordFormProps {
  record: TastingRecord | null;
  data: AppData;
  sessionId?: string; // 新規作成時のセッションID（必須）
  session?: TastingSession; // セッション情報（オプショナル）
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
  sessionId,
  session,
  onSave,
  onDelete,
  onCancel,
  readOnly = false,
}: TastingRecordFormProps) {
  const selectedMemberId = getSelectedMemberId();
  
  // セッションIDの決定: 編集時はrecordから、新規作成時はpropsから
  const currentSessionId = record?.sessionId || sessionId || '';
  
  // セッション情報の取得: propsから、またはdataから取得
  const sessionInfo = session || (currentSessionId 
    ? data.tastingSessions.find((s) => s.id === currentSessionId)
    : undefined);
  
  // セッションから記録を作成する場合かどうか（新規作成時、または編集時でもセッション情報がある場合）
  const isSessionMode = !!sessionInfo;
  
  // 記録数制限チェック（新規作成時のみ）
  const activeMemberCount = getActiveMemberCount(data.members);
  const sessionRecords = currentSessionId
    ? getRecordsBySessionId(data.tastingRecords, currentSessionId)
    : [];
  const recordCount = sessionRecords.length;

  // セッション内の自分の記録をチェック
  const ownRecord = useMemo(() => {
    if (!currentSessionId || !selectedMemberId) return null;
    return sessionRecords.find((r) => r.memberId === selectedMemberId);
  }, [currentSessionId, selectedMemberId, sessionRecords]);

  // 既存の記録も自分の記録もない場合のみ「作成」
  const isNew = !record && !ownRecord;
  const isLimitReached = isNew && recordCount >= activeMemberCount;

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

  // セッション情報から自動設定（新規作成時のみ）
  useEffect(() => {
    if (!record && sessionInfo) {
      setBeanName(sessionInfo.beanName);
      setRoastLevel(sessionInfo.roastLevel);
      // 試飲日はセッションの作成日を使用
      setTastingDate(sessionInfo.createdAt.split('T')[0]);
    }
  }, [record, session?.id, currentSessionId]);

  // 重複チェック（セッション内で同じメンバーの記録があるか）
  useEffect(() => {
    // 編集時は重複チェックしない
    if (record !== null || !currentSessionId) return;

    const duplicate = sessionRecords.find((r) => r.memberId === memberId);

      if (duplicate) {
        setDuplicateWarning(
        `このセッションには既にあなたの記録が存在します（${duplicate.tastingDate}）。上書きしますか？`
        );
    } else {
      setDuplicateWarning(null);
    }
  }, [memberId, sessionRecords, isNew, record, currentSessionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSessionMode && !beanName.trim()) {
      alert('豆の名前を入力してください');
      return;
    }

    if (!memberId) {
      alert('メンバーを選択してください。設定画面で「このデバイスは誰のもの」を設定してください。');
      return;
    }

    if (isNew && !currentSessionId) {
      alert('セッションIDが設定されていません');
      return;
    }

    if (isNew && isLimitReached) {
      alert(`記録数の上限（${activeMemberCount}件）に達しています`);
      return;
    }

    // セッションモードの場合はセッション情報から値を取得
    const finalBeanName = isSessionMode && sessionInfo ? sessionInfo.beanName : beanName.trim();
    const finalRoastLevel = isSessionMode && sessionInfo ? sessionInfo.roastLevel : roastLevel;
    const finalTastingDate = isSessionMode && sessionInfo 
      ? sessionInfo.createdAt.split('T')[0] 
      : tastingDate;

    const now = new Date().toISOString();
    const newRecord: TastingRecord = {
      id: record?.id || `tasting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
        <span className="text-sm font-semibold text-amber-600">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={MIN_VALUE}
        max={MAX_VALUE}
        step={STEP}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
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
      {/* 豆の名前（セッションモードでは非表示） */}
      {!isSessionMode && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          豆の名前 <span className="text-red-500">*</span>
        </label>
          <input
          type="text"
          value={beanName}
          onChange={(e) => setBeanName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
          placeholder="例: エチオピア"
          required
          disabled={readOnly}
        />
      </div>
      )}

      {/* 試飲日（セッションモードでは非表示） */}
      {!isSessionMode && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          試飲日 <span className="text-red-500">*</span>
        </label>
          <input
          type="date"
          value={tastingDate}
          onChange={(e) => setTastingDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
          required
          disabled={readOnly}
        />
      </div>
      )}

      {/* 焙煎度合い（セッションモードでは非表示） */}
      {!isSessionMode && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          焙煎度合い <span className="text-red-500">*</span>
        </label>
          <select
          value={roastLevel}
          onChange={(e) =>
            setRoastLevel(e.target.value as '浅煎り' | '中煎り' | '中深煎り' | '深煎り')
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
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
      )}

      {/* メンバー選択（新規作成時のみ、編集時は表示しない） */}
      {isNew && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            このデバイスは誰のもの <span className="text-red-500">*</span>
          </label>
          <select
            value={memberId}
            onChange={(e) => {
              const newMemberId = e.target.value;
              setMemberId(newMemberId);
              // メンバー選択時に自動保存
              if (newMemberId) {
                setSelectedMemberId(newMemberId);
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
            required
            disabled={readOnly}
          >
            <option value="" className="text-gray-900">選択してください</option>
            {data.members
              .filter((m) => m.active !== false)
              .map((member) => (
                <option key={member.id} value={member.id} className="text-gray-900">
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
        <>
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
        </>
      )}

      {/* 記録数制限警告（新規作成時のみ） */}
      {isNew && isLimitReached && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            記録数の上限（{activeMemberCount}件）に達しています。これ以上追加できません。
          </p>
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
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
          {ownRecord && onDelete && (
            <button
              type="button"
              onClick={() => {
                const confirmDelete = window.confirm('この記録を削除しますか？');
                if (confirmDelete) {
                  onDelete(ownRecord.id);
                }
              }}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              自分の記録を削除
            </button>
          )}
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            {isNew ? '作成' : '上書き'}
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

