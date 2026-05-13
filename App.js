import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import ClientNavigator from './src/navigation/ClientNavigator';
import AnnonceurNavigator from './src/navigation/AnnonceurNavigator';
import { STRIPE_PUBLISHABLE_KEY } from './src/utils/stripeService';

// FIX: attend que loading soit false avant d'afficher un navigator
function RootNavigator() {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#01696f" />
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
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <AppProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AppProvider>
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f6f2',
  },
});
