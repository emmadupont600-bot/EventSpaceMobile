-- Migration : fonctionnalités audit complètes
-- onboarding, multi-devise, codes promo, disponibilités, protection rôle

-- ─── USERS ───────────────────────────────────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS has_onboarded BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferred_currency TEXT NOT NULL DEFAULT 'eur';

-- ─── VENUES : multi-devise ───────────────────────────────────────────────────
ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'eur';

-- ─── RESERVATIONS : devise + promo ─────────────────────────────────────────
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'eur',
  ADD COLUMN IF NOT EXISTS promo_code TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;

-- Étendre payment_status pour capture manuelle Stripe
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_payment_status_check;
ALTER TABLE public.reservations ADD CONSTRAINT reservations_payment_status_check
  CHECK (payment_status = ANY (ARRAY['unpaid'::text, 'authorized'::text, 'paid'::text, 'refunded'::text]));

-- ─── CODES PROMO ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code          TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percent'
                CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  max_uses      INTEGER DEFAULT NULL,
  use_count     INTEGER NOT NULL DEFAULT 0,
  expires_at    TIMESTAMPTZ DEFAULT NULL,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active promos" ON public.promo_codes;
CREATE POLICY "Public read active promos" ON public.promo_codes
  FOR SELECT USING (active = true);

-- ─── DATES BLOQUÉES (disponibilités annonceur) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.venue_blocked_dates (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  venue_id     BIGINT NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (venue_id, blocked_date)
);

CREATE INDEX IF NOT EXISTS idx_venue_blocked_dates_venue
  ON public.venue_blocked_dates(venue_id, blocked_date);

ALTER TABLE public.venue_blocked_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read blocked dates" ON public.venue_blocked_dates;
CREATE POLICY "Public read blocked dates" ON public.venue_blocked_dates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner manage blocked dates" ON public.venue_blocked_dates;
CREATE POLICY "Owner manage blocked dates" ON public.venue_blocked_dates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.venues v
      WHERE v.id = venue_blocked_dates.venue_id
        AND v.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.venues v
      WHERE v.id = venue_blocked_dates.venue_id
        AND v.owner_id = auth.uid()
    )
  );

-- ─── Protection changement de rôle ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role AND auth.uid() = NEW.id THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_prevent_self_role_change ON public.users;
CREATE TRIGGER users_prevent_self_role_change
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_role_change();

-- ─── Codes promo de démo ─────────────────────────────────────────────────────
INSERT INTO public.promo_codes (code, discount_type, discount_value, max_uses)
VALUES
  ('EVENTSPACE10', 'percent', 10, 100),
  ('WELCOME20', 'percent', 20, 50),
  ('FIXED50', 'fixed', 50, 30)
ON CONFLICT (code) DO NOTHING;
