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

マンネリ化した担当表に新しい風を吹き込むアプリとして開発がスタートしました。`,
    tags: ['開発背景', 'コンセプト', '担当表'],
    publishedAt: '2026-01-16',
    order: 1,
  },
  {
    id: 'episode-002',
    title: 'バイブコーディングとは？',
    subtitle: 'AIと一緒にアプリを作る新しい方法',
    imageUrl: '/dev-stories/vibe_coding.png',
    dialogues: [
      {
        id: 'msg-002-1',
        characterId: 'asairi',
        content: '「バイブコーディング」って最近聞くけど、何のこと？',
      },
      {
        id: 'msg-002-2',
        characterId: 'fukairi',
        content: 'AIと会話しながらアプリを作る新しい方法だよ。',
      },
      {
        id: 'msg-002-3',
        characterId: 'asairi',
        content: '会話でアプリが作れるってどういうこと？魔法みたい！',
      },
      {
        id: 'msg-002-4',
        characterId: 'fukairi',
        content: '「こんな機能が欲しい」って言葉で伝えると、AIがプログラムのコードを書いてくれるんだ。',
      },
      {
        id: 'msg-002-5',
        characterId: 'asairi',
        content: 'えっ、プログラミング言語を覚えなくてもいいの？',
      },
      {
        id: 'msg-002-6',
        characterId: 'fukairi',
        content: 'そうなんだ。だから「バイブ」＝雰囲気やイメージで伝えるっていう意味なんだよ。',
      },
      {
        id: 'msg-002-7',
        characterId: 'asairi',
        content: 'へー！このローストプラスもそうやって作ったの？',
      },
      {
        id: 'msg-002-8',
        characterId: 'fukairi',
        content: '実はローストプラスは、ほぼ全部バイブコーディングで作ったんだよ。',
      },
      {
        id: 'msg-002-9',
        characterId: 'asairi',
        content: 'えっ、このアプリ全部！？信じられない！',
      },
      {
        id: 'msg-002-10',
        characterId: 'fukairi',
        content: '「担当表をシャッフルする機能が欲しい」みたいに伝えるだけで、形になっていくんだ。',
      },
      {
        id: 'msg-002-11',
        characterId: 'asairi',
        content: 'どんなAIツールを使ってるの？',
      },
      {
        id: 'msg-002-12',
        characterId: 'fukairi',
        content: 'メインはCursorっていうツールで、他にもCodex、Antigravity、最近はClaude Codeにも挑戦中なんだ。',
      },
      {
        id: 'msg-002-13',
        characterId: 'asairi',
        content: 'そんなにたくさん！使い分けてるの？',
      },
      {
        id: 'msg-002-14',
        characterId: 'fukairi',
        content: 'うん。ツールによって得意なことが違うから、場面に合わせて選んでるよ。',
      },
      {
        id: 'msg-002-15',
        characterId: 'asairi',
        content: 'すごい便利そう！でも難しいこともある？',
      },
      {
        id: 'msg-002-16',
        characterId: 'fukairi',
        content: 'あるよ。AIに意図を正確に伝えるのが難しいし、思った通りにならないことも多い。\n何度もやり直す根気が必要なんだ。',
      },
      {
        id: 'msg-002-17',
        characterId: 'fukairi',
        content: 'あと、AIが書いたコードを理解せずに使うと、セキュリティの問題が起きることもある。\n注意が必要だよ。',
      },
      {
        id: 'msg-002-18',
        characterId: 'asairi',
        content: 'なるほど！便利だけど、ちゃんと向き合う姿勢が大事なんだね。',
      },
      {
        id: 'msg-002-19',
        characterId: 'fukairi',
        content: 'そうだね。でも挑戦する価値は十分あると思うよ！\nアイデアを形にする敷居がぐっと下がったからね。',
      },
    ],
    detailContent: `バイブコーディングは、AIとの対話でアプリを作る新しいプログラミング手法です。

## バイブコーディングとは

**バイブコーディング**とは、プログラミング言語を使わず、自然な言葉でAIに「こんな機能が欲しい」と伝えてコードを生成してもらう開発方法です。

「バイブ（Vibe）」は英語で「雰囲気」や「感覚」という意味。細かい技術的な指示ではなく、**やりたいことのイメージを伝えるだけ**でアプリが作れることから、この名前がつきました。

## 従来のプログラミングとの違い

| 従来のプログラミング | バイブコーディング |
|---------------------|-------------------|
| プログラミング言語を習得する必要がある | 自然な言葉で伝えるだけ |
| コードを1行ずつ書く | AIがコードを生成 |
| エラーを自分で解決 | AIと一緒に解決 |
| 学習に長い時間がかかる | すぐに始められる |

## メリット

- **プログラミング経験がなくてもアプリが作れる**
- **アイデアを素早く形にできる**
- **試行錯誤のスピードが格段に上がる**

## ローストプラスで使っているAIツール

| ツール | 特徴 | このアプリでの使い方 |
|--------|------|---------------------|
| **Cursor** | AIエディタのパイオニア | メインの開発ツールとして日常的に使用 |
| **Codex** | OpenAI製・高い推論力 | 複雑なバックエンド機能の修正 |
| **Antigravity** | 最新のAI系IDE | フロントエンド改善、シャッフルロジック改善 |
| **Claude Code** | ターミナルベースの対話型 | 最近挑戦中の新しいツール |

それぞれのツールには得意分野があり、場面に合わせて使い分けています。

## デメリット・注意点

バイブコーディングは便利ですが、難しさや注意点もあります：

- **適切な指示を出す難しさ**: AIに意図を正確に伝えるスキルが必要
- **根気が必要**: 思い通りにならないことも多く、何度もやり直すことがある
- **評価力が必要**: AIの提案が正しいかどうか判断する力が求められる
- **セキュリティリスク**: 理解せずにコードを採用すると、危険な場合がある

**大切なのは、AIに任せきりにせず、一緒に作っていく姿勢です。**

## このアプリでの実例

ローストプラスでは、以下の機能がバイブコーディングで作られました：

- 担当表シャッフル機能
- 試飲感想記録機能
- この「開発秘話」ページ自体も！

非エンジニアでも、アイデアがあれば形にできる時代になりました。`,
    tags: ['バイブコーディング', 'AI', '開発手法'],
    publishedAt: '2026-01-16',
    order: 2,
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
