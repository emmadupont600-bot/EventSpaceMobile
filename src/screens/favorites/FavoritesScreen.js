import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../../utils/store';
import VenueCard from '../../components/VenueCard';
import { colors, spacing, typography, radius } from '../../theme/colors';

export default function FavoritesScreen({ navigation }) {
  const [venues, setVenues] = useState([]);
  const [user, setUser] = useState(null);
  const insets = useSafeAreaInsets();

  useFocusEffect(useCallback(() => {
    (async () => {
      const u = await Store.getCurrentUser();
      setUser(u);
      if (!u) return;
      const all = await Store.getVenues();
      const favIds = await Store.getFavorites(u.id);
      setVenues((all || []).filter(v => favIds.includes(v.id)));
    })();
  }, []));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Favoris</Text>
        {venues.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{venues.length}</Text>
          </View>
        )}
      </View>
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
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Feather name="heart" size={32} color={colors.secondary} />
            </View>
            <Text style={styles.emptyTitle}>Aucun favori</Text>
            <Text style={styles.emptySub}>Appuyez sur ♥ pour sauvegarder un lieu</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md,
  },
  title: { fontSize: typography.h1, fontWeight: '900', color: colors.dark, flex: 1, letterSpacing: -0.5 },
  countBadge: {
    backgroundColor: colors.secondaryLight, borderRadius: radius.full,
    minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  countText: { fontSize: typography.small, fontWeight: '800', color: colors.secondary },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm,
  },
  emptyTitle: { fontSize: typography.h3, fontWeight: '700', color: colors.dark },
  emptySub: { fontSize: typography.small, color: colors.light, textAlign: 'center', maxWidth: 240 },
});
