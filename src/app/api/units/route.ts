import { NextRequest, NextResponse } from 'next/server';
import { getDb, admin } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
    const db = getDb();
    if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

    try {
        const { name, url } = await req.json();
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        if (!url) return NextResponse.json({ error: 'Destination URL is required' }, { status: 400 });

        const id = Math.random().toString(36).substring(2, 8);
        await db.collection('units').doc(id).set({
            name,
            url,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        return NextResponse.json({ id, name, url });
    } catch (err) {
        console.error('Unit creation error:', err);
        return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 });
    }
}
