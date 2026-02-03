'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface PasswordModalProps {
  onSubmit: (password: string) => boolean;
  onCancel: () => void;
}

export function PasswordModal({ onSubmit, onCancel }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (onSubmit(password)) {
      setPassword('');
    } else {
      setPasswordError('パスワードが正しくありません');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">パスワードを入力</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
              }}
              className={`w-full px-4 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                passwordError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="パスワードを入力"
              autoFocus
            />
            {passwordError && <p className="mt-2 text-sm text-red-600">{passwordError}</p>}
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" size="md" onClick={onCancel}>
              キャンセル
            </Button>
            <Button type="submit" variant="primary" size="md">
              確定
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
