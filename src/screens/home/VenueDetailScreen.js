import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../../utils/store';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const W = Dimensions.get('window').width;

export default function VenueDetailScreen({ route, navigation }) {
  const { venueId } = route.params;
  const [venue, setVenue] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      const v = await Store.getVenue(venueId);
      const r = await Store.getReviews(venueId);
      const u = await Store.getCurrentUser();
      setVenue(v);
      setReviews(r || []);
      setUser(u);
      if (u) setIsFav(await Store.isFavorite(u.id, venueId));
    })();
  }, []);

  const toggleFav = async () => {
    if (!user) return navigation.navigate('Login');
    await Store.toggleFavorite(user.id, venueId);
    setIsFav(f => !f);
  };

  const startChat = async () => {
    if (!user) return navigation.navigate('Login');
    const conv = await Store.getOrCreateConv(user.id, venue.ownerId, venue.id, venue.name);
    navigation.navigate('Chat', { conv, venueName: venue.name, user });
  };

  if (!venue) return (
    <View style={styles.loading}>
      <StatusBar barStyle="dark-content" />
      <Ionicons name="hourglass-outline" size={32} color={colors.mid} />
      <Text style={styles.loadingText}>Chargement...</Text>
    </View>
  );

  // Sécurisation annonceurName — pas de crash si undefined
  const annonceurName = venue?.annonceurName || 'Annonceur';
  const annonceurInitials = annonceurName.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || 'A';

  // Sécurisation amenities
  const amenities = venue?.amenities || [];

  // Rating moyen
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : (venue?.rating || '—');

  // Images gallery sécurisée
  const images = (venue?.gallery || (venue?.img ? [venue.img] : [])).filter(Boolean);
  const hasImages = images.length > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
        {/* ─── Gallery ─── */}
        <View style={styles.gallery}>
          {hasImages ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={e => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / W))}
              scrollEventThrottle={16}
            >
              {images.map((img, i) => (
                <Image
                  key={i}
                  source={{ uri: img }}
                  style={[styles.mainImg, { width: W }]}
                  contentFit="cover"
                  transition={150}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.mainImg, styles.imgFallback]}>
              <Ionicons name="image-outline" size={48} color={colors.border} />
              <Text style={styles.imgFallbackText}>Aucune photo disponible</Text>
            </View>
          )}

          {/* Overlay gradient haut */}
          <View style={[styles.galleryOverlayTop, { height: insets.top + 56 }]} pointerEvents="none" />

          {/* Boutons back + fav — positionnés sous le notch via insets.top */}
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 10 }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back" size={20} color={colors.dark} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.favBtn, { top: insets.top + 10 }, isFav && styles.favBtnActive]}
            onPress={toggleFav}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={20}
              color={isFav ? '#ef4444' : colors.dark}
            />
          </TouchableOpacity>

          {/* Dots pagination */}
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        {/* ─── Contenu ─── */}
        <View style={styles.content}>

          {/* Badge type + rating */}
          <View style={styles.topRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeTxt}>{venue?.type || ''}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color={colors.warning} />
              <Text style={styles.ratingTxt}> {avgRating}</Text>
              <Text style={styles.ratingCount}> ({reviews.length} avis)</Text>
            </View>
          </View>

          {/* Nom */}
          <Text style={styles.name}>{venue?.name || ''}</Text>

          {/* Infos lieu */}
          <View style={styles.infoGroup}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="location-outline" size={14} color={colors.primary} />
              </View>
              <Text style={styles.infoTxt} numberOfLines={2}>{venue?.address || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="people-outline" size={14} color={colors.primary} />
              </View>
              <Text style={styles.infoTxt}>Jusqu'à {venue?.capacity || '—'} personnes</Text>
            </View>
          </View>

          {/* Prix */}
          <View style={styles.priceBox}>
            <View>
              <Text style={styles.priceLabel}>Tarif</Text>
              <Text style={styles.price}>
                {venue?.price || '—'} <Text style={styles.perH}>€/heure</Text>
              </Text>
            </View>
            <View style={styles.priceNote}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.priceNoteText}>Charges incluses</Text>
            </View>
          </View>

          {/* Annonceur */}
          <View style={styles.annonceurCard}>
            <View style={styles.annonceurAvatar}>
              <Text style={styles.annonceurInitials}>{annonceurInitials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.annonceurName}>{annonceurName}</Text>
              <Text style={styles.annonceurSub}>Propriétaire du lieu</Text>
            </View>
            <TouchableOpacity style={styles.annonceurChatBtn} onPress={startChat}>
              <Ionicons name="chatbubble-outline" size={15} color={colors.primary} />
              <Text style={styles.annonceurChatTxt}>Contacter</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{venue?.description || 'Aucune description disponible.'}</Text>

          {/* Équipements */}
          {amenities.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Équipements inclus</Text>
              <View style={styles.amenities}>
                {amenities.map((a, i) => (
                  <View key={`${a}-${i}`} style={styles.amenityChip}>
                    <Ionicons name="checkmark-circle" size={13} color={colors.success} />
                    <Text style={styles.amenityTxt}>{a}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Avis */}
          <Text style={styles.sectionTitle}>Avis ({reviews.length})</Text>
          {reviews.length === 0 ? (
            <View style={styles.noReviewWrap}>
              <Ionicons name="chatbubbles-outline" size={24} color={colors.border} />
              <Text style={styles.noReview}>Aucun avis pour le moment.</Text>
            </View>
          ) : (
            reviews.map((r, idx) => (
              <View key={r.id || idx} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarTxt}>
                      {(r.author || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewAuthor}>{r.author || 'Anonyme'}</Text>
                    <Text style={styles.reviewDate}>{r.date || ''}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {[1,2,3,4,5].map(i => (
                      <Ionicons
                        key={i}
                        name="star"
                        size={11}
                        color={i <= (r.rating || 0) ? colors.warning : colors.border}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewText}>{r.text || ''}</Text>
              </View>
            ))
          )}

          {/* Espace pour la bottomBar */}
          <View style={{ height: 20 }} />
        </View>
      </ScrollView>

      {/* ─── Bottom bar fixe — respecte insets.bottom ─── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <Button
          title="Réserver maintenant"
          onPress={() => {
            if (!user) return navigation.navigate('Login');
            navigation.navigate('Booking', { venue, user });
          }}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 12, backgroundColor: colors.bg,
  },
  loadingText: { fontSize: typography.body, color: colors.mid },

  // Gallery
  gallery: { position: 'relative' },
  mainImg: { height: 300 },
  imgFallback: {
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imgFallbackText: { fontSize: typography.small, color: colors.light },
  galleryOverlayTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.sm,
  },
  favBtn: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.sm,
  },
  favBtnActive: { backgroundColor: '#FFF1F2' },
  dots: {
    position: 'absolute',
    bottom: 14, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: { backgroundColor: '#fff', width: 20 },

  // Content
  content: { padding: spacing.lg },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  typeTxt: { fontSize: typography.tiny, color: colors.primary, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingTxt: { fontSize: typography.small, fontWeight: '700', color: colors.dark },
  ratingCount: { fontSize: typography.tiny, color: colors.mid },
  name: {
    fontSize: typography.h1,
    fontWeight: '900',
    color: colors.dark,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
    lineHeight: 30,
  },

  // Info group
  infoGroup: {
    gap: 8,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoIcon: {
    width: 26, height: 26,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  infoTxt: {
    flex: 1,
    fontSize: typography.small,
    color: colors.mid,
    lineHeight: 20,
    paddingTop: 4,
  },

  // Prix
  priceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  priceLabel: { fontSize: typography.tiny, color: colors.mid, fontWeight: '600', marginBottom: 2 },
  price: { fontSize: typography.h2, fontWeight: '900', color: colors.primary },
  perH: { fontSize: typography.small, fontWeight: '400', color: colors.mid },
  priceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.successLight,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priceNoteText: { fontSize: typography.tiny, color: '#065f46', fontWeight: '600' },

  // Annonceur
  annonceurCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.xs,
  },
  annonceurAvatar: {
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  annonceurInitials: { color: '#fff', fontWeight: '800', fontSize: typography.small },
  annonceurName: { fontSize: typography.body, fontWeight: '700', color: colors.dark },
  annonceurSub: { fontSize: typography.tiny, color: colors.mid, marginTop: 1 },
  annonceurChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  annonceurChatTxt: { fontSize: typography.tiny, fontWeight: '700', color: colors.primary },

  // Sections
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: '800',
    color: colors.dark,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  description: {
    fontSize: typography.body,
    color: colors.mid,
    lineHeight: 24,
  },

  // Amenities
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  amenityTxt: { fontSize: typography.tiny, fontWeight: '600', color: '#065f46' },

  // Reviews
  noReviewWrap: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.xl,
  },
  noReview: { fontSize: typography.small, color: colors.light, fontStyle: 'italic' },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.xs,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  reviewAvatar: {
    width: 34, height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryMedium,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  reviewAvatarTxt: { color: '#fff', fontWeight: '700', fontSize: typography.small },
  reviewAuthor: { fontSize: typography.small, fontWeight: '700', color: colors.dark },
  reviewDate: { fontSize: typography.tiny, color: colors.light, marginTop: 1 },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewText: {
    fontSize: typography.small,
    color: colors.mid,
    lineHeight: 20,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadow.md,
    shadowColor: '#000',
  },
});
