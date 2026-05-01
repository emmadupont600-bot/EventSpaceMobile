import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { VENUES, CATEGORIES } from '../../data/venues';
import { COLORS } from '../../theme/colors';

function VenueCard({ venue, onPress, isFavorite, onToggleFavorite }) {
  const categoryColors = { Soirée: '#6C63FF', Mariage: '#FF6584', Professionnel: '#43C6AC', Anniversaire: '#F59E0B' };
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.cardImage, { backgroundColor: categoryColors[venue.category] || COLORS.primary }]}>
        <Text style={styles.cardImageIcon}>{venue.type === 'Loft' ? '🏙️' : venue.type === 'Rooftop' ? '🌆' : venue.type === 'Domaine' ? '🏰' : venue.type === 'Studio' ? '🎨' : venue.type === 'Bureau' ? '💼' : '🏛️'}</Text>
        <TouchableOpacity style={styles.favBtn} onPress={onToggleFavorite}>
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? COLORS.secondary : COLORS.white} />
        </TouchableOpacity>
        <View style={styles.categoryBadge}><Text style={styles.categoryText}>{venue.category}</Text></View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.venueName} numberOfLines={1}>{venue.name}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
          <Text style={styles.location}>{venue.location}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.rating}>{venue.rating} ({venue.reviews})</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{venue.price}€<Text style={styles.priceUnit}>/jour</Text></Text>
          <Text style={styles.capacity}><Ionicons name="people-outline" size={12} /> {venue.capacity} pers.</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { user, favorites, toggleFavorite } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const filtered = VENUES.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'Tous' || v.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Trouvez votre lieu idéal</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user?.avatar}</Text></View>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Chercher un lieu, une ville..." value={search} onChangeText={setSearch} placeholderTextColor={COLORS.textLight} />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={20} color={COLORS.textLight} /></TouchableOpacity> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[styles.catBtn, selectedCategory === cat && styles.catBtnActive]} onPress={() => setSelectedCategory(cat)}>
            <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <VenueCard venue={item} onPress={() => navigation.navigate('VenueDetail', { venue: item })} isFavorite={favorites.includes(item.id)} onToggleFavorite={() => toggleFavorite(item.id)} />
        )}
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="search-outline" size={48} color={COLORS.textLight} /><Text style={styles.emptyText}>Aucun lieu trouvé</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text, paddingVertical: 12 },
  categories: { maxHeight: 50, marginBottom: 8 },
  catBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  catBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  catTextActive: { color: COLORS.white },
  card: { backgroundColor: COLORS.surface, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  cardImage: { height: 160, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  cardImageIcon: { fontSize: 60 },
  favBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 8 },
  categoryBadge: { position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  categoryText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  cardBody: { padding: 16, gap: 8 },
  venueName: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, borderTopWidth: 1, borderTopColor: COLORS.border },
  price: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  priceUnit: { fontSize: 12, fontWeight: '400', color: COLORS.textSecondary },
  capacity: { fontSize: 13, color: COLORS.textSecondary },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '500' },
});
