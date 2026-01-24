/**
 * James Hoffmann Ultimate V60 Technique の文言定義
 *
 * 参考: https://honestcoffeeguide.com/brew-recipes/james-hoffmann-v60/
 * 2007年ワールドバリスタチャンピオンのJames Hoffmann氏が考案した手法
 */

export const RECIPE_HOFFMANN_TITLE = 'James Hoffmann V60';

/**
 * レシピ一覧で表示する短い説明文（RecipeListのpurposeフィールドで使用）
 */
export const RECIPE_HOFFMANN_PURPOSE = '世界チャンピオン考案の「ゆすり＆かき混ぜ」でクリアな味わいを引き出す手法';

/**
 * 開始前説明モーダル用のセクション
 */
export const RECIPE_HOFFMANN_DESCRIPTION_SECTIONS = [
    {
        title: 'コンセプト',
        content: 'ドリッパーを回す「ゆすり」とスプーンでの「かき混ぜ」を活用し、コーヒー粉を均一に抽出。クリアでバランスの取れた甘みのある味わいを目指します。',
        icon: 'target',
    },
    {
        title: '基本ルール',
        content: '比率は1:16.67（豆15g:湯250g）。蒸らしで豆の2倍の湯を注ぎ、45秒待ってからメイン注湯を開始します。',
        icon: 'rule',
    },
    {
        title: '抽出のポイント',
        content: '【重要】「ゆすり」（ドリッパーを回して渦を作る）と「かき混ぜ」（スプーンで軽く混ぜる）が鍵です。最後のゆすりで粉を壁から落とし、平らな粉面を作ります。',
        icon: 'swirl',
    },
    {
        title: '抽出条件',
        content: '・湯温：100°C（沸騰直後）- 浅煎りの場合\n・湯温：92-95°C（15-20秒冷ます）- 深煎りの場合\n・挽き目：中細挽き\n・総抽出時間：約3分30秒',
        icon: 'thermometer',
    },
];

/**
 * 全ステップ共通の短文ヒント（Runnerのヒント枠で使用）
 */
export const RECIPE_HOFFMANN_COMMON_NOTE =
    'ゆすり＝ドリッパーを回して渦を作る、かき混ぜ＝スプーンで軽く混ぜる';

/**
 * ステップ別の説明テンプレート（詳細ガイド用）
 */
export const RECIPE_HOFFMANN_STEP_DETAILS = {
    bloom: {
        title: '蒸らし',
        technique: 'ゆすりで均一に湿らせる',
        description: '中心から外側へ螺旋状にお湯を注ぎ、全ての粉を均一に湿らせます。',
        tips: [
            '豆の量の2倍のお湯を使用（例: 15g → 30g）',
            '注ぎ終わったらドリッパーを軽く回してゆする',
            'ガスを十分に放出させるため45秒待機',
        ],
        icon: 'bloom',
    },
    pour1: {
        title: '第1注湯（メイン）',
        technique: '60%まで一気に',
        description: '総湯量の60%になるまで中心から外側へ注ぎます。',
        tips: [
            '45秒〜1分15秒の間に完了を目指す',
            '中心から外側へ螺旋状に注ぐ',
            'ペーパーに直接お湯がかからないよう注意',
        ],
        icon: 'pour',
    },
    pour2: {
        title: '第2注湯（仕上げ）',
        technique: '残り40%をゆっくり',
        description: '残りの40%を少しゆっくり、優しく注ぎます。',
        tips: [
            '1分15秒〜1分45秒の間に完了を目指す',
            '水位を維持しながら少しずつ注ぐ',
            '注ぎ終わったら次のステップへ',
        ],
        icon: 'pour',
    },
    stir: {
        title: 'かき混ぜ',
        technique: '両方向に軽く1回ずつ',
        description: 'スプーンで時計回り、反時計回りにそれぞれ1回ずつ軽くかき混ぜます。',
        tips: [
            '壁についた粉を落とすのが目的',
            '強く混ぜすぎない（渦を作らない）',
            'かき混ぜ後、少し落ち切るのを待つ',
        ],
        icon: 'stir',
    },
    swirl: {
        title: 'ゆすり',
        technique: 'ドリッパーを優しく回す',
        description: 'ドリッパーを持ち上げて2〜3回優しく回し、平らな粉面を作ります。',
        tips: [
            '壁に残った粉を落とす',
            '平らな粉面を目指す',
            '平ら＝均一な抽出の証',
        ],
        icon: 'swirl',
    },
    drawdown: {
        title: '落ち切り待ち',
        technique: '約3:30で完了',
        description: '全てのお湯が落ち切るのを待ちます。',
        tips: [
            '目標は3分30秒前後で完了',
            '早すぎる→次回は少し細かく挽く',
            '遅すぎる→次回は少し粗く挽く',
        ],
        icon: 'timer',
    },
} as const;
