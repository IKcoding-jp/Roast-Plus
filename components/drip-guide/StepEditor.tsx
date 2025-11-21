'use client';

import React from 'react';
import { DripStep } from '@/lib/drip-guide/types';
import { Trash, Plus, ListNumbers } from 'phosphor-react';
import { clsx } from 'clsx';

interface StepEditorProps {
    steps: DripStep[];
    onChange: (steps: DripStep[]) => void;
}

export const StepEditor: React.FC<StepEditorProps> = ({ steps, onChange }) => {
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

    const updateStep = (index: number, field: keyof DripStep, value: any) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        // Sort by startTimeSec automatically? Maybe better to let user control or sort on save.
        // For now, let's just update.
        onChange(newSteps);
    };

    const removeStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index);
        onChange(newSteps);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <ListNumbers size={20} />
                    手順ステップ
                </h3>
            </div>

            <div className="space-y-3">
                {steps.map((step, index) => (
                    <div key={step.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                        <div className="grid grid-cols-12 gap-3">
                            {/* Time Input */}
                            <div className="col-span-3 sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">開始(秒)</label>
                                <input
                                    type="number"
                                    value={step.startTimeSec}
                                    onChange={(e) => updateStep(index, 'startTimeSec', parseInt(e.target.value) || 0)}
                                    className="w-full p-3 sm:p-2 border rounded focus:ring-2 focus:ring-amber-500 outline-none text-base"
                                    min={0}
                                />
                            </div>

                            {/* Title Input */}
                            <div className="col-span-9 sm:col-span-4">
                                <label className="block text-xs font-medium text-gray-500 mb-1">タイトル</label>
                                <input
                                    type="text"
                                    value={step.title}
                                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                                    placeholder="例: 蒸らし"
                                    className="w-full p-3 sm:p-2 border rounded focus:ring-2 focus:ring-amber-500 outline-none text-base"
                                />
                            </div>

                            {/* Target Water Input */}
                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-xs font-medium text-gray-500 mb-1">目標湯量(g)</label>
                                <input
                                    type="number"
                                    value={step.targetTotalWater || ''}
                                    onChange={(e) => updateStep(index, 'targetTotalWater', e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="任意"
                                    className="w-full p-3 sm:p-2 border rounded focus:ring-2 focus:ring-amber-500 outline-none text-base"
                                />
                            </div>

                            {/* Delete Button (Desktop: right aligned, Mobile: absolute top-right) */}
                            <div className="col-span-6 sm:col-span-3 flex items-end justify-end">
                                <button
                                    onClick={() => removeStep(index)}
                                    className="text-gray-400 hover:text-red-500 p-3 sm:p-2 rounded-full hover:bg-red-50 transition-colors touch-manipulation"
                                    title="ステップを削除"
                                >
                                    <Trash size={20} />
                                </button>
                            </div>

                            {/* Description Input (Full width) */}
                            <div className="col-span-12">
                                <label className="block text-xs font-medium text-gray-500 mb-1">説明・詳細</label>
                                <textarea
                                    value={step.description}
                                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                                    placeholder="例: 全体にお湯を行き渡らせます"
                                    className="w-full p-3 sm:p-2 border rounded focus:ring-2 focus:ring-amber-500 outline-none text-base"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addStep}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-amber-500 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
            >
                <Plus size={20} />
                ステップを追加
            </button>
        </div>
    );
};
