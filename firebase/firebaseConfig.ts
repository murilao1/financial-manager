import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

type Auth = FirebaseAuth.Auth;

const firebaseConfig = {
  apiKey: 'AIzaSyAzNXZPxr7gDHdW-rxsX8Yy2KvdwIMlYtc',
  authDomain: 'financial-manager-681f2.firebaseapp.com',
  projectId: 'financial-manager-681f2',
};

// Singleton app (Fast Refresh safe)
const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

declare global {
  var __FIN_MGR_FIREBASE_AUTH__: Auth | undefined; // Fast Refresh cache
}

function resolveReactNativePersistence(): ((storage: any) => any) | undefined {
  const fn = (FirebaseAuth as any).getReactNativePersistence;
  return typeof fn === 'function' ? fn : undefined;
}

function initNativeAuth(app: FirebaseApp): Auth {
  const persistenceFactory = resolveReactNativePersistence();
  if (persistenceFactory) {
    return FirebaseAuth.initializeAuth(app, {
      persistence: persistenceFactory(AsyncStorage),
    });
  }

  return FirebaseAuth.initializeAuth(app);
}

let auth: Auth;
if (Platform.OS === 'web') {
  auth = FirebaseAuth.getAuth(app);
} else {
  auth = global.__FIN_MGR_FIREBASE_AUTH__ ||= initNativeAuth(app);
}

export { auth };
export const db = getFirestore(app);

export { app };
