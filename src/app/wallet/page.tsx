'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';

export default function WalletPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/user/wallet').then(r => r.json()).then(setData);
  }, []);
  return (
    <AuthGuard>
      <div className="max-w-lg mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Wallet</h1>
        {data && (
          <>
            <div className="bg-white p-6 rounded-lg border text-center">
              <p className="text-4xl font-bold text-blue-600">{data.balance}</p>
              <p className="text-gray-500 mt-1">coins</p>
            </div>
            <h2 className="font-semibold">Recent Transactions</h2>
            <div className="space-y-2">
              {data.transactions?.map((t: any) => (
                <div key={t.id} className="bg-white p-3 rounded-lg border flex justify-between text-sm">
                  <div>
                    <span className={'font-medium ' + (t.amount > 0 ? 'text-green-600' : 'text-red-500')}>{t.amount > 0 ? '+' : ''}{t.amount}</span>
                    <span className="text-gray-500 ml-2">{t.reason}</span>
                  </div>
                  <span className="text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}