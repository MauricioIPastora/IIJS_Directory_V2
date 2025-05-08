import { createContext, useContext, useState, useEffect } from 'react';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { isAuthenticated, signIn as cognitoSignIn, signOut as cognitoSignOut, getCurrentUser } from '@/lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: CognitoUser | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<any>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: CognitoUser | null;
    isLoading: boolean;
  }>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  async function checkAuthState() {
    try {
      const authenticated = await isAuthenticated();
      setAuthState({
        isAuthenticated: authenticated,
        user: authenticated ? getCurrentUser() : null,
        isLoading: false
      });
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const result = await cognitoSignIn(email, password);
      setAuthState({
        isAuthenticated: true,
        user: getCurrentUser(),
        isLoading: false
      });
      return result;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  }

  function signOut() {
    cognitoSignOut();
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        isLoading: authState.isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);