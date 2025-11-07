'use client';

import { useState, useEffect, useCallback } from 'react';

const DEVELOPER_MODE_PASSWORD = '4869';
const STORAGE_KEY = 'roastplus_developer_mode';

export function useDeveloperMode() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ローカルストレージから状態を読み込む
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      setIsEnabled(stored === 'true');
      setIsLoading(false);
    }
  }, []);

  // パスワード検証
  const verifyPassword = useCallback((password: string): boolean => {
    return password === DEVELOPER_MODE_PASSWORD;
  }, []);

  // 開発者モードを有効化（パスワード検証付き）
  const enableDeveloperMode = useCallback((password: string): boolean => {
    if (verifyPassword(password)) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsEnabled(true);
        return true;
      }
    }
    return false;
  }, [verifyPassword]);

  // 開発者モードを無効化
  const disableDeveloperMode = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      setIsEnabled(false);
    }
  }, []);

  return {
    isEnabled,
    isLoading,
    enableDeveloperMode,
    disableDeveloperMode,
  };
}

