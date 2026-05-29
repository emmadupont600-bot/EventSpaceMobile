/**
 * VenueAvailabilityScreen — calendrier de dates bloquées pour un lieu
 */
import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Store } from '../../utils/store';
import { useTheme } from '../../context/ThemeContext';

export default function VenueAvailabilityScreen({ route, navigation }) {
  const { venue } = route.params;
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [blocked, setBlocked] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const dates = await Store.getBlockedDates(venue.id);
      setBlocked(dates);
    } finally {
      setLoading(false);
    }
  }, [venue.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const addDate = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      Alert.alert('Format invalide', 'Utilisez le format AAAA-MM-JJ (ex: 2026-06-15)');
      return;
    }
    try {
      await Store.addBlockedDate(venue.id, newDate, reason.trim());
      setNewDate('');
      setReason('');
      load();
    } catch (e) {
      Alert.alert('Erreur', e.message);
    }
  };

  const removeDate = (item) => {
    Alert.alert('Débloquer cette date ?', item.date, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Débloquer',
        onPress: async () => {
          await Store.removeBlockedDate(item.id);
          load();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.dark} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.dark }]}>Disponibilités</Text>
        <View style={{ width: 22 }} />
      </View>

      <Text style={[styles.venueName, { color: colors.mid }]}>{venue.name}</Text>

      <View style={[styles.form, { backgroundColor: colors.white, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.mid }]}>Bloquer une date (AAAA-MM-JJ)</Text>
        <TextInput
          style={[styles.input, { color: colors.dark, borderColor: colors.border }]}
          placeholder="2026-06-15"
          placeholderTextColor={colors.light}
          value={newDate}
          onChangeText={setNewDate}
        />
        <TextInput
          style={[styles.input, { color: colors.dark, borderColor: colors.border }]}
          placeholder="Raison (optionnel)"
          placeholderTextColor={colors.light}
          value={reason}
          onChangeText={setReason}
        />
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={addDate}>
          <Text style={styles.addBtnText}>+ Bloquer cette date</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={blocked}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: spacing.lg, gap: 8 }}
          ListEmptyComponent={
            <Text style={{ color: colors.mid, textAlign: 'center', marginTop: 24 }}>
              Aucune date bloquée — le lieu est disponible tous les jours
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { backgroundColor: colors.white, borderColor: colors.border }]}
              onPress={() => removeDate(item)}
            >
              <View>
                <Text style={{ color: colors.dark, fontWeight: '700' }}>{item.date}</Text>
                {item.reason ? <Text style={{ color: colors.mid, fontSize: 12 }}>{item.reason}</Text> : null}
              </View>
              <Ionicons name="close-circle" size={22} color={colors.error} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  title: { fontSize: 17, fontWeight: '700' },
  venueName: { textAlign: 'center', paddingVertical: 8, fontSize: 13 },
  form: { margin: 16, padding: 16, borderRadius: 14, borderWidth: 1, gap: 8 },
  label: { fontSize: 12, fontWeight: '700' },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  addBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
});
