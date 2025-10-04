import { doc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';

type TransactionsType = {
  transaction: string;
  value: number;
  observation: string;
  file: {
    uri: string;
    name: string;
    size?: number;
    type?: string;
  } | null;
  categories: string[];
};

export async function saveTransaction(
  transactionData: TransactionsType,
  transactionId?: string
) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const transactionsRef = collection(db, 'transacoes');

    if (transactionId) {
      const transactionRef = doc(transactionsRef, transactionId);
      await updateDoc(transactionRef, {
        ...transactionData,
        userId: user.uid,
        updatedAt: new Date(),
      });
      return transactionId;
    } else {
      const docRef = await addDoc(transactionsRef, {
        ...transactionData,
        userId: user.uid,
        createdAt: new Date(),
      });
      return docRef.id;
    }
  } catch (error: any) {
    console.error('Erro ao salvar transação:', error.message);
    throw error;
  }
}
