// 静的エクスポート用のServer Component
// 動的ルートはクライアント側で処理される
import TastingSessionDetailPageClient from './TastingSessionDetailPageClient';

// 静的エクスポートでは動的ルートに対して generateStaticParams() が必須
// Firestoreのデータはビルド時には取得できないため、ダミーパラメータを返す
// 実際のルーティングはクライアント側で処理される（Firebase HostingのrewritesによりSPAとして動作）
export async function generateStaticParams() {
  // 静的エクスポートでは、少なくとも1つのパラメータを返す必要がある
  // ビルド時にはFirestoreからデータを取得できないため、ダミーパラメータを返す
  // 実際のルーティングはクライアント側で処理される
  // 複数のダミーパラメータを返すことで、静的エクスポート時にHTMLファイルが生成される
  return [
    { id: 'dummy' },
    { id: 'dummy2' },
    { id: 'dummy3' },
  ];
}

export default function TastingSessionDetailPage() {
  return <TastingSessionDetailPageClient />;
}

