import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Store } from '../../utils/store';
import { useApp } from '../../context/AppContext';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const COMMISSION_RATE = 0.12;

export default function AnnonceurDashboard({ navigation }) {
  const { user: ctxUser } = useApp();
  const [user, setUser] = useState(ctxUser);
  const [venues, setVenues] = useState([]);
  const [reservations, setReservations] = useState([]);
  const insets = useSafeAreaInsets();

  useFocusEffect(useCallback(() => {
    (async () => {
      const u = ctxUser || await Store.getCurrentUser();
      setUser(u);
      if (!u) return;
      const v = await Store.getVenues();
      setVenues((v || []).filter(x => String(x.ownerId) === String(u.id) || String(x.annonceurId) === String(u.id)));
      const r = await Store.getReservations();
      setReservations((r || []).filter(x => String(x.ownerId) === String(u.id)));
    })();
  }, [ctxUser]));

  // Revenus nets annonceur (après déduction commission 12%)
  const totalRevenu = reservations
    .filter(r => r.status === 'confirmed')
    .reduce((s, r) => {
      const brut = r.total || r.price || 0;
      const net = r.annonceurNet !== undefined ? r.annonceurNet : Math.round(brut * (1 - COMMISSION_RATE));
      return s + net;
    }, 0);

  const pending = reservations.filter(r => r.status === 'pending');
  const confirmed = reservations.filter(r => r.status === 'confirmed');
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Annonceur';

  const stats = [
    { icon: 'home', label: 'Lieux publiés', value: venues.length, color: colors.primary, bg: colors.primaryLight || '#EEF2FF' },
    { icon: 'trending-up', label: 'Revenus nets', value: totalRevenu.toLocaleString('fr-FR') + ' €', color: '#10B981', bg: '#D1FAE5' },
    { icon: 'clock', label: 'En attente', value: pending.length, color: '#F59E0B', bg: '#FEF3C7' },
    { icon: 'check-circle', label: 'Confirmées', value: confirmed.length, color: '#8B5CF6', bg: '#EDE9FE' },
  ];

  const confirmRes = async (id) => {
    await Store.updateReservation(id, { status: 'confirmed' });
    setReservations(prev => prev.map(x => x.id === id ? { ...x, status: 'confirmed' } : x));
  };

  const declineRes = async (id) => {
    await Store.updateReservation(id, { status: 'cancelled' });
    setReservations(prev => prev.map(x => x.id === id ? { ...x, status: 'cancelled' } : x));
  };

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

        {/* Bandeau commission */}
        <View style={styles.commissionBanner}>
          <Feather name="info" size={14} color="#6C63FF" />
          <Text style={styles.commissionText}>
            Commission plateforme : <Text style={styles.commissionBold}>12%</Text> déduite de chaque réservation confirmée.
          </Text>
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
            {/* Correction: navigate vers 'AddVenue' dans le stack DashboardStack */}
            <TouchableOpacity
              style={styles.sectionAction}
              onPress={() => navigation.navigate('AddVenue')}
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
                onPress={() => navigation.navigate('AddVenue')}
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
                  <Text style={styles.venueLocation}>{v.location || v.city}</Text>
                </View>
                <View style={styles.venueMeta}>
                  <Text style={styles.venuePrice}>{v.price} €/h</Text>
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
              <Feather name="check-circle" size={28} color={colors.success || '#10B981'} />
              <Text style={styles.emptyText}>Tout est à jour !</Text>
            </View>
          ) : (
            pending.map(r => {
              const brut = r.total || r.price || 0;
              const commission = r.commission !== undefined ? r.commission : Math.round(brut * COMMISSION_RATE);
              const net = r.annonceurNet !== undefined ? r.annonceurNet : brut - commission;
              return (
                <View key={r.id} style={styles.reservationCard}>
                  <View style={styles.resTop}>
                    <Text style={styles.resVenue} numberOfLines={1}>{r.venueName}</Text>
                    <View style={styles.resBadge}>
                      <Text style={styles.resBadgeText}>En attente</Text>
                    </View>
                  </View>
                  <Text style={styles.resMeta}>{r.date} · {r.guests} pers. · {r.eventType}</Text>
                  <View style={styles.resFinance}>
                    <Text style={styles.resBrut}>Total client : {brut.toLocaleString('fr-FR')} €</Text>
                    <Text style={styles.resCommission}>Commission 12% : -{commission.toLocaleString('fr-FR')} €</Text>
                    <Text style={styles.resNet}>Vous recevez : {net.toLocaleString('fr-FR')} €</Text>
                  </View>
                  <View style={styles.resActions}>
                    <TouchableOpacity
                      style={[styles.resBtn, styles.resBtnConfirm]}
                      onPress={() => confirmRes(r.id)}
                    >
                      <Feather name="check" size={14} color="#fff" />
                      <Text style={styles.resBtnText}>Confirmer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.resBtn, styles.resBtnDecline]}
                      onPress={() => declineRes(r.id)}
                    >
                      <Feather name="x" size={14} color={colors.error || '#EF4444'} />
                      <Text style={[styles.resBtnText, { color: colors.error || '#EF4444' }]}>Refuser</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Activité récente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          {confirmed.slice(0, 3).map(r => {
            const brut = r.total || r.price || 0;
            const net = r.annonceurNet !== undefined ? r.annonceurNet : Math.round(brut * (1 - COMMISSION_RATE));
            return (
              <View key={r.id} style={styles.activityRow}>
                <View style={[styles.activityIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Feather name="check" size={14} color={colors.success || '#10B981'} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{r.venueName}</Text>
                  <Text style={styles.activityMeta}>{r.date} · {r.guests} pers.</Text>
                </View>
                <Text style={styles.activityAmount}>+{net.toLocaleString('fr-FR')} €</Text>
              </View>
            );
          })}
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
  greeting: { fontSize: typography.h2 || 20, fontWeight: '900', color: colors.dark, letterSpacing: -0.5 },
  role: { fontSize: typography.small || 12, color: colors.mid, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  addBtn: {
    width: 40, height: 40, borderRadius: radius.md || 10,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    ...(shadow?.sm || {}),
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.secondary || '#6C63FF', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: typography.body || 16 },
  commissionBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: '#EEF2FF', borderRadius: radius.md || 10,
    paddingHorizontal: spacing.md, paddingVertical: 10,
  },
  commissionText: { fontSize: 12, color: '#4338CA', flex: 1 },
  commissionBold: { fontWeight: '800' },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md,
  },
  statCard: {
    flex: 1, minWidth: '45%', borderRadius: radius.xl || 16,
    padding: spacing.md, gap: spacing.xs || 4,
  },
  statIconWrap: {
    width: 40, height: 40, borderRadius: radius.md || 10,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs || 4,
  },
  statValue: { fontSize: typography.h1 || 28, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { fontSize: typography.small || 12, color: colors.mid, fontWeight: '500' },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.xl || 24 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: typography.h3 || 17, fontWeight: '800', color: colors.dark },
  sectionAction: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryLight || '#EEF2FF', borderRadius: radius.full || 999,
    paddingHorizontal: spacing.md, paddingVertical: 6,
  },
  sectionActionText: { fontSize: typography.small || 12, fontWeight: '700', color: colors.primary },
  pendingBadge: {
    backgroundColor: '#FEF3C7', borderRadius: radius.full || 999,
    minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  pendingBadgeText: { fontSize: 12, fontWeight: '800', color: '#92400E' },
  emptyCard: {
    alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.xl || 16,
    padding: spacing.xl || 24, gap: spacing.sm, borderWidth: 1.5,
    borderColor: colors.borderLight || '#E2E8F0', borderStyle: 'dashed',
  },
  emptyText: { fontSize: typography.small || 12, color: colors.mid, fontWeight: '500' },
  emptyBtn: {
    backgroundColor: colors.primary, borderRadius: radius.full || 999,
    paddingHorizontal: spacing.xl || 24, paddingVertical: spacing.sm || 8, marginTop: spacing.xs || 4,
  },
  emptyBtnText: { color: '#fff', fontSize: typography.small || 12, fontWeight: '700' },
  venueRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: radius.lg || 14,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.borderLight || '#E2E8F0',
  },
  venueColorDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.md },
  venueInfo: { flex: 1 },
  venueName: { fontSize: typography.body || 16, fontWeight: '700', color: colors.dark },
  venueLocation: { fontSize: typography.small || 12, color: colors.mid },
  venueMeta: { alignItems: 'flex-end', gap: 4 },
  venuePrice: { fontSize: typography.body || 16, fontWeight: '800', color: colors.primary },
  venueStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success || '#10B981' },
  statusText: { fontSize: typography.tiny || 10, color: colors.success || '#10B981', fontWeight: '600' },
  reservationCard: {
    backgroundColor: colors.white, borderRadius: radius.xl || 16,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1.5, borderColor: '#FEF3C7',
  },
  resTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs || 4 },
  resVenue: { fontSize: typography.body || 16, fontWeight: '700', color: colors.dark, flex: 1 },
  resBadge: { backgroundColor: '#FEF3C7', borderRadius: radius.full || 999, paddingHorizontal: 8, paddingVertical: 3 },
  resBadgeText: { fontSize: 11, fontWeight: '700', color: '#92400E' },
  resMeta: { fontSize: typography.small || 12, color: colors.mid, marginBottom: 6 },
  resFinance: {
    backgroundColor: '#F9FAFB', borderRadius: radius.md || 10,
    padding: spacing.sm || 8, marginBottom: spacing.sm, gap: 3,
  },
  resBrut: { fontSize: 12, color: colors.mid },
  resCommission: { fontSize: 12, color: '#EF4444' },
  resNet: { fontSize: 13, fontWeight: '800', color: '#10B981' },
  resActions: { flexDirection: 'row', gap: spacing.sm },
  resBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: radius.md || 10, paddingVertical: 9, gap: 5, borderWidth: 1.5,
  },
  resBtnConfirm: { backgroundColor: colors.success || '#10B981', borderColor: colors.success || '#10B981' },
  resBtnDecline: { backgroundColor: '#FFF0F0', borderColor: '#FECACA' },
  resBtnText: { fontSize: typography.small || 12, fontWeight: '700', color: '#fff' },
  activityRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: radius.lg || 14,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.borderLight || '#E2E8F0',
  },
  activityIcon: {
    width: 36, height: 36, borderRadius: radius.md || 10,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: typography.body || 16, fontWeight: '700', color: colors.dark },
  activityMeta: { fontSize: typography.small || 12, color: colors.mid },
  activityAmount: { fontSize: typography.body || 16, fontWeight: '800', color: colors.success || '#10B981' },
});
