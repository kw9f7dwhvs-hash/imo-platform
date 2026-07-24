"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user as any;
  const isAdmin = user?.role === "admin";
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!session) return;
    fetch("/api/messages/unread-count").then(r => r.json()).then(d => setUnread(d.count || 0)).catch(() => {});
    const interval = setInterval(() => {
      fetch("/api/messages/unread-count").then(r => r.json()).then(d => setUnread(d.count || 0)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600">IMO Training</Link>
          <div className="flex gap-3">
            <Link href="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
            <Link href="/register" className="text-gray-600 hover:text-blue-600">Register</Link>
          </div>
        </div>
      </nav>
    );
  }
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-blue-600">IMO</Link>
          <Link href="/problems" className={pathname.startsWith("/problems") ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}>Problems</Link>
          {isAdmin && (
            <>
              <Link href="/admin" className={pathname.startsWith("/admin") && !pathname.includes("/submissions") ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}>Manage</Link>
              <Link href="/admin/submissions" className={pathname === "/admin/submissions" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}>Grade</Link>
            </>
          )}
          <Link href="/messages" className={"relative " + (pathname === "/messages" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600")}>
            Messages{unread > 0 && <span className="absolute -top-1.5 -right-4 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unread > 9 ? "9+" : unread}</span>}
          </Link>
          <Link href="/wallet" className={pathname === "/wallet" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}>Wallet</Link>
          {!isAdmin && <Link href="/profile" className={pathname === "/profile" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}>Profile</Link>}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.name} ({user?.role})</span>
          <button onClick={() => signOut()} className="text-sm text-red-500 hover:text-red-700">Logout</button>
        </div>
      </div>
    </nav>
  );
}
