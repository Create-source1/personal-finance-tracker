// src/types/Transaction.ts
export interface Transaction {
  id?: string; // Firestore doc ID (optional when creating)
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  date: string; // ISO string
}
