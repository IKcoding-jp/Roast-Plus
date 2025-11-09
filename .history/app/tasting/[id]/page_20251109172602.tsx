// 静的エクスポート用: generateStaticParams()が必要
export async function generateStaticParams() {
  return [
    { id: 'dummy' },
    { id: 'dummy2' },
    { id: 'dummy3' },
  ];
}

// 動的ルートからクエリパラメータ形式にリダイレクト
import TastingDetailPageClient from './TastingDetailPageClient';

export default function TastingDetailPage() {
  return <TastingDetailPageClient />;
}
