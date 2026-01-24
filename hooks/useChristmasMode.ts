'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'roastplus_christmas_mode';
const MIGRATION_FLAG_KEY = 'roastplus_christmas_mode_migrated';

export function useChristmasMode() {
    const [isChristmasMode, setIsChristmasMode] = useState<boolean>(false);

    // 初期読み込み
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // マイグレーション処理（一度だけ実行）
            const migrationDone = localStorage.getItem(MIGRATION_FLAG_KEY) === 'true';

            if (!migrationDone) {
                // 既存のlocalStorageキーを削除して、新しいデフォルト（オフ）を適用
                // これにより、デプロイ後に既存端末でもオフになる
                if (localStorage.getItem(STORAGE_KEY) !== null) {
                    localStorage.removeItem(STORAGE_KEY);
                }
                localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
                // デフォルトはfalse（オフ）
                // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorageからの初期化
                setIsChristmasMode(false);
            } else {
                // マイグレーション済みの場合は、localStorageから読み込む
                const stored = localStorage.getItem(STORAGE_KEY);
                const value = stored === null ? false : stored === 'true';
                 
                setIsChristmasMode(value);
            }
        }
    }, []);

    // 切り替え
    const setChristmasMode = useCallback((enabled: boolean) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, String(enabled));
            setIsChristmasMode(enabled);
        }
    }, []);

    const toggleChristmasMode = useCallback(() => {
        setChristmasMode(!isChristmasMode);
    }, [isChristmasMode, setChristmasMode]);

    return {
        isChristmasMode,
        setChristmasMode,
        toggleChristmasMode,
    };
}
