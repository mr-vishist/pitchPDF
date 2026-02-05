import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const options = {};
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            options.credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY));
        }

        admin.initializeApp(options);
    } catch (error) {
        console.error('Firebase Admin initialization failed', error);
    }
}

const db = admin.firestore();
const auth = admin.auth();
const FieldValue = admin.firestore.FieldValue;

export { db, auth, FieldValue };
