import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Store } from '../utils/store';
import { initNotifications } from '../utils/notifications';

const AppContext = createContext(null);

export const COMMISSION_RATE = 0.12;

export function AppProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [favorites, setFavorites] = useState([]); // liste des IDs de lieux favoris

  // Chargement initial
  useEffect(() => {
    Store.getCurrentUser().then(u => {
      setUser(u);
      if (u?.id) {
        initNotifications(u.id).catch(() => {});
        // charger les favoris depuis le store si dispo
        Store.getFavorites?.(u.id).then(favs => {
          setFavorites(Array.isArray(favs) ? favs : []);
        }).catch(() => setFavorites([]));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await Store.login(email, password);
    setUser(u);
    initNotifications(u.id).catch(() => {});
    // charger les favoris de cet user
    Store.getFavorites?.(u.id).then(favs => {
      setFavorites(Array.isArray(favs) ? favs : []);
    }).catch(() => setFavorites([]));
    return u;
  }, []);

  const register = useCallback(async (data) => {
    // data = { name, email, password, role }
    const u = await Store.register(data);
    setUser(u);
    setFavorites([]);
    initNotifications(u.id).catch(() => {});
    return u;
  }, []);

  const logout = useCallback(async () => {
    await Store.logout();
    setUser(null);
    setFavorites([]);
  }, []);

  const toggleFavorite = useCallback(async (venueId) => {
    setFavorites(prev => {
      const next = prev.includes(venueId)
        ? prev.filter(id => id !== venueId)
        : [...prev, venueId];
      // persister en arrière-plan (optionnel)
      if (user?.id) {
        Store.saveFavorites?.(user.id, next).catch(() => {});
      }
      return next;
    });
  }, [user?.id]);

  const updateReservationStatus = useCallback(async (id, status) => {
    await Store.updateReservation(id, { status });
  }, []);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      loading,
      favorites,
      toggleFavorite,
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
