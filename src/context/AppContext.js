import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Store } from '../utils/store';
import { initNotifications } from '../utils/notifications';

const AppContext = createContext(null);

export const COMMISSION_RATE = 0.15;

export function AppProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    Store.getCurrentUser().then(u => {
      setUser(u);
      if (u?.id) {
        initNotifications(u.id).catch(() => {});
        Store.getFavorites(u.id).then(favs => {
          setFavorites(Array.isArray(favs) ? favs : []);
        }).catch(() => setFavorites([]));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await Store.login(email, password);
    setUser(u);
    initNotifications(u.id).catch(() => {});
    Store.getFavorites(u.id).then(favs => {
      setFavorites(Array.isArray(favs) ? favs : []);
    }).catch(() => setFavorites([]));
    return u;
  }, []);

  const register = useCallback(async (data) => {
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

  // Optimistic update + vraie persistance Supabase
  const toggleFavorite = useCallback(async (venueId) => {
    const isCurrentlyFav = favorites.includes(venueId);
    // Mise à jour optimiste immédiate
    setFavorites(prev =>
      isCurrentlyFav ? prev.filter(id => id !== venueId) : [...prev, venueId]
    );
    try {
      if (user?.id) await Store.toggleFavorite(user.id, venueId);
    } catch {
      // Rollback en cas d'erreur
      setFavorites(prev =>
        isCurrentlyFav ? [...prev, venueId] : prev.filter(id => id !== venueId)
      );
    }
  }, [user?.id, favorites]);

  const addReservation = useCallback(async (reservationData) => {
    return await Store.addReservation({
      ...reservationData,
      userName: user?.name || user?.email || '',
    });
  }, [user]);

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
      addReservation,
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
