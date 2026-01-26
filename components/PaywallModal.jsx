'use client';

import { useState } from 'react';
import styles from './PaywallModal.module.css';

export default function PaywallModal({ isOpen, onClose, onPaymentSuccess, userId }) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handlePurchase = async (type) => {
        setLoading(true);
        try {
            // Load Razorpay Script
            const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!res) {
                alert('Razorpay SDK failed to load. Are you online?');
                setLoading(false);
                return;
            }

            let endpoint = type === 'single' ? '/api/rzp-create-order' : '/api/rzp-create-subscription';

            // 1. Create Order/Sub on Backend
            const result = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: userId })
            });

            const data = await result.json();

            if (!data.success) {
                alert('Server error: ' + (data.error || 'Unknown error'));
                setLoading(false);
                return;
            }

            const { orderId, subscriptionId, keyId, amount, currency } = data;

            // 2. Open Razorpay
            const options = {
                key: keyId,
                name: 'pitchPDF',
                description: type === 'single' ? 'Single PDF Generation' : 'Unlimited Subscription',
                // image: '/logo.png', // Add logo if available

                // For subscription, use subscription_id. For one-time, use order_id + amount.
                ...(type === 'single'
                    ? { amount: amount.toString(), currency: currency, order_id: orderId }
                    : { subscription_id: subscriptionId }
                ),

                handler: async function (response) {
                    // 3. Verify on Backend
                    const verifyRes = await fetch('/api/rzp-verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId,
                            paymentType: type === 'single' ? 'order' : 'subscription',
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            razorpay_subscription_id: response.razorpay_subscription_id
                        })
                    });

                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        onPaymentSuccess();
                        onClose();
                    } else {
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    // email: userEmail, // We could pass this if we had it
                    // contact: ''
                },
                theme: {
                    color: '#10b981'
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Payment Initialization Error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    function loadScript(src) {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>×</button>

                <h2 className={styles.title}>Generate your professional PDF</h2>
                <p className={styles.subtitle}>Choose a plan to continue</p>

                <div className={styles.optionsGrid}>
                    <div className={styles.optionCard} onClick={() => handlePurchase('single')}>
                        <div className={styles.optionContent}>
                            <h3>One-time Pay</h3>
                            <p>Download a single PDF</p>
                        </div>
                        <div className={styles.optionPrice}>
                            <span className={styles.amount}>₹99</span>
                            <span className={styles.period}>/ PDF</span>
                        </div>
                    </div>

                    <div className={styles.optionCard} onClick={() => handlePurchase('subscription')}>
                        <div className={styles.optionContent}>
                            <h3>Unlimited</h3>
                            <p>Generate unlimited PDFs</p>
                        </div>
                        <div className={styles.optionPrice}>
                            <span className={styles.amount}>₹299</span>
                            <span className={styles.period}>/ month</span>
                        </div>
                    </div>
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#999' }}>
                    {loading ? 'Processing payment...' : 'Secure payment via MockPay'}
                </p>
            </div>
        </div>
    );
}
