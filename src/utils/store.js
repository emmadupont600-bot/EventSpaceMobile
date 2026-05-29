/**
 * Store — toutes les opérations de données passent par Supabase.
 * L'état utilisateur réactif est géré par AppContext (pas de cache module global).
 */
import { supabase } from '../services/supabase';
import { VENUES_CACHE_TTL_MS } from '../constants/app';

let _venuesCache = { data: null, fetchedAt: 0 };

function isUUID(v) {
  if (!v || typeof v !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

async function getSessionUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

async function fetchUserProfile(userId) {
  const { data } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
  if (data) return data;
  const { data: { session } } = await supabase.auth.getSession();
  const u = session?.user;
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    role: u.user_metadata?.role || 'client',
    name: u.user_metadata?.name,
  };
}

export const Store = {

  // ─── AUTH ───────────────────────────────────────────────────────────
  async getCurrentUser() {
    const userId = await getSessionUserId();
    if (!userId) return null;
    return fetchUserProfile(userId);
  },

  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        callback(null);
        return;
      }
      const profile = await fetchUserProfile(session.user.id);
      callback(profile);
    });
    return () => subscription.unsubscribe();
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: (email || '').trim().toLowerCase(),
      password: (password || '').trim(),
    });
    if (error || !data?.user) throw new Error(error?.message || 'Email ou mot de passe incorrect');
    return fetchUserProfile(data.user.id);
  },

  async register(userData) {
    const emailNorm = (userData.email || '').trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: emailNorm,
      password: userData.password,
      options: { data: { name: userData.name, role: userData.role || 'client' } },
    });
    if (error || !data?.user) throw new Error(error?.message || "Erreur lors de l'inscription");
    const profile = {
      id: data.user.id,
      email: emailNorm,
      name: userData.name,
      role: userData.role || 'client',
      phone: userData.phone || null,
    };
    const { error: profileError } = await supabase.from('users').upsert(profile, { onConflict: 'id' });
    if (profileError) console.warn('[Store.register] profil insert warning:', profileError.message);
    return profile;
  },

  async logout() {
    _venuesCache = { data: null, fetchedAt: 0 };
    await supabase.auth.signOut();
  },

  invalidateVenuesCache() {
    _venuesCache = { data: null, fetchedAt: 0 };
  },

  // ─── VENUES ─────────────────────────────────────────────────────
  async getVenues({ forceRefresh = false } = {}) {
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
  },

  async getVenuesByOwner(ownerId) {
    if (!isUUID(ownerId)) return [];
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(normalizeVenue);
  },

  async getVenue(id) {
    const { data, error } = await supabase.from('venues').select('*').eq('id', id).single();
    if (error) return null;
    return normalizeVenue(data);
  },

  async addVenue(venue, ownerId) {
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
    Store.invalidateVenuesCache();
    return normalizeVenue(data);
  },

  async updateVenue(id, changes) {
    const { error } = await supabase.from('venues').update(denormalizeVenue(changes)).eq('id', id);
    if (error) throw new Error(error.message);
    Store.invalidateVenuesCache();
  },

  async deleteVenue(id) {
    const { error } = await supabase.from('venues').delete().eq('id', id);
    if (error) throw new Error(error.message);
    Store.invalidateVenuesCache();
  },

  async saveVenues(venues) {
    for (const v of venues) await supabase.from('venues').upsert(denormalizeVenue(v));
    Store.invalidateVenuesCache();
  },

  async updateVenueCover(venueId, coverUrl) {
    const { error } = await supabase.from('venues').update({ cover_url: coverUrl, img: coverUrl }).eq('id', venueId);
    if (error) throw new Error(error.message);
    Store.invalidateVenuesCache();
  },

  async addVenueGalleryPhoto(venueId, photoUrl) {
    const { data } = await supabase.from('venues').select('gallery_urls').eq('id', venueId).single();
    const updated = [...parseGallery(data?.gallery_urls), photoUrl];
    const { error } = await supabase.from('venues').update({ gallery_urls: updated, gallery: updated }).eq('id', venueId);
    if (error) throw new Error(error.message);
    Store.invalidateVenuesCache();
    return updated;
  },

  async removeVenueGalleryPhoto(venueId, photoUrl) {
    const { data } = await supabase.from('venues').select('gallery_urls').eq('id', venueId).single();
    const updated = parseGallery(data?.gallery_urls).filter(url => url !== photoUrl);
    const { error } = await supabase.from('venues').update({ gallery_urls: updated, gallery: updated }).eq('id', venueId);
    if (error) throw new Error(error.message);
    Store.invalidateVenuesCache();
    return updated;
  },

  // ─── RESERVATIONS ──────────────────────────────────────────────────────────
  async getReservations() {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(normalizeReservation);
  },

  async getReservationsByUser(userId) {
    if (!isUUID(userId)) return [];
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(normalizeReservation);
  },

  async getReservationsByOwner(ownerId) {
    if (!isUUID(ownerId)) return [];
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(normalizeReservation);
  },

  async addReservation(res) {
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
    return normalizeReservation(data);
  },

  async updateReservation(id, changes) {
    const row = {};
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
  },

  async cancelReservation(id, { refundPaymentIntent = false } = {}) {
    const updates = { status: 'cancelled' };
    if (refundPaymentIntent) updates.payment_status = 'refunded';
    await Store.updateReservation(id, updates);
  },

  async updateUserProfile(userId, changes) {
    const row = {};
    if (changes.name !== undefined) row.name = changes.name;
    if (changes.phone !== undefined) row.phone = changes.phone;
    if (changes.has_onboarded !== undefined) row.has_onboarded = changes.has_onboarded;
    if (changes.preferred_currency !== undefined) row.preferred_currency = changes.preferred_currency;
    const { error } = await supabase.from('users').update(row).eq('id', userId);
    if (error) throw new Error(error.message);
  },

  // ─── DISPONIBILITÉS ─────────────────────────────────────────────────────
  async getBlockedDates(venueId) {
    const { data, error } = await supabase
      .from('venue_blocked_dates')
      .select('*')
      .eq('venue_id', venueId)
      .order('blocked_date', { ascending: true });
    if (error) return [];
    return (data || []).map(d => ({
      id: d.id,
      venueId: d.venue_id,
      date: d.blocked_date,
      reason: d.reason,
    }));
  },

  async addBlockedDate(venueId, date, reason = '') {
    const { data, error } = await supabase
      .from('venue_blocked_dates')
      .insert({ venue_id: venueId, blocked_date: date, reason })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async removeBlockedDate(id) {
    const { error } = await supabase.from('venue_blocked_dates').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async isVenueAvailable(venueId, date, start, end) {
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

    const toMin = t => {
      const [h, m] = (t || '00:00').split(':').map(Number);
      return h * 60 + (m || 0);
    };
    const reqStart = toMin(start);
    const reqEnd = toMin(end);

    return !conflicts.some(c => {
      const cStart = toMin(c.start_time);
      const cEnd = toMin(c.end_time);
      return reqStart < cEnd && reqEnd > cStart;
    });
  },

  async getAvailableVenueIds(date) {
    if (!date) return null;
    const venues = await Store.getVenues();
    const ids = [];
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
  },

  // ─── CODES PROMO ─────────────────────────────────────────────────────────
  async validatePromoCode(code) {
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
  },

  async incrementPromoUse(code) {
    const { data } = await supabase.from('promo_codes').select('use_count').eq('code', code).single();
    if (data) {
      await supabase.from('promo_codes').update({ use_count: (data.use_count || 0) + 1 }).eq('code', code);
    }
  },

  async reorderVenueGallery(venueId, orderedUrls) {
    const { error } = await supabase
      .from('venues')
      .update({ gallery_urls: orderedUrls, gallery: orderedUrls })
      .eq('id', venueId);
    if (error) throw new Error(error.message);
    Store.invalidateVenuesCache();
    return orderedUrls;
  },

  // ─── STATS ANNONCEUR ───────────────────────────────────────────────────────
  async getOwnerStats(ownerId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split('T')[0];

    const reservations = await Store.getReservationsByOwner(ownerId);
    const recent = reservations.filter(r => {
      const d = r.date || r.createdAt?.split('T')[0];
      return d && d >= sinceStr;
    });

    const byWeek = {};
    recent.forEach(r => {
      const d = new Date(r.date || r.createdAt);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      if (!byWeek[key]) byWeek[key] = { label: key.slice(5), value: 0, count: 0 };
      if (r.status === 'confirmed') {
        byWeek[key].value += parseFloat(r.total) || 0;
        byWeek[key].count += 1;
      }
    });

    return {
      totalRevenue: recent.filter(r => r.status === 'confirmed').reduce((s, r) => s + (parseFloat(r.total) || 0), 0),
      confirmedCount: recent.filter(r => r.status === 'confirmed').length,
      pendingCount: recent.filter(r => r.status === 'pending').length,
      chartData: Object.values(byWeek).slice(-8),
    };
  },

  // ─── MESSAGES / CONVERSATIONS ───────────────────────────────────────────
  async getOrCreateConv(userId, ownerId, venueId, venueName) {
    const convId = `conv_${userId}_${venueId}`;
    const { data: existing } = await supabase.from('conversations').select('*').eq('id', convId).maybeSingle();
    if (existing) return existing;
    const { data, error } = await supabase
      .from('conversations')
      .insert({ id: convId, user_id: userId, owner_id: ownerId, venue_id: venueId, venue_name: venueName })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getAllConversations(userId) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`user_id.eq.${userId},owner_id.eq.${userId}`);
    if (error) return [];
    return data || [];
  },

  async getMessages(convId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('ts', { ascending: true });
    if (error) return [];
    return (data || []).map(m => ({ ...m, senderId: m.sender_id }));
  },

  async addMessage(convId, msg) {
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: convId, sender_id: msg.senderId, text: msg.text })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { ...data, senderId: data.sender_id };
  },

  // ─── REVIEWS ─────────────────────────────────────────────────────────
  async getReviews(venueId) {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (venueId !== undefined) query = query.eq('venue_id', venueId);
    const { data, error } = await query;
    if (error) return [];
    return (data || []).map(r => ({
      ...r,
      venueId: r.venue_id,
      userId: r.user_id,
      userName: r.user_name,
      author: r.user_name || 'Anonyme',
      text: r.comment || '',
    }));
  },

  async getUserReviewForVenue(userId, venueId) {
    if (!userId || venueId == null) return null;
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('venue_id', venueId)
      .maybeSingle();
    return data;
  },

  async addReview(review) {
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
  },

  // ─── FAVORITES ──────────────────────────────────────────────────────────
  async getFavorites(userId) {
    const { data } = await supabase.from('favorites').select('venue_id').eq('user_id', userId);
    return (data || []).map(f => f.venue_id);
  },

  async toggleFavorite(userId, venueId) {
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
  },

  async isFavorite(userId, venueId) {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('venue_id', venueId)
      .maybeSingle();
    return !!data;
  },

  async resetDemo() {
    console.warn("[Store] resetDemo() n'a pas d'effet en mode Supabase.");
  },
};

// Exporté pour les tests unitaires
export { isUUID, normalizeVenue, normalizeReservation };

function resolveVenueId(v) {
  if (v === null || v === undefined || v === '') return null;
  return v;
}

function parseGallery(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

function normalizeVenue(v) {
  return {
    id: v.id, ownerId: v.owner_id, name: v.name, type: v.type,
    city: v.city, address: v.address, price: v.price, capacity: v.capacity,
    currency: v.currency || 'eur',
    description: v.description, img: v.cover_url || v.img,
    gallery: parseGallery(v.gallery_urls || v.gallery),
    tags: v.tags || [], rating: v.rating || 0,
    reviewCount: v.review_count || 0, published: v.published,
  };
}

function denormalizeVenue(v) {
  const row = {};
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

function normalizeReservation(r) {
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
