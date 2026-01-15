'use client';

import React from 'react';
import Image from 'next/image';
import type { CharacterId } from '@/types';
import { CHARACTERS } from '@/data/dev-stories/characters';

interface CharacterAvatarProps {
  characterId: CharacterId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CONFIG = {
  sm: { className: 'w-14 h-14', pixels: 56 },
  md: { className: 'w-20 h-20', pixels: 80 },
  lg: { className: 'w-24 h-24', pixels: 96 },
};

// アバター画像のパス
const AVATAR_PATHS: Record<CharacterId, string> = {
  asairi: '/avatars/asairi.png',
  fukairi: '/avatars/hukairi.png',
};

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  characterId,
  size = 'md',
  className = '',
}) => {
  const character = CHARACTERS[characterId];
  const sizeConfig = SIZE_CONFIG[size];
  const avatarPath = AVATAR_PATHS[characterId];

  // フカイリくんは画像が小さいので少し拡大
  const scale = characterId === 'fukairi' ? 'scale-125' : '';

  return (
    <div
      className={`${sizeConfig.className} rounded-full overflow-hidden flex-shrink-0 ${className}`}
      title={character.name}
      aria-label={character.name}
    >
      <Image
        src={avatarPath}
        alt={character.name}
        width={sizeConfig.pixels}
        height={sizeConfig.pixels}
        className={`w-full h-full object-cover ${scale}`}
      />
    </div>
  );
};
