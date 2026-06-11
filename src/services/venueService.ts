/**
 * venueService — lieux (CRUD, galerie, dates bloquées) + cache mémoire TTL.
 *
 * Le cache est encapsulé ici : il est invalidé automatiquement par toutes
 * les écritures de ce service, par authService.logout() et par
 * reservationService.addReservation().
 */
import { supabase } from './supabase';
import { VENUES_CACHE_TTL_MS } from '../constants/app';
import { getSessionUserId, isUUID, parseGallery } from './serviceUtils';

export interface Venue {
  id: string | number;
  ownerId: string | null;
  name: string;
  type?: string;
  city?: string;
  address?: string;
  price?: number;
  capacity?: number;
  currency: string;
  description?: string;
  img?: string;
  gallery: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  published?: boolean;
  amenities?: string[];
  atypique?: boolean;
  location?: string;
}

export interface BlockedDate {
  id: string | number;
  venueId: string | number;
  date: string;
  reason?: string | null;
}

type VenueRow = Record<string, any>;

let _venuesCache: { data: Venue[] | null; fetchedAt: number } = { data: null, fetchedAt: 0 };

export function invalidateVenuesCache(): void {
  _venuesCache = { data: null, fetchedAt: 0 };
}

export function normalizeVenue(v: VenueRow): Venue {
  return {
    id: v.id, ownerId: v.owner_id, name: v.name, type: v.type,
    city: v.city, address: v.address, price: v.price, capacity: v.capacity,
    currency: v.currency || 'eur',
    description: v.description, img: v.cover_url || v.img,
    gallery: parseGallery(v.gallery_urls || v.gallery),
    tags: v.tags || [], rating: v.rating || 0,
    reviewCount: v.review_count || 0, published: v.published,
    amenities: v.amenities || [],
    atypique: v.atypique,
    location: v.location,
  };
}

export function denormalizeVenue(v: Partial<Venue> & VenueRow): VenueRow {
  const row: VenueRow = {};
  if (v.id !== undefined) row.id = v.id;
  if (v.ownerId !== undefined) row.owner_id = v.ownerId;
  if (v.name !== undefined) row.name = v.name;
  if (v.type !== undefined) row.type = v.type;
  if (v.city !== undefined) row.city = v.city;
  if (v.address !== undefined) row.address = v.address;
  if (v.price !== undefined) row.price = v.price;
  if (v.capacity !== undefined) row.capacity = v.capacity;
  if (v.description !== undefined) row.description = v.description;
  if (v.img !== undefined) row.img = v.img;
  if (v.cover_url !== undefined) row.cover_url = v.cover_url;
  if (v.gallery !== undefined) row.gallery = v.gallery;
  if (v.gallery_urls !== undefined) row.gallery_urls = v.gallery_urls;
  if (v.tags !== undefined) row.tags = v.tags;
  if (v.published !== undefined) row.published = v.published;
  if (v.currency !== undefined) row.currency = v.currency;
  return row;
}

export async function getVenues({ forceRefresh = false }: { forceRefresh?: boolean } = {}): Promise<Venue[]> {
  const now = Date.now();
  if (!forceRefresh && _venuesCache.data && now - _venuesCache.fetchedAt < VENUES_CACHE_TTL_MS) {
    return _venuesCache.data;
  }

  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  const venues = (data || []).map(normalizeVenue);
  _venuesCache = { data: venues, fetchedAt: now };
  return venues;
}

export async function getVenuesByOwner(ownerId: string): Promise<Venue[]> {
  if (!isUUID(ownerId)) return [];
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeVenue);
}

export async function getVenue(id: string | number): Promise<Venue | null> {
  const { data, error } = await supabase.from('venues').select('*').eq('id', id).single();
  if (error) return null;
  return normalizeVenue(data);
}

