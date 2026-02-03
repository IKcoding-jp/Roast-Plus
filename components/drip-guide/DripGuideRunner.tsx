'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DripRecipe } from '@/lib/drip-guide/types';
import { playNotificationSound } from '@/lib/sounds';
import { useRunnerTimer } from '@/hooks/drip-guide/useRunnerTimer';
import { CompletionScreen } from './runner/CompletionScreen';
import { RunnerHeader } from './runner/RunnerHeader';
import { StepMiniMap } from './runner/StepMiniMap';
import { TimerDisplay } from './runner/TimerDisplay';
import { StepInfo } from './runner/StepInfo';
import { ProgressBar } from './runner/ProgressBar';
import { FooterControls } from './runner/FooterControls';

interface DripGuideRunnerProps {
    recipe: DripRecipe;
}

export const DripGuideRunner: React.FC<DripGuideRunnerProps> = ({ recipe }) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const countdownSoundPlayedRef = useRef<boolean>(false);

    // Manual mode state
    const isManualMode = recipe.isManualMode ?? false;
    const [manualStepIndex, setManualStepIndex] = useState(0);

    // Sort steps
    const steps = [...recipe.steps].sort((a, b) => a.startTimeSec - b.startTimeSec);

    // Determine current step
    const autoModeStepIndex = steps.findLastIndex((step) => step.startTimeSec <= currentTime);
    const currentStepIndex = isManualMode ? manualStepIndex : autoModeStepIndex;
    const currentStep =
        currentStepIndex !== -1 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;
    const nextStep = currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null;

    // Timer logic
    useRunnerTimer({
        isRunning,
        isManualMode,
        totalDurationSec: recipe.totalDurationSec,
        onTick: setCurrentTime,
        onComplete: () => {
            setIsRunning(false);
            setIsCompleted(true);
        },
    });

    const scrollKey = isManualMode ? manualStepIndex : currentTime;

    // Play countdown sound 3 seconds before next step starts
    useEffect(() => {
        if (isManualMode || !nextStep) {
            countdownSoundPlayedRef.current = false;
            return;
        }

        const countdownTime = nextStep.startTimeSec - 3;

        if (currentTime >= countdownTime && !countdownSoundPlayedRef.current) {
            playNotificationSound('/sounds/countdown/countdown.mp3', 1).catch((error) => {
                console.error('Failed to play countdown sound:', error);
            });
            countdownSoundPlayedRef.current = true;
        }

        if (currentTime < countdownTime) {
            countdownSoundPlayedRef.current = false;
        }
    }, [currentTime, nextStep, isManualMode]);

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = () => {
        setIsRunning(false);
        setCurrentTime(0);
        setIsCompleted(false);
        countdownSoundPlayedRef.current = false;
        if (isManualMode) {
            setManualStepIndex(0);
        }
    };

    const goToNextStep = () => {
        if (isManualMode && manualStepIndex < steps.length - 1) {
            setManualStepIndex(manualStepIndex + 1);
        }
    };

    const goToPrevStep = () => {
        if (isManualMode && manualStepIndex > 0) {
            setManualStepIndex(manualStepIndex - 1);
        }
    };

    const handleComplete = () => {
        if (isManualMode) {
            setIsCompleted(true);
        }
    };

    const progressPercent = Math.min((currentTime / recipe.totalDurationSec) * 100, 100);

    if (isCompleted) {
        return <CompletionScreen onReset={resetTimer} />;
    }

    return (
        <div className="flex flex-col h-[100dvh] bg-white relative overflow-hidden">
            <RunnerHeader recipeName={recipe.name} />

            <div className="flex-grow flex flex-col items-center py-2 px-4 overflow-hidden">
                <StepMiniMap
                    steps={steps}
                    currentStep={currentStep}
                    currentTime={currentTime}
                    totalDurationSec={recipe.totalDurationSec}
                    isManualMode={isManualMode}
                    currentStepIndex={currentStepIndex}
                    scrollKey={scrollKey}
                />

                <div className="flex-grow flex flex-col items-center justify-center w-full">
                    <TimerDisplay currentTime={currentTime} />
                    <StepInfo currentStep={currentStep} />
                </div>
            </div>

            <ProgressBar progressPercent={progressPercent} />

            <FooterControls
                isManualMode={isManualMode}
                isRunning={isRunning}
                nextStep={nextStep}
                manualStepIndex={manualStepIndex}
                stepsLength={steps.length}
                currentStepIndex={currentStepIndex}
                onToggleTimer={toggleTimer}
                onResetTimer={resetTimer}
                onGoToNextStep={goToNextStep}
                onGoToPrevStep={goToPrevStep}
                onComplete={handleComplete}
            />
        </div>
    );
};
