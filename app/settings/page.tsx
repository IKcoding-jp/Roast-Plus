'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { useChristmasMode } from '@/hooks/useChristmasMode';
import { useAppVersion } from '@/hooks/useAppVersion';
import { Loading } from '@/components/Loading';
import { HiArrowLeft } from 'react-icons/hi';
import { MdHistory } from 'react-icons/md';
import LoginPage from '@/app/login/page';
import { VersionHistory } from '@/components/settings/VersionHistory';
import { VERSION_HISTORY } from '@/data/dev-stories/version-history';

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const { isEnabled, isLoading: devModeLoading, enableDeveloperMode, disableDeveloperMode } = useDeveloperMode();
    const { version, isUpdateAvailable, isChecking, checkForUpdates, applyUpdate } = useAppVersion();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const { isChristmasMode, setChristmasMode } = useChristmasMode();

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
            setPassword('');
            setPasswordError(null);
        } else {
            // OFFにする場合は即座に無効化
            disableDeveloperMode();
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);

        if (enableDeveloperMode(password)) {
            setShowPasswordModal(false);
            setPassword('');
        } else {
            setPasswordError('パスワードが正しくありません');
        }
    };

    const handleCancelPassword = () => {
        setShowPasswordModal(false);
        setPassword('');
        setPasswordError(null);
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
                                    <button
                                        onClick={applyUpdate}
                                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                                    >
                                        更新する
                                    </button>
                                </div>
                            )}
                            {!isUpdateAvailable && process.env.NODE_ENV === 'production' && (
                                <div className="pt-4 border-t border-gray-200">
                                    <button
                                        onClick={checkForUpdates}
                                        disabled={isChecking}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isChecking ? '確認中...' : '更新を確認'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 更新履歴セクション */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <MdHistory className="h-5 w-5 text-gray-600" />
                            更新履歴
                        </h2>
                        <VersionHistory entries={VERSION_HISTORY} maxDisplay={5} />
                    </div>
                </main>

                {/* パスワード入力モーダル */}
                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                パスワードを入力
                            </h3>
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="mb-4">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        パスワード
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setPasswordError(null);
                                        }}
                                        className={`w-full px-4 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 ${passwordError ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="パスワードを入力"
                                        autoFocus
                                    />
                                    {passwordError && (
                                        <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                                    )}
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCancelPassword}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                    >
                                        確定
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

// トグルスイッチコンポーネント
interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${checked ? 'bg-orange-500' : 'bg-gray-300'
                }`}
        >
            <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'
                    }`}
            />
        </button>
    );
}
