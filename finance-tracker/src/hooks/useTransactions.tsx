// src/hooks/useTransactions.ts
import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
//   where,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Transaction, TransactionForm } from '../types/Transaction';
import type { User } from 'firebase/auth';

export function useTransactions(user: User | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = user?.uid;

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'users', userId, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[];
        setTransactions(data);
        setLoading(false);
      },
      (err) => {
        setError('Failed to load transactions');
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addTransaction = useCallback(
    async (tx: Omit<TransactionForm, 'id'>) => {
      if (!userId) throw new Error('User not authenticated');;
      await addDoc(collection(db, 'users', userId, 'transactions'), tx);
    },
    [userId]
  );

  const updateTransaction = useCallback(
    async (id: string, updatedData: Partial<TransactionForm>) => {
      if (!userId) throw new Error('User not authenticated');;
      const docRef = doc(db, 'users', userId, 'transactions', id);
      await updateDoc(docRef, updatedData);
    },
    [userId]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!userId) throw new Error('User not authenticated');;
      const docRef = doc(db, 'users', userId, 'transactions', id);
      await deleteDoc(docRef);
    },
    [userId]
  );

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
