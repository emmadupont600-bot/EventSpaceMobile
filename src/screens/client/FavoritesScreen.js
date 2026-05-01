import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { COLORS } from '../../theme/colors';

function EmptyFavorites({ onExplore }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>❤️</Text>
      <Text style={styles.emptyTitle}>Aucun favori pour l\'instant</Text>
      <Text style={styles.emptySub}>
        Appuyez sur le ♡ d\'un lieu pour le sauvegarder ici et le retrouver rapidement.
      </Text>
      <TouchableOpacity style={styles.ctaBtn} onPress={onExplore} activeOpacity={0.85}>
        <Text style={styles.ctaBtnText}>🔍 Explorer des lieux</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function FavoritesScreen({ navigation }) {
  // Essaie de récupérer les favoris depuis le contexte si disponible
  let favorites = [];
  let venues = [];
  try {
    const ctx = require('../../context/AppContext');
    const appCtx = ctx.useApp ? ctx.useApp() : (ctx.useAppContext ? ctx.useAppContext() : null);
    if (appCtx) {
      favorites = appCtx.favorites || [];
      venues = appCtx.venues || [];
    }
  } catch (e) {
    // Contexte non disponible — utilise seed data
    const seed = require('../../data/seedData');
    venues = seed.SEED_VENUES || [];
    favorites = seed.SEED_USER?.favorites || [];
  }

  const favoriteVenues = venues.filter(v => favorites.includes(v.id));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Mes favoris</Text>
        {favoriteVenues.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{favoriteVenues.length}</Text>
          </View>
        )}
      </View>

      {favoriteVenues.length === 0 ? (
        <EmptyFavorites onExplore={() => navigation.navigate('Home')} />
      ) : (
        <FlatList
          data={favoriteVenues}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.venueCard}
              onPress={() => navigation.navigate('VenueDetail', { venue: item })}
              activeOpacity={0.85}
            >
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{item.name}</Text>
                <Text style={styles.venueLocation}>📍 {item.location}</Text>
                <View style={styles.venueMeta}>
                  <Text style={styles.venueRating}>★ {item.rating}</Text>
                  <Text style={styles.venuePrice}>{item.price}€/jour</Text>
                </View>
              </View>
              <Text style={styles.venueArrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const P = COLORS.primary || '#4F46E5';
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 10,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
  badge: {
    backgroundColor: P, width: 26, height: 26,
    borderRadius: 13, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 72, marginBottom: 24 },
  emptyTitle: {
    fontSize: 22, fontWeight: '800', color: '#0F172A',
    textAlign: 'center', marginBottom: 12,
  },
  emptySub: {
    fontSize: 15, color: '#64748B', textAlign: 'center',
    lineHeight: 22, marginBottom: 32, maxWidth: 280,
  },
  ctaBtn: {
    backgroundColor: P, paddingHorizontal: 32, paddingVertical: 16,
    borderRadius: 16, shadowColor: P,
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  venueCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  venueInfo: { flex: 1 },
  venueName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  venueLocation: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  venueMeta: { flexDirection: 'row', gap: 12 },
  venueRating: { fontSize: 13, color: '#F59E0B', fontWeight: '600' },
  venuePrice: { fontSize: 13, color: P, fontWeight: '700' },
  venueArrow: { fontSize: 24, color: '#CBD5E1' },
});
