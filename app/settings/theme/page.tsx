'use client';

import { useAuth } from '@/lib/auth';
import { Loading } from '@/components/Loading';
import { FloatingNav } from '@/components/ui';
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
        <div className="min-h-screen bg-page pt-14 pb-4 sm:pb-6 lg:pb-8 px-4 sm:px-6 lg:px-8 transition-colors">
            <FloatingNav backHref="/settings" />
            <div className="max-w-5xl mx-auto">
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
