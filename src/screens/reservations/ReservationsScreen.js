import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Store } from '../../utils/store';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/Toast';
import { colors, spacing, radius, shadow } from '../../theme/colors';

const STATUS_MAP = {
  pending:   { label: 'En attente', icon: 'hourglass',           color: colors.warningDark, bg: colors.warningLight },
  confirmed: { label: 'Confirmée',  icon: 'checkmark-circle',    color: colors.successDark, bg: colors.successLight },
  cancelled: { label: 'Annulée',    icon: 'close-circle',         color: colors.errorDark,   bg: colors.errorLight },
};

const TABS = [
  { key: 'all',       label: 'Toutes' },
  { key: 'pending',   label: 'Attente' },
  { key: 'confirmed', label: 'Confirmées' },
  { key: 'cancelled', label: 'Annulées' },
];

export default function ReservationsScreen({ navigation }) {
  const [reservations, setReservations] = useState([]);
  const [tab, setTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const toast = useToast();

  const load = async () => {
    if (!user) return;
    try {
      const all = (await Store.getReservations()) || [];
      const mine = user.role === 'annonceur'
        ? all.filter(r => r.ownerId === user.id)
        : all.filter(r => r.userId === user.id);
      setReservations(mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      console.warn('[Reservations] load error', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [user?.id]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = tab === 'all' ? reservations : reservations.filter(r => r.status === tab);

  const updateStatus = async (id, status) => {
    try {
      await Store.updateReservation(id, { status });
      setReservations(r => r.map(x => x.id === id ? { ...x, status } : x));
      toast.success(status === 'confirmed' ? 'Réservation confirmée' : 'Réservation annulée');
    } catch (e) {
      toast.error('Impossible de mettre à jour');
    }
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIcoBox}>
        <Ionicons name="calendar-outline" size={36} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Aucune réservation</Text>
      <Text style={styles.emptySubtitle}>
        {tab === 'all'
          ? 'Réservez votre premier espace pour commencer'
          : `Aucune réservation « ${TABS.find(t => t.key === tab)?.label} »`
        }
      </Text>
      {tab === 'all' && user?.role !== 'annonceur' && (
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => navigation.navigate('Accueil')}
        >
          <Ionicons name="search-outline" size={16} color="#fff" />
          <Text style={styles.emptyBtnTxt}>Explorer les lieux</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderItem = ({ item }) => {
    const s = STATUS_MAP[item.status] || STATUS_MAP.pending;
    const isAnnonceur = user?.role === 'annonceur';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardVenue} numberOfLines={1}>{item.venueName}</Text>
            {(item.venueLocation || item.venue_location) ? (
              <Text style={styles.cardLocation} numberOfLines={1}>
                <Ionicons name="location-outline" size={12} color={colors.textSecondary} /> {item.venueLocation || item.venue_location}
              </Text>
            ) : null}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
            <Ionicons name={s.icon} size={11} color={s.color} />
            <Text style={[styles.statusLabel, { color: s.color }]}>{s.label}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <Meta icon="calendar-outline" value={item.date} />
          <Meta icon="time-outline" value={`${item.start || '—'} → ${item.end || '—'}`} />
          <Meta icon="people-outline" value={`${item.guests || '—'} pers.`} />
          <Meta icon="ribbon-outline" value={item.eventType || ''} />
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalTxt}>{(item.total || item.price || 0).toLocaleString('fr-FR')} €</Text>
        </View>

        {isAnnonceur && item.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.btnConfirm}
              onPress={() => updateStatus(item.id, 'confirmed')}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.btnConfirmTxt}>Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={() => updateStatus(item.id, 'cancelled')}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={16} color={colors.error} />
              <Text style={styles.btnCancelTxt}>Refuser</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isAnnonceur && item.status === 'pending' && (
          <TouchableOpacity
            style={styles.btnGhostCancel}
            onPress={() => updateStatus(item.id, 'cancelled')}
            activeOpacity={0.85}
          >
            <Ionicons name="close" size={14} color={colors.error} />
            <Text style={styles.btnCancelTxt}>Annuler la demande</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Réservations</Text>
        {reservations.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countTxt}>{reservations.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.tabs}>
        {TABS.map(t => {
          const count = t.key === 'all' ? reservations.length : reservations.filter(r => r.status === t.key).length;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, tab === t.key && styles.tabActive]}
              onPress={() => setTab(t.key)}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabTxt, tab === t.key && styles.tabTxtActive]}>{t.label}</Text>
              {count > 0 && (
                <View style={[styles.tabCount, tab === t.key && styles.tabCountActive]}>
                  <Text style={[styles.tabCountTxt, tab === t.key && styles.tabCountTxtActive]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[styles.list, filtered.length === 0 && { flex: 1 }]}
        ListEmptyComponent={!loading && renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function Meta({ icon, value }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={13} color={colors.textSecondary} />
      <Text style={styles.metaTxt} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  countBadge: {
    backgroundColor: colors.primary, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  countTxt: { fontSize: 12, fontWeight: '800', color: '#fff' },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm,
    gap: 8,
  },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabTxt: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  tabTxtActive: { color: '#fff' },
  tabCount: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.borderLight, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  tabCountTxt: { fontSize: 10, fontWeight: '800', color: colors.textSecondary },
  tabCountTxtActive: { color: '#fff' },

  list: { padding: spacing.md, gap: spacing.md, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.borderLight, ...shadow.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 8 },
  cardVenue: { fontSize: 16, fontWeight: '800', color: colors.text },
  cardLocation: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  statusLabel: { fontSize: 11, fontWeight: '800' },

  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: '45%' },
  metaTxt: { fontSize: 12, color: colors.text, fontWeight: '500', flex: 1 },

  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  totalLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  totalTxt: { fontSize: 18, fontWeight: '900', color: colors.primary, letterSpacing: -0.3 },

  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  btnConfirm: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: colors.success, borderRadius: radius.md, paddingVertical: 11,
  },
  btnConfirmTxt: { fontSize: 13, fontWeight: '800', color: '#fff' },
  btnCancel: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    borderWidth: 1.5, borderColor: colors.error, borderRadius: radius.md, paddingVertical: 11,
  },
  btnCancelTxt: { fontSize: 13, fontWeight: '800', color: colors.error },
  btnGhostCancel: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    borderWidth: 1.5, borderColor: colors.error, borderRadius: radius.md, paddingVertical: 9, marginTop: 10,
  },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  emptyIcoBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', maxWidth: 280, lineHeight: 18 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingHorizontal: 22, paddingVertical: 12, marginTop: spacing.sm,
    ...shadow.primary,
  },
  emptyBtnTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
