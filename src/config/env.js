/**
 * env.js — point d'accès unique aux variables d'environnement publiques.
 *
 * Source de vérité : `.env` (gitignoré) → app.config.js (expo.extra)
 * → expo-constants. Les variables EXPO_PUBLIC_* inline de Metro servent
 * de repli (utile pour les tests et le web).
 */
import Constants from 'expo-constants';

const extra =
  Constants?.expoConfig?.extra ??
  Constants?.manifest2?.extra ??
  {};

export const SUPABASE_URL =
  extra.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';

export const SUPABASE_ANON_KEY =
  extra.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const STRIPE_PUBLISHABLE_KEY =
  extra.stripePublishableKey || process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

if (typeof __DEV__ !== 'undefined' && __DEV__ && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
  console.warn(
    '[env] SUPABASE_URL / SUPABASE_ANON_KEY manquants. ' +
    'Copiez .env.example vers .env et renseignez vos clés.'
  );
}
