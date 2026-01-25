'use client';

import { useAuthGuard, AuthLoading } from '@/utils/authGuard';

export default function BillingPage() {
    const { user, loading } = useAuthGuard();

    if (loading) {
        return <AuthLoading />;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Billing</h1>
            <p>This page is protected. User: {user?.email}</p>
        </div>
    );
}
