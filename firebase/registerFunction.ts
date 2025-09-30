import { createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await setDoc(doc(db, 'usuarios', user.uid), {
      firstName,
      lastName,
      email,
      createdAt: new Date(),
    });

    await signOut(auth);

    return user;
  } catch (error: any) {
    console.error('Erro ao cadastrar:', error.code, error.message);
    throw error;
  }
}
