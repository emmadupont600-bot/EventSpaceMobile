/**
 * messagingService — conversations et messages temps réel.
 */
import { supabase } from './supabase';

export interface Conversation {
  id: string;
  user_id: string;
  owner_id: string;
  venue_id: string | number;
  venue_name?: string;
}

export interface Message {
  id?: string | number;
  conversation_id?: string;
  sender_id?: string;
  senderId?: string;
  text: string;
  ts?: string;
}

export async function getOrCreateConv(
  userId: string,
  ownerId: string,
  venueId: string | number,
  venueName?: string
): Promise<Conversation> {
  const convId = `conv_${userId}_${venueId}`;
  const { data: existing } = await supabase.from('conversations').select('*').eq('id', convId).maybeSingle();
  if (existing) return existing as Conversation;
  const { data, error } = await supabase
    .from('conversations')
    .insert({ id: convId, user_id: userId, owner_id: ownerId, venue_id: venueId, venue_name: venueName })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Conversation;
}

export async function getAllConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`user_id.eq.${userId},owner_id.eq.${userId}`);
  if (error) return [];
  return (data || []) as Conversation[];
}

export async function getMessages(convId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', convId)
    .order('ts', { ascending: true });
  if (error) return [];
  return (data || []).map((m: any) => ({ ...m, senderId: m.sender_id }));
}

export async function addMessage(convId: string, msg: { senderId: string; text: string }): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: convId, sender_id: msg.senderId, text: msg.text })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { ...data, senderId: data.sender_id };
}
