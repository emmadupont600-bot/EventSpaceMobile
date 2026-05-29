import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import ClientNavigator from './src/navigation/ClientNavigator';
import AnnonceurNavigator from './src/navigation/AnnonceurNavigator';
import { STRIPE_PUBLISHABLE_KEY } from './src/constants/app';

function RootNavigator() {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <View style={styles.splash}>
        <Image source={require('./assets/icon.png')} style={styles.logo} />
        <Text style={styles.brand}>Event<Text style={styles.brandAccent}>Space</Text></Text>
        <Text style={styles.tagline}>Trouvez le lieu parfait</Text>
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
    gap: 12,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    marginBottom: 8,
  },
  brand: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a2e',
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: '#01696f',
  },
  tagline: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});
