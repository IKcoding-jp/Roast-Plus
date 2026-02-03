'use client';

import React from 'react';
import { motion } from 'framer-motion';

const overlayMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

interface DialogOverlayProps {
    onClick: () => void;
    zIndex?: string;
}

export const DialogOverlay: React.FC<DialogOverlayProps> = ({ onClick, zIndex = 'z-50' }) => {
    return (
        <motion.div
            {...overlayMotion}
            className={`fixed inset-0 ${zIndex} bg-black/55`}
            onClick={onClick}
        />
    );
};
