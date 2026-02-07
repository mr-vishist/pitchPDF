import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { setSubscriptionStatus } from '@/services/userService';
import { db } from '@/firebase/admin.js';

export async function POST(request) {
    try {
        const { uid } = await request.json();

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ error: 'Server config error' }, { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // 1. Get User's Subscription ID
        const userSnap = await db.collection('users').doc(uid).get();

        if (!userSnap.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userSnap.data();
        const subscriptionId = userData.razorpaySubscriptionId;

        if (!subscriptionId) {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
        }

        // 2. Cancel on Razorpay
        // cancel(subscriptionId, cancelAtCycleEnd)
        // If cancelAtCycleEnd is true, it cancels at end of cycle. If false, immediate.
        // Let's do immediate for now or verify API.

        await razorpay.subscriptions.cancel(subscriptionId);

        // 3. Update Firestore
        await setSubscriptionStatus(uid, 'inactive');

        return NextResponse.json({ success: true, message: 'Subscription cancelled' });

    } catch (error) {
        console.error('Cancellation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
