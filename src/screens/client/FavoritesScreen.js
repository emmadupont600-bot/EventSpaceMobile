import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { VENUES } from '../../data/venues';
import VenueCard from '../../components/VenueCard';
import { COLORS } from '../../theme/colors';

const P = COLORS.primary || '#4F46E5';

export default function FavoritesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite } = useApp();

  const favVenues = (VENUES || []).filter(v => (favorites || []).includes(v.id));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoris</Text>
        {favVenues.length > 0 && (
          <Text style={styles.headerCount}>{favVenues.length} lieu{favVenues.length > 1 ? 'x' : ''}</Text>
        )}
      </View>

      {favVenues.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="heart-outline" size={48} color="#CBD5E1" />
          </View>
          <Text style={styles.emptyTitle}>Aucun favori pour l'instant</Text>
          <Text style={styles.emptySub}>
            Appuyez sur ♥ depuis la liste pour sauvegarder vos lieux préférés.
          </Text>
          <TouchableOpacity
            style={[styles.exploreBtn, { backgroundColor: P }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="search-outline" size={16} color="#fff" />
            <Text style={styles.exploreBtnText}>Explorer les lieux</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favVenues}
          keyExtractor={v => String(v.id)}
          renderItem={({ item }) => (
            <VenueCard
              venue={item}
              isFav
              onPress={() => navigation.navigate('VenueDetail', { venueId: item.id, venue: item })}
              onFav={() => toggleFavorite(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  headerCount: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },

  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 },

  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, gap: 12,
  },
  emptyIconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', textAlign: 'center' },
  emptySub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 21, maxWidth: 280 },
  exploreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16,
  },
  exploreBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
