import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    const db = getDb();
    if (!db) return NextResponse.json({ error: 'No DB' });

    try {
        const unitsSnapshot = await db.collection('units').get();
        const results = [];
        for (const doc of unitsSnapshot.docs) {
            const id = doc.id;
            try {
                const logsCount = await db.collection('logs').where('unit_id', '==', id).count().get();
                const lastLog = await db.collection('logs')
                    .where('unit_id', '==', id)
                    .orderBy('timestamp', 'desc')
                    .limit(1)
                    .get();
                results.push({ id, status: 'success' });
            } catch (e: any) {
                results.push({ id, error: e.message });
            }
        }
        return NextResponse.json({ success: true, results, count: unitsSnapshot.size });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message });
    }
}
