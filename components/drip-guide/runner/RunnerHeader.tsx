'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'phosphor-react';

interface RunnerHeaderProps {
    recipeName: string;
}

export const RunnerHeader: React.FC<RunnerHeaderProps> = ({ recipeName }) => {
    return (
        <div className="flex-none px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-white z-10">
            <Link
                href="/drip-guide"
                className="p-2 -ml-2 text-gray-500 hover:text-gray-800 transition-colors rounded-full active:bg-gray-100"
            >
                <ArrowLeft size={24} />
            </Link>
            <h1 className="font-bold text-gray-800 text-lg truncate max-w-[200px] text-center">
                {recipeName}
            </h1>
            <div className="w-10" />
        </div>
    );
};
