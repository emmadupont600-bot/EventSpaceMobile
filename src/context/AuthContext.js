import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const DEMO_USERS = [
  { id: '1', email: 'user@demo.fr', password: 'demo1234', name: 'Thomas Martin', role: 'client', avatar: null },
  { id: '2', email: 'annonceur@demo.fr', password: 'demo5678', name: 'Sophie Dupont', role: 'annonceur', avatar: null },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    setLoading(false);
    if (found) {
      setUser(found);
      return { success: true };
    }
    return { success: false, error: 'Email ou mot de passe incorrect' };
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const newUser = { id: Date.now().toString(), email, password, name, role, avatar: null };
    setUser(newUser);
    setLoading(false);
    return { success: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
