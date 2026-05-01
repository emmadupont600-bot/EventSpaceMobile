import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Store } from '../../utils/store';
import VenueCard from '../../components/VenueCard';
import Header from '../../components/Header';
import { colors, spacing, typography } from '../../theme/colors';

export default function FavoritesScreen({ navigation }) {
  const [venues, setVenues] = useState([]);
  const [user, setUser] = useState(null);

  useFocusEffect(useCallback(() => {
    (async () => {
      const u = await Store.getCurrentUser();
      setUser(u);
      if (!u) return;
      const all = await Store.getVenues();
      const favIds = await Store.getFavorites(u.id);
      setVenues(all.filter(v => favIds.includes(v.id)));
    })();
  }, []));

  return (
    <View style={styles.container}>
      <Header title="Mes favoris" />
      <FlatList
        data={venues}
        keyExtractor={v => String(v.id)}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <VenueCard
            venue={item}
            isFav={true}
            onPress={() => navigation.navigate('VenueDetail', { venueId: item.id })}
            onFav={async () => {
              await Store.toggleFavorite(user.id, item.id);
              setVenues(v => v.filter(x => x.id !== item.id));
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={48} color={colors.light} />
            <Text style={styles.emptyTxt}>Aucun favori</Text>
            <Text style={styles.emptySub}>Appuyez sur ♥ pour sauvegarder un lieu</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyTxt: { fontSize: typography.h3, fontWeight: '700', color: colors.mid },
  emptySub: { fontSize: typography.small, color: colors.light },
});
