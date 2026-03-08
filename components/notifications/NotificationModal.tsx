'use client';

import { useState } from 'react';
import type { Notification, NotificationType } from '@/types';
import { Button, Select } from '@/components/ui';

interface NotificationModalProps {
  notification: Notification | null;
  onSave: (notification: Omit<Notification, 'id'>) => void;
  onCancel: () => void;
}

export function NotificationModal({ notification, onSave, onCancel }: NotificationModalProps) {
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
                    if (errors.title) setErrors(prev => ({ ...prev, title: undefined }));
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
                    if (errors.content) setErrors(prev => ({ ...prev, content: undefined }));
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
                    if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
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
              <Select
                id="type"
                label="種類 *"
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
                options={[
                  { value: 'announcement', label: 'お知らせ' },
                  { value: 'update', label: 'アップデート' },
                  { value: 'improvement', label: '改善' },
                  { value: 'request', label: 'お願い' },
                  { value: 'bugfix', label: 'バグ修正' },
                ]}
                className="text-gray-900 bg-white"
              />
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onCancel}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-orange-500 hover:bg-orange-600"
              >
                {notification ? '更新' : '追加'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
