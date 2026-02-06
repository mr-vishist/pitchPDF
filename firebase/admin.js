import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
        try {
            const serviceAccount = JSON.parse(serviceAccountKey);
            initializeApp({
                credential: cert(serviceAccount)
            });
        } catch (error) {
            console.warn('FIREBASE_SERVICE_ACCOUNT_KEY provided but invalid JSON, falling back to ADC.', error);
            initializeApp();
        }
    } else {
        initializeApp();
    }
}

const db = getFirestore();
const auth = getAuth();

export { db, auth, FieldValue };
