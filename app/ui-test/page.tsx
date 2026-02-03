'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Textarea, Card } from '@/components/ui';
import { useChristmasMode } from '@/hooks/useChristmasMode';
import { HiArrowLeft } from 'react-icons/hi';

export default function UITestPage() {
  const { isChristmasMode, toggleChristmasMode } = useChristmasMode();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: isChristmasMode ? '#051a0e' : '#F7F7F5' }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className={`flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg transition-colors ${
                isChristmasMode
                  ? 'text-[#d4af37] hover:bg-white/10'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              title="設定に戻る"
              aria-label="設定に戻る"
            >
              <HiArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className={`text-2xl font-bold ${isChristmasMode ? 'text-[#d4af37]' : 'text-gray-800'}`}>
              UIコンポーネントテスト
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleChristmasMode}
            isChristmasMode={isChristmasMode}
          >
            {isChristmasMode ? '通常モード' : 'クリスマスモード'}
          </Button>
        </header>

        {/* Button Variants */}
        <Card isChristmasMode={isChristmasMode}>
          <h2 className={`text-lg font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            Button Variants
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" isChristmasMode={isChristmasMode}>Primary</Button>
            <Button variant="secondary" isChristmasMode={isChristmasMode}>Secondary</Button>
            <Button variant="danger" isChristmasMode={isChristmasMode}>Danger</Button>
            <Button variant="success" isChristmasMode={isChristmasMode}>Success</Button>
            <Button variant="outline" isChristmasMode={isChristmasMode}>Outline</Button>
            <Button variant="ghost" isChristmasMode={isChristmasMode}>Ghost</Button>
          </div>
        </Card>

        {/* Button Sizes */}
        <Card isChristmasMode={isChristmasMode}>
          <h2 className={`text-lg font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            Button Sizes
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" isChristmasMode={isChristmasMode}>Small</Button>
            <Button size="md" isChristmasMode={isChristmasMode}>Medium</Button>
            <Button size="lg" isChristmasMode={isChristmasMode}>Large</Button>
          </div>
        </Card>

        {/* Button States */}
        <Card isChristmasMode={isChristmasMode}>
          <h2 className={`text-lg font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            Button States
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button disabled isChristmasMode={isChristmasMode}>Disabled</Button>
            <Button loading={loading} onClick={handleSubmit} isChristmasMode={isChristmasMode}>
              {loading ? '処理中...' : 'Loading Test'}
            </Button>
            <Button fullWidth isChristmasMode={isChristmasMode}>Full Width</Button>
          </div>
        </Card>

        {/* Form Elements */}
        <Card isChristmasMode={isChristmasMode}>
          <h2 className={`text-lg font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            Form Elements
          </h2>
          <div className="space-y-4">
            <Input
              label="名前"
              placeholder="山田太郎"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isChristmasMode={isChristmasMode}
            />
            <Input
              label="パスワード（トグル付き）"
              type="password"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPasswordToggle
              isChristmasMode={isChristmasMode}
            />
            <Input
              label="エラー表示テスト"
              placeholder="入力してください"
              error="このフィールドは必須です"
              isChristmasMode={isChristmasMode}
            />
            <Select
              label="カテゴリ"
              placeholder="選択してください"
              options={[
                { value: 'light', label: 'ライトロースト' },
                { value: 'medium', label: 'ミディアムロースト' },
                { value: 'dark', label: 'ダークロースト' },
              ]}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              isChristmasMode={isChristmasMode}
            />
            <Textarea
              label="メモ"
              placeholder="焙煎に関するメモを入力"
              rows={4}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              isChristmasMode={isChristmasMode}
            />
          </div>
        </Card>

        {/* Card Variants */}
        <div className="space-y-4">
          <h2 className={`text-lg font-bold ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            Card Variants
          </h2>
          <Card variant="default" isChristmasMode={isChristmasMode}>
            <p className={isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}>
              Default Card - 基本的なカード
            </p>
          </Card>
          <Card variant="hoverable" isChristmasMode={isChristmasMode}>
            <p className={isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}>
              Hoverable Card - ホバーするとシャドウが変化
            </p>
          </Card>
          <Card variant="action" isChristmasMode={isChristmasMode}>
            <p className={isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}>
              Action Card - ホームページ用カード
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
