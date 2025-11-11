/**
 * Providers Component
 *
 * Client component that wraps the application with all necessary providers.
 * This is separated from the root layout to allow the layout to remain a Server Component.
 *
 * @component
 */

'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { queryClient } from '@/lib/query-client.js';
import theme from '@/theme';
import { Navigation } from '@/components/layout/Navigation';

/**
 * Providers Component
 *
 * Wraps the application with all necessary providers:
 * 1. Auth0 Provider
 * 2. TanStack Query Provider
 * 3. MUI Theme Provider
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Providers wrapper
 */
export function Providers({ children }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navigation />
          <main style={{
            minHeight: 'calc(100vh - 80px)', // Account for navigation height
            padding: '32px 24px',
          }}>
            {children}
          </main>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
