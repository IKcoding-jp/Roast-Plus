'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Textarea, Card, IconButton, NumberInput, InlineInput } from '@/components/ui';
import { useChristmasMode } from '@/hooks/useChristmasMode';
import { HiArrowLeft, HiX, HiTrash, HiPlus, HiCheck, HiCog, HiPencil } from 'react-icons/hi';
import { MdClose, MdAdd, MdDelete } from 'react-icons/md';

export default function UITestPage() {
  const { isChristmasMode, toggleChristmasMode } = useChristmasMode();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  // 新規追加コンポーネント用
  const [width, setWidth] = useState(160);
  const [height, setHeight] = useState(60);
  const [inlineValue, setInlineValue] = useState('テスト値');

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

        {/* IconButton - NEW */}
        <Card isChristmasMode={isChristmasMode}>
          <h2 className={`text-lg font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            IconButton <span className="text-xs font-normal text-amber-500 ml-2">NEW</span>
          </h2>
          <p className={`text-sm mb-4 ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
            アイコンのみのボタン。閉じるボタン、削除ボタン等に使用。
          </p>

          <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
            Variants
          </h3>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex flex-col items-center gap-1">
              <IconButton variant="default" isChristmasMode={isChristmasMode}><HiX size={20} /></IconButton>
              <span className={`text-xs ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'}`}>default</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <IconButton variant="primary" isChristmasMode={isChristmasMode}><HiPlus size={20} /></IconButton>
              <span className={`text-xs ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'}`}>primary</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <IconButton variant="danger" isChristmasMode={isChristmasMode}><HiTrash size={20} /></IconButton>
              <span className={`text-xs ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'}`}>danger</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <IconButton variant="success" isChristmasMode={isChristmasMode}><HiCheck size={20} /></IconButton>
              <span className={`text-xs ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'}`}>success</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <IconButton variant="ghost" isChristmasMode={isChristmasMode}><HiCog size={20} /></IconButton>
              <span className={`text-xs ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'}`}>ghost</span>
            </div>
          </div>

          <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
            Sizes
          </h3>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex flex-col items-center gap-1">
              <IconButton size="sm" isChristmasMode={isChristmasMode}><MdClose size={16} /></IconButton>
              <span className={`text-xs ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'}`}>sm</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <IconButton size="md" isChristmasMode={isChristmasMode}><MdClose size={20} /></IconButton>
              <span className={`text-xs ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'}`}>md</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <IconButton size="lg" isChristmasMode={isChristmasMode}><MdClose size={24} /></IconButton>
              <span className={`text-xs ${isChristmasMode ? 'text-[#f8f1e7]/50' : 'text-gray-500'}`}>lg</span>
            </div>
          </div>

          <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
            Rounded (円形)
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <IconButton rounded variant="primary" isChristmasMode={isChristmasMode}><MdAdd size={20} /></IconButton>
            <IconButton rounded variant="danger" isChristmasMode={isChristmasMode}><MdDelete size={20} /></IconButton>
            <IconButton rounded variant="ghost" isChristmasMode={isChristmasMode}><HiPencil size={20} /></IconButton>
          </div>
        </Card>

        {/* NumberInput - NEW */}
        <Card isChristmasMode={isChristmasMode}>
          <h2 className={`text-lg font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            NumberInput <span className="text-xs font-normal text-amber-500 ml-2">NEW</span>
          </h2>
          <p className={`text-sm mb-4 ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
            数値入力専用コンポーネント。幅・高さ設定などに使用。suffixで単位を表示可能。
          </p>
          <div className="space-y-4">
            <NumberInput
              label="幅設定"
              suffix="px"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
              isChristmasMode={isChristmasMode}
            />
            <NumberInput
              label="高さ設定"
              suffix="px"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
              isChristmasMode={isChristmasMode}
            />
            <NumberInput
              label="エラー表示テスト"
              suffix="px"
              value={0}
              error="0以上の値を入力してください"
              isChristmasMode={isChristmasMode}
            />
          </div>
        </Card>

        {/* InlineInput - NEW */}
        <Card isChristmasMode={isChristmasMode}>
          <h2 className={`text-lg font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            InlineInput <span className="text-xs font-normal text-amber-500 ml-2">NEW</span>
          </h2>
          <p className={`text-sm mb-4 ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
            インライン編集用の軽量入力。テーブルセルやヘッダー内での編集に最適化。
          </p>

          <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
            Light Background (通常の背景)
          </h3>
          <div className={`p-4 rounded-lg mb-4 ${isChristmasMode ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <InlineInput
                value={inlineValue}
                onChange={(e) => setInlineValue(e.target.value)}
                variant="light"
                isChristmasMode={isChristmasMode}
              />
              <IconButton variant="success" size="sm" isChristmasMode={isChristmasMode}>
                <HiCheck size={16} />
              </IconButton>
            </div>
          </div>

          <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
            Dark Background (ヘッダー等)
          </h3>
          <div className={`p-4 rounded-lg mb-4 ${isChristmasMode ? 'bg-[#0a1f12]' : 'bg-gray-800'}`}>
            <div className="flex items-center gap-2">
              <InlineInput
                value={inlineValue}
                onChange={(e) => setInlineValue(e.target.value)}
                variant="dark"
                isChristmasMode={isChristmasMode}
                placeholder="班名を入力"
              />
              <IconButton variant="primary" size="sm" isChristmasMode={isChristmasMode}>
                <MdAdd size={16} />
              </IconButton>
            </div>
          </div>

          <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
            Text Alignment
          </h3>
          <div className="space-y-2">
            <InlineInput
              value="左揃え"
              textAlign="left"
              variant="light"
              isChristmasMode={isChristmasMode}
              readOnly
            />
            <InlineInput
              value="中央揃え"
              textAlign="center"
              variant="light"
              isChristmasMode={isChristmasMode}
              readOnly
            />
            <InlineInput
              value="右揃え"
              textAlign="right"
              variant="light"
              isChristmasMode={isChristmasMode}
              readOnly
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
