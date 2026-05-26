import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, shadow, gradients } from '../../theme/colors';

export default function BookingConfirmationScreen({ navigation, route }) {
  const { reservation, venue, paid } = route.params || {};
  const scale = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }),
      Animated.timing(fade, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const goHome      = () => navigation.popToTop();
  const goReservations = () => {
    try { navigation.getParent()?.navigate('Reservations'); }
    catch { navigation.popToTop(); }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
          <LinearGradient colors={gradients.success} style={styles.iconCircle}>
            <Ionicons name="checkmark" size={56} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: fade, alignItems: 'center', width: '100%' }}>
          <Text style={styles.title}>Réservation envoyée !</Text>
          <Text style={styles.subtitle}>
            Votre demande a bien été transmise à l'annonceur. Vous recevrez une confirmation très bientôt.
          </Text>

          {paid && (
            <View style={styles.paidBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#fff" />
              <Text style={styles.paidBadgeTxt}>Paiement sécurisé validé</Text>
            </View>
          )}

          {(reservation || venue) && (
            <View style={styles.card}>
              {venue?.name && (
                <Row icon="location" label={venue.name} />
              )}
              {reservation?.date && (
                <Row icon="calendar" label={reservation.date} />
              )}
              {reservation?.start && reservation?.end && (
                <Row icon="time" label={`${reservation.start} → ${reservation.end}`} />
              )}
              {reservation?.guests != null && (
                <Row icon="people" label={`${reservation.guests} personne${reservation.guests > 1 ? 's' : ''}`} />
              )}
              {reservation?.eventType && (
                <Row icon="ribbon" label={reservation.eventType} />
              )}
              {reservation?.total != null && (
                <View style={[styles.row, styles.totalRow]}>
                  <Ionicons name="card" size={18} color={colors.primary} />
                  <Text style={styles.totalText}>{reservation.total.toLocaleString('fr-FR')} € {paid ? 'payés' : ''}</Text>
                </View>
              )}
              {reservation?.payment_intent_id && (
                <Text style={styles.intentId}>Réf. paiement : {reservation.payment_intent_id}</Text>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.btnPrimary} onPress={goHome} activeOpacity={0.9}>
            <Ionicons name="home" size={20} color="#fff" />
            <Text style={styles.btnPrimaryText}>Retour à l'accueil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={goReservations} activeOpacity={0.85}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={styles.btnSecondaryText}>Voir mes réservations</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function Row({ icon, label }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.rowText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.xl, alignItems: 'center', paddingBottom: 40 },
  iconWrap: { marginTop: 80, marginBottom: spacing.xl },
  iconCircle: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.lg, shadowColor: colors.success,
  },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, textAlign: 'center', letterSpacing: -0.4 },
  subtitle: {
    fontSize: 15, color: colors.textSecondary, textAlign: 'center',
    lineHeight: 22, marginTop: 12, marginBottom: 20, maxWidth: 320,
  },
  paidBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.success, borderRadius: 999,
    paddingHorizontal: 18, paddingVertical: 9, marginBottom: 24,
  },
  paidBadgeTxt: { fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
  card: {
    width: '100%', backgroundColor: colors.surface,
    borderRadius: radius.xl, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.borderLight,
    gap: 14, marginBottom: 32, ...shadow.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { fontSize: 15, color: colors.text, fontWeight: '600', flex: 1 },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 12, marginTop: 4 },
  totalText: { fontSize: 17, fontWeight: '900', color: colors.primary },
  intentId: { fontSize: 11, color: colors.textLight, marginTop: 4, fontStyle: 'italic' },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 16, paddingHorizontal: 32, marginBottom: 12, width: '100%',
    justifyContent: 'center', ...shadow.primary,
  },
  btnPrimaryText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  btnSecondary: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderRadius: radius.md,
    paddingVertical: 16, paddingHorizontal: 32, width: '100%',
    justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border,
  },
  btnSecondaryText: { fontSize: 16, fontWeight: '700', color: colors.primary },
});
