import AsyncStorage from '@react-native-async-storage/async-storage';
import { VENUES, DEMO_USERS, DEMO_REVIEWS, DEMO_RESERVATIONS, DEMO_CONVERSATIONS, DEMO_MESSAGES } from '../data/venues';
import { DEMO_RESERVATIONS_DATA } from '../data/demoReservations';

// --- Helper : initialise les données de démo au premier lancement ---
async function initDemoData() {
  const initialized = await AsyncStorage.getItem('es_initialized');
  if (initialized) return;

  // Réservations de démo
  const existingRes = await AsyncStorage.getItem('es_reservations');
  if (!existingRes) {
    await AsyncStorage.setItem('es_reservations', JSON.stringify(DEMO_RESERVATIONS_DATA));
  }

  // Conversations de démo
  for (const conv of DEMO_CONVERSATIONS) {
    const key = 'es_conv_' + conv.userId + '_' + conv.venueId;
    const existing = await AsyncStorage.getItem(key);
    if (!existing) await AsyncStorage.setItem(key, JSON.stringify(conv));
  }

  // Messages de démo
  for (const [convId, msgs] of Object.entries(DEMO_MESSAGES)) {
    const existing = await AsyncStorage.getItem('es_msgs_' + convId);
    if (!existing) await AsyncStorage.setItem('es_msgs_' + convId, JSON.stringify(msgs));
  }

  await AsyncStorage.setItem('es_initialized', '1');
}

export const Store = {

  // --- AUTH ---
  async getUsers() {
    const saved = await AsyncStorage.getItem('es_users');
    return saved ? JSON.parse(saved) : [...DEMO_USERS];
  },
  async saveUsers(users) {
    await AsyncStorage.setItem('es_users', JSON.stringify(users));
  },
  async getCurrentUser() {
    const u = await AsyncStorage.getItem('es_user');
    return u ? JSON.parse(u) : null;
  },
  async setCurrentUser(user) {
    await AsyncStorage.setItem('es_user', JSON.stringify(user));
  },
  async logout() {
    await AsyncStorage.removeItem('es_user');
  },

  // --- LOGIN DEMO (email + password) ---
  async login(email, password) {
    const users = await this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Email ou mot de passe incorrect');
    await this.setCurrentUser(user);
    await initDemoData();
    return user;
  },

  // --- REGISTER ---
  async register(data) {
    const users = await this.getUsers();
    if (users.find(u => u.email === data.email)) throw new Error('Email déjà utilisé');
    const user = { ...data, id: Date.now() };
    users.push(user);
    await this.saveUsers(users);
    await this.setCurrentUser(user);
    await initDemoData();
    return user;
  },

  // --- VENUES ---
  async getVenues() {
    const saved = await AsyncStorage.getItem('es_venues');
    return saved ? JSON.parse(saved) : [...VENUES];
  },
  async saveVenues(venues) {
    await AsyncStorage.setItem('es_venues', JSON.stringify(venues));
  },
  async getVenue(id) {
    const venues = await this.getVenues();
    return venues.find(v => v.id == id) || null;
  },
  async addVenue(venue) {
    const venues = await this.getVenues();
    venue.id = Date.now();
    venue.published = true;
    venue.rating = 0;
    venue.reviewCount = 0;
    venue.gallery = [venue.img];
    venues.push(venue);
    await this.saveVenues(venues);
    return venue;
  },

  // --- RESERVATIONS ---
  async getReservations() {
    const saved = await AsyncStorage.getItem('es_reservations');
    if (saved) return JSON.parse(saved);
    // Fallback : demo reservations si pas encore initialisé
    return [...DEMO_RESERVATIONS_DATA];
  },
  async addReservation(res) {
    const list = await this.getReservations();
    res.id = Date.now();
    res.createdAt = new Date().toISOString();
    list.push(res);
    await AsyncStorage.setItem('es_reservations', JSON.stringify(list));
    return res;
  },
  async updateReservation(id, changes) {
    const list = await this.getReservations();
    const idx = list.findIndex(r => r.id == id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...changes };
      await AsyncStorage.setItem('es_reservations', JSON.stringify(list));
    }
  },

  // --- MESSAGES ---
  async getMessages(convId) {
    const saved = await AsyncStorage.getItem('es_msgs_' + convId);
    return saved ? JSON.parse(saved) : [];
  },
  async addMessage(convId, msg) {
    const msgs = await this.getMessages(convId);
    msg.id = Date.now();
    msg.ts = new Date().toISOString();
    msgs.push(msg);
    await AsyncStorage.setItem('es_msgs_' + convId, JSON.stringify(msgs));
    return msg;
  },
  async getOrCreateConv(userId, ownerId, venueId, venueName) {
    const key = 'es_conv_' + userId + '_' + venueId;
    const saved = await AsyncStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    const conv = { id: 'conv_' + userId + '_' + venueId + '_' + Date.now(), userId, ownerId, venueId, venueName };
    await AsyncStorage.setItem(key, JSON.stringify(conv));
    return conv;
  },
  async getAllConversations(userId) {
    const keys = await AsyncStorage.getAllKeys();
    const convKeys = keys.filter(k => k.startsWith('es_conv_' + userId + '_'));
    const results = await Promise.all(
      convKeys.map(async key => {
        const raw = await AsyncStorage.getItem(key);
        return JSON.parse(raw);
      })
    );
    return results.filter(Boolean);
  },

  // --- REVIEWS ---
  async getReviews(venueId) {
    const saved = await AsyncStorage.getItem('es_reviews');
    const all = saved ? JSON.parse(saved) : [...DEMO_REVIEWS];
    return venueId !== undefined ? all.filter(r => r.venueId == venueId) : all;
  },
  async addReview(review) {
    const saved = await AsyncStorage.getItem('es_reviews');
    const all = saved ? JSON.parse(saved) : [...DEMO_REVIEWS];
    review.id = Date.now();
    review.date = new Date().toISOString().slice(0, 10);
    all.push(review);
    await AsyncStorage.setItem('es_reviews', JSON.stringify(all));
    return review;
  },

  // --- FAVORITES ---
  async getFavorites(userId) {
    const saved = await AsyncStorage.getItem('es_fav_' + userId);
    return saved ? JSON.parse(saved) : [];
  },
  async toggleFavorite(userId, venueId) {
    const favs = await this.getFavorites(userId);
    const idx = favs.indexOf(Number(venueId));
    if (idx >= 0) favs.splice(idx, 1);
    else favs.push(Number(venueId));
    await AsyncStorage.setItem('es_fav_' + userId, JSON.stringify(favs));
    return idx < 0;
  },
  async isFavorite(userId, venueId) {
    const favs = await this.getFavorites(userId);
    return favs.includes(Number(venueId));
  },

  // --- RESET (pour re-tester depuis zéro) ---
  // Appelle Store.resetDemo() dans la console Expo ou dans le ProfilScreen pour tout effacer
  async resetDemo() {
    const keys = await AsyncStorage.getAllKeys();
    const esKeys = keys.filter(k => k.startsWith('es_'));
    await AsyncStorage.multiRemove(esKeys);
    console.log('[Store] Données effacées. Redémarre l\'app pour recharger les démos.');
  },
};
