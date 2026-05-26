import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../../utils/store';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/Toast';
import { colors, spacing, radius, shadow } from '../../theme/colors';

const W = Dimensions.get('window').width;

export default function VenueDetailScreen({ route, navigation }) {
  const { venue: initialVenue = null, venueId: routeVenueId } = route.params || {};
  const effectiveVenueId = routeVenueId || initialVenue?.id;
  const { user, favorites, toggleFavorite } = useApp();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [venue, setVenue] = useState(initialVenue || null);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(!initialVenue);
  const [reviewOpen, setReviewOpen] = useState(false);

  const isFav = favorites.includes(effectiveVenueId);

  const loadReviews = useCallback(async () => {
    if (!effectiveVenueId) return;
    try {
      const r = await Store.getReviews(effectiveVenueId);
      setReviews(r || []);
    } catch {}
  }, [effectiveVenueId]);

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
    toggleFavorite(effectiveVenueId);
  };

  const startChat = async () => {
    if (!user || !venue) return;
    try {
      const conv = await Store.getOrCreateConv(user.id, venue.ownerId, venue.id, venue.name);
      navigation.navigate('Messages', {
        screen: 'ChatRoom',
        params: { conv, venueName: venue.name, user },
      });
    } catch (e) {
      toast.error("Impossible d'ouvrir la conversation");
    }
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
    : (venue.rating || 0).toFixed(1);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Gallery */}
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

          <LinearGradient colors={['rgba(15,23,42,0.4)', 'transparent']} style={styles.galleryGradient} pointerEvents="none" />

          <TouchableOpacity style={[styles.headerBtn, { left: 16, top: insets.top + 6 }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.headerBtn, { right: 16, top: insets.top + 6 }]} onPress={handleToggleFav}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? colors.error : colors.text} />
          </TouchableOpacity>

          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
              ))}
            </View>
          )}
          {images.length > 1 && (
            <View style={styles.imgCounter}>
              <Text style={styles.imgCounterTxt}>{activeImg + 1} / {images.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Title row */}
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.typeBadge}><Text style={styles.typeTxt}>{venue?.type || ''}</Text></View>
              <Text style={styles.name}>{venue?.name || ''}</Text>
            </View>
            <View style={styles.ratingChip}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.ratingTxt}>{avgRating}</Text>
              <Text style={styles.ratingCount}> · {reviews.length || venue.reviewCount || 0}</Text>
            </View>
          </View>

          {/* Meta */}
          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.metaTxt} numberOfLines={2}>{venue?.address || venue?.location || ''}</Text>
            </View>
            <View style={styles.metaSep} />
            <View style={styles.metaRow}>
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.metaTxt}>Jusqu'à {venue?.capacity || '—'} personnes</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceBox}>
            <View>
              <Text style={styles.priceLabel}>Prix</Text>
              <Text style={styles.price}>
                {venue?.price?.toLocaleString('fr-FR') || '—'}
                <Text style={styles.perH}> €/heure</Text>
              </Text>
            </View>
            <View style={styles.priceTagBox}>
              <Text style={styles.priceTagTxt}>Charges incluses</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{venue?.description || ''}</Text>

          {/* Amenities */}
          <Text style={styles.sectionTitle}>Équipements</Text>
          <View style={styles.amenities}>
            {(venue.amenities || []).map(a => (
              <View key={a} style={styles.amenityChip}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.amenityTxt}>{a}</Text>
              </View>
            ))}
          </View>

          {/* Reviews */}
          <View style={styles.reviewHeaderRow}>
            <Text style={styles.sectionTitle}>Avis ({reviews.length})</Text>
            {user && (
              <TouchableOpacity style={styles.writeReviewBtn} onPress={() => setReviewOpen(true)}>
                <Ionicons name="create-outline" size={14} color={colors.primary} />
                <Text style={styles.writeReviewTxt}>Écrire un avis</Text>
              </TouchableOpacity>
            )}
          </View>
          {reviews.length === 0 && <Text style={styles.noReview}>Soyez le premier à laisser un avis ✨</Text>}
          {reviews.map((r, idx) => (
            <View key={r.id || idx} style={styles.reviewCard}>
              <View style={styles.reviewHead}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarTxt}>{(r.author || '?')[0]?.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewAuthor}>{r.author || 'Anonyme'}</Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Ionicons key={i} name="star" size={11} color={i <= (r.rating || 0) ? colors.warning : colors.border} />
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.reviewText}>{r.text || ''}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || spacing.md }]}>
        <TouchableOpacity style={styles.chatBtn} onPress={startChat}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => {
            if (!user) { navigation.navigate('Auth'); return; }
            navigation.navigate('Booking', { venue, user });
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.bookBtnTxt}>{user ? 'Réserver' : 'Connectez-vous pour réserver'}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ReviewModal
        visible={reviewOpen}
        onClose={() => setReviewOpen(false)}
        venue={venue}
        user={user}
        onSubmitted={async () => { setReviewOpen(false); toast.success('Merci pour votre avis !'); await loadReviews(); }}
        onError={(e) => toast.error(e || 'Impossible d\'enregistrer l\'avis')}
      />
    </View>
  );
}

