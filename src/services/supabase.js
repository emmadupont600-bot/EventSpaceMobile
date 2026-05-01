/**
 * supabase.js — Client Supabase pour EventSpace
 * Remplace SUPABASE_URL et SUPABASE_ANON_KEY par tes vraies valeurs
 * depuis https://supabase.com/dashboard/project/ton-projet/settings/api
 */
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://TON_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'TON_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Envoie un message via Supabase Realtime
 * Table SQL requise :
 *   CREATE TABLE messages (
 *     id bigserial primary key,
 *     conv_id text not null,
 *     sender_id text not null,
 *     sender_name text,
 *     text text not null,
 *     created_at timestamptz default now()
 *   );
 *   ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
 */
export async function sendMessageSupabase(convId, senderId, senderName, text) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conv_id: convId, sender_id: senderId, sender_name: senderName, text });
  if (error) throw error;
  return data;
}

/**
 * Abonnement temps réel aux nouveaux messages d'une conversation
 * Usage : const sub = subscribeToMessages(convId, (msg) => setMessages(prev => [...prev, msg]));
 * Cleanup : sub.unsubscribe();
 */
export function subscribeToMessages(convId, onNewMessage) {
  return supabase
    .channel('messages:' + convId)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conv_id=eq.${convId}`,
    }, payload => onNewMessage(payload.new))
    .subscribe();
}
