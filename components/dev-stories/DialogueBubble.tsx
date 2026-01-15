'use client';

import React from 'react';
import type { DialogueMessage, Character } from '@/types';
import { CharacterAvatar } from './CharacterAvatar';

interface DialogueBubbleProps {
  message: DialogueMessage;
  character: Character;
  showAvatar?: boolean;
}

export const DialogueBubble: React.FC<DialogueBubbleProps> = ({
  message,
  character,
  showAvatar = true,
}) => {
  const isLeft = character.position === 'left';

  return (
    <div className={`flex items-start gap-3 ${isLeft ? '' : 'flex-row-reverse'}`}>
      {showAvatar && (
        <CharacterAvatar characterId={character.id} size="md" />
      )}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm mt-2 ${
          isLeft
            ? 'rounded-tl-sm bg-amber-100 text-amber-900'
            : 'rounded-tr-sm bg-gray-200 text-gray-800'
        }`}
      >
        <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
};
