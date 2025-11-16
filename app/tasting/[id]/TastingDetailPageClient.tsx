'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// 動的ルートからクエリパラメータ形式にリダイレクト
export default function TastingDetailPageClient() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const id = params?.id;
    if (id && typeof id === 'string') {
      router.replace(`/tasting?recordId=${encodeURIComponent(id)}`);
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

