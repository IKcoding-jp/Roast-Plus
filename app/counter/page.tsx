/**
 * カウンター機能ページ
 * 
 * 機能概要:
 * 1. カウンター: 数値を増減させる基本機能
 * 2. 記録保存: 現在のカウント値を名前付きでリストに保存
 * 3. 記録一覧: 保存された記録を表示、チェックボックスで選択可能
 * 4. 集計機能: 選択された記録の合計値を計算・表示
 * 5. 差分機能: 2つの記録が選択された場合、その差分を計算・表示
 * 
 * コンポーネント構成:
 * - CounterPage (Main): 状態管理と全体のレイアウト
 * - CounterDisplay: カウント値の表示
 * - CounterControls: 操作ボタン群 (+/-)
 * - RecordForm: 記録の保存フォーム
 * - RecordList: 記録リストの表示
 * - StatsPanel: 合計・差分の表示と保存アクション (画面下部固定)
 */
'use client';

import { useAuth } from '@/lib/auth';
import { HiArrowLeft } from 'react-icons/hi';
import { MdAddCircle } from 'react-icons/md';
import { Loading } from '@/components/Loading';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import LoginPage from '@/app/login/page';
import Link from 'next/link';
import { useState } from 'react';
import { CounterDisplay } from './components/CounterDisplay';
import { CounterControls } from './components/CounterControls';
import { RecordForm } from './components/RecordForm';
import { RecordList } from './components/RecordList';
import { StatsPanel } from './components/StatsPanel';
import { RecordItem } from './types';

