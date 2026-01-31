'use client';

import { useState } from 'react';
import type { TastingRecord, AppData, TastingSession } from '@/types';
import { TastingRadarChart } from './TastingRadarChart';
import {
  getRecordsBySessionId,
} from '@/lib/tastingUtils';
import { useToastContext } from '@/components/Toast';
import { useMembers, getActiveMembers } from '@/hooks/useMembers';
import { useAuth } from '@/lib/auth';
import {
  Coffee,
  Drop,
  Wind,
  Cookie,
  Sun,
  User,
  Calendar,
  Thermometer,
  Smiley,
  ChatCircleText
} from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Select, Textarea, Button } from '@/components/ui';
import { ROAST_LEVELS } from '@/lib/constants';
import { formatDateString } from '@/lib/dateUtils';

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

const MIN_VALUE = 1.0;
const MAX_VALUE = 5.0;
const STEP = 0.125;

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  readOnly?: boolean;
  icon: React.ReactNode;
  colorClass: string;
  accentColor: string;
}

const SliderInput = ({
  label,
  value,
  onChange,
  description,
  readOnly = false,
  icon,
  colorClass,
  accentColor,
}: SliderInputProps) => (
  <div className={`p-5 rounded-2xl border transition-all duration-200 ${readOnly ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200 hover:border-amber-200 hover:shadow-md'}`}>
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          {icon}
        </div>
        <div>
          <label className="text-lg font-bold text-gray-800 block leading-tight">{label}</label>
          {description && (
            <span className="text-xs text-gray-500 font-medium">{description}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className={`text-3xl font-black ${accentColor} tabular-nums leading-none tracking-tight`}>
          {value.toFixed(1)}
        </span>
      </div>
    </div>

    <div className="px-1 relative">
      <input
        type="range"
        min={MIN_VALUE}
        max={MAX_VALUE}
        step={STEP}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer transition-all
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
          [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:shadow-lg
          ${accentColor.replace('text-', 'border-')}
          hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-95
          disabled:cursor-not-allowed`}
        style={{
          background: `linear-gradient(to right, currentColor 0%, currentColor ${(value - 1) / 4 * 100}%, #F3F4F6 ${(value - 1) / 4 * 100}%, #F3F4F6 100%)`,
          color: accentColor.includes('amber') ? '#D97706' :
            accentColor.includes('orange') ? '#EA580C' :
              accentColor.includes('stone') ? '#44403C' :
                accentColor.includes('rose') ? '#E11D48' :
                  accentColor.includes('emerald') ? '#059669' : '#D97706'
        }}
        disabled={readOnly}
      />
      <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-widest px-1">
        <span>Min</span>
        <div className="flex gap-2 items-center">
          {[1, 2, 3, 4, 5].map((v) => (
            <div key={v} className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${value >= v ? 'bg-amber-500' : 'bg-gray-200'}`} />
          ))}
        </div>
        <span>Max</span>
      </div>
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
  const { user } = useAuth();
  const userId = user?.uid ?? null;

  // 担当表の /users/{userId}/members コレクションからメンバーと管理者を取得
  const { members: allMembers, manager } = useMembers(userId);

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

  const [beanName, setBeanName] = useState(
    record?.beanName || sessionInfo?.beanName || ''
  );
  const [tastingDate, setTastingDate] = useState(
    record?.tastingDate ||
    (sessionInfo ? sessionInfo.createdAt.split('T')[0] : formatDateString())
  );
  const [roastLevel, setRoastLevel] = useState<
    '浅煎り' | '中煎り' | '中深煎り' | '深煎り'
  >(record?.roastLevel || sessionInfo?.roastLevel || '中深煎り');
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
      <div className="space-y-6">
        <div className="flex flex-col gap-2 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-amber-500 rounded-full" />
              <h3 className="text-lg font-bold text-gray-800">評価項目</h3>
            </div>
            <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">
              1.0 - 5.0 Scale
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            ※ これらの項目は、味わいのバランスや特徴の数値であり、味の良し悪しを評価するものではありません。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <SliderInput
            label="苦味"
            value={bitterness}
            onChange={setBitterness}
            description="コーヒーの苦みの強さ"
            readOnly={readOnly}
            icon={<Coffee size={24} weight="fill" className="text-stone-700" />}
            colorClass="bg-stone-100"
            accentColor="text-stone-800"
          />
          <SliderInput
            label="酸味"
            value={acidity}
            onChange={setAcidity}
            description="コーヒーの酸っぱさや爽やかさ"
            readOnly={readOnly}
            icon={<Sun size={24} weight="fill" className="text-orange-600" />}
            colorClass="bg-orange-50"
            accentColor="text-orange-600"
          />
          <SliderInput
            label="ボディ"
            value={body}
            onChange={setBody}
            description="コーヒーの口当たりや重厚感"
            readOnly={readOnly}
            icon={<Drop size={24} weight="fill" className="text-amber-800" />}
            colorClass="bg-amber-50"
            accentColor="text-amber-800"
          />
          <SliderInput
            label="甘み"
            value={sweetness}
            onChange={setSweetness}
            description="コーヒーに感じられる甘さ"
            readOnly={readOnly}
            icon={<Cookie size={24} weight="fill" className="text-rose-600" />}
            colorClass="bg-rose-50"
            accentColor="text-rose-600"
          />
          <SliderInput
            label="香り"
            value={aroma}
            onChange={setAroma}
            description="コーヒーの香りの強さや豊かさ"
            readOnly={readOnly}
            icon={<Wind size={24} weight="fill" className="text-emerald-600" />}
            colorClass="bg-emerald-50"
            accentColor="text-emerald-600"
          />
        </div>
      </div>

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
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                className="flex-1"
              >
                削除
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-[2]"
            >
              <Smiley size={24} weight="bold" />
              {existingRecordId || record ? '記録を更新する' : '記録を保存する'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {readOnly && (
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            fullWidth
            size="lg"
          >
            戻る
          </Button>
        </div>
      )}
    </motion.form>
  );
}


