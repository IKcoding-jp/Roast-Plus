import { DEV_STORY_EPISODES } from '@/data/dev-stories/episodes';
import EpisodeDetailClient from './EpisodeDetailClient';

// 静的エクスポート用: ビルド時に生成するページのパラメータを定義
export function generateStaticParams() {
  return DEV_STORY_EPISODES.map((episode) => ({
    id: episode.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EpisodeDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <EpisodeDetailClient id={id} />;
}
