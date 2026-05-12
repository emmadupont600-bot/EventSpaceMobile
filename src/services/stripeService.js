/**
 * stripeService.js
 * Flow Stripe avec Expo + @stripe/stripe-react-native
 *
 * Cartes de test :
 *   4242 4242 4242 4242 → paiement accepté
 *   4000 0000 0000 9995 → carte refusée
 *   4000 0025 0000 3155 → 3D Secure requis
 */
import { supabase } from './supabase';

export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TSkDI1XxCdtSfY7N05oDTaJ2ASeVLF6k1bcJ4XQbKntUCJXJkU3oiitj0DXNoeREeajUMdTYVlORWH5SZIhxNyL00Fza4xqXZ';

/**
 * Mode TEST : simule un paiement réussi sans appel Stripe réel.
 * Met à jour payment_status = 'paid' dans Supabase après succès.
 * Pour passer en production, mettre DEMO_MODE = false et déployer
 * la Edge Function 'create-payment-intent'.
 */
const DEMO_MODE = true;

export async function processPayment({ amount, reservationId, venueName }) {
  // Mode test : simule latence réseau
  if (DEMO_MODE) {
    await new Promise(r => setTimeout(r, 1200));

    const paymentIntentId = `demo_pi_${Date.now()}`;

    // Mise à jour Supabase : payment_status = 'paid'
    if (reservationId) {
      await supabase
        .from('reservations')
        .update({
          payment_status: 'paid',
          payment_intent_id: paymentIntentId,
          paid_at: new Date().toISOString(),
        })
        .eq('id', reservationId);
    }

    return {
      success: true,
      clientSecret: `demo_cs_${Date.now()}`,
      paymentIntentId,
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount,
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
 * commission = 15% prélevée sur le subtotal (payée par l'annonceur)
 */
export function computePricing({ pricePerHour, startTime, endTime, commission = 0.15 }) {
  const [sh, sm] = (startTime || '10:00').split(':').map(Number);
  const [eh, em] = (endTime   || '11:00').split(':').map(Number);
  const hours = Math.max(1, (eh * 60 + em - (sh * 60 + sm)) / 60);
  const subtotal = Math.round((pricePerHour || 0) * hours);
  const commissionAmount = Math.round(subtotal * commission);
  const total = subtotal;
  const netForOwner = subtotal - commissionAmount;
  return { hours, subtotal, commissionAmount, total, netForOwner };
}
