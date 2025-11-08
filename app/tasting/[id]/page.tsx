// 静的エクスポート用のgenerateStaticParams
// クライアントコンポーネントと分離するため、Server Componentとして分離
import TastingDetailPageClient from './TastingDetailPageClient';

export function generateStaticParams() {
  // 静的エクスポートでは、動的ルートはクライアント側で処理されるため空配列を返す
  return [];
}

export default function TastingDetailPage() {
  return <TastingDetailPageClient />;
}
