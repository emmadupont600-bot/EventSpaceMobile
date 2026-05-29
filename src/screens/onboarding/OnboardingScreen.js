import React, { useRef, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Dimensions, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { Store } from '../../utils/store';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'search',
    emoji: '🔍',
    title: 'Trouvez le lieu parfait',
    subtitle: 'Des châteaux aux lofts atypiques — explorez des centaines d\'espaces événementiels.',
  },
  {
    icon: 'calendar',
    emoji: '📅',
    title: 'Réservez en quelques clics',
    subtitle: 'Choisissez votre date, payez en sécurité via Stripe, et recevez une confirmation instantanée.',
  },
  {
    icon: 'star',
    emoji: '⭐',
    title: 'Partagez votre expérience',
    subtitle: 'Laissez un avis après votre événement pour aider la communauté EventSpace.',
  },
];

export default function OnboardingScreen({ onComplete }) {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef(null);

  const finish = async () => {
    await AsyncStorage.setItem('@eventspace_onboarded', '1');
    onComplete?.();
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
      setIndex(index + 1);
    } else {
      finish();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 20 }]}>
      <TouchableOpacity style={styles.skip} onPress={finish}>
        <Text style={{ color: colors.mid, fontWeight: '600' }}>Passer</Text>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={e => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.slideEmoji}>{item.emoji}</Text>
            </View>
            <Text style={[styles.title, { color: colors.dark }]}>{item.title}</Text>
            <Text style={[styles.subtitle, { color: colors.mid }]}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, {
              backgroundColor: i === index ? colors.primary : colors.border,
              width: i === index ? 24 : 8,
            }]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary, marginBottom: insets.bottom + 24 }]}
        onPress={next}
      >
        <Text style={styles.btnText}>
          {index === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
        </Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

export async function shouldShowOnboarding(user) {
  const local = await AsyncStorage.getItem('@eventspace_onboarded');
  if (local === '1') return false;
  if (user?.has_onboarded) return false;
  return true;
}

export async function markOnboardingComplete(userId) {
  await AsyncStorage.setItem('@eventspace_onboarded', '1');
  if (userId) {
    await Store.updateUserProfile(userId, { has_onboarded: true });
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skip: { alignSelf: 'flex-end', paddingHorizontal: 24, paddingVertical: 8 },
  slide: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 40 },
  iconWrap: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center', marginBottom: 32,
  },
  slideEmoji: { fontSize: 56 },
  title: { fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 24 },
  dot: { height: 8, borderRadius: 4 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 24, paddingVertical: 16, borderRadius: 14,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
