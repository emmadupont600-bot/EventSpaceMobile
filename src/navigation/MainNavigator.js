import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';

import HomeScreen from '../screens/client/HomeScreen';
import VenueDetailScreen from '../screens/client/VenueDetailScreen';
import BookingScreen from '../screens/client/BookingScreen';
import FavoritesScreen from '../screens/client/FavoritesScreen';
import ReservationsScreen from '../screens/client/ReservationsScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import AnnonceurDashboard from '../screens/annonceur/AnnonceurDashboard';
import AddVenueScreen from '../screens/annonceur/AddVenueScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="VenueDetail" component={VenueDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

function AnnonceurStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={AnnonceurDashboard} />
      <Stack.Screen name="AddVenue" component={AddVenueScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const { user } = useApp();
  const isAnnonceur = user?.role === 'annonceur';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border, paddingBottom: 8, paddingTop: 8, height: 65 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Accueil: focused ? 'home' : 'home-outline',
            Dashboard: focused ? 'grid' : 'grid-outline',
            Favoris: focused ? 'heart' : 'heart-outline',
            Réservations: focused ? 'calendar' : 'calendar-outline',
            Profil: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={22} color={color} />;
        },
      })}
    >
      {isAnnonceur ? (
        <Tab.Screen name="Dashboard" component={AnnonceurStack} />
      ) : (
        <>
          <Tab.Screen name="Accueil" component={HomeStack} />
          <Tab.Screen name="Favoris" component={FavoritesScreen} />
          <Tab.Screen name="Réservations" component={ReservationsScreen} />
        </>
      )}
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
