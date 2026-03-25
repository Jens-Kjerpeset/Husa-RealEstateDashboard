import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthInterceptorProvider } from './components/auth/AuthInterceptorProvider';
import { FirebaseAuthProvider } from './components/auth/FirebaseAuthProvider';
import './index.css';
import App from './App.tsx';

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <AuthInterceptorProvider>
          <FirebaseAuthProvider>
            <App />
          </FirebaseAuthProvider>
        </AuthInterceptorProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>
);
