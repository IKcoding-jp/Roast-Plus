'use client';

import React from 'react';
import type { DialogueMessage } from '@/types';
import {
  CHARACTERS,
  getCharacterPairByEpisodeId,
} from '@/data/dev-stories/characters';
import { DialogueBubble } from './DialogueBubble';
import { CharacterAvatar } from './CharacterAvatar';

interface DialogueSectionProps {
  dialogues: DialogueMessage[];
  episodeId: string;
}

export const DialogueSection: React.FC<DialogueSectionProps> = ({
  dialogues,
  episodeId,
}) => {
  const characterPair = getCharacterPairByEpisodeId(episodeId);

  // フォールバック: ペアが見つからない場合はepisode-001のペアを使用
  const pair = characterPair || getCharacterPairByEpisodeId('episode-001')!;

  return (
    <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-edge">
      {/* キャラクター紹介 */}
      <div className="mb-8">
        {/* 二人のキャラクター */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* 左側キャラクター */}
          <div className="bg-ground rounded-xl p-4 text-center">
            <div className="flex justify-center mb-3">
              <CharacterAvatar characterId={pair.left.id} size="lg" />
            </div>
            <h3 className="font-bold text-ink mb-1">
              {pair.left.emoji} {pair.left.name}
            </h3>
            <p
              className="text-xs font-medium mb-2"
              style={{ color: CHARACTERS[pair.left.id].textColor }}
            >
              {pair.left.subtitle}
            </p>
            <p className="text-xs text-ink-sub leading-relaxed">
              {pair.left.description}
            </p>
          </div>

          {/* 右側キャラクター */}
          <div className="bg-ground rounded-xl p-4 text-center">
            <div className="flex justify-center mb-3">
              <CharacterAvatar characterId={pair.right.id} size="lg" />
            </div>
            <h3 className="font-bold text-ink mb-1">
              {pair.right.emoji} {pair.right.name}
            </h3>
            <p
              className="text-xs font-medium mb-2"
              style={{ color: CHARACTERS[pair.right.id].textColor }}
            >
              {pair.right.subtitle}
            </p>
            <p className="text-xs text-ink-sub leading-relaxed">
              {pair.right.description}
            </p>
          </div>
        </div>

        {/* 二人の関係性 */}
        <div className="bg-ground rounded-xl p-4 text-center">
          <p className="text-xs text-ink-sub leading-relaxed whitespace-pre-line">
            {pair.relationship}
          </p>
        </div>
      </div>

      {/* 対話メッセージ */}
      <div className="space-y-3">
        {dialogues.map((message, index) => {
          const character = CHARACTERS[message.characterId];
          // 連続した同じキャラクターのメッセージではアバターを非表示
          const prevMessage = index > 0 ? dialogues[index - 1] : null;
          const showAvatar =
            !prevMessage || prevMessage.characterId !== message.characterId;

          return (
            <DialogueBubble
              key={message.id}
              message={message}
              character={character}
              showAvatar={showAvatar}
            />
          );
        })}
      </div>
    </div>
  );
};
