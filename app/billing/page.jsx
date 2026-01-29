'use client';

import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import PaywallModal from '@/components/PaywallModal';
import { useState, useEffect } from 'react';
import { useAuthGuard } from '@/utils/authGuard';
import styles from './billing.module.css';

export default function BillingPage() {
    const { user } = useAuthGuard();
    const [showPaywall, setShowPaywall] = useState(false);
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user subscription details
    useEffect(() => {
        if (user) {
            // In a real app, this should be a dedicated API call or getting data from AuthGuard
            // We'll trust check-entitlement for now to get status
            fetch('/api/check-entitlement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid })
            })
                .then(res => res.json())
                .then(data => {
                    setSubscriptionData(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [user]);

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel your subscription?')) return;
        try {
            const res = await fetch('/api/rzp-cancel-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid })
            });
            const data = await res.json();
            if (data.success) {
                alert('Subscription cancelled successfully.');
                window.location.reload();
            } else {
                alert('Failed to cancel: ' + data.error);
            }
        } catch (e) {
            alert('Error cancelling subscription');
        }
    };

    const isSubscribed = subscriptionData?.reason === 'subscription';
    const credits = subscriptionData?.credits || 0;

    if (loading) return <AuthenticatedLayout title="Billing & Plans"><div>Loading...</div></AuthenticatedLayout>;

    return (
        <AuthenticatedLayout title="Billing & Plans">
            <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} onPaymentSuccess={() => window.location.reload()} />

            {/* Current Plan Status */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Current Plan</h2>
                <div className={styles.planBanner}>
                    <div className={styles.planInfo}>
                        <div className={styles.planName}>
                            {isSubscribed ? 'Unlimited Pro' : 'Free Plan'}
                            {isSubscribed && <span className={styles.activeBadge}>Active</span>}
                        </div>
                        <div className={styles.planDetails}>
                            {isSubscribed
                                ? 'You have unlimited access to all features.'
                                : `You have ${credits} credit${credits !== 1 ? 's' : ''} available.`}
                        </div>
                    </div>
                    <div className={styles.planActions}>
                        {isSubscribed && (
                            <button onClick={handleCancel} className={styles.cancelButton}>
                                Cancel Subscription
                            </button>
                        )}
                        {!isSubscribed && (
                            <button onClick={() => setShowPaywall(true)} className={styles.upgradeButton}>
                                Upgrade to Pro
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Available Plans</h2>
                <div className={styles.grid}>
                    {/* Pay-per-use */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Pay-per-use</h3>
                        <p className={styles.price}>₹99<span className={styles.period}>/pdf</span></p>
                        <ul className={styles.features}>
                            <li>Single Professional PDF</li>
                            <li>High Resolution</li>
                            <li>No Watermark</li>
                            <li>Lifetime Access</li>
                        </ul>
                        <button
                            onClick={() => setShowPaywall(true)}
                            className={styles.button}
                        >
                            Buy 1 PDF
                        </button>
                    </div>

                    {/* Unlimited Subscription */}
                    <div className={`${styles.card} ${styles.premiumCard}`}>
                        <h3 className={styles.cardTitle}>Unlimited</h3>
                        <p className={styles.price}>₹299<span className={styles.period}>/mo</span></p>
                        <ul className={styles.features}>
                            <li>Unlimited Proposals</li>
                            <li>All Premium Features</li>
                            <li>No Watermark</li>
                            <li>Priority Support</li>
                        </ul>
                        {isSubscribed ? (
                            <button disabled className={styles.premiumButton} style={{ opacity: 0.5, cursor: 'default' }}>
                                Currently Active
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowPaywall(true)}
                                className={styles.premiumButton}
                            >
                                Subscribe Now
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment History Placeholder */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Payment History</h2>
                <div className={styles.historyTable}>
                    <div className={styles.historyHeader}>
                        <span>Date</span>
                        <span>Description</span>
                        <span>Amount</span>
                        <span>Status</span>
                    </div>
                    {/* Static placeholder for now as requested by user flow "Payment History" but backend support not fully built yet */}
                    <div className={styles.historyRow}>
                        <span data-label="Date">{new Date().toLocaleDateString()}</span>
                        <span data-label="Description">{isSubscribed ? 'Pro Subscription' : (credits > 0 ? 'Single PDF Credit' : 'No payments yet')}</span>
                        <span data-label="Amount">{isSubscribed ? '₹299.00' : (credits > 0 ? '₹99.00' : '-')}</span>
                        <span data-label="Status">{isSubscribed || credits > 0 ? 'Paid' : '-'}</span>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
