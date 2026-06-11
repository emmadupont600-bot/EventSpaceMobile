/**
 * ClientNavigator — tab bar "Luxury Minimal" 2026 :
 * hauteur 64px + safe area, fond blur (BlurView), icône active accent
 * avec label, icônes inactives muted sans label, onglet central légèrement
 * surélevé, border top 0.5px semi-transparente, pas d'ombres dures.
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Platform, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { hapticSelection } from '../utils/haptics';

import HomeScreen from '../screens/home/HomeScreen';
import MapSearchScreen from '../screens/home/MapSearchScreen';
import VenueDetailScreen from '../screens/home/VenueDetailScreen';
import BookingScreen from '../screens/home/BookingScreen';
import PaymentScreen from '../screens/home/PaymentScreen';
import BookingConfirmationScreen from '../screens/home/BookingConfirmationScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import ReservationsScreen from '../screens/reservations/ReservationsScreen';
import ConversationsScreen from '../screens/chat/ConversationsScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MapSearch" component={MapSearchScreen} />
      <Stack.Screen name="VenueDetail" component={VenueDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
    </Stack.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConversationsList" component={ConversationsScreen} />
      <Stack.Screen name="ChatRoom" component={ChatScreen} />
    </Stack.Navigator>
  );
}

const TABS = [
  { name: 'Accueil',       on: 'home',       off: 'home-outline',       label: 'Accueil' },
  { name: 'Favoris',       on: 'heart',      off: 'heart-outline',      label: 'Favoris' },
  { name: 'Reservations',  on: 'calendar',   off: 'calendar-outline',   label: 'Résas', center: true },
  { name: 'Messages',      on: 'chatbubble', off: 'chatbubble-outline', label: 'Messages' },
  { name: 'Profil',        on: 'person',     off: 'person-outline',     label: 'Profil' },
];

const TAB_BAR_HEIGHT = 64;

export default function ClientNavigator() {
  const { semantic, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenListeners={{ tabPress: () => hapticSelection() }}
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name) || TABS[0];
        return {
          headerShown: false,
          tabBarActiveTintColor: semantic.primary,
          tabBarInactiveTintColor: semantic.textFaint,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : semantic.bg,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(27,23,19,0.10)',
            height: TAB_BAR_HEIGHT + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 6,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarBackground: () =>
            Platform.OS === 'ios' ? (
              <BlurView
                intensity={42}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
            ) : null,
          tabBarLabel: ({ focused, color }) =>
            focused ? (
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
            ) : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, tab.center && styles.iconWrapCenter]}>
              <Ionicons name={focused ? tab.on : tab.off} size={23} color={color} />
            </View>
          ),
        };
      }}
    >
      <Tab.Screen name="Accueil"      component={HomeStack} />
      <Tab.Screen name="Favoris"      component={FavoritesScreen} />
      <Tab.Screen name="Reservations" component={ReservationsScreen} />
      <Tab.Screen name="Messages"     component={ChatStack} />
      <Tab.Screen name="Profil"       component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    minWidth: 44, height: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  // Onglet central légèrement surélevé (pas de FAB)
  iconWrapCenter: { transform: [{ translateY: -3 }] },
  label: { fontSize: 12, fontWeight: '600', marginTop: 1 },
});
