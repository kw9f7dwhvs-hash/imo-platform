'use client';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
export default function AdminPage() {
  return (
    <AuthGuard requiredRole="admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/problems" className="p-6 bg-white rounded-lg border hover:shadow-md">
            <h2 className="font-semibold text-lg">Manage Problems</h2>
            <p className="text-sm text-gray-500 mt-1">View, edit, delete all problems</p>
          </Link>
          <Link href="/admin/problems/new" className="p-6 bg-white rounded-lg border hover:shadow-md">
            <h2 className="font-semibold text-lg">New Problem</h2>
            <p className="text-sm text-gray-500 mt-1">Upload a single problem with hints & answer</p>
          </Link>
          <Link href="/admin/submissions" className="p-6 bg-white rounded-lg border hover:shadow-md">
            <h2 className="font-semibold text-lg">Grade Submissions</h2>
            <p className="text-sm text-gray-500 mt-1">Review pending student submissions</p>
          </Link>
          <Link href="/admin/stats" className="p-6 bg-white rounded-lg border hover:shadow-md">
            <h2 className="font-semibold text-lg">Student Stats</h2>
            <p className="text-sm text-gray-500 mt-1">View student progress, pass rates</p>
          </Link>
        </div>
      </div>
    </AuthGuard>
  );
}
