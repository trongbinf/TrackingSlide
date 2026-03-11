import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebaseAdmin';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const db = getDb();
    const { id } = await params;
    if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

    try {
        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        await db.collection('units').doc(id).update({ name });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Update unit error:', err);
        return NextResponse.json({ error: 'Failed to update unit' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const db = getDb();
    const { id } = await params;
    if (!db) return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });

    try {
        // Delete the unit document itself (Trackers and Logs remain orphaned but won't show in the main Dashboard)
        await db.collection('units').doc(id).delete();
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Delete unit error:', err);
        return NextResponse.json({ error: 'Failed to delete unit' }, { status: 500 });
    }
}
