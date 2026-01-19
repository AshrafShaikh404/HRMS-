const admin = require('firebase-admin');

// TODO: You need to generate a private key file from Firebase Console -> Project Settings -> Service Accounts
// and save it as 'firebase-service-account.json' in this backend/config folder.
// OR set the environment variables.

try {
    // Check if we have env vars, otherwise look for file
    if (process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines if using env var
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            })
        });
        console.log('Firebase Admin initialized with Environment Variables');
    } else {
        // Fallback to local file (development)
        const serviceAccount = require('./serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized with serviceAccountKey.json');
    }
} catch (error) {
    console.warn("Firebase Admin Initialization Failed: ", error.message);
    console.warn("Google Login will not work until Firebase Admin is configured correctly.");
}

module.exports = admin;
