/**
 * Edge Function : notify-reservation
 * Aligné sur les statuts app : pending / confirmed / cancelled
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

serve(async (req) => {
  try {
    const body = await req.json();
    const { record, old_record } = body;

    if (!record || record.status === old_record?.status) {
      return new Response('no change', { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const status = record.status;
    const venueName = record.venue_name || 'votre lieu';
    const clientId = record.user_id;
    const ownerId = record.owner_id;
    const reservId = record.id;

    type NotifPayload = { userId: string; title: string; body: string; data: Record<string, unknown> } | null;

    let notifClient: NotifPayload = null;
    let notifOwner: NotifPayload = null;

    if (status === 'confirmed') {
      notifClient = {
        userId: clientId,
        title: '✅ Réservation confirmée !',
        body: `"${venueName}" a accepté votre demande.`,
        data: { screen: 'Reservations', reservationId: String(reservId) },
      };
      notifOwner = {
        userId: ownerId,
        title: '💳 Paiement reçu !',
        body: `La réservation "${venueName}" est confirmée.`,
        data: { screen: 'Dashboard', reservationId: String(reservId), tab: 'history' },
      };
    } else if (status === 'cancelled') {
      notifClient = {
        userId: clientId,
        title: '❌ Réservation annulée',
        body: `"${venueName}" — votre demande a été annulée ou refusée.`,
        data: { screen: 'Reservations', reservationId: String(reservId) },
      };
    } else if (status === 'pending') {
      notifOwner = {
        userId: ownerId,
        title: '📬 Nouvelle demande !',
        body: `${record.user_name || 'Un client'} souhaite réserver "${venueName}" le ${record.date}.`,
        data: { screen: 'Dashboard', reservationId: String(reservId), tab: 'requests' },
      };
    }

    const toSend = [notifClient, notifOwner].filter(Boolean) as NonNullable<NotifPayload>[];

    for (const notif of toSend) {
      if (!notif.userId) continue;
      const { data: userRow } = await supabase
        .from('users')
        .select('expo_push_token')
        .eq('id', notif.userId)
        .maybeSingle();

      const token = userRow?.expo_push_token;
      if (!token) continue;

      await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          to: token,
          title: notif.title,
          body: notif.body,
          data: notif.data,
          sound: 'default',
          priority: 'high',
          channelId: 'reservations',
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
