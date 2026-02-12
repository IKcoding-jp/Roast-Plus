'use client';

import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import { useAuth } from '@/lib/auth';
import { Loading } from '@/components/Loading';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import LoginPage from '@/app/login/page';

export default function ThemeSettingsPage() {
    const { user, loading: authLoading } = useAuth();

    if (authLoading) {
        return <Loading />;
    }

    if (!user) {
        return <LoginPage />;
    }

    return (
        <div className="min-h-screen bg-page py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 transition-colors">
            <div className="max-w-4xl mx-auto">
                <header className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex justify-start w-full sm:w-auto sm:flex-1">
                            <Link
                                href="/settings"
                                className="px-3 py-2 text-ink-sub hover:text-ink hover:bg-ground rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
                                title="設定に戻る"
                                aria-label="設定に戻る"
                            >
                                <HiArrowLeft className="h-6 w-6 flex-shrink-0" />
                            </Link>
                        </div>
                        <h1 className="w-full sm:w-auto text-2xl sm:text-3xl font-bold text-ink sm:flex-1 text-center">
                            テーマ設定
                        </h1>
                        <div className="hidden sm:block flex-1 flex-shrink-0"></div>
                    </div>
                </header>

                <main className="space-y-6">
                    <ThemeSelector />

                    <p className="text-center text-sm text-ink-muted">
                        新しいテーマは今後も追加予定です。リクエストもお待ちしています!
                    </p>
                </main>
            </div>
        </div>
    );
}
