'use client';

import { useState } from 'react';
import { HiX, HiTrash, HiPlus, HiCheck, HiCog, HiInbox } from 'react-icons/hi';
import { MdClose, MdAdd } from 'react-icons/md';

import {
  Button,
  IconButton,
  Input,
  NumberInput,
  InlineInput,
  Select,
  Textarea,
  Checkbox,
  Switch,
  Card,
  Modal,
  Dialog,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  ProgressBar,
  EmptyState,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  BackLink,
  RoastLevelBadge,
} from './index';

/**
 * コンポーネントレジストリのアイテム型定義
 */
export interface ComponentRegistryItem {
  /** コンポーネント名 */
  name: string;
  /** コンポーネントの説明 */
  description: string;
  /** カテゴリ */
  category: 'button' | 'form' | 'container' | 'display' | 'feedback';
  /** 新規追加フラグ */
  isNew?: boolean;
  /** デモコンポーネント */
  Demo: React.ComponentType<{ isChristmasMode: boolean }>;
}

/**
 * カテゴリのラベル定義
 */
export const categoryLabels: Record<ComponentRegistryItem['category'], string> = {
  button: 'ボタン系',
  form: 'フォーム系',
  container: 'コンテナ系',
  display: '表示系',
  feedback: 'フィードバック系',
};

// ============================================
// デモコンポーネント定義
// ============================================

function ButtonDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Variants */}
      <div>
        <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
          Variants
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" isChristmasMode={isChristmasMode}>Primary</Button>
          <Button variant="secondary" isChristmasMode={isChristmasMode}>Secondary</Button>
          <Button variant="danger" isChristmasMode={isChristmasMode}>Danger</Button>
          <Button variant="success" isChristmasMode={isChristmasMode}>Success</Button>
          <Button variant="outline" isChristmasMode={isChristmasMode}>Outline</Button>
          <Button variant="ghost" isChristmasMode={isChristmasMode}>Ghost</Button>
          <Button variant="coffee" isChristmasMode={isChristmasMode}>Coffee</Button>
          <Button variant="surface" isChristmasMode={isChristmasMode}>Surface</Button>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
          Sizes
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" isChristmasMode={isChristmasMode}>Small</Button>
          <Button size="md" isChristmasMode={isChristmasMode}>Medium</Button>
          <Button size="lg" isChristmasMode={isChristmasMode}>Large</Button>
        </div>
      </div>

      {/* States */}
      <div>
        <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
          States
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button disabled isChristmasMode={isChristmasMode}>Disabled</Button>
          <Button loading={loading} onClick={handleSubmit} isChristmasMode={isChristmasMode}>
            {loading ? '処理中...' : 'Loading Test'}
          </Button>
          <Button badge={3} isChristmasMode={isChristmasMode}>Badge</Button>
        </div>
      </div>
    </div>
  );
}

function IconButtonDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
          Variants
        </h3>
        <div className="flex flex-wrap items-center gap-3">
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
      </div>

      <div>
        <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
          Sizes & Rounded
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <IconButton size="sm" isChristmasMode={isChristmasMode}><MdClose size={16} /></IconButton>
          <IconButton size="md" isChristmasMode={isChristmasMode}><MdClose size={20} /></IconButton>
          <IconButton size="lg" isChristmasMode={isChristmasMode}><MdClose size={24} /></IconButton>
          <IconButton rounded variant="primary" isChristmasMode={isChristmasMode}><MdAdd size={20} /></IconButton>
        </div>
      </div>
    </div>
  );
}

function InputDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  return (
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
    </div>
  );
}

function NumberInputDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  const [width, setWidth] = useState(160);

  return (
    <div className="space-y-4">
      <NumberInput
        label="幅設定"
        suffix="px"
        value={width}
        onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
        isChristmasMode={isChristmasMode}
      />
      <NumberInput
        label="エラー表示テスト"
        suffix="px"
        value={0}
        onChange={() => {}}
        error="0以上の値を入力してください"
        isChristmasMode={isChristmasMode}
      />
    </div>
  );
}

function InlineInputDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  const [value, setValue] = useState('テスト値');

  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
          Light Background
        </h3>
        <div className={`p-4 rounded-lg ${isChristmasMode ? 'bg-white/5' : 'bg-gray-50'}`}>
          <InlineInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            variant="light"
            isChristmasMode={isChristmasMode}
          />
        </div>
      </div>
      <div>
        <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
          Dark Background
        </h3>
        <div className={`p-4 rounded-lg ${isChristmasMode ? 'bg-[#0a1f12]' : 'bg-gray-800'}`}>
          <InlineInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            variant="dark"
            isChristmasMode={isChristmasMode}
          />
        </div>
      </div>
    </div>
  );
}

function SelectDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  const [category, setCategory] = useState('');

  return (
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
  );
}

function TextareaDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  const [memo, setMemo] = useState('');

  return (
    <Textarea
      label="メモ"
      placeholder="焙煎に関するメモを入力"
      rows={4}
      value={memo}
      onChange={(e) => setMemo(e.target.value)}
      isChristmasMode={isChristmasMode}
    />
  );
}

function CheckboxDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);

  return (
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
  );
}

function SwitchDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  const [switchOn, setSwitchOn] = useState(false);

  return (
    <div className="space-y-4">
      <Switch
        label="通知を有効にする"
        checked={switchOn}
        onChange={(e) => setSwitchOn(e.target.checked)}
        isChristmasMode={isChristmasMode}
      />
      <div className="flex flex-wrap items-center gap-6">
        <Switch size="sm" checked={true} label="Small" isChristmasMode={isChristmasMode} />
        <Switch size="md" checked={true} label="Medium" isChristmasMode={isChristmasMode} />
        <Switch size="lg" checked={true} label="Large" isChristmasMode={isChristmasMode} />
      </div>
    </div>
  );
}

function CardDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  return (
    <div className="space-y-4">
      <Card variant="default" isChristmasMode={isChristmasMode}>
        <p className={isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}>
          Default Card - 基本的なカード
        </p>
      </Card>
      <Card variant="hoverable" isChristmasMode={isChristmasMode}>
        <p className={isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}>
          Hoverable Card - ホバーでシャドウ変化
        </p>
      </Card>
      <Card variant="coffee" isChristmasMode={isChristmasMode}>
        <p className="text-white">Coffee Card - ダークブラウン背景</p>
      </Card>
    </div>
  );
}

function ModalDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setShowModal(true)} isChristmasMode={isChristmasMode}>
        モーダルを開く
      </Button>
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        contentClassName={isChristmasMode
          ? 'bg-[#0a2618] rounded-2xl shadow-xl overflow-hidden max-w-sm w-full border border-[#d4af37]/40'
          : 'bg-white rounded-2xl shadow-xl overflow-hidden max-w-sm w-full'
        }
      >
        <div className="p-6">
          <h3 className={`text-lg font-bold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-900'}`}>
            モーダルタイトル
          </h3>
          <p className={`text-sm mb-4 ${isChristmasMode ? 'text-[#f8f1e7]/70' : 'text-gray-600'}`}>
            これはモーダルの内容です。
          </p>
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setShowModal(false)} isChristmasMode={isChristmasMode}>
              閉じる
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function DialogDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  const [showDialog, setShowDialog] = useState(false);
  const [showDangerDialog, setShowDangerDialog] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={() => setShowDialog(true)} isChristmasMode={isChristmasMode}>
          通常ダイアログ
        </Button>
        <Button variant="danger" onClick={() => setShowDangerDialog(true)} isChristmasMode={isChristmasMode}>
          危険アクション
        </Button>
      </div>
      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title="確認"
        description="この操作を実行してもよろしいですか？"
        confirmText="実行する"
        onConfirm={() => setShowDialog(false)}
        isChristmasMode={isChristmasMode}
      />
      <Dialog
        isOpen={showDangerDialog}
        onClose={() => setShowDangerDialog(false)}
        title="削除の確認"
        description="このアイテムを削除しますか？この操作は取り消せません。"
        confirmText="削除する"
        onConfirm={() => setShowDangerDialog(false)}
        variant="danger"
        isChristmasMode={isChristmasMode}
      />
    </>
  );
}

function BadgeDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
          Variants
        </h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" isChristmasMode={isChristmasMode}>Default</Badge>
          <Badge variant="primary" isChristmasMode={isChristmasMode}>Primary</Badge>
          <Badge variant="secondary" isChristmasMode={isChristmasMode}>Secondary</Badge>
          <Badge variant="success" isChristmasMode={isChristmasMode}>Success</Badge>
          <Badge variant="warning" isChristmasMode={isChristmasMode}>Warning</Badge>
          <Badge variant="danger" isChristmasMode={isChristmasMode}>Danger</Badge>
          <Badge variant="coffee" isChristmasMode={isChristmasMode}>Coffee</Badge>
        </div>
      </div>
      <div>
        <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
          Sizes
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm" variant="primary" isChristmasMode={isChristmasMode}>Small</Badge>
          <Badge size="md" variant="primary" isChristmasMode={isChristmasMode}>Medium</Badge>
          <Badge size="lg" variant="primary" isChristmasMode={isChristmasMode}>Large</Badge>
        </div>
      </div>
    </div>
  );
}

function RoastLevelBadgeDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
          焙煎度レベル
        </h3>
        <div className="flex flex-wrap gap-3">
          <RoastLevelBadge level="浅煎り" isChristmasMode={isChristmasMode} />
          <RoastLevelBadge level="中煎り" isChristmasMode={isChristmasMode} />
          <RoastLevelBadge level="中深煎り" isChristmasMode={isChristmasMode} />
          <RoastLevelBadge level="深煎り" isChristmasMode={isChristmasMode} />
        </div>
      </div>
      <div>
        <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
          サイズ
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <RoastLevelBadge level="中深煎り" size="sm" isChristmasMode={isChristmasMode} />
          <RoastLevelBadge level="中深煎り" size="md" isChristmasMode={isChristmasMode} />
          <RoastLevelBadge level="中深煎り" size="lg" isChristmasMode={isChristmasMode} />
        </div>
      </div>
    </div>
  );
}

function TabsDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  return (
    <Tabs defaultValue="tab1" isChristmasMode={isChristmasMode}>
      <TabsList className="mb-4">
        <TabsTrigger value="tab1">タブ1</TabsTrigger>
        <TabsTrigger value="tab2">タブ2</TabsTrigger>
        <TabsTrigger value="tab3">タブ3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <div className={`p-4 rounded-lg ${isChristmasMode ? 'bg-white/5' : 'bg-gray-50'}`}>
          <p className={isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}>タブ1の内容です。</p>
        </div>
      </TabsContent>
      <TabsContent value="tab2">
        <div className={`p-4 rounded-lg ${isChristmasMode ? 'bg-white/5' : 'bg-gray-50'}`}>
          <p className={isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}>タブ2の内容です。</p>
        </div>
      </TabsContent>
      <TabsContent value="tab3">
        <div className={`p-4 rounded-lg ${isChristmasMode ? 'bg-white/5' : 'bg-gray-50'}`}>
          <p className={isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}>タブ3の内容です。</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function ProgressBarDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  return (
    <div className="space-y-3">
      <ProgressBar value={65} variant="primary" label="Primary" showValue isChristmasMode={isChristmasMode} />
      <ProgressBar value={80} variant="success" label="Success" showValue isChristmasMode={isChristmasMode} />
      <ProgressBar value={45} variant="warning" label="Warning" showValue isChristmasMode={isChristmasMode} />
      <ProgressBar value={30} variant="danger" label="Danger" showValue isChristmasMode={isChristmasMode} />
      <ProgressBar value={60} variant="coffee" label="Coffee" showValue isChristmasMode={isChristmasMode} />
    </div>
  );
}

function EmptyStateDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  return (
    <div className={`border rounded-lg ${isChristmasMode ? 'border-[#d4af37]/20' : 'border-gray-200'}`}>
      <EmptyState
        icon={<HiInbox className="h-12 w-12" />}
        title="データがありません"
        description="新しいアイテムを追加して始めましょう。"
        action={<Button size="sm" isChristmasMode={isChristmasMode}>追加する</Button>}
        isChristmasMode={isChristmasMode}
      />
    </div>
  );
}

function AccordionDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  return (
    <Accordion isChristmasMode={isChristmasMode}>
      <AccordionItem defaultOpen>
        <AccordionTrigger>セクション1（デフォルトで開く）</AccordionTrigger>
        <AccordionContent>
          <p>このセクションはデフォルトで開いた状態です。</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionTrigger>セクション2</AccordionTrigger>
        <AccordionContent>
          <p>クリックすると開閉できます。</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function BackLinkDemo({ isChristmasMode }: { isChristmasMode: boolean }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
          Default（テキスト付き）
        </h3>
        <BackLink href="#" isChristmasMode={isChristmasMode}>
          一覧に戻る
        </BackLink>
      </div>
      <div>
        <h3 className={`text-sm font-semibold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'}`}>
          Icon Only（アイコンのみ）
        </h3>
        <BackLink href="#" variant="icon-only" isChristmasMode={isChristmasMode} />
      </div>
    </div>
  );
}

// ============================================
// コンポーネントレジストリ
// ============================================

