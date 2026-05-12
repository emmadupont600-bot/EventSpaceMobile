/**
 * stripeService.js — Service de paiement EventSpace
 *
 * Flow correct (Stripe Connect à capture manuelle) :
 * 1. Client paie → processPayment() crée un PaymentIntent avec capture_method: 'manual'
 *    L'argent est AUTORISÉ (bloqué sur la carte) mais pas encore prélevé.
 * 2. Annonceur accepte → capturePayment() capture le PaymentIntent → argent débité.
 * 3. Annonceur refuse → refundPayment() annule le PaymentIntent → remboursement auto.
 *
 * En production :
 * - Supabase Edge Function crée le PaymentIntent avec capture_method: 'manual' et application_fee_amount
 * - capturePayment() appelle POST /capture sur l’Edge Function
 * - refundPayment() appelle POST /cancel ou POST /refund sur l’Edge Function
 */

export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TSkDI1XxCdtSfY7N05oDTaJ2ASeVLF6k1bcJ4XQbKntUCJXJkU3oiitj0DXNoeREeajUMdTYVlORWH5SZIhxNyL00Fza4xqXZ';

/**
 * Simule un paiement Stripe avec capture manuelle (mode test).
 * En production : utilise @stripe/stripe-react-native + Edge Function.
 *
 * @returns {Promise<{ success: boolean, paymentIntentId?: string, error?: string }>}
 */
export async function processPayment({ amount, reservationId, venueName }) {
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
  const paymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return { success: true, paymentIntentId, amount, reservationId, venueName };
}

/**
 * Capture un PaymentIntent (annonceur accepte → argent réellement débité).
 * @param {string} paymentIntentId
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function capturePayment(paymentIntentId) {
  if (!paymentIntentId) return { success: false, error: 'Pas de paymentIntentId' };
  // Simule latence réseau
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
  console.log('[Stripe] capturePayment:', paymentIntentId);
  // En production : appeler l’Edge Function Supabase
  // const { data, error } = await supabase.functions.invoke('stripe-capture', { body: { paymentIntentId } });
  return { success: true, paymentIntentId };
}

/**
 * Rembourse / annule un PaymentIntent (annonceur refuse → remboursement automatique).
 * @param {string} paymentIntentId
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function refundPayment(paymentIntentId) {
  if (!paymentIntentId) return { success: false, error: 'Pas de paymentIntentId' };
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
  console.log('[Stripe] refundPayment:', paymentIntentId);
  // En production : appeler l’Edge Function Supabase
  // const { data, error } = await supabase.functions.invoke('stripe-refund', { body: { paymentIntentId } });
  return { success: true, paymentIntentId };
}

/**
 * Calcule la commission EventSpace (15%) et le net versé à l'annonceur.
 */
export function calcCommission(totalEuros) {
  const commission = Math.round(totalEuros * 0.15 * 100) / 100;
  const net = Math.round((totalEuros - commission) * 100) / 100;
  return { total: totalEuros, commission, net };
}

export const calculateFees = calcCommission;

/**
 * Calcul des prix avec durée.
 */
export function computePricing({ pricePerHour, startTime, endTime, commission = 0.15 }) {
  const toMinutes = t => {
    const [h, m] = (t || '00:00').split(':').map(Number);
    return h * 60 + (m || 0);
  };
  const diffMin = toMinutes(endTime) - toMinutes(startTime);
  const hours = Math.max(diffMin / 60, 0);
  const subtotal = Math.round(pricePerHour * hours * 100) / 100;
  const total = subtotal;
  return { hours, subtotal, total };
}
