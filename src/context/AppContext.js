/**
 * AppContext — source unique de vérité pour auth + données app.
 * Utilise Store (AsyncStorage) pour la persistance.
 * AuthContext.js est conservé comme alias pour la rétro-compatibilité.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Store } from '../utils/store';
import { schedulePushNotification } from '../utils/notifications';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restaure la session au démarrage
  useEffect(() => {
    (async () => {
      try {
        const u = await Store.getCurrentUser();
        if (u) {
          setUser(u);
          const favs = await Store.getFavorites(u.id);
          setFavorites(favs);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ─── AUTH ───────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const u = await Store.login(email, password);
      setUser(u);
      const favs = await Store.getFavorites(u.id);
      setFavorites(favs);
      return { success: true, user: u };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const u = await Store.register({ name, email, password, role });
      setUser(u);
      setFavorites([]);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const logout = async () => {
    await Store.logout();
    setUser(null);
    setFavorites([]);
  };

  // ─── FAVORIS ────────────────────────────────────────────────────────────────
  const toggleFavorite = async (venueId) => {
    if (!user) return;
    const added = await Store.toggleFavorite(user.id, venueId);
    const favs = await Store.getFavorites(user.id);
    setFavorites(favs);
    return added;
  };

  // ─── RÉSERVATIONS ───────────────────────────────────────────────────────────
  const COMMISSION_RATE = 0.12; // 12% prélevé sur l'annonceur

  const addReservation = async (reservation) => {
    const subtotal = reservation.total || 0;
    const commission = Math.round(subtotal * COMMISSION_RATE);
    const annonceurNet = subtotal - commission;
    const enriched = {
      ...reservation,
      commission,
      annonceurNet,
      commissionRate: COMMISSION_RATE,
      status: 'pending',
    };
    const saved = await Store.addReservation(enriched);
    // Notification push côté client
    await schedulePushNotification(
      '🎉 Demande envoyée !',
      `Votre demande pour « ${reservation.venueName} » est en attente de confirmation.`,
      1
    );
    return saved;
  };

  const updateReservationStatus = async (id, status) => {
    await Store.updateReservation(id, { status });
    // Notification push si confirmation / refus
    if (status === 'confirmed') {
      await schedulePushNotification(
        '✅ Réservation confirmée !',
        'L\'annonceur a accepté votre demande.',
        2
      );
    } else if (status === 'cancelled') {
      await schedulePushNotification(
        '❌ Réservation refusée',
        'L\'annonceur n\'a pas pu accepter votre demande.',
        2
      );
    }
  };

  const getReservations = async () => Store.getReservations();

  // ─── MESSAGES ───────────────────────────────────────────────────────────────
  const sendMessage = async (convId, text, sender) => {
    return Store.addMessage(convId, { text, sender });
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      loading,
      favorites,
      login,
      register,
      logout,
      toggleFavorite,
      addReservation,
      updateReservationStatus,
      getReservations,
      sendMessage,
      COMMISSION_RATE,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
