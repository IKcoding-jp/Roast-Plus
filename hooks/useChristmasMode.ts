'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'roastplus_christmas_mode';

export function useChristmasMode() {
    const [isChristmasMode, setIsChristmasMode] = useState<boolean>(true);

    // 初期読み込み
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            // 保存されていない場合はデフォルトでtrue (オン)
            if (stored === null) {
                setIsChristmasMode(true);
            } else {
                setIsChristmasMode(stored === 'true');
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
