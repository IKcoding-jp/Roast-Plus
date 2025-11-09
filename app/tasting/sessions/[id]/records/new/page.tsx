// 静的エクスポート用: generateStaticParams()が必要
export async function generateStaticParams() {
  return [{ id: 'dummy' }];
}

// 動的ルートからクエリパラメータ形式にリダイレクト
import NewTastingRecordPageClient from './NewTastingRecordPageClient';

export default function NewTastingRecordPage() {
  return <NewTastingRecordPageClient />;
}

