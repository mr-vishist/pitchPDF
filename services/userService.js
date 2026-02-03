import { db } from '../firebase/admin.js';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Checks if a user has access to generate a PDF.
 * @param {string} uid - The user's ID.
 * @returns {Promise<{allowed: boolean, reason: 'subscription' | 'credits' | 'none', credits?: number}>}
 */
export async function getUserEntitlement(uid) {
    if (!uid) return { allowed: false, reason: 'none' };

    try {
        const userRef = db.collection('users').doc(uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return { allowed: false, reason: 'none' };
        }

        const data = userSnap.data();

        // 1. Check Subscription
        if (data.subscriptionStatus === 'active') {
            return { allowed: true, reason: 'subscription' };
        }

        // 2. Check Credits
        if (data.credits > 0) {
            return { allowed: true, reason: 'credits', credits: data.credits };
        }

        return { allowed: false, reason: 'none' };
    } catch (error) {
        console.error('Error checking entitlement:', error);
        return { allowed: false, reason: 'error' };
    }
}

/**
 * Consumes one credit for a user.
 * Should be called ONLY after successful PDF generation initiated.
 * @param {string} uid 
 */
export async function consumeCredit(uid) {
    try {
        const userRef = db.collection('users').doc(uid);
        await userRef.update({
            credits: FieldValue.increment(-1)
        });
        return true;
    } catch (error) {
        console.error('Error consuming credit:', error);
        return false;
    }
}

/**
 * Adds credits to a user (e.g., after one-time purchase).
 * @param {string} uid 
 * @param {number} amount 
 */
export async function addCredits(uid, amount) {
    const userRef = db.collection('users').doc(uid);
    // Use set with merge to ensure document exists
    await userRef.set({
        credits: FieldValue.increment(amount)
    }, { merge: true });
}

/**
 * Updates subscription status.
 * @param {string} uid 
 * @param {string} status 'active' | 'inactive' | 'past_due'
 */
export async function setSubscriptionStatus(uid, status, subscriptionId = null) {
    const userRef = db.collection('users').doc(uid);
    const updateData = {
        subscriptionStatus: status,
        subscriptionPlan: status === 'active' ? 'pro' : 'free'
    };

    if (subscriptionId) {
        updateData.razorpaySubscriptionId = subscriptionId;
    }

    await userRef.set(updateData, { merge: true });
}
