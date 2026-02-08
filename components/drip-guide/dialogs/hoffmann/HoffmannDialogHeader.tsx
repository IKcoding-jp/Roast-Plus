'use client';

import React from 'react';
import { Coffee } from 'phosphor-react';

export const HoffmannDialogHeader: React.FC = () => {
    return (
        <div className="flex items-start gap-3 px-5 pt-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-spot-subtle text-spot">
                <Coffee size={24} weight="duotone" />
            </div>
            <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-spot">
                    James Hoffmann V60
                </p>
                <h3 className="mt-1 text-lg font-bold text-ink">Ultimate V60 Technique</h3>
            </div>
        </div>
    );
};
