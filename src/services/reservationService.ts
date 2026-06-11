/**
 * reservationService — réservations, disponibilité, codes promo, stats annonceur.
 */
import { supabase } from './supabase';
import { getSessionUserId, isUUID, toMinutes } from './serviceUtils';
import { invalidateVenuesCache } from './venueService';

export interface Reservation {
  id: string | number;
  venueId: string | number | null;
  userId: string | null;
  ownerId: string | null;
  venueName?: string;
  userName?: string;
  date?: string | null;
  start?: string | null;
  end?: string | null;
  guests?: number | null;
  eventType?: string | null;
  message?: string | null;
  notes?: string | null;
  total: number;
  status: string;
  paymentStatus?: string;
  payment_status?: string;
  paymentIntentId?: string | null;
  commissionAmount?: number | null;
  netOwner?: number | null;
  currency: string;
  promoCode?: string | null;
  discountAmount?: number | null;
  createdAt?: string;
}

export interface PromoCode {
  code: string;
  discount_type: string;
  discount_value: number;
  use_count: number;
}

export interface OwnerStats {
  totalRevenue: number;
  confirmedCount: number;
  pendingCount: number;
  chartData: Array<{ label: string; value: number; count: number }>;
}

type ReservationRow = Record<string, any>;

export function normalizeReservation(r: ReservationRow): Reservation {
  return {
    id: r.id, venueId: r.venue_id, userId: r.user_id, ownerId: r.owner_id,
    venueName: r.venue_name, userName: r.user_name, date: r.date,
    start: r.start_time, end: r.end_time, guests: r.guests,
    eventType: r.event_type, message: r.message, notes: r.message, total: r.total,
    status: r.status,
    paymentStatus: r.payment_status,
    payment_status: r.payment_status,
    paymentIntentId: r.payment_intent_id,
    commissionAmount: r.commission_amount,
    netOwner: r.net_owner,
    currency: r.currency || 'eur',
    promoCode: r.promo_code,
    discountAmount: r.discount_amount,
    createdAt: r.created_at,
  };
}

function resolveVenueId(v: unknown): unknown {
  if (v === null || v === undefined || v === '') return null;
  return v;
}

export async function getReservations(): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeReservation);
}

export async function getReservationsByUser(userId: string): Promise<Reservation[]> {
  if (!isUUID(userId)) return [];
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeReservation);
}

export async function getReservationsByOwner(ownerId: string): Promise<Reservation[]> {
  if (!isUUID(ownerId)) return [];
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeReservation);
}

export async function addReservation(res: ReservationRow): Promise<Reservation> {
  const venueId = resolveVenueId(res.venueId);
  const ownerId = isUUID(res.ownerId) ? res.ownerId : null;
  const sessionUserId = await getSessionUserId();
  const userId = isUUID(res.userId) ? res.userId
    : isUUID(sessionUserId) ? sessionUserId : null;

  const row = {
    venue_id: venueId,
    user_id: userId,
    owner_id: ownerId,
    venue_name: res.venueName || '',
    user_name: res.userName || '',
    date: res.date || null,
    start_time: res.start || null,
    end_time: res.end || null,
    guests: res.guests || null,
    event_type: res.eventType || null,
    message: res.notes || res.message || null,
    total: res.total || 0,
    status: 'pending',
    payment_status: res.payment_status || res.paymentStatus || 'unpaid',
    payment_intent_id: res.paymentIntentId || res.payment_intent_id || null,
    currency: res.currency || 'eur',
    promo_code: res.promoCode || res.promo_code || null,
    discount_amount: res.discountAmount || res.discount_amount || 0,
  };

  const { data, error } = await supabase
    .from('reservations')
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(error.message);
  // Les disponibilités affichées dépendent des réservations : on force un
  // rafraîchissement des venues au prochain accès.
  invalidateVenuesCache();
  return normalizeReservation(data);
}

