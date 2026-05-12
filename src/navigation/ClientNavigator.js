import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Platform, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

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
  { name: 'Reservations',  on: 'calendar',   off: 'calendar-outline',   label: 'R\u00e9sas' },
  { name: 'Messages',      on: 'chatbubble', off: 'chatbubble-outline',  label: 'Messages' },
  { name: 'Profil',        on: 'person',     off: 'person-outline',     label: 'Profil' },
];

export default function ClientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name) || TABS[0];
        return {
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: '#AAAAB5',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 28 : 10,
            paddingTop: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.07,
            shadowRadius: 12,
            elevation: 16,
          },
          tabBarLabel: ({ color }) => (
            <Text style={{ fontSize: 10, fontWeight: '600', color, marginTop: 1 }}>
              {tab.label}
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeWrap : styles.inactiveWrap}>
              <Ionicons name={focused ? tab.on : tab.off} size={22} color={color} />
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
  inactiveWrap: { width: 40, height: 28, alignItems: 'center', justifyContent: 'center' },
  activeWrap: {
    width: 48, height: 28, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primaryLight || '#EEF2FF', borderRadius: 14,
  },
});
