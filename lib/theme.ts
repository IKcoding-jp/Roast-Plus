/**
 * テーマプリセット定数・型定義
 * 全テーマのメタデータを集約管理
 */

export type ThemeAnimationType =
  | 'steam'
  | 'flame'
  | 'particles'
  | 'leaf'
  | 'glow'
  | 'snow'
  | 'stars';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  type: 'light' | 'dark';
  /** PWAステータスバー・ナビゲーションバー用のテーマカラー */
  themeColor: string;
  previewColors: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
  };
  /** プレビューカード内のフォントスタイル（Tailwindクラス文字列） */
  fontStyle: string;
  /** アンビエントアニメーションの種別 */
  animationType: ThemeAnimationType;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'デフォルト',
    description: '暖かいコーヒー系ライトテーマ',
    type: 'light',
    themeColor: '#261a14',
    previewColors: {
      bg: '#261a14',
      surface: '#FFFFFF',
      accent: '#d97706',
      text: '#f5e6d0',
    },
    fontStyle: 'font-bold tracking-normal',
    animationType: 'steam',
  },
  {
    id: 'dark-roast',
    name: 'ダークロースト',
    description: '深煎りエスプレッソの高級感',
    type: 'dark',
    themeColor: '#0d0b09',
    previewColors: {
      bg: '#0d0b09',
      surface: '#1a1614',
      accent: '#c8a050',
      text: '#f5f0e8',
    },
    fontStyle: 'font-black tracking-tight',
    animationType: 'flame',
  },
  {
    id: 'light-roast',
    name: 'ライトロースト',
    description: '浅煎りの朝のハンドドリップ感',
    type: 'light',
    themeColor: '#6b5d4f',
    previewColors: {
      bg: '#faf6ef',
      surface: '#fff9f0',
      accent: '#d4a535',
      text: '#3d3229',
    },
    fontStyle: 'font-light tracking-wide',
    animationType: 'particles',
  },
  {
    id: 'matcha',
    name: '抹茶ラテ',
    description: '和カフェの落ち着き',
    type: 'dark',
    themeColor: '#0f1f15',
    previewColors: {
      bg: '#0f1f15',
      surface: '#1a3025',
      accent: '#7db358',
      text: '#f0ebe0',
    },
    fontStyle: 'font-semibold tracking-widest',
    animationType: 'leaf',
  },
  {
    id: 'caramel',
    name: 'キャラメルマキアート',
    description: '秋の収穫祭の温かさ',
    type: 'dark',
    themeColor: '#1a120d',
    previewColors: {
      bg: '#1a120d',
      surface: '#2a1f17',
      accent: '#d4923a',
      text: '#f5ebe0',
    },
    fontStyle: 'font-bold tracking-normal',
    animationType: 'glow',
  },
  {
    id: 'christmas',
    name: 'クリスマス',
    description: 'ホリデーシーズンの特別テーマ',
    type: 'dark',
    themeColor: '#051a0e',
    previewColors: {
      bg: '#051a0e',
      surface: '#0d3520',
      accent: '#d4af37',
      text: '#f8f1e7',
    },
    fontStyle: 'font-extrabold tracking-tight',
    animationType: 'snow',
  },
  {
    id: 'dark',
    name: 'ダークモード',
    description: '目の疲れを抑える汎用ダークテーマ',
    type: 'dark',
    themeColor: '#0f0f0f',
    previewColors: {
      bg: '#0f0f0f',
      surface: '#1a1a1a',
      accent: '#d97706',
      text: '#e8e8e8',
    },
    fontStyle: 'font-black tracking-tight',
    animationType: 'stars',
  },
];

/** テーマIDの配列（ThemeProvider用） */
export const THEME_IDS = THEME_PRESETS.map((t) => t.id);

/** ダーク系テーマかどうかを判定 */
export function isDarkTheme(themeId: string | undefined): boolean {
  const preset = THEME_PRESETS.find((t) => t.id === themeId);
  return preset?.type === 'dark';
}
