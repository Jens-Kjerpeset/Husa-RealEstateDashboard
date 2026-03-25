import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Generate a secure JWT using Clerk specifically formulated for Firebase
    const syncFirebaseUser = async () => {
      try {
        const token = await getToken({ template: 'integration_firebase' });
        if (token) {
          // Keep Firebase's auth context mirrored correctly with Clerk's current user
          await signInWithCustomToken(auth, token);
        } else {
          // Sign out of Firebase if Clerk is signed out
          await auth.signOut();
        }
      } catch (error) {
        // Since we are mocking Firebase configuration natively, we'll swallow auth errors locally
        if (import.meta.env.DEV) {
          console.warn('Firebase Custom Token Error: Did you insert valid VITE_FIREBASE keys?', error);
        }
      }
    };

    syncFirebaseUser();
  }, [getToken]);

  return <>{children}</>;
}
