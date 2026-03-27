import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    const syncFirebaseUser = async () => {
      try {
        const token = await getToken({ template: 'integration_firebase' });
        if (token) {
          await signInWithCustomToken(auth, token);
        } else {
          await auth.signOut();
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Firebase Custom Token Error: Did you insert valid VITE_FIREBASE keys?', error);
        }
      }
    };

    syncFirebaseUser();
  }, [getToken]);

  return <>{children}</>;
}
