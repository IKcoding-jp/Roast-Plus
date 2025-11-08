// 静的エクスポート用のServer Component
// 動的ルートはクライアント側で処理される
import TastingDetailPageClient from './TastingDetailPageClient';

// 静的エクスポートでは動的ルートに対して generateStaticParams() が必須
// Firestoreのデータはビルド時には取得できないため、ダミーパラメータを返す
// 実際のルーティングはクライアント側で処理される（Firebase HostingのrewritesによりSPAとして動作）
export async function generateStaticParams() {
  // 静的エクスポートでは、少なくとも1つのパラメータを返す必要がある
  // ビルド時にはFirestoreからデータを取得できないため、ダミーパラメータを返す
  // 実際のルーティングはクライアント側で処理される
  return [{ id: 'dummy' }];
}

export default function TastingDetailPage() {
  return <TastingDetailPageClient />;
}
