import { NextResponse } from 'next/server';
import { addCredits, setSubscriptionStatus } from '@/services/userService';

// Mock Payment API
export async function POST(request) {
    try {
        const { uid, type } = await request.json();

        if (!uid || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (type === 'single') {
            await addCredits(uid, 1);
            return NextResponse.json({ success: true, message: 'Purchased 1 credit' });
        } else if (type === 'subscription') {
            await setSubscriptionStatus(uid, 'active');
            return NextResponse.json({ success: true, message: 'Subscription activated' });
        } else {
            return NextResponse.json({ error: 'Invalid purchase type' }, { status: 400 });
        }

    } catch (error) {
        console.error('Mock payment failed:', error);
        return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
    }
}
