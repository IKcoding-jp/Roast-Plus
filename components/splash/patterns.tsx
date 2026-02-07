'use client';

// ─── スプラッシュアニメーションパターン ───

export interface PatternProps {
  phase: number;
  compact?: boolean; // プレビューカード用の小さいサイズ
}

const textSize = (compact?: boolean) =>
  compact
    ? 'text-[2rem]'
    : 'text-[3rem] sm:text-[3.8rem]';

const subTextSize = (compact?: boolean) =>
  compact
    ? 'text-[0.55rem]'
    : 'text-[0.65rem] sm:text-[0.72rem]';

const lineWidth = (compact?: boolean) =>
  compact ? 'w-12' : 'w-16';

const spacing = (compact?: boolean) =>
  compact ? 'mt-3' : 'mt-4';

// パターン1: Fade Up（現行）
// ロゴが下から浮き上がりフェードイン → ライン展開 → サブテキスト表示
function PatternFadeUp({ phase, compact }: PatternProps) {
  return (
    <div className="flex flex-col items-center">
      <h1
        className={`${textSize(compact)} font-bold tracking-[0.04em] leading-none font-[var(--font-playfair)] transition-all duration-700 ease-out ${
          phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <span className="text-white">Roast</span>
        <span className="text-[#EF8A00] ml-0.5">Plus</span>
      </h1>
      <div className={`${spacing(compact)} flex justify-center`}>
        <div
          className={`h-[2px] rounded-full transition-all duration-700 ease-out ${
            phase >= 2 ? `${lineWidth(compact)} opacity-100` : 'w-0 opacity-0'
          }`}
          style={{
            background: 'linear-gradient(90deg, transparent, #D67A00 30%, #EF8A00, #D67A00 70%, transparent)',
          }}
        />
      </div>
      <p
        className={`${spacing(compact)} ${subTextSize(compact)} tracking-[0.3em] uppercase transition-all duration-600 ease-out ${
          phase >= 3 ? 'opacity-40 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
        style={{ color: '#FFFFFF', fontWeight: 300 }}
      >
        Coffee Roasting
      </p>
    </div>
  );
}

// パターン2: Scale Breathe
// ロゴが中央から拡大しながら出現 → 微妙なスケールパルス → サブテキスト
function PatternScaleBreathe({ phase, compact }: PatternProps) {
  return (
    <div className="flex flex-col items-center">
      <h1
        className={`${textSize(compact)} font-bold tracking-[0.04em] leading-none font-[var(--font-playfair)] transition-all duration-800 ease-out ${
          phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        } ${phase >= 2 ? 'animate-[breathe_2s_ease-in-out_infinite]' : ''}`}
      >
        <span className="text-white">Roast</span>
        <span className="text-[#EF8A00] ml-0.5">Plus</span>
      </h1>
      <p
        className={`mt-4 ${subTextSize(compact)} tracking-[0.3em] uppercase transition-all duration-600 ease-out ${
          phase >= 3 ? 'opacity-40 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
        style={{ color: '#FFFFFF', fontWeight: 300 }}
      >
        Coffee Roasting
      </p>
    </div>
  );
}

// パターン3: Letter Stagger
// 文字が1文字ずつ順番にフェードインで出現
function PatternLetterStagger({ phase, compact }: PatternProps) {
  const letters = [
    { char: 'R', color: '#FFFFFF' },
    { char: 'o', color: '#FFFFFF' },
    { char: 'a', color: '#FFFFFF' },
    { char: 's', color: '#FFFFFF' },
    { char: 't', color: '#FFFFFF' },
    { char: 'P', color: '#EF8A00' },
    { char: 'l', color: '#EF8A00' },
    { char: 'u', color: '#EF8A00' },
    { char: 's', color: '#EF8A00' },
  ];

  return (
    <div className="flex flex-col items-center">
      <h1 className={`${textSize(compact)} font-bold tracking-[0.04em] leading-none font-[var(--font-playfair)] flex`}>
        {letters.map((letter, i) => (
          <span
            key={i}
            className="transition-all duration-500 ease-out inline-block"
            style={{
              color: letter.color,
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? 'translateY(0)' : 'translateY(12px)',
              transitionDelay: phase >= 1 ? `${i * 80}ms` : '0ms',
              marginLeft: i === 5 ? '4px' : '0',
            }}
          >
            {letter.char}
          </span>
        ))}
      </h1>
      <div className={`${spacing(compact)} flex justify-center`}>
        <div
          className={`h-[2px] rounded-full transition-all duration-700 ease-out ${
            phase >= 2 ? `${lineWidth(compact)} opacity-100` : 'w-0 opacity-0'
          }`}
          style={{
            background: 'linear-gradient(90deg, transparent, #D67A00 30%, #EF8A00, #D67A00 70%, transparent)',
            transitionDelay: phase >= 2 ? '400ms' : '0ms',
          }}
        />
      </div>
      <p
        className={`${spacing(compact)} ${subTextSize(compact)} tracking-[0.3em] uppercase transition-all duration-600 ease-out ${
          phase >= 3 ? 'opacity-40' : 'opacity-0'
        }`}
        style={{ color: '#FFFFFF', fontWeight: 300, transitionDelay: phase >= 3 ? '200ms' : '0ms' }}
      >
        Coffee Roasting
      </p>
    </div>
  );
}

// パターン4: Slide Reveal
// 「Roast」が左から、「Plus」が右からスライドインして中央で合流
function PatternSlideReveal({ phase, compact }: PatternProps) {
  return (
    <div className="flex flex-col items-center">
      <h1 className={`${textSize(compact)} font-bold tracking-[0.04em] leading-none font-[var(--font-playfair)] flex overflow-hidden`}>
        <span
          className={`text-white transition-all duration-700 ease-out ${
            phase >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}
        >
          Roast
        </span>
        <span
          className={`text-[#EF8A00] ml-0.5 transition-all duration-700 ease-out ${
            phase >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
          style={{ transitionDelay: phase >= 1 ? '150ms' : '0ms' }}
        >
          Plus
        </span>
      </h1>
      <div className={`${spacing(compact)} flex justify-center`}>
        <div
          className={`h-[2px] rounded-full transition-all duration-700 ease-out ${
            phase >= 2 ? `${lineWidth(compact)} opacity-100` : 'w-0 opacity-0'
          }`}
          style={{
            background: 'linear-gradient(90deg, transparent, #D67A00 30%, #EF8A00, #D67A00 70%, transparent)',
          }}
        />
      </div>
      <p
        className={`${spacing(compact)} ${subTextSize(compact)} tracking-[0.3em] uppercase transition-all duration-600 ease-out ${
          phase >= 3 ? 'opacity-40 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
        style={{ color: '#FFFFFF', fontWeight: 300 }}
      >
        Coffee Roasting
      </p>
    </div>
  );
}

// パターン5: Glow Pulse
// ロゴが暖かいグロー効果と共に出現、オレンジの発光が脈動
function PatternGlowPulse({ phase, compact }: PatternProps) {
  return (
    <div className="flex flex-col items-center">
      <h1
        className={`${textSize(compact)} font-bold tracking-[0.04em] leading-none font-[var(--font-playfair)] transition-all duration-800 ease-out ${
          phase >= 1 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          filter: phase >= 1 ? 'blur(0px)' : 'blur(8px)',
          transition: 'all 0.8s ease-out',
        }}
      >
        <span
          className="text-white"
          style={{
            textShadow: phase >= 2 ? '0 0 20px rgba(255,255,255,0.3)' : 'none',
            transition: 'text-shadow 0.6s ease-out',
          }}
        >
          Roast
        </span>
        <span
          className="ml-0.5"
          style={{
            color: '#EF8A00',
            textShadow:
              phase >= 2
                ? '0 0 20px rgba(239,138,0,0.5), 0 0 40px rgba(239,138,0,0.2)'
                : 'none',
            transition: 'text-shadow 0.6s ease-out',
          }}
        >
          Plus
        </span>
      </h1>
      <div className={`${spacing(compact)} flex justify-center`}>
        <div
          className={`h-[2px] rounded-full transition-all duration-700 ease-out ${
            phase >= 2 ? `${lineWidth(compact)} opacity-100` : 'w-0 opacity-0'
          }`}
          style={{
            background: 'linear-gradient(90deg, transparent, #D67A00 30%, #EF8A00, #D67A00 70%, transparent)',
            boxShadow: phase >= 2 ? '0 0 8px rgba(239,138,0,0.4)' : 'none',
          }}
        />
      </div>
      <p
        className={`${spacing(compact)} ${subTextSize(compact)} tracking-[0.3em] uppercase transition-all duration-600 ease-out ${
          phase >= 3 ? 'opacity-40' : 'opacity-0'
        }`}
        style={{ color: '#FFFFFF', fontWeight: 300 }}
      >
        Coffee Roasting
      </p>
    </div>
  );
}

// ─── パターン定義配列（エクスポート） ───

export const splashPatterns = [
  {
    id: 1,
    name: 'Fade Up',
    description: '下から浮き上がりフェードイン（現行）',
    Component: PatternFadeUp,
  },
  {
    id: 2,
    name: 'Scale Breathe',
    description: '中央から拡大 → 微呼吸パルス',
    Component: PatternScaleBreathe,
  },
  {
    id: 3,
    name: 'Letter Stagger',
    description: '文字が1つずつ順番にフェードイン',
    Component: PatternLetterStagger,
  },
  {
    id: 4,
    name: 'Slide Reveal',
    description: '左右からスライドして中央で合流',
    Component: PatternSlideReveal,
  },
  {
    id: 5,
    name: 'Glow Pulse',
    description: 'ブラーから出現 + オレンジグロー',
    Component: PatternGlowPulse,
  },
];
