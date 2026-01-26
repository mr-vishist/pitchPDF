'use client';

import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useAuthGuard } from '@/utils/authGuard';
import { auth } from '@/firebase/firebase';
import { sendPasswordResetEmail, updateProfile, linkWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useState, useEffect } from 'react';
import styles from './account.module.css';

export default function AccountPage() {
    const { user } = useAuthGuard();
    const [resetSent, setResetSent] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Profile Edit State
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [savingName, setSavingName] = useState(false);

    // Account Linking State
    const [linking, setLinking] = useState(false);

    useEffect(() => {
        if (user?.displayName) {
            setNewName(user.displayName);
        }
    }, [user]);

    const isGoogleAuth = user?.providerData?.some(
        (provider) => provider.providerId === 'google.com'
    );

    const isEmailAuth = user?.providerData?.some(
        (provider) => provider.providerId === 'password'
    );

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        try {
            await sendPasswordResetEmail(auth, user.email);
            setResetSent(true);
            setError('');
            setSuccessMsg('Reset email sent successfully.');
        } catch (err) {
            setError('Failed to send reset email. Please try again.');
            console.error(err);
        }
    };

    const handleUpdateName = async () => {
        if (!newName.trim()) return;
        setSavingName(true);
        setError('');
        setSuccessMsg('');
        try {
            await updateProfile(auth.currentUser, {
                displayName: newName
            });
            setIsEditingName(false);
            setSuccessMsg('Profile updated successfully.');
        } catch (err) {
            setError('Failed to update name.');
            console.error(err);
        } finally {
            setSavingName(false);
        }
    };

    const handleLinkGoogle = async () => {
        setLinking(true);
        setError('');
        setSuccessMsg('');
        try {
            const provider = new GoogleAuthProvider();
            await linkWithPopup(auth.currentUser, provider);
            setSuccessMsg('Google account linked successfully.');
        } catch (err) {
            if (err.code === 'auth/credential-already-in-use') {
                setError('This Google account is already linked to another user.');
            } else {
                setError('Failed to link Google account.');
            }
            console.error(err);
        } finally {
            setLinking(false);
        }
    };

    return (
        <AuthenticatedLayout title="Account Settings">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* Messages */}
                {successMsg && (
                    <div className={`${styles.message} ${styles.successMessage}`}>
                        {successMsg}
                    </div>
                )}

                {error && (
                    <div className={`${styles.message} ${styles.errorMessage}`}>
                        {error}
                    </div>
                )}

                {/* Profile Information */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.title}>Profile Information</h2>
                        {!isEditingName && (
                            <button
                                onClick={() => setIsEditingName(true)}
                                className={styles.actionButton}
                                style={{ marginLeft: 0 }}
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className={styles.grid}>
                        <div>
                            <label className={styles.label}>Full Name</label>
                            {isEditingName ? (
                                <div className={styles.flexRow}>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className={styles.editInput}
                                        placeholder="Enter your name"
                                    />
                                    <button
                                        onClick={handleUpdateName}
                                        disabled={savingName}
                                        className={styles.saveButton}
                                    >
                                        {savingName ? '...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingName(false);
                                            setNewName(user?.displayName || '');
                                        }}
                                        className={styles.actionButton}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={user?.displayName || 'No name set'}
                                    disabled
                                    className={styles.input}
                                />
                            )}
                        </div>
                        <div>
                            <label className={styles.label}>Email Address</label>
                            <input
                                type="text"
                                value={user?.email || ''}
                                disabled
                                className={styles.input}
                            />
                        </div>
                    </div>
                </div>

                {/* Authentication Method */}
                <div className={styles.section}>
                    <h2 className={styles.title}>Connected Accounts</h2>

                    <div className={styles.badgesContainer}>
                        {isGoogleAuth && (
                            <div className={`${styles.badge} ${styles.googleBadge}`}>
                                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google Connected
                            </div>
                        )}

                        {isEmailAuth && (
                            <div className={styles.badge}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                Email Login Connected
                            </div>
                        )}
                    </div>

                    {!isGoogleAuth && (
                        <div className={styles.linkSection}>
                            <h3 className={styles.passwordTitle}>Link Google Account</h3>
                            <p className={styles.description} style={{ marginBottom: '1rem' }}>
                                Connect your Google account to enable one-click login. You will still be able to sign in with your password.
                            </p>
                            <button
                                onClick={handleLinkGoogle}
                                disabled={linking}
                                className={styles.linkButton}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                {linking ? 'Connecting...' : 'Connect Google Account'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Password Management */}
                {isEmailAuth && (
                    <div className={styles.section}>
                        <h2 className={styles.title}>Security</h2>

                        <div className={styles.securityHeader}>
                            <div>
                                <h3 className={styles.passwordTitle}>Password</h3>
                                <p className={styles.description}>
                                    Secure your account by updating your password regularly.
                                </p>
                            </div>

                            <button
                                onClick={handlePasswordReset}
                                disabled={resetSent}
                                className={styles.deleteButton}
                                style={{ background: '#ef4444' }}
                            >
                                {resetSent ? 'Reset Email Sent' : 'Reset Password'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
