import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import HomeScreen from '../screens/home/HomeScreen';
import MapSearchScreen from '../screens/home/MapSearchScreen';
import VenueDetailScreen from '../screens/home/VenueDetailScreen';
import BookingScreen from '../screens/home/BookingScreen';
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

// filled quand actif, outline quand inactif
const TAB_ICONS = {
  'Accueil':       { on: 'home',          off: 'home-outline' },
  'Favoris':       { on: 'heart',         off: 'heart-outline' },
  'R\u00e9servations': { on: 'calendar',  off: 'calendar-outline' },
  'Messages':      { on: 'chatbubble',    off: 'chatbubble-outline' },
  'Profil':        { on: 'person',        off: 'person-outline' },
};

export default function ClientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const icons = TAB_ICONS[route.name] || { on: 'ellipse', off: 'ellipse-outline' };
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
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.1,
          },
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeWrap : styles.inactiveWrap}>
              <Ionicons
                name={focused ? icons.on : icons.off}
                size={22}
                color={color}
              />
            </View>
          ),
        };
      }}
    >
      <Tab.Screen name="Accueil"       component={HomeStack} />
      <Tab.Screen name="Favoris"       component={FavoritesScreen} />
      <Tab.Screen name="R\u00e9servations"  component={ReservationsScreen} />
      <Tab.Screen name="Messages"      component={ChatStack} />
      <Tab.Screen name="Profil"        component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  inactiveWrap: {
    width: 40, height: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  activeWrap: {
    width: 48, height: 28,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primaryLight || '#EEF2FF',
    borderRadius: 14,
  },
});
