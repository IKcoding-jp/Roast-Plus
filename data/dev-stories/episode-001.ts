import type { DevStoryEpisode } from '@/types';

export const EPISODE_001: DevStoryEpisode = {
  id: 'episode-001',
  title: 'ローストプラス誕生秘話',
  subtitle: 'アプリ開発のきっかけ',
  imageUrl: '/dev-stories/roast_plus_origin.png',
  dialogues: [
    {
      id: 'msg-001-1',
      characterId: 'asairi',
      content: 'ねえねえ、ローストプラスってどうして作ろうと思ったの？',
    },
    {
      id: 'msg-001-2',
      characterId: 'fukairi',
      content: '実は担当表のマンネリ化が課題だったんだ。\n掃除とローストの担当を6人で回してたんだけどね。',
    },
    {
      id: 'msg-001-3',
      characterId: 'asairi',
      content: 'マンネリ化？どういうこと？',
    },
    {
      id: 'msg-001-4',
      characterId: 'fukairi',
      content: '2列3行の担当表があって、左の列は上に、右の列は下にずらすっていうルールでシャッフルしてたんだ。',
    },
    {
      id: 'msg-001-5',
      characterId: 'asairi',
      content: 'あー、それだと同じペアになっちゃうってこと？',
    },
    {
      id: 'msg-001-6',
      characterId: 'fukairi',
      content: 'そうそう！3日経つと元の組み合わせに戻っちゃうんだよね。\n周期的なパターンになって、特定の人に偏りがちだった。',
    },
    {
      id: 'msg-001-7',
      characterId: 'asairi',
      content: 'なるほど〜！それでランダムにシャッフルできる機能が欲しくなったんだね！',
    },
    {
      id: 'msg-001-8',
      characterId: 'fukairi',
      content: 'うん。ランダムだけじゃなくて、公平性も大事でね。\n誰かに偏らず、みんなが平等に担当できるアプリを作りたかったんだ。',
    },
  ],
  detailContent: `ローストプラスは、担当表運用の課題を解決するために生まれました。

## 従来の課題

6人で掃除・ローストの担当を回していましたが、以下の問題がありました：

- **固定的なシャッフルルール**: 2列3行の担当表を「左は上に、右は下に」というルールでシャッフルしていた
- **周期問題**: 3日後には同じペアの組み合わせに戻ってしまう
- **偏りの発生**: 特定の人が同じ担当になりやすかった

## ローストプラスで解決

これらの課題を解決するため、ローストプラスでは以下の機能を実装しました：

- **ランダムシャッフル**: 予測できないランダムな組み合わせを生成
- **公平性の担保**: 誰かに偏ることなく、平等に担当を割り振る仕組み

マンネリ化した担当表を解決するアプリとして開発がスタートしました。`,
  tags: ['開発背景', 'コンセプト', '担当表'],
  publishedAt: '2026-01-16',
  order: 1,
};
