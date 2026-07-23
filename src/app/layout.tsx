import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
export const metadata: Metadata = { title: 'IMO Training', description: 'IMO Training Platform' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
