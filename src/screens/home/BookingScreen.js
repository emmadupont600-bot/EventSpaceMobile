/**
 * BookingScreen — réservation "Luxury Minimal" 2026.
 * Stepper 3 étapes avec ligne de progression animée, sélecteur d'heures
 * en grille de pills avec haptique, date masquée JJ/MM/AAAA avec
 * validation inline (pas d'Alert), grille type d'événement 4 colonnes
 * (Ionicons), récapitulatif elevated avec décomposition du prix,
 * transitions d'étapes en Animated.spring (translateX).
 */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Store } from '../../utils/store';
import { COMMISSION_RATE } from '../../constants/app';
import { spacing, radius, shadow } from '../../theme/tokens';
import { hapticSelection, hapticError } from '../../utils/haptics';

const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
const EVENTS = [
  { icon: 'gift-outline',      iconActive: 'gift',      label: 'Anniversaire' },
  { icon: 'diamond-outline',   iconActive: 'diamond',   label: 'Mariage' },
  { icon: 'briefcase-outline', iconActive: 'briefcase', label: 'Séminaire' },
  { icon: 'wine-outline',      iconActive: 'wine',      label: 'Soirée' },
  { icon: 'mic-outline',       iconActive: 'mic',       label: 'Conférence' },
  { icon: 'camera-outline',    iconActive: 'camera',    label: 'Shooting' },
  { icon: 'school-outline',    iconActive: 'school',    label: 'Formation' },
  { icon: 'sparkles-outline',  iconActive: 'sparkles',  label: 'Autre' },
];

const STEPS = ['Date & Horaires', 'Détails', 'Récapitulatif'];
const SCREEN_W = Dimensions.get('window').width;

/** Masque progressif JJ/MM/AAAA */
function maskDate(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  let out = digits;
  if (digits.length > 4) out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  else if (digits.length > 2) out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return out;
}

