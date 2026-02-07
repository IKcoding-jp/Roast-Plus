import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Coffee,
  PencilSimple,
  Quotes,
  Users,
  CalendarBlank,
  CaretRight,
  Notepad,
} from 'phosphor-react';
import type { TastingSession } from '@/types';
import type { AverageScores } from '@/lib/tastingUtils';
import { IconButton, Card } from '@/components/ui';

interface TastingSessionCardDesktopProps {
  session: TastingSession;
  recordCount: number;
  averageScores: AverageScores;
  comments: string[];
  activeMemberCount: number;
  isAnalyzing: boolean;
  getRoastBadgeStyle: (level: string) => { bg: string; text: string; label: string };
  formatDate: (dateStr: string) => string;
}

export function TastingSessionCardDesktop({
  session,
  recordCount,
  averageScores,
  comments,
  activeMemberCount,
  isAnalyzing,
  getRoastBadgeStyle,
  formatDate,
}: TastingSessionCardDesktopProps) {
  const router = useRouter();
  const roastStyle = getRoastBadgeStyle(session.roastLevel);
  const hasAnalysis = !!session.aiAnalysis;

  const cardBorderClass = 'border-edge';
  const textPrimaryClass = 'text-ink';
  const textSecondaryClass = 'text-ink-sub';
  const textMutedClass = 'text-ink-muted';
  const bgMutedClass = 'bg-ground';
  const bgSectionClass = 'bg-ground';
  const borderSectionClass = 'border-edge';
  const iconAccentClass = 'text-spot';
  const spinnerClass = 'border-spot';

  return (
    <div>
      <Link href={`/tasting?sessionId=${session.id}`} className="block group relative">
        <Card variant="hoverable" className="p-0 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
          <div className="relative z-10">
            <div className="h-full flex flex-col">
              {/* ヘッダー */}
              <div className={`px-8 pt-8 pb-6 border-b border-dashed ${cardBorderClass} flex items-center justify-between`}>
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div>
                    <div className="flex items-center gap-4 mb-1">
                      <h3 className={`text-4xl font-serif font-bold ${textPrimaryClass} tracking-tight leading-tight truncate`}>
                        {session.beanName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-3 py-1 text-xs font-bold rounded-full shadow-sm"
                          style={{
                            backgroundColor: roastStyle.bg,
                            color: roastStyle.text,
                          }}
                        >
                          {roastStyle.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <IconButton
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/tasting?sessionId=${session.id}&edit=true`);
                  }}
                  aria-label="編集"
                >
                  <PencilSimple size={22} weight="duotone" />
                </IconButton>
              </div>

              {/* メインコンテンツ */}
              <div className={`flex items-stretch border-b border-dashed ${cardBorderClass}`}>
                {/* 感想 (左) */}
                <div className={`flex-1 p-8 border-r border-dashed ${cardBorderClass} relative`}>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`flex items-center gap-2 ${textPrimaryClass}`}>
                        <Quotes size={20} weight="fill" />
                        <h4 className="text-base font-bold">感想</h4>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2 py-1 ${bgMutedClass} rounded-md text-xs ${textSecondaryClass}`}>
                        <Users size={14} weight="fill" />
                        <span>
                          {recordCount} / {activeMemberCount}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-h-[160px] max-h-[300px] overflow-y-auto pr-2">
                      {comments.length > 0 ? (
                        <ul className="space-y-4">
                          {comments.map((comment, commentIndex) => (
                            <li
                              key={commentIndex}
                              className={`text-sm italic ${textSecondaryClass} leading-relaxed relative pl-4 border-l-2 ${cardBorderClass}`}
                            >
                              &ldquo;{comment}&rdquo;
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-40 py-4">
                          <Coffee size={40} weight="thin" className={textMutedClass} />
                          <p className={`text-xs ${textMutedClass} italic`}>まだ感想がありません...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* チャート (右) */}
                <div className="w-80 flex-shrink-0 p-8 flex flex-col justify-center relative overflow-hidden">
                  {recordCount > 0 ? (
                    <div className="space-y-5 w-full relative z-10">
                      {[
                        { label: '苦味', value: averageScores.bitterness, color: '#3e2723' },
                        { label: '酸味', value: averageScores.acidity, color: '#ff7043' },
                        { label: 'ボディ', value: averageScores.body, color: '#8d6e63' },
                        { label: '甘み', value: averageScores.sweetness, color: '#d81b60' },
                        { label: '香り', value: averageScores.aroma, color: '#00897b' },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1">
                          <div className={`flex justify-between items-center text-xs font-bold ${textSecondaryClass}`}>
                            <span>{item.label}</span>
                            <span>{item.value.toFixed(1)}</span>
                          </div>
                          <div className={`w-full ${bgMutedClass} h-1.5 rounded overflow-hidden`}>
                            <div
                              className="h-full transition-all duration-700"
                              style={{
                                width: `${((item.value - 1) / 4) * 100}%`,
                                backgroundColor: item.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed ${cardBorderClass} rounded-xl p-8 opacity-60`}>
                      <Coffee size={40} weight="thin" className={textMutedClass} />
                      <p className={`text-xs font-bold ${textMutedClass} tracking-widest text-center`}>
                        データなし
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI分析レポート (下) */}
              <div className="p-8 relative min-h-[120px] transition-all duration-500">
                <div className="relative z-10">
                  {!hasAnalysis && !isAnalyzing && recordCount === 0 && (
                    <div className="flex items-center justify-center py-2">
                      <p className={`text-xs ${textSecondaryClass} italic`}>
                        記録が追加されるとAI分析が開始されます
                      </p>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center py-6 gap-3">
                      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${spinnerClass}`}></div>
                      <p className={`text-xs ${textSecondaryClass} animate-pulse`}>
                        コーヒーの香りを分析中...
                      </p>
                    </div>
                  )}

                  {hasAnalysis && (
                    <div className={`${bgSectionClass} rounded-xl p-6 border ${borderSectionClass}`}>
                      <div className="flex items-center gap-2 mb-4">
                        <Notepad size={20} weight="fill" className={iconAccentClass} />
                        <h4 className={`text-sm font-bold tracking-wide ${textPrimaryClass}`}>
                          AIコーヒーマイスターのコメント
                        </h4>
                      </div>
                      <p className={`text-sm leading-relaxed ${textPrimaryClass} whitespace-pre-wrap`}>
                        {session.aiAnalysis}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* フッター */}
              <div className={`px-8 py-4 ${bgSectionClass} border-t ${borderSectionClass} flex justify-between items-center`}>
                <div className={`flex items-center gap-1.5 text-xs ${textMutedClass}`}>
                  <CalendarBlank size={14} weight="fill" />
                  <span>{formatDate(session.createdAt)}</span>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${textSecondaryClass} hover:${iconAccentClass} transition-colors cursor-pointer`}>
                  記録を追加する <CaretRight size={14} weight="bold" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
