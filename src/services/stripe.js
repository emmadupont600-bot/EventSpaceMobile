/**
 * stripe.js — Helpers Stripe Connect pour EventSpace
 *
 * SETUP :
 * 1. Crée un compte Stripe sur https://stripe.com
 * 2. Active Stripe Connect (Marketplace) dans le dashboard
 * 3. Récupère ta clé publique dans Settings > API keys
 * 4. Dans ton backend (ex: Supabase Edge Function), utilise stripe-node
 *    avec application_fee_amount pour prélever ta commission automatiquement
 *
 * COMMISSION : 15% prélevée sur chaque paiement client
 *   → application_fee_amount = Math.round(amount * 0.15)
 */

export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TSkDI1XxCdtSfY7N05oDTaJ2ASeVLF6k1bcJ4XQbKntUCJXJkU3oiitj0DXNoeREeajUMdTYVlORWH5SZIhxNyL00Fza4xqXZ';

/**
 * Calcule la commission EventSpace (15%)
 * @param {number} totalEuros - Montant total en euros
 * @returns {{ total: number, commission: number, net: number }}
 */
export function calculateFees(totalEuros) {
  const commission = Math.round(totalEuros * 0.15 * 100) / 100;
  const net = Math.round((totalEuros - commission) * 100) / 100;
  return { total: totalEuros, commission, net };
}
