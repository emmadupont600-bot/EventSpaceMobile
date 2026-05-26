import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/Toast';
import { Store } from '../../utils/store';
import { capturePayment, refundPayment, COMMISSION_RATE } from '../../utils/stripeService';
import { colors, spacing, radius, shadow, gradients } from '../../theme/colors';

export default function AnnonceurDashboard({ navigation }) {
  const { user, logout } = useApp();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [venues, setVenues] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [processingId, setProcessingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const allVenues = await Store.getVenues();
      const myVenues = allVenues.filter(v => v.ownerId === user?.id);
      setVenues(myVenues);
      const allRes = await Store.getReservations();
      const myRes = allRes.filter(r =>
        myVenues.some(v => v.id === r.venueId) || r.ownerId === user?.id
      );
      setReservations(myRes);
    } catch (e) {
      console.warn('[Dashboard]', e?.message);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const totalRevenu = reservations
    .filter(r => r.status === 'confirmed')
    .reduce((s, r) => s + (r.total || 0), 0);
  const totalNet = Math.round(totalRevenu * (1 - COMMISSION_RATE));
  const pending   = reservations.filter(r => r.status === 'pending');
  const confirmed = reservations.filter(r => r.status === 'confirmed');

  const handleConfirm = async (res) => {
    Alert.alert(
      'Confirmer la réservation ?',
      `${res.userName || 'Ce client'} pour ${res.venueName} le ${res.date}. Le paiement de ${(res.total || 0).toLocaleString('fr-FR')} € sera prélevé.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setProcessingId(res.id);
            try {
              if (res.paymentIntentId) {
                const capture = await capturePayment(res.paymentIntentId);
                if (!capture.success) {
                  toast.error(capture.error || 'Capture du paiement impossible');
                  return;
                }
              }
              await Store.updateReservation(res.id, {
                status: 'confirmed',
                payment_status: 'paid',
              });
              await load();
              toast.success('Réservation confirmée');
            } catch (e) {
              toast.error(e.message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleCancel = async (res) => {
    Alert.alert(
      'Refuser la demande ?',
      `${res.userName || 'Ce client'} sera remboursé de ${(res.total || 0).toLocaleString('fr-FR')} €.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(res.id);
            try {
              if (res.paymentIntentId) {
                const refund = await refundPayment(res.paymentIntentId);
                if (!refund.success) {
                  toast.error(refund.error || 'Remboursement impossible');
                  return;
                }
              }
              await Store.updateReservation(res.id, {
                status: 'cancelled',
                payment_status: 'refunded',
              });
              await load();
              toast.info('Demande remboursée');
            } catch (e) {
              toast.error(e.message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const tabs = [
    { key: 'overview', label: 'Résumé',     icon: 'stats-chart' },
    { key: 'venues',   label: 'Mes lieux',  icon: 'home' },
    { key: 'requests', label: 'Demandes',   icon: 'calendar', badge: pending.length },
    { key: 'history',  label: 'Historique', icon: 'time' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Tableau de bord</Text>
          <Text style={styles.name}>{user?.name || 'Annonceur'} 👋</Text>
        </View>
        <TouchableOpacity style={[styles.headerBtn, styles.logoutBtn]} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('AddVenue')}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
            activeOpacity={0.85}
          >
            <Ionicons name={t.icon} size={14} color={activeTab === t.key ? '#fff' : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
            {!!t.badge && <View style={styles.badge}><Text style={styles.badgeText}>{t.badge}</Text></View>}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && (
          <>
            <View style={styles.kpiRow}>
              <KPI icon="home-outline"             label="Lieux actifs" value={venues.length}    color={colors.primary} />
              <KPI icon="time-outline"             label="En attente"   value={pending.length}   color={colors.warning} />
              <KPI icon="checkmark-circle-outline" label="Confirmées"   value={confirmed.length} color={colors.success} />
            </View>

            <LinearGradient
              colors={gradients.primaryHi}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.revenueCard}
            >
              <Text style={styles.revenueLabel}>Revenus confirmés (brut)</Text>
              <Text style={styles.revenueAmount}>{totalRevenu.toLocaleString('fr-FR')} €</Text>
              <View style={styles.revenueSplit}>
                <View style={styles.revenueItem}>
                  <Text style={styles.revenueItemLabel}>Commission ({Math.round(COMMISSION_RATE * 100)}%)</Text>
                  <Text style={styles.revenueItemValue}>− {Math.round(totalRevenu * COMMISSION_RATE).toLocaleString('fr-FR')} €</Text>
                </View>
                <View style={styles.revenueDivider} />
                <View style={styles.revenueItem}>
                  <Text style={[styles.revenueItemLabel, { fontWeight: '800' }]}>Vous recevez</Text>
                  <Text style={[styles.revenueItemValue, { fontWeight: '900', fontSize: 16 }]}>{totalNet.toLocaleString('fr-FR')} €</Text>
                </View>
              </View>
            </LinearGradient>

            {pending.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Demandes en attente</Text>
                  <View style={styles.sectionBadge}><Text style={styles.sectionBadgeTxt}>{pending.length}</Text></View>
                </View>
                {pending.slice(0, 3).map(r => (
                  <ReservationCard
                    key={r.id} res={r}
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

        {activeTab === 'venues' && (
          <>
            <TouchableOpacity style={styles.addVenueBtn} onPress={() => navigation.navigate('AddVenue')} activeOpacity={0.85}>
              <View style={styles.addIconBox}>
                <Ionicons name="add" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addVenueBtnText}>Ajouter un lieu</Text>
                <Text style={styles.addVenueBtnSub}>Publiez votre espace en quelques minutes</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={colors.primary} />
            </TouchableOpacity>

            {venues.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIco}>
                  <Ionicons name="home-outline" size={36} color={colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>Aucun lieu pour l'instant</Text>
                <Text style={styles.emptySubtitle}>Ajoutez votre premier espace pour le rendre visible aux clients EventSpace.</Text>
              </View>
            ) : venues.map(v => (
              <TouchableOpacity
                key={v.id}
                style={styles.venueRow}
                onPress={() => navigation.navigate('EditVenue', { venue: v })}
                activeOpacity={0.85}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.venueRowName}>{v.name}</Text>
                  <Text style={styles.venueRowMeta}>{v.city} · {v.capacity} pers. · {v.price} €/h</Text>
                </View>
                <View style={[styles.publishedBadge, !v.published && styles.publishedBadgeOff]}>
                  <Text style={[styles.publishedBadgeText, !v.published && { color: colors.warningDark }]}>
                    {v.published ? 'Publié' : 'Brouillon'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>En attente</Text>
              <View style={styles.sectionBadge}><Text style={styles.sectionBadgeTxt}>{pending.length}</Text></View>
            </View>
            {pending.length === 0
              ? <EmptyMini icon="mail-open-outline" title="Aucune demande" sub="Vos demandes de réservation apparaîtront ici" />
              : pending.map(r => (
                  <ReservationCard
                    key={r.id} res={r}
                    onConfirm={() => handleConfirm(r)}
                    onCancel={() => handleCancel(r)}
                    processing={processingId === r.id}
                  />
                ))
            }
          </>
        )}

        {activeTab === 'history' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Confirmées</Text>
              <View style={[styles.sectionBadge, { backgroundColor: colors.successLight }]}>
                <Text style={[styles.sectionBadgeTxt, { color: colors.successDark }]}>{confirmed.length}</Text>
              </View>
            </View>
            {confirmed.length === 0
              ? <EmptyMini icon="archive-outline" title="Aucune réservation confirmée" sub="Vos réservations validées apparaîtront ici" />
              : confirmed.map(r => (
                  <View key={r.id} style={styles.historyCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.historyVenue}>{r.venueName || 'Lieu'}</Text>
                        <Text style={styles.historyMeta}>{r.date} · {r.guests} pers. · {r.eventType}</Text>
                      </View>
                      <View style={styles.statusConfirmed}>
                        <Ionicons name="checkmark" size={11} color={colors.successDark} />
                        <Text style={styles.statusConfirmedTxt}>Payé</Text>
                      </View>
                    </View>
                    <View style={styles.historyAmounts}>
                      <Text style={styles.historyTotal}>Total : {(r.total || 0).toLocaleString('fr-FR')} €</Text>
                      <Text style={styles.historyNet}>Net : {Math.round((r.total || 0) * (1 - COMMISSION_RATE)).toLocaleString('fr-FR')} €</Text>
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
      <View style={[kpiStyles.iconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={kpiStyles.value}>{value}</Text>
      <Text style={kpiStyles.label}>{label}</Text>
    </View>
  );
}
const kpiStyles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center',
    borderTopWidth: 3, marginHorizontal: 4, ...shadow.xs,
  },
  iconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  value: { fontSize: 22, fontWeight: '900', color: colors.text },
  label: { fontSize: 11, color: colors.textSecondary, fontWeight: '700', textAlign: 'center' },
});

function ReservationCard({ res, onConfirm, onCancel, processing }) {
  const net  = Math.round((res.total || 0) * (1 - COMMISSION_RATE));
  const comm = Math.round((res.total || 0) * COMMISSION_RATE);
  const hasPayment = !!res.paymentIntentId || res.paymentStatus === 'authorized';

  return (
    <View style={resStyles.card}>
      <View>
        <Text style={resStyles.venue}>{res.venueName || 'Lieu'}</Text>
        <Text style={resStyles.meta}>
          📅 {res.date}  ·  🕐 {res.start}–{res.end}  ·  👥 {res.guests} pers.
        </Text>
        <Text style={resStyles.event}>{res.eventType}</Text>
        {res.message ? <Text style={resStyles.message}>"{res.message}"</Text> : null}
      </View>

      {hasPayment && (
        <View style={resStyles.payBadge}>
          <Ionicons name="shield-checkmark" size={12} color={colors.successDark} />
          <Text style={resStyles.payBadgeText}>Paiement autorisé — en attente de confirmation</Text>
        </View>
      )}

      <View style={resStyles.amounts}>
        <View style={resStyles.amountRow}>
          <Text style={resStyles.amountLabel}>Total client</Text>
          <Text style={resStyles.amountValue}>{(res.total || 0).toLocaleString('fr-FR')} €</Text>
        </View>
        <View style={resStyles.amountRow}>
          <Text style={resStyles.amountLabel}>Commission ({Math.round(COMMISSION_RATE * 100)}%)</Text>
          <Text style={[resStyles.amountValue, { color: colors.error }]}>− {comm.toLocaleString('fr-FR')} €</Text>
        </View>
        <View style={[resStyles.amountRow, resStyles.netRow]}>
          <Text style={[resStyles.amountLabel, { fontWeight: '800', color: colors.text }]}>Vous recevez</Text>
          <Text style={[resStyles.amountValue, { color: colors.success, fontWeight: '900' }]}>{net.toLocaleString('fr-FR')} €</Text>
        </View>
      </View>

      {processing ? (
        <View style={resStyles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={resStyles.loadingText}>Traitement…</Text>
        </View>
      ) : (
        <View style={resStyles.actions}>
          <TouchableOpacity style={[resStyles.btn, resStyles.btnConfirm]} onPress={onConfirm} activeOpacity={0.85}>
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={resStyles.btnTextConfirm}>Confirmer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[resStyles.btn, resStyles.btnCancel]} onPress={onCancel} activeOpacity={0.85}>
            <Ionicons name="close" size={16} color={colors.error} />
            <Text style={resStyles.btnTextCancel}>Refuser</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
const resStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.borderLight,
    gap: spacing.sm, ...shadow.xs,
  },
  venue: { fontSize: 16, fontWeight: '900', color: colors.text },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  event: { fontSize: 12, color: colors.primary, marginTop: 2, fontWeight: '700' },
  message: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic', marginTop: 4 },
  payBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.successLight, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: '#A7F3D0',
  },
  payBadgeText: { fontSize: 11, color: colors.successDark, fontWeight: '700' },
  amounts: { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.sm, gap: 4 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between' },
  amountLabel: { fontSize: 12, color: colors.textSecondary },
  amountValue: { fontSize: 12, fontWeight: '700', color: colors.text },
  netRow: { paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.borderLight, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: radius.md },
  btnConfirm: { backgroundColor: colors.primary, ...shadow.primary },
  btnCancel: { borderWidth: 1.5, borderColor: colors.error },
  btnTextConfirm: { color: '#fff', fontWeight: '800', fontSize: 14 },
  btnTextCancel: { color: colors.error, fontWeight: '800', fontSize: 14 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10 },
  loadingText: { fontSize: 13, color: colors.textSecondary },
});

function EmptyMini({ icon, title, sub }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 60, gap: 10 }}>
      <View style={{
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: colors.primaryLight,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>{title}</Text>
      <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', maxWidth: 280 }}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  greeting: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  name: { fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: -0.4 },
  headerBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', ...shadow.primary,
  },
  logoutBtn: { backgroundColor: colors.errorLight, shadowOpacity: 0 },

  tabs: { flexGrow: 0 },
  tabsContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface,
    position: 'relative',
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  tabTextActive: { color: '#fff' },
  badge: {
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.error,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  kpiRow: { flexDirection: 'row', marginBottom: spacing.lg, marginHorizontal: -4 },
  revenueCard: {
    borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg,
    ...shadow.lg,
  },
  revenueLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  revenueAmount: { fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: spacing.md, marginTop: 4, letterSpacing: -0.8 },
  revenueSplit: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md, padding: 12, gap: 8,
  },
  revenueItem: { flexDirection: 'row', justifyContent: 'space-between' },
  revenueItemLabel: { fontSize: 13, color: 'rgba(255,255,255,0.95)' },
  revenueItemValue: { fontSize: 13, fontWeight: '700', color: '#fff' },
  revenueDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: colors.text, letterSpacing: -0.2 },
  sectionBadge: { backgroundColor: colors.primaryLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  sectionBadgeTxt: { fontSize: 12, fontWeight: '800', color: colors.primary },
  seeMore: { color: colors.primary, fontWeight: '800', textAlign: 'right', marginBottom: spacing.md },

  addVenueBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingVertical: 14, paddingHorizontal: spacing.md,
    marginBottom: spacing.lg, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed',
  },
  addIconBox: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  addVenueBtnText: { fontSize: 15, fontWeight: '800', color: colors.primary },
  addVenueBtnSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  venueRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.borderLight, ...shadow.xs,
  },
  venueRowName: { fontSize: 15, fontWeight: '800', color: colors.text },
  venueRowMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  publishedBadge: { backgroundColor: colors.successLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  publishedBadgeOff: { backgroundColor: colors.warningLight },
  publishedBadgeText: { fontSize: 11, fontWeight: '800', color: colors.successDark },

  historyCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.borderLight,
  },
  historyVenue: { fontSize: 15, fontWeight: '800', color: colors.text },
  historyMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statusConfirmed: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.successLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
  },
  statusConfirmedTxt: { fontSize: 11, fontWeight: '800', color: colors.successDark },
  historyAmounts: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  historyTotal: { fontSize: 12, color: colors.textSecondary },
  historyNet: { fontSize: 13, fontWeight: '800', color: colors.success },

  empty: { alignItems: 'center', paddingTop: 40, paddingHorizontal: spacing.lg, gap: 8 },
  emptyIco: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  emptySubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', maxWidth: 280, lineHeight: 18 },
});
