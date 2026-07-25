'use client';
import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'student' });
  const [resetPass, setResetPass] = useState<{ id: number; username: string } | null>(null);
  const [newPass, setNewPass] = useState('');

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => { setUsers(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const handleCreate = async () => {
    const r = await fetch('/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (r.ok) { setShowCreate(false); setForm({ username: '', password: '', role: 'student' }); setUsers(await (await fetch('/api/admin/users')).json()); }
    else alert((await r.json()).error || 'Failed');
  };

  const handleResetPass = async () => {
    if (!resetPass) return;
    const r = await fetch('/api/admin/users/' + resetPass.id + '/password', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPass }),
    });
    if (r.ok) { setResetPass(null); setNewPass(''); alert('Password updated!'); }
    else alert('Failed');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user? Their data will be lost.')) return;
    const r = await fetch('/api/admin/users', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (r.ok) setUsers(users.filter(u => u.id !== id));
    else alert((await r.json()).error || 'Failed');
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Management</h1>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">+ Create User</button>
        </div>

        {showCreate && (
          <div className="bg-white p-4 rounded-lg border space-y-3 max-w-md">
            <h2 className="font-semibold">Create User</h2>
            <input type="text" placeholder="Username" value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))} className="w-full px-3 py-2 border rounded text-sm" />
            <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} className="w-full px-3 py-2 border rounded text-sm" />
            <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} className="w-full px-3 py-2 border rounded text-sm">
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Create</button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-200 rounded text-sm">Cancel</button>
            </div>
          </div>
        )}

        {loading ? <p className="text-gray-400">Loading...</p> : (
          <div className="bg-white rounded-lg border">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{u.username} <span className={'text-xs px-2 py-0.5 rounded ' + (u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100')}>{u.role}</span></p>
                  <p className="text-xs text-gray-400">ID: {u.id} · Created: {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setResetPass({ id: u.id, username: u.username })} className="text-sm text-blue-500 hover:text-blue-700">Reset Password</button>
                  {u.role !== 'admin' && <button onClick={() => handleDelete(u.id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {resetPass && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={() => setResetPass(null)}>
            <div className="bg-white rounded-lg p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <h2 className="font-semibold mb-3">Reset Password for {resetPass.username}</h2>
              <input type="password" placeholder="New password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full px-3 py-2 border rounded text-sm mb-3" />
              <div className="flex gap-2">
                <button onClick={handleResetPass} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Update</button>
                <button onClick={() => setResetPass(null)} className="px-4 py-2 bg-gray-200 rounded text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
