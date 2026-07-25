'use client';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
export default function AdminPage() {
  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/problems" className="p-6 bg-white rounded-lg border hover:shadow-md"><h2 className="font-semibold text-lg">Problems</h2><p className="text-sm text-gray-500 mt-1">Manage problem bank</p></Link>
          <Link href="/admin/problems/new" className="p-6 bg-white rounded-lg border hover:shadow-md"><h2 className="font-semibold text-lg">New Problem</h2><p className="text-sm text-gray-500 mt-1">Upload a new problem</p></Link>
          <Link href="/admin/submissions" className="p-6 bg-white rounded-lg border hover:shadow-md"><h2 className="font-semibold text-lg">Grade</h2><p className="text-sm text-gray-500 mt-1">Review & grade submissions</p></Link>
          <Link href="/admin/stats" className="p-6 bg-white rounded-lg border hover:shadow-md"><h2 className="font-semibold text-lg">Stats</h2><p className="text-sm text-gray-500 mt-1">Student progress & logs</p></Link>
          <Link href="/admin/wallets" className="p-6 bg-white rounded-lg border hover:shadow-md"><h2 className="font-semibold text-lg">Wallets</h2><p className="text-sm text-gray-500 mt-1">Manage coins & transactions</p></Link>
          <Link href="/admin/users" className="p-6 bg-white rounded-lg border hover:shadow-md"><h2 className="font-semibold text-lg">Users</h2><p className="text-sm text-gray-500 mt-1">Manage accounts & passwords</p></Link>
          <Link href="/messages" className="p-6 bg-white rounded-lg border hover:shadow-md"><h2 className="font-semibold text-lg">Messages</h2><p className="text-sm text-gray-500 mt-1">Internal messaging system</p></Link>
        </div>
      </div>
    </AuthGuard>
  );
}
