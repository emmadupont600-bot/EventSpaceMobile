import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadow } from '../theme/colors';

export default function VenueCard({ venue, onPress, onFav, isFav, compact = false }) {
  if (compact) return <CompactCard venue={venue} onPress={onPress} onFav={onFav} isFav={isFav} />;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.imgWrap}>
        {venue?.img ? (
          <Image source={{ uri: venue.img }} style={styles.img} />
        ) : (
          <View style={[styles.img, styles.imgFallback]}>
            <Ionicons name="image-outline" size={32} color={colors.textLight} />
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(15,23,42,0.55)']}
          style={styles.imgGradient}
          pointerEvents="none"
        />
        {venue?.coupDeCoeur && (
          <View style={styles.coupBadge}>
            <Ionicons name="star" size={11} color="#fff" />
            <Text style={styles.coupBadgeTxt}>Coup de cœur</Text>
          </View>
        )}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeTxt}>{venue?.type || ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.favBtn}
          onPress={onFav}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={20}
            color={isFav ? colors.error : '#fff'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{venue?.name || ''}</Text>
          <View style={styles.ratingChip}>
            <Ionicons name="star" size={12} color={colors.warning} />
            <Text style={styles.rating}>{(venue?.rating || 0).toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.meta} numberOfLines={1}>{venue?.city || venue?.location || ''}</Text>
          <View style={styles.dot} />
          <Ionicons name="people-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.meta}>{venue?.capacity || '—'} pers.</Text>
        </View>
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>
              {venue?.price?.toLocaleString('fr-FR') || '—'} €
              <Text style={styles.perH}> /heure</Text>
            </Text>
          </View>
          <View style={styles.reviewChip}>
            <Text style={styles.reviewChipTxt}>{venue?.reviewCount || 0} avis</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function CompactCard({ venue, onPress, onFav, isFav }) {
  return (
    <TouchableOpacity style={cStyles.card} onPress={onPress} activeOpacity={0.9}>
      {venue?.img ? (
        <Image source={{ uri: venue.img }} style={cStyles.img} />
      ) : (
        <View style={[cStyles.img, cStyles.imgFallback]}>
          <Ionicons name="image-outline" size={20} color={colors.textLight} />
        </View>
      )}
      <View style={cStyles.body}>
        <Text style={cStyles.name} numberOfLines={1}>{venue?.name}</Text>
        <Text style={cStyles.meta} numberOfLines={1}>{venue?.city} · {venue?.capacity} pers.</Text>
        <Text style={cStyles.price}>{venue?.price?.toLocaleString('fr-FR')} €/h</Text>
      </View>
      <TouchableOpacity onPress={onFav} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={cStyles.favBtn}>
        <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={18} color={isFav ? colors.error : colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadow.md,
  },
  imgWrap: { position: 'relative' },
  img: { width: '100%', height: 200, resizeMode: 'cover' },
  imgFallback: { backgroundColor: colors.borderLight, justifyContent: 'center', alignItems: 'center' },
  imgGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 80 },
  typeBadge: {
    position: 'absolute', bottom: 12, left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  typeBadgeTxt: { fontSize: 11, color: colors.text, fontWeight: '800', letterSpacing: 0.3 },
  coupBadge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.warning,
    borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  coupBadgeTxt: { fontSize: 11, color: '#fff', fontWeight: '800', letterSpacing: 0.3 },
  favBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(15,23,42,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  body: { padding: spacing.md, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: 17, fontWeight: '800', color: colors.text, letterSpacing: -0.2 },
  ratingChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.warningLight,
    borderRadius: radius.sm,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  rating: { fontSize: 12, fontWeight: '800', color: colors.warningDark },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  meta: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textLight, marginHorizontal: 4 },
  priceRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 6, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  price: { fontSize: 17, fontWeight: '900', color: colors.primary, letterSpacing: -0.3 },
  perH: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  reviewChip: {
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  reviewChipTxt: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
});

const cStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    gap: 10,
    ...shadow.xs,
  },
  img: { width: 64, height: 64, borderRadius: radius.md, resizeMode: 'cover' },
  imgFallback: { backgroundColor: colors.borderLight, justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: colors.text },
  meta: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  price: { fontSize: 13, fontWeight: '800', color: colors.primary, marginTop: 4 },
  favBtn: { padding: 4 },
});
