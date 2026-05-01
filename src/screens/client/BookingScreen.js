import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../theme/colors';

const EVENT_TYPES = ['Anniversaire', 'Mariage', 'Soirée privée', 'Séminaire', 'Conférence', 'Shooting photo', 'Autre'];

export default function BookingScreen({ route, navigation }) {
  const { venue } = route.params;
  const { addReservation, user } = useApp();
  const [date, setDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [guests, setGuests] = useState('');
  const [eventType, setEventType] = useState('');
  const [notes, setNotes] = useState('');

  const commission = Math.round(venue.price * 0.12);
  const total = venue.price + commission;

  const handleBook = () => {
    if (!date || !timeStart || !timeEnd || !guests || !eventType) { Alert.alert('Champs manquants', 'Remplissez tous les champs obligatoires'); return; }
    const reservation = { venueId: venue.id, venueName: venue.name, venueLocation: venue.location, userId: user.id, userName: user.name, date, timeStart, timeEnd, guests: parseInt(guests), eventType, notes, price: venue.price, commission, total };
    addReservation(reservation);
    Alert.alert('🎉 Réservation envoyée !', `Votre demande pour ${venue.name} a été envoyée. L'annonceur vous répondra bientôt.`, [{ text: 'OK', onPress: () => navigation.navigate('HomeMain') }]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Réserver</Text>
        <View style={{ width: 42 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.venueCard}>
          <Text style={styles.venueName}>{venue.name}</Text>
          <Text style={styles.venueLocation}><Ionicons name="location" size={13} color={COLORS.primary} /> {venue.location}</Text>
        </View>
        <Text style={styles.sectionTitle}>📅 Date</Text>
        <TextInput style={styles.input} placeholder="JJ/MM/AAAA" value={date} onChangeText={setDate} placeholderTextColor={COLORS.textLight} />
        <Text style={styles.sectionTitle}>⏰ Horaires</Text>
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Début (ex: 18h00)" value={timeStart} onChangeText={setTimeStart} placeholderTextColor={COLORS.textLight} />
          <Text style={styles.rowSep}>→</Text>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Fin (ex: 23h00)" value={timeEnd} onChangeText={setTimeEnd} placeholderTextColor={COLORS.textLight} />
        </View>
        <Text style={styles.sectionTitle}>👥 Nombre d'invités</Text>
        <TextInput style={styles.input} placeholder={`Max ${venue.capacity} personnes`} value={guests} onChangeText={setGuests} keyboardType="number-pad" placeholderTextColor={COLORS.textLight} />
        <Text style={styles.sectionTitle}>🎉 Type d'événement</Text>
        <View style={styles.eventGrid}>
          {EVENT_TYPES.map(et => (
            <TouchableOpacity key={et} style={[styles.eventBtn, eventType === et && styles.eventBtnActive]} onPress={() => setEventType(et)}>
              <Text style={[styles.eventText, eventType === et && styles.eventTextActive]}>{et}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.sectionTitle}>📝 Notes (optionnel)</Text>
        <TextInput style={[styles.input, styles.textarea]} placeholder="Précisions sur votre événement..." value={notes} onChangeText={setNotes} multiline numberOfLines={4} placeholderTextColor={COLORS.textLight} />
        <View style={styles.priceCard}>
          <Text style={styles.priceTitle}>Récapitulatif</Text>
          <View style={styles.priceRow}><Text style={styles.priceLabel}>Location</Text><Text style={styles.priceValue}>{venue.price}€</Text></View>
          <View style={styles.priceRow}><Text style={styles.priceLabel}>Frais de service (12%)</Text><Text style={styles.priceValue}>{commission}€</Text></View>
          <View style={[styles.priceRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{total}€</Text></View>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
          <Text style={styles.bookBtnText}>Confirmer la réservation</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  scroll: { padding: 20, gap: 12, paddingBottom: 40 },
  venueCard: { backgroundColor: COLORS.primaryLight, borderRadius: 14, padding: 16, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  venueName: { fontSize: 16, fontWeight: '700', color: COLORS.primaryDark },
  venueLocation: { fontSize: 13, color: COLORS.primary, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 16, fontSize: 15, color: COLORS.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowSep: { fontSize: 18, color: COLORS.textSecondary },
  textarea: { height: 100, textAlignVertical: 'top' },
  eventGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  eventBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  eventBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  eventText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  eventTextActive: { color: COLORS.white },
  priceCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  priceTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { fontSize: 14, color: COLORS.textSecondary },
  priceValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  totalRow: { paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  bookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  bookBtnText: { fontSize: 17, fontWeight: '700', color: COLORS.white },
});
