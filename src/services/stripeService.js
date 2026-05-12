/**
 * stripeService.js — Mode test (simulation)
 * En production : remplacer processPayment() par un appel à ton
 * Supabase Edge Function ou backend Node qui crée un vrai PaymentIntent Stripe.
 */

/**
 * Simule un paiement Stripe (toujours success en mode test).
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
 * @param {number} total
 * @returns {{ commission: number, netOwner: number }}
 */
export function calcCommission(total) {
  const commission = Math.round(total * 0.15);
  return { commission, netOwner: total - commission };
}
