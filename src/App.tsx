import React from 'react';
import AppRoutes from './routes';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './components/ThemeProvider';
import Layout from './components/Layout';

import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ThemeProvider>
          {/* BrowserRouter removed; HashRouter is in main.tsx */}
          <Layout>
            <AppRoutes />
          </Layout>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
