import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { Store } from '../../utils/store';
import { COMMISSION_RATE } from '../../constants/app';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
const EVENTS = [
  { icon: '🎂', label: 'Anniversaire' },
  { icon: '💍', label: 'Mariage' },
  { icon: '💼', label: 'Séminaire' },
  { icon: '🎉', label: 'Soirée' },
  { icon: '🎭', label: 'Conférence' },
  { icon: '📸', label: 'Shooting' },
  { icon: '🎓', label: 'Formation' },
  { icon: '✨', label: 'Autre' },
];

const STEPS = ['Date & Horaires', 'Détails', 'Récapitulatif'];

export default function BookingScreen({ route, navigation }) {
  const { venue } = route.params || {};
  const { user, addReservation } = useApp();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [date, setDate] = useState('');
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [guests, setGuests] = useState('');
  const [eventType, setEventType] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!venue) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.errorTxt}>Lieu introuvable.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnPrimary}>
          <Text style={styles.btnPrimaryTxt}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const endHours = start ? HOURS.filter(h => h > start) : HOURS;

  const calcTotal = () => {
    if (!start || !end) return venue.price || 0;
    const h1 = parseInt(start.split(':')[0], 10);
    const h2 = parseInt(end.split(':')[0], 10);
    const hours = Math.max(1, h2 - h1);
    return hours * (venue.price || 0);
  };

  const subtotal = calcTotal();
  const commission = Math.round(subtotal * COMMISSION_RATE);
  const totalClient = subtotal;

  const isStep0Valid = date.length >= 8 && start && end;
  const isStep1Valid = guests && Number(guests) > 0 && Number(guests) <= (venue.capacity || 999) && eventType;

  const goNext = () => {
    if (step === 0 && !isStep0Valid) {
      Alert.alert('Champs requis', 'Veuillez renseigner la date, l\'heure de début et de fin.');
      return;
    }
    if (step === 1 && !isStep1Valid) {
      Alert.alert('Champs requis', 'Veuillez renseigner le nombre d\'invités et le type d\'événement.');
      return;
    }
    setStep(s => s + 1);
  };

  // FIX : après création résa → redirige vers PaymentScreen (plus BookingConfirmation directement)
  const book = async () => {
    if (!user) { navigation.navigate('Login'); return; }
    setLoading(true);
    try {
      const available = await Store.isVenueAvailable(venue.id, date, start, end);
      if (!available) {
        Alert.alert('Indisponible', 'Ce créneau est déjà réservé ou la date est bloquée par l\'annonceur.');
        setLoading(false);
        return;
      }
      const reservation = await addReservation({
        venueId: venue.id,
        venueName: venue.name,
        venueLocation: venue.location || venue.city || '',
        userId: user.id,
        ownerId: venue.ownerId || venue.annonceur?.id || '',
        date,
        start,
        end,
        guests: Number(guests),
        eventType,
        notes,
        status: 'pending',
        payment_status: 'unpaid',
        total: totalClient,
        price: venue.price || 0,
      });
      // Redirection vers PaymentScreen avec résa + lieu
      navigation.replace('Payment', { reservation, venue });
    } catch (e) {
      Alert.alert('❌ Erreur', "La réservation n'a pas pu être envoyée. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => step > 0 ? setStep(s => s - 1) : navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={styles.backTxt}>{step > 0 ? 'Étape préc.' : 'Retour'}</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={styles.headerTitle}>Réserver</Text>
            <Text style={styles.headerSub} numberOfLines={1}>{venue.name}</Text>
          </View>
          <View style={{ width: 80 }} />
        </View>

        {/* Stepper */}
        <View style={styles.stepper}>
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, i === step && styles.stepCircleActive, i < step && styles.stepCircleDone]}>
                  {i < step
                    ? <Ionicons name="checkmark" size={14} color="#fff" />
                    : <Text style={[styles.stepNum, i === step && styles.stepNumActive]}>{i + 1}</Text>
                  }
                </View>
                <Text style={[styles.stepLabel, i === step && styles.stepLabelActive, i < step && styles.stepLabelDone]} numberOfLines={2}>{s}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={[styles.stepLine, i < step && styles.stepLineDone]} />}
            </React.Fragment>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ÉTAPE 0 */}
          {step === 0 && (
            <View>
              <Text style={styles.stepTitle}>📅 Date & Horaires</Text>
              <Text style={styles.label}>Date de l'événement *</Text>
              <TextInput
                style={styles.input} value={date} onChangeText={setDate}
                placeholder="2026-06-15" placeholderTextColor={colors.light}
                keyboardType="numbers-and-punctuation"
              />
              {date.length > 0 && date.length < 8 && <Text style={styles.inputHint}>Format : AAAA-MM-JJ</Text>}
              <Text style={styles.label}>Heure de début *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {HOURS.map(h => (
                  <TouchableOpacity key={h} style={[styles.chip, start === h && styles.chipActive]}
                    onPress={() => { setStart(h); if (end && end <= h) setEnd(null); }}>
                    <Text style={[styles.chipTxt, start === h && styles.chipTxtActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.label}>Heure de fin *</Text>
              {!start && <Text style={styles.inputHint}>Choisissez d'abord l'heure de début</Text>}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {endHours.map(h => (
                  <TouchableOpacity key={h} style={[styles.chip, end === h && styles.chipActive]}
                    onPress={() => setEnd(h)} disabled={!start}>
                    <Text style={[styles.chipTxt, end === h && styles.chipTxtActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {start && end && (
                <View style={styles.durationBadge}>
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                  <Text style={styles.durationTxt}>
                    {start} → {end} · {parseInt(end.split(':')[0], 10) - parseInt(start.split(':')[0], 10)}h · {subtotal.toLocaleString('fr-FR')} €
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ÉTAPE 1 */}
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>👥 Détails de l'événement</Text>
              <Text style={styles.label}>Nombre d'invités * (max {venue.capacity || 500})</Text>
              <TextInput
                style={styles.input} value={guests}
                onChangeText={v => setGuests(v.replace(/[^0-9]/g, ''))}
                placeholder={`1 à ${venue.capacity || 500}`} placeholderTextColor={colors.light}
                keyboardType="number-pad"
              />
              {guests && Number(guests) > (venue.capacity || 999) && (
                <Text style={[styles.inputHint, { color: '#EF4444' }]}>⚠️ Capacité max : {venue.capacity} personnes</Text>
              )}
              <Text style={styles.label}>Type d'événement *</Text>
              <View style={styles.eventGrid}>
                {EVENTS.map(e => (
                  <TouchableOpacity key={e.label}
                    style={[styles.eventChip, eventType === e.label && styles.eventChipActive]}
                    onPress={() => setEventType(e.label)}>
                    <Text style={styles.eventChipIcon}>{e.icon}</Text>
                    <Text style={[styles.eventChipTxt, eventType === e.label && styles.eventChipTxtActive]}>{e.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Message pour l'hôte (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textarea]} value={notes} onChangeText={setNotes}
                placeholder="Informations utiles, demandes spéciales..."
                placeholderTextColor={colors.light} multiline numberOfLines={4} textAlignVertical="top"
              />
            </View>
          )}

          {/* ÉTAPE 2 — Récapitulatif */}
          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>📝 Récapitulatif</Text>
              <View style={styles.recapCard}>
                <Text style={styles.recapVenueName}>{venue.name}</Text>
                <Text style={styles.recapVenueLocation}>📍 {venue.location || venue.city || ''}</Text>
                <View style={styles.divider} />
                {[
                  { icon: 'calendar-outline', label: 'Date', value: date },
                  { icon: 'time-outline', label: 'Horaire', value: `${start} → ${end}` },
                  { icon: 'people-outline', label: 'Invités', value: `${guests} personne${Number(guests) > 1 ? 's' : ''}` },
                  { icon: 'ribbon-outline', label: 'Type', value: eventType },
                ].map((row, i) => (
                  <View key={i} style={styles.recapRow}>
                    <View style={styles.recapIconWrap}>
                      <Ionicons name={row.icon} size={16} color={colors.primary} />
                    </View>
                    <Text style={styles.recapLabel}>{row.label}</Text>
                    <Text style={styles.recapValue}>{row.value}</Text>
                  </View>
                ))}
                {notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>Message :</Text>
                    <Text style={styles.notesTxt}>{notes}</Text>
                  </View>
                ) : null}
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total à payer</Text>
                  <Text style={styles.totalValue}>{totalClient.toLocaleString('fr-FR')} €</Text>
                </View>
                <Text style={styles.priceSub}>
                  {venue.price} €/h · {parseInt((end || '0').split(':')[0], 10) - parseInt((start || '0').split(':')[0], 10)}h
                </Text>
                <View style={styles.commissionInfo}>
                  <Ionicons name="information-circle-outline" size={14} color="#6C63FF" />
                  <Text style={styles.commissionInfoTxt}>
                    Commission plateforme de {Math.round(COMMISSION_RATE * 100)}% ({commission.toLocaleString('fr-FR')} €) déduite du versement à l'annonceur.
                  </Text>
                </View>
              </View>
              <View style={styles.infoBox}>
                <Ionicons name="card-outline" size={18} color="#3B82F6" />
                <Text style={styles.infoTxt}>L'étape suivante vous permettra de payer en toute sécurité via Stripe.</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bouton bas */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
          {step < 2 ? (
            <TouchableOpacity
              style={[styles.btnPrimary, ((!isStep0Valid && step === 0) || (!isStep1Valid && step === 1)) ? styles.btnDisabled : {}]}
              onPress={goNext}
            >
              <Text style={styles.btnPrimaryTxt}>Continuer</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={book} disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <><Ionicons name="card-outline" size={20} color="#fff" /><Text style={styles.btnPrimaryTxt}>Continuer vers le paiement</Text></>
              }
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg || '#F8FAFC' },
  errorTxt: { fontSize: 16, color: colors.dark, marginBottom: spacing.md },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.white || '#fff',
    borderBottomWidth: 1, borderBottomColor: colors.border || '#E2E8F0',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', width: 80 },
  backTxt: { fontSize: 13, color: colors.primary, marginLeft: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.dark },
  headerSub: { fontSize: 12, color: colors.mid, marginTop: 1 },
  stepper: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white || '#fff',
    borderBottomWidth: 1, borderBottomColor: colors.border || '#E2E8F0',
  },
  stepItem: { alignItems: 'center', width: 72 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.border || '#E2E8F0',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  stepCircleActive: { backgroundColor: colors.primary },
  stepCircleDone: { backgroundColor: '#10B981' },
  stepNum: { fontSize: 12, fontWeight: '700', color: colors.mid },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 10, color: colors.mid, textAlign: 'center', lineHeight: 13 },
  stepLabelActive: { color: colors.primary, fontWeight: '600' },
  stepLabelDone: { color: '#10B981' },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border || '#E2E8F0', marginTop: 13, marginHorizontal: 2 },
  stepLineDone: { backgroundColor: '#10B981' },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  stepTitle: { fontSize: 18, fontWeight: '700', color: colors.dark, marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: colors.dark, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: {
    borderWidth: 1.5, borderColor: colors.border || '#E2E8F0',
    borderRadius: radius.md || 10, padding: spacing.sm,
    fontSize: 16, color: colors.dark, backgroundColor: colors.white || '#fff',
  },
  textarea: { height: 100, paddingTop: spacing.sm },
  inputHint: { fontSize: 12, color: colors.mid, marginTop: 4 },
  chipScroll: { marginVertical: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm, paddingVertical: 8,
    borderRadius: radius.full || 999, borderWidth: 1.5, borderColor: colors.border || '#E2E8F0',
    marginRight: spacing.xs, backgroundColor: colors.white || '#fff',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { fontSize: 13, fontWeight: '500', color: colors.dark },
  chipTxtActive: { color: '#fff' },
  durationBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primaryLight || '#EEF2FF',
    borderRadius: radius.md || 10, padding: spacing.sm, marginTop: spacing.sm,
  },
  durationTxt: { fontSize: 13, fontWeight: '600', color: colors.primary },
  eventGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: spacing.xs },
  eventChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full || 999,
    borderWidth: 1.5, borderColor: colors.border || '#E2E8F0', backgroundColor: colors.white || '#fff',
  },
  eventChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  eventChipIcon: { fontSize: 14 },
  eventChipTxt: { fontSize: 13, fontWeight: '500', color: colors.dark },
  eventChipTxtActive: { color: '#fff' },
  recapCard: {
    backgroundColor: colors.white || '#fff', borderRadius: radius.lg || 14,
    padding: spacing.md, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border || '#E2E8F0',
  },
  recapVenueName: { fontSize: 18, fontWeight: '700', color: colors.dark, marginBottom: 2 },
  recapVenueLocation: { fontSize: 13, color: colors.mid, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border || '#E2E8F0', marginVertical: spacing.sm },
  recapRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  recapIconWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primaryLight || '#EEF2FF',
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm,
  },
  recapLabel: { fontSize: 13, color: colors.mid, flex: 1 },
  recapValue: { fontSize: 13, fontWeight: '600', color: colors.dark },
  notesBox: { backgroundColor: colors.bg || '#F8FAFC', borderRadius: radius.sm || 6, padding: spacing.sm, marginTop: spacing.xs },
  notesLabel: { fontSize: 12, fontWeight: '600', color: colors.mid, marginBottom: 2 },
  notesTxt: { fontSize: 13, color: colors.dark, fontStyle: 'italic' },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.dark },
  totalValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  priceSub: { fontSize: 12, color: colors.mid, textAlign: 'right', marginTop: 2 },
  commissionInfo: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: '#EEF2FF', borderRadius: radius.sm || 6,
    padding: 8, marginTop: spacing.sm,
  },
  commissionInfoTxt: { flex: 1, fontSize: 11, color: '#4338CA', lineHeight: 16 },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#EFF6FF', borderRadius: radius.md || 10,
    padding: spacing.sm, marginTop: spacing.sm,
  },
  infoTxt: { flex: 1, fontSize: 13, color: '#1D4ED8', lineHeight: 18 },
  footer: {
    backgroundColor: colors.white || '#fff',
    borderTopWidth: 1, borderTopColor: colors.border || '#E2E8F0', padding: spacing.md,
  },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: radius.md || 12, paddingVertical: 15,
  },
  btnPrimaryTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
  btnDisabled: { opacity: 0.5 },
});
