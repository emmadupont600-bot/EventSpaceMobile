/**
 * stripeService.js
 * Service Stripe côté client — mode TEST
 * Crée un PaymentIntent via l'Edge Function Supabase
 * puis confirme le paiement avec @stripe/stripe-react-native
 */
import { supabase } from './supabase';

// Clé publique Stripe TEST
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TSkDI1XxCdtSfY7N05oDTaJ2ASeVLF6k1bcJ4XQbKntUCJXJkU3oiitj0DXNoeREeajUMdTYVlORWH5SZIhxNyL00Fza4xqXZ';

/**
 * Crée un PaymentIntent côté serveur (Edge Function Supabase)
 * et retourne le clientSecret
 * @param {number} amount - Montant en euros (ex: 150)
 * @param {string} reservationId - ID de la réservation dans Supabase
 * @param {string} currency - Devise (défaut: 'eur')
 * @returns {Promise<{clientSecret: string, paymentIntentId: string}>}
 */
export async function createPaymentIntent(amount, reservationId, currency = 'eur') {
  const amountInCents = Math.round(amount * 100);

  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: {
      amount: amountInCents,
      currency,
      reservation_id: reservationId,
      metadata: {
        reservation_id: reservationId,
        platform: 'eventspace_mobile',
      },
    },
  });

  if (error) throw new Error(error.message || 'Impossible de créer le paiement');
  if (!data?.clientSecret) throw new Error('Réponse invalide du serveur de paiement');

  return {
    clientSecret: data.clientSecret,
    paymentIntentId: data.paymentIntentId,
  };
}

/**
 * Met à jour le statut de paiement dans Supabase
 * après confirmation côté Stripe
 */
export async function updateReservationPaymentStatus(reservationId, paymentIntentId, status) {
  const { error } = await supabase
    .from('reservations')
    .update({
      payment_status: status,
      payment_intent_id: paymentIntentId,
      paid_at: status === 'paid' ? new Date().toISOString() : null,
    })
    .eq('id', reservationId);

  if (error) throw new Error(error.message);
}
