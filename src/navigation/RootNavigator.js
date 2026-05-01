import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';
import AnnonceurNavigator from './AnnonceurNavigator';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { user } = useAuth();

  if (!user) return <AuthNavigator />;
  if (user.role === 'annonceur') return <AnnonceurNavigator />;
  return <ClientNavigator />;
}
