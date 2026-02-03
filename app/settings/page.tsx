'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, signOut } from '@/lib/auth';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { useChristmasMode } from '@/hooks/useChristmasMode';
import { useAppVersion } from '@/hooks/useAppVersion';
import { Loading } from '@/components/Loading';
import { useToastContext } from '@/components/Toast';
import { ToggleSwitch } from '@/components/settings/ToggleSwitch';
import { PasswordModal } from '@/components/settings/PasswordModal';
import { HiArrowLeft, HiDocumentText, HiShieldCheck, HiLogout, HiMail } from 'react-icons/hi';
import { MdHistory } from 'react-icons/md';
import LoginPage from '@/app/login/page';
import { Button } from '@/components/ui';
import { VERSION_HISTORY } from '@/data/dev-stories/version-history';
import { getUserData } from '@/lib/firestore';
import { formatConsentDate } from '@/lib/consent';
import { UserConsent } from '@/types';

export default function SettingsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { isEnabled, isLoading: devModeLoading, enableDeveloperMode, disableDeveloperMode } = useDeveloperMode();
    const { showToast } = useToastContext();
    const { version, isUpdateAvailable, isChecking, checkForUpdates, applyUpdate } = useAppVersion();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [userConsent, setUserConsent] = useState<UserConsent | null>(null);

    const { isChristmasMode, setChristmasMode } = useChristmasMode();

    // 同意日時を取得
    useEffect(() => {
        async function fetchUserConsent() {
            if (!user) return;
            try {
                const userData = await getUserData(user.uid);
                if (userData.userConsent) {
                    setUserConsent(userData.userConsent);
                }
            } catch (error) {
                console.error('同意情報の取得に失敗:', error);
                showToast('同意情報の取得に失敗しました。', 'error');
            }
        }
        fetchUserConsent();
    }, [user, showToast]);

    if (authLoading || devModeLoading) {
        return <Loading />;
    }

    if (!user) {
        return <LoginPage />;
    }

    const handleToggleChange = (checked: boolean) => {
        if (checked) {
            // ONにする場合はパスワード入力モーダルを表示
            setShowPasswordModal(true);
        } else {
            // OFFにする場合は即座に無効化
            disableDeveloperMode();
        }
    };

    const handlePasswordSubmit = (password: string): boolean => {
        const success = enableDeveloperMode(password);
        if (success) {
            setShowPasswordModal(false);
        }
        return success;
    };

    const handleCancelPassword = () => {
        setShowPasswordModal(false);
    };

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('ログアウトエラー:', error);
            showToast('ログアウトに失敗しました。', 'error');
        }
    };

    return (
        <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F7F7F5' }}>
            <div className="max-w-4xl mx-auto">
                <header className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex justify-start w-full sm:w-auto sm:flex-1">
                            <Link
                                href="/"
                                className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
                                title="戻る"
                                aria-label="戻る"
                            >
                                <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
                            </Link>
                        </div>
                        <h1 className="w-full sm:w-auto text-2xl sm:text-3xl font-bold text-gray-800 sm:flex-1 text-center">
                            その他
                        </h1>
                        <div className="hidden sm:block flex-1 flex-shrink-0"></div>
                    </div>
                </header>

                <main className="space-y-6">
                    {/* クリスマスモードセクション */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <span className="text-red-600">🎄</span> クリスマスモード
                                </h2>
                                <p className="text-sm text-gray-600">
                                    ホーム画面をクリスマス仕様に変更します
                                </p>
                            </div>
                            <div className="ml-4">
                                <ToggleSwitch
                                    checked={isChristmasMode}
                                    onChange={setChristmasMode}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 開発者モードセクション */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    開発者モード
                                </h2>
                                <p className="text-sm text-gray-600">
                                    開発者向けの機能を有効化します
                                </p>
                            </div>
                            <div className="ml-4">
                                <ToggleSwitch
                                    checked={isEnabled}
                                    onChange={handleToggleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* アプリバージョンセクション */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            アプリバージョン
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">現在のバージョン</p>
                                    <p className="text-lg font-medium text-gray-800">
                                        {version || '読み込み中...'}
                                    </p>
                                </div>
                                {isUpdateAvailable && (
                                    <div className="ml-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                                            更新あり
                                        </span>
                                    </div>
                                )}
                            </div>
                            {isUpdateAvailable && (
                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-3">
                                        新しいバージョンが利用可能です。更新を適用してください。
                                    </p>
                                    <Button variant="primary" size="md" onClick={applyUpdate}>
                                        更新する
                                    </Button>
                                </div>
                            )}
                            {!isUpdateAvailable && process.env.NODE_ENV === 'production' && (
                                <div className="pt-4 border-t border-gray-200">
                                    <Button
                                        variant="outline"
                                        size="md"
                                        onClick={checkForUpdates}
                                        disabled={isChecking}
                                        loading={isChecking}
                                    >
                                        {isChecking ? '確認中...' : '更新を確認'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 更新履歴セクション */}
                    <Link
                        href="/changelog"
                        className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <MdHistory className="h-5 w-5 text-amber-500" />
                                    更新履歴
                                </h2>
                                <p className="text-sm text-gray-600">
                                    アプリの更新内容を確認する
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    最新: v{VERSION_HISTORY[0]?.version} ({VERSION_HISTORY[0]?.date})
                                </p>
                            </div>
                            <span className="text-gray-400 text-xl">&gt;</span>
                        </div>
                    </Link>

                    {/* 法的情報セクション */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <HiDocumentText className="h-5 w-5 text-gray-600" />
                            法的情報
                        </h2>
                        <div className="space-y-4">
                            {/* 利用規約リンク */}
                            <Link
                                href="/terms"
                                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <HiDocumentText className="h-5 w-5 text-orange-500" />
                                    <span className="text-gray-800 font-medium">利用規約</span>
                                </div>
                                <span className="text-gray-400">&gt;</span>
                            </Link>

                            {/* プライバシーポリシーリンク */}
                            <Link
                                href="/privacy-policy"
                                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <HiShieldCheck className="h-5 w-5 text-orange-500" />
                                    <span className="text-gray-800 font-medium">プライバシーポリシー</span>
                                </div>
                                <span className="text-gray-400">&gt;</span>
                            </Link>

                            {/* お問い合わせリンク */}
                            <Link
                                href="/contact"
                                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <HiMail className="h-5 w-5 text-orange-500" />
                                    <span className="text-gray-800 font-medium">お問い合わせ</span>
                                </div>
                                <span className="text-gray-400">&gt;</span>
                            </Link>

                            {/* 同意日時 */}
                            {userConsent && userConsent.hasAgreed && (
                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-500">
                                        同意日: {formatConsentDate(userConsent.agreedAt)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        利用規約 v{userConsent.agreedTermsVersion} / プライバシーポリシー v{userConsent.agreedPrivacyVersion}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* アカウントセクション */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <HiLogout className="h-5 w-5 text-gray-600" />
                            アカウント
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">ログイン中のアカウント</p>
                                    <p className="text-sm font-medium text-gray-800">
                                        {user.email || 'メールアドレスなし'}
                                    </p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-200">
                                <Button
                                    variant="danger"
                                    size="md"
                                    fullWidth
                                    onClick={handleLogout}
                                    className="!bg-red-50 !text-red-600 hover:!bg-red-100"
                                >
                                    <HiLogout className="h-5 w-5 mr-2" />
                                    ログアウト
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* パスワード入力モーダル */}
                {showPasswordModal && (
                    <PasswordModal
                        onSubmit={handlePasswordSubmit}
                        onCancel={handleCancelPassword}
                    />
                )}

            </div>
        </div>
    );
}
