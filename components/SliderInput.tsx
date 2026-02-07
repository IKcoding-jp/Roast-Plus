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
  const containerClass = readOnly
    ? 'bg-ground border-edge'
    : 'bg-surface border-edge hover:border-spot hover:shadow-md';

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 ${containerClass}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${colorClass}`}>{icon}</div>
          <div>
            <label className="text-base font-bold block leading-tight text-ink">{label}</label>
            {description && <span className="text-[11px] font-medium text-ink-muted">{description}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span
            className={`text-2xl font-black tabular-nums leading-none tracking-tight ${accentColor}`}
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
          [&::-webkit-slider-thumb]:bg-white ${accentColor.replace('text-', '[&::-webkit-slider-thumb]:border-')}
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
        <div className="flex justify-between text-[9px] font-bold mt-2 tracking-wider text-ink-muted">
          <span>最小</span>
          <div className="flex gap-1.5 items-center">
            {[1, 2, 3, 4, 5].map((v) => (
              <div
                key={v}
                className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                  value >= v ? 'bg-amber-500' : 'bg-gray-200'
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
