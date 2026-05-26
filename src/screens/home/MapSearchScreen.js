/**
 * MapSearchScreen → Discover.
 *
 * NOTE: The original screen depended on react-native-maps which requires
 * Google Maps API keys + native modules. We replaced it with a beautiful
 * Discover view: hero, big city tiles with venue counts, and a curated
 * "Coup de cœur" carousel. Faster, no extra setup, looks great.
 */
import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { VENUES } from '../../data/venues';
import { colors, spacing, radius, shadow, gradients } from '../../theme/colors';
import VenueCard from '../../components/VenueCard';

const CITY_IMG = {
  'Paris':           'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
  'Lyon':            'https://images.unsplash.com/photo-1532634896-26909d0d4c2b?w=800',
  'Bordeaux':        'https://images.unsplash.com/photo-1610024062303-e355e94e7b9d?w=800',
  'Aix-en-Provence': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
  'Marseille':       'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
};

const FALLBACK_CITY_IMG = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800';

export default function MapSearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite } = useApp();
  const [selectedCity, setSelectedCity] = useState(null);

  const venues = useMemo(() => (VENUES || []).filter(v => v.published !== false), []);

  // Build city list with counts and a representative image
  const cities = useMemo(() => {
    const map = new Map();
    venues.forEach(v => {
      const c = v.city || 'Autre';
      const cur = map.get(c) || { name: c, count: 0, img: CITY_IMG[c] || v.img };
      cur.count += 1;
      map.set(c, cur);
    });
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [venues]);

  const featured = useMemo(
    () => venues.filter(v => v.coupDeCoeur).slice(0, 8),
    [venues]
  );

  const cityVenues = useMemo(
    () => selectedCity ? venues.filter(v => v.city === selectedCity) : [],
    [selectedCity, venues]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Découvrir</Text>
          <Text style={styles.headerSub}>Explorez les lieux par ville</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        {!selectedCity && (
          <View style={styles.hero}>
            <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroGradient}>
              <Text style={styles.heroEmoji}>✨</Text>
              <Text style={styles.heroTitle}>Trouvez votre lieu idéal</Text>
              <Text style={styles.heroSub}>Plus de {venues.length} espaces sélectionnés à travers la France</Text>
            </LinearGradient>
          </View>
        )}

        {/* Cities grid */}
        {!selectedCity && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Par destination</Text>
            <View style={styles.cityGrid}>
              {cities.map(city => (
                <TouchableOpacity
                  key={city.name}
                  style={styles.cityCard}
                  onPress={() => setSelectedCity(city.name)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: CITY_IMG[city.name] || city.img || FALLBACK_CITY_IMG }}
                    style={styles.cityImg}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(15,23,42,0.85)']}
                    style={styles.cityOverlay}
                    pointerEvents="none"
                  />
                  <View style={styles.cityFooter}>
                    <Text style={styles.cityName}>{city.name}</Text>
                    <Text style={styles.cityCount}>{city.count} lieu{city.count > 1 ? 'x' : ''}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Featured carousel */}
        {!selectedCity && featured.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Coups de cœur</Text>
                <Text style={styles.sectionSub}>Sélectionnés par notre équipe</Text>
              </View>
              <View style={styles.starBadge}>
                <Ionicons name="star" size={14} color="#fff" />
              </View>
            </View>
            <FlatList
              horizontal
              data={featured}
              keyExtractor={v => String(v.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.featuredCard}
                  onPress={() => navigation.navigate('VenueDetail', { venue: item, venueId: item.id })}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: item.img }} style={styles.featuredImg} />
                  <LinearGradient
                    colors={['transparent', 'rgba(15,23,42,0.85)']}
                    style={styles.featuredOverlay}
                    pointerEvents="none"
                  />
                  <View style={styles.featuredBody}>
                    <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.featuredMeta}>
                      <Ionicons name="location-outline" size={11} color="rgba(255,255,255,0.85)" />
                      <Text style={styles.featuredMetaTxt}>{item.city}</Text>
                    </View>
                    <Text style={styles.featuredPrice}>{item.price?.toLocaleString('fr-FR')} €/h</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Selected city venues */}
        {selectedCity && (
          <View style={[styles.section, { paddingHorizontal: spacing.lg }]}>
            <View style={styles.cityHeader}>
              <TouchableOpacity onPress={() => setSelectedCity(null)} style={styles.cityBackBtn}>
                <Ionicons name="chevron-back" size={16} color={colors.primary} />
                <Text style={styles.cityBackTxt}>Toutes les villes</Text>
              </TouchableOpacity>
              <Text style={styles.cityHeaderTitle}>{selectedCity}</Text>
              <Text style={styles.cityHeaderSub}>{cityVenues.length} lieu{cityVenues.length > 1 ? 'x' : ''} disponible{cityVenues.length > 1 ? 's' : ''}</Text>
            </View>
            {cityVenues.map(venue => (
              <VenueCard
                key={venue.id}
                venue={venue}
                isFav={favorites.includes(venue.id)}
                onPress={() => navigation.navigate('VenueDetail', { venue, venueId: venue.id })}
                onFav={() => toggleFavorite(venue.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center', alignItems: 'center',
    ...shadow.xs,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },

  hero: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  heroGradient: {
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    ...shadow.lg,
  },
  heroEmoji: { fontSize: 30, marginBottom: 6 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'center', letterSpacing: -0.3 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.92)', textAlign: 'center', marginTop: 6 },

  section: { paddingTop: spacing.md, paddingBottom: spacing.lg },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.text, paddingHorizontal: spacing.lg, marginBottom: 4, letterSpacing: -0.2 },
  sectionSub: { fontSize: 12, color: colors.textSecondary, paddingHorizontal: spacing.lg },
  starBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.warning,
    alignItems: 'center', justifyContent: 'center',
  },

  cityGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.lg, gap: spacing.md,
  },
  cityCard: {
    width: '48%', height: 130,
    borderRadius: radius.lg, overflow: 'hidden',
    ...shadow.sm,
  },
  cityImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  cityOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 80 },
  cityFooter: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  cityName: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: -0.2 },
  cityCount: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  featuredCard: {
    width: 220, height: 280,
    borderRadius: radius.lg, overflow: 'hidden',
    ...shadow.sm,
  },
  featuredImg: { width: '100%', height: '100%' },
  featuredOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 130 },
  featuredBody: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  featuredName: { fontSize: 16, fontWeight: '800', color: '#fff' },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  featuredMetaTxt: { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  featuredPrice: { fontSize: 14, fontWeight: '800', color: '#fff', marginTop: 6 },

  cityHeader: { marginBottom: spacing.lg },
  cityBackBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 8 },
  cityBackTxt: { fontSize: 13, color: colors.primary, fontWeight: '700' },
  cityHeaderTitle: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  cityHeaderSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});
