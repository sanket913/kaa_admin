import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kalakar Art Academy - Admin',
  description: 'Admin Panel for Kalakar Art Academy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/protection.png" />
        <link rel="shortcut icon" type="image/png" href="/protection.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
