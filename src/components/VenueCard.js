/**
 * VenueCard — carte lieu "Luxury Minimal" 2026.
 * Image hero 4:3 + overlay gradient (nom & prix lisibles dans l'image),
 * badge catégorie pill semi-transparent, cœur favoris sur fond flou,
 * coins 16px, ombre douce ton-sur-ton, aucune bordure colorée.
 */
import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { shadow, spacing } from '../theme/tokens';
import PressableScale from './PressableScale';
import { hapticLight, hapticWarning } from '../utils/haptics';

const CARD_RADIUS = 16;

function FavButton({ isFav, onToggle }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.3, { damping: 12, stiffness: 380, mass: 0.5 }),
      withSpring(1, { damping: 14, stiffness: 320, mass: 0.5 })
    );
    if (isFav) hapticWarning();
    else hapticLight();
    onToggle && onToggle();
  };

  const heart = (
    <Animated.View style={animatedStyle}>
      <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? '#E8654F' : '#FFFFFF'} />
    </Animated.View>
  );

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      style={styles.favWrap}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={28} tint="dark" style={styles.favInner}>{heart}</BlurView>
      ) : (
        <View style={[styles.favInner, styles.favInnerAndroid]}>{heart}</View>
      )}
    </Pressable>
  );
}

export default function VenueCard({ venue, onPress, onFav, isFav, width }) {
  const { semantic, isDark } = useTheme();
  const s = useMemo(() => themedStyles(semantic, isDark), [semantic, isDark]);

  return (
    <PressableScale
      style={[s.card, width ? { width } : null]}
      onPress={onPress}
      scaleTo={0.98}
      haptic="none"
    >
      <View style={styles.imgWrap}>
        {venue?.img ? (
          <Image source={{ uri: venue.img }} style={styles.img} />
        ) : (
          <View style={[styles.img, s.imgFallback]}>
            <Ionicons name="image-outline" size={32} color={semantic.textFaint} />
          </View>
        )}

        <LinearGradient
          colors={['rgba(20,18,16,0)', 'rgba(20,18,16,0.25)', 'rgba(20,18,16,0.78)']}
          locations={[0.45, 0.65, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {venue?.type ? (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText} numberOfLines={1}>{venue.type}</Text>
          </View>
        ) : null}

        <FavButton isFav={isFav} onToggle={onFav} />

        <View style={styles.overlayBottom} pointerEvents="none">
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Text style={styles.overlayName} numberOfLines={1}>{venue?.name || ''}</Text>
            <View style={styles.overlayMetaRow}>
              <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.85)" />
              <Text style={styles.overlayMeta} numberOfLines={1}>
                {venue?.city || ''}{venue?.capacity ? `  ·  ${venue.capacity} pers.` : ''}
              </Text>
            </View>
          </View>
          <Text style={styles.overlayPrice}>
            {venue?.price ?? ''}
            <Text style={styles.overlayPriceUnit}> €/h</Text>
          </Text>
        </View>
      </View>

      <View style={s.body}>
        <View style={styles.bodyRow}>
          {venue?.rating ? (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color={semantic.gold} />
              <Text style={[styles.ratingText, { color: semantic.text }]}>
                {venue.rating}
                {venue?.reviewCount ? (
                  <Text style={{ color: semantic.textMuted, fontWeight: '400' }}> ({venue.reviewCount})</Text>
                ) : null}
              </Text>
            </View>
          ) : (
            <Text style={[styles.ratingText, { color: semantic.textMuted, fontWeight: '400' }]}>Nouveau</Text>
          )}
          <View style={styles.ctaRow}>
            <Text style={[styles.ctaText, { color: semantic.primary }]}>Découvrir</Text>
            <Ionicons name="arrow-forward" size={13} color={semantic.primary} />
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

function themedStyles(c, isDark) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.surface,
      borderRadius: CARD_RADIUS,
      marginBottom: spacing.lg,
      overflow: 'hidden',
      ...(isDark ? shadow.xs : shadow.md),
    },
    imgFallback: {
      backgroundColor: c.bg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    body: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
    },
  });
}

const styles = StyleSheet.create({
  imgWrap: { position: 'relative', width: '100%', aspectRatio: 4 / 3 },
  img: { width: '100%', height: '100%', resizeMode: 'cover' },
  typeBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(20,18,16,0.45)',
    borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6,
    maxWidth: '55%',
  },
  typeBadgeText: {
    fontSize: 12, color: '#FFFFFF', fontWeight: '600', letterSpacing: 0.4,
  },
  favWrap: {
    position: 'absolute', top: 10, right: 10,
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  favInner: {
    width: 38, height: 38, borderRadius: 19,
    overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  favInnerAndroid: { backgroundColor: 'rgba(20,18,16,0.45)' },
  overlayBottom: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: spacing.md, paddingBottom: spacing.md,
  },
  overlayName: {
    fontSize: 18, color: '#FFFFFF', fontWeight: '700', letterSpacing: -0.2,
  },
  overlayMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  overlayMeta: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  overlayPrice: { fontSize: 19, color: '#FFFFFF', fontWeight: '800', letterSpacing: -0.3 },
  overlayPriceUnit: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.85)' },
  bodyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '700' },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 24 },
  ctaText: { fontSize: 13, fontWeight: '600' },
});
