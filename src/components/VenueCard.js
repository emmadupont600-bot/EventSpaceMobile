import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadow, typography } from '../theme/colors';
import PressableScale from './PressableScale';
import { hapticSelection } from '../utils/haptics';

export default function VenueCard({ venue, onPress, onFav, isFav }) {
  const handleFav = () => {
    hapticSelection();
    onFav && onFav();
  };

  return (
    <PressableScale style={styles.card} onPress={onPress} scaleTo={0.975} haptic="none">
      <View style={styles.imgWrap}>
        {venue?.img ? (
          <Image source={{ uri: venue.img }} style={styles.img} />
        ) : (
          <View style={[styles.img, styles.imgFallback]}>
            <Ionicons name="image-outline" size={32} color={colors.light} />
          </View>
        )}

        <LinearGradient
          colors={['rgba(28,25,23,0)', 'rgba(28,25,23,0.55)']}
          style={styles.imgOverlay}
          pointerEvents="none"
        />

        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>{venue?.type || ''}</Text>
        </View>

        <Pressable
          style={styles.favBtn}
          onPress={handleFav}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={18}
            color={isFav ? '#FB7185' : '#fff'}
          />
        </Pressable>

        {venue?.rating ? (
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={11} color="#FBBF24" />
            <Text style={styles.ratingPillText}>
              {venue.rating}
              {venue?.reviewCount ? <Text style={styles.ratingCount}> ({venue.reviewCount})</Text> : null}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{venue?.name || ''}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={13} color={colors.mid} />
          <Text style={styles.meta} numberOfLines={1}>{venue?.city || ''}</Text>
          <View style={styles.dot} />
          <Ionicons name="people-outline" size={13} color={colors.mid} />
          <Text style={styles.meta}>{venue?.capacity || ''} pers.</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>
            {venue?.price || ''} <Text style={styles.perH}>€ / h</Text>
          </Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.md,
  },
  imgWrap: { position: 'relative' },
  img: { width: '100%', height: 200, resizeMode: 'cover' },
  imgFallback: { backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
  imgOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 80 },
  badge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.full, paddingHorizontal: 11, paddingVertical: 5,
    maxWidth: '60%',
  },
  badgeText: { fontSize: typography.tiny, color: colors.primary, fontWeight: '800', letterSpacing: 0.3 },
  favBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(28,25,23,0.32)',
    justifyContent: 'center', alignItems: 'center',
  },
  ratingPill: {
    position: 'absolute', bottom: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 4,
  },
  ratingPillText: { fontSize: typography.tiny, fontWeight: '800', color: colors.dark },
  ratingCount: { fontWeight: '500', color: colors.mid },
  body: { padding: spacing.md, gap: 7 },
  name: { fontSize: typography.h3, fontWeight: '800', color: colors.dark, letterSpacing: -0.3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.light, marginHorizontal: 4 },
  meta: { fontSize: typography.small, color: colors.mid, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2 },
  price: { fontSize: typography.h2, fontWeight: '900', color: colors.dark, letterSpacing: -0.5 },
  perH: { fontSize: typography.small, fontWeight: '500', color: colors.mid },
});