/** "JJ/MM/AAAA" → { iso: "AAAA-MM-JJ", error } */
function parseFrDate(masked) {
  if (masked.length < 10) return { iso: null, error: null };
  const [dd, mm, yyyy] = masked.split('/').map(Number);
  const d = new Date(yyyy, (mm || 1) - 1, dd);
  const valid = d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
  if (!valid) return { iso: null, error: 'Date invalide' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d < today) return { iso: null, error: 'La date doit être dans le futur' };
  const iso = `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  return { iso, error: null };
}

export default function BookingScreen({ route, navigation }) {
  const { venue } = route.params || {};
  const { user, addReservation } = useApp();
  const { semantic, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => themedStyles(semantic, isDark), [semantic, isDark]);

  const [step, setStep] = useState(0);
  const [dateInput, setDateInput] = useState('');
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [guests, setGuests] = useState('');
  const [eventType, setEventType] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepError, setStepError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const progress = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: step, useNativeDriver: false, damping: 18, stiffness: 160,
    }).start();
    slide.setValue(step > 0 ? SCREEN_W * 0.18 : 0);
    Animated.spring(slide, {
      toValue: 0, useNativeDriver: true, damping: 20, stiffness: 220,
    }).start();
    setStepError('');
  }, [step]);

  if (!venue) {
    return (
      <View style={[s.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={s.errorTxt}>Lieu introuvable.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.btnPrimary}>
          <Text style={s.btnPrimaryTxt}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { iso: dateIso, error: dateError } = parseFrDate(dateInput);
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
  const netOwner = subtotal - commission;
  const totalClient = subtotal;
  const durationH = start && end
    ? parseInt(end.split(':')[0], 10) - parseInt(start.split(':')[0], 10)
    : 0;

  const guestsNum = Number(guests);
  const guestsTooMany = Boolean(guests) && guestsNum > (venue.capacity || 999);
  const isStep0Valid = Boolean(dateIso && start && end);
  const isStep1Valid = Boolean(guests && guestsNum > 0 && !guestsTooMany && eventType);

  const goNext = () => {
    if (step === 0 && !isStep0Valid) {
      setStepError("Renseignez la date, l'heure de début et de fin.");
      hapticError();
      return;
    }
    if (step === 1 && !isStep1Valid) {
      setStepError("Renseignez le nombre d'invités et le type d'événement.");
      hapticError();
      return;
    }
    hapticSelection();
    setStep(v => v + 1);
  };

  const book = async () => {
    if (!user) { navigation.navigate('Login'); return; }
    setLoading(true);
    setSubmitError('');
    try {
      const available = await Store.isVenueAvailable(venue.id, dateIso, start, end);
      if (!available) {
        setSubmitError("Ce créneau est déjà réservé ou la date est bloquée par l'annonceur.");
        hapticError();
        setLoading(false);
        return;
      }
      const reservation = await addReservation({
        venueId: venue.id,
        venueName: venue.name,
        venueLocation: venue.location || venue.city || '',
        userId: user.id,
        ownerId: venue.ownerId || venue.annonceur?.id || '',
        date: dateIso,
        start,
        end,
        guests: guestsNum,
        eventType,
        notes,
        status: 'pending',
        payment_status: 'unpaid',
        total: totalClient,
        price: venue.price || 0,
      });
      navigation.replace('Payment', { reservation, venue });
    } catch (e) {
      setSubmitError("La réservation n'a pas pu être envoyée. Veuillez réessayer.");
      hapticError();
    } finally {
      setLoading(false);
    }
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, STEPS.length - 1],
    outputRange: ['0%', '100%'],
  });

  const selectHour = (setter, value) => {
    hapticSelection();
    setter(value);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.container, { paddingTop: insets.top }]}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => step > 0 ? setStep(v => v - 1) : navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color={semantic.text} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={s.headerTitle}>Réserver</Text>
            <Text style={s.headerSub} numberOfLines={1}>{venue.name}</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* Stepper avec ligne de progression animée */}
        <View style={s.stepper}>
          <View style={s.progressTrack}>
            <Animated.View style={[s.progressFill, { width: progressWidth }]} />
          </View>
          <View style={styles.stepLabels}>
            {STEPS.map((label, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={[s.stepCircle, i === step && s.stepCircleActive, i < step && s.stepCircleDone]}>
                  {i < step
                    ? <Ionicons name="checkmark" size={13} color={semantic.primaryForeground} />
                    : <Text style={[s.stepNum, i === step && s.stepNumActive]}>{i + 1}</Text>}
                </View>
                <Text style={[s.stepLabel, i === step && s.stepLabelActive]} numberOfLines={1}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={{ transform: [{ translateX: slide }] }}>

            {/* ÉTAPE 0 — Date & horaires */}
            {step === 0 && (
              <View>
                <Text style={s.stepTitle}>Date & horaires</Text>

                <Text style={s.label}>Date de l'événement *</Text>
                <View style={[s.inputWrap, dateError && s.inputWrapError]}>
                  <Ionicons name="calendar-outline" size={18} color={dateError ? semantic.error : semantic.textMuted} />
                  <TextInput
                    style={s.inputInner}
                    value={dateInput}
                    onChangeText={v => setDateInput(maskDate(v))}
                    placeholder="JJ/MM/AAAA"
                    placeholderTextColor={semantic.textFaint}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                  {dateIso && <Ionicons name="checkmark-circle" size={18} color={semantic.success} />}
                </View>
                {dateError
                  ? <Text style={s.inlineError}>{dateError}</Text>
                  : dateInput.length > 0 && dateInput.length < 10
                    ? <Text style={s.inputHint}>Format : JJ/MM/AAAA</Text>
                    : null}

                <Text style={s.label}>Heure de début *</Text>
                <View style={styles.hourGrid}>
                  {HOURS.map(h => (
                    <TouchableOpacity key={h}
                      style={[s.hourPill, start === h && s.hourPillActive]}
                      onPress={() => { selectHour(setStart, h); if (end && end <= h) setEnd(null); }}>
                      <Text style={[s.hourPillTxt, start === h && s.hourPillTxtActive]}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={s.label}>Heure de fin *</Text>
                {!start && <Text style={s.inputHint}>Choisissez d'abord l'heure de début</Text>}
                <View style={styles.hourGrid}>
                  {endHours.map(h => (
                    <TouchableOpacity key={h}
                      style={[s.hourPill, end === h && s.hourPillActive, !start && { opacity: 0.4 }]}
                      onPress={() => selectHour(setEnd, h)} disabled={!start}>
                      <Text style={[s.hourPillTxt, end === h && s.hourPillTxtActive]}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {start && end && (
                  <View style={s.durationBadge}>
                    <Ionicons name="time-outline" size={16} color={semantic.primary} />
                    <Text style={s.durationTxt}>
                      {start} → {end} · {durationH}h · {subtotal.toLocaleString('fr-FR')} €
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* ÉTAPE 1 — Détails */}
            {step === 1 && (
              <View>
                <Text style={s.stepTitle}>Détails de l'événement</Text>

                <Text style={s.label}>Nombre d'invités * (max {venue.capacity || 500})</Text>
                <View style={[s.inputWrap, guestsTooMany && s.inputWrapError]}>
                  <Ionicons name="people-outline" size={18} color={guestsTooMany ? semantic.error : semantic.textMuted} />
                  <TextInput
                    style={s.inputInner} value={guests}
                    onChangeText={v => setGuests(v.replace(/[^0-9]/g, ''))}
                    placeholder={`1 à ${venue.capacity || 500}`} placeholderTextColor={semantic.textFaint}
                    keyboardType="number-pad"
                  />
                </View>
                {guestsTooMany && (
                  <Text style={s.inlineError}>Capacité maximale : {venue.capacity} personnes</Text>
                )}

                <Text style={s.label}>Type d'événement *</Text>
                <View style={styles.eventGrid}>
                  {EVENTS.map(e => {
                    const active = eventType === e.label;
                    return (
                      <TouchableOpacity key={e.label}
                        style={[s.eventCard, active && s.eventCardActive]}
                        onPress={() => { hapticSelection(); setEventType(e.label); }}>
                        <Ionicons
                          name={active ? e.iconActive : e.icon}
                          size={22}
                          color={active ? semantic.primary : semantic.textMuted}
                        />
                        <Text style={[s.eventCardTxt, active && s.eventCardTxtActive]} numberOfLines={1}>
                          {e.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={s.label}>Message pour l'hôte (optionnel)</Text>
                <TextInput
                  style={[s.textarea]} value={notes} onChangeText={setNotes}
                  placeholder="Informations utiles, demandes spéciales…"
                  placeholderTextColor={semantic.textFaint} multiline numberOfLines={4} textAlignVertical="top"
                />
              </View>
            )}

            {/* ÉTAPE 2 — Récapitulatif */}
            {step === 2 && (
              <View>
                <Text style={s.stepTitle}>Récapitulatif</Text>
                <View style={s.recapCard}>
                  <Text style={s.recapVenueName}>{venue.name}</Text>
                  <View style={styles.recapLocationRow}>
                    <Ionicons name="location-outline" size={13} color={semantic.textMuted} />
                    <Text style={s.recapVenueLocation}>{venue.location || venue.city || ''}</Text>
                  </View>
                  <View style={s.divider} />
                  {[
                    { icon: 'calendar-outline', label: 'Date', value: dateInput },
                    { icon: 'time-outline', label: 'Horaire', value: `${start} → ${end}` },
                    { icon: 'people-outline', label: 'Invités', value: `${guests} personne${guestsNum > 1 ? 's' : ''}` },
                    { icon: 'ribbon-outline', label: 'Type', value: eventType },
                  ].map((row, i) => (
                    <View key={i} style={styles.recapRow}>
                      <View style={s.recapIconWrap}>
                        <Ionicons name={row.icon} size={16} color={semantic.primary} />
                      </View>
                      <Text style={s.recapLabel}>{row.label}</Text>
                      <Text style={s.recapValue}>{row.value}</Text>
                    </View>
                  ))}
                  {notes ? (
                    <View style={s.notesBox}>
                      <Text style={s.notesLabel}>Message :</Text>
                      <Text style={s.notesTxt}>{notes}</Text>
                    </View>
                  ) : null}
                  <View style={s.divider} />

                  {/* Décomposition du prix */}
                  <View style={styles.priceRow}>
                    <Text style={s.priceLabel}>{venue.price} €/h × {durationH}h</Text>
                    <Text style={s.priceValue}>{subtotal.toLocaleString('fr-FR')} €</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={s.priceLabel}>
                      Commission plateforme ({Math.round(COMMISSION_RATE * 100)}%) — incluse
                    </Text>
                    <Text style={s.priceValue}>{commission.toLocaleString('fr-FR')} €</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={s.priceLabel}>Net annonceur</Text>
                    <Text style={s.priceValue}>{netOwner.toLocaleString('fr-FR')} €</Text>
                  </View>
                  <View style={[styles.priceRow, { marginTop: spacing.sm }]}>
                    <Text style={s.totalLabel}>Total à payer</Text>
                    <Text style={s.totalValue}>{totalClient.toLocaleString('fr-FR')} €</Text>
                  </View>
                </View>

                <View style={s.infoBox}>
                  <Ionicons name="card-outline" size={18} color={semantic.secondary} />
                  <Text style={s.infoTxt}>L'étape suivante vous permettra de payer en toute sécurité via Stripe.</Text>
                </View>

                {!!submitError && (
                  <View style={s.errorBanner}>
                    <Ionicons name="alert-circle" size={17} color={semantic.error} />
                    <Text style={s.errorBannerTxt}>{submitError}</Text>
                  </View>
                )}
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Footer */}
        <View style={[s.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
          {!!stepError && (
            <View style={s.errorBannerCompact}>
              <Ionicons name="alert-circle" size={15} color={semantic.error} />
              <Text style={s.errorBannerTxt}>{stepError}</Text>
            </View>
          )}
          {step < 2 ? (
            <TouchableOpacity
              style={[s.btnPrimary, ((!isStep0Valid && step === 0) || (!isStep1Valid && step === 1)) && { opacity: 0.5 }]}
              onPress={goNext}
              activeOpacity={0.85}
            >
              <Text style={s.btnPrimaryTxt}>Continuer</Text>
              <Ionicons name="arrow-forward" size={18} color={semantic.primaryForeground} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.btnPrimary, loading && { opacity: 0.7 }]}
              onPress={book} disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={semantic.primaryForeground} />
                : <>
                    <Ionicons name="card-outline" size={20} color={semantic.primaryForeground} />
                    <Text style={s.btnPrimaryTxt}>Continuer vers le paiement</Text>
                  </>}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  stepLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  stepItem: { alignItems: 'center', flex: 1, gap: 4 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  hourGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: spacing.xs },
  eventGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: spacing.xs },
  recapLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  recapRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 3 },
});

function themedStyles(c, isDark) {
  const hairline = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(27,23,19,0.10)';
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    errorTxt: { fontSize: 16, color: c.text, marginBottom: spacing.md },
    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    },
    headerTitle: { fontSize: 16, fontWeight: '700', color: c.text },
    headerSub: { fontSize: 12, color: c.textMuted, marginTop: 1 },
    stepper: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    progressTrack: {
      height: 3, borderRadius: 2, backgroundColor: c.borderSubtle, overflow: 'hidden',
    },
    progressFill: { height: 3, borderRadius: 2, backgroundColor: c.primary },
    stepCircle: {
      width: 26, height: 26, borderRadius: 13,
      backgroundColor: c.borderSubtle,
      alignItems: 'center', justifyContent: 'center',
    },
    stepCircleActive: { backgroundColor: c.primary },
    stepCircleDone: { backgroundColor: c.success },
    stepNum: { fontSize: 12, fontWeight: '700', color: c.textMuted },
    stepNumActive: { color: c.primaryForeground },
    stepLabel: { fontSize: 12, color: c.textFaint, textAlign: 'center' },
    stepLabelActive: { color: c.primary, fontWeight: '600' },
    stepTitle: {
      fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
      fontSize: 22, color: c.text, marginBottom: spacing.md, letterSpacing: -0.2,
    },
    label: { fontSize: 13, fontWeight: '600', color: c.text, marginBottom: spacing.xs, marginTop: spacing.md },
    inputWrap: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
      borderRadius: radius.sm, paddingHorizontal: spacing.md, height: 50,
      backgroundColor: c.surface,
      ...shadow.xs,
    },
    inputWrapError: { borderWidth: 1, borderColor: c.error },
    inputInner: { flex: 1, fontSize: 16, color: c.text },
    textarea: {
      borderRadius: radius.sm, padding: spacing.md,
      fontSize: 15, color: c.text, backgroundColor: c.surface,
      height: 100,
      ...shadow.xs,
    },
    inputHint: { fontSize: 12, color: c.textMuted, marginTop: 6 },
    inlineError: { fontSize: 12, color: c.error, marginTop: 6, fontWeight: '500' },
    hourPill: {
      minWidth: 70, height: 40, borderRadius: radius.full,
      borderWidth: 1, borderColor: c.border, backgroundColor: 'transparent',
      alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12,
    },
    hourPillActive: { backgroundColor: c.primary, borderColor: c.primary },
    hourPillTxt: { fontSize: 13, fontWeight: '600', color: c.text },
    hourPillTxtActive: { color: c.primaryForeground },
    durationBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: c.primarySoft,
      borderRadius: radius.sm, padding: spacing.md, marginTop: spacing.md,
    },
    durationTxt: { fontSize: 13, fontWeight: '600', color: c.primary },
    eventCard: {
      width: '23%', flexGrow: 1, aspectRatio: 1.05, maxWidth: '24%',
      borderRadius: radius.sm, borderWidth: 1, borderColor: c.border,
      backgroundColor: 'transparent',
      alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 4,
    },
    eventCardActive: { backgroundColor: c.primarySoft, borderColor: c.primary },
    eventCardTxt: { fontSize: 12, fontWeight: '500', color: c.textMuted },
    eventCardTxtActive: { color: c.primary, fontWeight: '600' },
    recapCard: {
      backgroundColor: c.surfaceElevated, borderRadius: radius.lg,
      padding: spacing.lg, marginBottom: spacing.md,
      ...shadow.md,
    },
    recapVenueName: {
      fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
      fontSize: 19, color: c.text,
    },
    recapVenueLocation: { fontSize: 13, color: c.textMuted },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: hairline, marginVertical: spacing.md },
    recapIconWrap: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: c.primarySoft,
      alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm,
    },
    recapLabel: { fontSize: 13, color: c.textMuted, flex: 1 },
    recapValue: { fontSize: 13, fontWeight: '600', color: c.text },
    notesBox: { backgroundColor: c.bg, borderRadius: radius.xs, padding: spacing.sm, marginTop: spacing.xs },
    notesLabel: { fontSize: 12, fontWeight: '600', color: c.textMuted, marginBottom: 2 },
    notesTxt: { fontSize: 13, color: c.text, fontStyle: 'italic' },
    priceLabel: { fontSize: 13, color: c.textMuted },
    priceValue: { fontSize: 13, fontWeight: '600', color: c.text },
    totalLabel: { fontSize: 16, fontWeight: '700', color: c.text },
    totalValue: { fontSize: 22, fontWeight: '800', color: c.primary, letterSpacing: -0.3 },
    infoBox: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 8,
      backgroundColor: c.surface, borderRadius: radius.sm,
      padding: spacing.md, marginTop: spacing.xs,
      ...shadow.xs,
    },
    infoTxt: { flex: 1, fontSize: 13, color: c.textMuted, lineHeight: 18 },
    errorBanner: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 8,
      backgroundColor: isDark ? 'rgba(224,123,106,0.12)' : '#FBEAE6',
      borderRadius: radius.sm, padding: spacing.md, marginTop: spacing.md,
    },
    errorBannerCompact: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      marginBottom: spacing.sm, paddingHorizontal: 2,
    },
    errorBannerTxt: { flex: 1, fontSize: 13, color: c.error, fontWeight: '500', lineHeight: 18 },
    footer: {
      backgroundColor: c.surface,
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: hairline,
      padding: spacing.md,
    },
    btnPrimary: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: c.primary, borderRadius: 14, height: 56,
    },
    btnPrimaryTxt: { fontSize: 16, fontWeight: '700', color: c.primaryForeground },
  });
}
