import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Alert, StatusBar,
} from 'react-native';
import { COLORS } from '../../theme/colors';

const STEPS = ['Détails', 'Options', 'Récap'];

export default function BookingScreen({ route, navigation }) {
  const { venue } = route.params || {};
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    date: '', guests: '', occasion: '', message: '',
    catering: false, sound: false, decoration: false,
  });

  const canNext = () => {
    if (step === 0) return form.date.length >= 8 && form.guests.length > 0;
    return true;
  };

  const optionsList = [
    { key: 'catering', price: 150 },
    { key: 'sound', price: 80 },
    { key: 'decoration', price: 60 },
  ];
  const totalOptions = optionsList
    .filter(o => form[o.key])
    .reduce((sum, o) => sum + o.price, 0);
  const totalPrice = (venue?.price || 0) + totalOptions;

  const handleConfirm = () => {
    Alert.alert(
      '✅ Réservation confirmée !',
      `Votre réservation au ${venue?.name} pour le ${form.date} est bien enregistrée. Vous recevrez une confirmation par email.`,
      [{ text: 'Super !', onPress: () => navigation.navigate('Reservations') }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Réservation</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stepper */}
      <View style={styles.stepper}>
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <View style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                i < step && styles.stepCircleDone,
                i === step && styles.stepCircleActive,
              ]}>
                {i < step
                  ? <Text style={styles.stepCheck}>✓</Text>
                  : <Text style={[styles.stepNum, i === step && styles.stepNumActive]}>{i + 1}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, i < step && styles.stepLineDone]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Venue mini-card */}
        <View style={styles.venueCard}>
          <Text style={styles.venueName}>{venue?.name || 'Lieu sélectionné'}</Text>
          <Text style={styles.venueLocation}>📍 {venue?.location || ''}</Text>
        </View>

        {/* STEP 0 — Détails */}
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Informations de l\'événement</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Date de l\'événement *</Text>
              <TextInput
                style={styles.input}
                placeholder="JJ/MM/AAAA"
                value={form.date}
                onChangeText={v => setForm({ ...form, date: v })}
                placeholderTextColor="#CBD5E1"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nombre d\'invités *</Text>
              <TextInput
                style={styles.input}
                placeholder={`1 à ${venue?.capacity || 100} personnes`}
                value={form.guests}
                onChangeText={v => setForm({ ...form, guests: v })}
                keyboardType="numeric"
                placeholderTextColor="#CBD5E1"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Type d\'événement</Text>
              <View style={styles.occasionRow}>
                {['Anniversaire', 'Mariage', 'Pro', 'Autre'].map(o => (
                  <TouchableOpacity
                    key={o}
                    style={[styles.occasionChip, form.occasion === o && styles.occasionChipActive]}
                    onPress={() => setForm({ ...form, occasion: o })}
                  >
                    <Text style={[styles.occasionText, form.occasion === o && styles.occasionTextActive]}>{o}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Message à l\'annonceur</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Précisez vos besoins, vos questions..."
                value={form.message}
                onChangeText={v => setForm({ ...form, message: v })}
                multiline
                numberOfLines={4}
                placeholderTextColor="#CBD5E1"
              />
            </View>
          </View>
        )}

        {/* STEP 1 — Options */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Services optionnels</Text>
            <Text style={styles.stepSubtitle}>Ajoutez des services pour compléter votre événement</Text>

            {[
              { key: 'catering', label: 'Traiteur', desc: 'Service traiteur 3 plats inclus', price: 150, emoji: '🍽️' },
              { key: 'sound', label: 'Sono & DJ', desc: 'Équipement audio professionnel', price: 80, emoji: '🎵' },
              { key: 'decoration', label: 'Décoration', desc: 'Ballons, fleurs, nappage de table', price: 60, emoji: '🌸' },
            ].map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.optionCard, form[opt.key] && styles.optionCardActive]}
                onPress={() => setForm({ ...form, [opt.key]: !form[opt.key] })}
                activeOpacity={0.8}
              >
                <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Text style={styles.optionPrice}>+{opt.price}€</Text>
                  <View style={[styles.checkbox, form[opt.key] && styles.checkboxActive]}>
                    {form[opt.key] && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STEP 2 — Récap */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Récapitulatif</Text>
            <View style={styles.recapCard}>
              <Text style={styles.recapVenue}>{venue?.name}</Text>
              <Text style={styles.recapLocation}>📍 {venue?.location}</Text>
              <View style={styles.divider} />
              <RecapRow label="Date" value={form.date || '—'} />
              <RecapRow label="Invités" value={`${form.guests || 0} personnes`} />
              <RecapRow label="Occasion" value={form.occasion || '—'} />
              <View style={styles.divider} />
              <RecapRow label="Location" value={`${venue?.price || 0}€`} />
              {form.catering && <RecapRow label="+ Traiteur" value="+150€" accent />}
              {form.sound && <RecapRow label="+ Sono & DJ" value="+80€" accent />}
              {form.decoration && <RecapRow label="+ Décoration" value="+60€" accent />}
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total estimé</Text>
                <Text style={styles.totalPrice}>{totalPrice}€</Text>
              </View>
              <Text style={styles.recapNote}>Le paiement s\'effectue directement auprès de l\'annonceur.</Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.bottomBar}>
        {step > 0 && (
          <TouchableOpacity style={styles.prevBtn} onPress={() => setStep(s => s - 1)}>
            <Text style={styles.prevBtnText}>← Retour</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.nextBtn,
            !canNext() && styles.nextBtnDisabled,
            step === 0 && { flex: 1 },
          ]}
          onPress={() => step < 2 ? setStep(s => s + 1) : handleConfirm()}
          disabled={!canNext()}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {step === 2 ? '✅ Confirmer la réservation' : 'Continuer →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function RecapRow({ label, value, accent }) {
  const P = COLORS.primary || '#4F46E5';
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
      <Text style={{ fontSize: 14, color: '#64748B' }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: accent ? P : '#0F172A' }}>{value}</Text>
    </View>
  );
}

