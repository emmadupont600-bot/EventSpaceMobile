/**
 * app.config.js — configuration Expo dynamique.
 *
 * Les clés publiques (Supabase, Stripe) sont injectées depuis le fichier
 * `.env` (ignoré par git, voir `.env.example`) vers `expo.extra`, puis lues
 * dans l'app via expo-constants (src/config/env.js).
 *
 * Expo CLI charge automatiquement les fichiers .env (SDK 49+).
 */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  },
});
