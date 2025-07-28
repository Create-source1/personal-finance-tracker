// src/types/Transaction.ts

// Used for creating or updating a transaction
export interface TransactionForm {
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  date: string; // yyyy-mm-dd
}

// Returned from Firestore (includes ID)
export interface Transaction extends TransactionForm {
  id: string;
}
