import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        const db = getDb();
        if (!db) {
            return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 });
        }
        const collections = await db.listCollections();
        return NextResponse.json({
            success: true,
            collections: collections.map(c => c.id)
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
