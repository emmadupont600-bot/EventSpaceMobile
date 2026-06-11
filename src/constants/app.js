/** Constantes partagées de l'application EventSpace */

export const COMMISSION_RATE = 0.12;

/**
 * Clé publique Stripe — chargée depuis .env via expo-constants.
 * Ré-exportée ici pour compatibilité avec les imports existants.
 */
export { STRIPE_PUBLISHABLE_KEY } from '../config/env';

export const VENUES_CACHE_TTL_MS = 30_000;
