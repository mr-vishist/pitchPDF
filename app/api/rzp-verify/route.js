import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { addCredits, setSubscriptionStatus } from '@/services/userService';

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            paymentType, // 'order' or 'subscription'
            userId,
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            razorpay_subscription_id
        } = body;

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) return NextResponse.json({ error: 'Server config error' }, { status: 500 });

        let generated_signature = '';

        if (paymentType === 'subscription') {
            // Subscription Signature: razorpay_payment_id + | + razorpay_subscription_id
            const data = razorpay_payment_id + '|' + razorpay_subscription_id;
            generated_signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
        } else {
            // Order Signature: razorpay_order_id + | + razorpay_payment_id
            const data = razorpay_order_id + '|' + razorpay_payment_id;
            generated_signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
        }

        if (generated_signature === razorpay_signature) {
            // Signature Verified

            if (paymentType === 'subscription') {
                await setSubscriptionStatus(userId, 'active', razorpay_subscription_id);
            } else {
                await addCredits(userId, 1);
            }

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

    } catch (error) {
        console.error('Payment Verification Error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
