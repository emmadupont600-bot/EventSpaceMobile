/**
 * BookingConfirmationScreen — CORRIGÉ
 * navigation.navigate('ClientRoot') au lieu de 'HomeTab'
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

export default function BookingConfirmationScreen({ navigation, route }) {
  const { reservation, venue } = route.params || {};

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
            {reservation?.total != null && (
              <View style={styles.row}>
                <Ionicons name="card" size={18} color={COLORS.primary} />
                <Text style={styles.rowText}>{reservation.total} €</Text>
              </View>
            )}
          </View>
        )}

        {/* Boutons */}
        <TouchableOpacity
          style={styles.btnPrimary}
          // FIX: naviguer vers ClientRoot (Stack) puis l'onglet HomeTab est actif par défaut
          onPress={() => navigation.navigate('ClientRoot')}
        >
          <Ionicons name="home" size={20} color={COLORS.white} />
          <Text style={styles.btnPrimaryText}>Retour à l'accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('ClientRoot', { screen: 'ReservTab' })}
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
    lineHeight: 22, marginBottom: 32, maxWidth: 300,
  },
  card: {
    width: '100%', backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: COLORS.border,
    gap: 14, marginBottom: 32,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
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
