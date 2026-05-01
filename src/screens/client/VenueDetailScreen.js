import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Image,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import PhotoCarousel from '../../components/PhotoCarousel';
import RatingStars from '../../components/RatingStars';
import { SEED_REVIEWS } from '../../data/seedData';

const AMENITY_ICONS = {
  'Sono': '🔊', 'WiFi': '📶', 'Parking': '🅿️',
  'Cuisine': '🍳', 'Cuisine équipée': '🍳',
  'Climatisation': '❄️', 'Projecteur': '📽️',
  'Jardin': '🌿', 'Piscine': '🏊', 'Traiteur': '🍽️', 'Bar': '🍸',
  'Vidéoprojecteur 4K': '📺', 'Accueil': '🤝', 'Fond blanc': '⬜',
  'Éclairage studio': '💡', 'Vestiaire': '👔', 'Sono DJ': '🎧',
  'Éclairage LED': '🌈', 'Accès PMR': '♿', 'Service bar': '🍹',
  'WiFi fibré': '⚡', 'Parking 30 places': '🅿️', 'Éclairage scène': '🎭',
};

export default function VenueDetailScreen({ route, navigation }) {
  const { venue } = route.params;
  const [tab, setTab] = useState('info');
  const reviews = SEED_REVIEWS.filter(r => r.venueId === venue?.id);
  const annonceurName = venue?.annonceurName || 'Annonceur';
  const initials = annonceurName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Carousel photos */}
        <View>
          <PhotoCarousel photos={venue?.photos || []} height={280} />
          <SafeAreaView style={styles.headerOverlay}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          {/* Titre + Prix */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{venue?.name || 'Lieu'}</Text>
              <Text style={styles.location}>📍 {venue?.location || ''}</Text>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceAmount}>{venue?.price || 0}€</Text>
              <Text style={styles.priceUnit}>/jour</Text>
            </View>
          </View>

          {/* Rating + Capacité */}
          <View style={styles.ratingRow}>
            <RatingStars rating={venue?.rating || 0} count={venue?.reviewCount || venue?.reviews || 0} size={18} />
            <View style={styles.capacityBadge}>
              <Text style={styles.capacityText}>👥 {venue?.capacity || 0} pers. max</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {['info', 'avis', 'carte'].map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, tab === t && styles.tabActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === 'info' ? 'Infos' : t === 'avis' ? `Avis (${reviews.length})` : 'Carte'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* TAB: Info */}
          {tab === 'info' && (
            <>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{venue?.description || ''}</Text>

              <Text style={styles.sectionTitle}>Équipements</Text>
              <View style={styles.amenitiesGrid}>
                {(venue?.amenities || []).map((a, i) => (
                  <View key={i} style={styles.amenityChip}>
                    <Text style={styles.amenityIcon}>{AMENITY_ICONS[a] || '✓'}</Text>
                    <Text style={styles.amenityLabel}>{a}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Proposé par</Text>
              <View style={styles.hostCard}>
                {venue?.annonceurAvatar ? (
                  <Image
                    source={{ uri: venue.annonceurAvatar }}
                    style={styles.hostAvatar}
                  />
                ) : (
                  <View style={styles.hostAvatarFallback}>
                    <Text style={styles.hostInitials}>{initials}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.hostName}>{annonceurName}</Text>
                  <Text style={styles.hostSub}>Répond généralement en moins d\'1h</Text>
                </View>
                <TouchableOpacity
                  style={styles.msgBtn}
                  onPress={() => navigation.navigate('Chat', { venue })}
                >
                  <Text style={styles.msgBtnText}>Message</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* TAB: Avis */}
          {tab === 'avis' && (
            <View style={{ marginTop: 8 }}>
              {reviews.length === 0 ? (
                <View style={styles.emptyReviews}>
                  <Text style={styles.emptyEmoji}>⭐</Text>
                  <Text style={styles.emptyTitle}>Pas encore d\'avis</Text>
                  <Text style={styles.emptySub}>Soyez le premier à donner votre avis après votre réservation.</Text>
                </View>
              ) : reviews.map(r => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image source={{ uri: r.avatar }} style={styles.reviewAvatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewAuthor}>{r.author}</Text>
                      <RatingStars rating={r.rating} size={13} />
                    </View>
                    <Text style={styles.reviewDate}>{r.date}</Text>
                  </View>
                  <Text style={styles.reviewComment}>{r.comment}</Text>
                </View>
              ))}
            </View>
          )}

          {/* TAB: Carte */}
          {tab === 'carte' && (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapEmoji}>🗺️</Text>
              <Text style={styles.mapText}>{venue?.location}</Text>
              <Text style={styles.mapSub}>Carte disponible après réservation</Text>
            </View>
          )}

          <View style={{ height: 110 }} />
        </View>
      </ScrollView>

      {/* CTA fixe en bas */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomPrice}>
            {venue?.price || 0}€{' '}
            <Text style={styles.bottomPriceUnit}>/ jour</Text>
          </Text>
          <Text style={styles.bottomAvail}>✓ Disponible</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate('Booking', { venue })}
        >
          <Text style={styles.bookBtnText}>Réserver ce lieu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const P = COLORS.primary || '#4F46E5';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  backBtn: {
    margin: 16, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: '#fff', fontSize: 22, fontWeight: '700' },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  name: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  location: { fontSize: 14, color: '#64748B' },
  priceTag: { alignItems: 'flex-end' },
  priceAmount: { fontSize: 24, fontWeight: '800', color: P },
  priceUnit: { fontSize: 12, color: '#94A3B8' },
  ratingRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  capacityBadge: {
    backgroundColor: '#EFF6FF', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20,
  },
  capacityText: { fontSize: 13, color: '#3B82F6', fontWeight: '600' },
  tabs: {
    flexDirection: 'row', backgroundColor: '#F1F5F9',
    borderRadius: 12, padding: 3, marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.08,
    shadowRadius: 4, elevation: 2,
  },
  tabText: { fontSize: 14, fontWeight: '500', color: '#94A3B8' },
  tabTextActive: { color: '#0F172A', fontWeight: '700' },
  sectionTitle: {
    fontSize: 17, fontWeight: '700', color: '#0F172A',
    marginBottom: 10, marginTop: 4,
  },
  description: { fontSize: 15, color: '#475569', lineHeight: 23, marginBottom: 20 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  amenityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  amenityIcon: { fontSize: 14 },
  amenityLabel: { fontSize: 13, color: '#475569', fontWeight: '500' },
  hostCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16,
  },
  hostAvatar: { width: 48, height: 48, borderRadius: 24 },
  hostAvatarFallback: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: P, alignItems: 'center', justifyContent: 'center',
  },
  hostInitials: { color: '#fff', fontWeight: '700', fontSize: 16 },
  hostName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  hostSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  msgBtn: {
    backgroundColor: '#EEF2FF', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 20,
  },
  msgBtnText: { color: P, fontWeight: '600', fontSize: 14 },
  reviewCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0',
  },
  reviewHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 8,
  },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18 },
  reviewAuthor: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  reviewDate: { fontSize: 11, color: '#94A3B8' },
  reviewComment: { fontSize: 14, color: '#475569', lineHeight: 21 },
  emptyReviews: { alignItems: 'center', paddingVertical: 32 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  emptySub: {
    fontSize: 14, color: '#94A3B8', textAlign: 'center', maxWidth: 240,
  },
  mapPlaceholder: {
    alignItems: 'center', paddingVertical: 40,
    backgroundColor: '#F1F5F9', borderRadius: 16,
  },
  mapEmoji: { fontSize: 48, marginBottom: 12 },
  mapText: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  mapSub: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: 20, paddingBottom: 34,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: '#E2E8F0',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 10,
  },
  bottomPrice: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  bottomPriceUnit: { fontSize: 14, fontWeight: '400', color: '#94A3B8' },
  bottomAvail: { fontSize: 12, color: '#22C55E', fontWeight: '600', marginTop: 2 },
  bookBtn: {
    backgroundColor: P,
    paddingHorizontal: 28, paddingVertical: 16, borderRadius: 16,
    shadowColor: P, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
