'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DripRecipe, DripStep } from '@/lib/drip-guide/types';
import { StepEditor } from './StepEditor';
import { FloppyDisk, ArrowLeft } from 'phosphor-react';
import Link from 'next/link';

interface RecipeFormProps {
    initialRecipe?: DripRecipe;
    onSubmit: (recipe: DripRecipe) => void;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({ initialRecipe, onSubmit }) => {
    const router = useRouter();
    const [name, setName] = useState(initialRecipe?.name || '');
    const [beanName, setBeanName] = useState(initialRecipe?.beanName || '');
    const [beanAmountGram, setBeanAmountGram] = useState(initialRecipe?.beanAmountGram || 20);
    const [totalWaterGram, setTotalWaterGram] = useState(initialRecipe?.totalWaterGram || 300);
    const [totalDurationSec, setTotalDurationSec] = useState(initialRecipe?.totalDurationSec || 180);
    const [purpose, setPurpose] = useState(initialRecipe?.purpose || '');
    const [description, setDescription] = useState(initialRecipe?.description || '');
    const [steps, setSteps] = useState<DripStep[]>(initialRecipe?.steps || []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!name || !beanName) {
            alert('レシピ名と豆名は必須です');
            return;
        }

        if (steps.length === 0) {
            alert('少なくとも1つのステップを追加してください');
            return;
        }

        // Sort steps by start time
        const sortedSteps = [...steps].sort((a, b) => a.startTimeSec - b.startTimeSec);

        const recipe: DripRecipe = {
            id: initialRecipe?.id || crypto.randomUUID(),
            name,
            beanName,
            beanAmountGram,
            totalWaterGram,
            totalDurationSec,
            purpose,
            description,
            steps: sortedSteps,
            createdAt: initialRecipe?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        onSubmit(recipe);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto pb-20">
            <div className="mb-6 flex items-center justify-between">
                <Link href="/drip-guide" className="flex items-center text-gray-500 hover:text-gray-800 transition-colors p-2 -ml-2 rounded-lg active:bg-gray-100">
                    <ArrowLeft size={20} className="mr-1" />
                    一覧に戻る
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">
                    {initialRecipe ? 'レシピを編集' : '新しいレシピを作成'}
                </h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 space-y-6">
                {/* Basic Info Section */}
                <div>
                    <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">基本情報</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">レシピ名 <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 sm:p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-base"
                                placeholder="例: BYSN Standard Drip"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">豆の名前 <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={beanName}
                                onChange={(e) => setBeanName(e.target.value)}
                                className="w-full p-3 sm:p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-base"
                                placeholder="例: Ethiopia Yirgacheffe"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">用途・タグ</label>
                            <input
                                type="text"
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                className="w-full p-3 sm:p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-base"
                                placeholder="例: 試飲会用"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">豆の量 (g)</label>
                            <input
                                type="number"
                                value={beanAmountGram}
                                onChange={(e) => setBeanAmountGram(parseInt(e.target.value) || 0)}
                                className="w-full p-3 sm:p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-base"
                                min={1}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">総湯量 (g)</label>
                            <input
                                type="number"
                                value={totalWaterGram}
                                onChange={(e) => setTotalWaterGram(parseInt(e.target.value) || 0)}
                                className="w-full p-3 sm:p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-base"
                                min={1}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">総時間</label>
                            <div className="flex gap-2 items-center">
                                <div className="flex-1">
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={Math.floor(totalDurationSec / 60)}
                                            onChange={(e) => {
                                                const minutes = parseInt(e.target.value) || 0;
                                                const seconds = totalDurationSec % 60;
                                                setTotalDurationSec(minutes * 60 + seconds);
                                            }}
                                            className="w-full p-3 sm:p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-base"
                                            min={0}
                                        />
                                        <span className="text-gray-600 text-sm whitespace-nowrap">分</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={totalDurationSec % 60}
                                            onChange={(e) => {
                                                const minutes = Math.floor(totalDurationSec / 60);
                                                const seconds = parseInt(e.target.value) || 0;
                                                setTotalDurationSec(minutes * 60 + seconds);
                                            }}
                                            className="w-full p-3 sm:p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-base"
                                            min={0}
                                            max={59}
                                        />
                                        <span className="text-gray-600 text-sm whitespace-nowrap">秒</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">説明・メモ</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-3 sm:p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-base"
                                rows={3}
                                placeholder="レシピの特徴や注意点など"
                            />
                        </div>
                    </div>
                </div>

                {/* Steps Section */}
                <div>
                    <StepEditor steps={steps} onChange={setSteps} />
                </div>
            </div>

            {/* Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-center z-10">
                <button
                    type="submit"
                    className="flex items-center gap-2 bg-amber-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-amber-700 transition-transform active:scale-95 touch-manipulation"
                >
                    <FloppyDisk size={24} />
                    レシピを保存
                </button>
            </div>
        </form>
    );
};
