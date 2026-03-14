import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['cyrillic', 'latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Image Resizer App - Pro Marketing Assets',
  description: 'Resize ảnh hàng loạt không méo cho Meta, Google, TikTok, Moloco.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#09090b] text-zinc-50 selection:bg-blue-500/30`}>
        {/* Background ambient light */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-[25%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
        </div>
        {children}
      </body>
    </html>
  );
}
