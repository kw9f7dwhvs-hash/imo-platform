'use client';
import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';

export default function MessagesPage() {
  const [box, setBox] = useState('inbox');
  const [msgFilter, setMsgFilter] = useState('all');
  const [msgs, setMsgs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ toUserId: '', subject: '', body: '', coins: '0', type: 'general' });
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => { fetch('/api/messages?box=' + box).then(r => r.json()).then(setMsgs); }, [box, refresh]);
  useEffect(() => { fetch('/api/users').then(r => r.json()).then(d => { if (Array.isArray(d)) setUsers(d); }).catch(() => {}); }, []);

  const handleSend = async () => {
    const r = await fetch('/api/messages/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await r.json();
    if (r.ok) { setComposing(false); setForm({ toUserId: '', subject: '', body: '', coins: '0', type: 'general' }); setRefresh(x => x + 1); }
    else alert('Failed: ' + (data.error || 'unknown'));
  };

  const handleRead = async (msg: any) => {
    setSelectedMsg(msg);
    if (!msg.readAt) { await fetch('/api/messages/' + msg.id + '/read', { method: 'POST' }); setRefresh(x => x + 1); }
  };

  const filtered = msgFilter === 'all' ? msgs : msgs.filter(m => m.type === msgFilter);

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Messages</h1>
          <button onClick={() => setComposing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">+ Compose</button>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setBox('inbox')} className={"px-3 py-1 rounded-lg text-sm " + (box === 'inbox' ? 'bg-blue-600 text-white' : 'bg-gray-100')}>Inbox</button>
          <button onClick={() => setBox('sent')} className={"px-3 py-1 rounded-lg text-sm " + (box === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-100')}>Sent</button>
          <div className="flex gap-1 ml-4">
            {['all','general','bug','hint'].map(t => (
              <button key={t} onClick={() => setMsgFilter(t)} className={"px-2 py-1 text-xs rounded " + (msgFilter === t ? 'bg-gray-300' : 'bg-gray-100')}>{t}</button>
            ))}
          </div>
        </div>

        {composing && (<div className="bg-white p-4 rounded-lg border space-y-3">
          <h2 className="font-semibold">New Message</h2>
          <select value={form.toUserId} onChange={e => setForm(f => ({...f, toUserId: e.target.value}))} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">Select recipient...</option>
            {(users || []).map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
          <div className="flex gap-2">
            <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} className="px-3 py-2 border rounded-lg text-sm">
              <option value="general">General</option><option value="bug">Bug Report</option><option value="hint">Hint</option>
            </select>
            <input type="text" placeholder="Subject" value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
          </div>
          <textarea placeholder="Message" value={form.body} onChange={e => setForm(f => ({...f, body: e.target.value}))} rows={4} className="w-full px-3 py-2 border rounded-lg text-sm" />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Coins:</label>
            <input type="number" min="0" value={form.coins} onChange={e => setForm(f => ({...f, coins: e.target.value}))} className="w-24 px-2 py-1 border rounded-lg text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Send</button>
            <button onClick={() => setComposing(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
          </div>
        </div>)}

        <div className="space-y-2">
          {filtered.map(msg => (
            <div key={msg.id} onClick={() => handleRead(msg)}
              className={"bg-white p-3 rounded-lg border cursor-pointer hover:shadow-sm " + (!msg.readAt && box === 'inbox' ? 'border-l-4 border-l-blue-500 font-medium' : '')}>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <span className={"text-xs px-1 rounded " + (msg.type === 'bug' ? 'bg-red-100 text-red-600' : msg.type === 'hint' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100')}>{msg.type}</span>
                  <p className="text-sm font-medium">{msg.subject}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {box === 'inbox' ? 'From: ' + (msg.fromUser?.username || '?') : 'To: ' + (msg.toUser?.username || '?')}
                {msg.coins > 0 && <span className="text-green-600 ml-2">+{msg.coins} coins</span>}
              </p>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No messages</p>}
        </div>

        {selectedMsg && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMsg(null)}>
            <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-80vh overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="font-bold text-lg mb-1">{selectedMsg.subject}</h2>
              <p className="text-sm text-gray-500 mb-3">From: {selectedMsg.fromUser?.username} - {new Date(selectedMsg.createdAt).toLocaleString()}{selectedMsg.coins > 0 && <span className="text-green-600 ml-2">+{selectedMsg.coins} coins</span>}</p>
              {selectedMsg.body && <p className="text-sm whitespace-pre-wrap mb-4">{selectedMsg.body}</p>}
              <button onClick={() => setSelectedMsg(null)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Close</button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
