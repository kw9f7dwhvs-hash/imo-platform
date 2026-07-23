'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function BatchRedirect() {
  const router = useRouter();
  useEffect(() => { router.push('/admin/problems'); }, [router]);
  return <p className="text-gray-400 p-4">Redirecting...</p>;
}
