'use client';

import { useState, useEffect, useRef } from 'react';
import type { TastingRecord, AppData, TastingSession } from '@/types';
import { TastingRadarChart } from './TastingRadarChart';
import {
  getRecordsBySessionId,
} from '@/lib/tastingUtils';
import { useToastContext } from '@/components/Toast';
import { useMembers, getActiveMembers } from '@/hooks/useMembers';

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

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  readOnly?: boolean;
}

const SliderInput = ({
  label,
  value,
  onChange,
  description,
  readOnly = false,
}: SliderInputProps) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <span className="text-xs text-gray-500">{description}</span>
        )}
      </div>
      <span className="text-sm font-semibold text-amber-600">{value.toFixed(1)}</span>
    </div>
    <input
      type="range"
      min={MIN_VALUE}
      max={MAX_VALUE}
      step={STEP}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
      disabled={readOnly}
    />
    <div className="flex justify-between text-xs text-gray-500 mt-1">
      <span>1.0</span>
      <span>5.0</span>
    </div>
  </div>
);

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
  
  // 担当表の /members コレクションからメンバーと管理者を取得
  const { members: allMembers, manager } = useMembers();
  
  // セッションIDの決定: 編集時はrecordから、新規作成時はpropsから
  const currentSessionId = record?.sessionId || sessionId || '';
  
  // セッション情報の取得: propsから、またはdataから取得
  const sessionInfo = session || (currentSessionId 
    ? data.tastingSessions.find((s) => s.id === currentSessionId)
    : undefined);
  
  // セッションから記録を作成する場合かどうか（新規作成時、または編集時でもセッション情報がある場合）
  const isSessionMode = !!sessionInfo;
  
  // 既存の記録がない場合のみ「作成」
  const isNew = !record;
  
  // セッション内の記録を取得（重複チェック用）
  const sessionRecords = currentSessionId
    ? getRecordsBySessionId(data.tastingRecords, currentSessionId)
    : [];

  // 全メンバーを取得（アクティブなメンバーのみ）+ 管理者
  const selectableMembers = [
    ...getActiveMembers(allMembers),
    ...(manager ? [{ id: manager.id, name: manager.name, teamId: '', excludedTaskLabelIds: [] }] : [])
  ];

  // メンバー選択用のstate（新規作成時は空、編集時は既存のmemberIdを初期値）
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    record?.memberId || ''
  );

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
  // 既存記録のIDを保持（上書き時に使用）
  const [existingRecordId, setExistingRecordId] = useState<string | null>(null);
  // 前回のメンバーIDを保持（無限ループ防止）
  const prevMemberIdRef = useRef<string>('');

  // セッション情報から自動設定（新規作成時のみ）
  useEffect(() => {
    if (!record && sessionInfo) {
      setBeanName(sessionInfo.beanName);
      setRoastLevel(sessionInfo.roastLevel);
      // 試飲日はセッションの作成日を使用
      setTastingDate(sessionInfo.createdAt.split('T')[0]);
    }
  }, [record, session?.id, currentSessionId]);

  // 編集時にrecordが変更された場合、selectedMemberIdを更新
  useEffect(() => {
    if (record?.memberId) {
      setSelectedMemberId(record.memberId);
    }
  }, [record?.id]);

  // 重複チェック（セッション内で同じメンバーの記録があるか）
  useEffect(() => {
    // 編集時は重複チェックしない
    if (record !== null || !currentSessionId || !selectedMemberId) {
      if (prevMemberIdRef.current !== selectedMemberId) {
        setExistingRecordId(null);
        prevMemberIdRef.current = selectedMemberId;
      }
      return;
    }

    // メンバーIDが変更されていない場合はスキップ（無限ループ防止）
    if (prevMemberIdRef.current === selectedMemberId) {
      return;
    }

    prevMemberIdRef.current = selectedMemberId;

    const existingRecord = sessionRecords.find((r) => r.memberId === selectedMemberId);

    if (existingRecord) {
      // 既存記録のIDを保持
      setExistingRecordId(existingRecord.id);
      // 既存記録のデータをフォームに反映
      setBitterness(existingRecord.bitterness);
      setAcidity(existingRecord.acidity);
      setBody(existingRecord.body);
      setSweetness(existingRecord.sweetness);
      setAroma(existingRecord.aroma);
      setOverallRating(existingRecord.overallRating);
      setOverallImpression(existingRecord.overallImpression || '');
    } else {
      setExistingRecordId(null);
      // 既存記録がない場合、デフォルト値にリセット
      if (!record) {
        setBitterness(3.0);
        setAcidity(3.0);
        setBody(3.0);
        setSweetness(3.0);
        setAroma(3.0);
        setOverallRating(3.0);
        setOverallImpression('');
      }
    }
  }, [selectedMemberId, currentSessionId, record, sessionRecords]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSessionMode && !beanName.trim()) {
      showToast('豆の名前を入力してください', 'warning');
      return;
    }

    // メンバーIDの検証
    if (!selectedMemberId) {
      showToast('メンバーを選択してください', 'warning');
      return;
    }

    if (isNew && !currentSessionId) {
      showToast('セッションIDが設定されていません', 'error');
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
      id: record?.id || existingRecordId || `tasting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      createdAt: record?.createdAt || (existingRecordId ? (sessionRecords.find((r) => r.id === existingRecordId)?.createdAt || now) : now),
      updatedAt: now,
      userId: record?.userId || '', // これは親コンポーネントで設定される
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

  const formatValue = (value: number) => value.toFixed(3);

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

      {/* メンバー選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          メンバー <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-gray-900"
          required
          disabled={readOnly}
        >
          <option value="" className="text-gray-900">
            選択してください
          </option>
          {selectableMembers.map((member) => (
            <option key={member.id} value={member.id} className="text-gray-900">
              {member.name}
            </option>
          ))}
        </select>
      </div>

      {/* 評価項目 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">評価項目</h3>
        <SliderInput 
          label="苦味" 
          value={bitterness} 
          onChange={setBitterness}
          description="コーヒーの苦みの強さ"
          readOnly={readOnly}
        />
        <SliderInput 
          label="酸味" 
          value={acidity} 
          onChange={setAcidity}
          description="コーヒーの酸っぱさや爽やかさ"
          readOnly={readOnly}
        />
        <SliderInput 
          label="ボディ" 
          value={body} 
          onChange={setBody}
          description="コーヒーの口当たりや重厚感"
          readOnly={readOnly}
        />
        <SliderInput 
          label="甘み" 
          value={sweetness} 
          onChange={setSweetness}
          description="コーヒーに感じられる甘さ"
          readOnly={readOnly}
        />
        <SliderInput 
          label="香り" 
          value={aroma} 
          onChange={setAroma}
          description="コーヒーの香りの強さや豊かさ"
          readOnly={readOnly}
        />
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
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            {existingRecordId || record ? '上書き' : '作成'}
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

