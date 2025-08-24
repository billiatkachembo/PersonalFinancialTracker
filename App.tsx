import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './components/ThemeProvider';
import Layout from './components/Layout'; // Import the Layout component

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
          <BrowserRouter>
            {/* Wrap your routes with the Layout component */}
            <Layout>
              <AppRoutes />
            </Layout>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
