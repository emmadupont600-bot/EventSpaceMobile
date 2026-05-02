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
import { colors, spacing, typography, radius } from '../../theme/colors';

const CATEGORIES = [
  { label: 'Tous',      value: null,                 emoji: '✨' },
  { label: 'Mariage',   value: 'Château',            emoji: '💍' },
  { label: 'Soirée',    value: 'Rooftop',            emoji: '🌙' },
  { label: 'Séminaire', value: 'Loft',               emoji: '💼' },
  { label: 'Anniv.',    value: 'Salle de réception', emoji: '🎂' },
  { label: 'Atypique',  value: '__atypique__',        emoji: '🦋' },
  { label: 'Photo',     value: 'Studio photo',       emoji: '📸' },
  { label: 'Plein air', value: 'Jardin',             emoji: '🌿' },
];

export default function HomeScreen({ navigation }) {
  const { user, favorites, toggleFavorite } = useApp();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const insets = useSafeAreaInsets();

  useFocusEffect(useCallback(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []));

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); }, 600);
  };

  const venues = useMemo(() => (VENUES || []).filter(v => v.published !== false), []);

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
      return matchSearch && matchCat && matchPrice && matchCap;
    });
  }, [venues, search, cat, maxPrice, minCapacity, aiResults]);

  const hasFilters = maxPrice || minCapacity;
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
    }, 900);
  };

  const clearAi = () => {
    setAiResults(null);
    setAiQuery('');
  };

  const sectionLabel = aiResults
    ? aiResults.summary
    : `${filtered.length} lieu${filtered.length > 1 ? 'x' : ''} disponible${filtered.length > 1 ? 's' : ''}`;

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

      {/* Bouton IA */}
      <TouchableOpacity
        style={[styles.aiBtn, aiResults && styles.aiBtnActive]}
        onPress={aiResults ? clearAi : () => setAiOpen(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.aiBtnEmoji}>✨</Text>
        <Text style={styles.aiBtnText} numberOfLines={1}>
          {aiResults ? aiResults.summary : 'Décrivez votre événement en texte libre...'}
        </Text>
        {aiResults
          ? <Ionicons name="close-circle" size={18} color={colors.primary} />
          : <Ionicons name="arrow-forward-circle" size={18} color={colors.primary} />}
      </TouchableOpacity>

      {/* Search + Filter */}
      {!aiResults && (
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
            {!!search && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color={colors.mid} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, hasFilters && styles.filterBtnActive]}
            onPress={() => setFilterOpen(true)}
          >
            <Text style={{ fontSize: 18 }}>⚙️</Text>
            {!!hasFilters && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>
      )}

      {/* Catégories — pill slim horizontal, 1 ligne, ~30px de hauteur */}
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
              isFav={favorites.includes(item.id)}
              onPress={() => navigation.navigate('VenueDetail', { venueId: item.id })}
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
              <Text style={styles.emptyIco}>🔍</Text>
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptySubtitle}>
                {aiResults
                  ? "L'IA n'a pas trouvé de lieu. Essayez d'être plus précis."
                  : "Essayez d'autres termes ou explorez la carte"}
              </Text>
              {aiResults
                ? (
                  <TouchableOpacity style={styles.emptyMapBtn} onPress={clearAi}>
                    <Text style={styles.emptyMapBtnText}>↩ Retour à la liste</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.emptyMapBtn} onPress={() => navigation.navigate('MapSearch')}>
                    <Text>🗺️</Text>
                    <Text style={styles.emptyMapBtnText}>Explorer la carte</Text>
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
              <Text style={styles.aiSheetSub}>
                Décrivez votre événement en langage naturel — l'IA trouve les lieux pour vous.
              </Text>
            </View>
            <View style={styles.aiExamples}>
              {[
                '"Anniversaire 30 ans, 40 personnes, Paris, budget 800€"',
                '"Mariage champêtre 150 invités en Provence"',
                '"Soirée atypique sur une péniche à Paris"',
              ].map((ex, i) => (
                <TouchableOpacity key={i} style={styles.aiExampleBtn} onPress={() => setAiQuery(ex.replace(/"/g, ''))}>
                  <Text style={styles.aiExampleText}>{ex}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.aiInput}
              placeholder="Ex: anniversaire 30 ans pour 40 personnes à Paris, budget 800€..."
              placeholderTextColor={colors.light}
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
            >
              {aiLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <><Text style={styles.aiSearchBtnText}>✨ Trouver les lieux</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal filtres */}
      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterOpen(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>⚙️ Filtres avancés</Text>
          <Text style={styles.filterLabel}>💶 Prix maximum (€/heure)</Text>
          <TextInput style={styles.filterInput} value={maxPrice} onChangeText={setMaxPrice} placeholder="Ex : 2000" placeholderTextColor={colors.light} keyboardType="number-pad" />
          <Text style={styles.filterLabel}>👥 Capacité minimum (personnes)</Text>
          <TextInput style={styles.filterInput} value={minCapacity} onChangeText={setMinCapacity} placeholder="Ex : 50" placeholderTextColor={colors.light} keyboardType="number-pad" />
          <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterOpen(false)}>
            <Text style={styles.applyBtnText}>✅ Appliquer les filtres</Text>
          </TouchableOpacity>
          {!!hasFilters && (
            <TouchableOpacity style={styles.clearBtn} onPress={() => { setMaxPrice(''); setMinCapacity(''); setFilterOpen(false); }}>
              <Text style={styles.clearBtnText}>🗑️ Réinitialiser</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
}

const C = colors;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  greeting: { fontSize: typography.small, color: C.mid, fontWeight: '500' },
  logo: { fontSize: 26, fontWeight: '900', color: C.dark, letterSpacing: -0.5 },
  logoAccent: { color: C.primary },
  iconBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: C.primaryLight || '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnEmoji: { fontSize: 18 },

  aiBtn: {
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.white, borderRadius: 14,
    paddingHorizontal: spacing.md, paddingVertical: 11,
    borderWidth: 1.5, borderColor: C.primary + '44',
    borderStyle: 'dashed',
  },
  aiBtnActive: { borderStyle: 'solid', borderColor: C.primary, backgroundColor: C.primaryLight || '#EEF2FF' },
  aiBtnEmoji: { fontSize: 16 },
  aiBtnText: { flex: 1, fontSize: 13, color: C.mid, fontWeight: '500' },

  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, marginBottom: spacing.sm, gap: spacing.sm,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 14,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    borderWidth: 1.5, borderColor: C.border, gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: typography.body, color: C.dark },
  filterBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: C.border, position: 'relative',
  },
  filterBtnActive: { borderColor: C.primary, backgroundColor: C.primaryLight || '#EEF2FF' },
  filterDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444',
  },

  // Pill slim — tout sur une ligne, hauteur fixe 30px
  catScroll: { flexGrow: 0, marginBottom: spacing.sm },
  catContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 2,
    gap: 6,
    alignItems: 'center',
  },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    backgroundColor: C.white,
    borderRadius: 999,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: C.border,
    gap: 4,
  },
  catBtnActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  catEmoji: { fontSize: 13, lineHeight: 16 },
  catText: {
    fontSize: 12,
    color: C.dark,
    fontWeight: '600',
    lineHeight: 16,
  },
  catTextActive: { color: '#fff' },

  sectionTitle: {
    fontSize: typography.small, fontWeight: '700', color: C.mid,
    marginBottom: spacing.md, marginTop: spacing.xs,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  sectionTitleAi: {
    color: C.primary, textTransform: 'none', fontSize: 13,
    fontWeight: '700', letterSpacing: 0,
  },

  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.md },
  emptyIco: { fontSize: 44 },
  emptyTitle: { fontSize: typography.h3, fontWeight: '700', color: C.dark },
  emptySubtitle: { fontSize: typography.small, color: C.light, textAlign: 'center', maxWidth: 260 },
  emptyMapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.primary, borderRadius: 20,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md, marginTop: spacing.sm,
  },
  emptyMapBtnText: { color: '#fff', fontWeight: '700', fontSize: typography.small },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  aiSheet: {
    backgroundColor: C.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: spacing.lg, paddingBottom: 40,
  },
  aiSheetHeader: { marginBottom: spacing.md },
  aiSheetTitle: { fontSize: typography.h2, fontWeight: '900', color: C.dark, marginBottom: 4 },
  aiSheetSub: { fontSize: typography.small, color: C.mid, lineHeight: 18 },
  aiExamples: { marginBottom: spacing.md, gap: 6 },
  aiExampleBtn: {
    backgroundColor: C.primaryLight || '#EEF2FF',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  aiExampleText: { fontSize: 12, color: C.primary, fontStyle: 'italic' },
  aiInput: {
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.primary,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: typography.body, color: C.dark,
    minHeight: 80, marginBottom: spacing.md,
  },
  aiSearchBtn: {
    backgroundColor: C.primary, borderRadius: 14,
    paddingVertical: spacing.md, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  aiSearchBtnDisabled: { opacity: 0.5 },
  aiSearchBtnText: { color: '#fff', fontWeight: '700', fontSize: typography.body },

  modalSheet: {
    backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.lg, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.border, alignSelf: 'center', marginBottom: spacing.lg,
  },
  modalTitle: { fontSize: typography.h2, fontWeight: '900', color: C.dark, marginBottom: spacing.lg },
  filterLabel: { fontSize: typography.small, fontWeight: '700', color: C.mid, marginBottom: spacing.sm },
  filterInput: {
    backgroundColor: C.white, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: typography.body, color: C.dark, marginBottom: spacing.lg,
  },
  applyBtn: {
    backgroundColor: C.primary, borderRadius: 14,
    paddingVertical: spacing.md, alignItems: 'center', marginBottom: spacing.sm,
  },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: typography.body },
  clearBtn: {
    borderRadius: 14, paddingVertical: spacing.md,
    alignItems: 'center', borderWidth: 1.5, borderColor: C.border,
  },
  clearBtnText: { color: C.mid, fontWeight: '600', fontSize: typography.body },
});
