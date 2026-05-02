import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../theme/colors';

const P = COLORS.primary || '#4F46E5';

const STATUS_META = {
  confirmed: { label: 'Confirmée', color: '#22C55E', bg: '#F0FDF4', icon: 'checkmark-circle' },
  pending:   { label: 'En attente', color: '#F59E0B', bg: '#FFFBEB', icon: 'time' },
  cancelled: { label: 'Annulée',   color: '#EF4444', bg: '#FEF2F2', icon: 'close-circle' },
  past:      { label: 'Passée',    color: '#94A3B8', bg: '#F8FAFC', icon: 'checkmark-done' },
};

const TABS = ['Toutes', 'À venir', 'Passées'];

const MOCK_RESERVATIONS = [
  {
    id: 1, venue: 'Château de Bellevue', location: 'Paris 8e',
    date: '14 juin 2025', guests: 80, price: 2500,
    status: 'confirmed', emoji: '🏰',
  },
  {
    id: 2, venue: 'Loft Marais', location: 'Paris 3e',
    date: '22 juillet 2025', guests: 30, price: 900,
    status: 'pending', emoji: '🏙️',
  },
  {
    id: 3, venue: 'Villa Provence', location: 'Aix-en-Provence',
    date: '3 mai 2025', guests: 120, price: 3200,
    status: 'past', emoji: '🌿',
  },
];

export default function ReservationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);

  const filtered = MOCK_RESERVATIONS.filter(r => {
    if (activeTab === 0) return true;
    if (activeTab === 1) return r.status === 'confirmed' || r.status === 'pending';
    return r.status === 'past' || r.status === 'cancelled';
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes réservations</Text>
      </View>

      {/* Tabs filtre */}
      <View style={styles.tabsRow}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.tabBtn, activeTab === i && styles.tabBtnActive]}
            onPress={() => setActiveTab(i)}
          >
            <Text style={[styles.tabBtnText, activeTab === i && styles.tabBtnTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={56} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Aucune réservation</Text>
            <Text style={styles.emptySub}>Vos réservations apparaîtront ici.</Text>
            <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: P }]}
              onPress={() => navigation.navigate('Home')}>
              <Text style={styles.exploreBtnText}>Explorer les lieux</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const meta = STATUS_META[item.status] || STATUS_META.pending;
          return (
            <TouchableOpacity style={styles.card} activeOpacity={0.85}>
              {/* Header carte */}
              <View style={styles.cardHeader}>
                <View style={styles.cardEmoji}>
                  <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardVenue} numberOfLines={1}>{item.venue}</Text>
                  <Text style={styles.cardLocation}>
                    <Ionicons name="location-outline" size={11} color="#94A3B8" />{' '}{item.location}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon} size={12} color={meta.color} />
                  <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>

              {/* Infos */}
              <View style={styles.cardInfoRow}>
                <View style={styles.cardInfo}>
                  <Ionicons name="calendar-outline" size={13} color="#94A3B8" />
                  <Text style={styles.cardInfoText}>{item.date}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Ionicons name="people-outline" size={13} color="#94A3B8" />
                  <Text style={styles.cardInfoText}>{item.guests} pers.</Text>
                </View>
                <Text style={styles.cardPrice}>{item.price}€</Text>
              </View>

              {/* Actions */}
              {item.status === 'confirmed' && (
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="chatbubble-outline" size={14} color={P} />
                    <Text style={[styles.actionBtnText, { color: P }]}>Contacter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]}>
                    <Ionicons name="document-text-outline" size={14} color="#64748B" />
                    <Text style={styles.actionBtnText}>Détails</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },

  tabsRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#fff', gap: 8,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  tabBtn: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 999, backgroundColor: '#F1F5F9',
  },
  tabBtnActive: { backgroundColor: P },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  tabBtnTextActive: { color: '#fff' },

  list: { padding: 16, gap: 12, paddingBottom: 100 },

  card: {
    backgroundColor: '#fff', borderRadius: 18,
    padding: 16, borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  cardEmoji: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  cardVenue: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  cardLocation: { fontSize: 12, color: '#94A3B8' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: '700' },

  cardInfoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  cardInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  cardInfoText: { fontSize: 12, color: '#64748B' },
  cardPrice: { fontSize: 16, fontWeight: '800', color: '#0F172A' },

  cardActions: {
    flexDirection: 'row', gap: 8, marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 9, borderRadius: 12,
    backgroundColor: P + '14',
  },
  actionBtnOutline: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B' },

  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  emptySub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', maxWidth: 240 },
  exploreBtn: {
    marginTop: 8, paddingHorizontal: 28, paddingVertical: 13,
    borderRadius: 16,
  },
  exploreBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
