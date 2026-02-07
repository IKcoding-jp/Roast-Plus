'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { HiPlus } from 'react-icons/hi';
import { RiBookFill } from 'react-icons/ri';
import { MdCompareArrows } from 'react-icons/md';
import LoginPage from '@/app/login/page';
import { useDefectBeans } from '@/hooks/useDefectBeans';
import { useDefectBeanSettings } from '@/hooks/useDefectBeanSettings';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { useToastContext } from '@/components/Toast';
import { Button, BackLink } from '@/components/ui';
import { DefectBeanCard } from '@/components/DefectBeanCard';
import { DefectBeanForm } from '@/components/DefectBeanForm';
import { DefectBeanCompare } from '@/components/DefectBeanCompare';
import { Loading } from '@/components/Loading';
import { SearchFilterSection } from '@/components/defect-beans/SearchFilterSection';
import { SortMenu } from '@/components/defect-beans/SortMenu';
import { EmptyState } from '@/components/defect-beans/EmptyState';
import type { DefectBean } from '@/types';

type FilterOption = 'all' | 'shouldRemove' | 'shouldNotRemove';
type SortOption = 'default' | 'createdAtDesc' | 'createdAtAsc' | 'nameAsc' | 'nameDesc';

export default function DefectBeansPage() {
  const { user, loading: authLoading } = useAuth();
  const { allDefectBeans, isLoading, addDefectBean, updateDefectBean, removeDefectBean } = useDefectBeans();
  const { settings, updateSetting } = useDefectBeanSettings();
  const { isEnabled: isDeveloperModeEnabled } = useDeveloperMode();
  const { showToast } = useToastContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDefectBeanId, setEditingDefectBeanId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [showSortMenu, setShowSortMenu] = useState(false);

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

    // ソート
    if (sortOption === 'default') {
      // デフォルト（マスターを先に、その後ユーザー追加）
      filtered.sort((a, b) => {
        if (a.isMaster && !b.isMaster) return -1;
        if (!a.isMaster && b.isMaster) return 1;
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return a.name.localeCompare(b.name, 'ja');
      });
    } else if (sortOption === 'createdAtDesc') {
      // 新しい順（作成日時降順）
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    } else if (sortOption === 'createdAtAsc') {
      // 古い順（作成日時昇順）
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB;
      });
    } else if (sortOption === 'nameAsc') {
      // 名前昇順
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    } else if (sortOption === 'nameDesc') {
      // 名前降順
      filtered.sort((a, b) => b.name.localeCompare(a.name, 'ja'));
    }

    return filtered;
  }, [allDefectBeans, searchQuery, filterOption, settings, sortOption]);

  // 2つ選択されたら自動的に比較を表示
  useEffect(() => {
    if (compareMode && selectedIds.size === 2 && !showCompare) {
      setShowCompare(true);
    }
  }, [compareMode, selectedIds.size, showCompare]);

  // 早期リターン（すべてのHooksの後）
  if (authLoading || isLoading) {
    return <Loading />;
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
      showToast('欠点豆の更新に失敗しました。', 'error');
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
      showToast('欠点豆の削除に失敗しました。', 'error');
      throw error;
    }
  };

  // 設定更新
  const handleToggleSetting = async (id: string, shouldRemove: boolean) => {
    try {
      await updateSetting(id, shouldRemove);
    } catch (error) {
      console.error('Failed to update setting:', error);
      showToast('設定の更新に失敗しました。', 'error');
    }
  };

  const selectedDefectBeans = filteredDefectBeans.filter((bean) =>
    selectedIds.has(bean.id)
  );

  return (
    <div className="min-h-screen py-2 sm:py-4 px-4 sm:px-6 lg:px-8 transition-colors duration-1000 bg-page">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <header className="mb-4">
          {/* タイトルとナビゲーション（一番上、同じ行） */}
          <div className="flex sm:grid sm:grid-cols-3 items-center justify-between mb-3">
            {/* 左側: 戻る */}
            <div className="flex justify-start">
              <BackLink
                href="/"
                variant="icon-only"
              />
            </div>

            {/* 中央: タイトル */}
            <div className="flex justify-center items-center gap-2 sm:gap-3 min-w-0">
              <RiBookFill className="hidden sm:block h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 text-spot" />
              <h1 className="hidden sm:block text-lg sm:text-xl lg:text-2xl font-bold whitespace-nowrap text-ink">
                コーヒー豆図鑑
              </h1>
            </div>

            {/* 右側: アクションボタン */}
            <div className="flex justify-end items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap">
              {!(filteredDefectBeans.length === 0 && !searchQuery && filterOption === 'all') && (
                <>
                  {/* ソートボタン */}
                  {!compareMode && (
                    <SortMenu
                      sortOption={sortOption}
                      onSortChange={setSortOption}
                      showSortMenu={showSortMenu}
                      onToggleMenu={() => setShowSortMenu(!showSortMenu)}
                      onClose={() => setShowSortMenu(false)}
  
                    />
                  )}
                  <Button
                    variant={compareMode ? 'primary' : 'surface'}
                    size="sm"
                    onClick={toggleCompareMode}

                    title={compareMode ? '選択モード' : '比較モード'}
                    className="!px-3 !py-2 gap-1.5"
                  >
                    <MdCompareArrows className="h-5 w-5" />
                    <span className="text-xs sm:text-sm">
                      {compareMode ? '選択モード' : '比較'}
                    </span>
                  </Button>
                  {compareMode && selectedIds.size > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleShowCompare}
  
                      title="比較を表示"
                      className="!px-3 !py-2 gap-1.5"
                    >
                      比較 ({selectedIds.size})
                    </Button>
                  )}
                  {!compareMode && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAddForm(true)}
  
                      title="欠点豆を追加"
                      className="!px-3 !py-2 gap-1.5"
                    >
                      <HiPlus className="h-5 w-5" />
                      <span className="text-xs sm:text-sm">追加</span>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </header>

        {/* 検索とフィルタ */}
        {allDefectBeans.length > 0 && (
          <SearchFilterSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterOption={filterOption}
            onFilterChange={setFilterOption}

          />
        )}

        {/* グリッド表示 */}
        {filteredDefectBeans.length === 0 ? (
          <EmptyState
            hasSearchOrFilter={!!(searchQuery || filterOption !== 'all')}
            onAddClick={() => setShowAddForm(true)}

          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredDefectBeans.map((defectBean) => {
              return (
                <DefectBeanCard
                  key={defectBean.id}
                  defectBean={defectBean}
                  shouldRemove={settings[defectBean.id]?.shouldRemove}
                  isSelected={selectedIds.has(defectBean.id)}
                  onSelect={compareMode ? handleSelect : undefined}
                  onToggleSetting={handleToggleSetting}
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
              onDelete={isDeveloperModeEnabled ? handleDeleteDefectBeanFromEdit : undefined}
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
