/**
 * 時間設定入力コンポーネント
 * 1回目と2回目の時間を分単位で設定する
 */

'use client';

import { useState, useEffect, useRef } from 'react';

interface TimeSettingInputProps {
    firstMinutes: number;
    secondMinutes: number;
    onFirstChange: (minutes: number) => void;
    onSecondChange: (minutes: number) => void;
    disabled?: boolean;
}

interface StepperInputProps {
    value: number;
    onChange: (minutes: number) => void;
    disabled: boolean;
    label: string;
}

/**
 * ステッパー入力サブコンポーネント
 * +/- ボタンと、タップで直接入力可能な数字表示
 */
function StepperInput({ value, onChange, disabled, label }: StepperInputProps) {
    const [localValue, setLocalValue] = useState(String(value));
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // 編集モードに入った時にinputにフォーカス
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        const num = parseInt(localValue, 10);
        if (!isNaN(num) && num >= 1 && num <= 60) {
            onChange(num);
        } else {
            onChange(5); // デフォルト値
            setLocalValue('5');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur();
        }
    };

    const handleDecrement = () => {
        if (!disabled) {
            onChange(Math.max(1, value - 1));
        }
    };

    const handleIncrement = () => {
        if (!disabled) {
            onChange(Math.min(60, value + 1));
        }
    };

    const handleValueClick = () => {
        if (!disabled) {
            // 編集開始時に最新の外部値を反映してから編集モードへ
            setLocalValue(String(value));
            setIsEditing(true);
        }
    };

    return (
        <div className="flex flex-col justify-end">
            <span className="text-xs sm:text-xs text-gray-500 mb-0.5 block">{label}</span>
            <div className="flex items-center gap-1">
                {/* −ボタン */}
                <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={disabled || value <= 1}
                    className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-md text-lg font-bold text-gray-600 transition-colors disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed select-none"
                    aria-label="値を減らす"
                >
                    −
                </button>

                {/* 数字表示 / 入力フィールド */}
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="number"
                        min="1"
                        max="60"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="w-12 sm:w-14 px-1 py-1.5 sm:py-2 border border-[#EF8A00] rounded-md text-center text-base sm:text-base font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#EF8A00] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                ) : (
                    <button
                        type="button"
                        onClick={handleValueClick}
                        disabled={disabled}
                        className="w-12 sm:w-14 px-1 py-1.5 sm:py-2 border border-gray-200 rounded-md text-center text-base sm:text-base font-bold text-gray-800 bg-white hover:border-gray-300 active:bg-gray-50 transition-colors disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed select-none"
                        aria-label="タップして値を編集"
                    >
                        {value}
                    </button>
                )}

                {/* +ボタン */}
                <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={disabled || value >= 60}
                    className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-md text-lg font-bold text-gray-600 transition-colors disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed select-none"
                    aria-label="値を増やす"
                >
                    +
                </button>
            </div>
        </div>
    );
}

export function TimeSettingInput({
    firstMinutes,
    secondMinutes,
    onFirstChange,
    onSecondChange,
    disabled = false,
}: TimeSettingInputProps) {
    return (
        <div className="h-full bg-white/80 rounded-lg border border-gray-100 px-4 py-3 sm:px-4 sm:py-2.5 shadow-sm flex flex-col">
            <div className="mb-1.5 sm:mb-2">
                <span className="text-sm sm:text-sm font-bold text-gray-600">時間設定（分）</span>
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1">
                {/* 1回目 */}
                <StepperInput value={firstMinutes} onChange={onFirstChange} disabled={disabled} label="1回目" />
                {/* 2回目 */}
                <StepperInput value={secondMinutes} onChange={onSecondChange} disabled={disabled} label="2回目" />
            </div>
        </div>
    );
}
