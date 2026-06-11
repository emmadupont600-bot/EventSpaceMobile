/**
 * authService — authentification et profil utilisateur (Supabase Auth + table users).
 */
import { supabase } from './supabase';
import { getSessionUserId } from './serviceUtils';
import { invalidateVenuesCache } from './venueService';

export type UserRole = 'client' | 'annonceur';

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  role: UserRole | string;
  phone?: string | null;
  has_onboarded?: boolean;
  preferred_currency?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  role?: UserRole | string;
  phone?: string | null;
}

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
  if (data) return data as UserProfile;
  const { data: sessionData } = await supabase.auth.getSession();
  const u = sessionData?.session?.user;
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    role: u.user_metadata?.role || 'client',
    name: u.user_metadata?.name,
  };
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return fetchUserProfile(userId);
}

export function onAuthStateChange(callback: (user: UserProfile | null) => void): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }
    const profile = await fetchUserProfile(session.user.id);
    callback(profile);
  });
  return () => subscription.unsubscribe();
}

export async function login(email: string, password: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: (email || '').trim().toLowerCase(),
    password: (password || '').trim(),
  });
  if (error || !data?.user) throw new Error(error?.message || 'Email ou mot de passe incorrect');
  return fetchUserProfile(data.user.id);
}

export async function register(userData: RegisterData): Promise<UserProfile> {
  const emailNorm = (userData.email || '').trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email: emailNorm,
    password: userData.password,
    options: { data: { name: userData.name, role: userData.role || 'client' } },
  });
  if (error || !data?.user) throw new Error(error?.message || "Erreur lors de l'inscription");
  const profile: UserProfile = {
    id: data.user.id,
    email: emailNorm,
    name: userData.name,
    role: userData.role || 'client',
    phone: userData.phone || null,
  };
  const { error: profileError } = await supabase.from('users').upsert(profile, { onConflict: 'id' });
  if (profileError) console.warn('[authService.register] profil insert warning:', profileError.message);
  return profile;
}

export async function logout(): Promise<void> {
  // Évite que le cache d'un compte survive à la session suivante.
  invalidateVenuesCache();
  await supabase.auth.signOut();
}

export interface ProfileChanges {
  name?: string;
  phone?: string | null;
  has_onboarded?: boolean;
  preferred_currency?: string;
}

export async function updateUserProfile(userId: string, changes: ProfileChanges): Promise<void> {
  const row: Record<string, unknown> = {};
  if (changes.name !== undefined) row.name = changes.name;
  if (changes.phone !== undefined) row.phone = changes.phone;
  if (changes.has_onboarded !== undefined) row.has_onboarded = changes.has_onboarded;
  if (changes.preferred_currency !== undefined) row.preferred_currency = changes.preferred_currency;
  const { error } = await supabase.from('users').update(row).eq('id', userId);
  if (error) throw new Error(error.message);
}
