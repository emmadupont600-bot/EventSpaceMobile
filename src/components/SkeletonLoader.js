import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';

export function SkeletonBox({ width = '100%', height = 16, borderRadius = 8, style }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: colors.borderLight || '#E5E7EB', opacity },
        style,
      ]}
    />
  );
}

export function VenueCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox height={180} borderRadius={12} style={{ marginBottom: 12 }} />
      <SkeletonBox height={14} width="60%" style={{ marginBottom: 8 }} />
      <SkeletonBox height={12} width="40%" style={{ marginBottom: 8 }} />
      <SkeletonBox height={12} width="80%" />
    </View>
  );
}

export function HomeScreenSkeleton() {
  return (
    <View style={{ padding: 16, gap: 16 }}>
      {[1, 2, 3].map(i => <VenueCardSkeleton key={i} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white || '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
