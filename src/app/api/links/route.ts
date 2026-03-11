import { NextRequest, NextResponse } from 'next/server';
import { getDb, admin } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
    const db = getDb();
    if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

    try {
        const { unit_id, email } = await req.json();
        
        if (!unit_id || !email) {
            return NextResponse.json({ error: 'Unit ID and Email are required' }, { status: 400 });
        }

        // Generate a 10-char short ID for the tracking link
        const short_id = Math.random().toString(36).substring(2, 12);
        
        await db.collection('trackers').doc(short_id).set({
            unit_id,
            email: email.toLowerCase().trim(),
            short_id,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        return NextResponse.json({ short_id, email });
    } catch (err) {
        console.error('Link generation error:', err);
        return NextResponse.json({ error: 'Failed to generate tracking link' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const db = getDb();
    if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

    const unit_id = req.nextUrl.searchParams.get('unit_id');
    if (!unit_id) return NextResponse.json({ error: 'unit_id parameter is required' }, { status: 400 });

    try {
        const snapshot = await db.collection('trackers')
            .where('unit_id', '==', unit_id)
            .orderBy('created_at', 'desc')
            .get();

        const links = snapshot.docs.map(doc => ({
            short_id: doc.id,
            ...doc.data(),
            created_at: doc.data().created_at?.toDate()
        }));

        return NextResponse.json(links);
    } catch (err) {
        console.error('Error fetching links:', err);
        return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
    }
}
