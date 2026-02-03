'use client';

import { IoCreateOutline, IoTrashOutline, IoChevronUp, IoChevronDown } from 'react-icons/io5';
import type { Notification } from '@/types';

interface NotificationCardProps {
  notification: Notification;
  isFirst: boolean;
  isLast: boolean;
  isDeveloperMode: boolean;
  onEdit: (notification: Notification) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
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

export function NotificationCard({
  notification,
  isFirst,
  isLast,
  isDeveloperMode,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: NotificationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* 開発者モード時のみ表示:上/下移動ボタン */}
          {isDeveloperMode && (
            <div className="flex flex-col gap-1">
              <button
                onClick={() => onMoveUp(notification.id)}
                disabled={isFirst}
                className={`p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors ${
                  isFirst ? 'opacity-30 cursor-not-allowed' : ''
                }`}
                aria-label="上に移動"
              >
                <IoChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => onMoveDown(notification.id)}
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
          <span className="text-sm text-gray-500">{formatDate(notification.date)}</span>
        </div>
        {/* 開発者モード時のみ表示:編集・削除ボタン */}
        {isDeveloperMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(notification)}
              className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors"
              aria-label="編集"
            >
              <IoCreateOutline className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(notification.id)}
              className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              aria-label="削除"
            >
              <IoTrashOutline className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{notification.title}</h2>
      <p className="text-gray-600 whitespace-pre-wrap">{notification.content}</p>
    </div>
  );
}
