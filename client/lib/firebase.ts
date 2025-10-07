import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getConfig } from '../config';

let app: FirebaseApp;

async function initializeFirebase() {
  const firebaseConfig = await getConfig();

  const firebaseOptions = {
    apiKey: firebaseConfig.FIREBASE_API_KEY,
    authDomain: firebaseConfig.FIREBASE_AUTH_DOMAIN,
    projectId: firebaseConfig.FIREBASE_PROJECT_ID,
    storageBucket: firebaseConfig.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: firebaseConfig.FIREBASE_MESSAGING_SENDER_ID,
    appId: firebaseConfig.FIREBASE_APP_ID,
  };

  if (!getApps().length) {
    app = initializeApp(firebaseOptions);
  } else {
    app = getApp();
  }
  return app;
}

export const auth = getAuth(getApps().length > 0 ? getApp() : undefined);
export const googleProvider = new GoogleAuthProvider();
export { initializeFirebase };