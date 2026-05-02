/**
 * supabase.js — Client Supabase centralisé.
 *
 * Pour activer le vrai backend :
 * 1. Va sur https://supabase.com → New project
 * 2. Copie l'URL et la clé anon depuis Settings > API
 * 3. Remplace SUPABASE_URL et SUPABASE_ANON_KEY ci-dessous
 * 4. Lance le script SQL dans src/services/supabase-schema.sql
 *
 * Tant que les variables sont sur 'YOUR_*', le service retourne
 * des erreurs silencieuses et le Store local (AsyncStorage) prend le relais.
 */
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL       = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY  = 'YOUR_SUPABASE_ANON_KEY';

export const isSupabaseConfigured = !SUPABASE_URL.startsWith('YOUR_');

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Helper générique : exécute une requête Supabase si configuré,
 * sinon retourne { data: null, error: null } silencieusement.
 */
export async function sbQuery(fn) {
  if (!supabase) return { data: null, error: null };
  try {
    return await fn(supabase);
  } catch (e) {
    console.warn('[Supabase]', e.message);
    return { data: null, error: e };
  }
}

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const SupabaseAuth = {
  async signUp(email, password, metadata) {
    return sbQuery(sb => sb.auth.signUp({ email, password, options: { data: metadata } }));
  },
  async signIn(email, password) {
    return sbQuery(sb => sb.auth.signInWithPassword({ email, password }));
  },
  async signOut() {
    return sbQuery(sb => sb.auth.signOut());
  },
  async getSession() {
    return sbQuery(sb => sb.auth.getSession());
  },
};

// ─── VENUES ──────────────────────────────────────────────────────────────────
export const SupabaseVenues = {
  async getAll() {
    return sbQuery(sb =>
      sb.from('venues').select('*').eq('published', true).order('created_at', { ascending: false })
    );
  },
  async getByOwner(ownerId) {
    return sbQuery(sb =>
      sb.from('venues').select('*').eq('owner_id', ownerId)
    );
  },
  async insert(venue) {
    return sbQuery(sb => sb.from('venues').insert(venue).select().single());
  },
  async update(id, changes) {
    return sbQuery(sb => sb.from('venues').update(changes).eq('id', id).select().single());
  },
  async delete(id) {
    return sbQuery(sb => sb.from('venues').delete().eq('id', id));
  },
};

// ─── RESERVATIONS ────────────────────────────────────────────────────────────
export const SupabaseReservations = {
  async getByUser(userId) {
    return sbQuery(sb =>
      sb.from('reservations').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    );
  },
  async getByOwner(ownerId) {
    return sbQuery(sb =>
      sb.from('reservations').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false })
    );
  },
  async insert(reservation) {
    return sbQuery(sb => sb.from('reservations').insert(reservation).select().single());
  },
  async updateStatus(id, status) {
    return sbQuery(sb => sb.from('reservations').update({ status }).eq('id', id));
  },
};

// ─── MESSAGES ────────────────────────────────────────────────────────────────
export const SupabaseMessages = {
  async getByConv(convId) {
    return sbQuery(sb =>
      sb.from('messages').select('*').eq('conv_id', convId).order('ts', { ascending: true })
    );
  },
  async insert(msg) {
    return sbQuery(sb => sb.from('messages').insert(msg).select().single());
  },
  // Realtime subscription
  subscribeToConv(convId, onMessage) {
    if (!supabase) return () => {};
    const channel = supabase
      .channel('conv-' + convId)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conv_id=eq.${convId}`,
      }, payload => onMessage(payload.new))
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
