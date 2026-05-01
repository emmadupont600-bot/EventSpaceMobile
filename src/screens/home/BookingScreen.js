import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Store } from '../../utils/store';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
const EVENTS = ['🎂 Anniversaire','💍 Mariage','💼 Séminaire','🎉 Soirée privée','🎭 Conférence','📸 Shooting','Autre'];

const STEPS = [
  { num: 1, title: '📅 Date & Horaires' },
  { num: 2, title: '👥 Détails' },
  { num: 3, title: '📝 Récapitulatif' },
];

export default function BookingScreen({ route, navigation }) {
  const { venue, user } = route.params;
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [guests, setGuests] = useState('');
  const [eventType, setEventType] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const hours = start ? HOURS.filter(h => h > start) : HOURS;

  const calcTotal = () => {
    if (!start || !end) return 0;
    const [h1] = start.split(':').map(Number);
    const [h2] = end.split(':').map(Number);
    return (h2 - h1) * (venue.price || 0);
  };

  const canNext1 = date && start && end;
  const canNext2 = guests && eventType;

  const book = async () => {
    setLoading(true);
    try {
      const reservation = await Store.addReservation({
        venueId: venue.id, venueName: venue.name, userId: user.id,
        ownerId: venue.ownerId, date, start, end,
        guests: Number(guests), eventType, notes, status: 'pending', total: calcTotal(),
      });
      navigation.replace('BookingConfirmation', { reservation, venue });
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
          <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backEmoji}>←</Text>
            <Text style={styles.backTxt}>Retour</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Réserver</Text>
            <Text style={styles.headerSub} numberOfLines={1}>{venue.name}</Text>
          </View>
          <View style={{ width: 72 }} />
        </View>

        {/* Stepper */}
        <View style={styles.stepper}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <View style={styles.stepItem}>
                <View style={[
                  styles.stepCircle,
                  step === s.num && styles.stepCircleActive,
                  step > s.num && styles.stepCircleDone,
                ]}>
                  {step > s.num
                    ? <Text style={styles.stepDoneIcon}>✓</Text>
                    : <Text style={[styles.stepNum, step === s.num && styles.stepNumActive]}>{s.num}</Text>
                  }
                </View>
                <Text style={[
                  styles.stepLabel,
                  step === s.num && styles.stepLabelActive,
                  step > s.num && styles.stepLabelDone,
                ]} numberOfLines={1}>
                  {s.title.replace(/^\S+\s/, '')}
                </Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.stepLine, step > s.num && styles.stepLineDone]} />
              )}
            </React.Fragment>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Étape 1 : Date & Horaires */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{STEPS[0].title}</Text>

              <Text style={styles.label}>Date de l'événement</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="2026-06-15"
                placeholderTextColor={colors.light}
              />

              <Text style={styles.label}>Heure de début</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                {HOURS.map(h => (
                  <TouchableOpacity key={h} style={[styles.chip, start === h && styles.chipActive]} onPress={() => { setStart(h); setEnd(null); }}>
                    <Text style={[styles.chipTxt, start === h && styles.chipTxtActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Heure de fin</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                {hours.map(h => (
                  <TouchableOpacity key={h} style={[styles.chip, end === h && styles.chipActive]} onPress={() => setEnd(h)}>
                    <Text style={[styles.chipTxt, end === h && styles.chipTxtActive]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {start && end && (
                <View style={styles.miniRecap}>
                  <Text style={styles.miniRecapText}>⏰ {start} → {end} • {calcTotal()} €</Text>
                </View>
              )}
            </View>
          )}

          {/* Étape 2 : Détails */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{STEPS[1].title}</Text>

              <Text style={styles.label}>Nombre d'invités</Text>
              <TextInput
                style={styles.input}
                value={guests}
                onChangeText={setGuests}
                placeholder={`Max. ${venue.capacity}`}
                placeholderTextColor={colors.light}
                keyboardType="number-pad"
              />

              <Text style={styles.label}>Type d'événement</Text>
              <View style={styles.eventGrid}>
                {EVENTS.map(e => (
                  <TouchableOpacity key={e}
                    style={[styles.eventChip, eventType === e && styles.chipActive]}
                    onPress={() => setEventType(e)}>
                    <Text style={[styles.chipTxt, eventType === e && styles.chipTxtActive]}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Notes / demandes spéciales (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Décoration, traiteur, besoins particuliers..."
                placeholderTextColor={colors.light}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Étape 3 : Récap */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{STEPS[2].title}</Text>

              <View style={styles.recapCard}>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLbl}>🏛️ Lieu</Text>
                  <Text style={styles.recapVal}>{venue.name}</Text>
                </View>
                <View style={styles.recapDivider} />
                <View style={styles.recapRow}>
                  <Text style={styles.recapLbl}>📅 Date</Text>
                  <Text style={styles.recapVal}>{date}</Text>
                </View>
                <View style={styles.recapDivider} />
                <View style={styles.recapRow}>
                  <Text style={styles.recapLbl}>⏰ Horaires</Text>
                  <Text style={styles.recapVal}>{start} → {end}</Text>
                </View>
                <View style={styles.recapDivider} />
                <View style={styles.recapRow}>
                  <Text style={styles.recapLbl}>👥 Invités</Text>
                  <Text style={styles.recapVal}>{guests} personnes</Text>
                </View>
                <View style={styles.recapDivider} />
                <View style={styles.recapRow}>
                  <Text style={styles.recapLbl}>🎉 Événement</Text>
                  <Text style={styles.recapVal}>{eventType}</Text>
                </View>
                {notes ? (
                  <>
                    <View style={styles.recapDivider} />
                    <View style={styles.recapRow}>
                      <Text style={styles.recapLbl}>📝 Notes</Text>
                      <Text style={[styles.recapVal, { flex: 1 }]}>{notes}</Text>
                    </View>
                  </>
                ) : null}
              </View>

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total estimé</Text>
                <Text style={styles.totalPrice}>{calcTotal()} €</Text>
                <Text style={styles.totalNote}>{venue.price} €/h × {(() => { const [h1] = start.split(':').map(Number); const [h2] = end.split(':').map(Number); return h2 - h1; })()} h</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoTxt}>Votre demande sera envoyée à l'annonceur. Vous serez notifié dès qu'elle sera confirmée.</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
          {step < 3 ? (
            <TouchableOpacity
              style={[styles.nextBtn, !(step === 1 ? canNext1 : canNext2) && styles.nextBtnDisabled]}
              onPress={() => setStep(s => s + 1)}
              disabled={step === 1 ? !canNext1 : !canNext2}
            >
              <Text style={styles.nextBtnTxt}>Étape suivante →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
              onPress={book}
              disabled={loading}
            >
              <Text style={styles.nextBtnTxt}>{loading ? '⏳ Envoi...' : '🚀 Envoyer la demande'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 72 },
  backEmoji: { fontSize: 16 },
  backTxt: { fontSize: typography.small, fontWeight: '600', color: colors.primary },
  headerTitle: { fontSize: typography.body, fontWeight: '800', color: colors.dark },
  headerSub: { fontSize: typography.tiny, color: colors.mid, maxWidth: 160 },
  stepper: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.borderLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.border,
  },
  stepCircleActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  stepCircleDone: { backgroundColor: colors.success || '#10B981', borderColor: colors.success || '#10B981' },
  stepNum: { fontSize: 12, fontWeight: '700', color: colors.mid },
  stepNumActive: { color: colors.primary },
  stepDoneIcon: { fontSize: 12, color: '#fff', fontWeight: '900' },
  stepLabel: { fontSize: 10, color: colors.mid, fontWeight: '500', textAlign: 'center' },
  stepLabelActive: { color: colors.primary, fontWeight: '700' },
  stepLabelDone: { color: colors.success || '#10B981' },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border, marginBottom: 14, marginHorizontal: 4 },
  stepLineDone: { backgroundColor: colors.success || '#10B981' },
  content: { padding: spacing.lg, paddingBottom: 20 },
  stepContent: { gap: spacing.sm },
  stepTitle: { fontSize: typography.h2, fontWeight: '900', color: colors.dark, marginBottom: spacing.sm },
  label: { fontSize: typography.small, fontWeight: '700', color: colors.mid, marginBottom: 6, marginTop: spacing.xs },
  input: {
    backgroundColor: colors.white, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 13,
    fontSize: typography.body, color: colors.dark,
  },
  textarea: { height: 100, paddingTop: spacing.md },
  chip: {
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7, marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipTxt: { fontSize: typography.small, fontWeight: '600', color: colors.mid },
  chipTxtActive: { color: colors.primary, fontWeight: '700' },
  eventGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  eventChip: {
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8,
  },
  miniRecap: {
    backgroundColor: colors.primaryLight, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center',
  },
  miniRecapText: { fontSize: typography.body, fontWeight: '700', color: colors.primary },
  recapCard: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', marginBottom: spacing.md,
  },
  recapRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  recapLbl: { fontSize: typography.small, color: colors.mid, fontWeight: '600' },
  recapVal: { fontSize: typography.small, fontWeight: '700', color: colors.dark, textAlign: 'right', maxWidth: '60%' },
  recapDivider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: spacing.lg },
  totalBox: {
    backgroundColor: colors.primaryLight, borderRadius: radius.xl,
    padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md,
  },
  totalLabel: { fontSize: typography.small, color: colors.mid, fontWeight: '600' },
  totalPrice: { fontSize: 36, fontWeight: '900', color: colors.primary },
  totalNote: { fontSize: typography.tiny, color: colors.mid, marginTop: 4 },
  infoBox: {
    flexDirection: 'row', backgroundColor: '#FEF3C7', borderRadius: radius.md,
    padding: spacing.md, gap: spacing.sm, alignItems: 'flex-start',
  },
  infoIcon: { fontSize: 16 },
  infoTxt: { fontSize: typography.tiny, color: '#92400E', flex: 1, lineHeight: 18 },
  footer: {
    backgroundColor: colors.white, padding: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  nextBtn: {
    backgroundColor: colors.primary, borderRadius: radius.xl,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnTxt: { color: '#fff', fontWeight: '800', fontSize: typography.body },
});
