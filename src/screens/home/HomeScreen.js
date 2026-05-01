import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, TextInput, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Store } from '../../utils/store';
import VenueCard from '../../components/VenueCard';
import { colors, spacing, typography, radius } from '../../theme/colors';

const CATEGORIES = [
  { label: 'Tout', value: null },
  { label: '💍 Mariage', value: 'Château' },
  { label: '🎂 Anniversaire', value: 'Salle de réception' },
  { label: '💼 Séminaire', value: 'Loft' },
  { label: '🎉 Soirée', value: 'Rooftop' },
  { label: '📸 Photo', value: 'Studio photo' },
  { label: '🌿 Plein air', value: 'Jardin' },
];

export default function HomeScreen({ navigation, route }) {
  const [venues, setVenues] = useState([]);
  const [favs, setFavs] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState(null);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    const u = await Store.getCurrentUser();
    setUser(u);
    const v = await Store.getVenues();
    setVenues(v.filter(x => x.published));
    if (u) {
      const f = await Store.getFavorites(u.id);
      setFavs(f);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const onFav = async (venueId) => {
    if (!user) return navigation.navigate('Login');
    const added = await Store.toggleFavorite(user.id, venueId);
    setFavs(prev => added ? [...prev, venueId] : prev.filter(x => x !== venueId));
  };

  const filtered = venues.filter(v => {
    const matchSearch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.city.toLowerCase().includes(search.toLowerCase());
    const matchCat = !cat || v.type === cat;
    return matchSearch && matchCat;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Bonjour{user ? `, ${user.firstName}` : ''} 👋</Text>
          <Text style={styles.logo}>Event<Text style={styles.logoBlue}>Space</Text></Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarBtn}>
          <Text style={styles.avatarText}>{user ? user.firstName[0].toUpperCase() : '?'}</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.mid} />
        <TextInput
          style={styles.searchInput}
          placeholder="Ville, nom, type..."
          placeholderTextColor={colors.light}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.mid} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Catégories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c.label}
            style={[styles.catBtn, cat === c.value && styles.catBtnActive]}
            onPress={() => setCat(c.value === cat ? null : c.value)}
          >
            <Text style={[styles.catText, cat === c.value && styles.catTextActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lieux */}
      <FlatList
        data={filtered}
        keyExtractor={v => String(v.id)}
        renderItem={({ item }) => (
          <VenueCard
            venue={item}
            isFav={favs.includes(item.id)}
            onPress={() => navigation.navigate('VenueDetail', { venueId: item.id })}
            onFav={() => onFav(item.id)}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>
            {filtered.length} lieu{filtered.length > 1 ? 'x' : ''} disponible{filtered.length > 1 ? 's' : ''}
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={colors.light} />
            <Text style={styles.emptyText}>Aucun lieu trouvé</Text>
            <Text style={styles.emptySubText}>Essayez d'autres termes de recherche</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  welcome: { fontSize: typography.small, color: colors.mid },
  logo: { fontSize: 26, fontWeight: '900', color: colors.dark },
  logoBlue: { color: colors.primary },
  avatarBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: typography.body },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, marginHorizontal: spacing.lg, borderRadius: radius.md, padding: spacing.md, borderWidth: 1.5, borderColor: colors.border, marginBottom: spacing.md, gap: spacing.sm },
  searchInput: { flex: 1, fontSize: typography.body, color: colors.dark },
  catScroll: { marginBottom: spacing.md },
  catBtn: { backgroundColor: colors.white, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, marginRight: spacing.sm, borderWidth: 1.5, borderColor: colors.border },
  catBtnActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  catText: { fontSize: typography.small, color: colors.mid, fontWeight: '600' },
  catTextActive: { color: colors.primary },
  sectionTitle: { fontSize: typography.small, fontWeight: '700', color: colors.mid, marginBottom: spacing.md, marginTop: spacing.xs },
  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.sm },
  emptyText: { fontSize: typography.h3, fontWeight: '700', color: colors.mid },
  emptySubText: { fontSize: typography.small, color: colors.light },
});
