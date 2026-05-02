import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, ScrollView, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { Store } from '../../utils/store';
import { COLORS } from '../../theme/colors';

const CATEGORIES = ['Tous', 'Soirée', 'Mariage', 'Professionnel', 'Anniversaire'];

function VenueCard({ venue, onPress, isFav, onToggleFav }) {
  const typeEmoji = {
    Loft: '🏙️', Rooftop: '🌆', Domaine: '🏰', Studio: '🎨',
    Bureau: '💼', Salle: '🏛️', Château: '🏰', Péniche: '⛵', Autre: '🏠',
  };
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {venue.img
        ? <Image source={{ uri: venue.img }} style={styles.cardImage} resizeMode="cover" />
        : (
          <View style={[styles.cardImagePlaceholder, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.cardImageIcon}>{typeEmoji[venue.type] || '🏠'}</Text>
          </View>
        )
      }
      <TouchableOpacity style={styles.favBtn} onPress={onToggleFav}>
        <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? '#EF4444' : COLORS.white} />
      </TouchableOpacity>

      <View style={styles.cardBody}>
        <Text style={styles.venueName} numberOfLines={1}>{venue.name}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
          <Text style={styles.location} numberOfLines={1}>{venue.city || venue.location}</Text>
        </View>
        {venue.rating > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.rating}>{venue.rating?.toFixed(1)} ({venue.reviewCount || 0})</Text>
          </View>
        )}
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{venue.price}€<Text style={styles.priceUnit}>/h</Text></Text>
          <Text style={styles.capacity}>{venue.capacity} pers.</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { user, favorites, toggleFavorite } = useApp();
  const [venues, setVenues]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]       = useState('');
  const [selectedCat, setSelectedCat] = useState('Tous');
  const [error, setError]         = useState(null);

  const loadVenues = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await Store.getVenues();
      setVenues(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Recharge à chaque fois que l'onglet Home reçoit le focus
  // → permet de voir immédiatement un lieu ajouté par l'annonceur
  useFocusEffect(useCallback(() => { loadVenues(); }, [loadVenues]));

  const filtered = venues.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || (v.name  || '').toLowerCase().includes(q)
      || (v.city  || '').toLowerCase().includes(q);
    const matchCat = selectedCat === 'Tous' || (v.category || v.type) === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {user?.name?.split(' ')[0] || 'toi'} 👋</Text>
          <Text style={styles.subtitle}>Trouvez votre lieu idéal</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Chercher un lieu, une ville..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={COLORS.textLight}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Catégories */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.categories}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catBtn, selectedCat === cat && styles.catBtnActive]}
            onPress={() => setSelectedCat(cat)}
          >
            <Text style={[styles.catText, selectedCat === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des lieux...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textLight} />
          <Text style={styles.emptyText}>Erreur de chargement</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadVenues()}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <VenueCard
              venue={item}
              isFav={favorites.includes(item.id)}
              onPress={() => navigation.navigate('VenueDetail', { venue: item })}
              onToggleFav={() => toggleFavorite(item.id)}
            />
          )}
          contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadVenues(true)}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="search-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>
                {venues.length === 0 ? 'Aucun lieu disponible pour l\'instant' : 'Aucun résultat'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  greeting:       { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subtitle:       { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  avatar:         { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText:     { fontSize: 18, fontWeight: '700', color: COLORS.white },
  searchContainer:{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: 12 },
  searchInput:    { flex: 1, fontSize: 15, color: COLORS.text, paddingVertical: 12 },
  categories:     { maxHeight: 50, marginBottom: 8 },
  catBtn:         { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  catBtnActive:   { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText:        { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  catTextActive:  { color: COLORS.white },

  card:           { backgroundColor: COLORS.surface, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  cardImage:      { width: '100%', height: 160 },
  cardImagePlaceholder: { height: 160, justifyContent: 'center', alignItems: 'center' },
  cardImageIcon:  { fontSize: 60 },
  favBtn:         { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 20, padding: 8 },
  cardBody:       { padding: 16, gap: 6 },
  venueName:      { fontSize: 17, fontWeight: '700', color: COLORS.text },
  row:            { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location:       { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  ratingRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating:         { fontSize: 12, fontWeight: '600', color: COLORS.text },
  cardFooter:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  price:          { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  priceUnit:      { fontSize: 12, fontWeight: '400', color: COLORS.textSecondary },
  capacity:       { fontSize: 13, color: COLORS.textSecondary },
  loadingText:    { fontSize: 14, color: COLORS.textSecondary },
  emptyText:      { fontSize: 16, color: COLORS.textSecondary, fontWeight: '500', textAlign: 'center' },
  retryBtn:       { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText:      { color: COLORS.white, fontWeight: '700' },
});
