/**
 * stripe.js — Helpers Stripe Connect pour EventSpace
 *
 * SETUP :
 * 1. Crée un compte Stripe sur https://stripe.com
 * 2. Active Stripe Connect (Marketplace) dans le dashboard
 * 3. Récupère ta clé publique dans Settings > API keys
 * 4. Remplace STRIPE_PUBLISHABLE_KEY ci-dessous
 * 5. Dans ton backend (ex: Supabase Edge Function), utilise stripe-node
 *    avec application_fee_amount pour prélever ta commission automatiquement
 *
 * COMMISSION : 12% prélevée sur chaque paiement client
 *   → application_fee_amount = Math.round(amount * 0.12)
 */

export const STRIPE_PUBLISHABLE_KEY = 'pk_test_TON_STRIPE_KEY';

/**
 * Calcule la commission EventSpace (12%)
 * @param {number} totalEuros - Montant total en euros
 * @returns {{ total: number, commission: number, net: number }}
 */
export function calculateFees(totalEuros) {
  const commission = Math.round(totalEuros * 0.12 * 100) / 100;
  const net = Math.round((totalEuros - commission) * 100) / 100;
  return { total: totalEuros, commission, net };
}

/**
 * Exemple d'Edge Function Supabase pour créer un PaymentIntent
 * À déployer sur https://supabase.com/dashboard/project/XXX/functions
 *
 * import Stripe from 'https://esm.sh/stripe@14';
 * const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
 *
 * Deno.serve(async (req) => {
 *   const { amount, connectedAccountId } = await req.json();
 *   const paymentIntent = await stripe.paymentIntents.create({
 *     amount: amount * 100, // en centimes
 *     currency: 'eur',
 *     application_fee_amount: Math.round(amount * 0.12 * 100),
 *     transfer_data: { destination: connectedAccountId },
 *   });
 *   return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }));
 * });
 */