const P = COLORS.primary || '#4F46E5';
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 20, color: '#0F172A' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  stepper: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: P },
  stepCircleDone: { backgroundColor: '#22C55E' },
  stepNum: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
  stepNumActive: { color: '#fff' },
  stepCheck: { color: '#fff', fontWeight: '700', fontSize: 14 },
  stepLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  stepLabelActive: { color: P, fontWeight: '700' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginBottom: 14 },
  stepLineDone: { backgroundColor: '#22C55E' },
  body: { flex: 1 },
  venueCard: {
    margin: 20, backgroundColor: '#EEF2FF',
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  venueName: { fontSize: 16, fontWeight: '700', color: '#1E1B4B' },
  venueLocation: { fontSize: 13, color: '#6366F1', marginTop: 4 },
  stepContent: { paddingHorizontal: 20, paddingBottom: 8 },
  stepTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  stepSubtitle: { fontSize: 14, color: '#94A3B8', marginBottom: 20 },
  field: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 13, fontWeight: '600', color: '#475569',
    marginBottom: 8, letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#fff', borderWidth: 1.5,
    borderColor: '#E2E8F0', borderRadius: 12,
    padding: 14, fontSize: 15, color: '#0F172A',
  },
  textarea: { minHeight: 96, textAlignVertical: 'top' },
  occasionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  occasionChip: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 20, backgroundColor: '#F1F5F9',
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  occasionChipActive: { backgroundColor: '#EEF2FF', borderColor: P },
  occasionText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  occasionTextActive: { color: P, fontWeight: '700' },
  optionCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    marginBottom: 12, flexDirection: 'row', alignItems: 'center',
    gap: 12, borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  optionCardActive: { borderColor: P, backgroundColor: '#EEF2FF' },
  optionEmoji: { fontSize: 28 },
  optionLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  optionDesc: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  optionPrice: { fontSize: 15, fontWeight: '700', color: P },
  checkbox: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: '#CBD5E1',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: P, borderColor: P },
  checkmark: { color: '#fff', fontWeight: '800', fontSize: 13 },
  recapCard: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: '#E2E8F0',
  },
  recapVenue: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  recapLocation: { fontSize: 14, color: '#64748B', marginTop: 4, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 4,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  totalPrice: { fontSize: 26, fontWeight: '800', color: P },
  recapNote: {
    fontSize: 11, color: '#CBD5E1',
    marginTop: 12, textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row', gap: 12,
    padding: 20, paddingBottom: 34,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  prevBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20, paddingVertical: 16, borderRadius: 14,
  },
  prevBtnText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  nextBtn: {
    flex: 2, backgroundColor: P,
    paddingVertical: 16, borderRadius: 14, alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#CBD5E1' },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
