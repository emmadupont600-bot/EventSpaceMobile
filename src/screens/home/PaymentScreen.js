/**
 * PaymentScreen.js — src/screens/home/
 * Écran de paiement Stripe avec vrai CardField
 * Flow : BookingScreen → PaymentScreen → BookingConfirmationScreen
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStripe, CardField } from '@stripe/stripe-react-native';
import { createPaymentIntent, updateReservationPaymentStatus } from '../../utils/stripeService';
import { colors, spacing, radius } from '../../theme/colors';

export default function PaymentScreen({ route, navigation }) {
  const { reservation, venue } = route.params || {};
  const insets = useSafeAreaInsets();
  const { confirmPayment } = useStripe();

  const [loading, setLoading]           = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [initError, setInitError]       = useState(null);

  const total      = reservation?.total ?? 0;
  const commission = Math.round(total * 0.15);
  const netOwner   = total - commission;

  // Crée le PaymentIntent dès l'ouverture
  useEffect(() => {
    if (!reservation?.id || !total) return;
    (async () => {
      try {
        const result = await createPaymentIntent(total, reservation.id);
        setClientSecret(result.clientSecret);
        setPaymentIntentId(result.paymentIntentId);
      } catch (e) {
        setInitError(e.message);
      }
    })();
  }, []);

  const handlePay = async () => {
    if (!clientSecret) { Alert.alert('Erreur', 'Session de paiement non initialisée.'); return; }
    if (!cardComplete) { Alert.alert('Carte incomplète', 'Veuillez saisir vos informations de carte complètes.'); return; }

    setLoading(true);
    try {
      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: { billingDetails: {} },
      });

      if (error) { Alert.alert('Paiement refusé', error.message); return; }

      if (paymentIntent?.status?.toLowerCase() === 'succeeded') {
        await updateReservationPaymentStatus(reservation.id, paymentIntentId, 'paid');
        navigation.replace('BookingConfirmation', {
          reservation: { ...reservation, payment_status: 'paid', payment_intent_id: paymentIntentId },
          venue,
          paid: true,
        });
      }
    } catch (e) {
      Alert.alert('Erreur', e.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (initError) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Erreur d'initialisation</Text>
          <Text style={styles.errorText}>{initError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryTxt}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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

        {/* Badge TEST */}
        <View style={styles.testBadge}>
          <Ionicons name="flask-outline" size={14} color="#D97706" />
          <Text style={styles.testBadgeTxt}>MODE TEST — Carte 4242 4242 4242 4242</Text>
        </View>

        {/* Récap */}
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
            <Text style={styles.rowValue}>{reservation?.start_time} → {reservation?.end_time}</Text>
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

        {/* CardField Stripe */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations de carte</Text>
          <Text style={styles.cardSubtitle}>Paiement sécurisé via Stripe</Text>
          {!clientSecret ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingTxt}>Initialisation…</Text>
            </View>
          ) : (
            <CardField
              postalCodeEnabled={false}
              placeholders={{ number: '4242 4242 4242 4242' }}
              cardStyle={{
                backgroundColor: '#FFFFFF',
                textColor: '#0F172A',
                placeholderColor: '#94A3B8',
                borderColor: '#E2E8F0',
                borderWidth: 1.5,
                borderRadius: 12,
              }}
              style={{ width: '100%', height: 50, marginTop: 8 }}
              onCardChange={(d) => setCardComplete(d.complete)}
            />
          )}
        </View>

        {/* Cartes test helper */}
        <View style={styles.helperBox}>
          <Text style={styles.helperTitle}>🧪 Cartes de test</Text>
          {[
            { num: '4242 4242 4242 4242', label: 'Accepté' },
            { num: '4000 0000 0000 9995', label: 'Refusée' },
            { num: '4000 0025 0000 3155', label: '3D Secure' },
          ].map((c, i) => (
            <View key={i} style={styles.helperRow}>
              <Text style={styles.helperNum}>{c.num}</Text>
              <Text style={styles.helperLabel}>{c.label}</Text>
            </View>
          ))}
          <Text style={styles.helperNote}>Date : n'importe quelle date future — CVC : n'importe quoi</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bouton payer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TouchableOpacity
          style={[styles.btnPay, (!cardComplete || loading || !clientSecret) && styles.btnDisabled]}
          onPress={handlePay}
          disabled={!cardComplete || loading || !clientSecret}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="lock-closed" size={18} color="#fff" />
              <Text style={styles.btnPayTxt}>Payer {total} €</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.bg || '#F8FAFC' },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.white || '#fff', borderBottomWidth: 1, borderBottomColor: colors.border || '#E2E8F0' },
  backBtn:      { flexDirection: 'row', alignItems: 'center', width: 80 },
  backTxt:      { fontSize: 13, color: colors.primary, marginLeft: 4 },
  headerTitle:  { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.dark },
  content:      { padding: spacing.md, paddingBottom: spacing.xl },
  testBadge:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF3C7', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'center', marginBottom: spacing.md, borderWidth: 1, borderColor: '#FDE68A' },
  testBadgeTxt: { fontSize: 12, fontWeight: '600', color: '#D97706' },
  card:         { backgroundColor: colors.white || '#fff', borderRadius: radius.lg || 14, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border || '#E2E8F0' },
  cardTitle:    { fontSize: 15, fontWeight: '700', color: colors.dark, marginBottom: spacing.sm },
  cardSubtitle: { fontSize: 12, color: '#94A3B8', marginBottom: 4 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  rowLabel:     { flex: 1, fontSize: 13, color: colors.mid },
  rowValue:     { fontSize: 13, fontWeight: '600', color: colors.dark, maxWidth: 180 },
  divider:      { height: 1, backgroundColor: colors.border || '#E2E8F0', marginVertical: spacing.sm },
  totalRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel:   { fontSize: 16, fontWeight: '700', color: colors.dark },
  totalValue:   { fontSize: 24, fontWeight: '800', color: colors.primary },
  loadingRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  loadingTxt:   { fontSize: 14, color: '#94A3B8' },
  helperBox:    { backgroundColor: '#F0FDF4', borderRadius: 14, padding: 14, marginBottom: spacing.md, borderWidth: 1, borderColor: '#BBF7D0' },
  helperTitle:  { fontSize: 13, fontWeight: '700', color: '#166534', marginBottom: 10 },
  helperRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  helperNum:    { fontSize: 13, fontFamily: 'monospace', color: '#15803D', fontWeight: '600' },
  helperLabel:  { fontSize: 12, color: '#4ADE80', fontWeight: '500' },
  helperNote:   { fontSize: 11, color: '#86EFAC', marginTop: 4, fontStyle: 'italic' },
  footer:       { backgroundColor: colors.white || '#fff', borderTopWidth: 1, borderTopColor: colors.border || '#E2E8F0', padding: spacing.md },
  btnPay:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: radius.md || 12, paddingVertical: 16 },
  btnDisabled:  { backgroundColor: '#CBD5E1' },
  btnPayTxt:    { fontSize: 17, fontWeight: '800', color: '#fff' },
  errorBox:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  errorTitle:   { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  errorText:    { fontSize: 14, color: '#64748B', textAlign: 'center' },
  retryBtn:     { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  retryTxt:     { color: '#fff', fontWeight: '700' },
});
