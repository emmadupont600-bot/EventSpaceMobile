/**
 * Edge Function Supabase : create-payment-intent
 * Crée un PaymentIntent Stripe en mode TEST avec capture manuelle
 * (l'argent est réservé mais PAS débité tant que l'annonceur n'accepte pas)
 *
 * Deploy: supabase functions deploy create-payment-intent
 *
 * Variables d'environnement à configurer dans Supabase Dashboard :
 *   STRIPE_SECRET_KEY = sk_test_51XXXXXXXX...
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, currency = 'eur', reservation_id, metadata = {} } = await req.json();

    if (!amount || amount < 50) {
      return new Response(
        JSON.stringify({ error: 'Montant invalide (minimum 0.50€)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,                    // en centimes
      currency,
      // FIX: capture_method manual → argent réservé mais débité seulement quand
      // l'annonceur accepte (via stripe-capture) ou annulé si refus (via stripe-refund)
      capture_method: 'manual',
      automatic_payment_methods: { enabled: true },
      metadata: {
        ...metadata,
        reservation_id: reservation_id ?? '',
      },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Stripe error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
