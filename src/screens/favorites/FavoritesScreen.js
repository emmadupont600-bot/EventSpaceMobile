import React, { useCallback, useState, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, StatusBar, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { VENUES } from '../../data/venues';
import VenueCard from '../../components/VenueCard';
import { VenueCardSkeleton } from '../../components/SkeletonLoader';
import { colors, spacing, radius, shadow } from '../../theme/colors';

export default function FavoritesScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const { user, favorites, toggleFavorite } = useApp();
  const insets = useSafeAreaInsets();

  useFocusEffect(useCallback(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, [favorites]));

  const venues = useMemo(
    () => (VENUES || []).filter(v => favorites.includes(v.id)),
    [favorites]
  );

  const EmptyState = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIcoBox}>
        <Ionicons name="heart-outline" size={36} color={colors.error} />
      </View>
      <Text style={styles.emptyTitle}>Aucun favori</Text>
      <Text style={styles.emptySub}>
        Appuyez sur l'icône cœur d'un lieu pour le retrouver ici.
      </Text>
      <TouchableOpacity
        style={styles.exploreBtn}
        onPress={() => navigation.navigate('Accueil')}
        activeOpacity={0.9}
      >
        <Ionicons name="compass-outline" size={16} color="#fff" />
        <Text style={styles.exploreBtnText}>Explorer des lieux</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Favoris</Text>
          <Text style={styles.subtitle}>
            {venues.length === 0 ? 'Aucun favori' : `${venues.length} lieu${venues.length > 1 ? 'x' : ''} sauvegardé${venues.length > 1 ? 's' : ''}`}
          </Text>
        </View>
        {venues.length > 0 && (
          <View style={styles.badge}>
            <Ionicons name="heart" size={12} color={colors.error} />
            <Text style={styles.badgeText}>{venues.length}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: spacing.lg }}>
          {[1, 2, 3].map(i => <VenueCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={venues}
          keyExtractor={v => String(v.id)}
          contentContainerStyle={[
            { paddingHorizontal: spacing.lg, paddingBottom: 120 },
            venues.length === 0 && { flex: 1 },
          ]}
          renderItem={({ item }) => (
            <VenueCard
              venue={item}
              isFav={true}
              onPress={() => navigation.navigate('Accueil', { screen: 'VenueDetail', params: { venue: item, venueId: item.id } })}
              onFav={() => toggleFavorite(item.id)}
            />
          )}
          ListEmptyComponent={<EmptyState />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.errorLight,
    borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  badgeText: { fontSize: 12, fontWeight: '800', color: colors.error },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  emptyIcoBox: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.errorLight,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  emptySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', maxWidth: 280, lineHeight: 20 },
  exploreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingHorizontal: spacing.xl, paddingVertical: 14,
    marginTop: spacing.md, ...shadow.primary,
  },
  exploreBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
