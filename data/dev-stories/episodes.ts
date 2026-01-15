import type { DevStoryEpisode } from '@/types';

// 開発秘話エピソード
export const DEV_STORY_EPISODES: DevStoryEpisode[] = [
  {
    id: 'episode-001',
    title: 'ローストプラス誕生秘話',
    subtitle: 'アプリ開発のきっかけ',
    imageUrl: '/dev-stories/roast_plus_origin.png',
    dialogues: [
      {
        id: 'msg-001-1',
        characterId: 'asairi',
        content: 'ねえねえ、ローストプラスってどうやって生まれたの？',
      },
      {
        id: 'msg-001-2',
        characterId: 'fukairi',
        content: '焙煎作業の効率化が必要だったんだ。\n毎日の担当割り当てとか、スケジュール管理が大変でね。',
      },
      {
        id: 'msg-001-3',
        characterId: 'asairi',
        content: 'そっか！紙で管理してたの？',
      },
      {
        id: 'msg-001-4',
        characterId: 'fukairi',
        content: 'そうそう。それをデジタル化して、みんなで共有できるようにしたかったんだ。',
      },
      {
        id: 'msg-001-5',
        characterId: 'asairi',
        content: 'すごい！だからローストプラスを作ったんだね！',
      },
      {
        id: 'msg-001-6',
        characterId: 'fukairi',
        content: 'うん。最初は簡単な担当表アプリだったけど、だんだん機能が増えていったよ。',
      },
    ],
    detailContent: `ローストプラスは、コーヒー焙煎作業の効率化を目指して開発されました。

従来は紙ベースで管理していた担当表やスケジュールを、デジタル化することで以下のメリットが生まれました：

- リアルタイムでの情報共有
- 自動的な担当割り当て
- 過去の記録の検索・参照

今後も皆さんの声を聞きながら、より使いやすいアプリを目指して開発を続けていきます。`,
    tags: ['開発背景', 'コンセプト'],
    publishedAt: '2026-01-15',
    order: 1,
  },
];

// エピソードをIDで取得
export const getEpisodeById = (id: string): DevStoryEpisode | undefined => {
  return DEV_STORY_EPISODES.find((episode) => episode.id === id);
};

// エピソードを表示順序でソート
export const getSortedEpisodes = (): DevStoryEpisode[] => {
  return [...DEV_STORY_EPISODES].sort((a, b) => a.order - b.order);
};
