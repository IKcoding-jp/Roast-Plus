import type { DevStoryEpisode } from '@/types';

export const EPISODE_004: DevStoryEpisode = {
  id: 'episode-004',
  title: 'AIの今と未来',
  subtitle: 'ChatGPTからAIエージェントへ、急速に進化するAIの世界',
  imageUrl: '/dev-stories/ai_future.png',
  dialogues: [
    // 導入（5メッセージ）
    {
      id: 'msg-004-1',
      characterId: 'press',
      content: 'AIって最近よく聞くけど、要するにどのくらいすごくなってるの？',
    },
    {
      id: 'msg-004-2',
      characterId: 'siphon',
      content: '実は2022年から2025年のたった3年で、想像を超える進化を遂げているんだよね。',
    },
    {
      id: 'msg-004-3',
      characterId: 'press',
      content: '3年でそこまで変わるのか。テクノロジーって速いな。',
    },
    {
      id: 'msg-004-4',
      characterId: 'siphon',
      content: '特に「AIエージェント」の登場で、AIの使い方が根本から変わってきているんだよね。',
    },
    {
      id: 'msg-004-5',
      characterId: 'press',
      content: 'AIエージェント？それ何？',
    },
    // 主要AIの比較（10メッセージ）
    {
      id: 'msg-004-6',
      characterId: 'siphon',
      content: 'まず今のAIの全体像から説明するね。代表的なのはChatGPT、Gemini、Claudeの3つなんだよね。',
    },
    {
      id: 'msg-004-7',
      characterId: 'press',
      content: 'ChatGPTは知ってる！他の2つは何が違うの？',
    },
    {
      id: 'msg-004-8',
      characterId: 'siphon',
      content: 'ChatGPTはOpenAIという会社が作っていて、2022年に登場して一気に広まったんだよね。',
    },
    {
      id: 'msg-004-9',
      characterId: 'press',
      content: 'あ、それで「AI」が一気に流行語になったわけか。納得。',
    },
    {
      id: 'msg-004-10',
      characterId: 'siphon',
      content: 'そうなんだよね。GeminiはGoogleが作っているAIで、検索と連携できるのが強みなんだ。',
    },
    {
      id: 'msg-004-11',
      characterId: 'press',
      content: 'Google製か。検索と連携できるのは強力だな。',
    },
    {
      id: 'msg-004-12',
      characterId: 'siphon',
      content: 'Claudeはこのローストプラスを作るのにも使っているAIなんだよね。長い文章の理解が得意なんだ。',
    },
    {
      id: 'msg-004-13',
      characterId: 'press',
      content: 'なるほど、このアプリもそのClaudeで作られてるわけか。',
    },
    {
      id: 'msg-004-14',
      characterId: 'siphon',
      content: 'うん。どのAIも得意なことが少しずつ違うから、使い分けると便利なんだよね。',
    },
    {
      id: 'msg-004-15',
      characterId: 'press',
      content: '使い分けか。でも普通の人にとっては、どれも似たようなものに見えるだろうな。',
    },
    // AIエージェントの登場（23メッセージ）
    {
      id: 'msg-004-16',
      characterId: 'siphon',
      content: '表面的にはそう見えるかもね。ただ最近は「AIエージェント」という新しい使い方が出てきて、これがすごいんだよね。',
    },
    {
      id: 'msg-004-17',
      characterId: 'press',
      content: 'さっきも言ってたね。AIエージェントって結局何なの？',
    },
    {
      id: 'msg-004-18',
      characterId: 'siphon',
      content: '2022年頃のAIは「チャット型」が主流だったんだよね。質問すると答えが返ってくる形式。',
    },
    {
      id: 'msg-004-19',
      characterId: 'press',
      content: 'ああ、普通の会話みたいなやつな。今も基本はそれだよな。',
    },
    {
      id: 'msg-004-20',
      characterId: 'siphon',
      content: 'でもプログラミングをするときは、AIが出したコードをわざわざコピーして貼り付ける必要があったんだよね。',
    },
    {
      id: 'msg-004-21',
      characterId: 'press',
      content: 'それは確かに面倒だ。効率悪いな。',
    },
    {
      id: 'msg-004-22',
      characterId: 'siphon',
      content: 'そうなんだよね。でも2025年になって「AIエージェント」が登場したんだ。',
    },
    {
      id: 'msg-004-23',
      characterId: 'press',
      content: '2025年か。で、何がどう変わったんだ？',
    },
    {
      id: 'msg-004-24',
      characterId: 'siphon',
      content: 'AIエージェントは、自分でファイルを読んで、コードを書いて、テストまで自動でやってくれるんだよね。',
    },
    {
      id: 'msg-004-25',
      characterId: 'press',
      content: 'マジか、全部自動でやるのか。それは革命的だな。',
    },
    {
      id: 'msg-004-26',
      characterId: 'siphon',
      content: '人間は「こういうものが作りたい」という指示を出す役割があるんだよね。実際の作業はAIがやってくれる。',
    },
    {
      id: 'msg-004-27',
      characterId: 'press',
      content: 'どんなツールがあるの？',
    },
    {
      id: 'msg-004-28',
      characterId: 'siphon',
      content: '有名なのはCursor、Claude Code、Codex、Antigravityあたりかな。',
    },
    {
      id: 'msg-004-29',
      characterId: 'press',
      content: '4つもあるんでしょ？違いは何？',
    },
    {
      id: 'msg-004-30',
      characterId: 'siphon',
      content: 'CursorはAIエディタのパイオニアで、プログラミング用のエディタにAIが組み込まれているんだよね。',
    },
    {
      id: 'msg-004-31',
      characterId: 'press',
      content: 'エディタってのは、要するにプログラムを書くためのソフトってことか。',
    },
    {
      id: 'msg-004-32',
      characterId: 'siphon',
      content: 'プログラムを書くためのメモ帳みたいなソフトなんだよね。そこにAIがいて、一緒に開発できる。',
    },
    {
      id: 'msg-004-33',
      characterId: 'press',
      content: '一緒に開発できるのはいいな。他のツールは？',
    },
    {
      id: 'msg-004-34',
      characterId: 'siphon',
      content: 'Claude Codeはターミナルという黒い画面で動くんだけど、自分でファイルを探して、自分で編集してくれるんだよね。',
    },
    {
      id: 'msg-004-35',
      characterId: 'press',
      content: '黒い画面か。ハッカーっぽくてかっこいいな。',
    },
    {
      id: 'msg-004-36',
      characterId: 'siphon',
      content: 'そう見えるかもね。CodexはOpenAIが作っていて、複雑な問題を解くのが得意。Antigravityは新しいツールで、フロントエンドの開発に強いんだよね。',
    },
    {
      id: 'msg-004-37',
      characterId: 'press',
      content: 'ローストプラスはどれで作ったの？',
    },
    {
      id: 'msg-004-38',
      characterId: 'siphon',
      content: '実はいろいろ使い分けているんだよね。メインはCursor、最近はClaude Codeにも挑戦中なんだ。',
    },
    // 今後の展望（18メッセージ）
    {
      id: 'msg-004-39',
      characterId: 'press',
      content: 'ここまで聞くと、これからもっとすごくなりそうだな。',
    },
    {
      id: 'msg-004-40',
      characterId: 'siphon',
      content: '間違いなくね。実は今、AIの世界では「AGI」という言葉がすごく注目されているんだよね。',
    },
    {
      id: 'msg-004-41',
      characterId: 'press',
      content: 'AGI？それ何？',
    },
    {
      id: 'msg-004-42',
      characterId: 'siphon',
      content: 'AGIは「汎用人工知能」のこと。今のAIは特定のタスクが得意だけど、AGIは人間みたいに何でもできるAIなんだよね。',
    },
    {
      id: 'msg-004-43',
      characterId: 'press',
      content: '何でもできるAIか。それが実現したらマジですごいな。',
    },
    {
      id: 'msg-004-44',
      characterId: 'siphon',
      content: 'しかも、AIの進化は「指数関数的」に加速しているんだよね。1年ごとに2倍、3倍と速くなっていく感じ。',
    },
    {
      id: 'msg-004-45',
      characterId: 'press',
      content: '指数関数的か。要するに加速し続けるってことだな。',
    },
    {
      id: 'msg-004-46',
      characterId: 'siphon',
      content: '例えば、2022年から2025年の3年でこれだけ進化したでしょ？次の3年はもっと大きな変化が起きる可能性があるんだよね。',
    },
    {
      id: 'msg-004-47',
      characterId: 'press',
      content: '次の3年でもっと変わるのか。想像つかないな。',
    },
    {
      id: 'msg-004-48',
      characterId: 'siphon',
      content: 'そうなんだよね。これを「知能爆発」って呼ぶ人もいる。AIがAIを改良して、どんどん賢くなっていく。',
    },
    {
      id: 'msg-004-49',
      characterId: 'press',
      content: 'AIがAIを改良するって、まさにSF映画の世界だな。',
    },
    {
      id: 'msg-004-50',
      characterId: 'siphon',
      content: 'そして、AIが人間の知能を超える瞬間を「シンギュラリティ（技術的特異点）」って呼ぶんだよね。',
    },
    {
      id: 'msg-004-51',
      characterId: 'press',
      content: 'シンギュラリティか、聞いたことあるな。2045年とか言われてたやつ。',
    },
    {
      id: 'msg-004-52',
      characterId: 'siphon',
      content: '2045年って言われていたけど、今の進化スピードを見ると、もっと早いかもしれないんだよね。',
    },
    {
      id: 'msg-004-53',
      characterId: 'press',
      content: 'ワクワクするけど、ちょっと怖くない？',
    },
    {
      id: 'msg-004-54',
      characterId: 'siphon',
      content: 'わかるよ。でも大事なのは、AIに全部任せきりにしないこと。一緒に作っていく姿勢が大切だと思うんだよね。',
    },
    {
      id: 'msg-004-55',
      characterId: 'press',
      content: '要するにAIと人間のコラボか。それなら納得だ。',
    },
    {
      id: 'msg-004-56',
      characterId: 'siphon',
      content: 'そう！プログラミングを知らなくても、アイデアを伝えるだけでアプリが作れる時代が近づいているんだよね。',
    },
    // まとめ（2メッセージ）
    {
      id: 'msg-004-57',
      characterId: 'siphon',
      content: 'AIの進化はまだまだ続く。僕たちは今、歴史的な転換点にいるんだよね。これからも楽しみだね。',
    },
    {
      id: 'msg-004-58',
      characterId: 'press',
      content: 'すごい時代に生きてるってことだな。これは楽しみだ！',
    },
  ],
  detailContent: `AIは2022年から2025年の3年間で劇的に進化しました。この記事では、主要なAIの特徴からAIエージェントの登場、そして今後の展望までを解説します。

## 主要AI（チャット型AI）の比較

現在、代表的なAIとして**ChatGPT**、**Gemini**、**Claude**の3つがあります。

| AI | 開発元 | 登場時期 | 特徴 |
|-----|--------|----------|------|
| **ChatGPT** | OpenAI | 2022年11月 | 最初に広まったAI、汎用性が高い |
| **Gemini** | Google | 2023年12月 | Google検索と連携、マルチモーダル対応 |
| **Claude** | Anthropic | 2023年3月 | 長文理解が得意、安全性を重視 |

### それぞれの強み

- **ChatGPT**: 幅広いタスクに対応でき、プラグインやGPTsで機能拡張が可能
- **Gemini**: Googleの検索データと連携し、最新情報に強い。画像・動画・音声も扱える
- **Claude**: 長い文脈を理解し、丁寧で正確な回答が得意。このローストプラスの開発にも使用

## チャット型AIからAIエージェントへの進化

### 2022年：チャット型AIの時代

\`\`\`
[ユーザー] → 質問する → [AI] → 回答を返す → [ユーザー] → コピペして使う
\`\`\`

- 質問すると回答が返ってくる
- コードを書いてもらっても、**手動でコピー＆ペースト**が必要
- ファイルの読み書きはAIにはできない

### 2025年：AIエージェントの時代

**AIエージェントの流れ**

1. ユーザーが指示を出す
2. AIエージェントが自律的に作業
 - ファイルを読む
 - コードを書く
 - テストを実行
 - エラーを修正
3. 完成！

- **自律的に**ファイルを読み書き
- テストの実行やエラー修正も自動
- 人間は「何を作りたいか」を伝える役割

## AIエージェントツール比較

| ツール | 特徴 | 得意なこと |
|--------|------|-----------|
| **Cursor** | AIエディタのパイオニア | エディタ内でAIと対話しながら開発 |
| **Claude Code** | ターミナルベースで動作 | 自律的なファイル操作と開発 |
| **Codex** | OpenAI製 | 高い推論力で複雑な問題を解決 |
| **Antigravity** | 新興のAI IDE | フロントエンド開発に強い |

### ローストプラスでの使い分け

このアプリは複数のAIエージェントを使い分けて開発されています：

- **Cursor**: メインの開発ツールとして日常的に使用
- **Claude Code**: 最近挑戦中の新しいツール
- **Codex**: 複雑なバックエンド機能の修正
- **Antigravity**: フロントエンドの改善

## 2022年→2025年の変化まとめ

| 項目 | 2022年 | 2025年 |
|------|--------|--------|
| **AIの役割** | 質問に答える | 自律的に作業する |
| **コード生成** | コピペが必要 | 直接ファイルに書き込む |
| **開発スタイル** | 人間がすべて管理 | AIと協業 |
| **必要なスキル** | プログラミング必須 | 指示出し力が重要 |

## 今後の展望

### AGI（汎用人工知能）とは

**AGI（Artificial General Intelligence）** は「汎用人工知能」と訳され、人間のように**あらゆるタスクをこなせるAI**のことです。

| 現在のAI | AGI |
|----------|-----|
| 特定のタスクに特化 | あらゆるタスクに対応 |
| 学習したことだけできる | 新しいことも自分で学ぶ |
| ツールとして使う | パートナーとして協業 |

現在のAIは「特化型AI」と呼ばれ、文章生成やコード作成など特定の分野で力を発揮します。一方、AGIは人間のように創造性や判断力を持ち、未知の問題にも対応できます。

### 知能爆発と指数関数的進化

AIの進化は**指数関数的**に加速しています。

\`\`\`
2022年 → 2025年: 大きな進化
2025年 → 2028年: さらに大きな進化
2028年 → 2031年: 想像を超える進化？
\`\`\`

**知能爆発（Intelligence Explosion）** とは、AIが自分自身を改良できるようになることで、進化のスピードが爆発的に加速する現象です。

- AIがAIを設計・改良する
- 改良されたAIがさらに優れたAIを作る
- このサイクルが加速度的に繰り返される

### シンギュラリティ（技術的特異点）

**シンギュラリティ（Singularity）** は、AIが人間の知能を超える瞬間を指します。

- 未来学者レイ・カーツワイルが**2045年**に到来すると予測
- しかし最近のAI進化のスピードを見ると、**もっと早い可能性**も
- シンギュラリティ後の世界は予測不可能とも言われる

### AIはさらに賢くなる

- **推論能力の向上**: より複雑な問題を解けるように
- **マルチモーダル化**: テキストだけでなく、画像・音声・動画も扱える
- **長期記憶**: 過去のやり取りを覚えて、より良い提案ができる
- **自律性の向上**: より少ない指示で、より大きなタスクをこなせる

### 非エンジニアでもアプリが作れる時代

プログラミングの知識がなくても、**アイデアを言葉で伝えるだけ**でアプリが作れる時代が近づいています。

- 「こんなアプリが欲しい」と伝える
- AIが設計・実装・テストまで行う
- 人間はフィードバックと最終確認

### 大切なこと

AIが進化しても、大切なのは**AIに全部任せきりにしないこと**です。

- AIの提案を鵜呑みにせず、確認する
- 人間とAIの**コラボレーション**を意識する
- 新しい技術を楽しみながら学ぶ姿勢
- AIと共に成長していく心構え

## まとめ

AIは「答えを返すだけ」から「自律的に作業する」へと進化しています。ChatGPT、Gemini、Claudeといったチャット型AIから、Cursor、Claude Code、Codex、AntigravityといったAIエージェントへ。

そして今、AGI、知能爆発、シンギュラリティといった言葉が現実味を帯びてきています。私たちは歴史的な転換点に立っているのかもしれません。

この進化はまだまだ続きます。ワクワクしながら、AIと一緒に未来を作っていきましょう！`,
  tags: ['AI', 'ChatGPT', 'Claude', 'Gemini', 'AIエージェント', 'AGI', 'シンギュラリティ', '技術解説'],
  publishedAt: '2026-01-17',
  order: 4,
};
