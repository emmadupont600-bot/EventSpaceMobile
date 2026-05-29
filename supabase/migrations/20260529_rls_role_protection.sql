-- Migration : protection du rôle utilisateur + RLS complémentaires
-- Empêche un client de s'auto-promouvoir annonceur via UPDATE sur users.role

-- Trigger : bloquer le changement de rôle par l'utilisateur lui-même
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

-- RLS users : s'assurer que les policies existent
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User reads own profile" ON public.users;
CREATE POLICY "User reads own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "User updates own profile" ON public.users;
CREATE POLICY "User updates own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "User inserts own profile" ON public.users;
CREATE POLICY "User inserts own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS venues : lecture publique + gestion par propriétaire
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public venues visible" ON public.venues;
CREATE POLICY "Public venues visible" ON public.venues
  FOR SELECT USING (published = true OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owner can manage venues" ON public.venues;
CREATE POLICY "Owner can manage venues" ON public.venues
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- RLS reviews : lecture publique, écriture par l'auteur
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reviews" ON public.reviews;
CREATE POLICY "Public reviews" ON public.reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "User can add review" ON public.reviews;
CREATE POLICY "User can add review" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Client peut annuler sa propre réservation
DROP POLICY IF EXISTS "client_cancel_own" ON public.reservations;
CREATE POLICY "client_cancel_own" ON public.reservations
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
