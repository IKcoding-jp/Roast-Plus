import React from 'react';
import { HiReply, HiRefresh } from 'react-icons/hi';

type Props = {
    onUpdate: (delta: number) => void;
    onUndo: () => void;
    onReset: () => void;
    canUndo: boolean;
    canReset: boolean;
};

export const CounterControls = ({ onUpdate, onUndo, onReset, canUndo, canReset }: Props) => {
    return (
        <div className="w-full flex flex-col gap-[1.5dvh]">
            <div className="grid grid-cols-2 gap-[1.5dvh]">
                {/* Decrement Group */}
                <div className="flex flex-col gap-[1.5dvh]">
                    {[-1, -5, -10].map((val) => (
                        <button
                            key={val}
                            onClick={() => onUpdate(val)}
                            className="w-full bg-white border-2 border-gray-100 text-gray-600 h-[7dvh] min-h-[44px] rounded-xl font-bold text-[2.5dvh] hover:bg-gray-50 hover:border-gray-200 active:scale-95 active:bg-gray-100 transition-all shadow-sm flex items-center justify-center"
                        >
                            {val}
                        </button>
                    ))}
                </div>

                {/* Increment Group */}
                <div className="flex flex-col gap-[1.5dvh]">
                    {[1, 5, 10].map((val) => (
                        <button
                            key={val}
                            onClick={() => onUpdate(val)}
                            className="w-full bg-[#EF8A00] text-white h-[7dvh] min-h-[44px] rounded-xl font-bold text-[2.5dvh] hover:brightness-110 active:scale-95 shadow-md shadow-[#EF8A00]/20 transition-all flex items-center justify-center"
                        >
                            +{val}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-[1dvh]">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[1.8dvh] font-medium px-3 py-[1dvh] rounded-lg hover:bg-gray-50"
                >
                    <HiReply className="w-[2.5dvh] h-[2.5dvh]" />
                    ひとつ戻す
                </button>
                <button
                    onClick={onReset}
                    disabled={!canReset}
                    className="flex items-center gap-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[1.8dvh] font-medium px-3 py-[1dvh] rounded-lg hover:bg-red-50"
                >
                    <HiRefresh className="w-[2.5dvh] h-[2.5dvh]" />
                    リセット
                </button>
            </div>
        </div>
    );
};
