import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, TextInput, RefreshControl, StatusBar,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Store } from '../../utils/store';
import VenueCard from '../../components/VenueCard';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const CATEGORIES = [
  { label: 'Tous',        value: null,                emoji: '✨' },
  { label: 'Mariage',     value: 'Château',           emoji: '💍' },
  { label: 'Soirée',      value: 'Rooftop',           emoji: '🌙' },
  { label: 'Séminaire',   value: 'Loft',              emoji: '💼' },
  { label: 'Anniversaire',value: 'Salle de réception', emoji: '🎂' },
  { label: 'Photo',       value: 'Studio photo',      emoji: '📸' },
  { label: 'Plein air',   value: 'Jardin',            emoji: '🌿' },
];

export default function HomeScreen({ navigation }) {
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
    setVenues((v || []).filter(x => x.published));
    if (u) {
      const f = await Store.getFavorites(u.id);
      setFavs(f || []);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const onFav = async (venueId) => {
    if (!user) return navigation.navigate('Login');
    const added = await Store.toggleFavorite(user.id, venueId);
    setFavs(prev => added ? [...prev, venueId] : prev.filter(x => x !== venueId));
  };

  const filtered = venues.filter(v => {
    const matchSearch = !search ||
      (v.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.location || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !cat || v.type === cat;
    return matchSearch && matchCat;
  });

  const firstName = user?.firstName || user?.name?.split(' ')[0] || '';
  const avatarLetter = firstName ? firstName[0].toUpperCase() : '?';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour{firstName ? `, ${firstName}` : ''} 👋</Text>
          <Text style={styles.logo}>Event<Text style={styles.logoAccent}>Space</Text></Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MapSearch')}>
            <Ionicons name="map-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profil')}
            style={styles.avatarBtn}
          >
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Search bar ─── */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={17} color={colors.mid} />
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
            <Ionicons name="close-circle" size={18} color={colors.light} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.mapPill}
            onPress={() => navigation.navigate('MapSearch')}
          >
            <Ionicons name="map" size={12} color={colors.primary} />
            <Text style={styles.mapPillText}>Carte</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Catégories ─── */}
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

      {/* ─── Liste ─── */}
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
            <View style={styles.emptyIconWrap}>
              <Ionicons name="search-outline" size={30} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Aucun résultat</Text>
            <Text style={styles.emptySubtitle}>Essayez d'autres termes ou explorez la carte</Text>
            <TouchableOpacity style={styles.emptyMapBtn} onPress={() => navigation.navigate('MapSearch')}>
              <Ionicons name="map-outline" size={14} color="#fff" />
              <Text style={styles.emptyMapBtnText}>Explorer la carte</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.sm, shadowColor: colors.primary,
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: typography.body },

  /* Search */
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg, marginTop: spacing.xs, marginBottom: spacing.sm,
    borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: 11,
    borderWidth: 1.5, borderColor: colors.border,
    gap: spacing.sm, ...shadow.xs,
  },
  searchInput: { flex: 1, fontSize: typography.body, color: colors.dark },
  mapPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  mapPillText: { fontSize: 12, fontWeight: '700', color: colors.primary },

  /* Categories — fines et légères */
  catScroll: { marginBottom: spacing.xs },
  catContent: { paddingHorizontal: spacing.lg, paddingVertical: 4, gap: spacing.sm },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: 13, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  catBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catEmoji: { fontSize: 13 },
  catText: { fontSize: 12, color: colors.mid, fontWeight: '500', letterSpacing: 0.1 },
  catTextActive: { color: '#fff', fontWeight: '600' },

  /* List */
  sectionTitle: {
    fontSize: typography.small, fontWeight: '700', color: colors.mid,
    marginBottom: spacing.md, marginTop: spacing.xs, letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.md },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm,
  },
  emptyTitle: { fontSize: typography.h3, fontWeight: '700', color: colors.dark },
  emptySubtitle: { fontSize: typography.small, color: colors.light, textAlign: 'center', maxWidth: 240 },
  emptyMapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    marginTop: spacing.sm, ...shadow.sm, shadowColor: colors.primary,
  },
  emptyMapBtnText: { color: '#fff', fontWeight: '700', fontSize: typography.small },
});
