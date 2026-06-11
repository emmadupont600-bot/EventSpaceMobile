/**
 * PaymentScreen — paiement Stripe avec CardField.
 * Flow : BookingScreen → PaymentScreen → BookingConfirmationScreen
 *
 * Gestion d'erreur inline (pas d'Alert) : bannière d'erreur + bouton
 * "Réessayer" pour l'init du PaymentIntent comme pour le paiement refusé.
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStripe, CardField } from '@stripe/stripe-react-native';
import { createPaymentIntent, updateReservationPaymentStatus } from '../../services/stripeService';
import { COMMISSION_RATE } from '../../constants/app';
import { Store } from '../../utils/store';
import { useTheme } from '../../context/ThemeContext';
import { applyDiscount, formatMoney, toStripeCents } from '../../utils/currency';
import { spacing, radius, shadow } from '../../theme/tokens';
import { hapticError, hapticSuccess } from '../../utils/haptics';

export default function PaymentScreen({ route, navigation }) {
  const { reservation, venue } = route.params || {};
  const insets = useSafeAreaInsets();
  const { confirmPayment } = useStripe();
  const { semantic, isDark } = useTheme();
  const s = useMemo(() => themedStyles(semantic, isDark), [semantic, isDark]);

  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState(null);
  const [payError, setPayError] = useState(null);
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const currency = venue?.currency || reservation?.currency || 'eur';
  const baseTotal = reservation?.total ?? 0;
  const { total: finalTotal, discount } = promo
    ? applyDiscount(baseTotal, promo)
    : { total: baseTotal, discount: 0 };
  const commission = Math.round(finalTotal * COMMISSION_RATE);
  const netOwner = finalTotal - commission;

  const initPayment = async (amount) => {
    if (!reservation?.id || !amount) return;
    setInitializing(true);
    setInitError(null);
    try {
      const result = await createPaymentIntent(toStripeCents(amount), reservation.id, currency);
      setClientSecret(result.clientSecret);
      setPaymentIntentId(result.paymentIntentId);
    } catch (e) {
      setInitError(e.message);
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    if (!reservation?.id || !finalTotal) return;
    initPayment(finalTotal);
  }, [finalTotal]);

  const applyPromo = async () => {
    setPromoError('');
    setPromoSuccess('');
    try {
      const p = await Store.validatePromoCode(promoInput);
      setPromo(p);
      setPromoSuccess(
        `Code appliqué — réduction ${p.discount_type === 'percent' ? p.discount_value + '%' : p.discount_value + ' €'}`
      );
      hapticSuccess();
    } catch (e) {
      setPromoError(e.message);
      setPromo(null);
      hapticError();
    }
  };

  const handlePay = async () => {
    if (!clientSecret || !cardComplete) return;

    setLoading(true);
    setPayError(null);
    try {
      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: { billingDetails: {} },
      });

      if (error) {
        setPayError(error.message || 'Paiement refusé. Vérifiez votre carte et réessayez.');
        hapticError();
        return;
      }

      if (paymentIntent?.status?.toLowerCase() === 'succeeded') {
        if (promo) await Store.incrementPromoUse(promo.code);
        await Store.updateReservation(reservation.id, {
          payment_status: 'paid',
          paymentIntentId,
          promo_code: promo?.code || null,
          discount_amount: discount,
          currency,
        });
        await updateReservationPaymentStatus(reservation.id, paymentIntentId, 'paid');
        hapticSuccess();
        navigation.replace('BookingConfirmation', {
          reservation: { ...reservation, payment_status: 'paid', payment_intent_id: paymentIntentId },
          venue,
          paid: true,
        });
      }
    } catch (e) {
      setPayError(e.message || 'Une erreur est survenue. Veuillez réessayer.');
      hapticError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={semantic.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Paiement</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Badge TEST */}
        <View style={s.testBadge}>
          <Ionicons name="flask-outline" size={14} color={semantic.warning} />
          <Text style={s.testBadgeTxt}>MODE TEST — Carte 4242 4242 4242 4242</Text>
        </View>

        {/* Récap */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Récapitulatif</Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={16} color={semantic.primary} />
            <Text style={s.rowLabel}>Lieu</Text>
            <Text style={s.rowValue} numberOfLines={1}>{venue?.name}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={16} color={semantic.primary} />
            <Text style={s.rowLabel}>Date</Text>
            <Text style={s.rowValue}>{reservation?.date}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={16} color={semantic.primary} />
            <Text style={s.rowLabel}>Horaire</Text>
            <Text style={s.rowValue}>{reservation?.start_time || reservation?.start} → {reservation?.end_time || reservation?.end}</Text>
          </View>
          <View style={s.divider} />
          <View style={styles.row}>
            <Ionicons name="pricetag-outline" size={16} color={semantic.primary} />
            <Text style={s.rowLabel}>Sous-total</Text>
            <Text style={s.rowValue}>{formatMoney(baseTotal, currency)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.row}>
              <Ionicons name="gift-outline" size={16} color={semantic.success} />
              <Text style={[s.rowLabel, { color: semantic.success }]}>Promo {promo?.code}</Text>
              <Text style={[s.rowValue, { color: semantic.success }]}>−{formatMoney(discount, currency)}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Ionicons name="information-circle-outline" size={16} color={semantic.textMuted} />
            <Text style={s.rowLabel}>Commission ({Math.round(COMMISSION_RATE * 100)}%)</Text>
            <Text style={s.rowValue}>−{formatMoney(commission, currency)}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="wallet-outline" size={16} color={semantic.success} />
            <Text style={[s.rowLabel, { color: semantic.success }]}>Net annonceur</Text>
            <Text style={[s.rowValue, { color: semantic.success }]}>{formatMoney(netOwner, currency)}</Text>
          </View>
          <View style={s.divider} />
          <View style={styles.totalRow}>
            <Text style={s.totalLabel}>Total à payer</Text>
            <Text style={s.totalValue}>{formatMoney(finalTotal, currency)}</Text>
          </View>
        </View>

        {/* Code promo */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Code promo</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={s.promoInput}
              placeholder="EVENTSPACE10"
              placeholderTextColor={semantic.textFaint}
              value={promoInput}
              onChangeText={setPromoInput}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={s.promoBtn} onPress={applyPromo}>
              <Text style={{ color: semantic.primaryForeground, fontWeight: '700' }}>Appliquer</Text>
            </TouchableOpacity>
          </View>
          {!!promoError && <Text style={s.promoError}>{promoError}</Text>}
          {!!promoSuccess && <Text style={s.promoSuccess}>{promoSuccess}</Text>}
        </View>

        {/* CardField Stripe + erreurs init inline */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Informations de carte</Text>
          <Text style={s.cardSubtitle}>Paiement sécurisé via Stripe</Text>
          {initializing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={semantic.primary} />
              <Text style={s.loadingTxt}>Initialisation…</Text>
            </View>
          ) : initError ? (
            <View style={s.inlineErrorBox}>
              <Ionicons name="alert-circle" size={18} color={semantic.error} />
              <View style={{ flex: 1 }}>
                <Text style={s.inlineErrorTitle}>Initialisation impossible</Text>
                <Text style={s.inlineErrorTxt}>{initError}</Text>
              </View>
              <TouchableOpacity style={s.retryBtn} onPress={() => initPayment(finalTotal)}>
                <Ionicons name="refresh" size={14} color={semantic.primaryForeground} />
                <Text style={s.retryTxt}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CardField
              postalCodeEnabled={false}
              placeholders={{ number: '4242 4242 4242 4242' }}
              cardStyle={{
                backgroundColor: isDark ? '#272320' : '#FFFFFF',
                textColor: isDark ? '#F4F0EA' : '#1B1713',
                placeholderColor: isDark ? '#7C7367' : '#9C9186',
                borderColor: isDark ? '#332E29' : '#E8E2D8',
                borderWidth: 1,
                borderRadius: 12,
              }}
              style={{ width: '100%', height: 50, marginTop: 8 }}
              onCardChange={(d) => { setCardComplete(d.complete); if (d.complete) setPayError(null); }}
            />
          )}
        </View>

        {/* Cartes test helper */}
        <View style={s.helperBox}>
          <Text style={s.helperTitle}>Cartes de test</Text>
          {[
            { num: '4242 4242 4242 4242', label: 'Accepté' },
            { num: '4000 0000 0000 9995', label: 'Refusée' },
            { num: '4000 0025 0000 3155', label: '3D Secure' },
          ].map((c, i) => (
            <View key={i} style={styles.helperRow}>
              <Text style={s.helperNum}>{c.num}</Text>
              <Text style={s.helperLabel}>{c.label}</Text>
            </View>
          ))}
          <Text style={s.helperNote}>Date : n'importe quelle date future — CVC : n'importe quoi</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Erreur de paiement inline + bouton payer (sert de retry) */}
      <View style={[s.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        {!!payError && (
          <View style={s.payErrorBanner}>
            <Ionicons name="alert-circle" size={16} color={semantic.error} />
            <Text style={s.payErrorTxt}>{payError}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[s.btnPay, (!cardComplete || loading || !clientSecret) && s.btnDisabled]}
          onPress={handlePay}
          disabled={!cardComplete || loading || !clientSecret}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color={semantic.primaryForeground} /> : (
            <>
              <Ionicons name="lock-closed" size={18} color={semantic.primaryForeground} />
              <Text style={s.btnPayTxt}>
                {payError ? 'Réessayer le paiement' : `Payer ${formatMoney(finalTotal, currency)}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  helperRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
});

function themedStyles(c, isDark) {
  const hairline = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(27,23,19,0.10)';
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    },
    headerTitle: { fontSize: 16, fontWeight: '700', color: c.text },
    testBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: c.goldSoft, borderRadius: radius.full,
      paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'center', marginBottom: spacing.md,
    },
    testBadgeTxt: { fontSize: 12, fontWeight: '600', color: c.warning },
    card: {
      backgroundColor: c.surface, borderRadius: radius.lg,
      padding: spacing.lg, marginBottom: spacing.md,
      ...shadow.sm,
    },
    cardTitle: { fontSize: 15, fontWeight: '700', color: c.text, marginBottom: spacing.sm },
    cardSubtitle: { fontSize: 12, color: c.textFaint, marginBottom: 4 },
    rowLabel: { flex: 1, fontSize: 13, color: c.textMuted },
    rowValue: { fontSize: 13, fontWeight: '600', color: c.text, maxWidth: 180 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: hairline, marginVertical: spacing.sm },
    totalLabel: { fontSize: 16, fontWeight: '700', color: c.text },
    totalValue: { fontSize: 24, fontWeight: '800', color: c.primary, letterSpacing: -0.3 },
    loadingTxt: { fontSize: 14, color: c.textFaint },
    inlineErrorBox: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: isDark ? 'rgba(224,123,106,0.12)' : '#FBEAE6',
      borderRadius: radius.sm, padding: spacing.md, marginTop: spacing.sm,
    },
    inlineErrorTitle: { fontSize: 13, fontWeight: '700', color: c.error },
    inlineErrorTxt: { fontSize: 12, color: c.error, marginTop: 2 },
    retryBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: c.primary, borderRadius: radius.full,
      paddingHorizontal: 12, height: 36,
    },
    retryTxt: { color: c.primaryForeground, fontWeight: '700', fontSize: 12 },
    helperBox: {
      backgroundColor: c.surface, borderRadius: radius.md, padding: 14,
      marginBottom: spacing.md, ...shadow.xs,
    },
    helperTitle: { fontSize: 13, fontWeight: '700', color: c.text, marginBottom: 10 },
    helperNum: { fontSize: 13, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), color: c.textMuted, fontWeight: '600' },
    helperLabel: { fontSize: 12, color: c.textFaint, fontWeight: '500' },
    helperNote: { fontSize: 12, color: c.textFaint, marginTop: 4, fontStyle: 'italic' },
    footer: {
      position: 'absolute', left: 0, right: 0, bottom: 0,
      backgroundColor: c.surface,
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: hairline,
      padding: spacing.md,
    },
    payErrorBanner: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: isDark ? 'rgba(224,123,106,0.12)' : '#FBEAE6',
      borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm,
    },
    payErrorTxt: { flex: 1, fontSize: 13, color: c.error, fontWeight: '500' },
    btnPay: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: c.primary, borderRadius: 14, height: 56,
    },
    btnDisabled: { opacity: 0.45 },
    btnPayTxt: { fontSize: 16, fontWeight: '700', color: c.primaryForeground },
    promoInput: {
      flex: 1, borderWidth: 1, borderColor: c.border, borderRadius: radius.sm,
      paddingHorizontal: 12, height: 44, fontSize: 14, color: c.text,
      backgroundColor: c.bg,
    },
    promoBtn: {
      borderRadius: radius.sm, paddingHorizontal: 16, height: 44,
      justifyContent: 'center', backgroundColor: c.primary,
    },
    promoError: { color: c.error, fontSize: 12, marginTop: 6 },
    promoSuccess: { color: c.success, fontSize: 12, marginTop: 6, fontWeight: '600' },
  });
}
