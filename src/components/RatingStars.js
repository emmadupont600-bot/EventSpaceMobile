import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function RatingStars({ value = 0, size = 20, interactive = false, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = interactive ? (hovered || value) : value;

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity
          key={i}
          disabled={!interactive}
          onPress={() => onChange && onChange(i)}
          onPressIn={() => setHovered(i)}
          onPressOut={() => setHovered(0)}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={i <= display ? 'star' : 'star-outline'}
            size={size}
            color={i <= display ? '#F59E0B' : colors.border || '#D1D5DB'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
});
