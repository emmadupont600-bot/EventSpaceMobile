import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, Platform, Dimensions,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Store } from '../../utils/store';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const { width } = Dimensions.get('window');

const PARIS_REGION = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.12,
  longitudeDelta: 0.08,
};

// Coordonnées approx pour les lieux de démo
const VENUE_COORDS = {
  1: { latitude: 48.8756, longitude: 2.3083 }, // Paris 8e
  2: { latitude: 48.8637, longitude: 2.3608 }, // Marais
  3: { latitude: 48.8833, longitude: 2.2881 }, // 17e
  4: { latitude: 48.8471, longitude: 2.3503 }, // 5e
  5: { latitude: 48.8700, longitude: 2.3417 }, // 9e
  6: { latitude: 48.8561, longitude: 2.2929 }, // 16e
  7: { latitude: 48.8790, longitude: 2.3471 }, // 18e
};

const CATEGORY_COLORS = {
  Château: '#EC4899',
  Rooftop: '#8B5CF6',
  Loft: '#3B82F6',
  'Salle de réception': '#10B981',
  'Studio photo': '#F59E0B',
  Jardin: '#10B981',
};

export default function MapSearchScreen({ navigation }) {
  const [venues, setVenues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const cardAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    Store.getVenues().then(v => setVenues((v || []).filter(x => x.published)));
  }, []));

  const filtered = venues.filter(v =>
    !search ||
    (v.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.location || '').toLowerCase().includes(search.toLowerCase())
  );

  const selectVenue = (venue) => {
    setSelected(venue);
    const coords = VENUE_COORDS[venue.id] || PARIS_REGION;
    mapRef.current?.animateToRegion({
      ...coords, latitudeDelta: 0.02, longitudeDelta: 0.015,
    }, 500);
    Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 12 }).start();
  };

  const dismissCard = () => {
    Animated.timing(cardAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setSelected(null));
  };

  const cardTranslate = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [200, 0] });
  const cardOpacity = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={styles.container}>
      {/* Barre de recherche flottante */}
      <View style={[styles.searchOverlay, { top: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={colors.dark} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={colors.mid} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un lieu..."
            placeholderTextColor={colors.light}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={colors.mid} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Compteur */}
      <View style={[styles.countBadge, { top: insets.top + 68 }]}>
        <Text style={styles.countText}>{filtered.length} lieu{filtered.length > 1 ? 'x' : ''}</Text>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={PARIS_REGION}
        showsUserLocation
        showsCompass={false}
        showsScale={false}
      >
        {filtered.map(venue => {
          const coords = VENUE_COORDS[venue.id];
          if (!coords) return null;
          const isSelected = selected?.id === venue.id;
          const markerColor = CATEGORY_COLORS[venue.type] || colors.primary;
          return (
            <Marker
              key={venue.id}
              coordinate={coords}
              onPress={() => selectVenue(venue)}
            >
              <View style={[
                styles.markerWrap,
                isSelected && styles.markerSelected,
                { backgroundColor: markerColor },
              ]}>
                <Text style={styles.markerPrice}>{venue.price}€</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Carte du lieu sélectionné */}
      {selected && (
        <Animated.View style={[
          styles.venueCard,
          { bottom: insets.bottom + 24, transform: [{ translateY: cardTranslate }], opacity: cardOpacity },
        ]}>
          <TouchableOpacity style={styles.closeCard} onPress={dismissCard}>
            <Feather name="x" size={16} color={colors.mid} />
          </TouchableOpacity>
          <View style={styles.cardRow}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardType}>{selected.category || selected.type}</Text>
              <Text style={styles.cardName} numberOfLines={1}>{selected.name}</Text>
              <View style={styles.cardMeta}>
                <Feather name="map-pin" size={12} color={colors.mid} />
                <Text style={styles.cardLocation}>{selected.location}</Text>
                <View style={styles.dot} />
                <Feather name="users" size={12} color={colors.mid} />
                <Text style={styles.cardLocation}>{selected.capacity} pers.</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardPrice}>{selected.price}€<Text style={styles.cardPriceSub}>/jour</Text></Text>
                <View style={styles.ratingWrap}>
                  <Feather name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>{selected.rating}</Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.cardCta}
            onPress={() => {
              dismissCard();
              navigation.navigate('VenueDetail', { venueId: selected.id });
            }}
          >
            <Text style={styles.cardCtaText}>Voir le lieu</Text>
            <Feather name="arrow-right" size={16} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Liste scrollable en bas si pas de sélection */}
      {!selected && (
        <View style={[styles.listOverlay, { bottom: insets.bottom + 16 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
            snapToInterval={width * 0.75 + spacing.sm}
            decelerationRate="fast"
          >
            {filtered.map(venue => (
              <TouchableOpacity
                key={venue.id}
                style={styles.miniCard}
                onPress={() => selectVenue(venue)}
                activeOpacity={0.85}
              >
                <View style={styles.miniCardColorBar}
                  pointerEvents="none"
                  style={[styles.miniCardColorBar, {
                    backgroundColor: CATEGORY_COLORS[venue.type] || colors.primary,
                  }]}
                />
                <View style={styles.miniCardContent}>
                  <Text style={styles.miniCardName} numberOfLines={1}>{venue.name}</Text>
                  <Text style={styles.miniCardLocation}>{venue.location}</Text>
                  <Text style={styles.miniCardPrice}>{venue.price}€/jour</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchOverlay: {
    position: 'absolute', left: spacing.lg, right: spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, zIndex: 10,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    ...shadow.md,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: radius.xl,
    paddingHorizontal: spacing.md, paddingVertical: 11,
    gap: spacing.sm, ...shadow.md,
  },
  searchInput: { flex: 1, fontSize: typography.body, color: colors.dark },
  countBadge: {
    position: 'absolute', left: spacing.lg + 52, zIndex: 10,
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 5,
  },
  countText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  markerWrap: {
    borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 6,
    ...shadow.sm,
  },
  markerSelected: { transform: [{ scale: 1.15 }], ...shadow.lg },
  markerPrice: { color: '#fff', fontWeight: '800', fontSize: 12 },
  venueCard: {
    position: 'absolute', left: spacing.lg, right: spacing.lg,
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.lg, ...shadow.lg,
  },
  closeCard: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.borderLight, alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  cardRow: { marginBottom: spacing.md },
  cardInfo: { flex: 1 },
  cardType: { fontSize: 11, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  cardName: { fontSize: typography.h2, fontWeight: '800', color: colors.dark, marginBottom: spacing.xs },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: spacing.sm },
  cardLocation: { fontSize: typography.small, color: colors.mid },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.light },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardPrice: { fontSize: typography.h2, fontWeight: '900', color: colors.dark },
  cardPriceSub: { fontSize: typography.small, fontWeight: '400', color: colors.mid },
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  ratingText: { fontSize: typography.small, fontWeight: '700', color: '#92400E' },
  cardCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: 13, gap: spacing.sm,
  },
  cardCtaText: { color: '#fff', fontSize: typography.body, fontWeight: '700' },
  listOverlay: { position: 'absolute', left: 0, right: 0 },
  miniCard: {
    width: width * 0.7, backgroundColor: colors.white,
    borderRadius: radius.lg, overflow: 'hidden', ...shadow.sm,
    flexDirection: 'row',
  },
  miniCardColorBar: { width: 5 },
  miniCardContent: { flex: 1, padding: spacing.md },
  miniCardName: { fontSize: typography.body, fontWeight: '700', color: colors.dark, marginBottom: 2 },
  miniCardLocation: { fontSize: typography.small, color: colors.mid, marginBottom: 4 },
  miniCardPrice: { fontSize: typography.small, fontWeight: '700', color: colors.primary },
});
