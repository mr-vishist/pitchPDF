import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const getFirebaseAdminApp = () => {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    // Check if we have specific service account key in env
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            return initializeApp({
                credential: cert(serviceAccount)
            });
        } catch (error) {
            console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error);
        }
    }

    // Fallback to default application credentials (e.g. GOOGLE_APPLICATION_CREDENTIALS or Cloud environment)
    return initializeApp();
};

const app = getFirebaseAdminApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
