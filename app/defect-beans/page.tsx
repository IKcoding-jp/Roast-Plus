'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { HiArrowLeft, HiSearch, HiPlus, HiX } from 'react-icons/hi';
import { RiBookFill } from 'react-icons/ri';
import { MdCompareArrows } from 'react-icons/md';
import LoginPage from '@/app/login/page';
import { useDefectBeans } from '@/hooks/useDefectBeans';
import { useDefectBeanSettings } from '@/hooks/useDefectBeanSettings';
import { DefectBeanCard } from '@/components/DefectBeanCard';
import { DefectBeanForm } from '@/components/DefectBeanForm';
import { DefectBeanCompare } from '@/components/DefectBeanCompare';
import type { DefectBean } from '@/types';

type FilterOption = 'all' | 'shouldRemove' | 'shouldNotRemove';

export default function DefectBeansPage() {
  const { user, loading: authLoading } = useAuth();
  const { allDefectBeans, isLoading, addDefectBean, removeDefectBean } = useDefectBeans();
  const { settings, updateSetting } = useDefectBeanSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  // フィルタリングと検索（Hooksは早期リターンの前に呼び出す必要がある）
  const filteredDefectBeans = useMemo(() => {
    let filtered = [...allDefectBeans];

    // 検索フィルタ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bean) =>
          bean.name.toLowerCase().includes(query) ||
          bean.characteristics.toLowerCase().includes(query) ||
          bean.tasteImpact.toLowerCase().includes(query) ||
          bean.removalReason.toLowerCase().includes(query)
      );
    }

    // 設定フィルタ
    if (filterOption === 'shouldRemove') {
      filtered = filtered.filter(
        (bean) => settings[bean.id]?.shouldRemove === true
      );
    } else if (filterOption === 'shouldNotRemove') {
      filtered = filtered.filter(
        (bean) => settings[bean.id]?.shouldRemove === false
      );
    }

    // ソート（マスターを先に、その後ユーザー追加）
    filtered.sort((a, b) => {
      if (a.isMaster && !b.isMaster) return -1;
      if (!a.isMaster && b.isMaster) return 1;
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name, 'ja');
    });

    return filtered;
  }, [allDefectBeans, searchQuery, filterOption, settings]);

  // 早期リターン（すべてのHooksの後）
  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // 選択モードの切り替え
  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    if (compareMode) {
      setSelectedIds(new Set());
    }
  };

  // カード選択
  const handleSelect = (id: string) => {
    if (!compareMode) return;

    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 比較表示
  const handleShowCompare = () => {
    if (selectedIds.size > 0) {
      setShowCompare(true);
    }
  };

  // 欠点豆追加
  const handleAddDefectBean = async (
    defectBean: Omit<DefectBean, 'id' | 'createdAt' | 'updatedAt' | 'isMaster' | 'imageUrl'>,
    imageFile: File
  ) => {
    try {
      await addDefectBean(defectBean, imageFile);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add defect bean:', error);
      throw error;
    }
  };

  // 欠点豆削除
  const handleDeleteDefectBean = async (id: string, imageUrl: string) => {
    try {
      await removeDefectBean(id, imageUrl);
    } catch (error) {
      console.error('Failed to delete defect bean:', error);
      alert('欠点豆の削除に失敗しました。');
    }
  };

  // 設定更新
  const handleToggleSetting = async (id: string, shouldRemove: boolean) => {
    try {
      await updateSetting(id, shouldRemove);
    } catch (error) {
      console.error('Failed to update setting:', error);
      alert('設定の更新に失敗しました。');
    }
  };

  const selectedDefectBeans = filteredDefectBeans.filter((bean) =>
    selectedIds.has(bean.id)
  );

  return (
    <div className="min-h-screen bg-amber-50 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center gap-2 flex-shrink-0 min-h-[44px]"
            >
              <HiArrowLeft className="text-lg flex-shrink-0" />
              ホームに戻る
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleCompareMode}
                className={`px-4 py-2 rounded-lg transition-colors min-h-[44px] flex items-center gap-2 ${
                  compareMode
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <MdCompareArrows className="h-5 w-5" />
                {compareMode ? '選択モード' : '比較モード'}
              </button>
              {compareMode && selectedIds.size > 0 && (
                <button
                  onClick={handleShowCompare}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors min-h-[44px] flex items-center gap-2"
                >
                  比較 ({selectedIds.size})
                </button>
              )}
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors min-h-[44px] flex items-center gap-2"
              >
                <HiPlus className="h-5 w-5" />
                追加
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <RiBookFill className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              欠点豆図鑑
            </h1>
          </div>
        </header>

        {/* 検索とフィルタ */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 検索 */}
            <div className="flex-1">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="名称や特徴で検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[44px]"
                />
              </div>
            </div>

            {/* フィルタ */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterOption('all')}
                className={`px-4 py-2 rounded-lg transition-colors min-h-[44px] ${
                  filterOption === 'all'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                全て
              </button>
              <button
                onClick={() => setFilterOption('shouldRemove')}
                className={`px-4 py-2 rounded-lg transition-colors min-h-[44px] ${
                  filterOption === 'shouldRemove'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                省く
              </button>
              <button
                onClick={() => setFilterOption('shouldNotRemove')}
                className={`px-4 py-2 rounded-lg transition-colors min-h-[44px] ${
                  filterOption === 'shouldNotRemove'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                省かない
              </button>
            </div>
          </div>
        </div>

        {/* グリッド表示 */}
        {filteredDefectBeans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">
              {searchQuery || filterOption !== 'all'
                ? '検索条件に一致する欠点豆がありません。'
                : '欠点豆が登録されていません。'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredDefectBeans.map((defectBean) => {
              const isUserDefectBean = !defectBean.isMaster;
              return (
                <DefectBeanCard
                  key={defectBean.id}
                  defectBean={defectBean}
                  shouldRemove={settings[defectBean.id]?.shouldRemove}
                  isSelected={selectedIds.has(defectBean.id)}
                  onSelect={compareMode ? handleSelect : undefined}
                  onToggleSetting={handleToggleSetting}
                  onDelete={isUserDefectBean ? handleDeleteDefectBean : undefined}
                  isUserDefectBean={isUserDefectBean}
                />
              );
            })}
          </div>
        )}

        {/* 追加フォーム */}
        {showAddForm && (
          <DefectBeanForm
            onSubmit={handleAddDefectBean}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* 比較表示 */}
        {showCompare && selectedDefectBeans.length > 0 && (
          <DefectBeanCompare
            defectBeans={selectedDefectBeans}
            settings={settings}
            onClose={() => {
              setShowCompare(false);
              setSelectedIds(new Set());
              setCompareMode(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
