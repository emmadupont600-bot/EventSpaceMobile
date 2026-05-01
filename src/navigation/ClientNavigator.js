import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow } from '../theme/colors';

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

/* Icônes Ionicons : filled quand actif, outline quand inactif */
const TAB_ICONS = {
  Accueil:       { active: 'home',             inactive: 'home-outline' },
  Favoris:       { active: 'heart',            inactive: 'heart-outline' },
  Réservations:  { active: 'calendar',         inactive: 'calendar-outline' },
  Messages:      { active: 'chatbubble',       inactive: 'chatbubble-outline' },
  Profil:        { active: 'person',           inactive: 'person-outline' },
};

export default function ClientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#B0B0BE',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 16,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarIcon: ({ color, focused, size }) => {
          const cfg = TAB_ICONS[route.name];
          const iconName = focused ? cfg?.active : cfg?.inactive;
          return (
            <View style={focused ? styles.activeIconWrap : styles.iconWrap}>
              <Ionicons
                name={iconName || 'ellipse-outline'}
                size={23}
                color={color}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Accueil"      component={HomeStack} />
      <Tab.Screen name="Favoris"      component={FavoritesScreen} />
      <Tab.Screen name="Réservations" component={ReservationsScreen} />
      <Tab.Screen name="Messages"     component={ChatStack} />
      <Tab.Screen name="Profil"       component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 32,
  },
  activeIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 32,
    backgroundColor: colors.primaryLight || '#EEF2FF',
    borderRadius: 16,
  },
});
