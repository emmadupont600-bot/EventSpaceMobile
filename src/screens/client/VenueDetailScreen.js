import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Image, Dimensions, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { colors, spacing, typography } from '../../theme/colors';
import PhotoCarousel from '../../components/PhotoCarousel';
import RatingStars from '../../components/RatingStars';
import { SEED_REVIEWS } from '../../data/seedData';

const { width: SW } = Dimensions.get('window');
const HERO_H = 300;

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
  const { venue } = route.params || {};
  const [tab, setTab] = useState('info');
  const [favored, setFavored] = useState(false);
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const reviews = (venue?.id ? (require('../../data/seedData').SEED_REVIEWS || []).filter(r => r.venueId === venue.id) : []);
  const annonceurName = venue?.annonceurName || 'Annonceur';
  const initials = annonceurName.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || 'AN';

  const headerOpacity = scrollY.interpolate({
    inputRange: [HERO_H - 80, HERO_H - 40],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const P = COLORS.primary || '#4F46E5';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Sticky header (apparaît au scroll) */}
      <Animated.View style={[
        styles.stickyHeader,
        { paddingTop: insets.top, opacity: headerOpacity },
      ]}>
        <TouchableOpacity style={styles.stickyBackBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.stickyTitle} numberOfLines={1}>{venue?.name || ''}</Text>
        <TouchableOpacity style={styles.stickyFavBtn} onPress={() => setFavored(f => !f)}>
          <Ionicons name={favored ? 'heart' : 'heart-outline'} size={20} color={favored ? '#EF4444' : '#64748B'} />
        </TouchableOpacity>
      </Animated.View>

      {/* Bouton back flottant (visible avant scroll) */}
      <Animated.View style={[
        styles.floatBack,
        { top: insets.top + 10, opacity: headerOpacity.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
      ]}>
        <TouchableOpacity style={styles.floatBackBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatFavBtn} onPress={() => setFavored(f => !f)}>
          <Ionicons name={favored ? 'heart' : 'heart-outline'} size={20} color={favored ? '#EF4444' : '#fff'} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Hero plein écran */}
        <View style={styles.hero}>
          <PhotoCarousel photos={venue?.photos || []} height={HERO_H} />
          {/* Dégradé bas */}
          <View style={styles.heroGradient} pointerEvents="none" />
          {/* Badge type */}
          {!!venue?.type && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{venue.type}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Titre + prix */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{venue?.name || 'Lieu'}</Text>
              <Text style={styles.location}>
                <Ionicons name="location-outline" size={13} color="#64748B" />{' '}
                {venue?.city || venue?.location || ''}
              </Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.priceAmount}>{venue?.price || 0}€</Text>
              <Text style={styles.priceUnit}>/jour</Text>
            </View>
          </View>

          {/* Stats rapides */}
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.statText}>{(venue?.rating || 0).toFixed(1)}</Text>
              <Text style={styles.statSub}>({venue?.reviewCount || venue?.reviews || 0})</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Ionicons name="people-outline" size={14} color="#64748B" />
              <Text style={styles.statText}>{venue?.capacity || 0} pers.</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#22C55E" />
              <Text style={[styles.statText, { color: '#22C55E' }]}>Disponible</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {[['info', 'Infos'], ['avis', `Avis (${reviews.length})`], ['carte', 'Carte']].map(([t, label]) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, tab === t && styles.tabActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* TAB INFO */}
          {tab === 'info' && (
            <>
              {!!venue?.description && (
                <>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.description}>{venue.description}</Text>
                </>
              )}

              {(venue?.amenities || []).length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Équipements</Text>
                  <View style={styles.amenitiesGrid}>
                    {(venue.amenities).map((a, i) => (
                      <View key={i} style={styles.amenityChip}>
                        <Text style={styles.amenityIcon}>{AMENITY_ICONS[a] || '✓'}</Text>
                        <Text style={styles.amenityLabel}>{a}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              <Text style={styles.sectionTitle}>Proposé par</Text>
              <View style={styles.hostCard}>
                <View style={styles.hostAvatarWrap}>
                  {venue?.annonceurAvatar
                    ? <Image source={{ uri: venue.annonceurAvatar }} style={styles.hostAvatar} />
                    : <View style={[styles.hostAvatarFallback, { backgroundColor: P }]}>
                        <Text style={styles.hostInitials}>{initials}</Text>
                      </View>
                  }
                  <View style={styles.hostOnlineDot} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hostName}>{annonceurName}</Text>
                  <Text style={styles.hostSub}>Répond en moins d'1h · ⭐ Hôte vérifié</Text>
                </View>
                <TouchableOpacity
                  style={[styles.msgBtn, { backgroundColor: P + '18' }]}
                  onPress={() => navigation.navigate('Chat', { venue })}
                >
                  <Ionicons name="chatbubble-outline" size={14} color={P} />
                  <Text style={[styles.msgBtnText, { color: P }]}>Message</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* TAB AVIS */}
          {tab === 'avis' && (
            <View style={{ marginTop: 4 }}>
              {reviews.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>⭐</Text>
                  <Text style={styles.emptyTitle}>Pas encore d'avis</Text>
                  <Text style={styles.emptySub}>Soyez le premier à donner votre avis après votre réservation.</Text>
                </View>
              ) : reviews.map(r => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    {r.avatar
                      ? <Image source={{ uri: r.avatar }} style={styles.reviewAvatar} />
                      : <View style={[styles.reviewAvatarFallback, { backgroundColor: P }]}>
                          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{(r.author || '?')[0]}</Text>
                        </View>
                    }
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewAuthor}>{r.author}</Text>
                      <RatingStars rating={r.rating} size={12} />
                    </View>
                    <Text style={styles.reviewDate}>{r.date}</Text>
                  </View>
                  <Text style={styles.reviewComment}>{r.comment}</Text>
                </View>
              ))}
            </View>
          )}

          {/* TAB CARTE */}
          {tab === 'carte' && (
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map-outline" size={48} color="#CBD5E1" />
              <Text style={styles.mapText}>{venue?.location || venue?.city || ''}</Text>
              <Text style={styles.mapSub}>Carte disponible après réservation</Text>
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* CTA fixe */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View>
          <Text style={styles.bottomPrice}>
            {venue?.price || 0}€
            <Text style={styles.bottomPriceUnit}> /jour</Text>
          </Text>
          <Text style={styles.bottomAvail}>✓ Disponible maintenant</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: P, shadowColor: P }]}
          onPress={() => navigation.navigate('Booking', { venue })}
          activeOpacity={0.88}
        >
          <Text style={styles.bookBtnText}>Réserver</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const P = COLORS.primary || '#4F46E5';
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Sticky header
  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12, gap: 12,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  stickyBackBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  stickyTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#0F172A' },
  stickyFavBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },

  // Floating back
  floatBack: {
    position: 'absolute', left: 16, right: 16, zIndex: 99,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  floatBackBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
  },
  floatFavBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
  },

  // Hero
  hero: { position: 'relative' },
  heroGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
    backgroundColor: 'transparent',
  },
  typeBadge: {
    position: 'absolute', bottom: 14, left: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  typeBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  content: { padding: 20 },

  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  name: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 4, lineHeight: 28 },
  location: { fontSize: 13, color: '#64748B' },
  priceBox: { alignItems: 'flex-end' },
  priceAmount: { fontSize: 26, fontWeight: '900', color: P },
  priceUnit: { fontSize: 12, color: '#94A3B8' },

  // Stats
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0',
  },
  statChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  statText: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  statSub: { fontSize: 12, color: '#94A3B8' },
  statDivider: { width: 1, height: 20, backgroundColor: '#E2E8F0' },

  // Tabs
  tabs: {
    flexDirection: 'row', backgroundColor: '#F1F5F9',
    borderRadius: 12, padding: 3, marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '500', color: '#94A3B8' },
  tabTextActive: { color: '#0F172A', fontWeight: '700' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 10, marginTop: 4 },
  description: { fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 20 },

  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  amenityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  amenityIcon: { fontSize: 14 },
  amenityLabel: { fontSize: 13, color: '#475569', fontWeight: '500' },

  // Host
  hostCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16,
  },
  hostAvatarWrap: { position: 'relative' },
  hostAvatar: { width: 48, height: 48, borderRadius: 24 },
  hostAvatarFallback: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  hostInitials: { color: '#fff', fontWeight: '700', fontSize: 16 },
  hostOnlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff',
  },
  hostName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  hostSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  msgBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  msgBtnText: { fontWeight: '600', fontSize: 13 },

  // Reviews
  reviewCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0',
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18 },
  reviewAvatarFallback: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  reviewAuthor: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  reviewDate: { fontSize: 11, color: '#94A3B8' },
  reviewComment: { fontSize: 14, color: '#475569', lineHeight: 21 },

  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  emptySub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', maxWidth: 240 },

  mapPlaceholder: {
    alignItems: 'center', paddingVertical: 48,
    backgroundColor: '#F8FAFC', borderRadius: 16,
    borderWidth: 1, borderColor: '#E2E8F0', gap: 8,
  },
  mapText: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  mapSub: { fontSize: 13, color: '#94A3B8' },

  // CTA bas
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: '#E2E8F0',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 12,
  },
  bottomPrice: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  bottomPriceUnit: { fontSize: 14, fontWeight: '400', color: '#94A3B8' },
  bottomAvail: { fontSize: 12, color: '#22C55E', fontWeight: '600', marginTop: 2 },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 15, borderRadius: 16,
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
