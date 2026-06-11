import React, { useRef, useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import getNavigatorForRole from './src/navigation/getNavigatorForRole';
import OnboardingScreen, { shouldShowOnboarding, markOnboardingComplete } from './src/screens/onboarding/OnboardingScreen';
import { STRIPE_PUBLISHABLE_KEY } from './src/constants/app';
import { linking, navigateFromNotification } from './src/navigation/linking';
import { useNotificationListener } from './src/utils/notifications';

function RootNavigator() {
  const { user, loading } = useApp();
  const { colors, isDark } = useTheme();
  const navigationRef = useRef(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (!user) { setCheckingOnboarding(false); return; }
    shouldShowOnboarding(user).then(show => {
      setShowOnboarding(show);
      setCheckingOnboarding(false);
    });
  }, [user?.id]);

  useNotificationListener(null, (response) => {
    const data = response?.notification?.request?.content?.data;
    navigateFromNotification(navigationRef.current, data, user);
  });

  if (loading || checkingOnboarding) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Image source={require('./assets/icon.png')} style={styles.logo} />
        <Text style={[styles.brand, { color: colors.dark }]}>
          Event<Text style={[styles.brandAccent, { color: colors.primary }]}>Space</Text>
        </Text>
        <Text style={[styles.tagline, { color: colors.mid }]}>Trouvez le lieu parfait</Text>
      </View>
    );
  }

  if (user && showOnboarding) {
    return (
      <OnboardingScreen onComplete={async () => {
        await markOnboardingComplete(user.id);
        setShowOnboarding(false);
      }} />
    );
  }

  const Navigator = getNavigatorForRole(user);

  return (
    <NavigationContainer ref={navigationRef} linking={user ? linking : undefined}>
      <Navigator />
    </NavigationContainer>
  );
}

function AppInner() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
            <AppProvider>
              <AppInner />
            </AppProvider>
          </StripeProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  logo: { width: 96, height: 96, borderRadius: 24, marginBottom: 8 },
  brand: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontSize: 32, letterSpacing: -0.5,
  },
  brandAccent: {},
  tagline: { fontSize: 14, fontWeight: '500' },
});
