import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext, TOKEN_STORAGE_KEY } from './authContextInstance';
import { authApi } from '../services/api';

/**
 * Authentication Context Provider
 * Manages global authentication state, token persistence, and profile verification.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  });
  const [isLoading, setIsLoading] = useState(() => {
    return typeof window !== 'undefined' && Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
  });

  // Verify stored token session when present on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      return;
    }

    let isMounted = true;
    authApi
      .getProfile()
      .then((profile) => {
        if (isMounted) {
          if (profile && profile.id) {
            setUser(profile);
            setToken(storedToken);
          } else {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            setUser(null);
            setToken(null);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setUser(null);
          setToken(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Log in user, store token in localStorage, and update context state
   */
  const login = useCallback((newToken, userData) => {
    if (newToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      setToken(newToken);
    }
    if (userData) {
      setUser(userData);
    }
  }, []);

  /**
   * Log out user, notify backend, and purge local credentials
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue client cleanup even if logout request fails
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
