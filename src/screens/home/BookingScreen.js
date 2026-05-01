import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Store } from '../../utils/store';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
const EVENTS = ['🎂 Anniversaire','💍 Mariage','💼 Séminaire','🎉 Soirée privée','🎭 Conférence','📸 Shooting','Autre'];

export default function BookingScreen({ route, navigation }) {
  const { venue, user } = route.params;
  const [date, setDate] = useState('');
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [guests, setGuests] = useState('');
  const [eventType, setEventType] = useState(null);
  const [loading, setLoading] = useState(false);

  const hours = start ? HOURS.filter(h => h > start) : HOURS;

  const calcTotal = () => {
    if (!start || !end) return 0;
    const [h1] = start.split(':').map(Number);
    const [h2] = end.split(':').map(Number);
    return (h2 - h1) * venue.price;
  };

  const book = async () => {
    if (!date || !start || !end || !guests || !eventType) {
      return Alert.alert('Champs manquants', 'Veuillez remplir tous les champs.');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Alert.alert('Format de date', 'Utilisez le format AAAA-MM-JJ (ex: 2026-06-15)');
    }
    const total = calcTotal();
    Alert.alert(
      'Confirmer la réservation',
      `${venue.name}\n${date} de ${start} à ${end}\n${guests} personnes\nTotal : ${total} €`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer', onPress: async () => {
            setLoading(true);
            const reservation = await Store.addReservation({
              venueId: venue.id, venueName: venue.name, userId: user.id,
              ownerId: venue.ownerId, date, start, end,
              guests: Number(guests), eventType, status: 'pending', total
            });
            setLoading(false);
            // Redirige vers la page de confirmation
            navigation.replace('BookingConfirmation', { reservation, venue });
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Réserver" subtitle={venue.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.label}>Date de l'événement</Text>
        <Input value={date} onChangeText={setDate} placeholder="2026-06-15" icon="calendar-outline" />

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

        <Input label="Nombre d'invités" value={guests} onChangeText={setGuests} placeholder={`Max. ${venue.capacity}`} keyboardType="number-pad" icon="people-outline" />

        <Text style={styles.label}>Type d'événement</Text>
        <View style={styles.eventGrid}>
          {EVENTS.map(e => (
            <TouchableOpacity key={e} style={[styles.eventChip, eventType === e && styles.chipActive]} onPress={() => setEventType(e)}>
              <Text style={[styles.chipTxt, eventType === e && styles.chipTxtActive]}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {start && end && (
          <View style={styles.summary}>
            <Ionicons name="receipt-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.summaryLine}>{start} → {end}</Text>
              <Text style={styles.summaryPrice}>Total estimé : <Text style={{ color: colors.primary, fontWeight: '800' }}>{calcTotal()} €</Text></Text>
            </View>
          </View>
        )}

        <Button title="Envoyer la demande de réservation" onPress={book} loading={loading} style={{ marginTop: spacing.md }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  label: { fontSize: typography.small, fontWeight: '700', color: colors.mid, marginBottom: 8 },
  chip: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7, marginRight: spacing.sm },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipTxt: { fontSize: typography.small, fontWeight: '600', color: colors.mid },
  chipTxtActive: { color: colors.primary },
  eventGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  eventChip: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8 },
  summary: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  summaryLine: { fontSize: typography.small, fontWeight: '600', color: colors.dark },
  summaryPrice: { fontSize: typography.body, color: colors.mid, marginTop: 3 },
});
