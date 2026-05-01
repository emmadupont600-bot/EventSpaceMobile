import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadow, typography } from '../theme/colors';

export default function VenueCard({ venue, onPress, onFav, isFav }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.imgWrap}>
        <Image source={{ uri: venue.img }} style={styles.img} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{venue.type}</Text>
        </View>
        <TouchableOpacity style={styles.favBtn} onPress={onFav}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={20}
            color={isFav ? '#ef4444' : '#fff'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{venue.name}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={13} color={colors.mid} />
          <Text style={styles.city}>{venue.city}</Text>
          <Ionicons name="people-outline" size={13} color={colors.mid} style={{ marginLeft: 10 }} />
          <Text style={styles.city}>{venue.capacity} pers.</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>{venue.price} <Text style={styles.perH}>€/h</Text></Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={colors.warning} />
            <Text style={styles.rating}> {venue.rating} ({venue.reviewCount})</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadow.md,
  },
  imgWrap: { position: 'relative' },
  img: { width: '100%', height: 180 },
  badge: {
    position: 'absolute', bottom: 10, left: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  badgeText: { color: '#fff', fontSize: typography.tiny, fontWeight: '600' },
  favBtn: {
    position: 'absolute', top: 10, right: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: radius.full,
    width: 34, height: 34,
    alignItems: 'center', justifyContent: 'center',
  },
  body: { padding: spacing.md },
  name: { fontSize: typography.h3, fontWeight: '700', color: colors.dark, marginBottom: 5 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  city: { fontSize: typography.small, color: colors.mid, marginLeft: 3 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: typography.h3, fontWeight: '800', color: colors.primary },
  perH: { fontSize: typography.small, fontWeight: '400', color: colors.mid },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  rating: { fontSize: typography.small, color: colors.mid },
});
