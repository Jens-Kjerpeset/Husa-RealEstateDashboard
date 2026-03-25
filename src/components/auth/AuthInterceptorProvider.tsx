import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setupApiInterceptors } from '../../lib/apiClient';

export function AuthInterceptorProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Bind the dynamically rotating token to our Axios instance automatically
    setupApiInterceptors(() => getToken());
  }, [getToken]);

  return <>{children}</>;
}
