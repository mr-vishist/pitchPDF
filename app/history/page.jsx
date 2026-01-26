'use client';

import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function HistoryPage() {
    return (
        <AuthenticatedLayout title="Proposal History">
            <div className="card">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: '#666' }}>No proposals history found.</p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
