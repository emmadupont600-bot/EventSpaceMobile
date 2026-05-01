import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, shadow } from '../theme/colors';

import AnnonceurDashboard from '../screens/annonceur/AnnonceurDashboard';
import AddVenueScreen from '../screens/annonceur/AddVenueScreen';
import ReservationsScreen from '../screens/reservations/ReservationsScreen';
import ConversationsScreen from '../screens/chat/ConversationsScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConversationsList" component={ConversationsScreen} />
      <Stack.Screen name="ChatRoom" component={ChatScreen} />
    </Stack.Navigator>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={AnnonceurDashboard} />
      <Stack.Screen name="AddVenue" component={AddVenueScreen} />
    </Stack.Navigator>
  );
}

export default function AnnonceurNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.light,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 10,
          ...shadow.md,
          shadowColor: '#000',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Dashboard: 'grid',
            'Ajouter': 'plus-circle',
            Réservations: 'calendar',
            Messages: 'message-circle',
            Profil: 'user',
          };
          return (
            <View style={focused ? {
              backgroundColor: colors.primaryLight,
              borderRadius: 10,
              padding: 6,
            } : { padding: 6 }}>
              <Feather name={icons[route.name] || 'circle'} size={22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Ajouter" component={AddVenueScreen} />
      <Tab.Screen name="Réservations" component={ReservationsScreen} />
      <Tab.Screen name="Messages" component={ChatStack} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
