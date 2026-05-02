import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Store } from '../utils/store';

const AppContext = createContext(null);

export const COMMISSION_RATE = 0.12;

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurer la session au démarrage (mémoire uniquement, pas de persist)
  useEffect(() => {
    Store.getCurrentUser().then(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await Store.login(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const u = await Store.register(data);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await Store.logout();
    setUser(null);
  }, []);

  const updateReservationStatus = useCallback(async (id, status) => {
    await Store.updateReservation(id, { status });
  }, []);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      loading,
      login,
      register,
      logout,
      COMMISSION_RATE,
      updateReservationStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
