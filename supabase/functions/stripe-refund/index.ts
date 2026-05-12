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

    // Si le PI est en requires_capture → on l'annule (pas de débit = pas de remboursement nécessaire)
    // Si déjà capturé → on crée un refund
    const cancelRes = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const cancelData = await cancelRes.json();

    // Si déjà capturé, on fait un vrai remboursement
    if (!cancelRes.ok && cancelData.error?.code === 'payment_intent_unexpected_state') {
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

    if (!cancelRes.ok) {
      return new Response(JSON.stringify({ error: cancelData.error?.message ?? 'Erreur annulation Stripe' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, type: 'cancel', status: cancelData.status }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
