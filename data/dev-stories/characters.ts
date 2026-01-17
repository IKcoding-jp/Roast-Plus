import type { Character, CharacterId } from '@/types';

// キャラクター設定
export const CHARACTERS: Record<CharacterId, Character> = {
  asairi: {
    id: 'asairi',
    name: 'アサイリ',
    shortName: 'アサイリ',
    position: 'left',
    bubbleColor: '#FEF3C7', // amber-100
    textColor: '#92400E', // amber-800
  },
  fukairi: {
    id: 'fukairi',
    name: 'フカイリ',
    shortName: 'フカイリ',
    position: 'right',
    bubbleColor: '#E5E7EB', // gray-200
    textColor: '#1F2937', // gray-800
  },
};
