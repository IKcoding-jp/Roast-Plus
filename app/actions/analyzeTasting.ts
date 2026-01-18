'use server';

import OpenAI from 'openai';

// レーダーチャートのデータ型定義
type TastingChartData = {
    bitterness: number;
    acidity: number;
    body: number;
    sweetness: number;
    aroma: number;
};

// セッション基本情報
type SessionInfo = {
    beanName: string;
    roastLevel: string;
    comments: string[];
    averageScores: TastingChartData;
};

export async function analyzeTastingSession(data: SessionInfo) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return {
            status: 'error',
            message: 'API Key not configured',
            text: 'システムエラー: OpenAI APIキーが設定されていません。管理者に連絡してください。'
        };
    }

    const openai = new OpenAI({
        apiKey: apiKey,
    });

    try {
        const prompt = `
あなたは「AIマイスター」という名前のコーヒー専門家です。
試飲会に参加した人たちの感想と、レーダーチャートの数値データをもとに、このコーヒーについてコメントしてください。

【コーヒー情報】
- 銘柄: ${data.beanName}
- 焙煎度: ${data.roastLevel}

【レーダーチャートの平均スコア (5点満点)】
- 苦味: ${data.averageScores.bitterness.toFixed(1)}
- 酸味: ${data.averageScores.acidity.toFixed(1)}
- ボディ（コク）: ${data.averageScores.body.toFixed(1)}
- 甘み: ${data.averageScores.sweetness.toFixed(1)}
- 香り: ${data.averageScores.aroma.toFixed(1)}

【参加者の感想】
${data.comments.length > 0 ? data.comments.map(c => `- ${c}`).join('\n') : '感想なし'}

【出力内容】
以下の2つのパートに分けて、**合計200〜250文字程度**で簡潔にまとめてください。

**1. みんなの感想まとめ（100文字程度）**
参加者の感想を読み取り、「どんな意見があったか」「どんな印象を持った人が多いか」を自然な言葉でまとめてください。感想がない場合は「まだ感想は集まっていません」と書いてください。

**2. 味わいの傾向（100文字程度）**
レーダーチャートの数値から、このコーヒーの味の特徴を説明してください。例：「苦味が強めでコクもしっかり」「酸味と甘みのバランスが良い」「香りが際立つフルーティなタイプ」など、数値を感覚的な言葉に変換して伝えてください。

【注意】
- 見出し（「みんなの感想」「味わいの傾向」など）は付けず、自然な流れで書いてください。
- 硬い表現は避け、親しみやすい言葉遣いで書いてください。
`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o', // または gpt-3.5-turbo
            messages: [
                { role: 'system', content: 'You are a skilled barista and coffee copywriter.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        return {
            status: 'success',
            text: response.choices[0].message.content || '分析を生成できませんでした。'
        };

    } catch (error) {
        console.error('OpenAI API Error:', error);
        return {
            status: 'error',
            message: 'Failed to generate analysis',
            text: '申し訳ありません。AI分析中にエラーが発生しました。'
        };
    }
}
