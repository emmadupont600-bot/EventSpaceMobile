import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

export default function BookingConfirmationScreen({ route, navigation }) {
  const { reservation, venue } = route.params || {};
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 5 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!reservation) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <Text style={{ color: colors.text }}>Réservation introuvable.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Accueil')} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rows = [
    { icon: 'business-outline', label: 'Lieu', value: reservation.venueName },
    { icon: 'calendar-outline', label: 'Date', value: reservation.date },
    { icon: 'time-outline', label: 'Horaire', value: `${reservation.start} → ${reservation.end}` },
    { icon: 'people-outline', label: 'Invités', value: `${reservation.guests} personne${reservation.guests > 1 ? 's' : ''}` },
    { icon: 'ribbon-outline', label: "Type d'événement", value: reservation.eventType },
    { icon: 'card-outline', label: 'Total estimé', value: `${(reservation.total || 0).toLocaleString('fr-FR')} €` },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Cercle succès animé */}
        <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="checkmark" size={52} color="#fff" />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
          <Text style={styles.title}>Demande envoyée !</Text>
          <Text style={styles.subtitle}>
            L'annonceur va confirmer votre réservation sous 24h. Vous serez notifié dès que c'est accepté.
          </Text>

          {/* Récapitulatif */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Récapitulatif</Text>
            {rows.map((r, i) => (
              <View key={i} style={[styles.row, i < rows.length - 1 && styles.rowBorder]}>
                <View style={styles.iconWrap}>
                  <Ionicons name={r.icon} size={16} color={colors.primary} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>{r.label}</Text>
                  <Text style={styles.rowValue} numberOfLines={2}>{r.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Badge statut */}
          <View style={styles.statusBadge}>
            <Ionicons name="hourglass-outline" size={16} color="#D97706" />
            <Text style={styles.statusTxt}>En attente de confirmation</Text>
          </View>

          {/* Note ID */}
          <Text style={styles.refTxt}>Réf. #{String(reservation.id).slice(-6).toUpperCase()}</Text>

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
            onPress={() => navigation.navigate('Accueil')}
          >
            <Text style={styles.btnSecondaryTxt}>Retour à l'accueil</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg || '#F8FAFC' },
  scroll: { alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.xxl || 48 },

  successCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#10B981',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },

  title: { fontSize: typography.xl || 24, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { fontSize: typography.sm || 14, color: colors.muted || '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg, maxWidth: 300 },

  card: {
    width: '100%', backgroundColor: colors.white || '#fff',
    borderRadius: radius.lg || 16, padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow?.md,
  },
  cardTitle: { fontSize: typography.base, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border || '#E2E8F0' },
  iconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primaryLight || '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 12, color: colors.muted, marginBottom: 1 },
  rowValue: { fontSize: typography.sm, fontWeight: '600', color: colors.text },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FEF3C7', borderRadius: radius.full || 999,
    paddingHorizontal: spacing.md, paddingVertical: 8, marginBottom: spacing.xs,
  },
  statusTxt: { fontSize: 13, fontWeight: '600', color: '#D97706' },
  refTxt: { fontSize: 12, color: colors.muted, marginBottom: spacing.lg },

  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: radius.md || 12,
    paddingVertical: 15, width: '100%', marginBottom: spacing.sm,
  },
  btnPrimaryTxt: { fontSize: typography.base, fontWeight: '700', color: '#fff' },
  btnSecondary: {
    borderWidth: 1.5, borderColor: colors.border || '#E2E8F0',
    borderRadius: radius.md || 12, paddingVertical: 13, width: '100%', alignItems: 'center',
  },
  btnSecondaryTxt: { fontSize: typography.base, fontWeight: '600', color: colors.muted },
});
