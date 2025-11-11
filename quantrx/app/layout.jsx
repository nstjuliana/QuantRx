/**
 * Root Layout
 *
 * Root layout for the QuantRx application.
 * This is a Server Component that wraps the client-side Providers component.
 *
 * @module app/layout
 */

import { Inter } from 'next/font/google';
import { Providers } from '@/components/layout/Providers';
import './globals.css';

// Load Inter font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

/**
 * Root Layout Component
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Root layout with providers
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

/**
 * Metadata for the application
 */
export const metadata = {
  title: 'QuantRx - NDC Packaging & Quantity Calculator',
  description: 'AI-accelerated tool for matching prescriptions with valid NDCs and calculating correct dispense quantities.',
  keywords: ['pharmacy', 'NDC', 'prescription', 'calculator', 'healthcare'],
  authors: [{ name: 'Foundation Health' }],
};

/**
 * Viewport configuration for the application
 */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};
