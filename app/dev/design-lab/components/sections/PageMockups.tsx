'use client';

import { useState } from 'react';
import TimerPatternA from '../mockups/TimerPatternA';
import TimerPatternB from '../mockups/TimerPatternB';
import TimerPatternC from '../mockups/TimerPatternC';
import TimerPatternD from '../mockups/TimerPatternD';
import TimerPatternE from '../mockups/TimerPatternE';
import TimerPatternF from '../mockups/TimerPatternF';
import TimerPatternG from '../mockups/TimerPatternG';
import TimerPatternH from '../mockups/TimerPatternH';
import TitlePatterns from '../mockups/TitlePatterns';

const patterns = [
  {
    id: 'H',
    title: 'Pattern H: 統合カード型 (最新)',
    description: '温かみのあるアトモスフィア + 現在ステップとカウントダウンを1枚のカードに統合。プレミアムな質感。',
    Component: TimerPatternH,
  },
  {
    id: 'G',
    title: 'Pattern G: カウントダウン強調型',
    description: 'カード型ベース + 次ステップまでのカウントダウンを主役に配置。プログレスバーで残り時間を視覚化。',
    Component: TimerPatternG,
  },
  {
    id: 'F',
    title: 'Pattern F: A×Cハイブリッド型',
    description: '円形プログレス（ステップ内経過）+ カード型NOW/NEXT。シンプルかつ視覚的。',
    Component: TimerPatternF,
  },
  {
    id: 'A',
    title: 'Pattern A: タイムラインカード型',
    description: '現在・次のステップをカード形式で縦に配置。情報量が多く一覧性が高い。',
    Component: TimerPatternA,
  },
  {
    id: 'B',
    title: 'Pattern B: フォーカスモード型',
    description: '超シンプル・ミニマル。タイマーとアクションだけを大きく表示し集中を促す。',
    Component: TimerPatternB,
  },
  {
    id: 'C',
    title: 'Pattern C: 環状プログレス型',
    description: 'Apple Watch風の円形プログレスリング。タイマーがリング中央に配置。',
    Component: TimerPatternC,
  },
  {
    id: 'D',
    title: 'Pattern D: スプリットビュー型',
    description: '画面を上下2分割。「今」と「次」が常に視覚的に分離されている。',
    Component: TimerPatternD,
  },
  {
    id: 'E',
    title: 'Pattern E: ステップスライダー型',
    description: 'カルーセル風。前後のステップが見切れて表示され遷移が直感的。',
    Component: TimerPatternE,
  },
];

export default function PageMockups() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="space-y-12">
      {/* Title Design Patterns */}
      <TitlePatterns />

      <hr className="border-edge" />

      {/* Timer Design Patterns */}
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-ink mb-1">
          ドリップガイド タイマー画面 デザインモック
        </h2>
        <p className="text-sm text-ink-sub">
          Issue #200: 8パターンのUI改善案。Pattern Hが最新の統合カード型。
        </p>
      </div>

      {/* Pattern Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedId(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedId === null
              ? 'bg-spot text-white'
              : 'bg-ground text-ink-sub hover:text-ink'
          }`}
        >
          全て表示
        </button>
        {patterns.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedId === p.id
                ? 'bg-spot text-white'
                : 'bg-ground text-ink-sub hover:text-ink'
            }`}
          >
            {p.id}: {p.title.split(': ')[1]}
          </button>
        ))}
      </div>

      {/* Pattern Grid */}
      <div
        className={
          selectedId
            ? 'flex justify-center'
            : 'grid grid-cols-1 xl:grid-cols-2 gap-8'
        }
      >
        {patterns
          .filter((p) => !selectedId || p.id === selectedId)
          .map((p) => (
            <div key={p.id} className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-ink">{p.title}</h3>
                <p className="text-xs text-ink-muted">{p.description}</p>
              </div>
              <p.Component />
            </div>
          ))}
      </div>
      </div>
    </div>
  );
}
