'use client';

import React from 'react';
import type { DialogueMessage } from '@/types';
import { CHARACTERS } from '@/data/dev-stories/characters';
import { DialogueBubble } from './DialogueBubble';
import { CharacterAvatar } from './CharacterAvatar';

interface DialogueSectionProps {
  dialogues: DialogueMessage[];
}

export const DialogueSection: React.FC<DialogueSectionProps> = ({ dialogues }) => {
  return (
    <div className="bg-gradient-to-b from-amber-50 to-orange-50/50 rounded-2xl p-4 sm:p-6">
      {/* キャラクター紹介 */}
      <div className="mb-8">
        {/* 二人のキャラクター */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* アサイリちゃん */}
          <div className="bg-white/60 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-3">
              <CharacterAvatar characterId="asairi" size="lg" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">🌰 アサイリちゃん</h3>
            <p className="text-xs text-amber-700 font-medium mb-2">やさしくて世話焼き、でも芯がある子</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              いつも周りを気にかけて「大丈夫？」って自然に声をかけるタイプ。フカイリくんの危なっかしさを放っておけない、安心感のかたまり。
            </p>
          </div>

          {/* フカイリくん */}
          <div className="bg-white/60 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-3">
              <CharacterAvatar characterId="fukairi" size="lg" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">🕶️ フカイリくん</h3>
            <p className="text-xs text-gray-600 font-medium mb-2">クール気取りの不器用な努力家</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              無口で皮肉っぽいけど、内心はめちゃくちゃ真面目。実はアサイリちゃんをすごく信頼してる、情に厚い仲間想い。
            </p>
          </div>
        </div>

        {/* 二人の関係性 */}
        <div className="bg-white/40 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-medium text-gray-700">🤝 幼なじみの相棒タイプ</span><br />
            言葉が少なくても通じ合う二人。アサイリちゃんが日常担当、フカイリくんが裏方・決断担当。<br />
            どちらかが欠けると成立しない、自然体の信頼関係。
          </p>
        </div>
      </div>

      {/* 対話メッセージ */}
      <div className="space-y-3">
        {dialogues.map((message, index) => {
          const character = CHARACTERS[message.characterId];
          // 連続した同じキャラクターのメッセージではアバターを非表示
          const prevMessage = index > 0 ? dialogues[index - 1] : null;
          const showAvatar = !prevMessage || prevMessage.characterId !== message.characterId;

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
