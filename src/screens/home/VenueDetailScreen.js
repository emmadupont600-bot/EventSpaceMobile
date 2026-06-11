/**
 * VenueDetailScreen — fiche lieu "Luxury Minimal" 2026.
 * Hero galerie 16:9 avec points discrets et boutons flottants,
 * sticky header au scroll (nom + Réserver), chips d'infos avec icônes,
 * avis avec avatars initiales colorées + étoiles dorées + "Lire plus",
 * CTA sticky 56px avec prix affiché.
 */
import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Dimensions, Animated, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../../utils/store';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, radius, shadow } from '../../theme/tokens';
import { hapticLight } from '../../utils/haptics';

const W = Dimensions.get('window').width;
const HERO_HEIGHT = Math.round(W * 9 / 16);
const STICKY_TRIGGER = HERO_HEIGHT + 40;

const AVATAR_COLORS = ['#C4714A', '#3D5A4A', '#B8962E', '#7B5E8D', '#4A6FA5'];

function ReviewCard({ review, s, semantic }) {
  const [expanded, setExpanded] = useState(false);
  const text = review.text || '';
  const isLong = text.length > 110;
  const avatarColor = AVATAR_COLORS[(review.author || '?').charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <View style={s.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={[styles.reviewAvatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.reviewAvatarTxt}>{(review.author || '?')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.reviewAuthor}>{review.author || 'Anonyme'}</Text>
          <Text style={s.reviewDate}>{review.date || ''}</Text>
        </View>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(i => (
            <Ionicons key={i} name={i <= (review.rating || 0) ? 'star' : 'star-outline'} size={12}
              color={i <= (review.rating || 0) ? semantic.gold : semantic.border} />
          ))}
        </View>
      </View>
      <Text style={s.reviewText} numberOfLines={expanded ? undefined : 2}>{text}</Text>
      {isLong && (
        <TouchableOpacity onPress={() => setExpanded(e => !e)} hitSlop={{ top: 8, bottom: 8 }}>
          <Text style={s.readMore}>{expanded ? 'Réduire' : 'Lire plus'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function VenueDetailScreen({ route, navigation }) {
  const { venue: initialVenue = null, venueId: routeVenueId } = route.params || {};
  const effectiveVenueId = routeVenueId || initialVenue?.id;
  const { user, favorites, toggleFavorite } = useApp();
  const { semantic, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => themedStyles(semantic, isDark), [semantic, isDark]);

  const [venue, setVenue] = useState(initialVenue || null);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(!initialVenue);
  const scrollY = useRef(new Animated.Value(0)).current;

  const isFav = favorites.includes(effectiveVenueId);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [v, r] = await Promise.all([
          initialVenue ? Promise.resolve(initialVenue) : Store.getVenue(effectiveVenueId),
          effectiveVenueId ? Store.getReviews(effectiveVenueId) : Promise.resolve([]),
        ]);
        if (!mounted) return;
        setVenue(v || initialVenue || null);
        setReviews(r || []);
      } catch (e) {
        console.warn('VenueDetailScreen load error:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [initialVenue, effectiveVenueId]);

  const handleToggleFav = () => {
    if (!user) { navigation.navigate('Auth'); return; }
    hapticLight();
    toggleFavorite(effectiveVenueId);
  };

  const startChat = async () => {
    if (!user || !venue) return;
    const conv = await Store.getOrCreateConv(user.id, venue.ownerId, venue.id, venue.name);
    navigation.navigate('Messages', {
      screen: 'ChatRoom',
      params: { conv, venueName: venue.name, user },
    });
  };

  const goBook = () => {
    if (!user) { navigation.navigate('Auth'); return; }
    navigation.navigate('Booking', { venue, user });
  };

  if (loading && !venue) {
    return (
      <View style={s.loaderWrap}>
        <ActivityIndicator size="large" color={semantic.primary} />
        <Text style={s.loaderText}>Ouverture de l'annonce…</Text>
      </View>
    );
  }

  if (!venue) {
    return (
      <View style={s.loaderWrap}>
        <Ionicons name="alert-circle-outline" size={28} color={semantic.warning} />
        <Text style={s.loaderText}>Impossible de charger cette annonce.</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => navigation.goBack()}>
          <Text style={s.retryBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = (venue.gallery?.length ? venue.gallery : [venue.img]).filter(Boolean);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : (venue.rating || null);

  const stickyOpacity = scrollY.interpolate({
    inputRange: [STICKY_TRIGGER - 40, STICKY_TRIGGER],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const stickyTranslate = scrollY.interpolate({
    inputRange: [STICKY_TRIGGER - 40, STICKY_TRIGGER],
    outputRange: [-8, 0],
    extrapolate: 'clamp',
  });

  const infoChips = [
    venue.capacity ? { icon: 'people-outline', label: `${venue.capacity} pers.` } : null,
    venue.type ? { icon: 'pricetag-outline', label: venue.type } : null,
    venue.price ? { icon: 'time-outline', label: `${venue.price} €/h` } : null,
    venue.city ? { icon: 'location-outline', label: venue.city } : null,
  ].filter(Boolean);

  return (
    <View style={s.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Hero galerie 16:9 */}
        <View style={{ position: 'relative' }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={e => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / W))}
            scrollEventThrottle={16}
          >
            {images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={{ width: W, height: HERO_HEIGHT, resizeMode: 'cover' }} />
            ))}
          </ScrollView>

          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        <View style={{ padding: spacing.lg }}>
          {/* Titre + note */}
          <View style={styles.topRow}>
            {venue.type ? (
              <View style={s.typeBadge}><Text style={s.typeTxt}>{venue.type}</Text></View>
            ) : <View />}
            {avgRating ? (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={semantic.gold} />
                <Text style={s.ratingTxt}> {avgRating} ({reviews.length} avis)</Text>
              </View>
            ) : null}
          </View>

          <Text style={s.name}>{venue.name || ''}</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={semantic.textMuted} />
            <Text style={s.addressTxt}>{venue.address || venue.location || venue.city || ''}</Text>
          </View>

          {/* Chips d'infos */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.lg }}>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {infoChips.map((chip, i) => (
                <View key={i} style={s.infoChip}>
                  <Ionicons name={chip.icon} size={15} color={semantic.primary} />
                  <Text style={s.infoChipTxt}>{chip.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <Text style={s.sectionTitle}>Description</Text>
          <Text style={s.description}>{venue.description || ''}</Text>

          {(venue.amenities || []).length > 0 && (
            <>
              <Text style={s.sectionTitle}>Équipements inclus</Text>
              <View style={styles.amenities}>
                {(venue.amenities || []).map(a => (
                  <View key={a} style={s.amenityChip}>
                    <Ionicons name="checkmark-circle" size={14} color={semantic.secondary} />
                    <Text style={s.amenityTxt}>{a}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <Text style={s.sectionTitle}>Avis ({reviews.length})</Text>
          {reviews.length === 0 && <Text style={s.noReview}>Aucun avis pour le moment.</Text>}
          {reviews.map((r, idx) => (
            <ReviewCard key={r.id || idx} review={r} s={s} semantic={semantic} />
          ))}
        </View>
      </Animated.ScrollView>

      {/* Boutons flottants hero */}
      <TouchableOpacity
        style={[s.floatingBtn, { top: insets.top + 8, left: 16 }]}
        onPress={() => navigation.goBack()}
        accessibilityLabel="Retour"
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.floatingBtn, { top: insets.top + 8, right: 16 }]}
        onPress={handleToggleFav}
        accessibilityLabel={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? '#E8654F' : '#FFFFFF'} />
      </TouchableOpacity>

      {/* Sticky header (apparaît au scroll) */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          s.stickyHeader,
          {
            paddingTop: insets.top + 6,
            opacity: stickyOpacity,
            transform: [{ translateY: stickyTranslate }],
          },
        ]}
      >
        <TouchableOpacity style={s.stickyBack} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={19} color={semantic.text} />
        </TouchableOpacity>
        <Text style={s.stickyName} numberOfLines={1}>{venue.name}</Text>
        <TouchableOpacity style={s.stickyCta} onPress={goBook}>
          <Text style={s.stickyCtaTxt}>Réserver</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* CTA sticky bas */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TouchableOpacity style={s.chatBtn} onPress={startChat} accessibilityLabel="Contacter l'hôte">
          <Ionicons name="chatbubble-outline" size={20} color={semantic.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={s.ctaBtn} onPress={goBook} activeOpacity={0.85}>
          <Text style={s.ctaTxt}>{user ? 'Réserver' : 'Se connecter pour réserver'}</Text>
          {venue.price ? (
            <Text style={s.ctaPrice}>{venue.price} €/h</Text>
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 5,
  },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  starsRow: { flexDirection: 'row', gap: 1 },
});

function themedStyles(c, isDark) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, backgroundColor: c.bg, padding: spacing.lg },
    loaderText: { color: c.textMuted, fontSize: 15, textAlign: 'center' },
    retryBtn: { marginTop: spacing.sm, backgroundColor: c.primarySoft, paddingHorizontal: spacing.lg, height: 44, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
    retryBtnText: { color: c.primary, fontWeight: '700' },
    floatingBtn: {
      position: 'absolute',
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: 'rgba(20,18,16,0.40)',
      alignItems: 'center', justifyContent: 'center',
    },
    stickyHeader: {
      position: 'absolute', top: 0, left: 0, right: 0,
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      backgroundColor: c.surface,
      paddingHorizontal: spacing.md, paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(27,23,19,0.10)',
      ...shadow.sm,
    },
    stickyBack: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    stickyName: { flex: 1, fontSize: 16, fontWeight: '700', color: c.text },
    stickyCta: {
      backgroundColor: c.primary, borderRadius: radius.full,
      paddingHorizontal: spacing.lg, height: 38,
      alignItems: 'center', justifyContent: 'center',
    },
    stickyCtaTxt: { color: c.primaryForeground, fontWeight: '700', fontSize: 13 },
    typeBadge: { backgroundColor: c.primarySoft, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5 },
    typeTxt: { fontSize: 12, color: c.primary, fontWeight: '700', letterSpacing: 0.3 },
    ratingTxt: { fontSize: 13, color: c.textMuted, fontWeight: '600' },
    name: {
      fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
      fontSize: 26, color: c.text, letterSpacing: -0.3, marginTop: spacing.xs,
    },
    addressTxt: { fontSize: 13, color: c.textMuted, flex: 1 },
    infoChip: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: c.surface, borderRadius: radius.sm,
      paddingHorizontal: spacing.md, height: 40,
      ...shadow.xs,
    },
    infoChipTxt: { fontSize: 13, fontWeight: '600', color: c.text },
    sectionTitle: {
      fontSize: 12, fontWeight: '700', color: c.textMuted,
      letterSpacing: 1, textTransform: 'uppercase',
      marginTop: spacing.xl, marginBottom: spacing.md,
    },
    description: { fontSize: 15, color: c.textMuted, lineHeight: 24 },
    amenityChip: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      backgroundColor: c.surface, borderRadius: radius.full,
      paddingHorizontal: 12, paddingVertical: 7,
      ...shadow.xs,
    },
    amenityTxt: { fontSize: 12, fontWeight: '600', color: c.text },
    noReview: { fontSize: 13, color: c.textFaint, fontStyle: 'italic' },
    reviewCard: {
      backgroundColor: c.surface, borderRadius: radius.md,
      padding: spacing.md, marginBottom: spacing.sm,
      ...shadow.xs,
    },
    reviewAuthor: { fontSize: 13, fontWeight: '700', color: c.text },
    reviewDate: { fontSize: 12, color: c.textFaint },
    reviewText: { fontSize: 13, color: c.textMuted, lineHeight: 20 },
    readMore: { fontSize: 13, fontWeight: '600', color: c.primary, marginTop: 6 },
    bottomBar: {
      position: 'absolute', left: 0, right: 0, bottom: 0,
      flexDirection: 'row', gap: spacing.sm,
      backgroundColor: c.surface,
      paddingHorizontal: spacing.lg, paddingTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(27,23,19,0.10)',
    },
    chatBtn: {
      width: 56, height: 56, borderRadius: 14,
      backgroundColor: c.primarySoft,
      alignItems: 'center', justifyContent: 'center',
    },
    ctaBtn: {
      flex: 1, height: 56, borderRadius: 14,
      backgroundColor: c.primary,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    },
    ctaTxt: { color: c.primaryForeground, fontWeight: '700', fontSize: 16 },
    ctaPrice: { color: c.primaryForeground, fontWeight: '500', fontSize: 13, opacity: 0.85 },
  });
}
