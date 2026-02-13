export interface LabSection {
  id: string;
  title: string;
  description: string;
}

export const labSections: LabSection[] = [
  {
    id: 'components',
    title: 'コンポーネントギャラリー',
    description: '全共通UIコンポーネントのカタログ',
  },
  {
    id: 'page-mockups',
    title: 'ページモック',
    description: 'ページ全体のデザインテンプレート',
  },
  {
    id: 'colors',
    title: 'カラーパレット',
    description: 'テーマカラー一覧（通常/クリスマス）',
  },
  {
    id: 'typography',
    title: 'タイポグラフィ',
    description: 'フォント・サイズ・ウェイト',
  },
  {
    id: 'variations',
    title: 'バリエーション',
    description: 'デザインパターン比較',
  },
  {
    id: 'responsive-preview',
    title: 'レスポンシブ',
    description: 'モバイル/タブレット/PC切替',
  },
];
