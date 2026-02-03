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
}: SliderInputProps) {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 ${
        readOnly
          ? 'bg-gray-50 border-gray-100'
          : 'bg-white border-gray-200 hover:border-amber-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${colorClass}`}>{icon}</div>
          <div>
            <label className="text-lg font-bold text-gray-800 block leading-tight">{label}</label>
            {description && <span className="text-xs text-gray-500 font-medium">{description}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span
            className={`text-3xl font-black ${accentColor} tabular-nums leading-none tracking-tight`}
          >
            {value.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="px-1 relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer transition-all
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:shadow-lg
          ${accentColor.replace('text-', 'border-')}
          hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-95
          disabled:cursor-not-allowed`}
          style={{
            background: `linear-gradient(to right, currentColor 0%, currentColor ${
              ((value - min) / (max - min)) * 100
            }%, #F3F4F6 ${((value - min) / (max - min)) * 100}%, #F3F4F6 100%)`,
            color: accentColor.includes('amber')
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
        <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-widest px-1">
          <span>Min</span>
          <div className="flex gap-2 items-center">
            {[1, 2, 3, 4, 5].map((v) => (
              <div
                key={v}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  value >= v ? 'bg-amber-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span>Max</span>
        </div>
      </div>
    </div>
  );
}
