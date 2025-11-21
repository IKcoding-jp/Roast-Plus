'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DripRecipe, DripStep } from '@/lib/drip-guide/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ArrowCounterClockwise, CheckCircle, X } from 'phosphor-react';
import { clsx } from 'clsx';
import Link from 'next/link';

interface DripGuideRunnerProps {
    recipe: DripRecipe;
}

export const DripGuideRunner: React.FC<DripGuideRunnerProps> = ({ recipe }) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Sort steps just in case
    const steps = [...recipe.steps].sort((a, b) => a.startTimeSec - b.startTimeSec);

    // Determine current step
    const currentStepIndex = steps.findLastIndex((step) => step.startTimeSec <= currentTime);
    const currentStep = currentStepIndex !== -1 ? steps[currentStepIndex] : null;
    const nextStep = steps[currentStepIndex + 1] || null;

    // Check for completion
    useEffect(() => {
        if (currentTime >= recipe.totalDurationSec && !isCompleted) {
            setIsRunning(false);
            setIsCompleted(true);
        }
    }, [currentTime, recipe.totalDurationSec, isCompleted]);

    // Timer logic
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setCurrentTime((prev) => prev + 1);
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning]);

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = () => {
        setIsRunning(false);
        setCurrentTime(0);
        setIsCompleted(false);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progressPercent = Math.min((currentTime / recipe.totalDurationSec) * 100, 100);

    if (isCompleted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-green-100 p-6 rounded-full mb-6"
                >
                    <CheckCircle size={64} className="text-green-600" weight="fill" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">抽出完了！</h2>
                <p className="text-gray-600 mb-8">お疲れ様でした。美味しいコーヒーを楽しみましょう。</p>

                <div className="w-full max-w-md mb-8">
                    <label className="block text-left text-sm font-medium text-gray-700 mb-2">ひとことメモ</label>
                    <textarea
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        placeholder="味の感想や抽出の様子など..."
                        rows={3}
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={resetTimer}
                        className="px-6 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        もう一度淹れる
                    </button>
                    <Link
                        href="/drip-guide"
                        className="px-6 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
                    >
                        一覧に戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-md mx-auto relative">
            {/* Header / Progress */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                    <span>{recipe.name}</span>
                    <span>{formatTime(currentTime)} / {formatTime(recipe.totalDurationSec)}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                    />
                </div>
            </div>

            {/* Main Timer Display */}
            <div className="flex-grow flex flex-col items-center justify-center mb-8">
                <div className="text-7xl font-mono font-bold text-gray-800 mb-8 tracking-tighter">
                    {formatTime(currentTime)}
                </div>

                {/* Current Step Display */}
                <div className="w-full min-h-[200px] flex flex-col items-center justify-center text-center">
                    <AnimatePresence mode="wait">
                        {currentStep ? (
                            <motion.div
                                key={currentStep.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="w-full"
                            >
                                <h3 className="text-3xl font-bold text-amber-700 mb-4">{currentStep.title}</h3>
                                <p className="text-xl text-gray-700 mb-4 leading-relaxed">
                                    {currentStep.description}
                                </p>
                                {currentStep.targetTotalWater && (
                                    <div className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-bold text-lg">
                                        目標湯量: {currentStep.targetTotalWater}g
                                    </div>
                                )}
                                {currentStep.note && (
                                    <p className="mt-4 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                                        💡 {currentStep.note}
                                    </p>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="start"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-gray-400 text-xl"
                            >
                                準備ができたらスタートを押してください
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Next Step Preview */}
            <div className="mb-8 h-16 border-t border-gray-100 pt-4">
                {nextStep && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between text-gray-400 text-sm"
                    >
                        <span>Next: {formatTime(nextStep.startTimeSec)}</span>
                        <span className="font-medium">{nextStep.title}</span>
                    </motion.div>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 pb-6">
                <button
                    onClick={resetTimer}
                    className="p-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="リセット"
                >
                    <ArrowCounterClockwise size={24} />
                </button>

                <button
                    onClick={toggleTimer}
                    className={clsx(
                        "w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95",
                        isRunning ? "bg-amber-100 text-amber-600" : "bg-amber-600 text-white"
                    )}
                >
                    {isRunning ? (
                        <Pause size={32} weight="fill" />
                    ) : (
                        <Play size={32} weight="fill" className="ml-1" />
                    )}
                </button>

                <Link
                    href="/drip-guide"
                    className="p-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="終了"
                >
                    <X size={24} />
                </Link>
            </div>
        </div>
    );
};
