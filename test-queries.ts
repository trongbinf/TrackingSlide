import { getDb } from './src/lib/firebaseAdmin';

async function run() {
    console.log('Testing Firestore queries...');
    console.log('Raw Key JSON:', JSON.stringify(process.env.FIREBASE_PRIVATE_KEY?.substring(0, 100)));
    const db = getDb();
    if (!db) {
        console.log('No DB');
        return;
    }
    try {
        const unitsSnapshot = await db.collection('units').get();
        console.log(`Found ${unitsSnapshot.size} units`);
        for (const doc of unitsSnapshot.docs) {
            const id = doc.id;
            console.log('Testing unit:', id);
            const logsCount = await db.collection('logs').where('unit_id', '==', id).count().get();
            console.log('Count successful:', logsCount.data().count);
            const lastLog = await db.collection('logs')
                .where('unit_id', '==', id)
                .orderBy('timestamp', 'desc')
                .limit(1)
                .get();
            console.log('Last log successful');
        }
        console.log('All queries passed!');
    } catch (e: any) {
        console.error('Query failed:', e.message);
    }
}
run();
