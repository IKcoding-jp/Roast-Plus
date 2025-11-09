'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { HiArrowLeft, HiCheckCircle, HiLightBulb } from 'react-icons/hi';
import { MdTimer, MdNotifications, MdSchedule } from 'react-icons/md';
import LoginPage from '@/app/login/page';

export default function RoastTimerPage() {
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
              className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center gap-2 flex-shrink-0"
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
              <MdTimer className="h-16 w-16 text-amber-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-4">
              ローストタイマーとは
            </h2>
            <p className="text-gray-600 text-center text-base sm:text-lg leading-relaxed mb-8">
              ロースト作業の時間管理をサポートする機能です。ロースト開始から完了まで、各段階をタイマーで管理します。
            </p>

            {/* 主な機能 */}
            <div className="border-t border-gray-200 pt-6 mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-6">
                主な機能
              </h3>
              
              <div className="space-y-6">
                {/* ローストタイマー */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <MdTimer className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      ローストタイマー
                    </h4>
                    <ul className="text-gray-600 space-y-1 text-sm sm:text-base">
                      <li>• ロースト開始時にボタンでスタート</li>
                      <li>• 残り時間をリアルタイムで表示</li>
                      <li>• 一時停止・再開が可能（ハンドピックなどの作業中も対応）</li>
                      <li>• 完了時にアラームで「タッパーと木べらを持って焙煎室に行くタイミング」をお知らせします</li>
                    </ul>
                  </div>
                </div>

                {/* おすすめ時間機能 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <HiLightBulb className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      おすすめ時間機能
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      過去の同じ豆・同じ量・同じ焙煎度合いの記録があれば、自動でおすすめ時間を表示します。まずは提案時間で試し、慣れてきたら微調整できます。
                    </p>
                  </div>
                </div>

                {/* アラーム機能 */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <MdNotifications className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      アラーム機能
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base">
                      各タイマー完了時にアラームでお知らせします。アプリを閉じていてもアラームが届きます。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 将来の機能 */}
            <div className="border-t border-gray-200 pt-6 mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-6">
                将来の機能
              </h3>
              
              {/* ローストスケジュール連携機能 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <MdSchedule className="h-8 w-8 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    ローストスケジュールとの連携・自動化
                  </h4>
                  <p className="text-gray-600 text-sm sm:text-base mb-3">
                    ローストスケジュールに登録されたロースト作業とタイマーを連携させ、自動化を実現します。
                  </p>
                  <ul className="text-gray-600 space-y-1 text-sm sm:text-base">
                    <li>• <span className="font-semibold">自動タイマー開始：</span>スケジュールに登録されたロースト作業の時間に合わせて、自動的にタイマーを準備・開始します</li>
                    <li>• <span className="font-semibold">データ自動取得：</span>豆の名前、重さ、焙煎度合いなどの情報をスケジュールから自動的に取得し、タイマーに反映します</li>
                    <li>• <span className="font-semibold">作業効率の向上：</span>手動での設定が不要になり、スケジュール通りにスムーズにロースト作業を進められます</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 使い方の流れ */}
            <div className="border-t border-gray-200 pt-6 mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-6">
                使い方の流れ
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white font-semibold text-sm">
                    1
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base pt-1">
                    豆を入れてローストを開始し、ローストタイマーをスタート
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white font-semibold text-sm">
                    2
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base pt-1">
                    必要に応じて一時停止・再開
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white font-semibold text-sm">
                    3
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base pt-1">
                    ロースト完了のアラームを受け取る
                  </p>
                </div>
              </div>
            </div>

            {/* 便利なポイント */}
            <div className="border-t border-gray-200 pt-6 mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-6">
                便利なポイント
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <HiCheckCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 text-sm sm:text-base">
                    <span className="font-semibold">シンプル操作：</span>ボタンで開始・停止・再開
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <HiCheckCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 text-sm sm:text-base">
                    <span className="font-semibold">過去の記録を活用：</span>おすすめ時間で迷わない
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <HiCheckCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 text-sm sm:text-base">
                    <span className="font-semibold">アラームで見逃さない：</span>アプリを閉じていても完了をお知らせ
                  </p>
                </div>
              </div>
            </div>

            {/* 開発予定の注記 */}
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-center">
                <p className="text-amber-800 font-medium text-sm sm:text-base">
                  その内開発予定。たぶん
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

