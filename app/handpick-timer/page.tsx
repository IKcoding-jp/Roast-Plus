/**
 * ハンドピックタイマーページ
 */

'use client';

import { useAuth } from '@/lib/auth';
import { Loading } from '@/components/Loading';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import LoginPage from '@/app/login/page';
import { HandpickTimerMain } from '@/components/handpick/HandpickTimerMain';

export default function HandpickTimerPage() {
    const { user, loading: authLoading } = useAuth();
    useAppLifecycle();

    if (authLoading) {
        return <Loading />;
    }

    if (!user) {
        return <LoginPage />;
    }

    return <HandpickTimerMain />;
}
