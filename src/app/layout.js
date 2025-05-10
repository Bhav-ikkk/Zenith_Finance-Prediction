import './globals.css';
import Navbar from './components/Navbar';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'Digital Gulak',
  description: 'Smart savings app with lock-up period',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{ padding: '2rem' }}>{children}</main>
      </body>
    </html>
  );
}
