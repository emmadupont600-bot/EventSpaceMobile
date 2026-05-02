/**
 * AnnonceurNavigator — Stack pour l'onglet annonceur.
 * Inclut EditVenueScreen pour modifier/supprimer une salle.
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AnnonceurDashboard from '../screens/annonceur/AnnonceurDashboard';
import AddVenueScreen from '../screens/annonceur/AddVenueScreen';
import EditVenueScreen from '../screens/annonceur/EditVenueScreen';

const Stack = createStackNavigator();

export default function AnnonceurNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={AnnonceurDashboard} />
      <Stack.Screen name="AddVenue"  component={AddVenueScreen} />
      <Stack.Screen name="EditVenue" component={EditVenueScreen} />
    </Stack.Navigator>
  );
}
