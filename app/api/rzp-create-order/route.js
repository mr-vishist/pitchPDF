import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request) {
    try {
        const { uid } = await request.json();

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // 1. Create an Order
        const order = await razorpay.orders.create({
            amount: 9900, // ₹99 in paise
            currency: 'INR',
            receipt: `receipt_${uid}_${Date.now()}`,
            notes: {
                userId: uid,
                type: 'single_pdf'
            }
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Razorpay Order API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
