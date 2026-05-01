import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../../utils/store';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const STATUS_MAP = {
  pending:   { label: 'En attente', color: '#F59E0B', bg: '#FEF3C7', icon: 'clock' },
  confirmed: { label: 'Confirmée',  color: '#10B981', bg: '#D1FAE5', icon: 'check-circle' },
  cancelled: { label: 'Annulée',   color: '#EF4444', bg: '#FEE2E2', icon: 'x-circle' },
};

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

  const tabs = [
    { key: 'all', label: 'Toutes' },
    { key: 'pending', label: 'En attente' },
    { key: 'confirmed', label: 'Confirmées' },
    { key: 'cancelled', label: 'Annulées' },
  ];

  const filtered = tab === 'all' ? reservations : reservations.filter(r => r.status === tab);

  const updateStatus = (id, status) => {
    Alert.alert(
      status === 'confirmed' ? 'Confirmer ?' : 'Annuler ?',
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
              <Feather name={s.icon} size={11} color={s.color} />
              <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
            </View>
          </View>
          <Text style={styles.cardEvent}>{item.eventType}</Text>
        </View>
        <View style={styles.cardMeta}>
          <View style={styles.metaRow}>
            <Feather name="calendar" size={13} color={colors.mid} />
            <Text style={styles.metaText}>{item.date}</Text>
          </View>
          <View style={styles.metaRow}>
            <Feather name="clock" size={13} color={colors.mid} />
            <Text style={styles.metaText}>{item.start} → {item.end}</Text>
          </View>
          <View style={styles.metaRow}>
            <Feather name="users" size={13} color={colors.mid} />
            <Text style={styles.metaText}>{item.guests} personnes</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.cardTotal}>{item.total || item.price}€</Text>
          {user?.role === 'annonceur' && item.status === 'pending' && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.btnConfirm}
                onPress={() => updateStatus(item.id, 'confirmed')}
              >
                <Feather name="check" size={14} color="#fff" />
                <Text style={styles.btnText}>Confirmer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => updateStatus(item.id, 'cancelled')}
              >
                <Text style={[styles.btnText, { color: colors.error }]}>Refuser</Text>
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
        <Text style={styles.title}>Réservations</Text>
        {reservations.length > 0 && (
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>{reservations.length}</Text>
          </View>
        )}
      </View>

      {/* Tabs filtre */}
      <View style={styles.tabs}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={r => r.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Feather name="calendar" size={28} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Aucune réservation</Text>
            <Text style={styles.emptySub}>Vos réservations apparaîtront ici</Text>
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
  },
  title: { fontSize: typography.h1, fontWeight: '900', color: colors.dark, flex: 1, letterSpacing: -0.5 },
  totalBadge: {
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  totalBadgeText: { fontSize: typography.small, fontWeight: '800', color: colors.primary },
  tabs: {
    flexDirection: 'row', paddingHorizontal: spacing.lg,
    marginBottom: spacing.md, gap: spacing.xs,
  },
  tabBtn: {
    flex: 1, paddingVertical: 8, borderRadius: radius.md,
    alignItems: 'center', backgroundColor: colors.white,
    borderWidth: 1.5, borderColor: colors.border,
  },
  tabBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 11, fontWeight: '700', color: colors.mid },
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
  statusText: { fontSize: 11, fontWeight: '700' },
  cardEvent: { fontSize: typography.small, color: colors.mid },
  cardMeta: { gap: 5, marginBottom: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  metaText: { fontSize: typography.small, color: colors.mid },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
  cardTotal: { fontSize: typography.h2, fontWeight: '900', color: colors.dark },
  actions: { flexDirection: 'row', gap: spacing.sm },
  btnConfirm: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.success, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 7,
  },
  btnCancel: {
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 7,
    borderWidth: 1.5, borderColor: '#FECACA', backgroundColor: '#FFF0F0',
  },
  btnText: { fontSize: typography.small, fontWeight: '700', color: '#fff' },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: { fontSize: typography.h3, fontWeight: '700', color: colors.dark },
  emptySub: { fontSize: typography.small, color: colors.light, textAlign: 'center', maxWidth: 240 },
});