export async function addVenue(venue: VenueRow, ownerId?: string): Promise<Venue> {
  const resolvedOwnerId = isUUID(ownerId) ? ownerId : await getSessionUserId();
  const row = denormalizeVenue(venue);
  delete row.id;
  const { data, error } = await supabase
    .from('venues')
    .insert({
      ...row,
      owner_id: resolvedOwnerId,
      published: true,
      rating: 0,
      review_count: 0,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  invalidateVenuesCache();
  return normalizeVenue(data);
}

export async function updateVenue(id: string | number, changes: VenueRow): Promise<void> {
  const { error } = await supabase.from('venues').update(denormalizeVenue(changes)).eq('id', id);
  if (error) throw new Error(error.message);
  invalidateVenuesCache();
}

export async function deleteVenue(id: string | number): Promise<void> {
  const { error } = await supabase.from('venues').delete().eq('id', id);
  if (error) throw new Error(error.message);
  invalidateVenuesCache();
}

export async function saveVenues(venues: VenueRow[]): Promise<void> {
  for (const v of venues) await supabase.from('venues').upsert(denormalizeVenue(v));
  invalidateVenuesCache();
}

export async function updateVenueCover(venueId: string | number, coverUrl: string): Promise<void> {
  const { error } = await supabase.from('venues').update({ cover_url: coverUrl, img: coverUrl }).eq('id', venueId);
  if (error) throw new Error(error.message);
  invalidateVenuesCache();
}

export async function addVenueGalleryPhoto(venueId: string | number, photoUrl: string): Promise<string[]> {
  const { data } = await supabase.from('venues').select('gallery_urls').eq('id', venueId).single();
  const updated = [...parseGallery(data?.gallery_urls), photoUrl];
  const { error } = await supabase.from('venues').update({ gallery_urls: updated, gallery: updated }).eq('id', venueId);
  if (error) throw new Error(error.message);
  invalidateVenuesCache();
  return updated;
}

export async function removeVenueGalleryPhoto(venueId: string | number, photoUrl: string): Promise<string[]> {
  const { data } = await supabase.from('venues').select('gallery_urls').eq('id', venueId).single();
  const updated = parseGallery(data?.gallery_urls).filter(url => url !== photoUrl);
  const { error } = await supabase.from('venues').update({ gallery_urls: updated, gallery: updated }).eq('id', venueId);
  if (error) throw new Error(error.message);
  invalidateVenuesCache();
  return updated;
}

export async function reorderVenueGallery(venueId: string | number, orderedUrls: string[]): Promise<string[]> {
  const { error } = await supabase
    .from('venues')
    .update({ gallery_urls: orderedUrls, gallery: orderedUrls })
    .eq('id', venueId);
  if (error) throw new Error(error.message);
  invalidateVenuesCache();
  return orderedUrls;
}

// ─── DATES BLOQUÉES ──────────────────────────────────────────────────────────
export async function getBlockedDates(venueId: string | number): Promise<BlockedDate[]> {
  const { data, error } = await supabase
    .from('venue_blocked_dates')
    .select('*')
    .eq('venue_id', venueId)
    .order('blocked_date', { ascending: true });
  if (error) return [];
  return (data || []).map((d: any) => ({
    id: d.id,
    venueId: d.venue_id,
    date: d.blocked_date,
    reason: d.reason,
  }));
}

export async function addBlockedDate(venueId: string | number, date: string, reason = ''): Promise<any> {
  const { data, error } = await supabase
    .from('venue_blocked_dates')
    .insert({ venue_id: venueId, blocked_date: date, reason })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function removeBlockedDate(id: string | number): Promise<void> {
  const { error } = await supabase.from('venue_blocked_dates').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getAvailableVenueIds(date: string): Promise<Array<string | number> | null> {
  if (!date) return null;
  const venues = await getVenues();
  const ids: Array<string | number> = [];
  for (const v of venues) {
    const blocked = await supabase
      .from('venue_blocked_dates')
      .select('id')
      .eq('venue_id', v.id)
      .eq('blocked_date', date)
      .maybeSingle();
    if (!blocked.data) ids.push(v.id);
  }
  return ids;
}
