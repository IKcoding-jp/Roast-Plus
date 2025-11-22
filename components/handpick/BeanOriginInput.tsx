/**
 * 豆の産地入力コンポーネント
 */

'use client';

interface BeanOriginInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function BeanOriginInput({ value, onChange, disabled = false }: BeanOriginInputProps) {
    return (
        <div className="h-full bg-white/80 rounded-lg border border-gray-100 px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm flex flex-col">
            <div className="mb-1.5 sm:mb-2">
                <span className="text-xs sm:text-sm font-bold text-gray-600">豆の産地</span>
            </div>
            <label className="block">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    placeholder="例：エチオピア、コロンビア..."
                    className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-200 rounded-md text-sm sm:text-base text-gray-800 font-medium focus:border-[#EF8A00] focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                />
            </label>
            <div className="flex-1"></div>
        </div>
    );
}
