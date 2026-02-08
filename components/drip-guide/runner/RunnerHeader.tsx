'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'phosphor-react';

interface RunnerHeaderProps {
    recipeName: string;
}

export const RunnerHeader: React.FC<RunnerHeaderProps> = ({ recipeName }) => {
    return (
        <div className="flex-none px-4 py-3 flex items-center justify-between border-b border-edge bg-surface z-10">
            <Link
                href="/drip-guide"
                className="p-2 -ml-2 text-ink-muted hover:text-ink transition-colors rounded-full active:bg-ground"
            >
                <ArrowLeft size={24} />
            </Link>
            <h1 className="font-bold text-ink text-lg truncate max-w-[200px] text-center">
                {recipeName}
            </h1>
            <div className="w-10" />
        </div>
    );
};
