'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function AuthGuard({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'admin' | 'student' }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
    else if (requiredRole && user?.role !== requiredRole) router.push('/');
  }, [session, status, router, requiredRole, user?.role]);
  if (status === 'loading') return <div className="flex justify-center items-center min-h-[60vh]"><span className="text-gray-400">Loading...</span></div>;
  if (!session) return null;
  if (requiredRole && user?.role !== requiredRole) return null;
  return <>{children}</>;
}
