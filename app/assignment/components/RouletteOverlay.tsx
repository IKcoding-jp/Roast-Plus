import React from 'react';
import { motion } from 'framer-motion';
import { PiCoffeeBeanFill } from 'react-icons/pi';
import { Member } from '@/types';

type Props = {
    isVisible: boolean;
    members: Member[];
};

export const RouletteOverlay: React.FC<Props> = ({ isVisible }) => {
    if (!isVisible) return null;

    // 5つの豆を円形に配置して回転させる
    const beans = Array.from({ length: 5 });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // コーヒー感のあるダークブラウンの背景
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a100c]/95 backdrop-blur-sm"
        >
            <div className="flex flex-col items-center justify-center">
                {/* アニメーションコンテナ */}
                <div className="relative w-40 h-40 mb-8">
                    {/* 中央の大きな豆 */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 10, -10, 0]
                        }}
                        transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <PiCoffeeBeanFill size={64} className="text-gold drop-shadow-lg" />
                    </motion.div>

                    {/* 周囲を回る豆たち */}
                    {beans.map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute inset-0"
                            initial={{ rotate: i * (360 / beans.length) }}
                            animate={{ rotate: i * (360 / beans.length) + 360 }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            <motion.div
                                className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2"
                                animate={{ 
                                    rotate: -360, // 自身の回転を相殺して向きを保つ
                                    scale: [1, 1.2, 1] 
                                }}
                                transition={{
                                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 1.5, repeat: Infinity, delay: i * 0.2 }
                                }}
                            >
                                <PiCoffeeBeanFill 
                                    size={24} 
                                    className="text-amber-500/80" 
                                />
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-gold text-2xl md:text-3xl font-bold tracking-[0.2em] text-shadow-lg">
                        BLENDING...
                    </h2>
                </motion.div>
            </div>
        </motion.div>
    );
};
