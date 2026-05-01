import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export function SkeletonBox({ width, height, borderRadius = 8, style }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.85] });

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: '#E2E8F0', opacity }, style]}
    />
  );
}

export function VenueCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox width="100%" height={180} borderRadius={16} />
      <View style={{ padding: 12, gap: 8 }}>
        <SkeletonBox width="70%" height={18} />
        <SkeletonBox width="50%" height={14} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <SkeletonBox width={80} height={14} />
          <SkeletonBox width={60} height={14} />
        </View>
      </View>
    </View>
  );
}

export function ChatItemSkeleton() {
  return (
    <View style={styles.chatItem}>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
});
