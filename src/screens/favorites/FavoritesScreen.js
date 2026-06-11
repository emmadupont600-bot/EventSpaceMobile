/**
 * FavoritesScreen — favoris "Luxury Minimal" 2026.
 * Titre serif, badge compteur accent, cards VenueCard avec entrée
 * en cascade, état vide avec Ionicons (sans emoji).
 */
import React, { useCallback, useState, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, StatusBar, TouchableOpacity, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Store } from '../../utils/store';
import VenueCard from '../../components/VenueCard';
import { VenueCardSkeleton } from '../../components/SkeletonLoader';
import { spacing, radius } from '../../theme/tokens';

export default function FavoritesScreen({ navigation }) {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, favorites, toggleFavorite } = useApp();
  const { semantic, isDark, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => themedStyles(semantic, shadow), [semantic, shadow]);

  useFocusEffect(useCallback(() => {
    (async () => {
      setLoading(true);
      try {
        if (!user) { setVenues([]); return; }
        const all = await Store.getVenues();
        setVenues((all || []).filter(v => favorites.includes(v.id)));
      } finally {
        setLoading(false);
      }
    })();
  }, [user, favorites]));

  const EmptyState = () => (
    <View style={styles.empty}>
      <View style={s.emptyIconWrap}>
        <Ionicons name="heart-outline" size={28} color={semantic.primary} />
      </View>
      <Text style={s.emptyTitle}>Aucun favori pour le moment</Text>
      <Text style={s.emptySub}>Appuyez sur le cœur d'un lieu pour le sauvegarder ici</Text>
      <TouchableOpacity
        style={s.exploreBtn}
        onPress={() => navigation.navigate('Accueil')}
      >
        <Ionicons name="search-outline" size={16} color={semantic.primaryForeground} />
        <Text style={s.exploreBtnText}>Explorer des lieux</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Text style={s.title}>Favoris</Text>
        {venues.length > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{venues.length}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={{ padding: spacing.lg }}>
          {[1, 2, 3].map(i => <VenueCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={venues}
          keyExtractor={v => String(v.id)}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 120 }}
          renderItem={({ item, index }) => (
            <Reanimated.View entering={FadeInDown.delay(Math.min(index, 6) * 70).springify().damping(18)}>
              <VenueCard
                venue={item}
                isFav={true}
                onPress={() => navigation.navigate('Accueil', {
                  screen: 'VenueDetail',
                  params: { venue: item, venueId: item.id },
                })}
                onFav={() => toggleFavorite(item.id)}
              />
            </Reanimated.View>
          )}
          ListEmptyComponent={<EmptyState />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.xl, gap: spacing.md },
});

function themedStyles(c, shadow) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    title: {
      fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
      fontSize: 28, color: c.text, flex: 1, letterSpacing: -0.4,
    },
    badge: {
      backgroundColor: c.primarySoft, borderRadius: radius.full,
      minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
    },
    badgeText: { fontSize: 13, fontWeight: '800', color: c.primary },
    emptyIconWrap: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center',
      ...shadow.sm,
    },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: c.text, textAlign: 'center' },
    emptySub: { fontSize: 13, color: c.textFaint, textAlign: 'center', maxWidth: 260 },
    exploreBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: c.primary, borderRadius: radius.full,
      paddingHorizontal: spacing.xl, height: 44, marginTop: spacing.sm,
    },
    exploreBtnText: { color: c.primaryForeground, fontWeight: '700', fontSize: 13 },
  });
}
