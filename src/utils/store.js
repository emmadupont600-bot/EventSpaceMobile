/**
 * Store — toutes les opérations de données passent par Supabase.
 * Même API qu'avant pour ne rien casser dans les screens.
 */
import { supabase } from '../lib/supabase';

// Utilisateur courant en mémoire (pas de localStorage en React Native sandboxé)
let _currentUser = null;

export const Store = {

  // ─── AUTH ───────────────────────────────────────────────
  async getUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw new Error(error.message);
    return data;
  },

  async getCurrentUser() {
    return _currentUser;
  },

  async setCurrentUser(user) {
    _currentUser = user;
  },

  async logout() {
    _currentUser = null;
  },

  async login(email, password) {
    const emailNorm = (email || '').trim().toLowerCase();
    const passwordNorm = (password || '').trim();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', emailNorm)
      .eq('password', passwordNorm)
      .single();
    if (error || !data) throw new Error('Email ou mot de passe incorrect');
    _currentUser = data;
    return data;
  },

  async register(userData) {
    const emailNorm = (userData.email || '').trim().toLowerCase();
    // Vérifie unicité
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', emailNorm)
      .maybeSingle();
    if (existing) throw new Error('Email déjà utilisé');

    const { data, error } = await supabase
      .from('users')
      .insert({ ...userData, email: emailNorm })
      .select()
      .single();
    if (error) throw new Error(error.message);
    _currentUser = data;
    return data;
  },

  // ─── VENUES ─────────────────────────────────────────────
  async getVenues() {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    // Normalise les champs snake_case → camelCase pour compat screens
    return (data || []).map(normalizeVenue);
  },

  async saveVenues(venues) {
    // Utilisé par EditVenueScreen pour sauvegarder une liste modifiée
    // En mode Supabase, on fait un upsert de chaque venue
    for (const v of venues) {
      const row = denormalizeVenue(v);
      await supabase.from('venues').upsert(row);
    }
  },

  async getVenue(id) {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return normalizeVenue(data);
  },

  async addVenue(venue) {
    const row = denormalizeVenue(venue);
    delete row.id; // laisser la DB générer l'id
    const { data, error } = await supabase
      .from('venues')
      .insert({ ...row, owner_id: _currentUser?.id, published: true, rating: 0, review_count: 0 })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return normalizeVenue(data);
  },

  async updateVenue(id, changes) {
    const row = denormalizeVenue(changes);
    const { error } = await supabase.from('venues').update(row).eq('id', id);
    if (error) throw new Error(error.message);
  },

  async deleteVenue(id) {
    const { error } = await supabase.from('venues').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // ─── RESERVATIONS ────────────────────────────────────────
  async getReservations() {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(normalizeReservation);
  },

  async addReservation(res) {
    const row = {
      venue_id: res.venueId,
      user_id: res.userId,
      owner_id: res.ownerId,
      venue_name: res.venueName,
      user_name: res.userName,
      date: res.date,
      start_time: res.start,
      end_time: res.end,
      guests: res.guests,
      event_type: res.eventType,
      message: res.message,
      total: res.total,
      status: 'pending',
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
    if (changes.status) row.status = changes.status;
    const { error } = await supabase.from('reservations').update(row).eq('id', id);
    if (error) throw new Error(error.message);
  },

  // ─── MESSAGES / CONVERSATIONS ───────────────────────────
  async getOrCreateConv(userId, ownerId, venueId, venueName) {
    const convId = `conv_${userId}_${venueId}`;
    // Essaye de récupérer
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', convId)
      .maybeSingle();
    if (existing) return existing;
    // Crée
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

  // ─── REVIEWS ────────────────────────────────────────────
  async getReviews(venueId) {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (venueId !== undefined) query = query.eq('venue_id', venueId);
    const { data, error } = await query;
    if (error) return [];
    return (data || []).map(r => ({ ...r, venueId: r.venue_id, userId: r.user_id, userName: r.user_name }));
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

  // ─── FAVORITES ──────────────────────────────────────────
  async getFavorites(userId) {
    const { data } = await supabase
      .from('favorites')
      .select('venue_id')
      .eq('user_id', userId);
    return (data || []).map(f => f.venue_id);
  },

  async toggleFavorite(userId, venueId) {
    const favs = await this.getFavorites(userId);
    const exists = favs.includes(Number(venueId));
    if (exists) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('venue_id', venueId);
      return false;
    } else {
      await supabase.from('favorites').insert({ user_id: userId, venue_id: venueId });
      return true;
    }
  },

  async isFavorite(userId, venueId) {
    const { data } = await supabase
      .from('favorites')
      .select('venue_id')
      .eq('user_id', userId)
      .eq('venue_id', venueId)
      .maybeSingle();
    return !!data;
  },

  // ─── RESET (dev uniquement) ──────────────────────────────
  async resetDemo() {
    console.warn('[Store] resetDemo() n\'a pas d\'effet en mode Supabase.');
  },
};

// ─── Normaliseurs ────────────────────────────────────────
function normalizeVenue(v) {
  return {
    id: v.id,
    ownerId: v.owner_id,
    name: v.name,
    type: v.type,
    city: v.city,
    address: v.address,
    price: v.price,
    capacity: v.capacity,
    description: v.description,
    img: v.img,
    gallery: v.gallery || [],
    tags: v.tags || [],
    rating: v.rating || 0,
    reviewCount: v.review_count || 0,
    published: v.published,
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
  if (v.gallery !== undefined) row.gallery = v.gallery;
  if (v.tags !== undefined) row.tags = v.tags;
  if (v.published !== undefined) row.published = v.published;
  return row;
}

function normalizeReservation(r) {
  return {
    id: r.id,
    venueId: r.venue_id,
    userId: r.user_id,
    ownerId: r.owner_id,
    venueName: r.venue_name,
    userName: r.user_name,
    date: r.date,
    start: r.start_time,
    end: r.end_time,
    guests: r.guests,
    eventType: r.event_type,
    message: r.message,
    total: r.total,
    status: r.status,
    createdAt: r.created_at,
  };
}
