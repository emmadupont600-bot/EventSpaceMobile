import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Store } from '../../utils/store';
import StatusBadge from '../../components/StatusBadge';
import Header from '../../components/Header';
import { colors, spacing, typography, radius, shadow } from '../../theme/colors';

export default function ReservationsScreen({ navigation }) {
  const [reservations, setReservations] = useState([]);
  const [user, setUser] = useState(null);

  useFocusEffect(useCallback(() => {
    (async () => {
      const u = await Store.getCurrentUser();
      setUser(u);
      if (!u) return;
      const all = await Store.getReservations();
      const mine = u.role === 'annonceur'
        ? all.filter(r => r.ownerId === u.id)
        : all.filter(r => r.userId === u.id);
      setReservations(mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    })();
  }, []));

  const updateStatus = (id, status) => {
    Alert.alert(
      status === 'confirmed' ? 'Confirmer ?' : 'Annuler ?',
      status === 'confirmed' ? 'Confirmer cette réservation ?' : 'Annuler cette réservation ?',
      [
        { text: 'Non', style: 'cancel' },
        { text: 'Oui', onPress: async () => {
          await Store.updateReservation(id, { status });
          setReservations(r => r.map(x => x.id === id ? { ...x, status } : x));
        }}
      ]
    );
  };

  if (!user) return (
    <View style={styles.container}>
      <Header title="Réservations" />
      <View style={styles.empty}>
        <Ionicons name="calendar-outline" size={48} color={colors.light} />
        <Text style={styles.emptyTxt}>Connectez-vous</Text>
        <Text style={styles.emptySub}>pour voir vos réservations</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title={user.role === 'annonceur' ? 'Demandes reçues' : 'Mes réservations'} />
      <FlatList
        data={reservations}
        keyExtractor={r => String(r.id)}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        renderItem={({ item: r }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.venueName}>{r.venueName}</Text>
                <Text style={styles.meta}><Ionicons name="calendar-outline" size={12} color={colors.mid} /> {r.date} de {r.start} à {r.end}</Text>
                <Text style={styles.meta}><Ionicons name="people-outline" size={12} color={colors.mid} /> {r.guests} personnes • {r.eventType}</Text>
              </View>
              <StatusBadge status={r.status} />
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.total}>{r.total} €</Text>
              {user.role === 'annonceur' && r.status === 'pending' && (
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => updateStatus(r.id, 'confirmed')}>
                    <Text style={styles.acceptTxt}>✔ Accepter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.refuseBtn} onPress={() => updateStatus(r.id, 'cancelled')}>
                    <Text style={styles.refuseTxt}>✖ Refuser</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={colors.light} />
            <Text style={styles.emptyTxt}>Aucune réservation</Text>
            <Text style={styles.emptySub}>Vos réservations apparaîtront ici</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, ...shadow.sm },
  cardTop: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  venueName: { fontSize: typography.h3, fontWeight: '700', color: colors.dark, marginBottom: 4 },
  meta: { fontSize: typography.small, color: colors.mid, marginBottom: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  total: { fontSize: typography.h3, fontWeight: '800', color: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.sm },
  acceptBtn: { backgroundColor: '#d1fae5', borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6 },
  acceptTxt: { color: '#065f46', fontWeight: '700', fontSize: typography.small },
  refuseBtn: { backgroundColor: '#fee2e2', borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6 },
  refuseTxt: { color: '#991b1b', fontWeight: '700', fontSize: typography.small },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyTxt: { fontSize: typography.h3, fontWeight: '700', color: colors.mid },
  emptySub: { fontSize: typography.small, color: colors.light },
});
