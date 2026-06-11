/** Helpers partagés entre les services de données. */
import { supabase } from './supabase';

export function isUUID(v: unknown): v is string {
  if (!v || typeof v !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

export async function getSessionUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id ?? null;
}

/** "14:30" → minutes depuis minuit */
export function toMinutes(t?: string | null): number {
  const [h, m] = (t || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function parseGallery(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}
