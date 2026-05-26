/**
 * stripeService.js — Single Stripe entry point for EventSpace.
 *
 * Flow (TEST MODE):
 *   1. Client tap "Payer"      → createPaymentIntent()  → Edge Function
 *      `create-payment-intent` returns { clientSecret, paymentIntentId }.
 *      capture_method: 'manual'  ⇒ funds AUTHORIZED, not yet captured.
 *   2. Client confirms with Stripe SDK (CardField).
 *   3. Owner accepts            → capturePayment()      → Edge Function
 *      `stripe-capture`. Funds CAPTURED.
 *   4. Owner refuses            → refundPayment()       → Edge Function
 *      `stripe-refund`. Authorization cancelled / refunded.
 *
 * AMOUNT CONVENTION:
 *   - The app stores prices in EUROS (e.g. 600 = 600 €).
 *   - We convert to CENTS exactly once, here, before sending to Stripe.
 *   - The Edge Function passes the amount through unchanged.
 *
 * COMMISSION: 15 % platform fee, computed on the gross amount.
 */
import { supabase } from '../services/supabase';

export const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51TSkDI1XxCdtSfY7N05oDTaJ2ASeVLF6k1bcJ4XQbKntUCJXJkU3oiitj0DXNoeREeajUMdTYVlORWH5SZIhxNyL00Fza4xqXZ';

export const COMMISSION_RATE = 0.15;

// ─── Payment Intent ────────────────────────────────────────────────────────
/**
 * Creates a Stripe PaymentIntent via the `create-payment-intent` Edge Function.
 *
 * @param {number} amountEuros        Amount in EUROS (the function converts to cents).
 * @param {string} reservationId      Supabase reservation id (UUID or local id).
 * @param {string} [currency='eur']
 * @returns {Promise<{ clientSecret: string, paymentIntentId: string }>}
 */
export async function createPaymentIntent(amountEuros, reservationId, currency = 'eur') {
  const euros = parseFloat(amountEuros);
  if (!euros || isNaN(euros) || euros <= 0) {
    throw new Error('Montant invalide');
  }
  const amountCents = Math.round(euros * 100);

  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: {
      amount: amountCents,
      currency,
      reservation_id: String(reservationId ?? ''),
      metadata: {
        reservation_id: String(reservationId ?? ''),
        platform: 'eventspace_mobile',
      },
    },
  });

  if (error) throw new Error(error.message || 'Impossible de créer le paiement');
  if (!data?.clientSecret) {
    throw new Error(data?.error || 'Réponse invalide du serveur de paiement');
  }
  return {
    clientSecret: data.clientSecret,
    paymentIntentId: data.paymentIntentId,
  };
}

// ─── Capture / Refund ──────────────────────────────────────────────────────
export async function capturePayment(paymentIntentId) {
  if (!paymentIntentId) return { success: false, error: 'Pas de paymentIntentId' };
  try {
    const { data, error } = await supabase.functions.invoke('stripe-capture', {
      body: { paymentIntentId },
    });
    if (error) throw new Error(error.message);
    if (!data?.success) throw new Error(data?.error ?? 'Erreur capture Stripe');
    return { success: true, paymentIntentId, status: data.status };
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

// ─── Persist payment status ────────────────────────────────────────────────
export async function updateReservationPaymentStatus(reservationId, paymentIntentId, status) {
  const update = {
    payment_status: status,
    payment_intent_id: paymentIntentId,
  };
  if (status === 'paid') update.paid_at = new Date().toISOString();

  const { error } = await supabase
    .from('reservations')
    .update(update)
    .eq('id', reservationId);
  if (error) throw new Error(error.message);
}

// ─── Pricing helpers ───────────────────────────────────────────────────────
/**
 * Splits a gross amount into commission and net (for the owner).
 */
export function calcCommission(totalEuros) {
  const total = parseFloat(totalEuros) || 0;
  const commission = Math.round(total * COMMISSION_RATE * 100) / 100;
  const net = Math.round((total - commission) * 100) / 100;
  return { total, commission, net };
}

export const calculateFees = calcCommission;

/**
 * Computes price for a booking based on pricePerHour and a [start,end] window.
 */
export function computePricing({ pricePerHour, startTime, endTime, commission = COMMISSION_RATE }) {
  const toMinutes = t => {
    const [h, m] = (t || '00:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const diffMin = toMinutes(endTime) - toMinutes(startTime);
  const hours = Math.max(diffMin / 60, 0);
  const subtotal = Math.round((parseFloat(pricePerHour) || 0) * hours * 100) / 100;
  const commissionAmount = Math.round(subtotal * commission * 100) / 100;
  const net = Math.round((subtotal - commissionAmount) * 100) / 100;
  return { hours, subtotal, total: subtotal, commission: commissionAmount, net };
}

// ─── Lazy SDK loader ───────────────────────────────────────────────────────
/**
 * Returns the @stripe/stripe-react-native module if installed, otherwise null.
 * Lets us run / develop the rest of the app even when the native module
 * is not linked (e.g. Expo Go without a custom dev client).
 */
export function getStripeSDK() {
  try {
    return require('@stripe/stripe-react-native');
  } catch {
    return null;
  }
}
