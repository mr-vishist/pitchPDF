'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { useAuthGuard, AuthLoading } from '@/utils/authGuard';
import { useTheme } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import styles from '../app/dashboard/dashboard.module.css';

export default function AuthenticatedLayout({ children, title, subtitle, actions }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading } = useAuthGuard();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    if (loading) {
        return <AuthLoading />;
    }

    const userName = user?.displayName || user?.email?.split('@')[0] || 'User';
    const userEmail = user?.email || 'No email';

    return (
        <div className={styles.layout}>
            {/* Mobile Backdrop */}
            <div
                className={`${styles.backdrop} ${isMobileMenuOpen ? styles.visible : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}></span>
                        pitchPDF
                    </div>
                </div>

                <nav className={styles.nav}>
                    <div className={styles.navSection}>
                        <span className={styles.navLabel}>MENU</span>
                        <Link href="/dashboard" className={`${styles.navItem} ${pathname === '/dashboard' ? styles.navItemActive : ''}`}>
                            <span className={styles.navIcon}>📊</span>
                            Dashboard
                        </Link>
                        <Link href="/history" className={`${styles.navItem} ${pathname === '/history' ? styles.navItemActive : ''}`}>
                            <span className={styles.navIcon}>📄</span>
                            History
                        </Link>
                        <Link href="/generate" className={`${styles.navItem} ${pathname === '/generate' ? styles.navItemActive : ''}`}>
                            <span className={styles.navIcon}>✨</span>
                            Generate Proposal
                        </Link>
                    </div>

                    <div className={styles.navSection}>
                        <span className={styles.navLabel}>GENERAL</span>
                        <Link href="/billing" className={`${styles.navItem} ${pathname === '/billing' ? styles.navItemActive : ''}`}>
                            <span className={styles.navIcon}>💳</span>
                            Billing
                        </Link>
                        <Link href="/account" className={`${styles.navItem} ${pathname === '/account' ? styles.navItemActive : ''}`}>
                            <span className={styles.navIcon}>⚙️</span>
                            Account
                        </Link>
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
                    <button
                        className={styles.hamburgerBtn}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        ☰
                    </button>

                    <div className={styles.searchBar}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search proposals..."
                            className={styles.searchInput}
                        />
                    </div>
                    <div className={styles.headerRight}>
                        <ThemeToggle />
                        <Link href="/account" className={styles.userInfo}>
                            <div className={styles.avatar}>
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.userDetails}>
                                <span className={styles.userName}>{userName}</span>
                                <span className={styles.userEmail}>{userEmail}</span>
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <main className={styles.main}>
                    {(title || actions) && (
                        <div className={styles.pageHeader}>
                            <div>
                                {title && <h1 className={styles.pageTitle}>{title}</h1>}
                                {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
                            </div>
                            <div className={styles.pageActions}>
                                {actions}
                            </div>
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}
