'use client';

// ─────────────────────────────────────────────────────────────────────────────
// AuthProvider + useAuth() — état global de l'utilisateur authentifié.
//
// Source de vérité = serveur (Session DB). Le front se contente d'un
// /api/me au boot pour savoir qui est connecté + offre des helpers
// signup/login/logout qui appellent les routes API et rafraîchissent
// l'état local.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiCall, ApiClientError } from '../api/client';

export interface AuthMe {
  accountId: string;
  kind: 'user' | 'member';
  role?: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  emailVerifiedAt: string | null;
  identityVerified: boolean;
}

interface AuthContextValue {
  me: AuthMe | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  login: (input: LoginInput) => Promise<{ mfaRequired?: boolean }>;
  logout: () => Promise<void>;
}

interface SignupInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  locale?: 'fr' | 'en' | 'ar';
  currency?: 'MAD' | 'EUR' | 'USD';
}

interface LoginInput {
  email: string;
  password: string;
  totpCode?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<AuthMe | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiCall<AuthMe>('/api/me', { skipRefreshOnAuth: false });
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signup = useCallback<AuthContextValue['signup']>(async (input) => {
    await apiCall<{ userId: string }>('/api/auth/signup', {
      method: 'POST',
      body: input,
    });
    await refresh();
  }, [refresh]);

  const login = useCallback<AuthContextValue['login']>(async (input) => {
    try {
      await apiCall<unknown>('/api/auth/login', {
        method: 'POST',
        body: input,
      });
      await refresh();
      return {};
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'MFA_REQUIRED') {
        return { mfaRequired: true };
      }
      throw err;
    }
  }, [refresh]);

  const logout = useCallback<AuthContextValue['logout']>(async () => {
    try {
      await apiCall('/api/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    setMe(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ me, loading, refresh, signup, login, logout }),
    [me, loading, refresh, signup, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() doit être appelé dans <AuthProvider>.');
  }
  return ctx;
}
