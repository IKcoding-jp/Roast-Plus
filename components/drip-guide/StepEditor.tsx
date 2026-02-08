'use client';

import React from 'react';
import { DripStep } from '@/lib/drip-guide/types';
import { Trash, Plus, ListNumbers } from 'phosphor-react';
import { Button, IconButton } from '@/components/ui';

interface StepEditorProps {
    steps: DripStep[];
    onChange: (steps: DripStep[]) => void;
    isManualMode?: boolean;
}

export const StepEditor: React.FC<StepEditorProps> = ({ steps, onChange, isManualMode = false }) => {
    const addStep = () => {
        const lastStep = steps[steps.length - 1];
        const newStartTime = lastStep ? lastStep.startTimeSec + 30 : 0;

        const newStep: DripStep = {
            id: crypto.randomUUID(),
            startTimeSec: newStartTime,
            title: '',
            description: '',
        };
        onChange([...steps, newStep]);
    };

    const updateStep = (index: number, field: keyof DripStep, value: DripStep[keyof DripStep]) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        onChange(newSteps);
    };

    const removeStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index);
        onChange(newSteps);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-ink-sub flex items-center gap-2">
                    <ListNumbers size={20} />
                    手順ステップ
                </h3>
            </div>

            <div className="space-y-3">
                {steps.map((step, index) => (
                    <div key={step.id} className="bg-ground p-4 rounded-lg border border-edge relative group">
                        <div className="grid grid-cols-12 gap-3">
                            {/* Time Input */}
                            {!isManualMode && (
                                <div className="col-span-3 sm:col-span-2">
                                    <label className="block text-xs font-medium text-ink-muted mb-1">開始(秒)</label>
                                    <input
                                        type="number"
                                        value={step.startTimeSec}
                                        onChange={(e) => updateStep(index, 'startTimeSec', parseInt(e.target.value) || 0)}
                                        className="w-full p-3 sm:p-2 border border-edge rounded bg-field text-ink focus:ring-2 focus:ring-spot outline-none text-base"
                                        min={0}
                                    />
                                </div>
                            )}

                            {/* Title Input */}
                            <div className={isManualMode ? "col-span-6 sm:col-span-5" : "col-span-9 sm:col-span-4"}>
                                <label className="block text-xs font-medium text-ink-muted mb-1">タイトル</label>
                                <input
                                    type="text"
                                    value={step.title}
                                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                                    placeholder="例: 蒸らし"
                                    className="w-full p-3 sm:p-2 border border-edge rounded bg-field text-ink placeholder:text-ink-muted focus:ring-2 focus:ring-spot outline-none text-base"
                                />
                            </div>

                            {/* Target Water Input */}
                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-xs font-medium text-ink-muted mb-1">目標湯量(g)</label>
                                <input
                                    type="number"
                                    value={step.targetTotalWater || ''}
                                    onChange={(e) => updateStep(index, 'targetTotalWater', e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="任意"
                                    className="w-full p-3 sm:p-2 border border-edge rounded bg-field text-ink placeholder:text-ink-muted focus:ring-2 focus:ring-spot outline-none text-base"
                                />
                            </div>

                            {/* Delete Button */}
                            <div className={isManualMode ? "col-span-6 sm:col-span-4 flex items-end justify-end" : "col-span-6 sm:col-span-3 flex items-end justify-end"}>
                                <IconButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeStep(index)}
                                    className="text-ink-muted hover:text-danger hover:bg-danger-subtle"
                                    title="ステップを削除"
                                >
                                    <Trash size={20} />
                                </IconButton>
                            </div>

                            {/* Description Input (Full width) */}
                            <div className="col-span-12">
                                <label className="block text-xs font-medium text-ink-muted mb-1">説明・詳細</label>
                                <textarea
                                    value={step.description}
                                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                                    placeholder="例: 全体にお湯を行き渡らせます"
                                    className="w-full p-3 sm:p-2 border border-edge rounded bg-field text-ink placeholder:text-ink-muted focus:ring-2 focus:ring-spot outline-none text-base"
                                    rows={2}
                                />
                            </div>

                            {/* Note/Hint Input (Full width) */}
                            <div className="col-span-12">
                                <label className="block text-xs font-medium text-ink-muted mb-1">ヒント</label>
                                <input
                                    type="text"
                                    value={step.note || ''}
                                    onChange={(e) => updateStep(index, 'note', e.target.value || undefined)}
                                    placeholder="例: 粉全体が均一に膨らむのを確認"
                                    className="w-full p-3 sm:p-2 border border-edge rounded bg-field text-ink placeholder:text-ink-muted focus:ring-2 focus:ring-spot outline-none text-base"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button
                variant="outline"
                fullWidth
                onClick={addStep}
                type="button"
                className="!border-2 !border-dashed !border-edge gap-2"
            >
                <Plus size={20} />
                ステップを追加
            </Button>
        </div>
    );
};
