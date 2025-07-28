// src/components/TransactionList.tsx
import type { Transaction } from '../types/Transaction';

interface Props {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: Props) {
  if (transactions.length === 0) {
    return <p>No transactions yet.</p>;
  }

  return (
    <table
      style={{
        width: '100%',
        marginTop: 20,
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
      }}
    >
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '8px' }}>Description</th>
          <th style={{ textAlign: 'right', padding: '8px' }}>Amount</th>
          <th style={{ textAlign: 'center', padding: '8px' }}>Type</th>
          <th style={{ textAlign: 'center', padding: '8px' }}>Category</th>
          <th style={{ textAlign: 'center', padding: '8px' }}>Date</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => (
          <tr key={tx.id}>
            <td style={{ padding: '8px' }}>{tx.description}</td>
            <td
              style={{
                color: tx.type === 'Income' ? 'green' : 'red',
                textAlign: 'right',
                padding: '8px',
              }}
            >
              INR {tx.amount.toFixed(2)}
            </td>
            <td style={{ textAlign: 'center', padding: '8px' }}>{tx.type}</td>
            <td style={{ textAlign: 'center', padding: '8px' }}>{tx.category}</td>
            <td style={{ textAlign: 'center', padding: '8px' }}>{tx.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
