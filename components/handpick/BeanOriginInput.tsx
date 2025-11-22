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
        <div className="bg-white/80 rounded-lg border border-gray-100 px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm">
            <label className="block">
                <span className="text-xs sm:text-sm font-bold text-gray-600 mb-1 block">豆の産地</span>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    placeholder="例：エチオピア、コロンビア..."
                    className="w-full px-2 py-1 sm:px-3 sm:py-1.5 border border-gray-200 rounded-md text-sm sm:text-base text-gray-800 font-medium focus:border-[#EF8A00] focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                />
            </label>
        </div>
    );
}
