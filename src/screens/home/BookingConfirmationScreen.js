/**
 * BookingConfirmationScreen
 * Reçoit : { reservation, venue, paid }
 * Affiche un badge vert "✅ Paiement validé" si paid === true
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { COLORS } from '../../theme/colors';

export default function BookingConfirmationScreen({ navigation, route }) {
  const { reservation, venue, paid } = route.params || {};

  /**
   * Retourne à l'écran d'accueil (HomeMain) dans la tab Accueil.
   * On utilise popToTop() pour vider le stack HomeStack,
   * ce qui ramène automatiquement à HomeMain.
   */
  const goHome = () => {
    navigation.popToTop();
  };

  /**
   * Navigue vers la tab Reservations.
   * On dispatch depuis le parent (tab navigator) via navigation.getParent().
   */
  const goReservations = () => {
    try {
      navigation.getParent()?.navigate('Reservations');
    } catch (_) {
      navigation.popToTop();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Icône succès */}
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={80} color={COLORS.success || '#22c55e'} />
        </View>

        <Text style={styles.title}>Réservation confirmée !</Text>
        <Text style={styles.subtitle}>
          Votre demande a bien été envoyée à l'annonceur. Vous recevrez une confirmation sous 24h.
        </Text>

        {/* Badge paiement validé */}
        {paid && (
          <View style={styles.paidBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#fff" />
            <Text style={styles.paidBadgeTxt}>Paiement sécurisé validé ✔️</Text>
          </View>
        )}

        {/* Récap */}
        {(reservation || venue) && (
          <View style={styles.card}>
            {venue?.name && (
              <View style={styles.row}>
                <Ionicons name="location" size={18} color={COLORS.primary} />
                <Text style={styles.rowText}>{venue.name}</Text>
              </View>
            )}
            {reservation?.date && (
              <View style={styles.row}>
                <Ionicons name="calendar" size={18} color={COLORS.primary} />
                <Text style={styles.rowText}>{reservation.date}</Text>
              </View>
            )}
            {reservation?.start && reservation?.end && (
              <View style={styles.row}>
                <Ionicons name="time" size={18} color={COLORS.primary} />
                <Text style={styles.rowText}>{reservation.start} → {reservation.end}</Text>
              </View>
            )}
            {reservation?.guests != null && (
              <View style={styles.row}>
                <Ionicons name="people" size={18} color={COLORS.primary} />
                <Text style={styles.rowText}>
                  {reservation.guests} personne{reservation.guests > 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {reservation?.eventType && (
              <View style={styles.row}>
                <Ionicons name="ribbon" size={18} color={COLORS.primary} />
                <Text style={styles.rowText}>{reservation.eventType}</Text>
              </View>
            )}
            {reservation?.total != null && (
              <View style={[styles.row, styles.totalRow]}>
                <Ionicons name="card" size={18} color={COLORS.primary} />
                <Text style={styles.totalText}>{reservation.total} € payés</Text>
              </View>
            )}
            {reservation?.payment_intent_id && (
              <Text style={styles.intentId}>Ref : {reservation.payment_intent_id}</Text>
            )}
          </View>
        )}

        {/* Bouton principal : retour accueil */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={goHome}
        >
          <Ionicons name="home" size={20} color={COLORS.white} />
          <Text style={styles.btnPrimaryText}>Retour à l'accueil</Text>
        </TouchableOpacity>

        {/* Bouton secondaire : voir mes réservations */}
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={goReservations}
        >
          <Ionicons name="calendar" size={20} color={COLORS.primary} />
          <Text style={styles.btnSecondaryText}>Voir mes réservations</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: 24, alignItems: 'center' },
  iconWrap: { marginTop: 60, marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 12 },
  subtitle: {
    fontSize: 15, color: COLORS.textSecondary, textAlign: 'center',
    lineHeight: 22, marginBottom: 20, maxWidth: 300,
  },
  paidBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#10B981', borderRadius: 999,
    paddingHorizontal: 18, paddingVertical: 9, marginBottom: 24,
  },
  paidBadgeTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
  card: {
    width: '100%', backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: COLORS.border,
    gap: 14, marginBottom: 32,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { fontSize: 15, color: COLORS.text, fontWeight: '500', flex: 1 },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, marginTop: 4 },
  totalText: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  intentId: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4, fontStyle: 'italic' },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 32, marginBottom: 12, width: '100%',
    justifyContent: 'center',
  },
  btnPrimaryText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  btnSecondary: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 32, width: '100%',
    justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.border,
  },
  btnSecondaryText: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
});
