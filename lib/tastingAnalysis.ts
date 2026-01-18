import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

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

// テイスティング分析のレスポンス型定義
interface TastingAnalysisResponse {
    status: 'success' | 'error';
    text: string;
    message?: string;
}

export async function analyzeTastingSession(data: SessionInfo) {
    try {
        const analyzeFunction = httpsCallable<SessionInfo, TastingAnalysisResponse>(
            functions,
            'analyzeTastingSession'
        );
        const result = await analyzeFunction(data);
        return result.data;
    } catch (error) {
        console.error('Firebase Function Error:', error);
        return {
            status: 'error',
            message: 'Failed to generate analysis',
            text: '申し訳ありません。AI分析中にエラーが発生しました。',
        };
    }
}
