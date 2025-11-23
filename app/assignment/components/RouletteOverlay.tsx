import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Member } from '../types';

type Props = {
    isVisible: boolean;
    members: Member[];
};

export const RouletteOverlay: React.FC<Props> = ({ isVisible, members }) => {
    const [displayNames, setDisplayNames] = useState<string[]>([]);

    useEffect(() => {
        if (!isVisible) return;

        const interval = setInterval(() => {
            // ランダムに3人の名前を表示する演出
            const randomMembers = [];
            for (let i = 0; i < 3; i++) {
                const r = Math.floor(Math.random() * members.length);
                randomMembers.push(members[r]?.name || '...');
            }
            setDisplayNames(randomMembers);
        }, 80);

        return () => clearInterval(interval);
    }, [isVisible, members]);

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
        >
            <div className="text-center">
                <h2 className="text-white text-2xl mb-8 font-bold tracking-widest">SHUFFLING...</h2>
                <div className="flex flex-col gap-4">
                    {displayNames.map((name, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 1 }}
                            transition={{ duration: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-gold text-shadow-lg"
                        >
                            {name}
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
