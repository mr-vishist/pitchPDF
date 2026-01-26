import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { addCredits, setSubscriptionStatus, getUserEntitlement } from '@/services/userService';

export async function POST(request) {
    try {
        const signature = request.headers.get('x-razorpay-signature');
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Next.js request.text() consumes the stream, so we must be careful if we need JSON later
        const bodyText = await request.text();

        if (!signature || !secret) {
            return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
        }

        // Verify Signature
        const isValid = Razorpay.validateWebhookSignature(bodyText, signature, secret);

        if (!isValid) {
            console.error('Invalid Razorpay Webhook Signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const payload = JSON.parse(bodyText);
        const event = payload.event;
        const entity = payload.payload.payment?.entity || payload.payload.subscription?.entity;

        console.log(`Received Webhook Event: ${event}`);

        if (!entity) {
            // Some events might have different structure, safely ignore if no main entity or specific handling needed
            return NextResponse.json({ status: 'ok', message: 'Event ignored' });
        }

        // Handle Events
        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(entity);
                break;
            case 'subscription.activated':
                await handleSubscriptionUpdate(entity, 'active');
                break;
            case 'subscription.charged':
                // Recurring payment successful, ensure active
                await handleSubscriptionUpdate(entity, 'active');
                break;
            case 'subscription.cancelled':
                await handleSubscriptionUpdate(entity, 'inactive');
                break;
            case 'subscription.halted':
            case 'subscription.paused':
                await handleSubscriptionUpdate(entity, 'paused');
                break;
            default:
                console.log('Unhandled event:', event);
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}

async function handlePaymentCaptured(paymentEntity) {
    const notes = paymentEntity.notes || {};
    const uid = notes.userId;
    const type = notes.type;

    if (uid && type === 'single_pdf') {
        const amount = paymentEntity.amount;
        // Optional: Verify amount is 9900 (₹99) to prevent tampering if creating order from frontend

        console.log(`Adding credit for user ${uid}`);
        // Idempotency: Ideally checking paymentEntity.id against processed payments
        await addCredits(uid, 1);
    }
}

async function handleSubscriptionUpdate(subscriptionEntity, status) {
    const notes = subscriptionEntity.notes || {};
    const uid = notes.userId;
    const subId = subscriptionEntity.id;

    if (uid) {
        console.log(`Updating subscription for user ${uid} to ${status}`);
        await setSubscriptionStatus(uid, status, subId);
    }
}
