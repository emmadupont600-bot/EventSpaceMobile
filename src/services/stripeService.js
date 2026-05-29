/**
 * stripeService.js — Service de paiement EventSpace (unique point d'entrée)
 *
 * Flow Stripe en mode TEST :
 * 1. createPaymentIntent / processPayment → Edge Function → PaymentIntent (capture manuelle)
 * 2. capturePayment → annonceur accepte → argent débité
 * 3. refundPayment → annonceur/client annule → remboursement
 *
 * CONVENTION MONTANTS :
 *   - createPaymentIntent attend des CENTIMES (venue.price en Supabase)
 *   - processPayment attend des EUROS et convertit en centimes
 */
import { supabase } from './supabase';
import { COMMISSION_RATE, STRIPE_PUBLISHABLE_KEY } from '../constants/app';

export { STRIPE_PUBLISHABLE_KEY, COMMISSION_RATE };

/**
 * Crée un PaymentIntent via l'Edge Function create-payment-intent.
 * @param {number} amount - Montant en CENTIMES
 */
export async function createPaymentIntent(amount, reservationId, currency = 'eur') {
  const amountInCents = Math.round(amount);

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

export async function updateReservationPaymentStatus(reservationId, paymentIntentId, status) {
  const updatePayload = {
    payment_status: status,
    payment_intent_id: paymentIntentId,
  };

  if (status === 'paid') {
    updatePayload.paid_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('reservations')
    .update(updatePayload)
    .eq('id', reservationId);

  if (error) throw new Error(error.message);
}

/**
 * Crée un PaymentIntent via stripe-create-payment (montant en euros).
 */
export async function processPayment({ amount, reservationId, venueName }) {
  try {
    const amountEuros = parseFloat(amount);
    if (!amountEuros || isNaN(amountEuros) || amountEuros <= 0) {
      return { success: false, error: 'Montant invalide' };
    }

    const amountCents = Math.round(amountEuros * 100);

    const { data, error } = await supabase.functions.invoke('stripe-create-payment', {
      body: { amount: amountCents, reservationId, venueName },
    });

    if (error) throw new Error(error.message);
    if (!data?.success) throw new Error(data?.error ?? 'Erreur Stripe inconnue');

    return {
      success: true,
      paymentIntentId: data.paymentIntentId,
      clientSecret: data.clientSecret,
      amount: amountEuros,
      reservationId,
      venueName,
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function capturePayment(paymentIntentId) {
  if (!paymentIntentId) return { success: false, error: 'Pas de paymentIntentId' };

  try {
    const { data, error } = await supabase.functions.invoke('stripe-capture', {
      body: { paymentIntentId },
    });

    if (error) throw new Error(error.message);
    if (!data?.success) throw new Error(data?.error ?? 'Erreur capture Stripe');

    return { success: true, paymentIntentId };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function refundPayment(paymentIntentId) {
  if (!paymentIntentId) return { success: false, error: 'Pas de paymentIntentId' };

  try {
    const { data, error } = await supabase.functions.invoke('stripe-refund', {
      body: { paymentIntentId },
    });

    if (error) throw new Error(error.message);
    if (!data?.success) throw new Error(data?.error ?? 'Erreur remboursement Stripe');

    return { success: true, paymentIntentId };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function calcCommission(totalEuros) {
  const total = parseFloat(totalEuros) || 0;
  const commission = Math.round(total * COMMISSION_RATE * 100) / 100;
  const net = Math.round((total - commission) * 100) / 100;
  return { total, commission, net };
}

export const calculateFees = calcCommission;

export function computePricing({ pricePerHour, startTime, endTime }) {
  const toMinutes = t => {
    const [h, m] = (t || '00:00').split(':').map(Number);
    return h * 60 + (m || 0);
  };
  const diffMin = toMinutes(endTime) - toMinutes(startTime);
  const hours = Math.max(diffMin / 60, 0);
  const subtotal = Math.round((parseFloat(pricePerHour) || 0) * hours * 100) / 100;
  return { hours, subtotal, total: subtotal };
}
