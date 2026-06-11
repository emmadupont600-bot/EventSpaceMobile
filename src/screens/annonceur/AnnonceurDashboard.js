import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { Store } from '../../utils/store';
import { capturePayment, refundPayment } from '../../services/stripeService';
import { COMMISSION_RATE } from '../../constants/app';
import SimpleBarChart from '../../components/SimpleBarChart';
import { colors, spacing, typography } from '../../theme/colors';

const C = colors;

export default function AnnonceurDashboard({ navigation }) {
  const { user, updateReservationStatus, logout } = useApp();
  const insets = useSafeAreaInsets();
  const [venues, setVenues] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [processingId, setProcessingId] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsPeriod, setStatsPeriod] = useState(30);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [myVenues, myRes, ownerStats] = await Promise.all([
        Store.getVenuesByOwner(user.id),
        Store.getReservationsByOwner(user.id),
        Store.getOwnerStats(user.id, statsPeriod),
      ]);
      setVenues(myVenues);
      setReservations(myRes);
      setStats(ownerStats);
    } catch (e) {
      console.error('[Dashboard]', e);
    }
  }, [user?.id, statsPeriod]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: logout },
      ]
    );
  };

  const commission = COMMISSION_RATE;

  const totalRevenu = reservations
    .filter(r => r.status === 'confirmed')
    .reduce((s, r) => s + (r.total || 0), 0);
  const totalNet = Math.round(totalRevenu * (1 - commission));
  const pending   = reservations.filter(r => r.status === 'pending');
  const confirmed = reservations.filter(r => r.status === 'confirmed');

  /**
   * Annonceur ACCEPTE :
   * 1. capturePayment() → Stripe prélève réellement l'argent
   * 2. updateReservation → status='confirmed', payment_status='paid'
   */
  const handleConfirm = async (res) => {
    Alert.alert(
      'Confirmer la réservation ?',
      `${res.userName || 'Ce client'} réserve ${res.venueName} le ${res.date}. Le paiement de ${(res.total || 0).toLocaleString('fr-FR')} € sera immédiatement prélevé.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setProcessingId(res.id);
            try {
              // 1. Capturer le paiement Stripe
              if (res.paymentIntentId) {
                const capture = await capturePayment(res.paymentIntentId);
                if (!capture.success) {
                  Alert.alert('Erreur Stripe', capture.error || 'Impossible de capturer le paiement.');
                  return;
                }
              }
              // 2. Mettre à jour la réservation
              await Store.updateReservation(res.id, {
                status: 'confirmed',
                payment_status: 'paid',
              });
              await load();
              Alert.alert('✅ Confirmé !', `La réservation est confirmée. ${Math.round((res.total || 0) * (1 - commission)).toLocaleString('fr-FR')} € seront versés sur votre compte.`);
            } catch (e) {
              Alert.alert('Erreur', e.message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  /**
   * Annonceur REFUSE :
   * 1. refundPayment() → Stripe rembourse automatiquement le client
   * 2. updateReservation → status='cancelled', payment_status='refunded'
   */
  const handleCancel = async (res) => {
    Alert.alert(
      'Refuser la demande ?',
      `${res.userName || 'Ce client'} sera automatiquement remboursé de ${(res.total || 0).toLocaleString('fr-FR')} €.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser et rembourser',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(res.id);
            try {
              // 1. Rembourser via Stripe
              if (res.paymentIntentId) {
                const refund = await refundPayment(res.paymentIntentId);
                if (!refund.success) {
                  Alert.alert('Erreur Stripe', refund.error || 'Impossible de rembourser.');
                  return;
                }
              }
              // 2. Mettre à jour la réservation
              await Store.updateReservation(res.id, {
                status: 'cancelled',
                payment_status: 'refunded',
              });
              await load();
              Alert.alert('🔄 Demand remboursement', 'Le client sera remboursé sous 3 à 5 jours ouvrables.');
            } catch (e) {
              Alert.alert('Erreur', e.message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const tabs = [
    { key: 'overview', label: 'Résumé',    icon: 'stats-chart' },
    { key: 'venues',   label: 'Mes lieux', icon: 'home' },
    { key: 'requests', label: 'Demandes',  icon: 'calendar', badge: pending.length },
    { key: 'history',  label: 'Historique',icon: 'time' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Tableau de bord</Text>
          <Text style={styles.name}>{user?.name || 'Annonceur'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerBtn, styles.logoutBtn]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('AddVenue')}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Ionicons name={t.icon} size={15} color={activeTab === t.key ? '#fff' : C.mid} />
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
            {!!t.badge && <View style={styles.badge}><Text style={styles.badgeText}>{t.badge}</Text></View>}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <>
            <View style={styles.kpiRow}>
              <KPI icon="home-outline"            label="Lieux actifs" value={venues.length}    color="#6C63FF" />
              <KPI icon="time-outline"            label="En attente"  value={pending.length}   color="#F59E0B" />
              <KPI icon="checkmark-circle-outline" label="Confirmées"  value={confirmed.length} color="#10B981" />
            </View>
            <View style={styles.revenueCard}>
              <Text style={styles.revenueLabel}>Revenus confirmés (brut)</Text>
              <Text style={styles.revenueAmount}>{totalRevenu.toLocaleString('fr-FR')} €</Text>
              <View style={styles.revenueSplit}>
                <View style={styles.revenueItem}>
                  <Text style={styles.revenueItemLabel}>Commission EventSpace ({Math.round(commission * 100)}%)</Text>
                  <Text style={[styles.revenueItemValue, { color: '#EF4444' }]}>- {Math.round(totalRevenu * commission).toLocaleString('fr-FR')} €</Text>
                </View>
                <View style={styles.revenueDivider} />
                <View style={styles.revenueItem}>
                  <Text style={[styles.revenueItemLabel, { fontWeight: '700' }]}>Vous recevez</Text>
                  <Text style={[styles.revenueItemValue, { color: '#10B981', fontWeight: '700' }]}>{totalNet.toLocaleString('fr-FR')} €</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>📈 Revenus ({statsPeriod} derniers jours)</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {[7, 30, 90].map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.periodChip, statsPeriod === d && styles.periodChipActive]}
                  onPress={() => setStatsPeriod(d)}
                >
                  <Text style={[styles.periodChipText, statsPeriod === d && styles.periodChipTextActive]}>{d}j</Text>
                </TouchableOpacity>
              ))}
            </View>
            <SimpleBarChart data={stats?.chartData || []} labelKey="label" valueKey="value" />

            {pending.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>⏳ Demandes en attente ({pending.length})</Text>
                {pending.slice(0, 3).map(r => (
                  <ReservationCard
                    key={r.id} res={r} commission={commission}
                    onConfirm={() => handleConfirm(r)}
                    onCancel={() => handleCancel(r)}
                    processing={processingId === r.id}
                  />
                ))}
                {pending.length > 3 && (
                  <TouchableOpacity onPress={() => setActiveTab('requests')}>
                    <Text style={styles.seeMore}>Voir toutes les demandes →</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
        )}

        {/* ─── MES LIEUX ─── */}
        {activeTab === 'venues' && (
          <>
            <TouchableOpacity style={styles.addVenueBtn} onPress={() => navigation.navigate('AddVenue')}>
              <Ionicons name="add-circle-outline" size={20} color={C.primary} />
              <Text style={styles.addVenueBtnText}>Ajouter un nouveau lieu</Text>
            </TouchableOpacity>
            {venues.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🏠</Text>
                <Text style={styles.emptyTitle}>Aucun lieu enregistré</Text>
                <Text style={styles.emptySubtitle}>Ajoutez votre premier espace événementiel</Text>
              </View>
            ) : venues.map(v => (
              <TouchableOpacity
                key={v.id}
                style={styles.venueRow}
                onPress={() => navigation.navigate('EditVenue', { venue: v })}
                activeOpacity={0.75}
              >
                <View style={styles.venueRowLeft}>
                  <Text style={styles.venueRowName}>{v.name}</Text>
                  <Text style={styles.venueRowMeta}>{v.city} · {v.capacity} pers. · {v.price} €/h</Text>
                </View>
                <View style={styles.venueRowRight}>
                  <View style={[styles.publishedBadge, !v.published && styles.publishedBadgeOff]}>
                    <Text style={styles.publishedBadgeText}>{v.published ? 'Publié' : 'Brouillon'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.mid} />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ─── DEMANDES ─── */}
        {activeTab === 'requests' && (
          <>
            <Text style={styles.sectionTitle}>⏳ En attente ({pending.length})</Text>
            {pending.length === 0
              ? <EmptyState icon="📭" title="Aucune demande" sub="Vous n'avez pas de demande en attente" />
              : pending.map(r => (
                <ReservationCard
                  key={r.id} res={r} commission={commission}
                  onConfirm={() => handleConfirm(r)}
                  onCancel={() => handleCancel(r)}
                  processing={processingId === r.id}
                />
              ))
            }
          </>
        )}

        {/* ─── HISTORIQUE ─── */}
        {activeTab === 'history' && (
          <>
            <Text style={styles.sectionTitle}>✅ Réservations confirmées ({confirmed.length})</Text>
            {confirmed.length === 0
              ? <EmptyState icon="📊" title="Aucune réservation" sub="Vos réservations confirmées apparaissent ici" />
              : confirmed.map(r => (
                <View key={r.id} style={styles.historyCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyVenue}>{r.venueName || 'Lieu inconnu'}</Text>
                      <Text style={styles.historyMeta}>{r.date} · {r.guests} pers. · {r.eventType}</Text>
                    </View>
                    <View style={[styles.statusBadge, styles.statusConfirmed]}>
                      <Text style={styles.statusBadgeText}>Payé</Text>
                    </View>
                  </View>
                  <View style={styles.historyAmounts}>
                    <Text style={styles.historyTotal}>Total client : {(r.total || 0).toLocaleString('fr-FR')} €</Text>
                    <Text style={styles.historyNet}>Vous recevez : {Math.round((r.total || 0) * (1 - commission)).toLocaleString('fr-FR')} €</Text>
                  </View>
                </View>
              ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function KPI({ icon, label, value, color }) {
  return (
    <View style={[kpiStyles.card, { borderTopColor: color }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={kpiStyles.value}>{value}</Text>
      <Text style={kpiStyles.label}>{label}</Text>
    </View>
  );
}
const kpiStyles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: colors.white, borderRadius: 14,
    padding: spacing.md, alignItems: 'center', gap: 4,
    borderTopWidth: 3, marginHorizontal: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  value: { fontSize: 22, fontWeight: '900', color: colors.dark },
  label: { fontSize: 11, color: colors.mid, fontWeight: '600', textAlign: 'center' },
});

function ReservationCard({ res, commission, onConfirm, onCancel, processing }) {
  const net  = Math.round((res.total || 0) * (1 - commission));
  const comm = Math.round((res.total || 0) * commission);
  const hasPayment = !!res.paymentIntentId || res.paymentStatus === 'authorized';

  return (
    <View style={resStyles.card}>
      {/* En-tête */}
      <View style={resStyles.top}>
        <View style={{ flex: 1 }}>
          <Text style={resStyles.venue}>{res.venueName || 'Lieu'}</Text>
          <Text style={resStyles.meta}>{res.date} · {res.start}–{res.end} · {res.guests} pers.</Text>
          <Text style={resStyles.event}>{res.eventType}</Text>
          {res.message ? <Text style={resStyles.message}>“{res.message}”</Text> : null}
        </View>
      </View>

      {/* Badge paiement autorisé */}
      {hasPayment && (
        <View style={resStyles.payBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#10B981" />
          <Text style={resStyles.payBadgeText}>Paiement autorisé — en attente de confirmation</Text>
        </View>
      )}

      {/* Montants */}
      <View style={resStyles.amounts}>
        <View style={resStyles.amountRow}>
          <Text style={resStyles.amountLabel}>Total client</Text>
          <Text style={resStyles.amountValue}>{(res.total || 0).toLocaleString('fr-FR')} €</Text>
        </View>
        <View style={resStyles.amountRow}>
          <Text style={resStyles.amountLabel}>Commission EventSpace ({Math.round(commission * 100)}%)</Text>
          <Text style={[resStyles.amountValue, { color: '#EF4444' }]}>- {comm.toLocaleString('fr-FR')} €</Text>
        </View>
        <View style={[resStyles.amountRow, resStyles.netRow]}>
          <Text style={[resStyles.amountLabel, { fontWeight: '700' }]}>Vous recevez</Text>
          <Text style={[resStyles.amountValue, { color: '#10B981', fontWeight: '700' }]}>{net.toLocaleString('fr-FR')} €</Text>
        </View>
      </View>

      {/* Boutons action */}
      {processing ? (
        <View style={resStyles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={resStyles.loadingText}>Traitement en cours…</Text>
        </View>
      ) : (
        <View style={resStyles.actions}>
          <TouchableOpacity style={[resStyles.btn, resStyles.btnConfirm]} onPress={onConfirm}>
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={resStyles.btnTextConfirm}>Confirmer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[resStyles.btn, resStyles.btnCancel]} onPress={onCancel}>
            <Ionicons name="close" size={16} color="#EF4444" />
            <Text style={resStyles.btnTextCancel}>Refuser</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
const resStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.white, borderRadius: 16, padding: spacing.md,
    marginBottom: spacing.md, borderWidth: 1.5, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  top: { flexDirection: 'row', marginBottom: spacing.sm },
  venue: { fontSize: 15, fontWeight: '700', color: colors.dark },
  meta: { fontSize: 12, color: colors.mid, marginTop: 2 },
  event: { fontSize: 12, color: colors.primary, marginTop: 2, fontWeight: '600' },
  message: { fontSize: 11, color: colors.mid, fontStyle: 'italic', marginTop: 4 },
  payBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ECFDF5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: '#A7F3D0',
  },
  payBadgeText: { fontSize: 12, color: '#065F46', fontWeight: '600' },
  amounts: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: spacing.sm, marginBottom: spacing.sm, gap: 4 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between' },
  amountLabel: { fontSize: 12, color: colors.mid },
  amountValue: { fontSize: 12, fontWeight: '600', color: colors.dark },
  netRow: { paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  btnConfirm: { backgroundColor: colors.primary },
  btnCancel: { borderWidth: 1.5, borderColor: '#EF4444' },
  btnTextConfirm: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnTextCancel: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10 },
  loadingText: { fontSize: 13, color: colors.mid },
});

function EmptyState({ icon, title, sub }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 48, gap: 8 }}>
      <Text style={{ fontSize: 40 }}>{icon}</Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.dark }}>{title}</Text>
      <Text style={{ fontSize: 13, color: colors.mid, textAlign: 'center' }}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  greeting: { fontSize: 12, color: C.mid, fontWeight: '500' },
  name: { fontSize: 22, fontWeight: '900', color: C.dark, letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 10 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
  },
  logoutBtn: { backgroundColor: '#EF4444' },
  tabs: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: C.border },
  tabsContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white, position: 'relative',
  },
  tabActive: { backgroundColor: C.primary, borderColor: C.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: C.mid },
  tabTextActive: { color: '#fff' },
  badge: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  kpiRow: { flexDirection: 'row', marginBottom: spacing.lg },
  revenueCard: { backgroundColor: C.white, borderRadius: 16, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1.5, borderColor: C.border },
  revenueLabel: { fontSize: 12, color: C.mid, marginBottom: 4 },
  revenueAmount: { fontSize: 32, fontWeight: '900', color: C.dark, marginBottom: spacing.md },
  revenueSplit: { gap: 8 },
  revenueItem: { flexDirection: 'row', justifyContent: 'space-between' },
  revenueItemLabel: { fontSize: 13, color: C.mid },
  revenueItemValue: { fontSize: 13, fontWeight: '600' },
  revenueDivider: { height: 1, backgroundColor: C.border, marginVertical: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.dark, marginBottom: spacing.md },
  seeMore: { color: C.primary, fontWeight: '700', textAlign: 'right', marginBottom: spacing.md },
  addVenueBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.primaryLight || '#EEF2FF', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg, borderWidth: 1.5, borderColor: C.primary, borderStyle: 'dashed',
  },
  addVenueBtnText: { fontSize: 15, fontWeight: '700', color: C.primary },
  venueRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 14, padding: spacing.md,
    marginBottom: spacing.sm, borderWidth: 1.5, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  venueRowLeft: { flex: 1 },
  venueRowName: { fontSize: 15, fontWeight: '700', color: C.dark },
  venueRowMeta: { fontSize: 12, color: C.mid, marginTop: 2 },
  venueRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  publishedBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  publishedBadgeOff: { backgroundColor: '#FEF3C7' },
  publishedBadgeText: { fontSize: 11, fontWeight: '700', color: '#065F46' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusConfirmed: { backgroundColor: '#D1FAE5' },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#065F46' },
  historyCard: { backgroundColor: C.white, borderRadius: 14, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: C.border },
  historyVenue: { fontSize: 14, fontWeight: '700', color: C.dark },
  historyMeta: { fontSize: 12, color: C.mid, marginTop: 2 },
  historyAmounts: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  historyTotal: { fontSize: 12, color: C.mid },
  historyNet: { fontSize: 13, fontWeight: '700', color: '#10B981' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.dark },
  emptySubtitle: { fontSize: 13, color: C.mid, textAlign: 'center' },
  periodChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white,
  },
  periodChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  periodChipText: { fontSize: 12, fontWeight: '600', color: C.mid },
  periodChipTextActive: { color: '#fff' },
});
