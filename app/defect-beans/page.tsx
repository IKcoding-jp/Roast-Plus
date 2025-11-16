'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { HiArrowLeft, HiSearch, HiPlus, HiX, HiCheckCircle, HiXCircle, HiCollection, HiOutlineCollection } from 'react-icons/hi';
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
  const { allDefectBeans, isLoading, addDefectBean, updateDefectBean, removeDefectBean } = useDefectBeans();
  const { settings, updateSetting } = useDefectBeanSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDefectBeanId, setEditingDefectBeanId] = useState<string | null>(null);
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
    imageFile: File | null
  ) => {
    if (!imageFile) {
      throw new Error('Image file is required');
    }
    try {
      await addDefectBean(defectBean, imageFile);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add defect bean:', error);
      throw error;
    }
  };

  // 欠点豆編集
  const handleEditDefectBean = (id: string) => {
    setEditingDefectBeanId(id);
  };

  // 欠点豆更新
  const handleUpdateDefectBean = async (
    defectBean: Omit<DefectBean, 'id' | 'createdAt' | 'updatedAt' | 'isMaster' | 'imageUrl'>,
    imageFile: File | null
  ) => {
    if (!editingDefectBeanId) return;

    try {
      const existingBean = allDefectBeans.find((db) => db.id === editingDefectBeanId);
      if (!existingBean) {
        throw new Error('Defect bean not found');
      }

      await updateDefectBean(editingDefectBeanId, defectBean, imageFile, existingBean.imageUrl);
      setEditingDefectBeanId(null);
    } catch (error) {
      console.error('Failed to update defect bean:', error);
      alert('欠点豆の更新に失敗しました。');
      throw error;
    }
  };

  // 欠点豆削除（編集ダイアログから）
  const handleDeleteDefectBeanFromEdit = async () => {
    if (!editingDefectBeanId) return;

    try {
      const existingBean = allDefectBeans.find((db) => db.id === editingDefectBeanId);
      if (!existingBean) {
        throw new Error('Defect bean not found');
      }

      await removeDefectBean(editingDefectBeanId, existingBean.imageUrl);
      setEditingDefectBeanId(null);
    } catch (error) {
      console.error('Failed to delete defect bean:', error);
      alert('欠点豆の削除に失敗しました。');
      throw error;
    }
  };

  // 欠点豆削除（旧関数、互換性のため残す）
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
    <div className="min-h-screen bg-amber-50 py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <header className="mb-4">
          {/* タイトルとナビゲーション（一番上、同じ行） */}
          <div className="relative flex items-center mb-3">
            {/* 左側: ホームに戻る */}
            <Link
              href="/"
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center gap-1.5 flex-shrink-0 min-h-[40px]"
              title="ホームに戻る"
            >
              <HiArrowLeft className="text-lg flex-shrink-0" />
              <span className="hidden sm:inline">ホームに戻る</span>
            </Link>

            {/* 中央: タイトル */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
              <RiBookFill className="h-7 w-7 sm:h-8 sm:w-8 text-amber-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                欠点豆図鑑
              </h1>
            </div>

            {/* 右側: アクションボタン */}
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              {!(filteredDefectBeans.length === 0 && !searchQuery && filterOption === 'all') && (
                <>
                  <button
                    onClick={toggleCompareMode}
                    className={`px-3 py-2 rounded-lg transition-colors min-h-[40px] flex items-center gap-1.5 ${
                      compareMode
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                    title={compareMode ? '選択モード' : '比較モード'}
                  >
                    <MdCompareArrows className="h-5 w-5" />
                    <span className="hidden sm:inline text-sm">
                      {compareMode ? '選択モード' : '比較'}
                    </span>
                  </button>
                  {compareMode && selectedIds.size > 0 && (
                    <button
                      onClick={handleShowCompare}
                      className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors min-h-[40px] flex items-center gap-1.5 text-sm"
                      title="比較を表示"
                    >
                      比較 ({selectedIds.size})
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors min-h-[40px] flex items-center justify-center"
                    title="欠点豆を追加"
                  >
                    <HiPlus className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* 検索とフィルタ */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* 検索 */}
            <div className="flex-1">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="名称や特徴で検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent min-h-[40px] text-sm text-gray-900 bg-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* フィルタ */}
            <div className="flex gap-1.5">
              <button
                onClick={() => setFilterOption('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors min-h-[36px] flex items-center gap-1.5 text-sm ${
                  filterOption === 'all'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="全て表示"
              >
                <HiCollection className="h-4 w-4" />
                <span className="hidden sm:inline">全て</span>
              </button>
              <button
                onClick={() => setFilterOption('shouldRemove')}
                className={`px-3 py-1.5 rounded-lg transition-colors min-h-[36px] flex items-center gap-1.5 text-sm ${
                  filterOption === 'shouldRemove'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="省く設定のもの"
              >
                <HiXCircle className="h-4 w-4" />
                <span className="hidden sm:inline">省く</span>
              </button>
              <button
                onClick={() => setFilterOption('shouldNotRemove')}
                className={`px-3 py-1.5 rounded-lg transition-colors min-h-[36px] flex items-center gap-1.5 text-sm ${
                  filterOption === 'shouldNotRemove'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title="省かない設定のもの"
              >
                <HiCheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">省かない</span>
              </button>
            </div>
          </div>
        </div>

        {/* グリッド表示 */}
        {filteredDefectBeans.length === 0 ? (
          <div className="py-12 sm:py-16 text-center">
            <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
              {/* アイコン */}
              <div className="relative">
                <div className="absolute inset-0 bg-amber-100 rounded-full blur-xl opacity-50"></div>
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-50 flex items-center justify-center">
                  {searchQuery || filterOption !== 'all' ? (
                    <HiSearch className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />
                  ) : (
                    <HiOutlineCollection className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />
                  )}
                </div>
              </div>
              
              {/* メッセージ */}
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {searchQuery || filterOption !== 'all'
                    ? '検索条件に一致する欠点豆がありません'
                    : '欠点豆が登録されていません'}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                  {searchQuery || filterOption !== 'all'
                    ? '別のキーワードで検索するか、フィルタを変更してみてください。'
                    : '最初の欠点豆を追加して、図鑑を始めましょう。'}
                </p>
              </div>
              
              {/* アクションボタン（登録がない場合のみ表示） */}
              {!searchQuery && filterOption === 'all' && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  <HiPlus className="w-5 h-5" />
                  <span className="font-medium">欠点豆を追加</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
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
                  onEdit={!compareMode ? handleEditDefectBean : undefined}
                  compareMode={compareMode}
                />
              );
            })}
          </div>
        )}

        {/* 追加フォーム */}
        {showAddForm && (
          <DefectBeanForm
            mode="add"
            onSubmit={handleAddDefectBean}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* 編集フォーム */}
        {editingDefectBeanId && (() => {
          const editingBean = allDefectBeans.find((db) => db.id === editingDefectBeanId);
          if (!editingBean) return null;
          
          return (
            <DefectBeanForm
              mode="edit"
              defectBean={editingBean}
              onSubmit={handleAddDefectBean} // 使用されないが型のため必要
              onUpdate={handleUpdateDefectBean}
              onDelete={handleDeleteDefectBeanFromEdit}
              onCancel={() => setEditingDefectBeanId(null)}
            />
          );
        })()}

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
