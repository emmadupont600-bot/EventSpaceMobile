/**
 * stripeService.js — Service de paiement EventSpace
 *
 * Fusionne stripe.js (clé + calculateFees) et la simulation processPayment.
 *
 * En production :
 * - Utilise @stripe/stripe-react-native avec initPaymentSheet / presentPaymentSheet
 * - Ton backend (Supabase Edge Function) crée le PaymentIntent avec application_fee_amount
 * - application_fee_amount = Math.round(amount_cents * 0.15)  ← 15% commission EventSpace
 */

// Clé publique Stripe (mode test)
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TSkDI1XxCdtSfY7N05oDTaJ2ASeVLF6k1bcJ4XQbKntUCJXJkU3oiitj0DXNoeREeajUMdTYVlORWH5SZIhxNyL00Fza4xqXZ';

/**
 * Simule un paiement Stripe (mode test — toujours success).
 * Remplacer par stripe.confirmPayment() en production.
 *
 * @param {{ amount: number, reservationId: string, venueName: string }} params
 * @returns {Promise<{ success: boolean, paymentIntentId?: string, error?: string }>}
 */
export async function processPayment({ amount, reservationId, venueName }) {
  // Simule latence réseau 800ms – 1.5s
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

  const paymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    success: true,
    paymentIntentId,
    amount,
    reservationId,
    venueName,
  };
}

/**
 * Calcule la commission EventSpace (15%) et le net versé à l’annonceur.
 * @param {number} totalEuros
 * @returns {{ total: number, commission: number, net: number }}
 */
export function calcCommission(totalEuros) {
  const commission = Math.round(totalEuros * 0.15 * 100) / 100;
  const net = Math.round((totalEuros - commission) * 100) / 100;
  return { total: totalEuros, commission, net };
}

// Alias pour compatibilité avec stripe.js
export const calculateFees = calcCommission;
