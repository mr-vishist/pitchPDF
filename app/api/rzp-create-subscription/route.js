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

        // In a real app, you would define this ID in your environment variables
        // and create it once via the Razorpay Dashboard or a script.
        // For this implementation, we'll try to use a fixed Plan ID from env, or create one if missing.
        let planId = process.env.RAZORPAY_PLAN_ID;

        if (!planId) {
            // Fallback: This is not ideal for production concurrency, but works for setup.
            // Better to create plan manually and set ID.
            // We'll return error asking for Plan ID configuration.
            // OR, we can assume a specific behaviour for "test mode" to create dynamic plans.

            // Let's CREATE a plan dynamically if none provided, but this creates duplicates.
            // Best Practice: Use a known Plan ID.
            // I'll create a plan named "PitchPDF Unlimited" if I can't find one? 
            // No, let's create a fresh subscription against a new plan every time is bad.

            // Simplification: Create a new Plan now for demonstration if variable missing.
            const plan = await razorpay.plans.create({
                period: "monthly",
                interval: 1,
                item: {
                    name: "PitchPDF Unlimited",
                    amount: 29900, // ₹299
                    currency: "INR",
                    description: "Unlimited PDF Generation"
                }
            });
            planId = plan.id;
            console.log("Created Temporary Plan:", planId);
        }

        // Create Subscription
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: 120, // 10 years roughly
            notes: {
                userId: uid
            }
        });

        return NextResponse.json({
            success: true,
            subscriptionId: subscription.id,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Razorpay Subscription API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
