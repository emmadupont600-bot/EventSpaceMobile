/**
 * PaymentScreen — récapitulatif + paiement Stripe
 * Appelé depuis BookingScreen après validation du formulaire.
 *
 * Props attendues via navigation.navigate('Payment', { reservation, venue }):
 * - reservation : objet partiel (dates, guests, eventType, message, total…)
 * - venue        : objet lieu complet
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { Store } from '../../utils/store';
import { processPayment, computePricing } from '../../services/stripeService';
import { colors, spacing, typography } from '../../theme/colors';

const C = colors;

export default function PaymentScreen({ route, navigation }) {
  const { reservation, venue } = route.params;
  const { user, COMMISSION_RATE } = useApp();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const pricing = computePricing({
    pricePerHour: venue.price,
    startTime: reservation.start,
    endTime: reservation.end,
    commission: COMMISSION_RATE,
  });

  const handlePay = async () => {
    setLoading(true);
    try {
      // 1. Process payment (démo ou Stripe réel)
      const result = await processPayment({
        amount: pricing.total,
        reservationId: `res_${Date.now()}`,
        venueName: venue.name,
      });

      if (!result.success) {
        Alert.alert('Paiement refusé', result.error || 'Réessayez.');
        return;
      }

      // 2. Créer la réservation dans Supabase
      const res = await Store.addReservation({
        venueId: venue.id,
        userId: user.id,
        ownerId: venue.ownerId,
        venueName: venue.name,
        userName: user.name,
        date: reservation.date,
        start: reservation.start,
        end: reservation.end,
        guests: reservation.guests,
        eventType: reservation.eventType,
        message: reservation.message,
        total: pricing.total,
        paymentIntentId: result.paymentIntentId,
      });

      setPaid(true);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <View style={[styles.successContainer, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Paiement confirmé !</Text>
        <Text style={styles.successSub}>
          Votre demande de réservation pour{' '}
          <Text style={{ fontWeight: '800' }}>{venue.name}</Text>
          {' '}a bien été envoyée à l'annonceur.
        </Text>
        <View style={styles.successDetails}>
          <Row label="Date" value={reservation.date} />
          <Row label="Horaires" value={`${reservation.start} – ${reservation.end}`} />
          <Row label="Montant payé" value={`${pricing.total.toLocaleString('fr-FR')} €`} bold />
        </View>
        <TouchableOpacity
          style={styles.successBtn}
          onPress={() => navigation.navigate('ClientTab')}
        >
          <Text style={styles.successBtnText}>Voir mes réservations</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.successBtnSecondary}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Text style={styles.successBtnSecondaryText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Récap lieu */}
        <View style={styles.venueCard}>
          <Text style={styles.venueName}>{venue.name}</Text>
          <Text style={styles.venueMeta}>{venue.city} · {venue.type}</Text>
        </View>

        {/* Détail réservation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de la réservation</Text>
          <Row label="Date" value={reservation.date} />
          <Row label="Horaires" value={`${reservation.start} – ${reservation.end}`} />
          <Row label="Durée" value={`${pricing.hours}h`} />
          <Row label="Invités" value={`${reservation.guests} personnes`} />
          <Row label="Type d'événement" value={reservation.eventType} />
        </View>

        {/* Récap financier */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récapitulatif financier</Text>
          <Row label={`Prix (${venue.price} €/h × ${pricing.hours}h)`} value={`${pricing.subtotal.toLocaleString('fr-FR')} €`} />
          <Row label="Frais de service" value="Inclus" muted />
          <View style={styles.divider} />
          <Row label="Total à payer" value={`${pricing.total.toLocaleString('fr-FR')} €`} bold big />
        </View>

        {/* Moyen de paiement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moyen de paiement</Text>
          <View style={styles.cardMock}>
            <Ionicons name="card-outline" size={24} color={C.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardMockTitle}>Carte bancaire sécurisée</Text>
              <Text style={styles.cardMockSub}>Paiement chiffré via Stripe</Text>
            </View>
            <Ionicons name="lock-closed" size={16} color="#10B981" />
          </View>
          <View style={styles.stripeBadge}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#6366F1" />
            <Text style={styles.stripeBadgeText}>Sécurisé par Stripe · PCI-DSS</Text>
          </View>
        </View>

        {/* Conditions */}
        <Text style={styles.terms}>
          En confirmant, vous acceptez les CGU d'EventSpace. L'annonceur a 24h pour confirmer votre réservation. En cas de refus, vous serez remboursé intégralement.
        </Text>
      </ScrollView>

      {/* Bouton paiement */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.payBtn, loading && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color="#fff" />
              <Text style={styles.payBtnText}>
                Payer {pricing.total.toLocaleString('fr-FR')} €
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Row({ label, value, bold, big, muted }) {
  return (
    <View style={rowStyles.row}>
      <Text style={[rowStyles.label, muted && rowStyles.muted]}>{label}</Text>
      <Text style={[rowStyles.value, bold && rowStyles.bold, big && rowStyles.big]}>{value}</Text>
    </View>
  );
}
const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontSize: 14, color: colors.mid, flex: 1 },
  value: { fontSize: 14, color: colors.dark, fontWeight: '600' },
  bold: { fontWeight: '800' },
  big: { fontSize: 18, color: colors.primary },
  muted: { color: colors.light },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: typography.h3, fontWeight: '800', color: C.dark },
  scroll: { padding: spacing.lg, paddingBottom: 20 },
  venueCard: {
    backgroundColor: C.primary, borderRadius: 16, padding: spacing.lg, marginBottom: spacing.lg,
  },
  venueName: { fontSize: 18, fontWeight: '900', color: '#fff' },
  venueMeta: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  section: {
    backgroundColor: C.white, borderRadius: 16, padding: spacing.lg,
    marginBottom: spacing.md, borderWidth: 1, borderColor: C.border,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: C.dark, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 8 },
  cardMock: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.bg, borderRadius: 12, padding: spacing.md,
    borderWidth: 1.5, borderColor: C.border,
  },
  cardMockTitle: { fontSize: 14, fontWeight: '700', color: C.dark },
  cardMockSub: { fontSize: 12, color: C.mid },
  stripeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    justifyContent: 'center', marginTop: spacing.sm,
  },
  stripeBadgeText: { fontSize: 12, color: '#6366F1', fontWeight: '600' },
  terms: { fontSize: 11, color: C.mid, textAlign: 'center', lineHeight: 17, marginVertical: spacing.sm },
  footer: {
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.white,
  },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: C.primary, borderRadius: 16, paddingVertical: 16,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
  },
  payBtnDisabled: { opacity: 0.65 },
  payBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  // Success
  successContainer: {
    flex: 1, backgroundColor: '#10B981',
    alignItems: 'center', justifyContent: 'center', padding: spacing.xl,
  },
  successIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  successTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: spacing.sm },
  successSub: { fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  successDetails: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16,
    padding: spacing.lg, width: '100%', marginBottom: spacing.lg,
  },
  successBtn: {
    backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14,
    paddingHorizontal: 40, marginBottom: spacing.sm,
  },
  successBtnText: { color: '#10B981', fontWeight: '800', fontSize: 16 },
  successBtnSecondary: { paddingVertical: 10 },
  successBtnSecondaryText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 14 },
});
