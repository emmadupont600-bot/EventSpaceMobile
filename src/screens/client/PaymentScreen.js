/**
 * PaymentScreen.js
 * Écran de paiement Stripe — mode TEST
 *
 * Navigation params attendus :
 *   - reservation: { id, total, venueName, date }
 *
 * Prérequis :
 *   npm install @stripe/stripe-react-native
 *   Dans App.js : wrap avec <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useStripe,
  CardField,
  createPaymentMethod,
} from '@stripe/stripe-react-native';
import { createPaymentIntent, updateReservationPaymentStatus } from '../../utils/stripeService';

const P = '#4F46E5';

export default function PaymentScreen({ route, navigation }) {
  const { reservation } = route.params || {};
  const { confirmPayment } = useStripe();

  const [loading, setLoading]       = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [initError, setInitError]   = useState(null);

  // Crée le PaymentIntent dès l'ouverture de l'écran
  useEffect(() => {
    if (!reservation?.id || !reservation?.total) return;
    (async () => {
      try {
        const result = await createPaymentIntent(
          reservation.total,
          reservation.id
        );
        setClientSecret(result.clientSecret);
        setPaymentIntentId(result.paymentIntentId);
      } catch (e) {
        setInitError(e.message);
      }
    })();
  }, []);

  const handlePay = async () => {
    if (!clientSecret) {
      Alert.alert('Erreur', 'Session de paiement non initialisée.');
      return;
    }
    if (!cardComplete) {
      Alert.alert('Carte incomplète', 'Veuillez saisir vos informations de carte complètes.');
      return;
    }

    setLoading(true);
    try {
      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: { billingDetails: {} },
      });

      if (error) {
        Alert.alert('Paiement refusé', error.message);
        return;
      }

      if (paymentIntent?.status === 'Succeeded') {
        // Met à jour Supabase
        await updateReservationPaymentStatus(
          reservation.id,
          paymentIntentId,
          'paid'
        );

        Alert.alert(
          '🎉 Paiement réussi !',
          `Votre réservation pour "${reservation.venueName}" est confirmée.\n\nMontant débité : ${reservation.total}€`,
          [{ text: 'Voir mes réservations', onPress: () => navigation.navigate('ReservationsTab') }]
        );
      }
    } catch (e) {
      Alert.alert('Erreur', e.message || 'Une erreur est survenue lors du paiement.');
    } finally {
      setLoading(false);
    }
  };

  if (initError) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Erreur d'initialisation</Text>
          <Text style={styles.errorText}>{initError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryBtnText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement sécurisé</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Badge TEST */}
        <View style={styles.testBadge}>
          <Ionicons name="flask" size={14} color="#D97706" />
          <Text style={styles.testBadgeText}>MODE TEST — Utilisez la carte 4242 4242 4242 4242</Text>
        </View>

        {/* Récap commande */}
        <View style={styles.orderCard}>
          <Text style={styles.orderTitle}>Résumé de la réservation</Text>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Lieu</Text>
            <Text style={styles.orderValue}>{reservation?.venueName || '—'}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Date</Text>
            <Text style={styles.orderValue}>{reservation?.date || '—'}</Text>
          </View>
          <View style={[styles.orderRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total à payer</Text>
            <Text style={styles.totalValue}>{reservation?.total || 0}€</Text>
          </View>
        </View>

        {/* Formulaire carte */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Informations de carte</Text>
          <Text style={styles.sectionSubtitle}>Paiement sécurisé via Stripe</Text>

          {!clientSecret ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={P} />
              <Text style={styles.loadingText}>Initialisation du paiement…</Text>
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
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
              }}
            />
          )}
        </View>

        {/* Carte test helper */}
        <View style={styles.testHelper}>
          <Text style={styles.testHelperTitle}>🧪 Cartes de test Stripe</Text>
          {[
            { num: '4242 4242 4242 4242', label: 'Paiement accepté' },
            { num: '4000 0000 0000 9995', label: 'Carte refusée' },
            { num: '4000 0025 0000 3155', label: 'Authentification 3D Secure' },
          ].map((c, i) => (
            <View key={i} style={styles.testCard}>
              <Text style={styles.testCardNum}>{c.num}</Text>
              <Text style={styles.testCardLabel}>{c.label}</Text>
            </View>
          ))}
          <Text style={styles.testCardNote}>Date : n'importe quelle date future — CVC : n'importe quoi</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bouton payer */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.payBtn,
            (!cardComplete || loading || !clientSecret) && styles.payBtnDisabled,
          ]}
          onPress={handlePay}
          disabled={!cardComplete || loading || !clientSecret}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color="#fff" />
              <Text style={styles.payBtnText}>Payer {reservation?.total || 0}€</Text>
            </>
          )}
        </TouchableOpacity>
        <View style={styles.stripeNotice}>
          <Ionicons name="shield-checkmark" size={14} color="#64748B" />
          <Text style={styles.stripeNoticeText}>Paiement sécurisé par Stripe</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#F8FAFC' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn:        { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  body:           { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  testBadge:      { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
  testBadgeText:  { fontSize: 12, color: '#D97706', fontWeight: '600', flex: 1 },
  orderCard:      { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  orderTitle:     { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 14 },
  orderRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderLabel:     { fontSize: 14, color: '#64748B' },
  orderValue:     { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  totalRow:       { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', marginBottom: 0 },
  totalLabel:     { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  totalValue:     { fontSize: 24, fontWeight: '800', color: P },
  cardSection:    { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle:   { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  sectionSubtitle:{ fontSize: 13, color: '#94A3B8', marginBottom: 16 },
  loadingCard:    { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText:    { fontSize: 14, color: '#94A3B8' },
  cardField:      { width: '100%', height: 50 },
  testHelper:     { backgroundColor: '#F0FDF4', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#BBF7D0' },
  testHelperTitle:{ fontSize: 14, fontWeight: '700', color: '#166534', marginBottom: 12 },
  testCard:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  testCardNum:    { fontSize: 13, fontFamily: 'monospace', color: '#15803D', fontWeight: '600' },
  testCardLabel:  { fontSize: 12, color: '#4ADE80', fontWeight: '500' },
  testCardNote:   { fontSize: 12, color: '#86EFAC', marginTop: 6, fontStyle: 'italic' },
  bottomBar:      { padding: 20, paddingBottom: 34, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  payBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: P, paddingVertical: 17, borderRadius: 16 },
  payBtnDisabled: { backgroundColor: '#CBD5E1' },
  payBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  stripeNotice:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 },
  stripeNoticeText:{ fontSize: 12, color: '#94A3B8' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  errorTitle:     { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  errorText:      { fontSize: 14, color: '#64748B', textAlign: 'center' },
  retryBtn:       { backgroundColor: P, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  retryBtnText:   { color: '#fff', fontWeight: '700' },
});
