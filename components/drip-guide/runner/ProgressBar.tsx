'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
    progressPercent: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progressPercent }) => {
    return (
        <div className="flex-none h-1 bg-ground w-full">
            <motion.div
                className="h-full bg-spot"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'linear' }}
            />
        </div>
    );
};
