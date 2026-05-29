/**
 * Edge Function : validate-promo-code
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { code } = await req.json();
    const normalized = (code || '').trim().toUpperCase();
    if (!normalized) {
      return new Response(JSON.stringify({ valid: false, error: 'Code invalide' }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', normalized)
      .eq('active', true)
      .maybeSingle();

    if (error || !data) {
      return new Response(JSON.stringify({ valid: false, error: 'Code introuvable' }), { status: 404 });
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return new Response(JSON.stringify({ valid: false, error: 'Code expiré' }), { status: 410 });
    }
    if (data.max_uses && data.use_count >= data.max_uses) {
      return new Response(JSON.stringify({ valid: false, error: 'Code épuisé' }), { status: 410 });
    }

    return new Response(JSON.stringify({
      valid: true,
      code: data.code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ valid: false, error: String(err) }), { status: 500 });
  }
});
