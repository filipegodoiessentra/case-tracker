// Contexto de autenticação — modo "mock" (padrão, sem Azure AD) já funcional.
// Estrutura pronta para plugar MSAL (@azure/msal-browser/react) quando o Entra
// ID estiver configurado (trocar AUTH_MODE=entra em ambos os .env).
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const MOCK_USER: AuthUser = {
  id: 'u1',
  name: 'Filipe Godoi',
  email: 'filipe.godoi@essentra.com',
  roles: ['Analyst', 'CommercialAnalyst'],
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const authMode = import.meta.env.VITE_AUTH_MODE ?? 'mock';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(authMode === 'mock' ? MOCK_USER : null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      login: () => {
        // Modo mock: autentica instantaneamente como usuário demo.
        // Modo entra: aqui entraria msalInstance.loginPopup()/loginRedirect().
        setUser(MOCK_USER);
      },
      logout: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}
