import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function RatingStars({ rating = 0, count = 0, size = 16, interactive = false, onRate }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          disabled={!interactive}
          onPress={() => onRate && onRate(star)}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Text style={[styles.star, { fontSize: size }]}>
            {star <= Math.round(rating) ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
      {count > 0 && (
        <Text style={styles.count}>({count} avis)</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star: { color: '#F59E0B' },
  count: { fontSize: 13, color: '#64748B', marginLeft: 4 },
});
