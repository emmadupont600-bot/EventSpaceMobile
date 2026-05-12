/**
 * PaymentScreen.js
 * Écran de paiement Stripe (mode test)
 * Flow : BookingScreen → PaymentScreen → BookingConfirmationScreen
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { processPayment } from '../../services/stripeService';
import { colors, spacing, radius } from '../../theme/colors';

const TEST_CARDS = [
  { label: '✅ Paiement accepté', number: '4242 4242 4242 4242', color: '#10B981' },
  { label: '❌ Carte refusée',    number: '4000 0000 0000 9995', color: '#EF4444' },
  { label: '🔐 3D Secure',        number: '4000 0025 0000 3155', color: '#F59E0B' },
];

export default function PaymentScreen({ route, navigation }) {
  const { reservation, venue } = route.params || {};
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const total = reservation?.total ?? 0;
  const commission = Math.round(total * 0.15);
  const netOwner = total - commission;

  const handlePay = async () => {
    setLoading(true);
    try {
      const result = await processPayment({
        amount: total,
        reservationId: reservation?.id,
        venueName: venue?.name,
      });

      if (result.success) {
        navigation.replace('BookingConfirmation', {
          reservation: { ...reservation, payment_status: 'paid', payment_intent_id: result.paymentIntentId },
          venue,
          paid: true,
        });
      } else {
        Alert.alert('❌ Paiement refusé', result.error || 'Le paiement a échoué. Réessayez.');
      }
    } catch (e) {
      Alert.alert('❌ Erreur', 'Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={styles.backTxt}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Badge mode test */}
        <View style={styles.testBadge}>
          <Ionicons name="flask-outline" size={14} color="#7C3AED" />
          <Text style={styles.testBadgeTxt}>Mode TEST — aucun vrai paiement</Text>
        </View>

        {/* Récap commande */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Récapitulatif</Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={styles.rowLabel}>Lieu</Text>
            <Text style={styles.rowValue} numberOfLines={1}>{venue?.name}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={styles.rowLabel}>Date</Text>
            <Text style={styles.rowValue}>{reservation?.date}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text style={styles.rowLabel}>Horaire</Text>
            <Text style={styles.rowValue}>{reservation?.start} → {reservation?.end}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Ionicons name="pricetag-outline" size={16} color={colors.primary} />
            <Text style={styles.rowLabel}>Sous-total</Text>
            <Text style={styles.rowValue}>{total} €</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="information-circle-outline" size={16} color="#7C3AED" />
            <Text style={[styles.rowLabel, { color: '#7C3AED' }]}>Commission (15%)</Text>
            <Text style={[styles.rowValue, { color: '#7C3AED' }]}>−{commission} €</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="wallet-outline" size={16} color="#10B981" />
            <Text style={[styles.rowLabel, { color: '#10B981' }]}>Net annonceur</Text>
            <Text style={[styles.rowValue, { color: '#10B981' }]}>{netOwner} €</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total à payer</Text>
            <Text style={styles.totalValue}>{total} €</Text>
          </View>
        </View>

        {/* Cartes test */}
        <Text style={styles.sectionTitle}>🃏 Cartes de test disponibles</Text>
        {TEST_CARDS.map((card, i) => (
          <View key={i} style={[styles.testCard, { borderLeftColor: card.color }]}>
            <Text style={styles.testCardLabel}>{card.label}</Text>
            <Text style={styles.testCardNumber}>{card.number}</Text>
            <Text style={styles.testCardInfo}>Exp : 12/26 · CVC : 123</Text>
          </View>
        ))}

        {/* Info sécurité */}
        <View style={styles.secureBox}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#10B981" />
          <Text style={styles.secureTxt}>Paiement sécurisé par Stripe. Vos données sont protégées.</Text>
        </View>

      </ScrollView>

      {/* Bouton payer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TouchableOpacity
          style={[styles.btnPay, loading && styles.btnDisabled]}
          onPress={handlePay}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="card" size={20} color="#fff" />
              <Text style={styles.btnPayTxt}>Payer {total} €</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg || '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.white || '#fff',
    borderBottomWidth: 1, borderBottomColor: colors.border || '#E2E8F0',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', width: 80 },
  backTxt: { fontSize: 13, color: colors.primary, marginLeft: 4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.dark },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  testBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F5F3FF', borderRadius: radius.full || 999,
    paddingHorizontal: 14, paddingVertical: 7,
    alignSelf: 'center', marginBottom: spacing.md,
    borderWidth: 1, borderColor: '#DDD6FE',
  },
  testBadgeTxt: { fontSize: 12, fontWeight: '600', color: '#7C3AED' },
  card: {
    backgroundColor: colors.white || '#fff', borderRadius: radius.lg || 14,
    padding: spacing.md, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border || '#E2E8F0',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.dark, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  rowLabel: { flex: 1, fontSize: 13, color: colors.mid },
  rowValue: { fontSize: 13, fontWeight: '600', color: colors.dark, maxWidth: 180 },
  divider: { height: 1, backgroundColor: colors.border || '#E2E8F0', marginVertical: spacing.sm },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.dark },
  totalValue: { fontSize: 24, fontWeight: '800', color: colors.primary },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.dark, marginBottom: spacing.sm },
  testCard: {
    backgroundColor: colors.white || '#fff', borderRadius: radius.md || 10,
    padding: spacing.sm, marginBottom: 8,
    borderLeftWidth: 4, borderWidth: 1, borderColor: colors.border || '#E2E8F0',
  },
  testCardLabel: { fontSize: 13, fontWeight: '700', color: colors.dark, marginBottom: 3 },
  testCardNumber: { fontSize: 15, fontWeight: '600', color: colors.dark, letterSpacing: 1 },
  testCardInfo: { fontSize: 11, color: colors.mid, marginTop: 2 },
  secureBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F0FDF4', borderRadius: radius.md || 10,
    padding: spacing.sm, marginTop: spacing.sm,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  secureTxt: { flex: 1, fontSize: 12, color: '#166534', lineHeight: 17 },
  footer: {
    backgroundColor: colors.white || '#fff',
    borderTopWidth: 1, borderTopColor: colors.border || '#E2E8F0', padding: spacing.md,
  },
  btnPay: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: colors.primary, borderRadius: radius.md || 12, paddingVertical: 16,
  },
  btnPayTxt: { fontSize: 17, fontWeight: '800', color: '#fff' },
  btnDisabled: { opacity: 0.5 },
});
