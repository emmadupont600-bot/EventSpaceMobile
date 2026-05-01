import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadow, typography } from '../theme/colors';

export default function VenueCard({ venue, onPress, onFav, isFav }) {
  const hasImg = Boolean(venue?.img);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.imgWrap}>
        {hasImg ? (
          <Image
            source={{ uri: venue.img }}
            style={styles.img}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.img, styles.imgFallback]}>
            <Ionicons name="image-outline" size={36} color={colors.borderLight} />
            <Text style={styles.imgFallbackText}>Photo à venir</Text>
          </View>
        )}

        {/* Badge type — ne chevauche pas le favBtn grâce au positionnement opposé */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{venue?.type || 'Espace'}</Text>
        </View>

        {/* Bouton favori — hitSlop large pour accessibilité */}
        <TouchableOpacity
          style={[styles.favBtn, isFav && styles.favBtnActive]}
          onPress={onFav}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={17}
            color={isFav ? '#ef4444' : '#fff'}
          />
        </TouchableOpacity>

        {/* Gradient overlay bas pour lisibilité */}
        <View style={styles.imgGradient} pointerEvents="none" />
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{venue?.name || 'Sans nom'}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={colors.mid} />
            <Text style={styles.metaText} numberOfLines={1}>{venue?.city || '—'}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={12} color={colors.mid} />
            <Text style={styles.metaText}>{venue?.capacity || '—'} pers.</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>
              {venue?.price || '—'}<Text style={styles.perH}> €/h</Text>
            </Text>
          </View>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={11} color={colors.warning} />
            <Text style={styles.ratingText}>
              {venue?.rating || '—'}
              <Text style={styles.ratingCount}> ({venue?.reviewCount || 0})</Text>
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadow.sm,
  },
  imgWrap: { position: 'relative' },
  img: { width: '100%', height: 200 },
  imgFallback: {
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  imgFallbackText: {
    fontSize: typography.tiny,
    color: colors.light,
    marginTop: 4,
  },
  imgGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    // gradient simulé via opacity sur Android/iOS
    backgroundColor: 'transparent',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(79,70,229,0.9)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: typography.tiny,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  body: {
    padding: spacing.md,
    paddingTop: 10,
    gap: 5,
  },
  name: {
    fontSize: typography.h3,
    fontWeight: '800',
    color: colors.dark,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
  },
  metaText: {
    fontSize: typography.tiny,
    color: colors.mid,
    fontWeight: '500',
    flexShrink: 1,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  price: {
    fontSize: typography.h3,
    fontWeight: '800',
    color: colors.primary,
  },
  perH: {
    fontSize: typography.tiny,
    fontWeight: '400',
    color: colors.mid,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.warningLight,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingText: {
    fontSize: typography.tiny,
    fontWeight: '700',
    color: '#92400E',
  },
  ratingCount: {
    fontWeight: '400',
    color: colors.mid,
  },
});
