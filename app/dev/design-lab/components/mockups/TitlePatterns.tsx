'use client';

import { useEffect, useState } from 'react';

/**
 * タイトルデザインモック 10パターン
 * Issue #208: ホーム画面「RoastPlus」タイトルテキストのデザイン改善
 * 採用: Pattern 7 (Josefin Sans)
 */

interface TitlePattern {
  id: number;
  font: string;
  weight: string;
  description: string;
  adopted: boolean;
}

const titlePatterns: TitlePattern[] = [
  { id: 1, font: 'Playfair Display', weight: 'Bold', description: 'クラシック・エレガント / セリフ体で高級感', adopted: false },
  { id: 2, font: 'Cormorant Garamond', weight: 'SemiBold', description: 'ラグジュアリー・繊細 / クリーム × ゴールド配色', adopted: false },
  { id: 3, font: 'Lora', weight: 'Bold + Italic', description: '温かみ・読みやすさ / 「Plus」イタリック', adopted: false },
  { id: 4, font: 'Cinzel', weight: 'Black (900)', description: '力強い・伝統的 / オールキャップス・広い字間', adopted: false },
  { id: 5, font: 'Raleway', weight: 'Light + Bold', description: 'モダン・クリーン / 細×太のコントラスト', adopted: true },
  { id: 6, font: 'Montserrat', weight: 'ExtraBold (800)', description: '安定・プロフェッショナル / オレンジグロー効果', adopted: false },
  { id: 7, font: 'Josefin Sans', weight: 'Light + SemiBold', description: 'スタイリッシュ・軽やか / 大文字・広い字間', adopted: false },
  { id: 8, font: 'Bebas Neue', weight: 'Regular', description: 'インパクト・大胆 / コンデンスド体', adopted: false },
  { id: 9, font: 'Libre Baskerville', weight: 'Bold + Italic', description: '知的・洗練 / アンダーライン付き', adopted: false },
  { id: 10, font: 'DM Serif Display', weight: 'Regular + Italic', description: 'レトロ・印象的 / オレンジグロー効果', adopted: false },
];

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Cormorant+Garamond:wght@600;700&family=Lora:ital,wght@0,700;1,400&family=Cinzel:wght@900&family=Raleway:wght@300;700&family=Montserrat:wght@800;900&family=Bebas+Neue&family=Libre+Baskerville:ital,wght@0,700;1,400&family=DM+Serif+Display:ital@0;1&display=swap';

// パターンごとのスタイル定義
const patternStyles: Record<number, { containerClass: string; roast: string; roastText: string; plus: string; plusText: string }> = {
  1: {
    containerClass: '',
    roast: 'font-bold tracking-tight text-white',
    roastText: 'Roast',
    plus: 'text-[#EF8A00] ml-0.5',
    plusText: 'Plus',
  },
  2: {
    containerClass: '',
    roast: 'font-semibold tracking-widest text-[#f5e6d3]',
    roastText: 'Roast',
    plus: 'text-[#c8944a] font-bold ml-1',
    plusText: 'Plus',
  },
  3: {
    containerClass: '',
    roast: 'font-bold text-white',
    roastText: 'Roast',
    plus: 'text-[#EF8A00] italic ml-0.5',
    plusText: 'Plus',
  },
  4: {
    containerClass: '',
    roast: 'font-black tracking-[0.12em] uppercase text-white',
    roastText: 'Roast',
    plus: 'text-[#d4a574] ml-1.5',
    plusText: 'Plus',
  },
  5: {
    containerClass: '',
    roast: 'font-light tracking-[0.15em] text-white',
    roastText: 'Roast',
    plus: 'text-[#EF8A00] font-bold ml-1',
    plusText: 'Plus',
  },
  6: {
    containerClass: '',
    roast: 'font-extrabold tracking-tight text-white',
    roastText: 'Roast',
    plus: 'text-[#EF8A00] font-black ml-0.5',
    plusText: 'Plus',
  },
  7: {
    containerClass: '',
    roast: 'font-light tracking-[0.2em] uppercase text-[#e8ddd0]',
    roastText: 'Roast',
    plus: 'text-[#EF8A00] font-semibold ml-1.5',
    plusText: 'Plus',
  },
  8: {
    containerClass: '',
    roast: 'tracking-wider uppercase text-white',
    roastText: 'Roast',
    plus: 'text-[#EF8A00] ml-1',
    plusText: 'Plus',
  },
  9: {
    containerClass: '',
    roast: 'font-bold text-white',
    roastText: 'Roast',
    plus: 'text-[#EF8A00] italic font-normal ml-0.5',
    plusText: 'Plus',
  },
  10: {
    containerClass: '',
    roast: 'text-white',
    roastText: 'Roast',
    plus: 'text-[#EF8A00] italic ml-0.5',
    plusText: 'Plus',
  },
};

function TitlePreview({ pattern }: { pattern: TitlePattern }) {
  const style = patternStyles[pattern.id];
  const fontFamily = pattern.id === 5
    ? 'var(--font-raleway)'
    : `'${pattern.font}', ${pattern.id <= 4 || pattern.id >= 9 ? 'serif' : 'sans-serif'}`;

  return (
    <div
      className={`relative rounded-xl overflow-hidden border transition-all ${
        pattern.adopted
          ? 'border-spot shadow-[0_0_20px_rgba(239,138,0,0.15)]'
          : 'border-edge'
      }`}
    >
      {/* Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="bg-spot text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
          {pattern.id}
        </span>
        {pattern.adopted && (
          <span className="bg-spot/20 text-spot text-xs font-semibold px-2 py-0.5 rounded-full border border-spot/30">
            採用中
          </span>
        )}
      </div>

      {/* Preview */}
      <div className="bg-[rgba(38,26,20,0.98)] flex items-center justify-center min-h-[80px] py-6 px-6">
        <span
          className={`text-2xl ${style.roast}`}
          style={{ fontFamily }}
        >
          {style.roastText}
          <span className={style.plus}>{style.plusText}</span>
        </span>
      </div>

      {/* Info */}
      <div className="bg-[#1a1310] border-t border-white/5 px-4 py-3">
        <div className="text-sm font-semibold text-spot">
          {pattern.font} — {pattern.weight}
        </div>
        <div className="text-xs text-ink-muted mt-0.5">
          {pattern.description}
        </div>
      </div>
    </div>
  );
}

export default function TitlePatterns() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Design Lab用: 比較表示のためGoogle Fonts CDNから追加フォントを読み込み
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = GOOGLE_FONTS_URL;
    link.onload = () => setFontsLoaded(true);
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink mb-1">
          ホームヘッダー タイトルデザインモック
        </h2>
        <p className="text-sm text-ink-sub">
          Issue #208: 10パターンから A/B テストで Pattern 5 (Raleway) を採用。
        </p>
      </div>

      {!fontsLoaded && (
        <div className="text-sm text-ink-muted animate-pulse">
          フォントを読み込み中...
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {titlePatterns.map((p) => (
          <TitlePreview key={p.id} pattern={p} />
        ))}
      </div>
    </div>
  );
}
