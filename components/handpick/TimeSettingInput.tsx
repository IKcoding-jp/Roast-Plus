/**
 * 時間設定入力コンポーネント
 * 1回目と2回目の時間を分けて入力
 */

'use client';

interface TimeSettingInputProps {
    firstMinutes: number;
    secondMinutes: number;
    onFirstChange: (minutes: number) => void;
    onSecondChange: (minutes: number) => void;
    disabled?: boolean;
}

export function TimeSettingInput({
    firstMinutes,
    secondMinutes,
    onFirstChange,
    onSecondChange,
    disabled = false
}: TimeSettingInputProps) {
    const handleInputChange = (value: string, onChange: (minutes: number) => void) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 1 && numValue <= 60) {
            onChange(numValue);
        } else if (value === '') {
            onChange(5); // デフォルト値
        }
    };

    return (
        <div className="h-full bg-white/80 rounded-lg border border-gray-100 px-4 py-3 sm:px-4 sm:py-2.5 shadow-sm flex flex-col">
            <div className="mb-1.5 sm:mb-2">
                <span className="text-sm sm:text-sm font-bold text-gray-600">時間設定（分）</span>
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1">
                {/* 1回目 */}
                <div className="flex flex-col justify-end">
                    <label className="block">
                        <span className="text-xs sm:text-xs text-gray-500 mb-0.5 block">1回目</span>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={firstMinutes}
                            onChange={(e) => handleInputChange(e.target.value, onFirstChange)}
                            disabled={disabled}
                            className="w-full px-3 py-2 sm:px-3 sm:py-2 border border-gray-200 rounded-md text-center text-base sm:text-base font-bold text-gray-800 focus:border-[#EF8A00] focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                        />
                    </label>
                </div>
                {/* 2回目 */}
                <div className="flex flex-col justify-end">
                    <label className="block">
                        <span className="text-xs sm:text-xs text-gray-500 mb-0.5 block">2回目</span>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={secondMinutes}
                            onChange={(e) => handleInputChange(e.target.value, onSecondChange)}
                            disabled={disabled}
                            className="w-full px-3 py-2 sm:px-3 sm:py-2 border border-gray-200 rounded-md text-center text-base sm:text-base font-bold text-gray-800 focus:border-[#EF8A00] focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
