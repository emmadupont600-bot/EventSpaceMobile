/**
 * stripeService.js — Service de paiement EventSpace
 *
 * Flow Stripe réel en mode TEST :
 * 1. Client paie → processPayment() appelle Edge Function stripe-create-payment
 *    → crée un vrai PaymentIntent Stripe avec capture_method: 'manual'
 *    → visible immédiatement dans le dashboard Stripe (mode test)
 * 2. Annonceur accepte → capturePayment() appelle Edge Function stripe-capture
 *    → argent réellement débité (en test)
 * 3. Annonceur refuse → refundPayment() appelle Edge Function stripe-refund
 *    → PaymentIntent annulé ou remboursé automatiquement
 */

import { supabase } from './supabase';

export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TSkDI1XxCdtSfY7N05oDTaJ2ASeVLF6k1bcJ4XQbKntUCJXJkU3oiitj0DXNoeREeajUMdTYVlORWH5SZIhxNyL00Fza4xqXZ';

/**
 * Crée un vrai PaymentIntent Stripe en mode test via Edge Function.
 * Le paiement apparaît immédiatement dans le dashboard Stripe (test mode).
 *
 * @returns {Promise<{ success: boolean, paymentIntentId?: string, clientSecret?: string, error?: string }>}
 */
export async function processPayment({ amount, reservationId, venueName }) {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-create-payment', {
      body: { amount, reservationId, venueName },
    });

    if (error) throw new Error(error.message);
    if (!data?.success) throw new Error(data?.error ?? 'Erreur Stripe inconnue');

    console.log('[Stripe] PaymentIntent créé:', data.paymentIntentId);
    return {
      success: true,
      paymentIntentId: data.paymentIntentId,
      clientSecret: data.clientSecret,
      amount,
      reservationId,
      venueName,
    };
  } catch (e) {
    console.error('[Stripe] processPayment error:', e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Capture un PaymentIntent (annonceur accepte → argent réellement débité).
 * @param {string} paymentIntentId
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function capturePayment(paymentIntentId) {
  if (!paymentIntentId) return { success: false, error: 'Pas de paymentIntentId' };

  try {
    const { data, error } = await supabase.functions.invoke('stripe-capture', {
      body: { paymentIntentId },
    });

    if (error) throw new Error(error.message);
    if (!data?.success) throw new Error(data?.error ?? 'Erreur capture Stripe');

    console.log('[Stripe] Capture réussie:', paymentIntentId, '→', data.status);
    return { success: true, paymentIntentId };
  } catch (e) {
    console.error('[Stripe] capturePayment error:', e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Rembourse / annule un PaymentIntent (annonceur refuse → remboursement automatique).
 * @param {string} paymentIntentId
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function refundPayment(paymentIntentId) {
  if (!paymentIntentId) return { success: false, error: 'Pas de paymentIntentId' };

  try {
    const { data, error } = await supabase.functions.invoke('stripe-refund', {
      body: { paymentIntentId },
    });

    if (error) throw new Error(error.message);
    if (!data?.success) throw new Error(data?.error ?? 'Erreur remboursement Stripe');

    console.log('[Stripe] Remboursement/annulation réussi:', paymentIntentId, '→', data.type, data.status);
    return { success: true, paymentIntentId };
  } catch (e) {
    console.error('[Stripe] refundPayment error:', e.message);
    return { success: false, error: e.message };
  }
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
  return { hours, subtotal, total: subtotal };
}
