import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Store } from '../utils/store';
import { initNotifications } from '../utils/notifications';

const AppContext = createContext(null);

export const COMMISSION_RATE = 0.12;

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Store.getCurrentUser().then(u => {
      setUser(u);
      setLoading(false);
      if (u?.id) initNotifications(u.id).catch(() => {});
    }).catch(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    // throws si erreur — le screen catch et affiche le message
    const u = await Store.login(email, password);
    setUser(u);
    initNotifications(u.id).catch(() => {});
    return u;
  }, []);

  const register = useCallback(async (data) => {
    // data = { name, email, password, role }
    const u = await Store.register(data);
    setUser(u);
    initNotifications(u.id).catch(() => {});
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
