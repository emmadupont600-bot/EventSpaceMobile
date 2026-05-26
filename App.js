import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useApp } from './src/context/AppContext';
import { ToastProvider } from './src/components/Toast';
import AuthNavigator from './src/navigation/AuthNavigator';
import ClientNavigator from './src/navigation/ClientNavigator';
import AnnonceurNavigator from './src/navigation/AnnonceurNavigator';
import { STRIPE_PUBLISHABLE_KEY, getStripeSDK } from './src/utils/stripeService';
import { colors } from './src/theme/colors';

/**
 * Lazy Stripe wrapper.
 * If `@stripe/stripe-react-native` isn't linked (Expo Go without a custom dev
 * client), we render children without StripeProvider — the rest of the app
 * still works, only the card payment screen gracefully degrades.
 */
function LazyStripeProvider({ children }) {
  const sdk = getStripeSDK();
  if (!sdk?.StripeProvider) return children;
  const { StripeProvider } = sdk;
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      {children}
    </StripeProvider>
  );
}

function RootNavigator() {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <View style={styles.splash}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoEmoji}>🏛️</Text>
        </View>
        <Text style={styles.brand}>EventSpace</Text>
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
      </View>
    );
  }

  if (!user) return <AuthNavigator />;
  if (user.role === 'annonceur') return <AnnonceurNavigator />;
  return <ClientNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <LazyStripeProvider>
          <AppProvider>
            <ToastProvider>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </ToastProvider>
          </AppProvider>
        </LazyStripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: 12,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  logoEmoji: { fontSize: 44 },
  brand: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.dark,
    letterSpacing: -0.5,
    marginTop: 8,
  },
});
