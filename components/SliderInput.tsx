interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  readOnly?: boolean;
  icon: React.ReactNode;
  colorClass: string;
  accentColor: string;
  min?: number;
  max?: number;
  step?: number;
  isChristmasMode?: boolean;
}

export function SliderInput({
  label,
  value,
  onChange,
  description,
  readOnly = false,
  icon,
  colorClass,
  accentColor,
  min = 1.0,
  max = 5.0,
  step = 0.125,
  isChristmasMode = false,
}: SliderInputProps) {
  // クリスマスモード用のスタイル
  const containerClass = readOnly
    ? isChristmasMode
      ? 'bg-white/5 border-[#d4af37]/20'
      : 'bg-gray-50 border-gray-100'
    : isChristmasMode
      ? 'bg-[#0a2f1a] border-[#d4af37]/30 hover:border-[#d4af37]/50 hover:shadow-md hover:shadow-[#d4af37]/10'
      : 'bg-white border-gray-200 hover:border-amber-200 hover:shadow-md';

  const labelClass = isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800';
  const descriptionClass = isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500';
  const minMaxClass = isChristmasMode ? 'text-[#f8f1e7]/40' : 'text-gray-400';
  const dotActiveClass = isChristmasMode ? 'bg-[#d4af37]' : 'bg-amber-500';
  const dotInactiveClass = isChristmasMode ? 'bg-white/20' : 'bg-gray-200';
  const sliderTrackColor = isChristmasMode ? '#1a3d2a' : '#F3F4F6';
  const iconContainerClass = isChristmasMode
    ? colorClass.replace('bg-', 'bg-').replace('-50', '-900/30').replace('-100', '-900/30')
    : colorClass;

  // クリスマスモードでのアクセントカラー（値表示とスライダー）
  const christmasAccentColor = isChristmasMode ? 'text-[#d4af37]' : accentColor;

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 ${containerClass}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${iconContainerClass}`}>{icon}</div>
          <div>
            <label className={`text-base font-bold block leading-tight ${labelClass}`}>{label}</label>
            {description && <span className={`text-[11px] font-medium ${descriptionClass}`}>{description}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span
            className={`text-2xl font-black tabular-nums leading-none tracking-tight ${christmasAccentColor}`}
          >
            {value.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`w-full h-2.5 rounded-full appearance-none cursor-pointer transition-all
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:shadow-md
          ${isChristmasMode ? '[&::-webkit-slider-thumb]:bg-[#0a2f1a] [&::-webkit-slider-thumb]:border-[#d4af37]' : `[&::-webkit-slider-thumb]:bg-white ${accentColor.replace('text-', '[&::-webkit-slider-thumb]:border-')}`}
          hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-95
          disabled:cursor-not-allowed`}
          style={{
            background: `linear-gradient(to right, ${isChristmasMode ? '#d4af37' : 'currentColor'} 0%, ${isChristmasMode ? '#d4af37' : 'currentColor'} ${
              ((value - min) / (max - min)) * 100
            }%, ${sliderTrackColor} ${((value - min) / (max - min)) * 100}%, ${sliderTrackColor} 100%)`,
            color: isChristmasMode
              ? '#d4af37'
              : accentColor.includes('amber')
                ? '#D97706'
                : accentColor.includes('orange')
                  ? '#EA580C'
                  : accentColor.includes('stone')
                    ? '#44403C'
                    : accentColor.includes('rose')
                      ? '#E11D48'
                      : accentColor.includes('emerald')
                        ? '#059669'
                        : '#D97706',
          }}
          disabled={readOnly}
        />
        <div className={`flex justify-between text-[9px] font-bold mt-2 tracking-wider ${minMaxClass}`}>
          <span>最小</span>
          <div className="flex gap-1.5 items-center">
            {[1, 2, 3, 4, 5].map((v) => (
              <div
                key={v}
                className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                  value >= v ? dotActiveClass : dotInactiveClass
                }`}
              />
            ))}
          </div>
          <span>最大</span>
        </div>
      </div>
    </div>
  );
}
