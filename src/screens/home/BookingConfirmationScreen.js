import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

export default function BookingConfirmationScreen({ route, navigation }) {
  const { reservation, venue } = route.params;

  const rows = [
    { icon: 'location-outline', label: 'Lieu', value: reservation.venueName },
    { icon: 'calendar-outline', label: 'Date', value: reservation.date },
    { icon: 'time-outline', label: 'Horaire', value: `${reservation.start} → ${reservation.end}` },
    { icon: 'people-outline', label: 'Invités', value: `${reservation.guests} personne${reservation.guests > 1 ? 's' : ''}` },
    { icon: 'ribbon-outline', label: "Type d'événement", value: reservation.eventType },
    { icon: 'card-outline', label: 'Total estimé', value: `${reservation.total} €` },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Icône succès animée */}
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>

        <Text style={styles.title}>Demande envoyée !</Text>
        <Text style={styles.subtitle}>
          L'annonceur va confirmer votre réservation sous 24h. Vous serez notifié dès qu'elle est acceptée.
        </Text>

        {/* Récapitulatif */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Récapitulatif</Text>
          {rows.map((r, i) => (
            <View key={i} style={[styles.row, i < rows.length - 1 && styles.rowBorder]}>
              <View style={styles.iconWrap}>
                <Ionicons name={r.icon} size={18} color={colors.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={styles.rowValue}>{r.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Statut */}
        <View style={styles.statusBadge}>
          <Ionicons name="hourglass-outline" size={16} color={colors.warning || '#d97706'} />
          <Text style={styles.statusTxt}>En attente de confirmation</Text>
        </View>

        {/* Boutons */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('Reservations')}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.btnPrimaryTxt}>Voir mes réservations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={styles.btnSecondaryTxt}>Retour à l'accueil</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xl },
  successCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadow.md,
  },
  title: { fontSize: typography.h2, fontWeight: '800', color: colors.dark, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: typography.body, color: colors.mid, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl, maxWidth: 300 },
  card: {
    width: '100%', backgroundColor: colors.white,
    borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.lg, ...shadow.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { fontSize: typography.small, fontWeight: '700', color: colors.mid, marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: typography.tiny, color: colors.light, fontWeight: '600', marginBottom: 2 },
  rowValue: { fontSize: typography.body, color: colors.dark, fontWeight: '600' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: '#fef3c7', borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  statusTxt: { fontSize: typography.small, color: '#92400e', fontWeight: '700' },
  btnPrimary: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.primary,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
    ...shadow.sm,
  },
  btnPrimaryTxt: { color: '#fff', fontSize: typography.body, fontWeight: '700' },
  btnSecondary: {
    width: '100%', alignItems: 'center',
    borderRadius: radius.md, padding: spacing.md,
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border,
  },
  btnSecondaryTxt: { color: colors.mid, fontSize: typography.body, fontWeight: '600' },
});
