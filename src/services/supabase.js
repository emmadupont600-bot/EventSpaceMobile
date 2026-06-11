/**
 * supabase.js — Client Supabase centralisé.
 */
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/env';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Valeurs de repli inertes pour éviter un crash au démarrage si .env absent
// (l'app affiche alors les warnings de src/config/env.js).
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'public-anon-key-missing'
);

/**
 * Helper générique : exécute une requête Supabase.
 */
export async function sbQuery(fn) {
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
// FIX: toutes les requêtes utilisent 'conversation_id' (cohérent avec store.js)
export const SupabaseMessages = {
  async getByConv(convId) {
    return sbQuery(sb =>
      sb.from('messages').select('*').eq('conversation_id', convId).order('ts', { ascending: true })
    );
  },
  async insert(msg) {
    return sbQuery(sb => sb.from('messages').insert(msg).select().single());
  },
  // FIX: filtre sur 'conversation_id' au lieu de 'conv_id'
  subscribeToConv(convId, onMessage) {
    const channel = supabase
      .channel('conv-' + convId)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${convId}`,
      }, payload => onMessage(payload.new))
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
