'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DripRecipe, DripStep } from '@/lib/drip-guide/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ArrowCounterClockwise, CheckCircle, X, ArrowLeft } from 'phosphor-react';
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
        <div className="flex flex-col h-[100dvh] bg-white relative overflow-hidden">
            {/* Header */}
            <div className="flex-none px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-white z-10">
                <Link href="/drip-guide" className="p-2 -ml-2 text-gray-500 hover:text-gray-800 transition-colors rounded-full active:bg-gray-100">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="font-bold text-gray-800 text-lg truncate max-w-[200px] text-center">
                    {recipe.name}
                </h1>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Progress Bar */}
            <div className="flex-none h-1 bg-gray-100 w-full">
                <motion.div
                    className="h-full bg-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                />
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-grow overflow-y-auto flex flex-col items-center py-6 px-4">
                {/* Timer */}
                <div className="text-center mb-8 mt-4">
                    <div className="text-7xl sm:text-8xl font-mono font-bold text-gray-800 tracking-tighter leading-none">
                        {formatTime(currentTime)}
                    </div>
                    <div className="text-sm text-gray-400 mt-2 font-medium">
                        TOTAL TIME / {formatTime(recipe.totalDurationSec)}
                    </div>
                </div>

                {/* Current Step Info */}
                <div className="w-full max-w-md text-center">
                    <AnimatePresence mode="wait">
                        {currentStep ? (
                            <motion.div
                                key={currentStep.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center"
                            >
                                <h3 className="text-3xl font-bold text-amber-700 mb-4">{currentStep.title}</h3>

                                {currentStep.targetTotalWater && (
                                    <div className="mb-6">
                                        <span className="inline-block bg-blue-50 text-blue-600 px-6 py-2 rounded-full font-bold text-xl shadow-sm border border-blue-100">
                                            {currentStep.targetTotalWater}g <span className="text-sm font-normal text-blue-400">まで注ぐ</span>
                                        </span>
                                    </div>
                                )}

                                <p className="text-lg text-gray-600 leading-relaxed mb-6 max-w-xs mx-auto">
                                    {currentStep.description}
                                </p>

                                {currentStep.note && (
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm max-w-xs mx-auto">
                                        <span className="font-bold mr-1">Point:</span> {currentStep.note}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="start"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-gray-400 text-lg py-10"
                            >
                                準備ができたら<br />スタートボタンを押してください
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Controls - Fixed */}
            <div className="flex-none bg-white border-t border-gray-100 pb-8 pt-4 px-6 safe-area-bottom">
                {/* Next Step Preview */}
                <div className="h-8 mb-4 flex justify-center items-center">
                    {nextStep && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-gray-400 text-xs font-medium bg-gray-50 px-3 py-1 rounded-full"
                        >
                            Next: {formatTime(nextStep.startTimeSec)} - {nextStep.title}
                        </motion.div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-10">
                    <button
                        onClick={resetTimer}
                        className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors p-2 active:scale-95"
                    >
                        <div className="p-3 rounded-full bg-gray-50">
                            <ArrowCounterClockwise size={24} />
                        </div>
                        <span className="text-xs font-medium">リセット</span>
                    </button>

                    <button
                        onClick={toggleTimer}
                        className={clsx(
                            "w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 touch-manipulation",
                            isRunning
                                ? "bg-white border-2 border-amber-100 text-amber-500"
                                : "bg-amber-500 text-white shadow-amber-200"
                        )}
                    >
                        {isRunning ? (
                            <Pause size={36} weight="fill" />
                        ) : (
                            <Play size={36} weight="fill" className="ml-1" />
                        )}
                    </button>

                    <Link
                        href="/drip-guide"
                        className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors p-2 active:scale-95"
                    >
                        <div className="p-3 rounded-full bg-gray-50">
                            <X size={24} />
                        </div>
                        <span className="text-xs font-medium">終了</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};
