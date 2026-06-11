/**
 * HomeScreen — accueil "Luxury Minimal" 2026.
 * Header prénom + sous-titre contextuel (pas de logo), recherche pill,
 * chips catégories Ionicons (sans emoji), section "Coups de cœur"
 * horizontale avec snap, section "Près de vous" en liste 1 colonne,
 * skeleton loader fidèle aux cards.
 */
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, TextInput, RefreshControl, StatusBar, Modal,
  ActivityIndicator, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Reanimated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Store } from '../../utils/store';
import { aiSearchVenues } from '../../utils/aiSearch';
import VenueCard from '../../components/VenueCard';
import { HomeScreenSkeleton } from '../../components/SkeletonLoader';
import { hapticSelection } from '../../utils/haptics';
import { spacing, radius, animation } from '../../theme/tokens';

const CATEGORIES = [
  { label: 'Tous',      value: null,                 icon: 'sparkles-outline',  iconActive: 'sparkles' },
  { label: 'Mariage',   value: 'Château',            icon: 'diamond-outline',   iconActive: 'diamond' },
  { label: 'Soirée',    value: 'Rooftop',            icon: 'moon-outline',      iconActive: 'moon' },
  { label: 'Séminaire', value: 'Loft',               icon: 'briefcase-outline', iconActive: 'briefcase' },
  { label: 'Anniv.',    value: 'Salle de réception', icon: 'gift-outline',      iconActive: 'gift' },
  { label: 'Atypique',  value: '__atypique__',       icon: 'color-wand-outline', iconActive: 'color-wand' },
  { label: 'Photo',     value: 'Studio photo',       icon: 'camera-outline',    iconActive: 'camera' },
  { label: 'Plein air', value: 'Jardin',             icon: 'leaf-outline',      iconActive: 'leaf' },
];

const FEATURED_CARD_WIDTH = 280;

// Villes extraites des lieux chargés
const buildCities = (list) => ['Toutes', ...new Set((list || []).map(v => v.city).filter(Boolean).sort())];

