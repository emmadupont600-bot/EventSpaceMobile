/**
 * AppNavigator — ajoute la route 'Payment' dans le stack shared
 * et active Realtime dans l'initialisation.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/colors';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Client
import HomeScreen from '../screens/home/HomeScreen';
import VenueDetailScreen from '../screens/shared/VenueDetailScreen';
import BookingScreen from '../screens/shared/BookingScreen';
import PaymentScreen from '../screens/shared/PaymentScreen';
import ReservationsScreen from '../screens/reservations/ReservationsScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';

// Chat
import ConversationsScreen from '../screens/chat/ConversationsScreen';
import ChatScreen from '../screens/chat/ChatScreen';

// Annonceur
import AnnonceurDashboard from '../screens/annonceur/AnnonceurDashboard';
import AddVenueScreen from '../screens/annonceur/AddVenueScreen';
import EditVenueScreen from '../screens/annonceur/EditVenueScreen';

// Profil
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TAB_ICONS = {
  HomeTab:        ['home', 'home-outline'],
  ReservTab:      ['calendar', 'calendar-outline'],
  FavTab:         ['heart', 'heart-outline'],
  ChatTab:        ['chatbubbles', 'chatbubbles-outline'],
  ProfileTab:     ['person', 'person-outline'],
  AnnonceurTab:   ['grid', 'grid-outline'],
};

function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mid,
        tabBarStyle: { borderTopColor: colors.border, height: 60, paddingBottom: 8 },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name] || ['ellipse', 'ellipse-outline'];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab"    component={HomeScreen}          options={{ title: 'Explorer' }} />
      <Tab.Screen name="ReservTab"  component={ReservationsScreen}  options={{ title: 'Réservations' }} />
      <Tab.Screen name="FavTab"     component={FavoritesScreen}     options={{ title: 'Favoris' }} />
      <Tab.Screen name="ChatTab"    component={ConversationsScreen} options={{ title: 'Messages' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen}       options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

function AnnonceurTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mid,
        tabBarStyle: { borderTopColor: colors.border, height: 60, paddingBottom: 8 },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name] || ['ellipse', 'ellipse-outline'];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="AnnonceurTab" component={AnnonceurDashboard} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="ChatTab"      component={ConversationsScreen} options={{ title: 'Messages' }} />
      <Tab.Screen name="ProfileTab"   component={ProfileScreen}       options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth
          <>
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user.role === 'annonceur' ? (
          // Annonceur
          <>
            <Stack.Screen name="AnnonceurRoot" component={AnnonceurTabs} />
            <Stack.Screen name="AddVenue"  component={AddVenueScreen} />
            <Stack.Screen name="EditVenue" component={EditVenueScreen} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
          </>
        ) : (
          // Client
          <>
            <Stack.Screen name="ClientRoot"   component={ClientTabs} />
            <Stack.Screen name="VenueDetail"  component={VenueDetailScreen} />
            <Stack.Screen name="Booking"      component={BookingScreen} />
            <Stack.Screen name="Payment"      component={PaymentScreen} />
            <Stack.Screen name="ChatScreen"   component={ChatScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
