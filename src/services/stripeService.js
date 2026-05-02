/**
 * stripeService.js
 * Flow Stripe avec Expo + @stripe/stripe-react-native
 *
 * Architecture :
 * 1. Le client appelle processPayment() → Supabase Edge Function 'create-payment-intent'
 * 2. L'Edge Function crée le PaymentIntent côté Stripe (server-side)
 * 3. On récupère le clientSecret + paymentIntentId
 *
 * Clés Stripe test :
 *   pk_test_51TSkDI1... (publishable — safe côté client)
 *   sk_test_...         (secret — stockée UNIQUEMENT dans le secret Supabase STRIPE_SECRET_KEY)
 *
 * Cartes de test :
 *   4242 4242 4242 4242 → paiement accepté
 *   4000 0000 0000 9995 → carte refusée
 *   4000 0025 0000 3155 → 3D Secure requis
 */
import { supabase } from '../lib/supabase';

export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TSkDI1XxCdtSfY7N05oDTaJ2ASeVLF6k1bcJ4XQbKntUCJXJkU3oiitj0DXNoeREeajUMdTYVlORWH5SZIhxNyL00Fza4xqXZ';

/**
 * Crée un PaymentIntent via la Supabase Edge Function.
 *
 * @param {object} params
 * @param {number} params.amount         - Montant en euros (ex: 42.50)
 * @param {string|number} params.reservationId
 * @param {string} params.venueName
 * @returns {Promise<{success: boolean, clientSecret?: string, paymentIntentId?: string, error?: string}>}
 */
export async function processPayment({ amount, reservationId, venueName }) {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount,          // en euros — l'Edge Function convertit en centimes
        currency: 'eur',
        reservationId: String(reservationId ?? ''),
        venueName: String(venueName ?? ''),
      },
    });

    if (error) throw new Error(error.message);
    if (!data?.clientSecret) throw new Error('Pas de clientSecret retourné par Stripe');

    return {
      success: true,
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
    };
  } catch (e) {
    console.error('[processPayment]', e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Calcule le détail financier d'une réservation.
 * commission = 12% prélevée sur le subtotal (payé par l'annonceur)
 */
export function computePricing({ pricePerHour, startTime, endTime, commission = 0.12 }) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const hours = Math.max(1, (eh * 60 + em - (sh * 60 + sm)) / 60);
  const subtotal = Math.round(pricePerHour * hours);
  const commissionAmount = Math.round(subtotal * commission);
  const total = subtotal;            // Le client paie le prix brut
  const netForOwner = subtotal - commissionAmount;  // L'annonceur reçoit ça
  return { hours, subtotal, commissionAmount, total, netForOwner };
}
