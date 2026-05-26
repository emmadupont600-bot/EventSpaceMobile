/**
 * PaymentScreen — Stripe payment with lazy-loaded native SDK.
 *
 * Why lazy-load? Expo Go (and many development workflows) doesn't ship with
 * `@stripe/stripe-react-native` by default. Instead of crashing the whole app
 * we degrade gracefully: when the SDK isn't available, we display a clear
 * message and let the user simulate the booking (in dev) without payment.
 *
 * Production flow (SDK available):
 *   1. createPaymentIntent() via Edge Function   → clientSecret
 *   2. CardField + confirmPayment()              → Stripe charges (manual capture)
 *   3. updateReservationPaymentStatus('authorized')
 *   4. navigate('BookingConfirmation', { paid: true })
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  createPaymentIntent,
  updateReservationPaymentStatus,
  getStripeSDK,
  COMMISSION_RATE,
} from '../../utils/stripeService';
import { useToast } from '../../components/Toast';
import { colors, spacing, radius, shadow } from '../../theme/colors';

const sdk = getStripeSDK();
const StripeAvailable = !!sdk?.useStripe;
const useStripe = sdk?.useStripe || (() => ({ confirmPayment: null }));
const CardField = sdk?.CardField || null;

export default function PaymentScreen({ route, navigation }) {
  const { reservation, venue } = route.params || {};
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { confirmPayment } = useStripe();

  const [loading, setLoading]                 = useState(false);
  const [cardComplete, setCardComplete]       = useState(false);
  const [clientSecret, setClientSecret]       = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [initError, setInitError]             = useState(null);

  const total      = reservation?.total ?? 0;
  const commission = Math.round(total * COMMISSION_RATE);
  const netOwner   = total - commission;

  useEffect(() => {
    if (!reservation?.id || !total) return;
    if (!StripeAvailable) return;
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
    if (!clientSecret) { toast.error('Session de paiement non initialisée.'); return; }
    if (!cardComplete) { toast.error('Veuillez remplir vos informations de carte.'); return; }

    setLoading(true);
    try {
      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: { billingDetails: {} },
      });

      if (error) { toast.error(error.message); return; }

      const status = paymentIntent?.status?.toLowerCase();
      if (status === 'succeeded' || status === 'requires_capture') {
        const paymentStatus = status === 'succeeded' ? 'paid' : 'authorized';
        try {
          await updateReservationPaymentStatus(reservation.id, paymentIntentId, paymentStatus);
        } catch {}
        navigation.replace('BookingConfirmation', {
          reservation: { ...reservation, payment_status: paymentStatus, payment_intent_id: paymentIntentId },
          venue,
          paid: true,
        });
      } else {
        toast.error('Paiement non finalisé.');
      }
    } catch (e) {
      toast.error(e.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  // Dev fallback when Stripe SDK isn't available — let the user finish the flow
  // without an actual payment so the rest of the app remains testable.
  const simulatePayment = () => {
    navigation.replace('BookingConfirmation', {
      reservation: { ...reservation, payment_status: 'unpaid' },
      venue,
      paid: false,
    });
  };

  if (initError) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
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
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement sécurisé</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero amount */}
        <LinearGradient
          colors={['#6366F1', '#4F46E5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.amountHero}
        >
          <Text style={styles.amountLabel}>Total à payer</Text>
          <Text style={styles.amountValue}>{total.toLocaleString('fr-FR')} €</Text>
          <View style={styles.testBadge}>
            <Ionicons name="flask-outline" size={12} color="#fff" />
            <Text style={styles.testBadgeTxt}>Mode test — Carte 4242 4242 4242 4242</Text>
          </View>
        </LinearGradient>

        {/* Récap */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Récapitulatif</Text>
          <Row icon="location-outline" label="Lieu" value={venue?.name} />
          <Row icon="calendar-outline" label="Date" value={reservation?.date} />
          <Row icon="time-outline" label="Horaire" value={`${reservation?.start || reservation?.start_time} → ${reservation?.end || reservation?.end_time}`} />
          <View style={styles.divider} />
          <Row icon="pricetag-outline" label="Sous-total" value={`${total.toLocaleString('fr-FR')} €`} />
          <Row icon="information-circle-outline" label={`Commission (${Math.round(COMMISSION_RATE * 100)}%)`} value={`−${commission.toLocaleString('fr-FR')} €`} tint={colors.primary} />
          <Row icon="wallet-outline" label="Net annonceur" value={`${netOwner.toLocaleString('fr-FR')} €`} tint={colors.success} />
        </View>

        {/* Card field */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations de carte</Text>
          <Text style={styles.cardSubtitle}>Paiement sécurisé via Stripe</Text>

          {!StripeAvailable ? (
            <View style={styles.devBox}>
              <Ionicons name="construct-outline" size={20} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={styles.devTitle}>SDK Stripe non disponible</Text>
                <Text style={styles.devTxt}>
                  Pour activer le paiement réel, créez un dev client Expo et installez{' '}
                  <Text style={{ fontWeight: '800' }}>@stripe/stripe-react-native</Text>.
                </Text>
              </View>
            </View>
          ) : !clientSecret ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingTxt}>Initialisation…</Text>
            </View>
          ) : CardField ? (
            <CardField
              postalCodeEnabled={false}
              placeholders={{ number: '4242 4242 4242 4242' }}
              cardStyle={{
                backgroundColor: '#FFFFFF',
                textColor: '#0F172A',
                placeholderColor: '#94A3B8',
                borderColor: colors.border,
                borderWidth: 1.5,
                borderRadius: 12,
              }}
              style={{ width: '100%', height: 50, marginTop: 8 }}
              onCardChange={(d) => setCardComplete(d.complete)}
            />
          ) : null}
        </View>

        {/* Test cards */}
        {StripeAvailable && (
          <View style={styles.helperBox}>
            <View style={styles.helperHeader}>
              <Ionicons name="flask" size={14} color={colors.successDark} />
              <Text style={styles.helperTitle}>Cartes de test</Text>
            </View>
            {[
              { num: '4242 4242 4242 4242', label: '✅ Accepté' },
              { num: '4000 0000 0000 9995', label: '❌ Refusée' },
              { num: '4000 0025 0000 3155', label: '🔐 3D Secure' },
            ].map((c, i) => (
              <View key={i} style={styles.helperRow}>
                <Text style={styles.helperNum}>{c.num}</Text>
                <Text style={styles.helperLabel}>{c.label}</Text>
              </View>
            ))}
            <Text style={styles.helperNote}>Date : future · CVC : 3 chiffres</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Pay button */}
      <View style={[styles.footer, { paddingBottom: (insets.bottom || 0) + spacing.sm }]}>
        {StripeAvailable ? (
          <TouchableOpacity
            style={[styles.btnPay, (!cardComplete || loading || !clientSecret) && styles.btnDisabled]}
            onPress={handlePay}
            disabled={!cardComplete || loading || !clientSecret}
            activeOpacity={0.9}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="lock-closed" size={18} color="#fff" />
                  <Text style={styles.btnPayTxt}>Payer {total.toLocaleString('fr-FR')} €</Text>
                </>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btnPay, styles.btnSimulate]} onPress={simulatePayment} activeOpacity={0.9}>
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.btnPayTxt}>Continuer (mode démo)</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function Row({ icon, label, value, tint = colors.text }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={tint === colors.text ? colors.primary : tint} />
      <Text style={[styles.rowLabel, tint !== colors.text && { color: tint }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: tint }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: colors.text },

  content: { padding: spacing.md, paddingBottom: spacing.xl },

  amountHero: {
    borderRadius: radius.xl, padding: spacing.xl,
    marginBottom: spacing.md, alignItems: 'center',
    ...shadow.lg,
  },
  amountLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5, textTransform: 'uppercase' },
  amountValue: { fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: -1, marginTop: 6 },
  testBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
    marginTop: 12,
  },
  testBadgeTxt: { fontSize: 11, fontWeight: '700', color: '#fff' },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  rowLabel: { flex: 1, fontSize: 13, color: colors.textSecondary },
  rowValue: { fontSize: 13, fontWeight: '700', color: colors.text, maxWidth: 200 },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 8 },

  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 },
  loadingTxt: { fontSize: 14, color: colors.textSecondary },

  devBox: {
    flexDirection: 'row', gap: 10,
    backgroundColor: colors.warningLight,
    borderRadius: radius.md, padding: 12, marginTop: 8,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  devTitle: { fontSize: 13, fontWeight: '800', color: colors.warningDark },
  devTxt: { fontSize: 12, color: colors.warningDark, marginTop: 2, lineHeight: 17 },

  helperBox: {
    backgroundColor: colors.successLight,
    borderRadius: radius.lg, padding: 14,
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  helperHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  helperTitle: { fontSize: 13, fontWeight: '800', color: colors.successDark },
  helperRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  helperNum: { fontSize: 13, fontFamily: 'monospace', color: colors.successDark, fontWeight: '700' },
  helperLabel: { fontSize: 12, color: colors.successDark, fontWeight: '600' },
  helperNote: { fontSize: 11, color: colors.successDark, marginTop: 6, fontStyle: 'italic' },

  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
    padding: spacing.md,
  },
  btnPay: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 16,
    ...shadow.primary,
  },
  btnSimulate: { backgroundColor: colors.warning, shadowColor: colors.warning },
  btnDisabled: { backgroundColor: colors.borderDark, shadowOpacity: 0 },
  btnPayTxt: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 0.2 },

  errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  errorTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  errorText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  retryTxt: { color: '#fff', fontWeight: '800' },
});
