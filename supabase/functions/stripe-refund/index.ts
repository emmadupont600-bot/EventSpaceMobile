// Edge Function : annule/rembourse un PaymentIntent (annonceur refuse → remboursement auto)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return new Response(JSON.stringify({ error: 'paymentIntentId manquant' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // Étape 1 : récupérer le statut actuel du PI
    const piRes = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
    });
    const piData = await piRes.json();

    if (!piRes.ok) {
      return new Response(JSON.stringify({ error: piData.error?.message ?? 'PI introuvable' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // Étape 2 : selon le statut, on annule ou on rembourse
    const piStatus = piData.status;

    // requires_capture → argent réservé mais pas débité → simple annulation
    if (piStatus === 'requires_capture' || piStatus === 'requires_payment_method' || piStatus === 'requires_confirmation' || piStatus === 'requires_action') {
      const cancelRes = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const cancelData = await cancelRes.json();
      if (!cancelRes.ok) {
        return new Response(JSON.stringify({ error: cancelData.error?.message ?? 'Erreur annulation Stripe' }), {
          status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
        });
      }
      return new Response(
        JSON.stringify({ success: true, type: 'cancel', status: cancelData.status }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    // succeeded → déjà débité → remboursement
    if (piStatus === 'succeeded') {
      const refundRes = await fetch('https://api.stripe.com/v1/refunds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ payment_intent: paymentIntentId }),
      });
      const refundData = await refundRes.json();
      if (!refundRes.ok) {
        return new Response(JSON.stringify({ error: refundData.error?.message }), {
          status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
        });
      }
      return new Response(
        JSON.stringify({ success: true, type: 'refund', status: refundData.status }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    // Cas déjà annulé ou état inattendu
    return new Response(
      JSON.stringify({ success: true, type: 'noop', status: piStatus }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
