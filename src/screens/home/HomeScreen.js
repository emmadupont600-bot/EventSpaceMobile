import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, TextInput, RefreshControl, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Store } from '../../utils/store';
import VenueCard from '../../components/VenueCard';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const CATEGORIES = [
  { label: 'Tous', value: null, icon: 'grid' },
  { label: 'Mariage', value: 'Château', icon: 'heart' },
  { label: 'Soirée', value: 'Rooftop', icon: 'star' },
  { label: 'Séminaire', value: 'Loft', icon: 'briefcase' },
  { label: 'Anniversaire', value: 'Salle de réception', icon: 'gift' },
  { label: 'Photo', value: 'Studio photo', icon: 'camera' },
  { label: 'Plein air', value: 'Jardin', icon: 'sun' },
];

export default function HomeScreen({ navigation }) {
  const [venues, setVenues] = useState([]);
  const [favs, setFavs] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState(null);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
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

  // Sécurisé : pas de crash si firstName est undefined/null
  const firstName = user?.firstName || user?.name?.split(' ')[0] || '';
  const avatarLetter = firstName ? firstName[0].toUpperCase() : '?';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Bonjour{firstName ? `, ${firstName}` : ''} 👋</Text>
          <Text style={styles.logo}>Event<Text style={styles.logoAccent}>Space</Text></Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('MapSearch')}
            activeOpacity={0.75}
          >
            <Feather name="map-pin" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profil')}
            style={styles.avatarBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Search bar ─── */}
      <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
        <Feather name="search" size={17} color={searchFocused ? colors.primary : colors.mid} />
        <TextInput
          style={styles.searchInput}
          placeholder="Ville, nom, type d'espace..."
          placeholderTextColor={colors.light}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="x" size={17} color={colors.mid} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.mapPill}
            onPress={() => navigation.navigate('MapSearch')}
            activeOpacity={0.75}
          >
            <Feather name="map" size={12} color={colors.primary} />
            <Text style={styles.mapPillText}>Carte</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Catégories ─── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catScrollContent}
      >
        {CATEGORIES.map(c => {
          const active = cat === c.value;
          return (
            <TouchableOpacity
              key={c.label}
              style={[styles.catBtn, active && styles.catBtnActive]}
              onPress={() => setCat(active ? null : c.value)}
              activeOpacity={0.75}
            >
              <Feather
                name={c.icon}
                size={12}
                color={active ? '#fff' : colors.mid}
              />
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
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          filtered.length > 0 ? (
            <Text style={styles.sectionTitle}>
              {filtered.length} lieu{filtered.length > 1 ? 'x' : ''} disponible{filtered.length > 1 ? 's' : ''}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Feather name="search" size={26} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Aucun résultat</Text>
            <Text style={styles.emptySubtitle}>Essayez d'autres termes ou explorez la carte</Text>
            <TouchableOpacity
              style={styles.emptyMapBtn}
              onPress={() => navigation.navigate('MapSearch')}
              activeOpacity={0.85}
            >
              <Feather name="map-pin" size={13} color="#fff" />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerLeft: { flex: 1 },
  greeting: {
    fontSize: typography.small,
    color: colors.mid,
    fontWeight: '500',
    marginBottom: 1,
  },
  logo: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.dark,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  logoAccent: { color: colors.primary },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
    shadowColor: colors.primary,
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: typography.body },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadow.xs,
  },
  searchBarFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body,
    color: colors.dark,
    paddingVertical: 0,
  },
  mapPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  mapPillText: { fontSize: 12, fontWeight: '700', color: colors.primary },

  catScroll: { marginBottom: spacing.xs },
  catScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  catBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catText: {
    fontSize: typography.small,
    color: colors.mid,
    fontWeight: '600',
  },
  catTextActive: { color: '#fff' },

  listContent: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.small,
    fontWeight: '700',
    color: colors.mid,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.md },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: colors.dark,
  },
  emptySubtitle: {
    fontSize: typography.small,
    color: colors.light,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 20,
  },
  emptyMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    ...shadow.sm,
    shadowColor: colors.primary,
  },
  emptyMapBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: typography.small,
  },
});
