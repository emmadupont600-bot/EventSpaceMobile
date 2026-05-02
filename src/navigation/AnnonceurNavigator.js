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

/**
 * DashboardStack : contient le dashboard ET l'écran d'ajout de lieu.
 * Correction : navigate('AddVenue') depuis AnnonceurDashboard navigue dans ce stack.
 */
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={AnnonceurDashboard} />
      <Stack.Screen name="AddVenue" component={AddVenueScreen} />
    </Stack.Navigator>
  );
}

const TABS = [
  { name: 'Dashboard',    label: 'Tableau',   icon: 'grid' },
  { name: 'Réservations', label: 'Résas',     icon: 'calendar' },
  { name: 'Messages',     label: 'Messages',  icon: 'message-circle' },
  { name: 'Profil',       label: 'Profil',    icon: 'user' },
];

export default function AnnonceurNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name) || TABS[0];
        return {
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: '#AAAAB5',
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 84 : 68,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            paddingTop: 10,
            ...(shadow?.md || {}),
          },
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? {
              backgroundColor: colors.primaryLight || '#EEF2FF',
              borderRadius: 10, padding: 6,
            } : { padding: 6 }}>
              <Feather name={tab.icon} size={22} color={color} />
            </View>
          ),
          tabBarLabel: tab.label,
        };
      }}
    >
      <Tab.Screen name="Dashboard"    component={DashboardStack} />
      <Tab.Screen name="Réservations" component={ReservationsScreen} />
      <Tab.Screen name="Messages"     component={ChatStack} />
      <Tab.Screen name="Profil"       component={ProfileScreen} />
    </Tab.Navigator>
  );
}
