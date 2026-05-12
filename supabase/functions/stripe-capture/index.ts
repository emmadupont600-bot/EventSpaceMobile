// Edge Function : capture un PaymentIntent (annonceur accepte → argent débité)
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

    const res = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.error?.message ?? 'Erreur capture Stripe' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, status: data.status }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
