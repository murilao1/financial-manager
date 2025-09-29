import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAzNXZPxr7gDHdW-rxsX8Yy2KvdwIMlYtc',
  authDomain: 'financial-manager-681f2.firebaseapp.com',
  projectId: 'financial-manager-681f2',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
