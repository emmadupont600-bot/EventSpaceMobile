import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../../utils/store';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const STATUS_MAP = {
  pending:   { label: 'En attente', emoji: '⏳', color: '#F59E0B', bg: '#FEF3C7' },
  confirmed: { label: 'Confirmée',  emoji: '✅', color: '#10B981', bg: '#D1FAE5' },
  cancelled: { label: 'Annulée',   emoji: '❌', color: '#EF4444', bg: '#FEE2E2' },
};

const TABS = [
  { key: 'all',       label: 'Toutes',     emoji: '📂' },
  { key: 'pending',   label: 'Attente',    emoji: '⏳' },
  { key: 'confirmed', label: 'Confirm.',   emoji: '✅' },
  { key: 'cancelled', label: 'Annulées',  emoji: '❌' },
];

export default function ReservationsScreen({ navigation }) {
  const [reservations, setReservations] = useState([]);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('all');
  const insets = useSafeAreaInsets();

  useFocusEffect(useCallback(() => {
    (async () => {
      const u = await Store.getCurrentUser();
      setUser(u);
      if (!u) return;
      const all = await Store.getReservations();
      const mine = u.role === 'annonceur'
        ? (all || []).filter(r => r.ownerId === u.id)
        : (all || []).filter(r => r.userId === u.id);
      setReservations(mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    })();
  }, []));

  const filtered = tab === 'all' ? reservations : reservations.filter(r => r.status === tab);

  const updateStatus = (id, status) => {
    Alert.alert(
      status === 'confirmed' ? '✅ Confirmer ?' : '❌ Annuler ?',
      status === 'confirmed' ? 'Confirmer cette réservation ?' : 'Annuler cette réservation ?',
      [
        { text: 'Non', style: 'cancel' },
        { text: 'Oui', onPress: async () => {
          await Store.updateReservation(id, { status });
          setReservations(r => r.map(x => x.id === id ? { ...x, status } : x));
        }},
      ]
    );
  };

  const renderItem = ({ item }) => {
    const s = STATUS_MAP[item.status] || STATUS_MAP.pending;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardVenue} numberOfLines={1}>{item.venueName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
              <Text style={styles.statusEmoji}>{s.emoji}</Text>
              <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
            </View>
          </View>
          <Text style={styles.cardEvent}>{item.eventType}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>📅 {item.date}</Text>
          <Text style={styles.metaText}>⏰ {item.start} → {item.end}</Text>
          <Text style={styles.metaText}>👥 {item.guests} personnes</Text>
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.cardTotal}>💶 {item.total || item.price}€</Text>
          {user?.role === 'annonceur' && item.status === 'pending' && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={() => updateStatus(item.id, 'confirmed')}
              >
                <Text style={styles.btnText}>✅ Confirmer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => updateStatus(item.id, 'cancelled')}
              >
                <Text style={[styles.btnText, { color: colors.error }]}>❌ Refuser</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.titleEmoji}>📅</Text>
        <Text style={styles.title}>Réservations</Text>
        {reservations.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{reservations.length}</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={styles.tabEmoji}>{t.emoji}</Text>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={r => String(r.id)}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIco}>📅</Text>
            <Text style={styles.emptyTitle}>Aucune réservation</Text>
            <Text style={styles.emptySub}>Vos réservations apparaitront ici</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  titleEmoji: { fontSize: 22 },
  title: { fontSize: typography.h1, fontWeight: '900', color: colors.dark, flex: 1, letterSpacing: -0.5 },
  badge: {
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  badgeText: { fontSize: typography.small, fontWeight: '800', color: colors.primary },
  tabs: {
    flexDirection: 'row', paddingHorizontal: spacing.lg,
    marginBottom: spacing.md, gap: spacing.xs,
  },
  tabBtn: {
    flex: 1, paddingVertical: 7, borderRadius: radius.md,
    alignItems: 'center', backgroundColor: colors.white,
    borderWidth: 1.5, borderColor: colors.border,
    gap: 2,
  },
  tabBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabEmoji: { fontSize: 12 },
  tabText: { fontSize: 10, fontWeight: '700', color: colors.mid },
  tabTextActive: { color: '#fff' },
  card: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.md, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.borderLight, ...shadow.sm,
  },
  cardTop: { marginBottom: spacing.sm },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  cardVenue: { fontSize: typography.body, fontWeight: '800', color: colors.dark, flex: 1, marginRight: spacing.sm },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 4,
  },
  statusEmoji: { fontSize: 11 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardEvent: { fontSize: typography.small, color: colors.mid },
  cardMeta: { gap: 5, marginBottom: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
  metaText: { fontSize: typography.small, color: colors.mid },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
  cardTotal: { fontSize: typography.h2, fontWeight: '900', color: colors.dark },
  actions: { flexDirection: 'row', gap: spacing.sm },
  btnConfirm: {
    backgroundColor: colors.success, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 7,
  },
  btnCancel: {
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 7,
    borderWidth: 1.5, borderColor: '#FECACA', backgroundColor: '#FFF0F0',
  },
  btnText: { fontSize: typography.small, fontWeight: '700', color: '#fff' },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyIco: { fontSize: 48, marginBottom: spacing.sm },
  emptyTitle: { fontSize: typography.h3, fontWeight: '700', color: colors.dark },
  emptySub: { fontSize: typography.small, color: colors.light, textAlign: 'center', maxWidth: 240 },
});
