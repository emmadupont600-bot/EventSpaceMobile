/**
 * AcceptReservationPaymentTrigger.js
 * Utilitaire côté annonceur : quand il accepte une réservation,
 * on met à jour le statut Supabase pour débloquer le paiement côté client.
 *
 * Appelé depuis l'écran annonceur (ex: ReservationsOwnerScreen) :
 *   import { acceptAndTriggerPayment } from './AcceptReservationPaymentTrigger';
 *   await acceptAndTriggerPayment(reservationId);
 */
import { supabase } from '../../utils/supabase';

/**
 * Passe la réservation en statut 'accepted'
 * → le client verra un bouton "Payer" dans son app
 */
export async function acceptAndTriggerPayment(reservationId) {
  const { error } = await supabase
    .from('reservations')
    .update({
      status: 'accepted',
      payment_status: 'pending_payment',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', reservationId);

  if (error) throw new Error(error.message);
  return true;
}

/**
 * Refuse la réservation
 */
export async function refuseReservation(reservationId, reason = '') {
  const { error } = await supabase
    .from('reservations')
    .update({
      status: 'refused',
      refusal_reason: reason,
      refused_at: new Date().toISOString(),
    })
    .eq('id', reservationId);

  if (error) throw new Error(error.message);
  return true;
}
