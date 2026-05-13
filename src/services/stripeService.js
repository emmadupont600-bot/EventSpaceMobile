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
 *
 * ⚠️  CONVENTION MONTANTS :
 *   - Ce fichier envoie TOUJOURS des centimes à l'Edge Function stripe-create-payment.
 *   - L'Edge Function stripe-create-payment passe l'amount DIRECTEMENT à Stripe
 *     (elle ne refait PAS ×100).
 *   - Donc : si le prix est 150 €  →  on envoie 15000 (centimes).
 *
 * ⚠️  NE PAS CONFONDRE avec src/utils/stripeService.js (utilisé par PaymentScreen)
 *   qui lui appelle l'Edge Function create-payment-intent — même logique centimes.
 */

import { supabase } from './supabase';

export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TSkDI1XxCdtSfY7N05oDTaJ2ASeVLF6k1bcJ4XQbKntUCJXJkU3oiitj0DXNoeREeajUMdTYVlORWH5SZIhxNyL00Fza4xqXZ';

/**
 * Crée un vrai PaymentIntent Stripe en mode test via Edge Function.
 * Le paiement apparaît immédiatement dans le dashboard Stripe (test mode).
 *
 * @param {number} amount - Montant EN EUROS (ex: 150 pour 150 €)
 * @returns {Promise<{ success: boolean, paymentIntentId?: string, clientSecret?: string, error?: string }>}
 */
export async function processPayment({ amount, reservationId, venueName }) {
  try {
    // Validation : amount doit être un nombre positif en euros
    const amountEuros = parseFloat(amount);
    if (!amountEuros || isNaN(amountEuros) || amountEuros <= 0) {
      return { success: false, error: 'Montant invalide' };
    }

    // Conversion en centimes — l'Edge Function stripe-create-payment attend des centimes
    // et les passe DIRECTEMENT à Stripe sans retraitement.
    const amountCents = Math.round(amountEuros * 100);

    const { data, error } = await supabase.functions.invoke('stripe-create-payment', {
      body: { amount: amountCents, reservationId, venueName },
    });

    if (error) throw new Error(error.message);
    if (!data?.success) throw new Error(data?.error ?? 'Erreur Stripe inconnue');

    console.log('[Stripe] PaymentIntent créé:', data.paymentIntentId, `(${amountEuros} € = ${amountCents} centimes)`);
    return {
      success: true,
      paymentIntentId: data.paymentIntentId,
      clientSecret: data.clientSecret,
      amount: amountEuros,
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
 * @param {number} totalEuros - Montant total en euros
 */
export function calcCommission(totalEuros) {
  const total = parseFloat(totalEuros) || 0;
  const commission = Math.round(total * 0.15 * 100) / 100;
  const net = Math.round((total - commission) * 100) / 100;
  return { total, commission, net };
}

export const calculateFees = calcCommission;

/**
 * Calcul des prix avec durée.
 * @param {object} params
 * @param {number} params.pricePerHour - Prix par heure en euros
 * @param {string} params.startTime    - Heure début "HH:MM"
 * @param {string} params.endTime      - Heure fin "HH:MM"
 * @param {number} [params.commission] - Taux commission (défaut 0.15)
 */
export function computePricing({ pricePerHour, startTime, endTime, commission = 0.15 }) {
  const toMinutes = t => {
    const [h, m] = (t || '00:00').split(':').map(Number);
    return h * 60 + (m || 0);
  };
  const diffMin = toMinutes(endTime) - toMinutes(startTime);
  const hours = Math.max(diffMin / 60, 0);
  const subtotal = Math.round((parseFloat(pricePerHour) || 0) * hours * 100) / 100;
  return { hours, subtotal, total: subtotal };
}
