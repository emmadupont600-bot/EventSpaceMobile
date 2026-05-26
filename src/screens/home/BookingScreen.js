import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/Toast';
import { COMMISSION_RATE } from '../../utils/stripeService';
import { colors, spacing, radius, shadow } from '../../theme/colors';

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

const STEPS = ['Date', 'Détails', 'Récap'];

const formatDate = (d) => {
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const prettyDate = (d) => {
  if (!d) return '';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export default function BookingScreen({ route, navigation }) {
  const { venue } = route.params || {};
  const { user, addReservation } = useApp();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [date, setDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
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

  const subtotal = useMemo(() => {
    if (!start || !end) return venue.price || 0;
    const h1 = parseInt(start.split(':')[0], 10);
    const h2 = parseInt(end.split(':')[0], 10);
    const hours = Math.max(1, h2 - h1);
    return hours * (venue.price || 0);
  }, [start, end, venue.price]);

  const commission = Math.round(subtotal * COMMISSION_RATE);
  const totalClient = subtotal;

  const isStep0Valid = !!date && !!start && !!end;
  const isStep1Valid = guests && Number(guests) > 0 && Number(guests) <= (venue.capacity || 999) && eventType;

  const goNext = () => {
    if (step === 0 && !isStep0Valid) { toast.error("Choisissez la date et les horaires"); return; }
    if (step === 1 && !isStep1Valid) { toast.error("Renseignez le nombre d'invités et le type d'événement"); return; }
    setStep(s => s + 1);
  };

  const handleDateChange = (event, selected) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setDate(selected);
  };

  const book = async () => {
    if (!user) { navigation.navigate('Login'); return; }
    setLoading(true);
    try {
      const reservation = await addReservation({
        venueId: venue.id,
        venueName: venue.name,
        venueLocation: venue.location || venue.city || '',
        userId: user.id,
        ownerId: venue.ownerId || venue.annonceur?.id || '',
        date: formatDate(date),
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
      navigation.replace('Payment', { reservation, venue });
    } catch (e) {
      toast.error(e.message || "La réservation n'a pas pu être envoyée");
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
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={styles.headerTitle}>Réserver</Text>
            <Text style={styles.headerSub} numberOfLines={1}>{venue.name}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Stepper */}
        <View style={styles.stepper}>
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <View style={styles.stepItem}>
                <View style={[
                  styles.stepCircle,
                  i === step && styles.stepCircleActive,
                  i < step && styles.stepCircleDone,
                ]}>
                  {i < step
                    ? <Ionicons name="checkmark" size={16} color="#fff" />
                    : <Text style={[styles.stepNum, i === step && styles.stepNumActive]}>{i + 1}</Text>
                  }
                </View>
                <Text style={[
                  styles.stepLabel,
                  i === step && styles.stepLabelActive,
                  i < step && styles.stepLabelDone,
                ]}>{s}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={[styles.stepLine, i < step && styles.stepLineDone]} />}
            </React.Fragment>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ÉTAPE 0 */}
          {step === 0 && (
            <View>
              <Text style={styles.stepTitle}>Quand souhaitez-vous l'événement ?</Text>

              <Text style={styles.label}>📅 Date</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)} activeOpacity={0.85}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={[styles.dateBtnTxt, !date && { color: colors.textLight }]}>
                  {date ? prettyDate(date) : 'Choisir une date'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={date || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}

              <Text style={styles.label}>🕐 Heure de début</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {HOURS.map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.chip, start === h && styles.chipActive]}
                    onPress={() => { setStart(h); if (end && end <= h) setEnd(null); }}
                  >
                    <Text style={[styles.chipTxt, start === h && styles.chipTxtActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>🕑 Heure de fin</Text>
              {!start && <Text style={styles.inputHint}>Choisissez d'abord l'heure de début</Text>}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {endHours.map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.chip, end === h && styles.chipActive]}
                    onPress={() => setEnd(h)}
                    disabled={!start}
                  >
                    <Text style={[styles.chipTxt, end === h && styles.chipTxtActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {start && end && (
                <View style={styles.durationBadge}>
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                  <Text style={styles.durationTxt}>
                    {parseInt(end.split(':')[0], 10) - parseInt(start.split(':')[0], 10)}h · {subtotal.toLocaleString('fr-FR')} €
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ÉTAPE 1 */}
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>Détails de l'événement</Text>

              <Text style={styles.label}>👥 Nombre d'invités (max {venue.capacity || 500})</Text>
              <TextInput
                style={styles.input}
                value={guests}
                onChangeText={v => setGuests(v.replace(/[^0-9]/g, ''))}
                placeholder={`1 à ${venue.capacity || 500}`}
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
              />
              {guests && Number(guests) > (venue.capacity || 999) && (
                <Text style={styles.errorHint}>⚠️ Capacité max : {venue.capacity} personnes</Text>
              )}

              <Text style={styles.label}>🎉 Type d'événement</Text>
              <View style={styles.eventGrid}>
                {EVENTS.map(e => (
                  <TouchableOpacity
                    key={e.label}
                    style={[styles.eventChip, eventType === e.label && styles.eventChipActive]}
                    onPress={() => setEventType(e.label)}
                  >
                    <Text style={styles.eventChipIcon}>{e.icon}</Text>
                    <Text style={[styles.eventChipTxt, eventType === e.label && styles.eventChipTxtActive]}>{e.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>📝 Message à l'hôte (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Informations utiles, demandes spéciales..."
                placeholderTextColor={colors.textLight}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}

          {/* ÉTAPE 2 — Récap */}
          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>Tout est prêt ✨</Text>

              <View style={styles.recapCard}>
                <Text style={styles.recapVenueName}>{venue.name}</Text>
                <Text style={styles.recapVenueLocation}>📍 {venue.location || venue.city || ''}</Text>
                <View style={styles.divider} />
                {[
                  { icon: 'calendar-outline', label: 'Date', value: prettyDate(date) },
                  { icon: 'time-outline', label: 'Horaire', value: `${start} → ${end}` },
                  { icon: 'people-outline', label: 'Invités', value: `${guests} personne${Number(guests) > 1 ? 's' : ''}` },
                  { icon: 'ribbon-outline', label: 'Type', value: eventType },
                ].map((row, i) => (
                  <View key={i} style={styles.recapRow}>
                    <View style={styles.recapIconWrap}>
                      <Ionicons name={row.icon} size={16} color={colors.primary} />
                    </View>
                    <Text style={styles.recapLabel}>{row.label}</Text>
                    <Text style={styles.recapValue} numberOfLines={1}>{row.value}</Text>
                  </View>
                ))}
                {notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>Message :</Text>
                    <Text style={styles.notesTxt}>"{notes}"</Text>
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
                  <Ionicons name="information-circle-outline" size={14} color={colors.primary} />
                  <Text style={styles.commissionInfoTxt}>
                    Commission EventSpace de {Math.round(COMMISSION_RATE * 100)}% ({commission.toLocaleString('fr-FR')} €) déduite du versement à l'annonceur.
                  </Text>
                </View>
              </View>
              <View style={styles.infoBox}>
                <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
                <Text style={styles.infoTxt}>
                  Paiement sécurisé via Stripe. L'argent n'est débité qu'après acceptation par l'annonceur.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: (insets.bottom || 0) + spacing.sm }]}>
          {step < 2 ? (
            <TouchableOpacity
              style={[styles.btnPrimary, ((!isStep0Valid && step === 0) || (!isStep1Valid && step === 1)) && styles.btnDisabled]}
              onPress={goNext}
              activeOpacity={0.9}
            >
              <Text style={styles.btnPrimaryTxt}>Continuer</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={book}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Ionicons name="card-outline" size={20} color="#fff" />
                    <Text style={styles.btnPrimaryTxt}>Continuer vers le paiement</Text>
                  </>
              }
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  errorTxt: { fontSize: 16, color: colors.text, marginBottom: spacing.md },

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
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },

  stepper: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  stepItem: { alignItems: 'center', width: 60 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  stepCircleActive: { backgroundColor: colors.primary },
  stepCircleDone: { backgroundColor: colors.success },
  stepNum: { fontSize: 13, fontWeight: '800', color: colors.textSecondary },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  stepLabelActive: { color: colors.primary, fontWeight: '800' },
  stepLabelDone: { color: colors.success },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.borderLight, marginTop: 15, marginHorizontal: 4 },
  stepLineDone: { backgroundColor: colors.success },

  content: { padding: spacing.lg, paddingBottom: 40 },
  stepTitle: { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: spacing.lg, letterSpacing: -0.3 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8, marginTop: spacing.md },

  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md,
  },
  dateBtnTxt: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },

  input: {
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md,
    fontSize: 15, color: colors.text, backgroundColor: colors.surface,
  },
  textarea: { minHeight: 100, paddingTop: spacing.md, textAlignVertical: 'top' },
  inputHint: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  errorHint: { fontSize: 12, color: colors.error, marginTop: 4, fontWeight: '600' },

  chipScroll: { marginVertical: 4, marginBottom: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border,
    marginRight: 8, backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { fontSize: 13, fontWeight: '700', color: colors.text },
  chipTxtActive: { color: '#fff' },

  durationBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md,
  },
  durationTxt: { fontSize: 14, fontWeight: '800', color: colors.primary },

  eventGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  eventChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 9,
    borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  eventChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  eventChipIcon: { fontSize: 14 },
  eventChipTxt: { fontSize: 13, fontWeight: '600', color: colors.text },
  eventChipTxtActive: { color: '#fff' },

  recapCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  recapVenueName: { fontSize: 18, fontWeight: '900', color: colors.text, letterSpacing: -0.2 },
  recapVenueLocation: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.md },
  recapRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  recapIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm,
  },
  recapLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  recapValue: { fontSize: 13, fontWeight: '700', color: colors.text, maxWidth: 200 },
  notesBox: { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  notesLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 4 },
  notesTxt: { fontSize: 13, color: colors.text, fontStyle: 'italic' },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 26, fontWeight: '900', color: colors.primary, letterSpacing: -0.5 },
  priceSub: { fontSize: 12, color: colors.textSecondary, textAlign: 'right', marginTop: 2 },
  commissionInfo: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md, padding: 10, marginTop: spacing.md,
  },
  commissionInfoTxt: { flex: 1, fontSize: 11, color: colors.primaryDark, lineHeight: 16 },

  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm,
  },
  infoTxt: { flex: 1, fontSize: 13, color: '#1D4ED8', lineHeight: 18 },

  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
    padding: spacing.md,
  },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 16,
    ...shadow.primary,
  },
  btnPrimaryTxt: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
  btnDisabled: { opacity: 0.5, shadowOpacity: 0 },
});
