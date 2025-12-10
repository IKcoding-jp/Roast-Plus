'use client';

import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Member, Manager } from '@/types';

/**
 * 担当表の /users/{userId}/members コレクションからメンバーと /users/{userId}/managers/default から管理者をリアルタイム取得するフック
 * @param userId ユーザーID
 * @returns { members, manager, loading } メンバー配列、管理者、ローディング状態
 */
export function useMembers(userId: string | null) {
  const [members, setMembers] = useState<Member[]>([]);
  const [manager, setManager] = useState<Manager | null>(null);
  const [isMembersReady, setIsMembersReady] = useState(() => userId === null);
  const [isManagerReady, setIsManagerReady] = useState(() => userId === null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    // メンバーの購読
    const membersCol = collection(db, 'users', userId, 'members');
    const unsubMembers = onSnapshot(membersCol, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Member));
      setMembers(membersData);
      setIsMembersReady(true);
    }, (error) => {
      console.error('Failed to fetch members:', error);
      setIsMembersReady(true);
    });

    // 管理者の購読
    const managerDoc = doc(db, 'users', userId, 'managers', 'default');
    const unsubManager = onSnapshot(managerDoc, (snapshot) => {
      if (snapshot.exists()) {
        setManager({ id: snapshot.id, ...snapshot.data() } as Manager);
      } else {
        setManager(null);
      }
      setIsManagerReady(true);
    }, (error) => {
      console.error('Failed to fetch manager:', error);
      setIsManagerReady(true);
    });

    return () => {
      unsubMembers();
      unsubManager();
    };
  }, [userId]);

  const effectiveMembers = userId ? members : [];
  const effectiveManager = userId ? manager : null;
  const loading = userId !== null && (!isMembersReady || !isManagerReady);

  return { members: effectiveMembers, manager: effectiveManager, loading };
}

/**
 * アクティブなメンバーのみを取得するユーティリティ
 * @param members メンバー配列
 * @returns アクティブなメンバー配列
 */
export function getActiveMembers(members: Member[]): Member[] {
  return members.filter((m) => m.active !== false);
}

