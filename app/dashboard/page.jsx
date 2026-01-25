'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { useAuthGuard, AuthLoading } from '@/utils/authGuard';
import styles from './dashboard.module.css';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading } = useAuthGuard();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Show loading while checking auth or hydrating
    if (!mounted || loading) {
        return <AuthLoading />;
    }

    const userName = user?.displayName || user?.email?.split('@')[0] || 'User';
    const userEmail = user?.email || 'No email';

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}></span>
                        pitchPDF
                    </div>
                </div>

                <nav className={styles.nav}>
                    <div className={styles.navSection}>
                        <span className={styles.navLabel}>MENU</span>
                        <a href="#" className={`${styles.navItem} ${styles.navItemActive}`}>
                            <span className={styles.navIcon}>📊</span>
                            Dashboard
                        </a>
                        <a href="#" className={styles.navItem}>
                            <span className={styles.navIcon}>📄</span>
                            Proposals
                        </a>
                    </div>

                    <div className={styles.navSection}>
                        <span className={styles.navLabel}>GENERAL</span>
                        <a href="#" className={styles.navItem}>
                            <span className={styles.navIcon}>⚙️</span>
                            Settings
                        </a>
                        <a href="#" className={styles.navItem}>
                            <span className={styles.navIcon}>❓</span>
                            Help
                        </a>
                        <button onClick={handleLogout} className={styles.navItem}>
                            <span className={styles.navIcon}>🚪</span>
                            Logout
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className={styles.mainWrapper}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.searchBar}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search proposals..."
                            className={styles.searchInput}
                        />
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.userInfo}>
                            <div className={styles.avatar}>
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.userDetails}>
                                <span className={styles.userName}>{userName}</span>
                                <span className={styles.userEmail}>{userEmail}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className={styles.main}>
                    <div className={styles.pageHeader}>
                        <div>
                            <h1 className={styles.pageTitle}>Dashboard</h1>
                            <p className={styles.pageSubtitle}>Create and manage your proposals with ease.</p>
                        </div>
                        <div className={styles.pageActions}>
                            <button className={styles.primaryButton}>
                                + New Proposal
                            </button>
                            <button className={styles.secondaryButton}>
                                Import
                            </button>
                        </div>
                    </div>

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
                                <div className={styles.planBadge}>Free Plan</div>
                                <p className={styles.planDetails}>0 / 3 proposals this month</p>
                                <button className={styles.upgradeButton}>Upgrade Plan</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
