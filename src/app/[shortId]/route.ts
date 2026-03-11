import { NextRequest, NextResponse } from 'next/server';
import { getDb, admin } from '@/lib/firebaseAdmin';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ shortId: string }> }
) {
    const { shortId } = await params;
    const db = getDb();

    if (!db) {
        return new NextResponse('Internal Server Error: Database not initialized', { status: 500 });
    }

    try {
        // 1. Find the tracker link properties
        const trackerDoc = await db.collection('trackers').doc(shortId).get();
        
        if (!trackerDoc.exists) {
            return new NextResponse('Link không tồn tại hoặc đã bị xóa.', { status: 404 });
        }

        const trackerData = trackerDoc.data()!;
        const { unit_id, email } = trackerData;

        // 2. Find the destination URL from the parent unit
        const unitDoc = await db.collection('units').doc(unit_id).get();
        
        if (!unitDoc.exists) {
             return new NextResponse('Tài liệu gốc không còn tồn tại.', { status: 404 });
        }

        const destinationUrl = unitDoc.data()!.url;

        // 3. Log the visit (Async - don't block the redirect)
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const ua = req.headers.get('user-agent') || 'unknown';
        const referer = req.headers.get('referer') || 'none';

        db.collection('logs').add({
            unit_id,
            tracker_id: shortId,
            email,
            ip,
            ua,
            referer,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        }).catch(err => console.error('Error writing log asynchronously:', err));

        // 4. Redirect the user to the actual Slide
        return NextResponse.redirect(destinationUrl, 302);

    } catch (err) {
        console.error('Redirect Error:', err);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
