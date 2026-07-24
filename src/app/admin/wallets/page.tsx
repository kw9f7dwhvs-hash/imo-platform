'use client';
import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tab, setTab] = useState('wallets');
  const [adjust, setAdjust] = useState({ userId: '', amount: '', message: '' });

  useEffect(() => {
    fetch('/api/admin/wallet').then(r => r.json()).then(d => setWallets(Array.isArray(d) ? d : []));
    fetch('/api/admin/wallet/transactions').then(r => r.json()).then(d => setTransactions(Array.isArray(d) ? d : []));
  }, []);

  const handleAdjust = async () => {
    const r = await fetch('/api/admin/wallet', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: parseInt(adjust.userId), amount: parseInt(adjust.amount), message: adjust.message }),
    });
    if (r.ok) { alert('Adjusted!'); setAdjust({ userId: '', amount: '', message: '' }); window.location.reload(); }
    else alert('Failed');
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Wallet Management</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('wallets')} className={'px-3 py-1 rounded text-sm ' + (tab === 'wallets' ? 'bg-blue-600 text-white' : 'bg-gray-100')}>Wallets</button>
          <button onClick={() => setTab('transactions')} className={'px-3 py-1 rounded text-sm ' + (tab === 'transactions' ? 'bg-blue-600 text-white' : 'bg-gray-100')}>Transactions</button>
          <button onClick={() => setTab('adjust')} className={'px-3 py-1 rounded text-sm ' + (tab === 'adjust' ? 'bg-blue-600 text-white' : 'bg-gray-100')}>Adjust</button>
        </div>

        {tab === 'wallets' && (
          <div className="bg-white rounded-lg border">
            {wallets.map((w: any) => (
              <div key={w.id} className="flex justify-between p-3 border-b last:border-b-0">
                <span className="font-medium">{w.user?.username} {w.user?.role === 'admin' ? '(admin)' : ''}</span>
                <span className="text-blue-600 font-bold">{w.balance} coins</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'transactions' && (
          <div className="bg-white rounded-lg border max-h-96 overflow-y-auto">
            {transactions.map((t: any) => (
              <div key={t.id} className="flex justify-between p-3 border-b last:border-b-0 text-sm">
                <div>
                  <span className={t.amount > 0 ? 'text-green-600' : 'text-red-500'}>{t.amount > 0 ? '+' : ''}{t.amount}</span>
                  <span className="text-gray-500 ml-2">{t.reason}</span>
                  <span className="text-gray-400 ml-2">({t.user?.username})</span>
                </div>
                <span className="text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'adjust' && (
          <div className="bg-white p-4 rounded-lg border space-y-3 max-w-md">
            <select value={adjust.userId} onChange={e => setAdjust(f => ({...f, userId: e.target.value}))} className="w-full px-3 py-2 border rounded text-sm">
              <option value="">Select student...</option>
              {wallets.filter((w: any) => w.user?.role !== 'admin').map((w: any) => (
                <option key={w.userId} value={w.userId}>{w.user?.username} ({w.balance} coins)</option>
              ))}
            </select>
            <input type="number" placeholder="Amount (+/-)" value={adjust.amount} onChange={e => setAdjust(f => ({...f, amount: e.target.value}))} className="w-full px-3 py-2 border rounded text-sm" />
            <input type="text" placeholder="Reason message" value={adjust.message} onChange={e => setAdjust(f => ({...f, message: e.target.value}))} className="w-full px-3 py-2 border rounded text-sm" />
            <button onClick={handleAdjust} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Adjust</button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
