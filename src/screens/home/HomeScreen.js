import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, TextInput, RefreshControl, StatusBar, Modal,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { VENUES } from '../../data/venues';
import { aiSearchVenues } from '../../utils/aiSearch';
import VenueCard from '../../components/VenueCard';
import { HomeScreenSkeleton } from '../../components/SkeletonLoader';
import { colors, spacing, radius, shadow } from '../../theme/colors';

const CATEGORIES = [
  { label: 'Tous',      value: null,                  emoji: '✨' },
  { label: 'Mariage',   value: 'Château',             emoji: '💍' },
  { label: 'Soirée',    value: 'Rooftop',             emoji: '🌙' },
  { label: 'Séminaire', value: 'Loft',                emoji: '💼' },
  { label: 'Anniv.',    value: 'Salle de réception',  emoji: '🎂' },
  { label: 'Atypique',  value: '__atypique__',         emoji: '🦋' },
  { label: 'Photo',     value: 'Studio photo',        emoji: '📸' },
  { label: 'Plein air', value: 'Jardin',              emoji: '🌿' },
];

const CITIES = ['Toutes', ...new Set((VENUES || []).map(v => v.city).filter(Boolean).sort())];

export default function HomeScreen({ navigation }) {
  const { user, favorites, toggleFavorite } = useApp();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [selectedCity, setSelectedCity] = useState('Toutes');
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const insets = useSafeAreaInsets();

  useFocusEffect(useCallback(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []));

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const venues = useMemo(() => (VENUES || []).filter(v => v.published !== false), []);

  const filtered = useMemo(() => {
    if (aiResults) return aiResults.results;
    return venues.filter(v => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        (v.name || '').toLowerCase().includes(q) ||
        (v.city || '').toLowerCase().includes(q) ||
        (v.location || '').toLowerCase().includes(q);
      const matchCat = !cat
        ? true
        : cat === '__atypique__'
          ? v.atypique === true
          : v.type === cat;
      const matchPrice = !maxPrice || (v.price || 0) <= Number(maxPrice);
      const matchCap = !minCapacity || (v.capacity || 0) >= Number(minCapacity);
      const matchCity = selectedCity === 'Toutes' || (v.city || '') === selectedCity;
      return matchSearch && matchCat && matchPrice && matchCap && matchCity;
    });
  }, [venues, search, cat, maxPrice, minCapacity, selectedCity, aiResults]);

  const hasFilters = !!(maxPrice || minCapacity || selectedCity !== 'Toutes');
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
    }, 700);
  };

  const clearAi = () => { setAiResults(null); setAiQuery(''); };

  const sectionLabel = aiResults
    ? aiResults.summary
    : `${filtered.length} lieu${filtered.length > 1 ? 'x' : ''} disponible${filtered.length > 1 ? 's' : ''}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{getGreeting()}{firstName ? `, ${firstName}` : ' 👋'}</Text>
          <Text style={styles.logo}>Event<Text style={styles.logoAccent}>Space</Text></Text>
        </View>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate('MapSearch')}
          activeOpacity={0.85}
        >
          <Ionicons name="compass-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.aiBtn, aiResults && styles.aiBtnActive]}
        onPress={aiResults ? clearAi : () => setAiOpen(true)}
        activeOpacity={0.85}
      >
        <View style={styles.aiIconWrap}>
          <Text style={styles.aiBtnEmoji}>✨</Text>
        </View>
        <Text style={styles.aiBtnText} numberOfLines={1}>
          {aiResults ? aiResults.summary : 'Décrivez votre événement à l\'IA...'}
        </Text>
        {aiResults
          ? <Ionicons name="close-circle" size={20} color={colors.primary} />
          : <Ionicons name="arrow-forward-circle" size={20} color={colors.primary} />}
      </TouchableOpacity>

      {!aiResults && (
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ville, nom, type d'espace..."
              placeholderTextColor={colors.textLight}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, hasFilters && styles.filterBtnActive]}
            onPress={() => setFilterOpen(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="options-outline" size={20} color={hasFilters ? colors.primary : colors.text} />
            {hasFilters && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>
      )}

      {!aiResults && (
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
                activeOpacity={0.75}
              >
                <Text style={styles.catEmoji}>{c.emoji}</Text>
                <Text style={[styles.catText, active && styles.catTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {loading ? <HomeScreenSkeleton /> : (
        <FlatList
          data={filtered}
          keyExtractor={v => String(v.id)}
          renderItem={({ item }) => (
            <VenueCard
              venue={item}
              isFav={favorites.includes(item.id)}
              onPress={() => navigation.navigate('VenueDetail', { venue: item, venueId: item.id })}
              onFav={() => toggleFavorite(item.id)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 120 }}
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
            <Text style={[styles.sectionTitle, aiResults && styles.sectionTitleAi]}>
              {sectionLabel}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcoBox}>
                <Ionicons name="search-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptySubtitle}>
                {aiResults
                  ? "L'IA n'a pas trouvé de lieu. Essayez d'être plus précis."
                  : 'Essayez d\'autres termes ou explorez la carte'}
              </Text>
              {aiResults ? (
                <TouchableOpacity style={styles.emptyMapBtn} onPress={clearAi}>
                  <Ionicons name="arrow-back" size={14} color="#fff" />
                  <Text style={styles.emptyMapBtnText}>Retour à la liste</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.emptyMapBtn} onPress={() => navigation.navigate('MapSearch')}>
                  <Ionicons name="compass" size={14} color="#fff" />
                  <Text style={styles.emptyMapBtnText}>Découvrir par ville</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Modal IA */}
      <Modal visible={aiOpen} transparent animationType="slide" onRequestClose={() => setAiOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAiOpen(false)} />
          <View style={styles.aiSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.aiSheetHeader}>
              <Text style={styles.aiSheetTitle}>✨ Assistant IA</Text>
              <Text style={styles.aiSheetSub}>Décrivez votre événement en langage naturel — l'IA trouve les lieux pour vous.</Text>
            </View>
            <View style={styles.aiExamples}>
              {[
                'Anniversaire 30 ans, 40 personnes, Paris, budget 800€',
                'Mariage champêtre 150 invités en Provence',
                'Soirée atypique sur une péniche à Paris',
              ].map((ex, i) => (
                <TouchableOpacity key={i} style={styles.aiExampleBtn} onPress={() => setAiQuery(ex)}>
                  <Ionicons name="sparkles" size={12} color={colors.primary} />
                  <Text style={styles.aiExampleText}>"{ex}"</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.aiInput}
              placeholder="Ex: anniversaire 30 ans pour 40 personnes à Paris, budget 800€..."
              placeholderTextColor={colors.textLight}
              value={aiQuery}
              onChangeText={setAiQuery}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              autoFocus
            />
            <TouchableOpacity
              style={[styles.aiSearchBtn, (!aiQuery.trim() || aiLoading) && styles.aiSearchBtnDisabled]}
              onPress={handleAiSearch}
              disabled={!aiQuery.trim() || aiLoading}
              activeOpacity={0.9}
            >
              {aiLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <>
                    <Ionicons name="sparkles" size={18} color="#fff" />
                    <Text style={styles.aiSearchBtnText}>Trouver les lieux</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Filtres */}
      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterOpen(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtres avancés</Text>
            {hasFilters && (
              <TouchableOpacity onPress={() => {
                setMaxPrice(''); setMinCapacity(''); setSelectedCity('Toutes');
              }}>
                <Text style={styles.resetTxt}>Réinitialiser</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.filterLabel}>📍 Ville</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
              {CITIES.map(city => (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityChip, selectedCity === city && styles.cityChipActive]}
                  onPress={() => setSelectedCity(city)}
                >
                  <Text style={[styles.cityChipText, selectedCity === city && styles.cityChipTextActive]}>{city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.filterLabel}>💶 Prix maximum (€/heure)</Text>
          <TextInput
            style={styles.filterInput}
            value={maxPrice}
            onChangeText={setMaxPrice}
            placeholder="Ex : 2000"
            placeholderTextColor={colors.textLight}
            keyboardType="number-pad"
          />
          <Text style={styles.filterLabel}>👥 Capacité minimum (personnes)</Text>
          <TextInput
            style={styles.filterInput}
            value={minCapacity}
            onChangeText={setMinCapacity}
            placeholder="Ex : 50"
            placeholderTextColor={colors.textLight}
            keyboardType="number-pad"
          />

          <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterOpen(false)} activeOpacity={0.9}>
            <Text style={styles.applyBtnText}>Voir les {filtered.length} résultat{filtered.length > 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Bonne nuit';
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bel après-midi';
  return 'Bonsoir';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  greeting: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  logo: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  logoAccent: { color: colors.primary },
  iconBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },

  aiBtn: {
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, paddingVertical: 11,
    borderWidth: 1.5, borderColor: colors.primary + '40', borderStyle: 'dashed',
  },
  aiBtnActive: { borderStyle: 'solid', borderColor: colors.primary, backgroundColor: colors.primaryLight },
  aiIconWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  aiBtnEmoji: { fontSize: 14 },
  aiBtnText: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '600' },

  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, marginBottom: spacing.sm, gap: spacing.sm,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    borderWidth: 1.5, borderColor: colors.border, gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  filterBtn: {
    width: 46, height: 46, borderRadius: radius.lg,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.border, position: 'relative',
  },
  filterBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  filterDot: {
    position: 'absolute', top: 6, right: 6,
    width: 9, height: 9, borderRadius: 5, backgroundColor: colors.error,
    borderWidth: 1.5, borderColor: colors.surface,
  },

  catScroll: { flexGrow: 0, marginBottom: spacing.sm },
  catContent: { paddingHorizontal: spacing.lg, paddingVertical: 4, gap: 8 },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', height: 36,
    backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 14,
    borderWidth: 1, borderColor: colors.border, gap: 6,
  },
  catBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary, ...shadow.primary },
  catEmoji: { fontSize: 14 },
  catText: { fontSize: 13, color: colors.text, fontWeight: '700' },
  catTextActive: { color: '#fff' },

  sectionTitle: {
    fontSize: 12, fontWeight: '800', color: colors.textSecondary,
    marginBottom: spacing.md, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  sectionTitleAi: { color: colors.primary, textTransform: 'none', fontSize: 13, fontWeight: '700', letterSpacing: 0 },

  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.md },
  emptyIcoBox: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', maxWidth: 280, lineHeight: 18 },
  emptyMapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingHorizontal: spacing.xl, paddingVertical: 12, marginTop: spacing.sm,
    ...shadow.primary,
  },
  emptyMapBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: colors.overlay },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.lg,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: -0.3 },
  resetTxt: { fontSize: 13, color: colors.error, fontWeight: '700' },

  aiSheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: spacing.lg, paddingBottom: 40,
  },
  aiSheetHeader: { marginBottom: spacing.md },
  aiSheetTitle: { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: 4, letterSpacing: -0.3 },
  aiSheetSub: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  aiExamples: { marginBottom: spacing.md, gap: 6 },
  aiExampleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primaryLight, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 10,
  },
  aiExampleText: { fontSize: 12, color: colors.primary, fontStyle: 'italic', flex: 1 },
  aiInput: {
    backgroundColor: colors.background, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.primary,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: 15, color: colors.text, minHeight: 80, marginBottom: spacing.md,
  },
  aiSearchBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
    ...shadow.primary,
  },
  aiSearchBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  aiSearchBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  modalSheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.lg, paddingBottom: 40,
  },
  filterLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  filterInput: {
    backgroundColor: colors.background, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: 15, color: colors.text, marginBottom: spacing.lg,
  },
  cityChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface,
  },
  cityChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  cityChipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  cityChipTextActive: { color: '#fff' },
  applyBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 15, alignItems: 'center', ...shadow.primary,
  },
  applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
