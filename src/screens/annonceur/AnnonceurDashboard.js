import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Store } from '../../utils/store';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

export default function AnnonceurDashboard({ navigation }) {
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [reservations, setReservations] = useState([]);
  const insets = useSafeAreaInsets();

  useFocusEffect(useCallback(() => {
    (async () => {
      const u = await Store.getCurrentUser();
      setUser(u);
      const v = await Store.getVenues();
      setVenues((v || []).filter(x => x.ownerId === u?.id || x.annonceurId === u?.id));
      const r = await Store.getReservations();
      setReservations((r || []).filter(x => x.ownerId === u?.id));
    })();
  }, []));

  const totalRevenu = reservations.filter(r => r.status === 'confirmed').reduce((s, r) => s + (r.total || r.price || 0), 0);
  const pending = reservations.filter(r => r.status === 'pending');
  const confirmed = reservations.filter(r => r.status === 'confirmed');
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Annonceur';

  const stats = [
    { icon: 'home', label: 'Lieux publiés', value: venues.length, color: colors.primary, bg: colors.primaryLight },
    { icon: 'trending-up', label: 'Revenus', value: totalRevenu.toLocaleString() + '€', color: '#10B981', bg: '#D1FAE5' },
    { icon: 'clock', label: 'En attente', value: pending.length, color: '#F59E0B', bg: '#FEF3C7' },
    { icon: 'check-circle', label: 'Confirmées', value: confirmed.length, color: '#8B5CF6', bg: '#EDE9FE' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour, {firstName} 👋</Text>
            <Text style={styles.role}>Tableau de bord annonceur</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('AddVenue')}
            >
              <Feather name="plus" size={18} color="#fff" />
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.firstName || user?.name || 'A')[0].toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: s.bg }]}>
              <View style={[styles.statIconWrap, { backgroundColor: s.color + '20' }]}>
                <Feather name={s.icon} size={20} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Mes lieux */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes lieux</Text>
            <TouchableOpacity
              style={styles.sectionAction}
              onPress={() => navigation.navigate('Ajouter')}
            >
              <Feather name="plus" size={14} color={colors.primary} />
              <Text style={styles.sectionActionText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
          {venues.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="home" size={28} color={colors.light} />
              <Text style={styles.emptyText}>Aucun lieu publié</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('Ajouter')}
              >
                <Text style={styles.emptyBtnText}>Publier mon premier lieu</Text>
              </TouchableOpacity>
            </View>
          ) : (
            venues.map(v => (
              <View key={v.id} style={styles.venueRow}>
                <View style={[styles.venueColorDot, { backgroundColor: colors.primary }]} />
                <View style={styles.venueInfo}>
                  <Text style={styles.venueName}>{v.name}</Text>
                  <Text style={styles.venueLocation}>{v.location}</Text>
                </View>
                <View style={styles.venueMeta}>
                  <Text style={styles.venuePrice}>{v.price}€/j</Text>
                  <View style={styles.venueStatus}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Actif</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Réservations en attente */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>En attente</Text>
            {pending.length > 0 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>{pending.length}</Text>
              </View>
            )}
          </View>
          {pending.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="check-circle" size={28} color={colors.success} />
              <Text style={styles.emptyText}>Tout est à jour !</Text>
            </View>
          ) : (
            pending.map(r => (
              <View key={r.id} style={styles.reservationCard}>
                <View style={styles.resTop}>
                  <Text style={styles.resVenue} numberOfLines={1}>{r.venueName}</Text>
                  <View style={styles.resBadge}>
                    <Text style={styles.resBadgeText}>En attente</Text>
                  </View>
                </View>
                <Text style={styles.resMeta}>{r.date} · {r.guests} pers. · {r.eventType}</Text>
                <Text style={styles.resTotal}>{r.total || r.price}€ estimé</Text>
                <View style={styles.resActions}>
                  <TouchableOpacity
                    style={[styles.resBtn, styles.resBtnConfirm]}
                    onPress={() => Store.updateReservation(r.id, { status: 'confirmed' }).then(() =>
                      setReservations(prev => prev.map(x => x.id === r.id ? { ...x, status: 'confirmed' } : x))
                    )}
                  >
                    <Feather name="check" size={14} color="#fff" />
                    <Text style={styles.resBtnText}>Confirmer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.resBtn, styles.resBtnDecline]}
                    onPress={() => Store.updateReservation(r.id, { status: 'cancelled' }).then(() =>
                      setReservations(prev => prev.map(x => x.id === r.id ? { ...x, status: 'cancelled' } : x))
                    )}
                  >
                    <Feather name="x" size={14} color={colors.error} />
                    <Text style={[styles.resBtnText, { color: colors.error }]}>Refuser</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Activité récente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          {confirmed.slice(0, 3).map(r => (
            <View key={r.id} style={styles.activityRow}>
              <View style={[styles.activityIcon, { backgroundColor: '#D1FAE5' }]}>
                <Feather name="check" size={14} color={colors.success} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{r.venueName}</Text>
                <Text style={styles.activityMeta}>{r.date} · {r.guests} pers.</Text>
              </View>
              <Text style={styles.activityAmount}>+{r.total || r.price}€</Text>
            </View>
          ))}
          {confirmed.length === 0 && (
            <View style={styles.emptyCard}>
              <Feather name="activity" size={24} color={colors.light} />
              <Text style={styles.emptyText}>Aucune activité récente</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md,
  },
  greeting: { fontSize: typography.h2, fontWeight: '900', color: colors.dark, letterSpacing: -0.5 },
  role: { fontSize: typography.small, color: colors.mid, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  addBtn: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    ...shadow.sm, shadowColor: colors.primary,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: typography.body },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md,
  },
  statCard: {
    flex: 1, minWidth: '45%', borderRadius: radius.xl,
    padding: spacing.md, gap: spacing.xs,
  },
  statIconWrap: {
    width: 40, height: 40, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
  },
  statValue: { fontSize: typography.h1, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { fontSize: typography.small, color: colors.mid, fontWeight: '500' },
  section: {
    marginHorizontal: spacing.lg, marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: typography.h3, fontWeight: '800', color: colors.dark },
  sectionAction: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryLight, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 6,
  },
  sectionActionText: { fontSize: typography.small, fontWeight: '700', color: colors.primary },
  pendingBadge: {
    backgroundColor: '#FEF3C7', borderRadius: radius.full,
    minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  pendingBadgeText: { fontSize: 12, fontWeight: '800', color: '#92400E' },
  emptyCard: {
    alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.xl, gap: spacing.sm, borderWidth: 1.5, borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  emptyText: { fontSize: typography.small, color: colors.mid, fontWeight: '500' },
  emptyBtn: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, marginTop: spacing.xs,
  },
  emptyBtnText: { color: '#fff', fontSize: typography.small, fontWeight: '700' },
  venueRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.borderLight, ...shadow.xs,
  },
  venueColorDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.md },
  venueInfo: { flex: 1 },
  venueName: { fontSize: typography.body, fontWeight: '700', color: colors.dark },
  venueLocation: { fontSize: typography.small, color: colors.mid },
  venueMeta: { alignItems: 'flex-end', gap: 4 },
  venuePrice: { fontSize: typography.body, fontWeight: '800', color: colors.primary },
  venueStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  statusText: { fontSize: typography.tiny, color: colors.success, fontWeight: '600' },
  reservationCard: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1.5, borderColor: '#FEF3C7', ...shadow.xs,
  },
  resTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  resVenue: { fontSize: typography.body, fontWeight: '700', color: colors.dark, flex: 1 },
  resBadge: { backgroundColor: '#FEF3C7', borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  resBadgeText: { fontSize: 11, fontWeight: '700', color: '#92400E' },
  resMeta: { fontSize: typography.small, color: colors.mid, marginBottom: 4 },
  resTotal: { fontSize: typography.body, fontWeight: '800', color: colors.primary, marginBottom: spacing.sm },
  resActions: { flexDirection: 'row', gap: spacing.sm },
  resBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: radius.md, paddingVertical: 9, gap: 5, borderWidth: 1.5,
  },
  resBtnConfirm: { backgroundColor: colors.success, borderColor: colors.success },
  resBtnDecline: { backgroundColor: '#FFF0F0', borderColor: '#FECACA' },
  resBtnText: { fontSize: typography.small, fontWeight: '700', color: '#fff' },
  activityRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.borderLight, ...shadow.xs,
  },
  activityIcon: {
    width: 36, height: 36, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: typography.body, fontWeight: '700', color: colors.dark },
  activityMeta: { fontSize: typography.small, color: colors.mid },
  activityAmount: { fontSize: typography.body, fontWeight: '800', color: colors.success },
});