export default function CounterPage() {
  const { user, loading: authLoading } = useAuth();
  useAppLifecycle();

  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [activeTab, setActiveTab] = useState<'counter' | 'records'>('counter');

  if (authLoading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginPage />;
  }

  const updateCount = (delta: number) => {
    const newCount = Math.max(0, count + delta);
    if (newCount !== count) {
      setHistory((prev) => [...prev, count]);
      setCount(newCount);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousValue = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCount(previousValue);
    }
  };

  const handleReset = () => {
    if (count !== 0) {
      setHistory((prev) => [...prev, count]);
      setCount(0);
    }
  };

  const handleSaveRecord = (name: string) => {
    const now = new Date();
    // Format: 記録-2025-11-22-1030
    const defaultName = `記録-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

    const recordName = name.trim() || defaultName;

    const newRecord: RecordItem = {
      id: crypto.randomUUID(),
      name: recordName,
      value: count,
      createdAt: now.toISOString(),
      checked: false,
      type: 'manual',
    };

    setRecords((prev) => [newRecord, ...prev]);
    setCount(0);
    setHistory([]);
  };

  const handleToggleCheck = (id: string) => {
    setRecords((prev) => prev.map(r =>
      r.id === id ? { ...r, checked: !r.checked } : r
    ));
  };

  const handleClearRecords = () => {
    if (window.confirm('すべての記録を削除しますか？')) {
      setRecords([]);
    }
  };

  const handleSaveResult = (value: number, type: 'sum' | 'diff') => {
    const now = new Date();
    const namePrefix = type === 'sum' ? '合計' : '差分';

    // 選択された記録を取得してソースとして保存
    const selectedRecords = records.filter(r => r.checked);
    const sources = selectedRecords.map(r => ({ name: r.name, value: r.value }));

    const newRecord: RecordItem = {
      id: crypto.randomUUID(),
      name: namePrefix, // 時間のサフィックスを削除
      value: value,
      createdAt: now.toISOString(),
      checked: false,
      type: type,
      sources: sources,
    };

    setRecords((prev) => [newRecord, ...prev]);
  };

  return (
    <div className="h-screen flex flex-col bg-[#F7F7F5] overflow-hidden">
      <header className="flex-none px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between relative bg-white/50 backdrop-blur-sm border-b border-gray-200/50 z-10">
        <Link
          href="/"
          className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          title="戻る"
          aria-label="戻る"
        >
          <HiArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-lg font-bold text-gray-800">
          <MdAddCircle className="h-6 w-6 text-primary" />
          カウンター
        </h1>
      </header>

      <main className="flex-1 min-h-0 container mx-auto p-4 lg:p-6 flex flex-col justify-center overflow-hidden">
        {/* Mobile Tabs (< lg) */}
        <div className="lg:hidden mb-4 bg-gray-200/50 p-1 rounded-xl flex flex-none">
          <button
            onClick={() => setActiveTab('counter')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'counter'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            カウンター
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'records'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            記録一覧
            {records.length > 0 && (
              <span className="ml-2 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full">
                {records.length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Content (< lg) */}
        <div className="lg:hidden flex-1 min-h-0 relative">
          {/* Mobile Counter View */}
          <div className={`absolute inset-0 flex flex-col overflow-hidden ${activeTab === 'counter' ? 'block' : 'hidden'}`}>
            <div className="h-full bg-white rounded-3xl shadow-sm border border-gray-100 p-[3dvh] pb-[5dvh] flex flex-col justify-between overflow-y-auto">
              <div className="flex-1 flex flex-col justify-center min-h-0">
                <CounterDisplay count={count} />
              </div>

              <div className="flex-none">
                <CounterControls
                  onUpdate={updateCount}
                  onUndo={handleUndo}
                  onReset={handleReset}
                  canUndo={history.length > 0}
                  canReset={count > 0}
                />
              </div>

              <div className="flex-none mt-[2dvh]">
                <RecordForm onSave={handleSaveRecord} disabled={count === 0} />
              </div>
            </div>
          </div>

          {/* Mobile Records View */}
          <div className={`absolute inset-0 flex flex-col bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden ${activeTab === 'records' ? 'block' : 'hidden'}`}>
            <div className="flex-none p-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-700 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-[#EF8A00] rounded-full"></span>
                  記録一覧
                </h2>
                {records.length > 0 && (
                  <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                    {records.length}
                  </span>
                )}
              </div>
              {records.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearRecords}
                  className="text-xs text-red-500 hover:text-red-600 font-bold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  クリア
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-2 bg-gray-50/30">
              <RecordList records={records} onToggleCheck={handleToggleCheck} />
            </div>
            <div className="flex-none">
              <StatsPanel records={records} onSaveResult={handleSaveResult} />
            </div>
          </div>
        </div>

        {/* Desktop/Tablet Unified Card (>= lg) */}
        <div className="hidden lg:flex w-full max-w-5xl mx-auto flex-1 min-h-0 bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">

          {/* Left Side: Operations */}
          <div className="flex-1 flex flex-col p-6 xl:p-8 overflow-y-auto scrollbar-hide justify-center min-h-0">
            <div className="max-w-sm mx-auto w-full space-y-4">
              <CounterDisplay count={count} />
              <CounterControls
                onUpdate={updateCount}
                onUndo={handleUndo}
                onReset={handleReset}
                canUndo={history.length > 0}
                canReset={count > 0}
              />
              <RecordForm onSave={handleSaveRecord} disabled={count === 0} />
            </div>
          </div>

          {/* Right Side: Records List */}
          <div className="w-[320px] xl:w-[360px] flex flex-col bg-gray-50 border-l border-gray-100 min-h-0">
            <div className="flex-none p-4 border-b border-gray-200/50 flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-700 flex items-center gap-2 text-base">
                  <span className="w-1.5 h-5 bg-[#EF8A00] rounded-full"></span>
                  記録一覧
                </h2>
                {records.length > 0 && (
                  <span className="text-[10px] font-bold bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full shadow-sm">
                    {records.length}件
                  </span>
                )}
              </div>
              {records.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearRecords}
                  className="text-xs text-red-500 hover:text-red-600 font-bold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  クリア
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-2">
              <RecordList records={records} onToggleCheck={handleToggleCheck} />
            </div>

            <div className="flex-none bg-white border-t border-gray-100">
              <StatsPanel records={records} onSaveResult={handleSaveResult} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
