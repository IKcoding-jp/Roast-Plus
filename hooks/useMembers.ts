'use client';

import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Member, Manager } from '@/types';

/**
 * 担当表の /members コレクションからメンバーと /managers/default から管理者をリアルタイム取得するフック
 * @returns { members, manager, loading } メンバー配列、管理者、ローディング状態
 */
export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [manager, setManager] = useState<Manager | null>(null);
  const [loading, setLoading] = useState(true);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [managerLoaded, setManagerLoaded] = useState(false);

  useEffect(() => {
    // メンバーの購読
    const membersCol = collection(db, 'members');
    const unsubMembers = onSnapshot(membersCol, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Member));
      setMembers(membersData);
      setMembersLoaded(true);
    }, (error) => {
      console.error('Failed to fetch members:', error);
      setMembersLoaded(true);
    });

    // 管理者の購読
    const managerDoc = doc(db, 'managers', 'default');
    const unsubManager = onSnapshot(managerDoc, (snapshot) => {
      if (snapshot.exists()) {
        setManager({ id: snapshot.id, ...snapshot.data() } as Manager);
      } else {
        setManager(null);
      }
      setManagerLoaded(true);
    }, (error) => {
      console.error('Failed to fetch manager:', error);
      setManagerLoaded(true);
    });

    return () => {
      unsubMembers();
      unsubManager();
    };
  }, []);

  // 両方のデータが読み込まれたらローディング完了
  useEffect(() => {
    if (membersLoaded && managerLoaded) {
      setLoading(false);
    }
  }, [membersLoaded, managerLoaded]);

  return { members, manager, loading };
}

/**
 * アクティブなメンバーのみを取得するユーティリティ
 * @param members メンバー配列
 * @returns アクティブなメンバー配列
 */
export function getActiveMembers(members: Member[]): Member[] {
  return members.filter((m) => m.active !== false);
}

