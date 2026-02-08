'use client';

import React, { useState } from 'react';
import { DripRecipe, DripStep } from '@/lib/drip-guide/types';
import { StepEditor } from './StepEditor';
import { FloppyDisk, ArrowClockwise } from 'phosphor-react';
import { MOCK_RECIPES } from '@/lib/drip-guide/mockData';
import { Input, Textarea, Button, BackLink } from '@/components/ui';

interface RecipeFormProps {
    initialRecipe?: DripRecipe;
    onSubmit: (recipe: DripRecipe) => void;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({ initialRecipe, onSubmit }) => {
    const [name, setName] = useState(initialRecipe?.name || '');
    const [beanName, setBeanName] = useState(initialRecipe?.beanName || '');
    const [beanAmountGram, setBeanAmountGram] = useState(initialRecipe?.beanAmountGram || 20);
    const [totalWaterGram, setTotalWaterGram] = useState(initialRecipe?.totalWaterGram || 300);
    const [totalDurationSec, setTotalDurationSec] = useState(initialRecipe?.totalDurationSec || 180);
    const [purpose, setPurpose] = useState(initialRecipe?.purpose || '');
    const [description, setDescription] = useState(initialRecipe?.description || '');
    const [steps, setSteps] = useState<DripStep[]>(initialRecipe?.steps || []);
    const [isManualMode, setIsManualMode] = useState(initialRecipe?.isManualMode ?? false);

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
            isManualMode,
            createdAt: initialRecipe?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        onSubmit(recipe);
    };

    const handleResetToDefault = () => {
        if (!initialRecipe?.isDefault || !initialRecipe?.id) {
            return;
        }

        // MOCK_RECIPESから元のデフォルト値を取得
        const defaultRecipe = MOCK_RECIPES.find((r) => r.id === initialRecipe.id);
        if (!defaultRecipe) {
            return;
        }

        // 確認ダイアログ
        if (!confirm('デフォルト値に戻しますか？現在の編集内容は失われます。')) {
            return;
        }

        // フォームの状態をデフォルト値にリセット
        setName(defaultRecipe.name);
        setBeanName(defaultRecipe.beanName);
        setBeanAmountGram(defaultRecipe.beanAmountGram);
        setTotalWaterGram(defaultRecipe.totalWaterGram);
        setTotalDurationSec(defaultRecipe.totalDurationSec);
        setPurpose(defaultRecipe.purpose || '');
        setDescription(defaultRecipe.description || '');
        setSteps(defaultRecipe.steps.map(step => ({ ...step }))); // ディープコピー
        setIsManualMode(defaultRecipe.isManualMode ?? false);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto pb-20">
            <div className="mb-6 flex items-center justify-between">
                <BackLink href="/drip-guide">一覧に戻る</BackLink>
                <h1 className="text-2xl font-bold text-ink">
                    {initialRecipe ? 'レシピを編集' : '新しいレシピを作成'}
                </h1>
            </div>

            <div className="bg-surface rounded-xl shadow-card border border-edge p-6 mb-6 space-y-6">
                {/* Basic Info Section */}
                <div>
                    <h2 className="text-lg font-bold text-ink-sub mb-4 border-b border-edge pb-2">基本情報</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-ink-sub mb-1">レシピ名 <span className="text-danger">*</span></label>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="例: BYSN Standard Drip"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-ink-sub mb-1">豆の名前 <span className="text-danger">*</span></label>
                            <Input
                                type="text"
                                value={beanName}
                                onChange={(e) => setBeanName(e.target.value)}
                                placeholder="例: Ethiopia Yirgacheffe"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-ink-sub mb-1">用途・タグ</label>
                            <Input
                                type="text"
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                placeholder="例: 試飲会用"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-ink-sub mb-1">豆の量 (g)</label>
                            <Input
                                type="number"
                                value={beanAmountGram}
                                onChange={(e) => setBeanAmountGram(parseInt(e.target.value) || 0)}
                                min={1}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-ink-sub mb-1">総湯量 (g)</label>
                            <Input
                                type="number"
                                value={totalWaterGram}
                                onChange={(e) => setTotalWaterGram(parseInt(e.target.value) || 0)}
                                min={1}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-ink-sub mb-1">総時間</label>
                            <div className="flex gap-2 items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={Math.floor(totalDurationSec / 60)}
                                            onChange={(e) => {
                                                const minutes = parseInt(e.target.value) || 0;
                                                const seconds = totalDurationSec % 60;
                                                setTotalDurationSec(minutes * 60 + seconds);
                                            }}
                                            className="w-20 text-right"
                                            min={0}
                                        />
                                        <span className="text-ink-sub text-sm whitespace-nowrap font-medium">分</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={totalDurationSec % 60}
                                            onChange={(e) => {
                                                const minutes = Math.floor(totalDurationSec / 60);
                                                const seconds = parseInt(e.target.value) || 0;
                                                setTotalDurationSec(minutes * 60 + seconds);
                                            }}
                                            className="w-20 text-right"
                                            min={0}
                                            max={59}
                                        />
                                        <span className="text-ink-sub text-sm whitespace-nowrap font-medium">秒</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-ink-sub mb-1">説明・メモ</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="レシピの特徴や注意点など"
                            />
                        </div>
                    </div>
                </div>

                {/* Guide Mode Settings Section */}
                <div>
                    <h2 className="text-lg font-bold text-ink-sub mb-4 border-b border-edge pb-2">ガイドモード設定</h2>
                    <div className="space-y-4">
                        <div className="bg-ground rounded-lg p-4 border border-edge">
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="guideMode"
                                        checked={!isManualMode}
                                        onChange={() => setIsManualMode(false)}
                                        className="w-5 h-5 text-spot focus:ring-2 focus:ring-spot"
                                    />
                                    <div className="flex-1">
                                        <div className="font-semibold text-ink">自動モード</div>
                                        <div className="text-sm text-ink-sub">タイマーに基づいて自動的にステップが進行します。時間が確定しているレシピに適しています。</div>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="guideMode"
                                        checked={isManualMode}
                                        onChange={() => setIsManualMode(true)}
                                        className="w-5 h-5 text-spot focus:ring-2 focus:ring-spot"
                                    />
                                    <div className="flex-1">
                                        <div className="font-semibold text-ink">手動モード</div>
                                        <div className="text-sm text-ink-sub">手動でステップを進めます。タイマーは参考として表示されます。時間が不確定なレシピ（BYSN Standard Dripなど）に適しています。</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Steps Section */}
                <div>
                    <StepEditor steps={steps} onChange={setSteps} isManualMode={isManualMode} />
                </div>
            </div>

            {/* Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-overlay border-t border-edge z-10">
                <div className="max-w-3xl mx-auto flex flex-row gap-3 justify-center">
                    {initialRecipe?.isDefault && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleResetToDefault}
                        >
                            <ArrowClockwise size={20} />
                            デフォルトに戻す
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                    >
                        <FloppyDisk size={24} />
                        レシピを保存
                    </Button>
                </div>
            </div>
        </form>
    );
};
