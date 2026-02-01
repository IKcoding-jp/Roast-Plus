import type { DevStoryEpisode } from '@/types';

import { EPISODE_001 } from './episode-001';
import { EPISODE_002 } from './episode-002';
import { EPISODE_003 } from './episode-003';
import { EPISODE_004 } from './episode-004';
import { EPISODE_005 } from './episode-005';
import { EPISODE_006 } from './episode-006';

// 開発秘話エピソード
export const DEV_STORY_EPISODES: DevStoryEpisode[] = [
  EPISODE_001,
  EPISODE_002,
  EPISODE_003,
  EPISODE_004,
  EPISODE_005,
  EPISODE_006,
];

// エピソードをIDで取得
export const getEpisodeById = (id: string): DevStoryEpisode | undefined => {
  return DEV_STORY_EPISODES.find((episode) => episode.id === id);
};

// エピソードを表示順序でソート
export const getSortedEpisodes = (): DevStoryEpisode[] => {
  return [...DEV_STORY_EPISODES].sort((a, b) => a.order - b.order);
};
