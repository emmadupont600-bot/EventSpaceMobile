import React, { useCallback, useState, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, StatusBar, RefreshControl, Modal, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Store } from '../../utils/store';
import { refundPayment } from '../../services/stripeService';
import { useApp } from '../../context/AppContext';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const STATUS_MAP = {
  pending:   { label: 'En attente', emoji: '⏳', color: '#D97706', bg: '#FEF3C7' },
  confirmed: { label: 'Confirmée',  emoji: '✅', color: '#059669', bg: '#D1FAE5' },
  cancelled: { label: 'Annulée',   emoji: '❌', color: '#DC2626', bg: '#FEE2E2' },
};

const TABS = [
  { key: 'all',       label: 'Toutes',     icon: 'list-outline' },
  { key: 'pending',   label: 'Attente',    icon: 'hourglass-outline' },
  { key: 'confirmed', label: 'Confirmées', icon: 'checkmark-circle-outline' },
  { key: 'cancelled', label: 'Annulées',  icon: 'close-circle-outline' },
];

function isPastStay(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return d < new Date();
}

export default function ReservationsScreen({ navigation }) {
  const { user } = useApp();
  const [reservations, setReservations] = useState([]);
  const [tab, setTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    if (!user?.id) return [];
    const mine = user.role === 'annonceur'
      ? await Store.getReservationsByOwner(user.id)
      : await Store.getReservationsByUser(user.id);
    const sorted = mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setReservations(sorted);
    return sorted;
  }, [user?.id, user?.role]);

  const promptReviewIfNeeded = useCallback(async (list) => {
    if (!user?.id || user.role === 'annonceur') return;
    const candidate = (list || []).find(r =>
      r.status === 'confirmed' && isPastStay(r.date)
    );
    if (!candidate?.venueId) return;
    const existing = await Store.getUserReviewForVenue(user.id, candidate.venueId);
    if (!existing) setReviewTarget(candidate);
  }, [user?.id, user?.role]);

  useFocusEffect(useCallback(() => {
    load().then(list => promptReviewIfNeeded(list));
  }, [load, promptReviewIfNeeded]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = useMemo(
    () => (tab === 'all' ? reservations : reservations.filter(r => r.status === tab)),
    [reservations, tab]
  );

  const handleClientCancel = (item) => {
    const isConfirmed = item.status === 'confirmed';
    Alert.alert(
      isConfirmed ? 'Annuler cette réservation ?' : 'Annuler la demande ?',
      isConfirmed
        ? 'Le remboursement sera traité selon la politique EventSpace (3 à 5 jours ouvrables).'
        : 'Votre demande sera annulée. Si un paiement était autorisé, il sera libéré.',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              if (item.paymentIntentId) {
                const refund = await refundPayment(item.paymentIntentId);
                if (!refund.success) {
                  Alert.alert('Erreur', refund.error || 'Impossible de rembourser.');
                  return;
                }
              }
              await Store.cancelReservation(item.id, { refundPaymentIntent: !!item.paymentIntentId });
              setReservations(r => r.map(x =>
                x.id === item.id ? { ...x, status: 'cancelled', paymentStatus: 'refunded' } : x
              ));
              Alert.alert('Annulée', 'Votre réservation a été annulée.');
            } catch (e) {
              Alert.alert('Erreur', e.message);
            }
          },
        },
      ]
    );
  };

  const updateStatus = (id, status) => {
    const label = status === 'confirmed' ? 'Confirmer' : 'Annuler';
    Alert.alert(
      `${status === 'confirmed' ? '✅' : '❌'} ${label} ?`,
      `Voulez-vous vraiment ${label.toLowerCase()} cette réservation ?`,
      [
        { text: 'Non', style: 'cancel' },
        { text: 'Oui', onPress: async () => {
          await Store.updateReservation(id, { status });
          setReservations(r => r.map(x => x.id === id ? { ...x, status } : x));
        }},
      ]
    );
  };

  const submitReview = async () => {
    if (!reviewTarget || !user?.id) return;
    setSubmittingReview(true);
    try {
      await Store.addReview({
        venueId: reviewTarget.venueId,
        userId: user.id,
        userName: user.name || user.email || 'Client',
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewTarget(null);
      setReviewComment('');
      setReviewRating(5);
      Alert.alert('Merci !', 'Votre avis a été publié.');
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Ionicons name="calendar-outline" size={64} color={colors.border || '#E2E8F0'} />
      <Text style={styles.emptyTitle}>Aucune réservation</Text>
      <Text style={styles.emptySubtitle}>
        {tab === 'all'
          ? 'Réservez un espace pour commencer'
          : `Aucune réservation « ${TABS.find(t => t.key === tab)?.label} »`
        }
      </Text>
      {tab === 'all' && user?.role !== 'annonceur' && (
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => navigation.navigate('Accueil')}
        >
          <Ionicons name="search-outline" size={16} color="#fff" />
          <Text style={styles.emptyBtnTxt}>Explorer les espaces</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderItem = ({ item }) => {
    const s = STATUS_MAP[item.status] || STATUS_MAP.pending;
    const isAnnonceur = user?.role === 'annonceur';
    const canReview = !isAnnonceur && item.status === 'confirmed' && isPastStay(item.date);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardVenue} numberOfLines={1}>{item.venueName}</Text>
            {item.venueLocation ? (
              <Text style={styles.cardLocation} numberOfLines={1}>📍 {item.venueLocation}</Text>
            ) : null}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
            <Text style={styles.statusEmoji}>{s.emoji}</Text>
            <Text style={[styles.statusLabel, { color: s.color }]}>{s.label}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color={colors.muted} />
            <Text style={styles.metaTxt}>{item.date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={colors.muted} />
            <Text style={styles.metaTxt}>{item.start} → {item.end}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={13} color={colors.muted} />
            <Text style={styles.metaTxt}>{item.guests} pers.</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.eventChip}>
            <Text style={styles.eventChipTxt}>{item.eventType}</Text>
          </View>
          <Text style={styles.totalTxt}>💶 {(item.total || item.price || 0).toLocaleString('fr-FR')} €</Text>
        </View>

        {isAnnonceur && item.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnConfirm} onPress={() => updateStatus(item.id, 'confirmed')}>
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.btnConfirmTxt}>Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancel} onPress={() => updateStatus(item.id, 'cancelled')}>
              <Ionicons name="close" size={16} color="#DC2626" />
              <Text style={styles.btnCancelTxt}>Refuser</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isAnnonceur && (item.status === 'pending' || item.status === 'confirmed') && (
          <View style={styles.actions}>
            {canReview && (
              <TouchableOpacity style={styles.btnReview} onPress={() => setReviewTarget(item)}>
                <Ionicons name="star-outline" size={14} color={colors.primary} />
                <Text style={styles.btnReviewTxt}>Laisser un avis</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btnCancel} onPress={() => handleClientCancel(item)}>
              <Ionicons name="close" size={14} color="#DC2626" />
              <Text style={styles.btnCancelTxt}>
                {item.status === 'confirmed' ? 'Annuler' : 'Annuler la demande'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Réservations</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countTxt}>{reservations.length}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabTxt, tab === t.key && styles.tabTxtActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={[styles.list, filtered.length === 0 && { flex: 1 }]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={!!reviewTarget} transparent animationType="slide" onRequestClose={() => setReviewTarget(null)}>
        <View style={styles.reviewOverlay}>
          <View style={styles.reviewSheet}>
            <Text style={styles.reviewTitle}>Comment s'est passé votre séjour ?</Text>
            <Text style={styles.reviewSub}>{reviewTarget?.venueName}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} onPress={() => setReviewRating(n)}>
                  <Ionicons
                    name={n <= reviewRating ? 'star' : 'star-outline'}
                    size={32}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.reviewInput}
              placeholder="Partagez votre expérience (optionnel)"
              placeholderTextColor={colors.muted}
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[styles.reviewSubmit, submittingReview && { opacity: 0.6 }]}
              onPress={submitReview}
              disabled={submittingReview}
            >
              <Text style={styles.reviewSubmitTxt}>Publier mon avis</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setReviewTarget(null)}>
              <Text style={styles.reviewSkip}>Plus tard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg || '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.white || '#fff',
    borderBottomWidth: 1, borderBottomColor: colors.border || '#E2E8F0',
  },
  headerTitle: { fontSize: typography.xl || 22, fontWeight: '800', color: colors.text },
  countBadge: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  countTxt: { fontSize: 12, fontWeight: '700', color: '#fff' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white || '#fff',
    borderBottomWidth: 1, borderBottomColor: colors.border || '#E2E8F0',
    paddingHorizontal: spacing.sm,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabTxt: { fontSize: 12, fontWeight: '500', color: colors.muted, textAlign: 'center' },
  tabTxtActive: { color: colors.primary, fontWeight: '700' },
  // paddingBottom large : la tab bar est en position absolute (blur)
  list: { padding: spacing.sm, gap: spacing.sm, paddingBottom: 120 },
  card: {
    backgroundColor: colors.white || '#fff',
    borderRadius: radius.lg || 14, padding: spacing.md, ...shadow?.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardVenue: { fontSize: typography.base, fontWeight: '700', color: colors.text },
  cardLocation: { fontSize: 12, color: colors.muted, marginTop: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  statusEmoji: { fontSize: 12 },
  statusLabel: { fontSize: 11, fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaTxt: { fontSize: 12, color: colors.muted },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eventChip: { backgroundColor: colors.border || '#E2E8F0', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  eventChipTxt: { fontSize: 12, fontWeight: '500', color: colors.text },
  totalTxt: { fontSize: typography.base, fontWeight: '800', color: colors.primary },
  actions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: colors.border || '#E2E8F0', marginTop: 10, paddingTop: 10 },
  btnConfirm: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#059669', borderRadius: radius.md, paddingVertical: 9 },
  btnConfirmTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },
  btnCancel: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1.5, borderColor: '#DC2626', borderRadius: radius.md, paddingVertical: 9 },
  btnCancelTxt: { fontSize: 13, fontWeight: '700', color: '#DC2626' },
  btnReview: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.md, paddingVertical: 9 },
  btnReviewTxt: { fontSize: 13, fontWeight: '700', color: colors.primary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: typography.lg, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs },
  emptySubtitle: { fontSize: typography.sm, color: colors.muted, textAlign: 'center', maxWidth: 260, lineHeight: 20 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: 12, marginTop: spacing.lg },
  emptyBtnTxt: { fontSize: typography.sm, fontWeight: '700', color: '#fff' },
  reviewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  reviewSheet: { backgroundColor: colors.white || '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, paddingBottom: 40, gap: 12 },
  reviewTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  reviewSub: { fontSize: 14, color: colors.muted },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  reviewInput: { borderWidth: 1.5, borderColor: colors.border || '#E2E8F0', borderRadius: 12, padding: 12, minHeight: 80, textAlignVertical: 'top', color: colors.text },
  reviewSubmit: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  reviewSubmitTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  reviewSkip: { textAlign: 'center', color: colors.muted, fontWeight: '600', paddingTop: 4 },
});
