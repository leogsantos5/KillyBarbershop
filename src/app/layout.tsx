import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from './components/navbar';



export const metadata: Metadata = {
  title: "Killy Ross & Xandy Gavira",
  description: "Barbearia Premium em Alfragide",
  icons: {
    icon: '/images/barberLogo.png',
    apple: '/images/barberLogo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-white dark:bg-gray-900">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
