'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import styles from './dashboard.module.css';

export default function DashboardPage() {
    const router = useRouter();

    return (
        <AuthenticatedLayout
            title="Dashboard"
            subtitle="Create and manage your proposals with ease."
            actions={(
                <>
                    <button
                        className={styles.primaryButton}
                        onClick={() => router.push('/generate')}
                    >
                        + New Proposal
                    </button>
                </>
            )}
        >
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.statCardPrimary}`}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Total Proposals</span>
                        <span className={styles.statArrow}>↗</span>
                    </div>
                    <div className={styles.statValue}>0</div>
                    <div className={styles.statFooter}>Get started by creating one</div>
                </div>
            </div>

            {/* Content Grid */}
            <div className={styles.contentGrid}>
                {/* Recent Activity */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Recent Proposals</h2>
                        <Link href="/history" className={styles.viewAllLink} style={{ fontSize: '0.9rem', color: '#666', textDecoration: 'none' }}>
                            View All
                        </Link>
                    </div>
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>📄</span>
                        <p className={styles.emptyText}>No proposals yet</p>
                        <p className={styles.emptySubtext}>Create your first proposal to get started</p>
                    </div>
                </div>

                {/* Billing */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Billing</h2>
                    </div>
                    <div className={styles.billingInfo}>
                        <p className={styles.planDetails} style={{ marginBottom: '1rem' }}>Manage your subscription and credits.</p>
                        <button
                            className={styles.upgradeButton}
                            onClick={() => router.push('/billing')}
                        >
                            View Plans
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

