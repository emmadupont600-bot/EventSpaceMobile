// Edge Function : crée un PaymentIntent Stripe en mode test (capture manuelle)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { amount, currency = 'eur', reservationId, venueName } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Montant invalide' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // ✅ FIX : amount est déjà en centimes (envoyé par stripeService.js via Math.round(euros * 100))
    // ❌ SUPPRIMÉ : const amountCents = Math.round(amount * 100) — causait une double conversion (×100×100 = ×10000)
    // Exemple : 450€ → stripeService envoie 45000 centimes → on passe 45000 directement à Stripe ✅
    const amountCents = Math.round(amount); // sécurité arrondi uniquement, PAS de ×100

    const body = new URLSearchParams({
      amount: String(amountCents),
      currency,
      capture_method: 'manual', // Autorisation seulement — capture quand annonceur accepte
      'metadata[reservationId]': reservationId ?? '',
      'metadata[venueName]': venueName ?? '',
    });

    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.error?.message ?? 'Erreur Stripe' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, paymentIntentId: data.id, clientSecret: data.client_secret }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
