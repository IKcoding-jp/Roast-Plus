'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { HiArrowLeft, HiSearch, HiFilter, HiEye, HiUsers } from 'react-icons/hi';
import { RiBookFill, RiDatabaseLine } from 'react-icons/ri';
import { MdGridView, MdCompareArrows } from 'react-icons/md';
import LoginPage from '@/app/login/page';

export default function DefectBeansPage() {
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
              <RiBookFill className="h-16 w-16 text-amber-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-4">
              欠点豆図鑑とは
            </h2>
            <p className="text-gray-600 text-center text-base sm:text-lg leading-relaxed mb-8">
              コーヒー豆の欠点豆の種類や特徴を図鑑形式で表示する機能です。ハンドピック作業中に、欠点豆か正常豆か迷ったときに、正しい知識を確認して精度の高いハンドピックを実現します。
            </p>

            {/* 主な機能 */}
            <div className="border-t border-gray-200 pt-6 mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-6">
                主な機能
              </h3>
              
              <div className="space-y-6">
                {/* グリッドレイアウト表示 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <MdGridView className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      グリッドレイアウトでのカード表示
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      欠点豆をカード形式で一覧表示します。各カードには画像、名称、特徴が表示され、一目で複数の欠点豆を確認できます。
                    </p>
                  </div>
                </div>

                {/* 検索機能 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <HiSearch className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      検索機能
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      欠点豆の種類で検索できます。名称や特徴を入力することで、目的の欠点豆を素早く見つけられます。
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
                      カテゴリやタグでフィルタリングできます。見た目による分類や原因による分類など、様々な観点から欠点豆を絞り込めます。
                    </p>
                  </div>
                </div>

                {/* カード展開表示 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <HiEye className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      カード展開表示
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base mb-2">
                      カードをタップすると、カード内で展開して詳細情報を表示します。以下の情報が表示されます：
                    </p>
                    <ul className="text-gray-600 space-y-1 text-sm sm:text-base ml-4 mb-3">
                      <li>• 欠点豆の名称</li>
                      <li>• 画像</li>
                      <li>• 特徴（見た目の説明）</li>
                      <li>• 味への影響</li>
                      <li>• 省く理由</li>
                    </ul>
                    <p className="text-gray-600 text-sm sm:text-base">
                      さらに、カード内で<span className="font-semibold">「省く」「省かない」</span>を切り替えることができます。この設定により、チーム全体でどの欠点豆を省くべきかの共有認識を設定できます。
                    </p>
                  </div>
                </div>

                {/* チーム共有認識設定機能 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <HiUsers className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      チーム共有認識設定機能
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base mb-2">
                      各欠点豆について、チーム全体で<span className="font-semibold">「この豆は省く」「この豆は省かない」</span>という共有認識を設定できます。
                    </p>
                    <ul className="text-gray-600 space-y-1 text-sm sm:text-base ml-4">
                      <li>• カードをタップして展開し、「省く」「省かない」を切り替え</li>
                      <li>• 設定はチーム全体で共有され、全員が同じ認識でハンドピック作業を行えます</li>
                      <li>• カードには現在の設定状態（省く/省かない）が視覚的に表示されます</li>
                      <li>• チームの判断基準を統一することで、ハンドピックの品質を向上させます</li>
                    </ul>
                  </div>
                </div>

                {/* 比較機能 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <MdCompareArrows className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      比較機能
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      複数の欠点豆を並べて比較表示できます。似たような欠点豆の違いを確認したり、複数の欠点豆の特徴を同時に比較したりできます。
                    </p>
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
                      <span><span className="font-semibold">読み取り専用：</span>ユーザーは欠点豆の情報を閲覧するのみです</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span><span className="font-semibold">開発者が事前登録：</span>欠点豆の情報は開発者が事前に登録します</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span><span className="font-semibold">不定期更新：</span>新しい欠点豆が発見された場合など、必要に応じて開発者が追加・更新します</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span><span className="font-semibold">画像管理：</span>既存の画像をアップロードして使用します</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span><span className="font-semibold">チーム設定の共有：</span>「省く」「省かない」の設定はチーム全体で共有され、Firestoreで管理されます</span>
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

