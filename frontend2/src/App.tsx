import { ThemeProvider } from 'next-themes';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import { RouterProvider } from '@tanstack/react-router';
import { router } from '@/routing/router';
import { queryClient } from '@/lib/query-client';
import { ProvidersWrapper } from './providers/providers-wrapper';

export function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      storageKey="vite-theme"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <HelmetProvider>
        <Toaster />
        <ProvidersWrapper>
          <RouterProvider router={router} context={{ queryClient }} />
        </ProvidersWrapper>
      </HelmetProvider>
    </ThemeProvider>
  );
}
