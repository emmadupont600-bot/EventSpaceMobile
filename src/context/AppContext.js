import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

const DEMO_USERS = [
  { id: '1', email: 'client@demo.fr', password: 'demo1234', name: 'Marie Dupont', role: 'client', avatar: 'MD' },
  { id: '2', email: 'annonceur@demo.fr', password: 'demo5678', name: 'Pierre Martin', role: 'annonceur', avatar: 'PM', company: 'EventPro Paris' },
];

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [messages, setMessages] = useState({});

  const login = (email, password) => {
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (found) { setUser(found); return { success: true, user: found }; }
    return { success: false, error: 'Email ou mot de passe incorrect' };
  };

  const register = (name, email, password, role) => {
    const newUser = { id: Date.now().toString(), email, password, name, role, avatar: name.slice(0, 2).toUpperCase() };
    setUser(newUser);
    return { success: true };
  };

  // logout : vide tout et remet user à null → RootNavigator bascule automatiquement
  const logout = () => {
    setUser(null);
    setFavorites([]);
    setReservations([]);
    setMessages({});
  };

  const toggleFavorite = (venueId) => {
    setFavorites(prev =>
      prev.includes(venueId) ? prev.filter(id => id !== venueId) : [...prev, venueId]
    );
  };

  const addReservation = (reservation) => {
    const newRes = {
      ...reservation,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setReservations(prev => [...prev, newRes]);
    return newRes;
  };

  const updateReservationStatus = (id, status) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const sendMessage = (venueId, text, sender) => {
    const msg = {
      id: Date.now().toString(),
      text,
      sender,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => ({ ...prev, [venueId]: [...(prev[venueId] || []), msg] }));
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,   // exposé pour permettre logout depuis n'importe quel screen
      login,
      register,
      logout,
      favorites,
      toggleFavorite,
      reservations,
      addReservation,
      updateReservationStatus,
      messages,
      sendMessage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
