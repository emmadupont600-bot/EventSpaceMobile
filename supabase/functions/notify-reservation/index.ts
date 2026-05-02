/**
 * Edge Function : notify-reservation
 * Déclenchée par un Database Webhook sur la table `reservations`
 * quand le champ `status` change (accepted / refused / pending).
 *
 * Déploiement :
 *   supabase functions deploy notify-reservation --no-verify-jwt
 *
 * Webhook à configurer dans Supabase Dashboard :
 *   Table : reservations
 *   Events : UPDATE
 *   URL : https://<project-ref>.supabase.co/functions/v1/notify-reservation
 *   HTTP headers : Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

serve(async (req) => {
  try {
    const body = await req.json();

    // Supabase Webhook payload : { type, table, record, old_record }
    const { record, old_record } = body;

    // On ne traite que les vrais changements de status
    if (!record || record.status === old_record?.status) {
      return new Response('no change', { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const status     = record.status;       // 'accepted' | 'refused' | 'pending'
    const venueName  = record.venue_name || 'votre lieu';
    const clientId   = record.user_id;
    const ownerId    = record.owner_id;
    const reservId   = record.id;

    // ─── Message selon le status ──────────────────────────────────────
    type NotifPayload = { userId: string; title: string; body: string; data: Record<string, unknown> } | null;

    let notifClient: NotifPayload = null;
    let notifOwner:  NotifPayload = null;

    if (status === 'accepted') {
      notifClient = {
        userId: clientId,
        title:  '✅ Réservation acceptée !',
        body:   `"${venueName}" a accepté votre demande. Payez maintenant pour confirmer.`,
        data:   { screen: 'Reservations', reservationId: reservId, action: 'pay' },
      };
    } else if (status === 'refused') {
      notifClient = {
        userId: clientId,
        title:  '❌ Demande refusée',
        body:   `"${venueName}" n'est pas disponible pour cette date.`,
        data:   { screen: 'Reservations', reservationId: reservId },
      };
    } else if (status === 'pending') {
      // Nouvelle réservation → notifier l'annonceur
      notifOwner = {
        userId: ownerId,
        title:  '📬 Nouvelle demande de réservation !',
        body:   `${record.user_name || 'Un client'} souhaite réserver "${venueName}" le ${record.date}.`,
        data:   { screen: 'OwnerReservations', reservationId: reservId },
      };
    } else if (status === 'confirmed') {
      notifOwner = {
        userId: ownerId,
        title:  '💳 Paiement reçu !',
        body:   `La réservation de "${venueName}" est confirmée. Paiement encaissé.`,
        data:   { screen: 'OwnerReservations', reservationId: reservId },
      };
    }

    // ─── Envoi des notifications ───────────────────────────────────────
    const toSend = [notifClient, notifOwner].filter(Boolean) as NonNullable<NotifPayload>[];

    for (const notif of toSend) {
      // Récupère le token Expo de l'utilisateur ciblé
      const { data: userRow } = await supabase
        .from('users')
        .select('expo_push_token')
        .eq('id', notif.userId)
        .maybeSingle();

      const token = userRow?.expo_push_token;
      if (!token) continue;

      // Envoi via l'API Expo Push
      const res = await fetch(EXPO_PUSH_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          to:    token,
          title: notif.title,
          body:  notif.body,
          data:  notif.data,
          sound: 'default',
          priority: 'high',
          channelId: 'reservations',
        }),
      });

      const result = await res.json();
      console.log('[notify-reservation] Expo response:', JSON.stringify(result));
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[notify-reservation] error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
