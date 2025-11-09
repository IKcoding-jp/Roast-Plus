'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Firebase Authenticationの初期化を待機するPromiseを返す
 * 静的エクスポート環境でも確実に初期化が完了するまで待機する
 */
function waitForAuthInit(): Promise<User | null> {
  return new Promise((resolve) => {
    // onAuthStateChangedの初期コールバックが呼ばれるまで待機
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    // 初期化を待機してから、状態変更リスナーを設定
    waitForAuthInit()
      .then((initialUser) => {
        if (!isMounted) return;
        
        setUser(initialUser);
        setLoading(false);

        // 以降の認証状態変更を監視
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (isMounted) {
            setUser(user);
          }
        });
      })
      .catch((error) => {
        console.error('Firebase Authentication初期化エラー:', error);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { user, loading };
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('ログアウトエラー:', error);
    throw error;
  }
}