export async function updateReservation(id: string | number, changes: ReservationRow): Promise<void> {
  const row: ReservationRow = {};
  if (changes.status !== undefined) row.status = changes.status;
  if (changes.payment_status !== undefined) row.payment_status = changes.payment_status;
  if (changes.payment_intent_id !== undefined) row.payment_intent_id = changes.payment_intent_id;
  if (changes.paymentIntentId !== undefined) row.payment_intent_id = changes.paymentIntentId;
  if (changes.commission_amount !== undefined) row.commission_amount = changes.commission_amount;
  if (changes.net_owner !== undefined) row.net_owner = changes.net_owner;
  if (changes.promo_code !== undefined) row.promo_code = changes.promo_code;
  if (changes.discount_amount !== undefined) row.discount_amount = changes.discount_amount;
  if (changes.currency !== undefined) row.currency = changes.currency;
  const { error } = await supabase.from('reservations').update(row).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function cancelReservation(
  id: string | number,
  { refundPaymentIntent = false }: { refundPaymentIntent?: boolean } = {}
): Promise<void> {
  const updates: ReservationRow = { status: 'cancelled' };
  if (refundPaymentIntent) updates.payment_status = 'refunded';
  await updateReservation(id, updates);
}

export async function isVenueAvailable(
  venueId: string | number,
  date: string,
  start?: string | null,
  end?: string | null
): Promise<boolean> {
  if (!venueId || !date) return true;

  const { data: blocked } = await supabase
    .from('venue_blocked_dates')
    .select('id')
    .eq('venue_id', venueId)
    .eq('blocked_date', date)
    .maybeSingle();
  if (blocked) return false;

  const { data: conflicts } = await supabase
    .from('reservations')
    .select('start_time, end_time')
    .eq('venue_id', venueId)
    .eq('date', date)
    .in('status', ['pending', 'confirmed']);

  if (!conflicts?.length || !start || !end) return true;

  const reqStart = toMinutes(start);
  const reqEnd = toMinutes(end);

  return !conflicts.some((c: any) => {
    const cStart = toMinutes(c.start_time);
    const cEnd = toMinutes(c.end_time);
    return reqStart < cEnd && reqEnd > cStart;
  });
}

// ─── CODES PROMO ─────────────────────────────────────────────────────────────
export async function validatePromoCode(code: string): Promise<PromoCode> {
  const normalized = (code || '').trim().toUpperCase();
  if (!normalized) throw new Error('Code promo invalide');

  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', normalized)
    .eq('active', true)
    .maybeSingle();

  if (error || !data) throw new Error('Code promo introuvable');
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    throw new Error('Code promo expiré');
  }
  if (data.max_uses && data.use_count >= data.max_uses) {
    throw new Error('Code promo épuisé');
  }
  return {
    code: data.code,
    discount_type: data.discount_type,
    discount_value: parseFloat(data.discount_value),
    use_count: data.use_count,
  };
}

export async function incrementPromoUse(code: string): Promise<void> {
  const { data } = await supabase.from('promo_codes').select('use_count').eq('code', code).single();
  if (data) {
    await supabase.from('promo_codes').update({ use_count: (data.use_count || 0) + 1 }).eq('code', code);
  }
}

// ─── STATS ANNONCEUR ─────────────────────────────────────────────────────────
export async function getOwnerStats(ownerId: string, days = 30): Promise<OwnerStats> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split('T')[0];

  const reservations = await getReservationsByOwner(ownerId);
  const recent = reservations.filter(r => {
    const d = r.date || r.createdAt?.split('T')[0];
    return d && d >= sinceStr;
  });

  const byWeek: Record<string, { label: string; value: number; count: number }> = {};
  recent.forEach(r => {
    const d = new Date(r.date || r.createdAt || Date.now());
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split('T')[0];
    if (!byWeek[key]) byWeek[key] = { label: key.slice(5), value: 0, count: 0 };
    if (r.status === 'confirmed') {
      byWeek[key].value += parseFloat(String(r.total)) || 0;
      byWeek[key].count += 1;
    }
  });

  return {
    totalRevenue: recent
      .filter(r => r.status === 'confirmed')
      .reduce((s, r) => s + (parseFloat(String(r.total)) || 0), 0),
    confirmedCount: recent.filter(r => r.status === 'confirmed').length,
    pendingCount: recent.filter(r => r.status === 'pending').length,
    chartData: Object.values(byWeek).slice(-8),
  };
}
