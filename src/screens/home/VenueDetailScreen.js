import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Store } from '../../utils/store';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const W = Dimensions.get('window').width;

export default function VenueDetailScreen({ route, navigation }) {
  const { venue: initialVenue = null, venueId: routeVenueId } = route.params || {};
  const effectiveVenueId = routeVenueId || initialVenue?.id;
  const { user } = useApp();

  const [venue, setVenue] = useState(initialVenue || null);
  const [reviews, setReviews] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(!initialVenue);

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
        if (user?.id && effectiveVenueId) {
          const fav = await Store.isFavorite(user.id, effectiveVenueId);
          if (mounted) setIsFav(!!fav);
        }
      } catch (e) {
        console.warn('VenueDetailScreen load error:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [initialVenue, effectiveVenueId]);

  const toggleFav = async () => {
    if (!user) return;
    await Store.toggleFavorite(user.id, effectiveVenueId);
    setIsFav(f => !f);
  };

  const startChat = async () => {
    if (!user || !venue) return;
    const conv = await Store.getOrCreateConv(user.id, venue.ownerId, venue.id, venue.name);
    navigation.navigate('Chat', { conv, venueName: venue.name, user });
  };

  if (loading && !venue) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Ouverture de l'annonce...</Text>
      </View>
    );
  }

  if (!venue) {
    return (
      <View style={styles.loaderWrap}>
        <Ionicons name="alert-circle-outline" size={28} color={colors.warning} />
        <Text style={styles.loaderText}>Impossible de charger cette annonce.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.retryBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = (venue.gallery || [venue.img]).filter(Boolean);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : (venue.rating || '—');

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.gallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={e => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / W))}
            scrollEventThrottle={16}
          >
            {images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={[styles.mainImg, { width: W }]} />
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.dark} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.favBtn} onPress={toggleFav}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? '#ef4444' : colors.dark} />
          </TouchableOpacity>

          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.typeBadge}><Text style={styles.typeTxt}>{venue?.type || ''}</Text></View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.ratingTxt}> {avgRating} ({reviews.length} avis)</Text>
            </View>
          </View>

          <Text style={styles.name}>{venue?.name || ''}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={15} color={colors.mid} />
            <Text style={styles.infoTxt}>{venue?.address || venue?.location || ''}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={15} color={colors.mid} />
            <Text style={styles.infoTxt}>Jusqu'à {venue?.capacity || ''} personnes</Text>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.price}>{venue?.price || ''} <Text style={styles.perH}>€/heure</Text></Text>
            <Text style={styles.priceNote}>Toutes charges incluses</Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{venue?.description || ''}</Text>

          <Text style={styles.sectionTitle}>Équipements inclus</Text>
          <View style={styles.amenities}>
            {(venue.amenities || []).map(a => (
              <View key={a} style={styles.amenityChip}>
                <Ionicons name="checkmark-circle" size={14} color={colors.secondary} />
                <Text style={styles.amenityTxt}>{a}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Avis ({reviews.length})</Text>
          {reviews.length === 0 && <Text style={styles.noReview}>Aucun avis pour le moment.</Text>}
          {reviews.map((r, idx) => (
            <View key={r.id || idx} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}><Text style={styles.reviewAvatarTxt}>{(r.author || '?')[0]}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewAuthor}>{r.author || 'Anonyme'}</Text>
                  <Text style={styles.reviewDate}>{r.date || ''}</Text>
                </View>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Ionicons key={i} name="star" size={12} color={i <= (r.rating || 0) ? colors.warning : colors.border} />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>{r.text || ''}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.chatBtn} onPress={startChat}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          <Text style={styles.chatBtnTxt}>Contacter</Text>
        </TouchableOpacity>
        <Button
          title="Réserver maintenant"
          onPress={() => {
            if (!user) return;
            navigation.navigate('Booking', { venue, user });
          }}
          style={{ flex: 1, marginLeft: spacing.md }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, backgroundColor: colors.bg, padding: spacing.lg },
  loaderText: { color: colors.mid, fontSize: typography.body, textAlign: 'center' },
  retryBtn: { marginTop: spacing.sm, backgroundColor: colors.primaryLight, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full },
  retryBtnText: { color: colors.primary, fontWeight: '700' },
  gallery: { position: 'relative' },
  mainImg: { height: 280, resizeMode: 'cover' },
  backBtn: { position: 'absolute', top: 50, left: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  favBtn: { position: 'absolute', top: 50, right: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  dots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
  content: { padding: spacing.lg },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  typeBadge: { backgroundColor: colors.primaryLight, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  typeTxt: { fontSize: typography.tiny, color: colors.primary, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingTxt: { fontSize: typography.small, color: colors.mid },
  name: { fontSize: typography.h1, fontWeight: '900', color: colors.dark, marginBottom: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, gap: 5 },
  infoTxt: { fontSize: typography.small, color: colors.mid, flex: 1 },
  priceBox: { backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md, marginVertical: spacing.lg },
  price: { fontSize: typography.h2, fontWeight: '900', color: colors.primary },
  perH: { fontSize: typography.body, fontWeight: '400', color: colors.mid },
  priceNote: { fontSize: typography.tiny, color: colors.mid, marginTop: 3 },
  sectionTitle: { fontSize: typography.h3, fontWeight: '700', color: colors.dark, marginBottom: spacing.sm, marginTop: spacing.md },
  description: { fontSize: typography.body, color: colors.mid, lineHeight: 24 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  amenityChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#d1fae5', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
  amenityTxt: { fontSize: typography.tiny, fontWeight: '600', color: '#065f46' },
  noReview: { fontSize: typography.small, color: colors.light, fontStyle: 'italic' },
  reviewCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadow.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  reviewAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarTxt: { color: '#fff', fontWeight: '700' },
  reviewAuthor: { fontSize: typography.small, fontWeight: '700', color: colors.dark },
  reviewDate: { fontSize: typography.tiny, color: colors.light },
  reviewText: { fontSize: typography.small, color: colors.mid, lineHeight: 20 },
  bottomBar: { flexDirection: 'row', backgroundColor: colors.white, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  chatBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 12, gap: 6 },
  chatBtnTxt: { fontSize: typography.small, fontWeight: '700', color: colors.primary },
});
