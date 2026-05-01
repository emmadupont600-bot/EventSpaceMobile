import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, TextInput, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TYPES = ['Mariage', 'Anniversaire', 'Séminaire', 'Conférence', 'Soirée', 'Autre'];
const HEURES = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '16:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

export default function ReservationScreen({ navigation, route }) {
  const { lieu } = route.params;
  const [date, setDate] = useState('');
  const [heureDebut, setHeureDebut] = useState('');
  const [heureFin, setHeureFin] = useState('');
  const [invites, setInvites] = useState('');
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);

  const commission = Math.round(lieu.prix * 0.12);
  const total = lieu.prix + commission;

  const handleConfirm = () => {
    if (!date || !heureDebut || !heureFin || !invites || !type) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    Alert.alert(
      '✅ Réservation envoyée !',
      `Votre demande pour ${lieu.nom} le ${date} a été envoyée. L\'annonceur vous répondra sous 24h.`,
      [{ text: 'OK', onPress: () => navigation.navigate('HomeMain') }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Réserver</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.steps}>
        {[1, 2, 3].map(s => (
          <View key={s} style={styles.stepRow}>
            <View style={[styles.stepCircle, step >= s && styles.stepCircleActive]}>
              <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>{s}</Text>
            </View>
            {s < 3 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.lieuCard}>
          <Ionicons name="location" size={20} color="#e94560" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.lieuNom}>{lieu.nom}</Text>
            <Text style={styles.lieuVille}>{lieu.ville}</Text>
          </View>
          <Text style={styles.lieuPrix}>{lieu.prix.toLocaleString()}€</Text>
        </View>

        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Date et horaires</Text>
            <Text style={styles.label}>Date de l'événement *</Text>
            <TextInput style={styles.input} placeholder="JJ/MM/AAAA" placeholderTextColor="#666" value={date} onChangeText={setDate} />
            <Text style={styles.label}>Heure de début *</Text>
            <View style={styles.heureGrid}>
              {HEURES.slice(0, 6).map(h => (
                <TouchableOpacity key={h} style={[styles.heureBtn, heureDebut === h && styles.heureBtnActive]} onPress={() => setHeureDebut(h)}>
                  <Text style={[styles.heureTxt, heureDebut === h && styles.heureTxtActive]}>{h}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Heure de fin *</Text>
            <View style={styles.heureGrid}>
              {HEURES.slice(6).map(h => (
                <TouchableOpacity key={h} style={[styles.heureBtn, heureFin === h && styles.heureBtnActive]} onPress={() => setHeureFin(h)}>
                  <Text style={[styles.heureTxt, heureFin === h && styles.heureTxtActive]}>{h}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Détails de l'événement</Text>
            <Text style={styles.label}>Type d'événement *</Text>
            <View style={styles.typeGrid}>
              {TYPES.map(t => (
                <TouchableOpacity key={t} style={[styles.typeBtn, type === t && styles.typeBtnActive]} onPress={() => setType(t)}>
                  <Text style={[styles.typeTxt, type === t && styles.typeTxtActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Nombre d'invités *</Text>
            <TextInput style={styles.input} placeholder="Ex: 50" placeholderTextColor="#666" value={invites} onChangeText={setInvites} keyboardType="number-pad" />
            <Text style={styles.label}>Message à l'annonceur (optionnel)</Text>
            <TextInput style={[styles.input, styles.textarea]} placeholder="Précisez vos besoins..." placeholderTextColor="#666" value={message} onChangeText={setMessage} multiline numberOfLines={4} />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>Récapitulatif</Text>
            {[
              { label: 'Lieu', value: lieu.nom },
              { label: 'Date', value: date },
              { label: 'Horaires', value: `${heureDebut} - ${heureFin}` },
              { label: 'Type', value: type },
              { label: 'Invités', value: `${invites} personnes` },
            ].map((r, i) => (
              <View key={i} style={styles.recapRow}>
                <Text style={styles.recapLabel}>{r.label}</Text>
                <Text style={styles.recapValue}>{r.value}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Location</Text>
              <Text style={styles.recapValue}>{lieu.prix.toLocaleString()}€</Text>
            </View>
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Commission (12%)</Text>
              <Text style={styles.recapValue}>{commission.toLocaleString()}€</Text>
            </View>
            <View style={[styles.recapRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{total.toLocaleString()}€</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity style={styles.prevBtn} onPress={() => setStep(step - 1)}>
            <Ionicons name="arrow-back" size={20} color="#e94560" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, step === 1 && { flex: 1 }]}
          onPress={() => step < 3 ? setStep(step + 1) : handleConfirm()}
        >
          <Text style={styles.nextTxt}>{step === 3 ? 'Confirmer la réservation' : 'Suivant'}</Text>
          <Ionicons name={step === 3 ? 'checkmark' : 'arrow-forward'} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f0c29' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  steps: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  stepCircleActive: { backgroundColor: '#e94560', borderColor: '#e94560' },
  stepNum: { color: '#666', fontWeight: '700' },
  stepNumActive: { color: '#fff' },
  stepLine: { width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#e94560' },
  scroll: { padding: 20, paddingBottom: 100 },
  lieuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(233,69,96,0.1)', borderRadius: 14, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(233,69,96,0.3)' },
  lieuNom: { color: '#fff', fontWeight: '700', fontSize: 15 },
  lieuVille: { color: '#aaa', fontSize: 13, marginTop: 2 },
  lieuPrix: { color: '#e94560', fontWeight: '800', fontSize: 18 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  label: { color: '#aaa', fontSize: 13, marginBottom: 8, marginTop: 4 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 12 },
  textarea: { height: 100, textAlignVertical: 'top' },
  heureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  heureBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  heureBtnActive: { backgroundColor: '#e94560', borderColor: '#e94560' },
  heureTxt: { color: '#aaa', fontSize: 13 },
  heureTxtActive: { color: '#fff', fontWeight: '700' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  typeBtnActive: { backgroundColor: '#e94560', borderColor: '#e94560' },
  typeTxt: { color: '#aaa', fontSize: 14 },
  typeTxtActive: { color: '#fff', fontWeight: '600' },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  recapLabel: { color: '#aaa', fontSize: 14 },
  recapValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8 },
  totalRow: { borderBottomWidth: 0, marginTop: 4 },
  totalLabel: { color: '#fff', fontSize: 17, fontWeight: '800' },
  totalValue: { color: '#e94560', fontSize: 20, fontWeight: '800' },
  footer: { flexDirection: 'row', gap: 12, padding: 20, backgroundColor: '#1a1a2e', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  prevBtn: { width: 52, height: 52, borderRadius: 14, borderWidth: 2, borderColor: '#e94560', justifyContent: 'center', alignItems: 'center' },
  nextBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: '#e94560', borderRadius: 14, paddingVertical: 15, shadowColor: '#e94560', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  nextTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
