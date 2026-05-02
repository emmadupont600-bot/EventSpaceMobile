import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Store } from '../utils/store';
import { initNotifications } from '../utils/notifications';

const AppContext = createContext(null);

export const COMMISSION_RATE = 0.12;

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurer session + init notifications au démarrage
  useEffect(() => {
    Store.getCurrentUser().then(u => {
      setUser(u);
      setLoading(false);
      // Si l'utilisateur est déjà connecté, init push dès le démarrage
      if (u?.id) initNotifications(u.id).catch(() => {});
    });
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await Store.login(email, password);
    setUser(u);
    // Init push après login
    initNotifications(u.id).catch(() => {});
    return u;
  }, []);

  const register = useCallback(async (data) => {
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
