import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Store } from '../utils/store';
import { initNotifications } from '../utils/notifications';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const syncFavorites = useCallback((userId) => {
    if (!userId) {
      setFavorites([]);
      return;
    }
    Store.getFavorites(userId)
      .then(favs => setFavorites(Array.isArray(favs) ? favs : []))
      .catch(() => setFavorites([]));
  }, []);

  useEffect(() => {
    let mounted = true;

    Store.getCurrentUser()
      .then(u => {
        if (!mounted) return;
        setUser(u);
        if (u?.id) {
          initNotifications(u.id).catch(() => {});
          syncFavorites(u.id);
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });

    const unsubscribe = Store.onAuthStateChange(u => {
      if (!mounted) return;
      setUser(u);
      if (u?.id) {
        initNotifications(u.id).catch(() => {});
        syncFavorites(u.id);
      } else {
        setFavorites([]);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [syncFavorites]);

  const login = useCallback(async (email, password) => {
    const u = await Store.login(email, password);
    setUser(u);
    initNotifications(u.id).catch(() => {});
    syncFavorites(u.id);
    return u;
  }, [syncFavorites]);

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

  const toggleFavorite = useCallback(async (venueId) => {
    const isCurrentlyFav = favorites.includes(venueId);
    setFavorites(prev =>
      isCurrentlyFav ? prev.filter(id => id !== venueId) : [...prev, venueId]
    );
    try {
      if (user?.id) await Store.toggleFavorite(user.id, venueId);
    } catch {
      setFavorites(prev =>
        isCurrentlyFav ? [...prev, venueId] : prev.filter(id => id !== venueId)
      );
    }
  }, [user?.id, favorites]);

  const addReservation = useCallback(async (reservationData) => {
    return await Store.addReservation({
      ...reservationData,
      userId: user?.id,
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
