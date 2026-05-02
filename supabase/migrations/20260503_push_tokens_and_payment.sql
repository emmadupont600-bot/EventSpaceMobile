-- Migration : expo_push_token + colonnes paiement sur reservations
-- Applique : supabase db push  ou  supabase migration up

-- 1. Colonne push token sur users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS expo_push_token TEXT DEFAULT NULL;

-- 2. Colonnes paiement sur reservations (si pas déjà présentes)
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS payment_status       TEXT NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_intent_id    TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS commission_amount     NUMERIC(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS net_owner            NUMERIC(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS paid_at              TIMESTAMPTZ DEFAULT NULL;

-- 3. Index pour retrouver rapidement les réservations par user / owner
CREATE INDEX IF NOT EXISTS idx_reservations_user_id  ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_owner_id ON public.reservations(owner_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status   ON public.reservations(status);

-- 4. RLS : le client voit ses propres réservations, l'annonceur voit les siennes
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_see_own" ON public.reservations;
CREATE POLICY "client_see_own" ON public.reservations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_see_own" ON public.reservations;
CREATE POLICY "owner_see_own" ON public.reservations
  FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "client_insert" ON public.reservations;
CREATE POLICY "client_insert" ON public.reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "owner_update_status" ON public.reservations;
CREATE POLICY "owner_update_status" ON public.reservations
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "client_update_payment" ON public.reservations;
CREATE POLICY "client_update_payment" ON public.reservations
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
