import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { VENUES } from '../../data/venues';
import { COLORS } from '../../theme/colors';

export default function FavoritesScreen({ navigation }) {
  const { favorites, toggleFavorite } = useApp();
  const favVenues = VENUES.filter(v => favorites.includes(v.id));
  const categoryColors = { Soirée: '#6C63FF', Mariage: '#FF6584', Professionnel: '#43C6AC', Anniversaire: '#F59E0B' };
  const icons = { Loft: '🏙️', Rooftop: '🌆', Domaine: '🏰', Studio: '🎨', Bureau: '💼', Salle: '🏛️' };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Favoris</Text>
        <Text style={styles.count}>{favVenues.length} lieu{favVenues.length > 1 ? 'x' : ''}</Text>
      </View>
      {favVenues.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptyText}>Appuyez sur ❤️ sur un lieu pour l'ajouter à vos favoris</Text>
        </View>
      ) : (
        <FlatList
          data={favVenues}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Accueil', { screen: 'VenueDetail', params: { venue: item } })} activeOpacity={0.85}>
              <View style={[styles.cardLeft, { backgroundColor: categoryColors[item.category] || COLORS.primary }]}>
                <Text style={{ fontSize: 32 }}>{icons[item.type] || '🏛️'}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.venueName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.location}><Ionicons name="location-outline" size={12} color={COLORS.textSecondary} /> {item.location}</Text>
                <Text style={styles.price}>{item.price}€<Text style={styles.priceUnit}>/jour</Text></Text>
              </View>
              <TouchableOpacity style={styles.removeBtn} onPress={() => toggleFavorite(item.id)}>
                <Ionicons name="heart" size={22} color={COLORS.secondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  count: { fontSize: 14, color: COLORS.textSecondary, backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, fontWeight: '600', color: COLORS.primary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  card: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardLeft: { width: 80, justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1, padding: 14, gap: 4 },
  venueName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  location: { fontSize: 12, color: COLORS.textSecondary },
  price: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginTop: 4 },
  priceUnit: { fontSize: 11, fontWeight: '400', color: COLORS.textSecondary },
  removeBtn: { padding: 16, justifyContent: 'center' },
});
