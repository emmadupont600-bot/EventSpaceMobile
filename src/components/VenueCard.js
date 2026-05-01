import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadow, typography } from '../theme/colors';

export default function VenueCard({ venue, onPress, onFav, isFav }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.imgWrap}>
        {venue?.img ? (
          <Image source={{ uri: venue.img }} style={styles.img} />
        ) : (
          <View style={[styles.img, styles.imgFallback]}>
            <Ionicons name="image-outline" size={32} color={colors.light} />
          </View>
        )}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{venue?.type || ''}</Text>
        </View>
        <TouchableOpacity style={styles.favBtn} onPress={onFav} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={18}
            color={isFav ? '#ef4444' : '#fff'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{venue?.name || ''}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={12} color={colors.mid} />
          <Text style={styles.meta}>{venue?.city || ''}</Text>
          <Ionicons name="people-outline" size={12} color={colors.mid} style={{ marginLeft: 8 }} />
          <Text style={styles.meta}>{venue?.capacity || ''} pers.</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>
            {venue?.price || ''} <Text style={styles.perH}>€/h</Text>
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={colors.warning} />
            <Text style={styles.rating}> {venue?.rating || ''} ({venue?.reviewCount || 0})</Text>
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
    ...shadow.md,
  },
  imgWrap: { position: 'relative' },
  img: { width: '100%', height: 190, resizeMode: 'cover' },
  imgFallback: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(79,70,229,0.85)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: typography.tiny, color: '#fff', fontWeight: '700', letterSpacing: 0.3 },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: { padding: spacing.md, gap: 6 },
  name: { fontSize: typography.h3, fontWeight: '800', color: colors.dark, letterSpacing: -0.2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: typography.tiny, color: colors.mid, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  price: { fontSize: typography.h3, fontWeight: '800', color: colors.primary },
  perH: { fontSize: typography.tiny, fontWeight: '400', color: colors.mid },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  rating: { fontSize: typography.tiny, color: colors.mid, fontWeight: '600' },
});
