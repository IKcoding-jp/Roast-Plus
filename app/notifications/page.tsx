'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/hooks/useNotifications';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { Loading } from '@/components/Loading';
import { NotificationModal } from '@/components/notifications/NotificationModal';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { DeleteConfirmDialog } from '@/components/notifications/DeleteConfirmDialog';
import { HiArrowLeft } from 'react-icons/hi';
import { IoAdd } from 'react-icons/io5';
import type { Notification } from '@/types';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { notifications, readIds, markAllAsRead, addNotification, updateNotification, deleteNotification, isLoading } = useNotifications();
  const { isEnabled: isDeveloperMode, isLoading: isDeveloperModeLoading } = useDeveloperMode();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const hasAuthRedirected = useRef(false);

  // 未認証時にログインページにリダイレクト
  useEffect(() => {
    if (!authLoading && !user && !hasAuthRedirected.current) {
      hasAuthRedirected.current = true;
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/notifications';
      router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [user, authLoading, router]);

  // ページを開いた時点で全て既読にする
  useEffect(() => {
    if (!isLoading && notifications.length > 0) {
      const hasUnread = notifications.some(n => !readIds.includes(n.id));
      if (hasUnread) {
        markAllAsRead();
      }
    }
  }, [isLoading, notifications, readIds, markAllAsRead]);

  // ソート済み通知リスト（orderがある場合はorder順、ない場合は日付順）
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      // 両方orderがある場合はorder順
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      
      // 片方だけorderがある場合
      if (a.order !== undefined && b.order === undefined) {
        return -1; // orderがある方が前
      }
      if (a.order === undefined && b.order !== undefined) {
        return 1; // orderがない方が後
      }
      
      // 両方orderがない場合は日付順（新しい順）
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) {
        return dateDiff;
      }
      // 日付が同じ場合はIDで降順にソート（新しい順）
      return b.id.localeCompare(a.id);
    });
  }, [notifications]);

  if (authLoading || isLoading || isDeveloperModeLoading) {
    return <Loading />;
  }

  // 未認証の場合はリダイレクト中なので何も表示しない
  if (!user) {
    return null;
  }

  const handleAddClick = () => {
    setEditingNotification(null);
    setShowModal(true);
  };

  const handleEditClick = (notification: Notification) => {
    setEditingNotification(notification);
    setShowModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteNotification(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  const handleMoveUp = async (id: string) => {
    const currentIndex = sortedNotifications.findIndex((n) => n.id === id);
    if (currentIndex <= 0) return; // 既に一番上

    const targetIndex = currentIndex - 1;

    // order値を更新
    const notificationsWithOrder = sortedNotifications.map((n, index) => ({
      ...n,
      order: n.order ?? index * 10,
    }));

    const targetOrder = notificationsWithOrder[targetIndex].order!;
    const prevOrder = targetIndex > 0
      ? notificationsWithOrder[targetIndex - 1].order!
      : targetOrder - 1000;
    
    const newOrder = (prevOrder + targetOrder) / 2;

    await updateNotification(id, { order: newOrder });
  };

  const handleMoveDown = async (id: string) => {
    const currentIndex = sortedNotifications.findIndex((n) => n.id === id);
    if (currentIndex < 0 || currentIndex >= sortedNotifications.length - 1) return; // 既に一番下

    const targetIndex = currentIndex + 1;

    // order値を更新
    const notificationsWithOrder = sortedNotifications.map((n, index) => ({
      ...n,
      order: n.order ?? index * 10,
    }));

    const targetOrder = notificationsWithOrder[targetIndex].order!;
    const nextOrder = targetIndex < notificationsWithOrder.length - 1
      ? notificationsWithOrder[targetIndex + 1].order!
      : targetOrder + 1000;
    
    const newOrder = (targetOrder + nextOrder) / 2;

    await updateNotification(id, { order: newOrder });
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex justify-start w-full sm:w-auto sm:flex-1">
              <Link
                href="/"
                className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
                title="戻る"
                aria-label="戻る"
              >
                <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
              </Link>
            </div>
            <h1 className="w-full sm:w-auto text-2xl sm:text-3xl font-bold text-gray-800 sm:flex-1 text-center">
              通知
            </h1>
            <div className="hidden sm:block flex-1 flex-shrink-0"></div>
          </div>
        </header>

        <main>
          {/* 開発者モード時のみ表示：通知追加ボタン */}
          {isDeveloperMode && (
            <div className="mb-6">
              <button
                onClick={handleAddClick}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <IoAdd className="h-5 w-5" />
                通知を追加
              </button>
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">通知はありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedNotifications.map((notification, index) => {
                const isFirst = index === 0;
                const isLast = index === sortedNotifications.length - 1;

                return (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    isFirst={isFirst}
                    isLast={isLast}
                    isDeveloperMode={isDeveloperMode}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                  />
                );
              })}
            </div>
          )}
        </main>

        {/* 通知追加・編集モーダル */}
        {showModal && (
          <NotificationModal
            key={editingNotification?.id ?? 'new'}
            notification={editingNotification}
            onSave={(notification) => {
              if (editingNotification) {
                updateNotification(editingNotification.id, notification);
              } else {
                addNotification(notification);
              }
              setShowModal(false);
              setEditingNotification(null);
            }}
            onCancel={() => {
              setShowModal(false);
              setEditingNotification(null);
            }}
          />
        )}

        {/* 削除確認ダイアログ */}
        {deleteConfirmId && (
          <DeleteConfirmDialog
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />
        )}
      </div>
    </div>
  );
}