function ReviewModal({ visible, onClose, venue, user, onSubmitted, onError }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!text.trim()) return onError('Écrivez quelques mots');
    setSubmitting(true);
    try {
      await Store.addReview({
        venueId: venue.id,
        userId: user.id,
        userName: user.name || 'Anonyme',
        rating,
        comment: text.trim(),
      });
      setText('');
      setRating(5);
      onSubmitted?.();
    } catch (e) {
      onError(e?.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={mStyles.overlay} activeOpacity={1} onPress={onClose} />
        <View style={mStyles.sheet}>
          <View style={mStyles.handle} />
          <Text style={mStyles.title}>Donnez votre avis</Text>
          <Text style={mStyles.sub}>{venue?.name}</Text>

          <View style={mStyles.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)} activeOpacity={0.6}>
                <Ionicons name="star" size={36} color={i <= rating ? colors.warning : colors.border} />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={mStyles.ratingLabel}>{['', 'Décevant', 'Moyen', 'Bien', 'Très bien', 'Excellent'][rating]}</Text>

          <TextInput
            style={mStyles.input}
            placeholder="Partagez votre expérience..."
            placeholderTextColor={colors.textLight}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[mStyles.submitBtn, (!text.trim() || submitting) && mStyles.submitBtnDisabled]}
            onPress={submit}
            disabled={!text.trim() || submitting}
            activeOpacity={0.9}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={mStyles.submitTxt}>Publier l'avis</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loaderWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: spacing.md, backgroundColor: colors.background, padding: spacing.lg,
  },
  loaderText: { color: colors.textSecondary, fontSize: 15, textAlign: 'center' },
  retryBtn: {
    marginTop: spacing.sm, backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full,
  },
  retryBtnText: { color: colors.primary, fontWeight: '700' },

  gallery: { position: 'relative' },
  mainImg: { height: 320, resizeMode: 'cover' },
  galleryGradient: { position: 'absolute', left: 0, right: 0, top: 0, height: 100 },
  headerBtn: {
    position: 'absolute',
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
    ...shadow.sm,
  },
  dots: {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 22 },
  imgCounter: {
    position: 'absolute', top: 16, right: 70,
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  imgCounterTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },

  content: { padding: spacing.lg, gap: spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: 4 },
  typeBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  typeTxt: { fontSize: 11, color: colors.primary, fontWeight: '800', letterSpacing: 0.3 },
  name: { fontSize: 24, fontWeight: '900', color: colors.text, marginTop: 6, letterSpacing: -0.4 },
  ratingChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  ratingTxt: { fontSize: 14, fontWeight: '900', color: colors.warningDark },
  ratingCount: { fontSize: 11, color: colors.warningDark, fontWeight: '600' },

  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaTxt: { fontSize: 14, color: colors.text, flex: 1 },
  metaSep: { height: 1, backgroundColor: colors.borderLight, marginVertical: 10 },

  priceBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg, padding: spacing.lg, marginVertical: spacing.sm,
  },
  priceLabel: { fontSize: 11, fontWeight: '700', color: colors.primary, letterSpacing: 0.3, textTransform: 'uppercase' },
  price: { fontSize: 26, fontWeight: '900', color: colors.primary, letterSpacing: -0.5, marginTop: 2 },
  perH: { fontSize: 14, fontWeight: '500', color: colors.textSecondary },
  priceTagBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  priceTagTxt: { fontSize: 11, fontWeight: '700', color: colors.primary },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: spacing.md, marginBottom: 6, letterSpacing: -0.2 },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  amenityChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 6, gap: 4,
  },
  amenityTxt: { fontSize: 12, fontWeight: '700', color: colors.successDark },

  reviewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, marginBottom: 6 },
  writeReviewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  writeReviewTxt: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  noReview: { fontSize: 13, color: colors.textLight, fontStyle: 'italic', paddingVertical: 8 },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  reviewHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarTxt: { color: '#fff', fontWeight: '900', fontSize: 14 },
  reviewAuthor: { fontSize: 13, fontWeight: '800', color: colors.text },
  reviewStars: { flexDirection: 'row', gap: 1, marginTop: 1 },
  reviewText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },

  bottomBar: {
    flexDirection: 'row', gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  chatBtn: {
    width: 52, height: 52, borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  bookBtn: {
    flex: 1, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 14, ...shadow.primary,
  },
  bookBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

const mStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: spacing.xl, paddingBottom: 40,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.lg },
  title: { fontSize: 20, fontWeight: '900', color: colors.text, textAlign: 'center', letterSpacing: -0.3 },
  sub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginBottom: 6 },
  ratingLabel: { fontSize: 13, fontWeight: '700', color: colors.warningDark, textAlign: 'center', marginBottom: spacing.lg },
  input: {
    backgroundColor: colors.background, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    padding: spacing.md, fontSize: 14, color: colors.text,
    minHeight: 100, marginBottom: spacing.lg,
  },
  submitBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 14, alignItems: 'center', ...shadow.primary,
  },
  submitBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  submitTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
