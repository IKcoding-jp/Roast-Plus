import { Coffee, Drop, Wind, Cookie, Sun } from 'phosphor-react';
import { SliderInput } from './SliderInput';

interface TastingRecordFormScoresProps {
  bitterness: number;
  acidity: number;
  body: number;
  sweetness: number;
  aroma: number;
  onBitternessChange: (value: number) => void;
  onAcidityChange: (value: number) => void;
  onBodyChange: (value: number) => void;
  onSweetnessChange: (value: number) => void;
  onAromaChange: (value: number) => void;
  readOnly?: boolean;
  isChristmasMode?: boolean;
}

export function TastingRecordFormScores({
  bitterness,
  acidity,
  body,
  sweetness,
  aroma,
  onBitternessChange,
  onAcidityChange,
  onBodyChange,
  onSweetnessChange,
  onAromaChange,
  readOnly = false,
  isChristmasMode = false,
}: TastingRecordFormScoresProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5 px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-1 h-5 rounded-full ${isChristmasMode ? 'bg-[#d4af37]' : 'bg-amber-500'}`} />
            <h3 className={`text-base font-bold ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>評価項目</h3>
          </div>
          <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
            isChristmasMode
              ? 'bg-[#d4af37]/20 text-[#d4af37]'
              : 'bg-amber-100 text-amber-700'
          }`}>
            1.0 - 5.0 スケール
          </div>
        </div>
        <p className={`text-[11px] font-medium leading-relaxed ${
          isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'
        }`}>
          ※ これらの項目は、味わいのバランスや特徴の数値であり、味の良し悪しを評価するものではありません。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <SliderInput
          label="苦味"
          value={bitterness}
          onChange={onBitternessChange}
          description="コーヒーの苦みの強さ"
          readOnly={readOnly}
          icon={<Coffee size={24} weight="fill" className={isChristmasMode ? 'text-[#d4af37]' : 'text-stone-700'} />}
          colorClass="bg-stone-100"
          accentColor="text-stone-800"
          isChristmasMode={isChristmasMode}
        />
        <SliderInput
          label="酸味"
          value={acidity}
          onChange={onAcidityChange}
          description="コーヒーの酸っぱさや爽やかさ"
          readOnly={readOnly}
          icon={<Sun size={24} weight="fill" className={isChristmasMode ? 'text-[#d4af37]' : 'text-orange-600'} />}
          colorClass="bg-orange-50"
          accentColor="text-orange-600"
          isChristmasMode={isChristmasMode}
        />
        <SliderInput
          label="ボディ"
          value={body}
          onChange={onBodyChange}
          description="コーヒーの口当たりや重厚感"
          readOnly={readOnly}
          icon={<Drop size={24} weight="fill" className={isChristmasMode ? 'text-[#d4af37]' : 'text-amber-800'} />}
          colorClass="bg-amber-50"
          accentColor="text-amber-800"
          isChristmasMode={isChristmasMode}
        />
        <SliderInput
          label="甘み"
          value={sweetness}
          onChange={onSweetnessChange}
          description="コーヒーに感じられる甘さ"
          readOnly={readOnly}
          icon={<Cookie size={24} weight="fill" className={isChristmasMode ? 'text-[#d4af37]' : 'text-rose-600'} />}
          colorClass="bg-rose-50"
          accentColor="text-rose-600"
          isChristmasMode={isChristmasMode}
        />
        <SliderInput
          label="香り"
          value={aroma}
          onChange={onAromaChange}
          description="コーヒーの香りの強さや豊かさ"
          readOnly={readOnly}
          icon={<Wind size={24} weight="fill" className={isChristmasMode ? 'text-[#d4af37]' : 'text-emerald-600'} />}
          colorClass="bg-emerald-50"
          accentColor="text-emerald-600"
          isChristmasMode={isChristmasMode}
        />
      </div>
    </div>
  );
}
