/**
 * デザイントークン定義
 * UIの一貫性を保つための色、余白、影などの定義
 */

export const tokens = {
  colors: {
    // 背景色
    background: {
      global: '#F7F7F5',
      card: '#FFFFFF',
      cardGroup: '#F9F9F9',
      cardHover: '#FAFAFA',
      section: '#F5F5F5',
    },
    // アクセントカラー
    accent: {
      primary: '#D97706', // amber-600
      primaryHover: '#B45309', // amber-700
      secondary: '#6B7280', // gray-500
    },
    // ステータスカラー
    status: {
      pending: {
        bg: '#F9FAFB', // gray-50
        text: '#374151', // gray-700
        border: '#D1D5DB', // gray-300
      },
      inProgress: {
        bg: '#FFFBEB', // amber-50
        text: '#92400E', // amber-700
        border: '#F59E0B', // amber-400
      },
      completed: {
        bg: '#F0FDF4', // green-50
        text: '#15803D', // green-700
        border: '#4ADE80', // green-400
      },
    },
    // 進捗バーカラー
    progress: {
      low: '#6B7280', // gray-500
      medium: '#D97706', // amber-600
      high: '#16A34A', // green-600
    },
    // テキストカラー
    text: {
      primary: '#111827', // gray-900
      secondary: '#374151', // gray-700
      tertiary: '#6B7280', // gray-500
      muted: '#9CA3AF', // gray-400
    },
    // ボーダーカラー
    border: {
      light: '#F3F4F6', // gray-100
      default: '#E5E7EB', // gray-200
      medium: '#D1D5DB', // gray-300
      strong: '#9CA3AF', // gray-400
    },
  },
  spacing: {
    // カード内余白
    card: {
      padding: {
        sm: '0.75rem', // 12px
        md: '1rem', // 16px
        lg: '1.25rem', // 20px
        xl: '1.5rem', // 24px
      },
      gap: {
        xs: '0.5rem', // 8px
        sm: '0.75rem', // 12px
        md: '1rem', // 16px
        lg: '1.5rem', // 24px
      },
    },
    // セクション間余白
    section: {
      gap: '0.75rem', // 12px
      margin: '1rem', // 16px
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  borderRadius: {
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
  },
} as const;

