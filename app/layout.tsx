import './globals.css';
import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import { BoatProvider } from './context/BoatContext';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

import NavBar from './components/nav/NavBar';
import Footer from './components/footer/Footer';

const workSans = Work_Sans({ subsets: ['latin'], weight: ['400', '700'] });

// Metadata for the app
export const metadata: Metadata = {
  title: 'WaveRiders',
  description: 'Boat rental site for everyone',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
      {/* Favicon and related icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
     </head>
      <body className={`${workSans.className} text-slate-700`}>
        <AuthProvider> {/* Wrap children with AuthProvider */}
          <BoatProvider> {/* Nested inside AuthProvider */}
            <div className="bg-slate-200 min-h-screen flex items-center justify-center">
              <div className="flex flex-col min-h-screen w-[1350px] bg-white rounded-[1rem] shadow-lg mx-4 my-8">
                <NavBar />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
            </div>
          </BoatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
