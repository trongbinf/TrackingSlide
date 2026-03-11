import { NextRequest, NextResponse } from 'next/server';
import { getDb, admin } from '@/lib/firebaseAdmin';
import { UAParser } from 'ua-parser-js';

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const db = getDb();
    const { id } = await params;
    if (!db) return NextResponse.json([]);

    try {
        const logsSnapshot = await db.collection('logs')
            .where('unit_id', '==', id)
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();

        const parsedLogs = logsSnapshot.docs.map((doc: any) => {
            const log = doc.data();
            const parser = new UAParser(log.ua);
            return {
                ...log,
                timestamp: log.timestamp?.toDate(),
                browser: parser.getBrowser().name,
                os: parser.getOS().name,
                device: parser.getDevice().type || 'desktop'
            };
        });
        return NextResponse.json(parsedLogs);
    } catch (err) {
        console.error('Logs fetch error:', err);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
