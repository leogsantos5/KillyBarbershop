import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import { Navbar } from './components/navbar';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Killy Ross & Xandi Gavira",
  description: "Barbearia Premium em Alfragide",
  icons: {
    icon: '/images/barberLogo.png',
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
