import { NextResponse } from 'next/server';

import { getUserEntitlement } from '@/services/userService';

export async function POST(request) {
    try {
        const { uid } = await request.json();

        if (!uid) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const entitlement = await getUserEntitlement(uid);

        return NextResponse.json(entitlement);
    } catch (error) {
        console.error('Entitlement check failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