/**
 * 全共通コンポーネントのレジストリ
 *
 * 新しいコンポーネントを追加する場合：
 * 1. 上部にデモコンポーネント（XxxDemo）を作成
 * 2. このレジストリに新しいエントリを追加
 * 3. UIテストページは自動的に新しいコンポーネントを表示
 */
export const componentRegistry: ComponentRegistryItem[] = [
  // ボタン系
  {
    name: 'Button',
    description: '統一されたボタンコンポーネント。8種類のvariant（primary, secondary, danger, success, outline, ghost, coffee, surface）と3種類のサイズ。',
    category: 'button',
    Demo: ButtonDemo,
  },
  {
    name: 'IconButton',
    description: 'アイコンのみのボタン。閉じる、削除、追加などのアクションに使用。',
    category: 'button',
    Demo: IconButtonDemo,
  },
  {
    name: 'BackLink',
    description: '戻るリンク。ページ上部に配置する「一覧に戻る」などのナビゲーションリンク。',
    category: 'button',
    isNew: true,
    Demo: BackLinkDemo,
  },

  // フォーム系
  {
    name: 'Input',
    description: 'テキスト入力フィールド。パスワードトグル、エラー表示に対応。',
    category: 'form',
    Demo: InputDemo,
  },
  {
    name: 'NumberInput',
    description: '数値入力専用フィールド。suffix（単位）表示に対応。',
    category: 'form',
    Demo: NumberInputDemo,
  },
  {
    name: 'InlineInput',
    description: 'インライン編集用の軽量入力。テーブルセルやヘッダー内での使用に最適。',
    category: 'form',
    Demo: InlineInputDemo,
  },
  {
    name: 'Select',
    description: 'セレクトボックス。オプション選択に使用。',
    category: 'form',
    Demo: SelectDemo,
  },
  {
    name: 'Textarea',
    description: '複数行テキスト入力。メモや説明文の入力に使用。',
    category: 'form',
    Demo: TextareaDemo,
  },
  {
    name: 'Checkbox',
    description: 'チェックボックス。設定画面やフィルターで使用。',
    category: 'form',
    Demo: CheckboxDemo,
  },
  {
    name: 'Switch',
    description: 'ON/OFFトグルスイッチ。モード切替などに使用。',
    category: 'form',
    Demo: SwitchDemo,
  },

  // コンテナ系
  {
    name: 'Card',
    description: 'カードコンポーネント。コンテンツのグループ化に使用。',
    category: 'container',
    Demo: CardDemo,
  },
  {
    name: 'Modal',
    description: '汎用モーダル。カスタムコンテンツを表示するための基盤。',
    category: 'container',
    Demo: ModalDemo,
  },
  {
    name: 'Dialog',
    description: '確認ダイアログ。OK/キャンセルの選択が必要な場面で使用。',
    category: 'container',
    Demo: DialogDemo,
  },
  {
    name: 'Accordion',
    description: 'アコーディオン。折りたたみ可能なセクション表示に使用。',
    category: 'container',
    Demo: AccordionDemo,
  },
  {
    name: 'Tabs',
    description: 'タブ切り替えコンポーネント。ページ内の表示切り替えに使用。',
    category: 'container',
    Demo: TabsDemo,
  },

  // 表示系
  {
    name: 'Badge',
    description: 'ラベル/タグ表示。ステータスやカテゴリ表示に使用。',
    category: 'display',
    Demo: BadgeDemo,
  },
  {
    name: 'RoastLevelBadge',
    description: '焙煎度専用バッジ。浅煎り〜深煎りの4段階を色分け表示。',
    category: 'display',
    isNew: true,
    Demo: RoastLevelBadgeDemo,
  },
  {
    name: 'ProgressBar',
    description: '進捗バー。タスク進捗やローディング表示に使用。',
    category: 'display',
    Demo: ProgressBarDemo,
  },
  {
    name: 'EmptyState',
    description: '空状態表示。データがない場合の表示に使用。',
    category: 'display',
    Demo: EmptyStateDemo,
  },
];

/**
 * カテゴリでグループ化されたコンポーネントを取得
 */
export function getComponentsByCategory(): Record<ComponentRegistryItem['category'], ComponentRegistryItem[]> {
  const grouped: Record<ComponentRegistryItem['category'], ComponentRegistryItem[]> = {
    button: [],
    form: [],
    container: [],
    display: [],
    feedback: [],
  };

  componentRegistry.forEach((item) => {
    grouped[item.category].push(item);
  });

  return grouped;
}
