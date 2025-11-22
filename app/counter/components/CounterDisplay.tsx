import React from 'react';

type Props = {
    count: number;
};

export const CounterDisplay = ({ count }: Props) => {
    return (
        <div className="flex flex-col items-center justify-center py-[2dvh]">
            <span className="text-gray-400 text-[1.5dvh] font-bold mb-[1dvh] uppercase tracking-widest">Count</span>
            <div className="text-[12dvh] font-black text-gray-800 tabular-nums leading-none tracking-tight">
                {count}
            </div>
        </div>
    );
};
