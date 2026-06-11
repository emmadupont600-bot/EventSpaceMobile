/**
 * SkeletonLoader — shimmer beige chaud reproduisant exactement
 * la forme des cards (image 4:3 + corps), fade vers le contenu géré
 * par les écrans (200ms).
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme/tokens';

export function SkeletonBox({ width, height, borderRadius = 8, style, aspectRatio }) {
  const { isDark } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] });
  const shimmer = isDark ? '#2C2722' : '#EDE6DA';

  return (
    <Animated.View
      style={[{ width, height, aspectRatio, borderRadius, backgroundColor: shimmer, opacity }, style]}
    />
  );
}

export function VenueCardSkeleton() {
  const { semantic } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: semantic.surface }]}>
      <SkeletonBox width="100%" aspectRatio={4 / 3} borderRadius={0} />
      <View style={{ paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
        <SkeletonBox width={90} height={14} />
        <SkeletonBox width={70} height={14} />
      </View>
    </View>
  );
}

export function HomeScreenSkeleton() {
  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
      <SkeletonBox width={180} height={28} borderRadius={8} style={{ marginBottom: 16 }} />
      <SkeletonBox width="100%" height={48} borderRadius={999} style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
        {[72, 90, 84].map((w, i) => (
          <SkeletonBox key={i} width={w} height={36} borderRadius={999} />
        ))}
      </View>
      {[1, 2, 3].map(i => (
        <VenueCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function ChatItemSkeleton() {
  const { semantic } = useTheme();
  return (
    <View style={[styles.chatItem, { borderBottomColor: semantic.borderSubtle }]}>
      <SkeletonBox width={48} height={48} borderRadius={24} />
      <View style={{ flex: 1, gap: 8, marginLeft: 12 }}>
        <SkeletonBox width="60%" height={14} />
        <SkeletonBox width="85%" height={12} />
      </View>
      <SkeletonBox width={40} height={12} />
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View style={{ alignItems: 'center', padding: 32, gap: 12 }}>
      <SkeletonBox width={96} height={96} borderRadius={48} />
      <SkeletonBox width={140} height={20} />
      <SkeletonBox width={180} height={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
});
