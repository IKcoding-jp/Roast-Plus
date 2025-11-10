'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { HiArrowLeft, HiPlus, HiFilter, HiPencil, HiClock, HiUsers } from 'react-icons/hi';
import { RiDatabaseLine } from 'react-icons/ri';
import { MdTimeline, MdGridView, MdSort } from 'react-icons/md';
import LoginPage from '@/app/login/page';

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-amber-50 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <div className="flex justify-start">
            <Link
              href="/"
              className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center gap-2 flex-shrink-0 min-h-[44px]"
            >
              <HiArrowLeft className="text-lg flex-shrink-0" />
              ホームに戻る
            </Link>
          </div>
        </header>

        <main className="space-y-6 sm:space-y-8">
          {/* 全てのセクションを1つのカードに統合 */}
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
            {/* ヘロセクション */}
            <div className="flex justify-center mb-6">
              <MdTimeline className="h-16 w-16 text-amber-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-4">
              作業進捗とは
            </h2>
            <p className="text-gray-600 text-center text-base sm:text-lg leading-relaxed mb-8">
              入荷したコーヒー豆の作業進捗を管理する機能です。豆の名前、重量、作業名、進捗状態を記録し、チーム全体で現在の作業状況を共有できます。
            </p>

            {/* 主な機能 */}
            <div className="border-t border-gray-200 pt-6 mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-6">
                主な機能
              </h3>
              
              <div className="space-y-6">
                {/* 作業の登録 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <HiPlus className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      作業の登録
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base mb-2">
                      豆の名前、重量、作業名を手動入力して作業を登録できます。必須項目は設定されていないため、必要な情報だけを入力できます。
                    </p>
                    <p className="text-gray-600 text-sm sm:text-base">
                      例：コロンビア10kg、ハンドピック
                    </p>
                  </div>
                </div>

                {/* カード形式での表示 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <MdGridView className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      カード形式での表示
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      作業をカード形式で一覧表示します。同じ豆に対して複数の作業がある場合、1つのカードにまとめて表示されます。各カードには豆の名前、重量、作業名、進捗状態が表示されます。
                    </p>
                  </div>
                </div>

                {/* 進捗状態の管理 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <MdTimeline className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      進捗状態の管理
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base mb-2">
                      各作業の進捗状態を<span className="font-semibold">「前」（未着手）</span>、<span className="font-semibold">「途中」</span>、<span className="font-semibold">「済」（完了）</span>から選択できます。
                    </p>
                    <ul className="text-gray-600 space-y-1 text-sm sm:text-base ml-4">
                      <li>• ドロップダウンで進捗状態を選択</li>
                      <li>• 誰でも進捗状態を変更可能</li>
                      <li>• 「済」になった作業も一覧に表示し続けます</li>
                    </ul>
                  </div>
                </div>

                {/* 複数作業の同時管理 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <HiPencil className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      複数作業の同時管理
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      同じ豆（例：コロンビア10kg）に対して複数の作業を登録できます。1つのカードに複数の作業をまとめて表示するため、同じ豆の作業状況を一目で確認できます。
                    </p>
                  </div>
                </div>

                {/* ソート機能 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <MdSort className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      ソート機能
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      作業一覧を様々な順序で並び替えられます。追加日時順、豆の名前順、進捗状態順など、目的に応じて最適な表示順序を選択できます。
                    </p>
                  </div>
                </div>

                {/* フィルタ機能 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <HiFilter className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      フィルタ機能
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      豆の名前、作業名、進捗状態でフィルタリングできます。特定の豆の作業だけを表示したり、「途中」の作業だけを確認したりできます。
                    </p>
                  </div>
                </div>

                {/* メモ・備考機能 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <HiPencil className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      メモ・備考機能
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      各作業にメモや備考を追加できます。作業に関する注意事項や補足情報を記録し、チーム全体で共有できます。
                    </p>
                  </div>
                </div>

                {/* 日時記録 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <HiClock className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      日時記録
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      作業の開始日時と完了日時を自動的に記録します。進捗状態が「途中」になったときに開始日時が記録され、「済」になったときに完了日時が記録されます。
                    </p>
                  </div>
                </div>

                {/* 変更履歴 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <HiClock className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      変更履歴
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      作業の変更履歴を記録します。誰がいつ変更したかを記録することで、作業の経緯を追跡できます。
                    </p>
                  </div>
                </div>

                {/* チーム全体での共有 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <HiUsers className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      チーム全体での共有
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base mb-2">
                      作業進捗はチーム全体で共有されます。全員が同じ進捗情報を確認・編集でき、リアルタイムで更新されます。
                    </p>
                    <ul className="text-gray-600 space-y-1 text-sm sm:text-base ml-4">
                      <li>• 誰でも作業を追加・編集・削除可能</li>
                      <li>• 進捗状態の変更も誰でも可能</li>
                      <li>• 変更は即座に全員に反映されます</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* データ管理 */}
            <div className="border-t border-gray-200 pt-6 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <RiDatabaseLine className="h-8 w-8 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    データ管理
                  </h3>
                  <ul className="text-gray-700 space-y-2 text-sm sm:text-base">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span><span className="font-semibold">チーム全体で共有：</span>作業進捗はチーム全体で共有され、Firestoreで管理されます</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span><span className="font-semibold">リアルタイム更新：</span>変更は即座に全員のデバイスに反映されます</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span><span className="font-semibold">変更履歴の記録：</span>誰がいつ変更したかを記録し、作業の経緯を追跡できます</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span><span className="font-semibold">日時の自動記録：</span>作業の開始日時と完了日時が自動的に記録されます</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 開発予定の注記 */}
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-center">
                <p className="text-amber-800 font-medium text-sm sm:text-base">
                  この機能は開発予定です。しばらくお待ちください。
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

