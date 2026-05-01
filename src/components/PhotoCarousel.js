import React, { useState, useRef } from 'react';
import {
  View, FlatList, Image, Dimensions, StyleSheet, TouchableOpacity, Text
} from 'react-native';

const { width: W } = Dimensions.get('window');

const FALLBACK_PHOTOS = [
  'https://picsum.photos/seed/venue1/800/400',
  'https://picsum.photos/seed/venue2/800/400',
  'https://picsum.photos/seed/venue3/800/400',
];

export default function PhotoCarousel({ photos = [], height = 280 }) {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const images = photos.length > 0 ? photos : FALLBACK_PHOTOS;

  const onScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    setActive(idx);
  };

  const goTo = (i) => {
    ref.current?.scrollToIndex({ index: i, animated: true });
  };

  return (
    <View style={{ height }}>
      <FlatList
        ref={ref}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({ length: W, offset: W * index, index })}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={{ width: W, height }}
            resizeMode="cover"
          />
        )}
      />
      {/* Counter badge top-right */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>{active + 1} / {images.length}</Text>
      </View>
      {/* Dot indicators */}
      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => goTo(i)}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={[styles.dot, i === active && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  counter: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  counterText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  dots: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 20,
  },
});
