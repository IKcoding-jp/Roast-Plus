'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/hooks/useNotifications';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { Loading } from '@/components/Loading';
import { HiArrowLeft } from 'react-icons/hi';
import { IoAdd, IoCreateOutline, IoTrashOutline, IoChevronUp, IoChevronDown } from 'react-icons/io5';
import type { Notification, NotificationType } from '@/types';

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'update':
        return 'アップデート';
      case 'announcement':
        return 'お知らせ';
      case 'improvement':
        return '改善';
      case 'request':
        return 'お願い';
      case 'bugfix':
        return 'バグ修正';
      default:
        return '通知';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'update':
        return 'bg-orange-100 text-orange-800';
      case 'announcement':
        return 'bg-orange-100 text-orange-800';
      case 'improvement':
        return 'bg-blue-100 text-blue-800';
      case 'request':
        return 'bg-green-100 text-green-800';
      case 'bugfix':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
                  <div
                    key={notification.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {/* 開発者モード時のみ表示：上/下移動ボタン */}
                        {isDeveloperMode && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleMoveUp(notification.id)}
                              disabled={isFirst}
                              className={`p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors ${
                                isFirst ? 'opacity-30 cursor-not-allowed' : ''
                              }`}
                              aria-label="上に移動"
                            >
                              <IoChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(notification.id)}
                              disabled={isLast}
                              className={`p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors ${
                                isLast ? 'opacity-30 cursor-not-allowed' : ''
                              }`}
                              aria-label="下に移動"
                            >
                              <IoChevronDown className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(notification.type)}`}>
                          {getTypeLabel(notification.type)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(notification.date)}
                        </span>
                      </div>
                      {/* 開発者モード時のみ表示：編集・削除ボタン */}
                      {isDeveloperMode && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(notification)}
                            className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors"
                            aria-label="編集"
                          >
                            <IoCreateOutline className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(notification.id)}
                            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            aria-label="削除"
                          >
                            <IoTrashOutline className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                      {notification.title}
                    </h2>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {notification.content}
                    </p>
                  </div>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                通知を削除
              </h3>
              <p className="text-gray-600 mb-6">
                この通知を削除してもよろしいですか？この操作は取り消せません。
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 通知追加・編集モーダルコンポーネント
interface NotificationModalProps {
  notification: Notification | null;
  onSave: (notification: Omit<Notification, 'id'>) => void;
  onCancel: () => void;
}

function NotificationModal({ notification, onSave, onCancel }: NotificationModalProps) {
  const [title, setTitle] = useState(notification?.title || '');
  const [content, setContent] = useState(notification?.content || '');
  const [date, setDate] = useState(notification?.date || new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<NotificationType>(notification?.type || 'announcement');
  const [errors, setErrors] = useState<{ title?: string; content?: string; date?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const newErrors: { title?: string; content?: string; date?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'タイトルを入力してください';
    }
    if (!content.trim()) {
      newErrors.content = '内容を入力してください';
    }
    if (!date) {
      newErrors.date = '日付を選択してください';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave({
      title: title.trim(),
      content: content.trim(),
      date,
      type,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 text-gray-900">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {notification ? '通知を編集' : '通知を追加'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* タイトル */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors({ ...errors, title: undefined });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="通知のタイトルを入力"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* 内容 */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (errors.content) setErrors({ ...errors, content: undefined });
                  }}
                  rows={6}
                  className={`w-full px-4 py-2 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="通知の内容を入力"
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
              </div>

              {/* 日付 */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  日付 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors({ ...errors, date: undefined });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              {/* 種類 */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  種類 <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as NotificationType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="announcement">お知らせ</option>
                  <option value="update">アップデート</option>
                  <option value="improvement">改善</option>
                  <option value="request">お願い</option>
                  <option value="bugfix">バグ修正</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {notification ? '更新' : '追加'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
