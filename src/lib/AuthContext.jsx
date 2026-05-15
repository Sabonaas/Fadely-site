import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { mapSessionUser } from '@/lib/mapUser';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const syncSession = useCallback(async (session) => {
    if (session?.user) {
      setUser(mapSessionUser(session.user));
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setAuthChecked(true);
    setIsLoadingAuth(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setIsLoadingAuth(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!cancelled) await syncSession(session);
      } catch (e) {
        console.error('Auth init failed:', e);
        if (!cancelled) {
          setAuthError({ type: 'unknown', message: e.message || 'Auth failed' });
          setIsLoadingAuth(false);
          setAuthChecked(true);
        }
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [syncSession]);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      await syncSession(session);
    } catch (e) {
      console.error('checkUserAuth:', e);
      setIsAuthenticated(false);
      setUser(null);
      setAuthChecked(true);
      setIsLoadingAuth(false);
    }
  }, [syncSession]);

  const checkAppState = useCallback(async () => {
    await checkUserAuth();
  }, [checkUserAuth]);

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      window.location.assign('/');
    }
  };

  const navigateToLogin = () => {
    const q = new URLSearchParams();
    q.set('next', window.location.pathname + window.location.search);
    window.location.assign(`/login?${q.toString()}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authError,
        appPublicSettings: null,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