export default function HomeScreen({ navigation }) {
  const { user, favorites, toggleFavorite } = useApp();
  const { semantic, isDark, shadow } = useTheme();
  const s = useMemo(() => themedStyles(semantic, isDark, shadow), [semantic, isDark, shadow]);

  const [search, setSearch] = useState('');
  const [cat, setCat] = useState(null);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableIds, setAvailableIds] = useState(null);
  const [selectedCity, setSelectedCity] = useState('Toutes');
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const insets = useSafeAreaInsets();
  const contentFade = useRef(new Animated.Value(0)).current;

  const loadVenues = useCallback(async (forceRefresh = false) => {
    try {
      const data = await Store.getVenues({ forceRefresh });
      setVenues((data || []).filter(v => v.published !== false));
    } catch {
      setVenues([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadVenues(false);
  }, [loadVenues]));

  useEffect(() => {
    if (!loading) {
      Animated.timing(contentFade, {
        toValue: 1, duration: animation.base, useNativeDriver: true,
      }).start();
    }
  }, [loading, contentFade]);

  const onRefresh = () => {
    setRefreshing(true);
    loadVenues(true);
  };

  const CITIES = useMemo(() => buildCities(venues), [venues]);

  useEffect(() => {
    if (!selectedDate) { setAvailableIds(null); return; }
    Store.getAvailableVenueIds(selectedDate).then(setAvailableIds).catch(() => setAvailableIds([]));
  }, [selectedDate]);

  const filtered = useMemo(() => {
    if (aiResults) return aiResults.results;
    return venues.filter(v => {
      const matchSearch = !search ||
        (v.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.city || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.location || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = !cat
        ? true
        : cat === '__atypique__'
          ? v.atypique === true
          : v.type === cat;
      const matchPrice = !maxPrice || (v.price || 0) <= Number(maxPrice);
      const matchCap = !minCapacity || (v.capacity || 0) >= Number(minCapacity);
      const matchCity = selectedCity === 'Toutes' || (v.city || '') === selectedCity;
      const matchDate = !selectedDate || !availableIds || availableIds.includes(v.id);
      return matchSearch && matchCat && matchPrice && matchCap && matchCity && matchDate;
    });
  }, [venues, search, cat, maxPrice, minCapacity, selectedCity, selectedDate, availableIds, aiResults]);

  const hasActiveQuery = Boolean(search || cat || maxPrice || minCapacity || selectedCity !== 'Toutes' || selectedDate || aiResults);

  // Coups de cœur : lieux les mieux notés (affichés seulement sans recherche active)
  const featured = useMemo(() => {
    if (hasActiveQuery) return [];
    return [...venues]
      .filter(v => (v.rating || 0) > 0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);
  }, [venues, hasActiveQuery]);

  const hasFilters = maxPrice || minCapacity || selectedCity !== 'Toutes' || selectedDate;
  const firstName = user?.name?.split(' ')[0] || '';

  const handleAiSearch = () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      const result = aiSearchVenues(aiQuery, venues);
      setAiResults(result);
      setAiLoading(false);
      setAiOpen(false);
      setSearch('');
      setCat(null);
      setMaxPrice('');
      setMinCapacity('');
      setSelectedCity('Toutes');
    }, 900);
  };

  const clearAi = () => { setAiResults(null); setAiQuery(''); };

  const sectionLabel = aiResults
    ? aiResults.summary
    : hasActiveQuery
      ? `${filtered.length} lieu${filtered.length > 1 ? 'x' : ''} trouvé${filtered.length > 1 ? 's' : ''}`
      : 'Près de vous';

  const renderHeader = () => (
    <View>
      {/* Header : prénom + sous-titre contextuel */}
      <View style={[styles.headerRow, { paddingTop: insets.top + spacing.lg }]}>
        <View style={{ flex: 1 }}>
          <Text style={s.greeting}>Bonjour{firstName ? ` ${firstName}` : ''},</Text>
          <Text style={s.headline}>Où célébrer ?</Text>
        </View>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => { hapticSelection(); navigation.navigate('MapSearch'); }}
          activeOpacity={0.8}
          accessibilityLabel="Explorer la carte"
        >
          <Ionicons name="map-outline" size={20} color={semantic.text} />
        </TouchableOpacity>
      </View>

      {/* Recherche pill + filtres */}
      {!aiResults && (
        <View style={styles.searchRow}>
          <View style={s.searchBar}>
            <Ionicons name="search-outline" size={18} color={semantic.textMuted} />
            <TextInput
              style={s.searchInput}
              placeholder="Ville, nom, type d'espace…"
              placeholderTextColor={semantic.textFaint}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={17} color={semantic.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[s.filterBtn, hasFilters && s.filterBtnActive]}
            onPress={() => setFilterOpen(true)}
            accessibilityLabel="Filtres avancés"
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={hasFilters ? semantic.primaryForeground : semantic.text}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Assistant IA */}
      <TouchableOpacity
        style={[s.aiBtn, aiResults && s.aiBtnActive]}
        onPress={aiResults ? clearAi : () => setAiOpen(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="sparkles-outline" size={16} color={semantic.primary} />
        <Text style={s.aiBtnText} numberOfLines={1}>
          {aiResults ? aiResults.summary : 'Décrivez votre événement en texte libre…'}
        </Text>
        <Ionicons
          name={aiResults ? 'close-circle' : 'arrow-forward-circle'}
          size={18}
          color={semantic.primary}
        />
      </TouchableOpacity>

      {/* Chips catégories — Ionicons, sans emoji */}
      {!aiResults && (
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={styles.catScroll} contentContainerStyle={styles.catContent}
        >
          {CATEGORIES.map(c => {
            const active = cat === c.value;
            return (
              <TouchableOpacity
                key={c.label}
                style={[s.catBtn, active && s.catBtnActive]}
                onPress={() => { hapticSelection(); setCat(active ? null : c.value); }}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={active ? c.iconActive : c.icon}
                  size={14}
                  color={active ? semantic.primaryForeground : semantic.textMuted}
                />
                <Text style={[s.catText, active && s.catTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Coups de cœur — carrousel horizontal avec snap */}
      {featured.length > 0 && (
        <View style={{ marginBottom: spacing.sm }}>
          <Text style={s.sectionTitle}>Coups de cœur</Text>
          <FlatList
            data={featured}
            horizontal
            keyExtractor={v => `featured-${v.id}`}
            showsHorizontalScrollIndicator={false}
            snapToInterval={FEATURED_CARD_WIDTH + spacing.md}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
            renderItem={({ item, index }) => (
              <Reanimated.View entering={FadeInRight.delay(Math.min(index, 5) * 80).springify().damping(18)}>
                <VenueCard
                  venue={item}
                  width={FEATURED_CARD_WIDTH}
                  isFav={favorites.includes(item.id)}
                  onPress={() => navigation.navigate('VenueDetail', { venue: item, venueId: item.id })}
                  onFav={() => toggleFavorite(item.id)}
                />
              </Reanimated.View>
            )}
          />
        </View>
      )}

      <Text style={[s.sectionTitle, aiResults && s.sectionTitleAi]}>{sectionLabel}</Text>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={semantic.bg} />

      {loading ? (
        <View style={{ paddingTop: insets.top + spacing.lg }}>
          <HomeScreenSkeleton />
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: contentFade }}>
          <FlatList
            data={filtered}
            keyExtractor={v => String(v.id)}
            renderItem={({ item, index }) => (
              <Reanimated.View
                entering={FadeInDown.delay(Math.min(index, 6) * 70).springify().damping(18)}
                style={{ paddingHorizontal: spacing.lg }}
              >
                <VenueCard
                  venue={item}
                  isFav={favorites.includes(item.id)}
                  onPress={() => navigation.navigate('VenueDetail', { venue: item, venueId: item.id })}
                  onFav={() => toggleFavorite(item.id)}
                />
              </Reanimated.View>
            )}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                tintColor={semantic.primary} colors={[semantic.primary]} />
            }
            ListHeaderComponent={renderHeader()}
            ListEmptyComponent={
              <View style={styles.empty}>
                <View style={s.emptyIconWrap}>
                  <Ionicons name="search-outline" size={28} color={semantic.textMuted} />
                </View>
                <Text style={s.emptyTitle}>Aucun résultat</Text>
                <Text style={s.emptySubtitle}>
                  {aiResults
                    ? "L'IA n'a pas trouvé de lieu. Essayez d'être plus précis."
                    : "Essayez d'autres termes ou explorez la carte"}
                </Text>
                {aiResults ? (
                  <TouchableOpacity style={s.emptyMapBtn} onPress={clearAi}>
                    <Ionicons name="arrow-undo-outline" size={16} color={semantic.primaryForeground} />
                    <Text style={s.emptyMapBtnText}>Retour à la liste</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={s.emptyMapBtn} onPress={() => navigation.navigate('MapSearch')}>
                    <Ionicons name="map-outline" size={16} color={semantic.primaryForeground} />
                    <Text style={s.emptyMapBtnText}>Explorer la carte</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </Animated.View>
      )}

      {/* Modal IA */}
      <Modal visible={aiOpen} transparent animationType="slide" onRequestClose={() => setAiOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setAiOpen(false)} />
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <View style={{ marginBottom: spacing.md }}>
              <Text style={s.modalTitle}>Assistant IA</Text>
              <Text style={s.modalSub}>Décrivez votre événement en langage naturel — l'IA trouve les lieux pour vous.</Text>
            </View>
            <View style={{ marginBottom: spacing.md, gap: 6 }}>
              {[
                '"Anniversaire 30 ans, 40 personnes, Paris, budget 800€"',
                '"Mariage champêtre 150 invités en Provence"',
                '"Soirée atypique sur une péniche à Paris"',
              ].map((ex, i) => (
                <TouchableOpacity key={i} style={s.aiExampleBtn} onPress={() => setAiQuery(ex.replace(/"/g, ''))}>
                  <Text style={s.aiExampleText}>{ex}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={s.aiInput}
              placeholder="Ex : anniversaire 30 ans pour 40 personnes à Paris, budget 800€…"
              placeholderTextColor={semantic.textFaint}
              value={aiQuery} onChangeText={setAiQuery}
              multiline numberOfLines={3} textAlignVertical="top" autoFocus
            />
            <TouchableOpacity
              style={[s.primaryBtn, (!aiQuery.trim() || aiLoading) && { opacity: 0.5 }]}
              onPress={handleAiSearch} disabled={!aiQuery.trim() || aiLoading}
            >
              {aiLoading
                ? <ActivityIndicator color={semantic.primaryForeground} size="small" />
                : <>
                    <Text style={s.primaryBtnText}>Trouver les lieux</Text>
                    <Ionicons name="arrow-forward" size={18} color={semantic.primaryForeground} />
                  </>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Filtres */}
      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setFilterOpen(false)} />
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>Filtres avancés</Text>

          <Text style={s.filterLabel}>Ville</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
              {CITIES.map(city => (
                <TouchableOpacity
                  key={city}
                  style={[s.cityChip, selectedCity === city && s.cityChipActive]}
                  onPress={() => setSelectedCity(city)}
                >
                  <Text style={[s.cityChipText, selectedCity === city && s.cityChipTextActive]}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={s.filterLabel}>Prix maximum (€/heure)</Text>
          <TextInput
            style={s.filterInput} value={maxPrice} onChangeText={setMaxPrice}
            placeholder="Ex : 2000" placeholderTextColor={semantic.textFaint} keyboardType="number-pad"
          />
          <Text style={s.filterLabel}>Capacité minimum (personnes)</Text>
          <TextInput
            style={s.filterInput} value={minCapacity} onChangeText={setMinCapacity}
            placeholder="Ex : 50" placeholderTextColor={semantic.textFaint} keyboardType="number-pad"
          />
          <Text style={s.filterLabel}>Date de disponibilité (AAAA-MM-JJ)</Text>
          <TextInput
            style={s.filterInput} value={selectedDate} onChangeText={setSelectedDate}
            placeholder="Ex : 2026-06-15" placeholderTextColor={semantic.textFaint}
          />
          <TouchableOpacity style={s.primaryBtn} onPress={() => setFilterOpen(false)}>
            <Text style={s.primaryBtnText}>Appliquer les filtres</Text>
          </TouchableOpacity>
          {!!hasFilters && (
            <TouchableOpacity style={s.clearBtn} onPress={() => {
              setMaxPrice(''); setMinCapacity(''); setSelectedCity('Toutes'); setSelectedDate(''); setFilterOpen(false);
            }}>
              <Text style={s.clearBtnText}>Réinitialiser</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
}

// Styles indépendants du thème
const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.lg,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, marginBottom: spacing.sm, gap: spacing.sm,
  },
  catScroll: { flexGrow: 0, marginBottom: spacing.lg },
  catContent: { paddingHorizontal: spacing.lg, paddingVertical: 2, gap: 8, alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 48, gap: spacing.md, paddingHorizontal: spacing.lg },
});

function themedStyles(c, isDark, shadow) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    greeting: { fontSize: 14, color: c.textMuted, fontWeight: '500' },
    headline: {
      fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
      fontSize: 28, color: c.text, marginTop: 2, letterSpacing: -0.4,
    },
    iconBtn: {
      width: 44, height: 44, borderRadius: radius.full,
      backgroundColor: c.surface,
      alignItems: 'center', justifyContent: 'center',
      ...shadow.sm,
    },
    searchBar: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      backgroundColor: c.surface, borderRadius: radius.full,
      paddingHorizontal: spacing.lg, height: 48, gap: spacing.sm,
      ...shadow.sm,
    },
    searchInput: { flex: 1, fontSize: 15, color: c.text },
    filterBtn: {
      width: 48, height: 48, borderRadius: radius.full,
      backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center',
      ...shadow.sm,
    },
    filterBtnActive: { backgroundColor: c.primary },
    aiBtn: {
      marginHorizontal: spacing.lg, marginBottom: spacing.md,
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: c.primarySoft, borderRadius: radius.md,
      paddingHorizontal: spacing.md, minHeight: 44,
    },
    aiBtnActive: { backgroundColor: c.primarySoft },
    aiBtnText: { flex: 1, fontSize: 13, color: c.textMuted, fontWeight: '500' },
    catBtn: {
      flexDirection: 'row', alignItems: 'center', height: 36,
      backgroundColor: 'transparent', borderRadius: radius.full, paddingHorizontal: 14,
      borderWidth: 1, borderColor: c.border, gap: 6,
    },
    catBtnActive: { backgroundColor: c.primary, borderColor: c.primary },
    catText: { fontSize: 13, color: c.textMuted, fontWeight: '600' },
    catTextActive: { color: c.primaryForeground },
    sectionTitle: {
      fontSize: 12, fontWeight: '700', color: c.textMuted,
      marginBottom: spacing.md, marginTop: spacing.xs,
      letterSpacing: 1, textTransform: 'uppercase',
      paddingHorizontal: spacing.lg,
    },
    sectionTitleAi: { color: c.primary, textTransform: 'none', letterSpacing: 0, fontSize: 13 },
    emptyIconWrap: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center',
      ...shadow.sm,
    },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: c.text },
    emptySubtitle: { fontSize: 13, color: c.textFaint, textAlign: 'center', maxWidth: 260 },
    emptyMapBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: c.primary, borderRadius: radius.full,
      paddingHorizontal: spacing.xl, height: 44, marginTop: spacing.sm,
    },
    emptyMapBtnText: { color: c.primaryForeground, fontWeight: '700', fontSize: 13 },
    modalOverlay: { flex: 1, backgroundColor: c.overlay },
    modalSheet: {
      backgroundColor: c.bg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
      padding: spacing.lg, paddingBottom: 40,
    },
    modalHandle: {
      width: 40, height: 4, borderRadius: 2,
      backgroundColor: c.border, alignSelf: 'center', marginBottom: spacing.lg,
    },
    modalTitle: {
      fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
      fontSize: 22, color: c.text, marginBottom: spacing.xs,
    },
    modalSub: { fontSize: 13, color: c.textMuted, lineHeight: 18 },
    aiExampleBtn: {
      backgroundColor: c.primarySoft, borderRadius: radius.sm,
      paddingHorizontal: 12, paddingVertical: 9,
    },
    aiExampleText: { fontSize: 12, color: c.primary, fontStyle: 'italic' },
    aiInput: {
      backgroundColor: c.surface, borderRadius: radius.md,
      paddingHorizontal: spacing.md, paddingVertical: 12,
      fontSize: 15, color: c.text, minHeight: 80, marginBottom: spacing.md,
    },
    primaryBtn: {
      backgroundColor: c.primary, borderRadius: radius.md, height: 52,
      alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
      marginBottom: spacing.sm, marginTop: spacing.xs,
    },
    primaryBtnText: { color: c.primaryForeground, fontWeight: '700', fontSize: 15 },
    filterLabel: { fontSize: 13, fontWeight: '700', color: c.textMuted, marginBottom: spacing.sm, marginTop: spacing.sm },
    filterInput: {
      backgroundColor: c.surface, borderRadius: radius.sm,
      paddingHorizontal: spacing.md, height: 48,
      fontSize: 15, color: c.text, marginBottom: spacing.sm,
    },
    cityChip: {
      paddingHorizontal: 14, height: 38, borderRadius: radius.full,
      borderWidth: 1, borderColor: c.border, backgroundColor: 'transparent',
      alignItems: 'center', justifyContent: 'center',
    },
    cityChipActive: { backgroundColor: c.primary, borderColor: c.primary },
    cityChipText: { fontSize: 13, fontWeight: '600', color: c.text },
    cityChipTextActive: { color: c.primaryForeground },
    clearBtn: {
      borderRadius: radius.md, height: 48, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: c.border,
    },
    clearBtnText: { color: c.textMuted, fontWeight: '600', fontSize: 15 },
  });
}
