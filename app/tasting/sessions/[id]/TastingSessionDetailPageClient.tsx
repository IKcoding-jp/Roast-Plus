'use client';

import { useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';

// 動的ルートからクエリパラメータ形式にリダイレクト
export default function TastingSessionDetailPageClient() {
  const paramsValue = useParams();
  // Next.js 16ではparamsがPromiseの場合があるため、use()でアンラップ
  const params = paramsValue instanceof Promise ? use(paramsValue) : paramsValue;
  const router = useRouter();

  useEffect(() => {
    const id = params?.id;
    if (id && typeof id === 'string') {
      // パスに /edit や /records/new が含まれている場合は対応するクエリパラメータを追加
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      let query = `sessionId=${encodeURIComponent(id)}`;
      
      if (pathname.includes('/edit')) {
        query += '&edit=true';
      } else if (pathname.includes('/records/new')) {
        query += '&newRecord=true';
      }
      
      router.replace(`/tasting?${query}`);
    } else {
      router.replace('/tasting');
    }
  }, [params, router]);

  return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="text-center">
        <div className="text-lg text-gray-600">リダイレクト中...</div>
      </div>
    </div>
  );
}

