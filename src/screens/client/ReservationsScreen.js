import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { COLORS } from '../../theme/colors';

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: '#F59E0B', bg: '#FEF3C7', icon: 'time-outline' },
  confirmed: { label: 'Confirmée', color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle-outline' },
  rejected: { label: 'Refusée', color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle-outline' },
};

export default function ReservationsScreen() {
  const { reservations } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Réservations</Text>
        <Text style={styles.count}>{reservations.length} réservation{reservations.length > 1 ? 's' : ''}</Text>
      </View>
      {reservations.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Aucune réservation</Text>
          <Text style={styles.emptyText}>Vos réservations apparaîtront ici</Text>
        </View>
      ) : (
        <FlatList
          data={reservations.slice().reverse()}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          renderItem={({ item }) => {
            const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.venueName}>{item.venueName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Ionicons name={s.icon} size={13} color={s.color} />
                    <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                  </View>
                </View>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}><Ionicons name="location-outline" size={13} color={COLORS.primary} /><Text style={styles.infoText}>{item.venueLocation}</Text></View>
                  <View style={styles.infoItem}><Ionicons name="calendar-outline" size={13} color={COLORS.primary} /><Text style={styles.infoText}>{item.date}</Text></View>
                  <View style={styles.infoItem}><Ionicons name="time-outline" size={13} color={COLORS.primary} /><Text style={styles.infoText}>{item.timeStart} → {item.timeEnd}</Text></View>
                  <View style={styles.infoItem}><Ionicons name="people-outline" size={13} color={COLORS.primary} /><Text style={styles.infoText}>{item.guests} invités</Text></View>
                  <View style={styles.infoItem}><Ionicons name="pricetag-outline" size={13} color={COLORS.primary} /><Text style={styles.infoText}>{item.eventType}</Text></View>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.total}>Total : {item.total}€</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  count: { fontSize: 14, fontWeight: '600', color: COLORS.primary, backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  venueName: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '700' },
  infoGrid: { gap: 6 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 13, color: COLORS.textSecondary },
  cardFooter: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  total: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
});
