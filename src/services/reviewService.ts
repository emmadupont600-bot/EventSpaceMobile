/**
 * reviewService — avis et favoris.
 */
import { supabase } from './supabase';

export interface Review {
  id?: string | number;
  venueId: string | number;
  userId: string;
  userName?: string;
  author?: string;
  rating: number;
  comment?: string;
  text?: string;
}

export async function getReviews(venueId?: string | number): Promise<Review[]> {
  let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
  if (venueId !== undefined) query = query.eq('venue_id', venueId);
  const { data, error } = await query;
  if (error) return [];
  return (data || []).map((r: any) => ({
    ...r,
    venueId: r.venue_id,
    userId: r.user_id,
    userName: r.user_name,
    author: r.user_name || 'Anonyme',
    text: r.comment || '',
  }));
}

export async function getUserReviewForVenue(userId: string, venueId: string | number): Promise<any> {
  if (!userId || venueId == null) return null;
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('venue_id', venueId)
    .maybeSingle();
  return data;
}

export async function addReview(review: Review): Promise<any> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      venue_id: review.venueId,
      user_id: review.userId,
      user_name: review.userName,
      rating: review.rating,
      comment: review.comment,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ─── FAVORIS ─────────────────────────────────────────────────────────────────
export async function getFavorites(userId: string): Promise<Array<string | number>> {
  const { data } = await supabase.from('favorites').select('venue_id').eq('user_id', userId);
  return (data || []).map((f: any) => f.venue_id);
}

export async function toggleFavorite(userId: string, venueId: string | number): Promise<boolean> {
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('venue_id', venueId)
    .maybeSingle();
  if (existing) {
    await supabase.from('favorites').delete().eq('user_id', userId).eq('venue_id', venueId);
    return false;
  }
  await supabase.from('favorites').insert({ user_id: userId, venue_id: venueId });
  return true;
}

export async function isFavorite(userId: string, venueId: string | number): Promise<boolean> {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('venue_id', venueId)
    .maybeSingle();
  return !!data;
}
