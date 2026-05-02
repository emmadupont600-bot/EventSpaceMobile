/**
 * stripeService.js
 * Flow Stripe avec Expo + @stripe/stripe-react-native
 *
 * Architecture :
 * 1. Le client appelle createPaymentIntent() → Supabase Edge Function (ou endpoint)
 * 2. L'Edge Function crée le PaymentIntent côté Stripe (server-side)
 * 3. On récupère le clientSecret et on lance le PaymentSheet natif
 *
 * Pour la démo : on simule le PaymentIntent localement (sans vrai backend Stripe)
 * → Remplace STRIPE_PUBLISHABLE_KEY et le fetch() par ton vrai endpoint en prod
 */
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export const STRIPE_PUBLISHABLE_KEY = 'pk_test_REMPLACE_PAR_TA_CLE_STRIPE';

/**
 * Simule un paiement complet pour la démo.
 * En production, remplacer par un vrai appel à ton Edge Function Stripe.
 *
 * @param {object} params
 * @param {number} params.amount  - Montant en euros (ex: 4250)
 * @param {string} params.reservationId
 * @param {string} params.venueName
 * @returns {Promise<{success: boolean, paymentIntentId?: string, error?: string}>}
 */
export async function processPayment({ amount, reservationId, venueName }) {
  try {
    // ── DÉMO : simule un délai réseau + succès ──────────────────────
    // En production, décommente le bloc ci-dessous et supprime ce bloc démo
    await new Promise(r => setTimeout(r, 1500));
    const fakePaymentIntentId = `pi_demo_${Date.now()}`;
    return { success: true, paymentIntentId: fakePaymentIntentId };

    // ── PRODUCTION : appel Edge Function Stripe ─────────────────────
    // const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    //   body: { amount: Math.round(amount * 100), currency: 'eur', reservationId, venueName },
    // });
    // if (error || !data?.clientSecret) throw new Error(error?.message || 'Échec création PaymentIntent');
    // return { success: true, clientSecret: data.clientSecret };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Calcule le détail financier d'une réservation.
 */
export function computePricing({ pricePerHour, startTime, endTime, commission = 0.12 }) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const hours = Math.max(1, (eh * 60 + em - (sh * 60 + sm)) / 60);
  const subtotal = Math.round(pricePerHour * hours);
  const commissionAmount = Math.round(subtotal * commission);
  const total = subtotal; // Le client paie le prix brut
  const netForOwner = subtotal - commissionAmount;
  return { hours, subtotal, commissionAmount, total, netForOwner };
}
