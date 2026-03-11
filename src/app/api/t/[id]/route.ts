import { NextRequest, NextResponse } from 'next/server';
import { getDb, admin } from '@/lib/firebaseAdmin';

const PIXEL_B64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const pixelBuffer = Buffer.from(PIXEL_B64, 'base64');

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const ua = req.headers.get('user-agent') || 'unknown';
    const referer = req.headers.get('referer') || 'none';

    const db = getDb();
    try {
        if (db) {
            await db.collection('logs').add({
                unit_id: id,
                ip,
                ua,
                referer,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
    } catch (err) {
        console.error('Tracking log error:', err);
    }

    return new NextResponse(pixelBuffer, {
        headers: {
            'Content-Type': 'image/gif',
            'Content-Length': pixelBuffer.length.toString(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    });
}
