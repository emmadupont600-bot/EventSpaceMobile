import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, StatusBar, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../../utils/store';
import VenueCard from '../../components/VenueCard';
import { VenueCardSkeleton } from '../../components/SkeletonLoader';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

export default function FavoritesScreen({ navigation }) {
  const [venues, setVenues] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useFocusEffect(useCallback(() => {
    (async () => {
      setLoading(true);
      try {
        const u = await Store.getCurrentUser();
        setUser(u);
        if (!u) { setVenues([]); return; }
        const all = await Store.getVenues();
        const favIds = await Store.getFavorites(u.id);
        setVenues((all || []).filter(v => favIds.includes(v.id)));
      } finally {
        setLoading(false);
      }
    })();
  }, []));

  const EmptyState = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIco}>❤️</Text>
      <Text style={styles.emptyTitle}>Aucun favori pour le moment</Text>
      <Text style={styles.emptySub}>Appuyez sur ♥ sur un lieu pour le sauvegarder ici</Text>
      <TouchableOpacity
        style={styles.exploreBtn}
        onPress={() => navigation.navigate('Accueil')}
      >
        <Text style={styles.exploreBtnText}>🔍 Explorer des lieux</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.titleEmoji}>❤️</Text>
        <Text style={styles.title}>Favoris</Text>
        {venues.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{venues.length}</Text>
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
          renderItem={({ item }) => (
            <VenueCard
              venue={item}
              isFav={true}
              onPress={() => navigation.navigate('Accueil', {
                screen: 'VenueDetail',
                params: { venueId: item.id },
              })}
              onFav={async () => {
                await Store.toggleFavorite(user.id, item.id);
                setVenues(v => v.filter(x => x.id !== item.id));
              }}
            />
          )}
          ListEmptyComponent={<EmptyState />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  titleEmoji: { fontSize: 22 },
  title: { fontSize: typography.h1, fontWeight: '900', color: colors.dark, flex: 1, letterSpacing: -0.5 },
  badge: {
    backgroundColor: '#FEE2E2', borderRadius: radius.full,
    minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  badgeText: { fontSize: typography.small, fontWeight: '800', color: '#EF4444' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.xl, gap: spacing.md },
  emptyIco: { fontSize: 56, marginBottom: spacing.sm },
  emptyTitle: { fontSize: typography.h3, fontWeight: '700', color: colors.dark, textAlign: 'center' },
  emptySub: { fontSize: typography.small, color: colors.light, textAlign: 'center', maxWidth: 260 },
  exploreBtn: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    marginTop: spacing.sm, ...shadow.sm, shadowColor: colors.primary,
  },
  exploreBtnText: { color: '#fff', fontWeight: '700', fontSize: typography.body },
});
