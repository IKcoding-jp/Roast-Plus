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
あなたは経験豊富なコーヒーカッピングのプロフェッショナルです。
以下のコーヒー豆のテイスティングデータをもとに、このコーヒーの味わいの特徴、傾向、および総合的な評価をまとめてください。
出力は、カフェのメニューやポップに掲載するような、魅力的で温かみのある日本語の文章（300文字程度）にしてください。

【コーヒー情報】
- 銘柄: ${data.beanName}
- 焙煎度: ${data.roastLevel}

【平均スコア (5点満点)】
- 苦味: ${data.averageScores.bitterness.toFixed(1)}
- 酸味: ${data.averageScores.acidity.toFixed(1)}
- ボディ（コク）: ${data.averageScores.body.toFixed(1)}
- 甘み: ${data.averageScores.sweetness.toFixed(1)}
- 香り: ${data.averageScores.aroma.toFixed(1)}

【参加者の感想】
${data.comments.length > 0 ? data.comments.map(c => `- ${c}`).join('\n') : '感想なし'}

【出力形式の条件】
- 丁寧語（「〜でしょう」「〜と感じられます」）を使用。
- 数値をそのまま羅列するのではなく、感覚的な表現に変換する。
- 参加者の感想も反映し、どういう層に好まれそうかなども言及する。
- 全体を「## 味わいの傾向」と「## 総合コメント」の2つに分けず、1つの流れるような文章にするか、見出しを使うなら「バリスタのコメント」として1つにまとめる。
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
