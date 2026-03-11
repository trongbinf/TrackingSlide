import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    const db = getDb();
    if (!db) return NextResponse.json([]);

    try {
        const unitsSnapshot = await db.collection('units').get();
        const units = [];

        for (const doc of unitsSnapshot.docs) {
            const data = doc.data();
            const id = doc.id;

            // Get total opens
            const logsCount = await db.collection('logs').where('unit_id', '==', id).count().get();

            // Get last open
            const lastLog = await db.collection('logs')
                .where('unit_id', '==', id)
                .orderBy('timestamp', 'desc')
                .limit(1)
                .get();

            const last_open = lastLog.empty ? null : lastLog.docs[0].data().timestamp?.toDate();

            units.push({
                id,
                name: data.name,
                url: data.url || '',
                total_opens: logsCount.data().count,
                last_open,
            });
        }
        return NextResponse.json(units);
    } catch (err) {
        console.error('Stats fetch error:', err);
        return NextResponse.json({ error: 'Failed to fetch stats', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
}
