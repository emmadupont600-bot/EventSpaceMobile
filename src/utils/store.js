/**
 * Store — façade de compatibilité.
 *
 * La logique de données est découpée en services dédiés :
 *   - src/services/authService.ts         (auth + profil)
 *   - src/services/venueService.ts        (lieux + cache + disponibilités)
 *   - src/services/reservationService.ts  (réservations + promos + stats)
 *   - src/services/messagingService.ts    (conversations + messages)
 *   - src/services/reviewService.ts       (avis + favoris)
 *
 * Les écrans existants continuent d'utiliser `Store.xxx()` ; le nouveau code
 * doit importer les services directement.
 */
import * as authService from '../services/authService';
import * as venueService from '../services/venueService';
import * as reservationService from '../services/reservationService';
import * as messagingService from '../services/messagingService';
import * as reviewService from '../services/reviewService';
import { isUUID } from '../services/serviceUtils';

export const Store = {
  // ─── AUTH ──────────────────────────────────────────────────────────────────
  getCurrentUser: authService.getCurrentUser,
  onAuthStateChange: authService.onAuthStateChange,
  login: authService.login,
  register: authService.register,
  logout: authService.logout,
  updateUserProfile: authService.updateUserProfile,

  // ─── VENUES ────────────────────────────────────────────────────────────────
  invalidateVenuesCache: venueService.invalidateVenuesCache,
  getVenues: venueService.getVenues,
  getVenuesByOwner: venueService.getVenuesByOwner,
  getVenue: venueService.getVenue,
  addVenue: venueService.addVenue,
  updateVenue: venueService.updateVenue,
  deleteVenue: venueService.deleteVenue,
  saveVenues: venueService.saveVenues,
  updateVenueCover: venueService.updateVenueCover,
  addVenueGalleryPhoto: venueService.addVenueGalleryPhoto,
  removeVenueGalleryPhoto: venueService.removeVenueGalleryPhoto,
  reorderVenueGallery: venueService.reorderVenueGallery,
  getBlockedDates: venueService.getBlockedDates,
  addBlockedDate: venueService.addBlockedDate,
  removeBlockedDate: venueService.removeBlockedDate,
  getAvailableVenueIds: venueService.getAvailableVenueIds,

  // ─── RESERVATIONS ──────────────────────────────────────────────────────────
  getReservations: reservationService.getReservations,
  getReservationsByUser: reservationService.getReservationsByUser,
  getReservationsByOwner: reservationService.getReservationsByOwner,
  addReservation: reservationService.addReservation,
  updateReservation: reservationService.updateReservation,
  cancelReservation: reservationService.cancelReservation,
  isVenueAvailable: reservationService.isVenueAvailable,
  validatePromoCode: reservationService.validatePromoCode,
  incrementPromoUse: reservationService.incrementPromoUse,
  getOwnerStats: reservationService.getOwnerStats,

  // ─── MESSAGES / CONVERSATIONS ──────────────────────────────────────────────
  getOrCreateConv: messagingService.getOrCreateConv,
  getAllConversations: messagingService.getAllConversations,
  getMessages: messagingService.getMessages,
  addMessage: messagingService.addMessage,

  // ─── REVIEWS / FAVORITES ───────────────────────────────────────────────────
  getReviews: reviewService.getReviews,
  getUserReviewForVenue: reviewService.getUserReviewForVenue,
  addReview: reviewService.addReview,
  getFavorites: reviewService.getFavorites,
  toggleFavorite: reviewService.toggleFavorite,
  isFavorite: reviewService.isFavorite,

  async resetDemo() {
    console.warn("[Store] resetDemo() n'a pas d'effet en mode Supabase.");
  },
};

// Exporté pour les tests unitaires (compat)
export { isUUID };
export { normalizeVenue } from '../services/venueService';
export { normalizeReservation } from '../services/reservationService';
