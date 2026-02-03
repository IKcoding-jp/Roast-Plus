'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Textarea, Card, IconButton, NumberInput, InlineInput, Checkbox, Switch, Badge, Tabs, TabsList, TabsTrigger, TabsContent, ProgressBar, EmptyState, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui';
import { useChristmasMode } from '@/hooks/useChristmasMode';
import { HiArrowLeft, HiX, HiTrash, HiPlus, HiCheck, HiCog, HiPencil, HiInbox } from 'react-icons/hi';
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
  // Checkbox/Switch用
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [switchOn, setSwitchOn] = useState(false);
  // Progress用
  const [progress] = useState(65);

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
            <Button variant="coffee" isChristmasMode={isChristmasMode}>Coffee</Button>
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
          <Card variant="coffee" isChristmasMode={isChristmasMode}>
            <p className="text-white">
              Coffee Card - ダークブラウン背景（#211714）
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

        {/* Checkbox - NEW */}
        <Card isChristmasMode={isChristmasMode}>
          <h2 className={`text-lg font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            Checkbox <span className="text-xs font-normal text-amber-500 ml-2">NEW</span>
          </h2>
          <p className={`text-sm mb-4 ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
            チェックボックス。設定画面やフィルターで使用。
          </p>
          <div className="space-y-4">
            <Checkbox
              label="基本的なチェックボックス"
              checked={checked1}
              onChange={(e) => setChecked1(e.target.checked)}
              isChristmasMode={isChristmasMode}
            />
            <Checkbox
              label="説明文付き"
              description="このオプションを有効にすると、通知が送信されます。"
              checked={checked2}
              onChange={(e) => setChecked2(e.target.checked)}
              isChristmasMode={isChristmasMode}
            />
            <Checkbox
              label="無効状態"
              disabled
              isChristmasMode={isChristmasMode}
            />
          </div>
        </Card>

        {/* Switch - NEW */}
        <Card isChristmasMode={isChristmasMode}>
          <h2 className={`text-lg font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            Switch <span className="text-xs font-normal text-amber-500 ml-2">NEW</span>
          </h2>
          <p className={`text-sm mb-4 ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
            ON/OFFトグルスイッチ。モード切替などに使用。
          </p>

          <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
            基本
          </h3>
          <div className="space-y-4 mb-4">
            <Switch
              label="通知を有効にする"
              checked={switchOn}
              onChange={(e) => setSwitchOn(e.target.checked)}
              isChristmasMode={isChristmasMode}
            />
            <Switch
              label="無効状態"
              checked={false}
              disabled
              isChristmasMode={isChristmasMode}
            />
          </div>

          <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
            サイズ
          </h3>
          <div className="flex flex-wrap items-center gap-6">
            <Switch size="sm" checked={true} label="Small" isChristmasMode={isChristmasMode} />
            <Switch size="md" checked={true} label="Medium" isChristmasMode={isChristmasMode} />
            <Switch size="lg" checked={true} label="Large" isChristmasMode={isChristmasMode} />
          </div>
        </Card>

        {/* Badge - NEW */}
        <Card isChristmasMode={isChristmasMode}>
          <h2 className={`text-lg font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            Badge <span className="text-xs font-normal text-amber-500 ml-2">NEW</span>
          </h2>
          <p className={`text-sm mb-4 ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
            ラベル/タグ表示。ステータスやカテゴリ表示に使用。
          </p>

          <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
            Variants
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="default" isChristmasMode={isChristmasMode}>Default</Badge>
            <Badge variant="primary" isChristmasMode={isChristmasMode}>Primary</Badge>
            <Badge variant="secondary" isChristmasMode={isChristmasMode}>Secondary</Badge>
            <Badge variant="success" isChristmasMode={isChristmasMode}>Success</Badge>
            <Badge variant="warning" isChristmasMode={isChristmasMode}>Warning</Badge>
            <Badge variant="danger" isChristmasMode={isChristmasMode}>Danger</Badge>
            <Badge variant="coffee" isChristmasMode={isChristmasMode}>Coffee</Badge>
          </div>

          <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
            Sizes
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge size="sm" variant="primary" isChristmasMode={isChristmasMode}>Small</Badge>
            <Badge size="md" variant="primary" isChristmasMode={isChristmasMode}>Medium</Badge>
            <Badge size="lg" variant="primary" isChristmasMode={isChristmasMode}>Large</Badge>
          </div>
        </Card>

        {/* Tabs - NEW */}
        <Card isChristmasMode={isChristmasMode}>
          <h2 className={`text-lg font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            Tabs <span className="text-xs font-normal text-amber-500 ml-2">NEW</span>
          </h2>
          <p className={`text-sm mb-4 ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
            タブ切り替えコンポーネント。ページ内の表示切り替えに使用。
          </p>
          <Tabs defaultValue="tab1" isChristmasMode={isChristmasMode}>
            <TabsList className="mb-4">
              <TabsTrigger value="tab1">タブ1</TabsTrigger>
              <TabsTrigger value="tab2">タブ2</TabsTrigger>
              <TabsTrigger value="tab3">タブ3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <div className={`p-4 rounded-lg ${isChristmasMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}>
                  タブ1の内容です。
                </p>
              </div>
            </TabsContent>
            <TabsContent value="tab2">
              <div className={`p-4 rounded-lg ${isChristmasMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}>
                  タブ2の内容です。
                </p>
              </div>
            </TabsContent>
            <TabsContent value="tab3">
              <div className={`p-4 rounded-lg ${isChristmasMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}>
                  タブ3の内容です。
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* ProgressBar - NEW */}
        <Card isChristmasMode={isChristmasMode}>
          <h2 className={`text-lg font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            ProgressBar <span className="text-xs font-normal text-amber-500 ml-2">NEW</span>
          </h2>
          <p className={`text-sm mb-4 ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
            進捗バー。タスク進捗やローディング表示に使用。
          </p>

          <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
            Variants
          </h3>
          <div className="space-y-3 mb-4">
            <ProgressBar value={progress} variant="primary" label="Primary" showValue isChristmasMode={isChristmasMode} />
            <ProgressBar value={80} variant="success" label="Success" showValue isChristmasMode={isChristmasMode} />
            <ProgressBar value={45} variant="warning" label="Warning" showValue isChristmasMode={isChristmasMode} />
            <ProgressBar value={30} variant="danger" label="Danger" showValue isChristmasMode={isChristmasMode} />
            <ProgressBar value={60} variant="coffee" label="Coffee" showValue isChristmasMode={isChristmasMode} />
          </div>

          <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
            Sizes
          </h3>
          <div className="space-y-3">
            <ProgressBar value={70} size="sm" isChristmasMode={isChristmasMode} />
            <ProgressBar value={70} size="md" isChristmasMode={isChristmasMode} />
            <ProgressBar value={70} size="lg" isChristmasMode={isChristmasMode} />
          </div>
        </Card>

        {/* EmptyState - NEW */}
        <Card isChristmasMode={isChristmasMode}>
          <h2 className={`text-lg font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            EmptyState <span className="text-xs font-normal text-amber-500 ml-2">NEW</span>
          </h2>
          <p className={`text-sm mb-4 ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
            空状態表示。データがない場合の表示に使用。
          </p>

          <div className={`border rounded-lg ${isChristmasMode ? 'border-[#d4af37]/20' : 'border-gray-200'}`}>
            <EmptyState
              icon={<HiInbox className="h-12 w-12" />}
              title="データがありません"
              description="新しいアイテムを追加して始めましょう。"
              action={<Button size="sm" isChristmasMode={isChristmasMode}>追加する</Button>}
              isChristmasMode={isChristmasMode}
            />
          </div>
        </Card>

        {/* Accordion - NEW */}
        <Card isChristmasMode={isChristmasMode}>
          <h2 className={`text-lg font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
            Accordion <span className="text-xs font-normal text-amber-500 ml-2">NEW</span>
          </h2>
          <p className={`text-sm mb-4 ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
            アコーディオン。折りたたみ可能なセクション表示に使用。
          </p>

          <Accordion isChristmasMode={isChristmasMode}>
            <AccordionItem defaultOpen>
              <AccordionTrigger>セクション1（デフォルトで開く）</AccordionTrigger>
              <AccordionContent>
                <p>このセクションはデフォルトで開いた状態です。追加の情報や詳細をここに表示できます。</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem>
              <AccordionTrigger>セクション2</AccordionTrigger>
              <AccordionContent>
                <p>クリックすると開閉できます。履歴表示や詳細情報の表示に便利です。</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem>
              <AccordionTrigger>セクション3</AccordionTrigger>
              <AccordionContent>
                <p>複数のアコーディオンを同時に開くことができます。</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
    </div>
  );
}
