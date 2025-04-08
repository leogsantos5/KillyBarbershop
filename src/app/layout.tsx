import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import { Navbar } from './components/navbar';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Killy Ross & Xandi Gavira",
  description: "Barbearia Premium em Alfragide",
  icons: {
    icon: [
      { url: '/images/barberLogo.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/barberLogo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/images/barberLogo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
