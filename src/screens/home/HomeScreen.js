import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, TextInput, RefreshControl, StatusBar, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { VENUES } from '../../data/venues';
import VenueCard from '../../components/VenueCard';
import { HomeScreenSkeleton } from '../../components/SkeletonLoader';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const CATEGORIES = [
  { label: 'Tous',         value: null,                  emoji: '✨' },
  { label: 'Mariage',      value: 'Château',             emoji: '💍' },
  { label: 'Soirée',       value: 'Rooftop',             emoji: '🌙' },
  { label: 'Séminaire',    value: 'Loft',                emoji: '💼' },
  { label: 'Anniversaire', value: 'Salle de réception',  emoji: '🎂' },
  { label: 'Photo',        value: 'Studio photo',        emoji: '📸' },
  { label: 'Plein air',    value: 'Jardin',              emoji: '🌿' },
];

// Favoris stockés en mémoire (pas AsyncStorage)
const memFavs = {};

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [favs, setFavs] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const insets = useSafeAreaInsets();

  const load = useCallback(() => {
    setLoading(true);
    // Charge les favoris depuis la mémoire
    if (user?.id) {
      setFavs(memFavs[user.id] || []);
    }
    // Simule un petit délai pour le skeleton
    setTimeout(() => setLoading(false), 400);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { load(); setRefreshing(false); }, 600);
  };

  const onFav = (venueId) => {
    if (!user) {
      // RootNavigator redirige automatiquement si user=null via logout
      // On ne peut pas navigate('Login') depuis un tab imbriqué
      return;
    }
    const uid = user.id;
    const current = memFavs[uid] || [];
    const idx = current.indexOf(venueId);
    const updated = idx >= 0 ? current.filter(x => x !== venueId) : [...current, venueId];
    memFavs[uid] = updated;
    setFavs(updated);
  };

  const venues = useMemo(() => (VENUES || []).filter(v => v.published !== false), []);

  const filtered = useMemo(() => venues.filter(v => {
    const matchSearch = !search ||
      (v.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.location || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !cat || v.type === cat;
    const matchPrice = !maxPrice || (v.price || 0) <= Number(maxPrice);
    const matchCap = !minCapacity || (v.capacity || 0) >= Number(minCapacity);
    return matchSearch && matchCat && matchPrice && matchCap;
  }), [venues, search, cat, maxPrice, minCapacity]);

  const hasFilters = maxPrice || minCapacity;
  const firstName = user?.name?.split(' ')[0] || user?.firstName || '';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour{firstName ? `, ${firstName}` : ''} 👋</Text>
          <Text style={styles.logo}>Event<Text style={styles.logoAccent}>Space</Text></Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MapSearch')}>
          <Text style={styles.iconBtnEmoji}>🗺️</Text>
        </TouchableOpacity>
      </View>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.mid} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ville, nom, type d'espace..."
            placeholderTextColor={colors.light}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ fontSize: 14 }}>❌</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, hasFilters && styles.filterBtnActive]}
          onPress={() => setFilterOpen(true)}
        >
          <Text style={{ fontSize: 16 }}>🎯</Text>
          {hasFilters && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Catégories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catContent}
      >
        {CATEGORIES.map(c => {
          const active = cat === c.value;
          return (
            <TouchableOpacity
              key={c.label}
              style={[styles.catBtn, active && styles.catBtnActive]}
              onPress={() => setCat(active ? null : c.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.catEmoji}>{c.emoji}</Text>
              <Text style={[styles.catText, active && styles.catTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Contenu */}
      {loading ? (
        <HomeScreenSkeleton />
      ) : (
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
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
              tintColor={colors.primary} colors={[colors.primary]} />
          }
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {filtered.length} lieu{filtered.length > 1 ? 'x' : ''} disponible{filtered.length > 1 ? 's' : ''}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIco}>🔍</Text>
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptySubtitle}>Essayez d'autres termes ou explorez la carte</Text>
              <TouchableOpacity style={styles.emptyMapBtn} onPress={() => navigation.navigate('MapSearch')}>
                <Text>🗺️</Text>
                <Text style={styles.emptyMapBtnText}>Explorer la carte</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Modal filtre */}
      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterOpen(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>🎯 Filtres avancés</Text>

          <Text style={styles.filterLabel}>💶 Prix maximum (€/heure)</Text>
          <TextInput
            style={styles.filterInput}
            value={maxPrice}
            onChangeText={setMaxPrice}
            placeholder="Ex: 2000"
            placeholderTextColor={colors.light}
            keyboardType="number-pad"
          />

          <Text style={styles.filterLabel}>👥 Capacité minimum (personnes)</Text>
          <TextInput
            style={styles.filterInput}
            value={minCapacity}
            onChangeText={setMinCapacity}
            placeholder="Ex: 50"
            placeholderTextColor={colors.light}
            keyboardType="number-pad"
          />

          <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterOpen(false)}>
            <Text style={styles.applyBtnText}>✅ Appliquer les filtres</Text>
          </TouchableOpacity>
          {hasFilters && (
            <TouchableOpacity style={styles.clearBtn} onPress={() => { setMaxPrice(''); setMinCapacity(''); setFilterOpen(false); }}>
              <Text style={styles.clearBtnText}>🗑️ Réinitialiser</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  greeting: { fontSize: typography.small, color: colors.mid, fontWeight: '500' },
  logo: { fontSize: 26, fontWeight: '900', color: colors.dark, letterSpacing: -0.5 },
  logoAccent: { color: colors.primary },
  iconBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnEmoji: { fontSize: 18 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, marginTop: spacing.xs, marginBottom: spacing.sm, gap: spacing.sm,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: 10,
    borderWidth: 1.5, borderColor: colors.border,
    gap: spacing.sm, ...shadow.xs,
  },
  searchInput: { flex: 1, fontSize: typography.body, color: colors.dark },
  filterBtn: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.border,
    position: 'relative',
  },
  filterBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  filterDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.error || '#EF4444',
  },
  catScroll: { marginBottom: spacing.xs, flexGrow: 0 },
  catContent: { paddingHorizontal: spacing.lg, paddingVertical: 2, gap: 6, alignItems: 'center' },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.white, borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  catBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catEmoji: { fontSize: 12, lineHeight: 16 },
  catText: { fontSize: 11, color: colors.mid, fontWeight: '500' },
  catTextActive: { color: '#fff', fontWeight: '600' },
  sectionTitle: {
    fontSize: typography.small, fontWeight: '700', color: colors.mid,
    marginBottom: spacing.md, marginTop: spacing.xs, letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.md },
  emptyIco: { fontSize: 44, marginBottom: spacing.sm },
  emptyTitle: { fontSize: typography.h3, fontWeight: '700', color: colors.dark },
  emptySubtitle: { fontSize: typography.small, color: colors.light, textAlign: 'center', maxWidth: 240 },
  emptyMapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    marginTop: spacing.sm, ...shadow.sm, shadowColor: colors.primary,
  },
  emptyMapBtnText: { color: '#fff', fontWeight: '700', fontSize: typography.small },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.lg, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.lg,
  },
  modalTitle: { fontSize: typography.h2, fontWeight: '900', color: colors.dark, marginBottom: spacing.lg },
  filterLabel: { fontSize: typography.small, fontWeight: '700', color: colors.mid, marginBottom: spacing.sm },
  filterInput: {
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: typography.body, color: colors.dark, marginBottom: spacing.lg,
  },
  applyBtn: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    paddingVertical: spacing.md, alignItems: 'center', marginBottom: spacing.sm,
  },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: typography.body },
  clearBtn: {
    borderRadius: radius.xl, paddingVertical: spacing.md,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.border,
  },
  clearBtnText: { color: colors.mid, fontWeight: '600', fontSize: typography.body },
});
